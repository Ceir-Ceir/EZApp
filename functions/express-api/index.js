const { onRequest } = require("firebase-functions/v2/https");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4243",
      "https://ezapp-91d8e.web.app",
      "https://ezapp-91d8e.firebaseapp.com",
      "https://getezapply.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Pre-flight requests
app.options("*", cors());

// Configure timeout settings (60 seconds)
app.use((req, res, next) => {
  req.setTimeout(60000, () => {
    console.error("Request timeout");
    res.status(504).send("Timeout");
  });
  next();
});

const endpointSecret="whsec_qmvIi1yb85E0ySMEOtg8AqnJVnVF90Nt";

// Webhook handler
// app.post("/webhook", bodyParser.raw({type: "application/json"}), (request, response) => {
  app.post("/webhook", express.raw({type: "application/json"}), (request, response) => {
  
  // Debugging logs
    console.log("[DEBUG] Webhook received");
    console.log("[DEBUG] Raw body length:", request.body?.length);
    console.log("[DEBUG] Raw body:", request.body);
    console.debug("[DEBUG] Stripe-Signature header:", request.headers["stripe-signature"]);
    console.log("[DEBUG] Endpoint secret configured:", !!endpointSecret);
    


  let event= request.body;


  console.log("[Webhook] Event type:", event.type);
  // Immediately acknowledge receipt to Stripe
  response.status(200).send("Received");
  handleEvent(event);
});

const getUserIdFromEvent = async (session) => {
  if (session.client_reference_id) return session.client_reference_id;
  if (session.metadata?.userId) return session.metadata.userId;

  // If customer ID is present, retrieve it and check metadata
  if (typeof session.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(session.customer);
      if (customer.metadata?.userId) {
        return customer.metadata.userId;
      }
    } catch (err) {
      console.error("[ERROR] Failed to retrieve customer metadata:", err);
    }
  }

  return null;
};


async function handleEvent(event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const userId = await getUserIdFromEvent(session);

      if (!userId) {
        console.error("[ERROR] No userId found in session:", session.id);
        return;
      }

      if (session.payment_status !== "paid") {
        console.log("[INFO] Payment not completed, skipping");
        break;
      }

      try {
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await updateUserSubscriptionStatus(userId, "active", getPlanLevel(subscription));
        } else {
          await updateUserSubscriptionStatus(userId, "active", "unknown");
        }
        console.log(`✅ Checkout completed for user ${userId}`);
      } catch (err) {
        console.error("[ERROR] Firestore update failed:", err);
      }

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;

      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const userId = await getUserIdFromEvent(subscription);

      if (!userId) {
        console.error("[ERROR] No userId found in invoice:", invoice.id);
        break;
      }

      try {
        await updateUserSubscriptionStatus(userId, "active", getPlanLevel(subscription));
        console.log(`✅ Invoice paid for user ${userId}`);
      } catch (err) {
        console.error("[ERROR] Firestore update failed:", err);
      }

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;

      const userId = await getUserIdFromEvent(subscription);

      if (!userId) {
        console.error("[ERROR] No userId found in subscription:", subscription.id);
        break;
      }

      const status = ["active", "trialing"].includes(subscription.status)
        ? "active"
        : "inactive";

      try {
        await updateUserSubscriptionStatus(userId, status, getPlanLevel(subscription));
        console.log(`🔄 Subscription updated for user ${userId}`);
      } catch (err) {
        console.error("[ERROR] Firestore update failed:", err);
      }

      break;
    }

    default:
      console.log(`[INFO] Unhandled event type: ${event.type}`);
  }
}





  // Serve static files from the root public directory
app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  express.json()(req, res, next);
});


