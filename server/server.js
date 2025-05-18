// server/server.js
require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for both development and production
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4243',
        'https://ezapp-91d8e.web.app',
        'https://ezapp-91d8e.firebaseapp.com',
        'https://getezapply.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));


// Serve static files from the root public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use JSON parsing for all routes
app.use(express.json());


// In your server.js file
const port = process.env.PORT || 8080;
let server;

try {
  server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
} catch (err) {
  console.error('Failed to start server:', err);
  // Try a different port if 8080 is in use
  const altPort = 8081;
  server = app.listen(altPort, '0.0.0.0', () => {
    console.log(`Server listening on alternate port ${altPort}`);
  });
}

// Add graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});


// Webhook endpoint must use raw body
app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        console.log('✅ Webhook verified:', event.type);

        // Helper function to get userId from event
        const getUserIdFromEvent = async (eventData) => {
            console.log('Event data for userId extraction:', {
                client_reference_id: eventData.client_reference_id,
                metadata: eventData.metadata,
                customer: eventData.customer ? eventData.customer : 'No customer ID'
            });
        
            // Try client_reference_id first
            if (eventData.client_reference_id) {
                console.log('Found userId in client_reference_id:', eventData.client_reference_id);
                return eventData.client_reference_id;
            }
            
            // Try metadata as backup
            if (eventData.metadata && eventData.metadata.userId) {
                console.log('Found userId in metadata:', eventData.metadata.userId);
                return eventData.metadata.userId;
            }
        
            // If we have a customer, try to get the metadata from the customer
            if (eventData.customer) {
                try {
                    const customer = await stripe.customers.retrieve(eventData.customer);
                    if (customer.metadata && customer.metadata.userId) {
                        console.log('Found userId in customer metadata:', customer.metadata.userId);
                        return customer.metadata.userId;
                    }
                } catch (err) {
                    console.error('Error retrieving customer:', err);
                }
            }
        
            console.log('❌ No userId found in event data');
            return null;
        };

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('Processing checkout.session.completed:', session.id);
                
                const userId = await getUserIdFromEvent(session);
                
                if (!userId) {
                    console.error('❌ No userId found in checkout session:', session.id);
                    throw new Error('No userId found in checkout session');
                }
                
                console.log(`✅ Checkout completed for user ${userId}`);
                await updateUserSubscriptionStatus(userId, 'active', getPlanLevel(session));
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                console.log('Processing invoice.paid event:', invoice.id);
                
                // Get the subscription to ensure we have the full context
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const userId = await getUserIdFromEvent(subscription);
                
                if (!userId) {
                    console.error('❌ No userId found in subscription:', subscription.id);
                    throw new Error('No userId found in subscription');
                }

                // Get the plan level from the invoice
                const planLevel = getPlanLevel(invoice);
                console.log(`✅ Invoice paid for user ${userId} with plan level ${planLevel}`);
                
                await updateUserSubscriptionStatus(userId, 'active', planLevel);
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userId = await getUserIdFromEvent(subscription);
    
                if (!userId) {
                    console.error('❌ No userId found in subscription:', subscription.id);
                    throw new Error('No userId found in subscription');
                }
                
                // Determine subscription status
                let status = 'inactive';
                let planLevel = 'none';
                
                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    status = 'active';
                    planLevel = getPlanLevel(subscription);
                }

                console.log(`✅ Subscription ${event.type} for user ${userId} with plan level ${planLevel}`);
                await updateUserSubscriptionStatus(userId, status, planLevel);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        response.json({ received: true });
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Endpoint to get available plans
app.get('/api/get-plans', async (req, res) => {
    console.log("inside get plans api");
    try {
        // Fetch all prices from Stripe
        const prices = await stripe.prices.list({
            active: true,  // Only get active prices
            limit: 10,     // You can adjust the limit as needed
        });

        // Fetch associated products to get descriptions
        const productPromises = prices.data.map((price) =>
            stripe.products.retrieve(price.product)
        );
        const products = await Promise.all(productPromises);

        // Combine price and product data, sort by price
        const formattedPlans = prices.data
            .map((price, index) => ({
                id: price.id,
                name: products[index]?.name || 'Plan',
                description: products[index]?.description || 'No description available.',
                price: price.unit_amount / 100, // Convert to decimal for sorting
                currency: price.currency.toUpperCase(),
                priceId: price.id,
            }))
            .sort((a, b) => a.price - b.price); // Sort by price (lowest to highest)

        res.json(formattedPlans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).send({ error: 'Failed to fetch plans' });
    }
});

// Checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    console.log("Creating checkout session with request body:", req.body);
    const { priceId, userId, userEmail } = req.body;
    
    try {
        // Validate required fields
        if (!priceId) {
            return res.status(400).json({ error: 'Missing price ID.' });
        }

        // If no userId provided but we have userEmail, try to find the user
        let finalUserId = userId;
        if (!finalUserId && userEmail) {
            try {
                const admin = require('firebase-admin');
                
                // Initialize Firebase Admin if not already initialized
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                }

                const db = admin.firestore();
                const usersRef = db.collection('Users');
                const q = usersRef.where('email', '==', userEmail);
                const querySnapshot = await q.get();

                if (!querySnapshot.empty) {
                    finalUserId = querySnapshot.docs[0].id;
                    console.log("Found user by email:", finalUserId);
                }
            } catch (error) {
                console.error('Error finding user by email:', error);
            }
        }

        console.log("Final userId for checkout:", finalUserId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/subscription-status?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/subscription-status?status=cancelled`,
            client_reference_id: finalUserId, // Make sure this is set
            customer_email: userEmail,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            metadata: {
                userId: finalUserId // Backup in metadata
            }
        });

        console.log("Created checkout session:", session.id);
        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            error: error.message,
            code: error.code // Include Stripe error code if available
        });
    }
});

// Helper function to get plan level from Stripe object
function getPlanLevel(stripeObject) {
    // For invoice events, we need to get the price ID from the line items
    if (stripeObject.object === 'invoice') {
        const lineItem = stripeObject.lines?.data[0];
        if (!lineItem) return 'none';
        
        const priceId = lineItem.price?.id;
        if (!priceId) return 'none';

        if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'basic';
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
        if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
        return 'none';
    }

    // For other objects (subscription, session), get from items
    const priceId = stripeObject.items?.data[0]?.price?.id;
    if (!priceId) return 'none';

    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'basic';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
    return 'none';
}

// Helper function to update user subscription status in Firebase
async function updateUserSubscriptionStatus(userId, status, planLevel) {
    try {
        const admin = require('firebase-admin');
        
        // Initialize Firebase Admin if not already initialized
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }

        const db = admin.firestore();
        
        // Update subscription status
        await db.collection('Users').doc(userId).update({
            subscriptionStatus: status,
            planLevel: planLevel,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Add job automation fields
            jobs_assigned_this_week: 0,
            weekly_job_limit: calculateWeeklyJobs(planLevel),
            last_job_application: null
        });

        // If subscription is active, trigger job automation
        if (status === 'active') {
            try {
                // Get user preferences
                const userDoc = await db.collection('Users').doc(userId).get();
                const userData = userDoc.data();
                
                if (userData) {
                    // Start job scraping process
                    const { spawn } = require('child_process');
                    const pythonProcess = spawn('python3', [
                        'functions/automation/jobscraper.py',
                        '--user_id', userId,
                        '--preferences', JSON.stringify({
                            job_titles: userData.jobSearchPreferences?.jobPreferences?.jobTitle ? [userData.jobSearchPreferences.jobPreferences.jobTitle] : [],
                            locations: userData.jobSearchPreferences?.jobPreferences?.location ? [userData.jobSearchPreferences.jobPreferences.location] : []
                        }),
                        '--limit', calculateWeeklyJobs(planLevel).toString()
                    ]);

                    pythonProcess.stdout.on('data', (data) => {
                        console.log(`Job scraper output: ${data}`);
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        console.error(`Job scraper error: ${data}`);
                    });

                    pythonProcess.on('close', (code) => {
                        console.log(`Job scraper process exited with code ${code}`);
                    });
                }
            } catch (error) {
                console.error('Error starting job automation:', error);
            }
        }

        console.log(`✅ Updated subscription status for user ${userId} to ${status} with plan level ${planLevel}`);
    } catch (error) {
        console.error('Error updating user subscription status:', error);
        throw error;
    }
}

// Helper function to calculate weekly job limit based on plan level
function calculateWeeklyJobs(planLevel) {
    const monthlyLimits = {
        'basic': 100,
        'pro': 250,
        'enterprise': 500
    };
    
    const monthlyLimit = monthlyLimits[planLevel] || 0;
    return Math.floor(monthlyLimit / 4); // Weekly limit is monthly limit divided by 4
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/api/stripe-subscription', async (req, res) => {
    try {
      const customer = await stripe.customers.retrieve('customer-id');
      const subscription = await stripe.subscriptions.list({
        customer: customer.id,
      });
  
      res.json(subscription.data[0]); // Send the first subscription details
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404s
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Export the app instead of starting the server
module.exports = app;
