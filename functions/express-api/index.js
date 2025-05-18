const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Express app
const app = express();

// Handle raw body for webhook endpoint only
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ezapp-91d8e.web.app",
    "https://ezapp-91d8e.firebaseapp.com",
    "https://getezapply.com"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook verified:", event.type);

    // Helper function to get userId from event
    const getUserIdFromEvent = (eventData) => {
      // Try client_reference_id first
      if (eventData.client_reference_id) {
        return eventData.client_reference_id;
      }
      // Try metadata as backup
      if (eventData.metadata && eventData.metadata.userId) {
        return eventData.metadata.userId;
      }
      return null;
    };

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = getUserIdFromEvent(session);
        
        if (!userId) {
          console.error('❌ No userId found in checkout session:', session.id);
          throw new Error('No userId found in checkout session');
        }
        
        console.log(`✅ Checkout completed for user ${userId}`);
        
        // For checkout sessions, we need to get the subscription details to determine plan level
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await updateUserSubscriptionStatus(userId, 'active', getPlanLevel(subscription));
        } else {
          await updateUserSubscriptionStatus(userId, 'active', 'unknown');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = getUserIdFromEvent(subscription);
        
        if (!userId) {
          console.error('❌ No userId found in subscription:', subscription.id);
          throw new Error('No userId found in subscription');
        }
        
        console.log(`✅ Invoice paid for user ${userId}`);
        await updateUserSubscriptionStatus(userId, 'active', getPlanLevel(subscription));
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = getUserIdFromEvent(subscription);
        
        if (!userId) {
          console.error('❌ No userId found in subscription:', subscription.id);
          throw new Error('No userId found in subscription');
        }
        
        // Determine subscription status
        let status = "inactive";
        let planLevel = "none";

        if (["active", "trialing"].includes(subscription.status)) {
          status = "active";
          planLevel = getPlanLevel(subscription);
        }
        
        console.log(`✅ Subscription ${event.type} for user ${userId}`);
        await updateUserSubscriptionStatus(userId, status, planLevel);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.get("/api/get-plans", async (req, res) => {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10 });
    const productPromises = prices.data.map(p => stripe.products.retrieve(p.product));
    const products = await Promise.all(productPromises);

    const formatted = prices.data.map((price, i) => ({
      id: price.id,
      name: (products[i] && products[i].name) || "Plan",
      description: (products[i] && products[i].description) || "",
      price: price.unit_amount / 100,
      currency: price.currency.toUpperCase(),
      priceId: price.id
    })).sort((a, b) => a.price - b.price);

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).send({ error: "Failed to fetch plans" });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/api/stripe-subscription", async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve("customer-id"); // replace in prod
    const subs = await stripe.subscriptions.list({ customer: customer.id });
    res.json(subs.data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get plan level from Stripe object
function getPlanLevel(stripeObject) {
  const priceId = stripeObject.items?.data[0]?.price?.id;
  if (!priceId) return 'none';

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'basic';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
  return 'none';
}

async function updateUserSubscriptionStatus(userId, status, planLevel) {
  try {
    const db = admin.firestore();
    
    // Changed from "users" to "Users" to match your collection name
    await db.collection("Users").doc(userId).update({
      subscriptionStatus: status,
      planLevel,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Updated subscription status for user ${userId} to ${status} with plan level ${planLevel}`);
  } catch (error) {
    console.error('Error updating user subscription status:', error);
    throw error; // Re-throw to handle in webhook
  }
}

// Add this if you're deploying directly to Cloud Run
// This makes the app listen on the port Cloud Run expects
if (process.env.K_SERVICE) {
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}


exports.api = onRequest(app);