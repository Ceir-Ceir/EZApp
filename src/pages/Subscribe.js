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
  const db = getFirestore();

  // This will check subscription status whenever the component mounts
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const checkStatus = async () => {
      const userRef = doc(db, "Users", currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubscriptionStatus(data.subscriptionStatus || "inactive");

        // If payment was successful, redirect to dashboard
        if (data.subscriptionStatus === "active") {
          navigate("/main-app/dashboard");
        }
      }
    };

    checkStatus();

    // Set up real-time listener
    const unsubscribe = onSnapshot(doc(db, "Users", currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSubscriptionStatus(data.subscriptionStatus || "inactive");

        // Redirect if payment completes while on this page
        if (data.subscriptionStatus === "active") {
          navigate("/main-app/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate, db]);

  const handlePricingTableClick = async (event) => {
    setError("");
    const priceId = event.detail.priceId;

    if (!currentUser) {
      sessionStorage.setItem("selectedPriceId", priceId);
      navigate("/signup");
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const idToken = await currentUser.getIdToken();

      // Create a success URL that will detect the payment completion
      const successUrl = `${window.location.origin}/payment-success?uid=${currentUser.uid}`;

      const response = await fetch(`${apiUrl}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          success_url: successUrl,
          cancel_url: `${window.location.origin}/subscribe`,
        }),
      });

      const session = await response.json();

      // Open Stripe checkout in a new tab
      window.open(session.url, "_blank");

      // Immediately redirect to login (or wherever you want them to go)
      navigate("/login");
    } catch (error) {
      setError(error.message || "Failed to create checkout session");
    }
  };

  // Stripe pricing table loader
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    script.onload = () => {
      setIsStripeLoaded(true);
      const pricingTable = document.querySelector("stripe-pricing-table");
      if (pricingTable) {
        pricingTable.addEventListener("checkout", (event) => {
          event.preventDefault();
          handlePricingTableClick(event);
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="min-h-screen bg-gray-50 py-12 px-4">
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
                publishable-key={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
                client-reference-id={currentUser?.uid || ""}
              ></stripe-pricing-table>
            ) : (
              <div>Loading payment options...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
