// src/api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../services/firebase');

exports.createCheckoutSession = async (req, res) => {
    const { priceId, userId, userEmail } = req.body;

    try {
        // Create a new checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.DOMAIN}/main-app?success=true`,
            cancel_url: `${process.env.DOMAIN}/subscribe?canceled=true`,
            client_reference_id: userId,
            customer_email: userEmail,
        });

        res.json({ sessionId: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
};