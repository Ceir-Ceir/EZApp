// functions/index.js

const functions = require('firebase-functions'); // ✅ Moved to the top
const express = require('express');
const cors = require('cors');
const path = require('path');

// Use env or Firebase functions config for secrets
const stripeSecret = process.env.STRIPE_SECRET_KEY || functions.config().stripe.secret_key;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe.webhook_secret;
const stripe = require('stripe')(stripeSecret);

const app = express();

// ✅ CORS for local + production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ezapp-91d8e.web.app',
    'https://ezapp-91d8e.firebaseapp.com',
    'https://getezapply.com'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Static files if needed
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ Stripe webhook requires raw body
app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log('✅ Webhook verified');

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const userId = subscription.client_reference_id;

        let status = 'inactive';
        let planLevel = 'none';

        if (['active', 'trialing'].includes(subscription.status)) {
          status = 'active';
          const priceId = subscription.items.data[0].price.id;

          if (priceId === process.env.STRIPE_BASIC_PRICE_ID) planLevel = 'basic';
          else if (priceId === process.env.STRIPE_PRO_PRICE_ID) planLevel = 'pro';
          else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) planLevel = 'enterprise';
        }

        await updateUserSubscriptionStatus(userId, status, planLevel);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ✅ JSON body for normal API routes
app.use(express.json());

app.get('/api/get-plans', async (req, res) => {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10 });
    const productPromises = prices.data.map(p => stripe.products.retrieve(p.product));
    const products = await Promise.all(productPromises);

    const formatted = prices.data.map((price, i) => ({
      id: price.id,
      name: products[i]?.name || 'Plan',
      description: products[i]?.description || '',
      price: price.unit_amount / 100,
      currency: price.currency.toUpperCase(),
      priceId: price.id,
    })).sort((a, b) => a.price - b.price);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).send({ error: 'Failed to fetch plans' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId, userEmail } = req.body;

  try {
    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription-status?status=success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-status?status=cancelled`,
      client_reference_id: userId,
      customer_email: userEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: { userId }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/stripe-subscription', async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve('customer-id'); // replace this in production
    const subs = await stripe.subscriptions.list({ customer: customer.id });
    res.json(subs.data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

async function updateUserSubscriptionStatus(userId, status, planLevel) {
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) admin.initializeApp();

    const db = admin.firestore();
    await db.collection('users').doc(userId).update({
      subscriptionStatus: status,
      planLevel,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Updated ${userId} to ${status} - ${planLevel}`);
  } catch (error) {
    console.error('Firebase update error:', error);
  }
}

// 👇 This is for local testing (optional)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Local server running on ${PORT}`));
}

// 👇 Firebase cloud function export
exports.api = functions.https.onRequest(app);
