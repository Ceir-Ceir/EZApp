// src/api/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../../src/services/firebase');
const { doc, updateDoc } = require('firebase/firestore');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.client_reference_id;
            
            // Update user's subscription status in Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                subscriptionStatus: 'active',
                stripeCustomerId: session.customer,
                subscriptionId: session.subscription
            });
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            // Find user with this subscription ID and update their status
            // You'll need to query your users collection to find the right user
            break;
        }
    }

    res.json({ received: true });
};