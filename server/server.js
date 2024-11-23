// server/server.js
require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS specifically for your React app
app.use(cors({
    origin: 'http://localhost:3000'
}));


// Serve static files from the root public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use JSON parsing for all routes
app.use(express.json());

// Webhook endpoint must use raw body
app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        console.log('✅ Webhook verified');

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object;
                const userId = subscription.client_reference_id;
                
                // Determine subscription status
                let status = 'inactive';
                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    status = 'active';
                }

                // Update user's subscription status in Firebase
                await updateUserSubscriptionStatus(userId, status);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        response.json({ received: true });
    } catch (err) {
        console.log(`❌ Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
});

// Checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    console.log("inside api");
    const { priceId, userId, userEmail } = req.body;
    try {
        console.log("inside api");
        
        // Validate required fields
        if (!priceId || !userId || !userEmail) {
            throw new Error('Missing required fields');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/subscription-status?status=success`,
            cancel_url: `${process.env.CLIENT_URL}/subscription-status?status=cancelled`,
            client_reference_id: userId,
            customer_email: userEmail,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            metadata: {
                userId: userId // Store userId in metadata for reference
            }
        });

        res.json({ sessionId: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            error: error.message,
            code: error.code // Include Stripe error code if available
        });
    }
});

// Helper function to update user subscription status in Firebase
async function updateUserSubscriptionStatus(userId, status) {
    try {
        const admin = require('firebase-admin');
        
        // Initialize Firebase Admin if not already initialized
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                // Add your Firebase config here if needed
            });
        }

        const db = admin.firestore();
        await db.collection('users').doc(userId).update({
            subscriptionStatus: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Updated subscription status for user ${userId} to ${status}`);
    } catch (error) {
        console.error('Error updating user subscription status:', error);
        // Don't throw the error - we don't want to break the webhook response
        // but we do want to log it for debugging
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Force port 4242 for Stripe webhook testing
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`⭐ Webhook endpoint ready at http://localhost:${PORT}/webhook`);
    console.log(`🔔 Checkout endpoint ready at http://localhost:${PORT}/create-checkout-session`);
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
