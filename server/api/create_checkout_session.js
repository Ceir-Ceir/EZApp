// api/create_checkout_session.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-checkout-session', async (req, res) => {
  try {
    console.log("Inside api");
    const { priceId } = req.body; // Receive the price ID or other subscription details from the frontend
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // This is the Stripe Price ID for the subscription
          quantity: 1,
        },
      ],
      mode: 'subscription', // Ensures that it is a subscription payment
      success_url: `${process.env.CLIENT_URL}/subscription-status?status=success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-status?status=cancelled`,
    });

    // Send the session ID to the frontend
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(4242, () => console.log('Running on port 4242'));