// Fetch available plans
app.get("/api/get-plans", async (req, res) => {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10 });
    const products = await Promise.all(
      prices.data.map((p) => stripe.products.retrieve(p.product))
    );

    const formatted = prices.data
      .map((price, i) => ({
        id: price.id,
        name: products[i]?.name || "Plan",
        description: products[i]?.description || "",
        price: (price.unit_amount || 0) / 100,
        currency: price.currency.toUpperCase(),
        priceId: price.id,
      }))
      .sort((a, b) => a.price - b.price);

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  const { priceId, userId, userEmail } = req.body;
  console.log("[INFO] Creating checkout session with:", req.body);
  if (!userId && !userEmail) {
    return res.status(400).json({ error: "Missing userId and userEmail." });
  }

  const clientUrl = process.env.CLIENT_URL || "https://getezapply.com";

  try {
    // Validate required fields
    if (!priceId) {
      return res.status(400).json({ error: "Missing price ID." });
    }

    // If no userId provided but we have userEmail, try to find the user
    let finalUserId = userId;
    if (!finalUserId && userEmail) {
      try {
        const usersRef = db.collection("Users");
        const q = usersRef.where("email", "==", userEmail);
        const querySnapshot = await q.get();

        if (!querySnapshot.empty) {
          finalUserId = querySnapshot.docs[0].id;
          console.log("[INFO] Found user by email:", finalUserId);
        }
      } catch (error) {
        console.error("[INFO] Error finding user by email:", error);
      }
    }

    console.log("[INFO] Final userId for checkout:", finalUserId);
    const successUrl = `${clientUrl}/subscription-status?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientUrl}/subscription-status?status=cancelled`;

    console.log("[INFO] Success URL indexjs:", successUrl);
    console.log("[INFO] Cancel URL indexjs:", cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: finalUserId, // Make sure this is set
      customer_email: userEmail,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        userId: finalUserId, // Backup in metadata
      },
    });

    console.log("[INFO] Created checkout session:", session.id);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("[INFO] Error creating checkout session:", error);
    res.status(500).json({
      error: error.message,
      code: error.code, // Include Stripe error code if available
    });
  }
});

// app.post("/create-checkout-session", async (req, res) => {
//   const { priceId, userId, userEmail } = req.body;
//   console.log("[INFO] Creating checkout session with:", req.body);

//   if (!priceId || (!userId && !userEmail)) {
//     return res.status(400).json({
//       error: "Missing required fields: priceId and (userId or userEmail)."
//     });
//   }

//   const clientUrl = process.env.CLIENT_URL || "https://getezapply.com";

//   try {
//     let finalUserId = userId;

//     // Find user by email if no userId provided
//     if (!finalUserId && userEmail) {
//       const usersRef = db.collection("Users");
//       const q = usersRef.where("email", "==", userEmail);
//       const querySnapshot = await q.get();

//       if (!querySnapshot.empty) {
//         finalUserId = querySnapshot.docs[0].id;
//         console.log("[INFO] Found user by email:", finalUserId);
//       }
//     }

//     // Configure URLs with proper parameters
//     const successUrl = `${clientUrl}/subscription-status?session_id={CHECKOUT_SESSION_ID}`;
//     const cancelUrl = `${clientUrl}/subscribe?cancelled=true`;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [{ price: priceId, quantity: 1 }],
//       mode: "subscription",
//       success_url: successUrl,
//       cancel_url: cancelUrl,
//       client_reference_id: finalUserId,
//       customer_email: userEmail,
//       allow_promotion_codes: true,
//       billing_address_collection: "required",
//       metadata: { userId: finalUserId },
//       consent_collection: {
//         terms_of_service: "required"
//       },
//       phone_number_collection: {
//         enabled: true
//       }
//     });

//     console.log("[INFO] Created checkout session:", session.id);
//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("[INFO] Error creating checkout session:", error);
//     res.status(500).json({
//       error: error.message,
//       code: error.code,
//       type: error.type
//     });
//   }
// });

