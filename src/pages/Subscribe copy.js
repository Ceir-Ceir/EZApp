import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";


const Subscribe = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  const pricingTableRef = useRef(null);

  const handleCheckout = (event) => {
    console.log('Checkout event:', event.detail);
    handlePricingTableClick(event);
  };

  const handlePricingTableClick = async (event) => {
  setError("");
  console.log("[Step 1] Pricing table clicked:", event.detail);

  if (!currentUser) {
    console.log("[Step 2] No current user — storing selected price and redirecting to /signup");
    sessionStorage.setItem("selectedPriceId", event.detail.priceId);
    navigate("/signup");
    return;
  }

    const handleCheckout = (event) => {
    console.log('Checkout event:', event.detail);
    handlePricingTableClick(event);
  };

  useEffect(() => {
    if (!isStripeLoaded) return;

    const pricingTable = document.querySelector('stripe-pricing-table');
    if (pricingTable) {
      pricingTable.addEventListener('checkout', handleCheckout);
    }

    return () => {
      if (pricingTable) {
        pricingTable.removeEventListener('checkout', handleCheckout);
      }
    };
  }, [isStripeLoaded]);

  try {
    console.log("[Step 3] User is logged in:", currentUser);
    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://us-central1-ezapp-91d8e.cloudfunctions.net/api";
    console.log("[Step 4] Using API URL:", apiUrl);

    const userRef = doc(db, "Users", currentUser.uid);
    console.log("[Step 5] Fetching user profile...");
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      console.warn("[Step 6] User document does not exist.");
      setError("Please complete your profile before subscribing");
      navigate("/main-app-forms");
      return;
    }

    const userData = docSnap.data();
    console.log("[Step 7] User profile data fetched:", userData);

    if (!userData.profileComplete) {
      console.warn("[Step 8] User profile is incomplete.");
      setError("Please complete your profile before subscribing");
      navigate("/main-app-forms");
      return;
    }

    console.log("[Step 9] Creating checkout session...");
    const idToken = await currentUser.getIdToken();

    const response = await fetch(`${apiUrl}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        priceId: event.detail.priceId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
      }),
    });

    console.log("[Step 10] Checkout session response received:", response);

    if (!response.ok) {
      console.error("[Step 11] Response not OK:", response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const session = await response.json();
    console.log("[Step 12] Session JSON parsed:", session);

    if (session.error) {
      console.error("[Step 13] Session returned error:", session.error);
      throw new Error(session.error);
    }

    if (session.url) {
      console.log("[Step 14] Redirecting to Stripe checkout URL:", session.url);
      window.location.href = session.url;
    } else {
      console.error("[Step 15] No URL returned from session");
      throw new Error("No URL returned from checkout session");
    }
  } catch (error) {
    console.error("[Step X] Error caught:", error);
    setError(error.message || "Failed to create checkout session. Please try again.");
  }
};

 

  // Redirect logic
  useEffect(() => {
    if (loading) return;

    if (subscriptionStatus === 'active' && profileComplete) {
      navigate('/main-app/dashboard');
    } else if (subscriptionStatus === 'active' && !profileComplete) {
      navigate('/main-app-forms');
    }
  }, [subscriptionStatus, profileComplete, navigate, loading]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // --- Firestore subscription listener ---
    const userRef = doc(db, "Users", currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSubscriptionStatus(data.subscriptionStatus || "inactive");
        setProfileComplete(data.profileComplete || false);
        setLoading(false);
      } else {
        console.error("No such document!");
        setSubscriptionStatus("inactive");
        setProfileComplete(false);
        setLoading(false);
      }
    });

    // --- Stripe Pricing Table loader ---
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    script.onload = () => {
      setIsStripeLoaded(true);
      document.addEventListener("stripe-pricing-table-click", handlePricingTableClick);
    };

    document.head.appendChild(script);

    // --- Cleanup ---
    return () => {
      unsubscribeFirestore();
      document.removeEventListener("stripe-pricing-table-click", handlePricingTableClick);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [currentUser, navigate, db]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the plan that best fits your needs
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          </div>
        )}

        <div className="mt-12">
          {isStripeLoaded ? (
            <stripe-pricing-table 
              pricing-table-id="prctbl_1RK7aSK15hFjPN4iScgEWVz8"
              publishable-key={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_live_51QJhxLK15hFjPN4ibtTTu9HLgdeMEGEnes4yuQoNFFOkJfwl5gAjMMrA9iZTYMGz1wjmQl95UxjRiyDQ8qVTnuFg00RZUi2wmK"}
              client-reference-id={currentUser?.uid || ''}
            >
            </stripe-pricing-table>
          ) : (
            <div className="text-center py-8">
              <p>Loading payment options...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;