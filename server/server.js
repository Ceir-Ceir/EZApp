import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import path from 'path';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const app = express();
const db = admin.firestore();

// Enable CORS specifically for your React app
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'stripe-signature'],
}));

// Serve static files from the root public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use JSON parsing for regular routes
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Helper function to map Stripe product IDs to subscription levels and quotas
const PLAN_MAPPING = {
    'prod_RDJYaEEgMIyPqF': { level: 'basic', quota: 100 },
    'prod_RDJYTicEOJVQZQ': { level: 'premium', quota: 250 },
    'prod_RDJYLWEbkLpU1S': { level: 'pro', quota: 500 },
};

// Helper function to update user subscription status in Firebase
async function updateUserSubscription(userId, status, planId) {
    try {
        const planInfo = PLAN_MAPPING[planId] || { level: 'basic', quota: 100 };

        await db.collection('Users').doc(userId).update({
            subscriptionStatus: status,
            subscriptionLevel: planInfo.level,
            applicationQuota: planInfo.quota,
            quotaRemaining: planInfo.quota,
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Updated user ${userId}:`, {
            status,
            level: planInfo.level,
            quota: planInfo.quota
        });
    } catch (error) {
        console.error('Error updating user subscription:', error);
        throw error;
    }
}

// Webhook endpoint to handle Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('✅ Webhook verified:', event.type);

        if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
            const subscription = event.data.object;
            const userId = subscription.metadata.userId;
            
            // Get the product ID from the subscription
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            const productId = price.product;

            const status = ['active', 'trialing'].includes(subscription.status) ? 'active' : 'inactive';
            await updateUserSubscription(userId, status, productId);
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Endpoint to fetch available plans
app.get('/api/get-plans', async (req, res) => {
    try {
        // Fetch both products and prices
        const [products, prices] = await Promise.all([
            stripe.products.list({ active: true }),
            stripe.prices.list({ active: true })
        ]);

        // Map products and prices together
        const formattedPlans = prices.data
            .filter(price => price.recurring) // Only get subscription prices
            .map(price => {
                const product = products.data.find(p => p.id === price.product);
                return {
                    id: price.id,
                    productId: price.product,
                    name: product?.name || 'Unknown Plan',
                    description: product?.description || 'No description available',
                    price: (price.unit_amount / 100).toFixed(2),
                    currency: price.currency.toUpperCase(),
                    interval: price.recurring.interval,
                    features: product?.metadata?.features 
                        ? JSON.parse(product.metadata.features) 
                        : []
                };
            });

        // Sort plans by price
        const sortedPlans = formattedPlans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        
        console.log('Successfully fetched plans:', sortedPlans);
        res.json(sortedPlans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ 
            error: 'Failed to fetch plans',
            details: error.message 
        });
    }
});

// Endpoint to create a checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    const { priceId, userId, userEmail } = req.body;

    if (!priceId || !userId || !userEmail) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/subscription-status?status=success&price_id=${priceId}`,
            cancel_url: `${process.env.CLIENT_URL}/subscription-status?status=cancelled`,
            client_reference_id: userId,
            customer_email: userEmail,
            subscription_data: {
                metadata: { userId }
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            metadata: { userId },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`⭐ Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`🔔 Checkout endpoint: http://localhost:${PORT}/api/create-checkout-session`);
});