app.post("/verify-subscription", async (req, res) => {
  const { sessionId, userId } = req.body;

  try {
    if (!sessionId || !userId) {
      return res.status(400).json({ error: "Missing sessionId or userId" });
    }

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" &&
      (session.client_reference_id === userId ||
        session.metadata.userId === userId)
    ) {
      // Update Firestore if not already updated by webhook
      const userRef = db.collection("Users").doc(userId);
      await userRef.update({
        subscriptionStatus: "active",
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
      });

      return res.json({ verified: true });
    }

    return res.json({ verified: false });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get plan level from Stripe object
function getPlanLevel(stripeObject) {
  // For invoice events, we need to get the price ID from the line items
  if (stripeObject.object === "invoice") {
    const lineItem = stripeObject.lines?.data[0];
    if (!lineItem) return "none";

    const priceId = lineItem.price?.id;
    if (!priceId) return "none";

    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "basic";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
    return "none";
  }

  // For other objects (subscription, session), get from items
  const priceId = stripeObject.items?.data[0]?.price?.id;
  if (!priceId) return "none";

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "basic";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
  return "none";
}

// Helper function to update user subscription status in Firebase
async function updateUserSubscriptionStatus(userId, status, planLevel) {
  try {
    console.log("[INFO] inside updateUserSubscriptionStatus");

    // Update subscription status
    await db
      .collection("Users")
      .doc(userId)
      .update({
        subscriptionStatus: status,
        planLevel: planLevel,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add job automation fields
        jobs_assigned_this_week: 0,
        weekly_job_limit: calculateWeeklyJobs(planLevel),
        last_job_application: null,
      });

    // If subscription is active, trigger job automation
    if (status === "active") {
      try {
        // Get user preferences
        const userDoc = await db.collection("Users").doc(userId).get();
        if (!userDoc.exists) {
          console.error("[INFO] User document not found:", userId);
          return;
        }
        const userData = userDoc.data();

        const planLevel = userData.subscription?.planLevel || "basic";

        if (userData) {
          // Start job scraping process
          const { spawn } = require("child_process");
          const pythonProcess = spawn("python3", [
            "functions/automation/jobscraper.py",
            "--user_id",
            userId,
            "--preferences",
            JSON.stringify({
              job_titles: userData.jobSearchPreferences?.jobPreferences
                ?.jobTitle
                ? [userData.jobSearchPreferences.jobPreferences.jobTitle]
                : [],
              locations: userData.jobSearchPreferences?.jobPreferences?.location
                ? [userData.jobSearchPreferences.jobPreferences.location]
                : [],
            }),
            "--limit",
            calculateWeeklyJobs(planLevel).toString(),
          ]);

          pythonProcess.stdout.on("data", (data) => {
            console.log(`[INFO] Job scraper output: ${data}`);
          });

          pythonProcess.stderr.on("data", (data) => {
            console.error(`[INFO] Job scraper error: ${data}`);
          });

          pythonProcess.on("close", (code) => {
            console.log(`[INFO] Job scraper process exited with code ${code}`);
          });
        }
      } catch (error) {
        console.error("[INFO] Error starting job automation:", error);
      }
    } else {
      console.log(
        "[INFO] Subscription is not active. Skipping job automation."
      );
    }

    console.log(
      `[INFO] Updated subscription status for user ${userId} to ${status} with plan level ${planLevel}`
    );
  } catch (error) {
    console.error("[INFO] Error updating user subscription status:", error);
    throw error;
  }
}

// Helper function to calculate weekly job limit based on plan level
function calculateWeeklyJobs(planLevel) {
  const monthlyLimits = {
    basic: 100,
    pro: 250,
    enterprise: 500,
  };

  const monthlyLimit = monthlyLimits[planLevel] || 0;
  return Math.floor(monthlyLimit / 4); // Weekly limit is monthly limit divided by 4
}

// Stripe test route
app.get("/stripe-subscription", async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ error: "Missing customer ID" });
    }

    const customer = await stripe.customers.retrieve(customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No subscription found" });
    }

    res.json(subscriptions.data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[INFO] Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404s
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

exports.api = onRequest(
  {
    memory: "1GB",
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10,
  },
  app
);
