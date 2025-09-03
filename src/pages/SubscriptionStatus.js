// subscription-status.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { doc, getFirestore } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const SubscriptionStatus = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status");
  
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(5);
  const [debugInfo, setDebugInfo] = useState({});
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const db = getFirestore();

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        setDebugInfo({
          sessionId,
          userId: currentUser.uid,
          status,
          timestamp: new Date().toISOString()
        });

        // Give the webhook a moment to process
        if (status === "success") {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Check Firestore status (using 'Users' to match your collection name)
        const userRef = doc(db, "Users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setSubscriptionStatus(userData.subscriptionStatus || "inactive");
          setProfileComplete(userData.profileComplete || false);
          
          if (userData.subscriptionStatus === "active") {
            // Small delay before redirect to show success message
            setTimeout(() => {
              if (userData.profileComplete) {
                navigate("/main-app/dashboard");
              } else {
                navigate("/main-app-forms");
              }
            }, 2000);
            setLoading(false);
            return;
          }
        } else {
          setSubscriptionStatus("inactive");
          setProfileComplete(false);
        }

        // Option 2: Verify with backend if webhook might be delayed
        if (sessionId && status === "success") {
          try {
            const apiUrl = process.env.REACT_APP_API_URL || "https://us-central1-ezapp-91d8e.cloudfunctions.net/api";
            const response = await fetch(`${apiUrl}/verify-subscription`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, userId: currentUser.uid }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.verified) {
                setSubscriptionStatus("active");
                setTimeout(() => {
                  if (profileComplete) {
                    navigate("/main-app/dashboard");
                  } else {
                    navigate("/main-app-forms");
                  }
                }, 2000);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Backend verification error:", error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Verification error:", error);
        setSubscriptionStatus("inactive");
        setLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId, currentUser, navigate, status, db]);

  // Timer countdown effect
  useEffect(() => {
    if ((subscriptionStatus === "active" && !loading) || status === "cancelled") {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (subscriptionStatus === "active") {
              navigate(profileComplete ? "/main-app/dashboard" : "/main-app-forms");
            } else if (status === "cancelled") {
              navigate("/subscribe");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [subscriptionStatus, status, navigate, profileComplete, loading]);

  if (loading || (status === "success" && !subscriptionStatus)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <h1 className="text-xl font-semibold">Verifying your subscription...</h1>
        <p className="text-gray-600">
          We're confirming your payment. This may take a few moments.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      {subscriptionStatus === "active" ? (
        <>
          <div className="w-12 h-12 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Subscription confirmed!</h1>
          <p className="text-gray-600">
            Your subscription is active! Redirecting you to the app...
          </p>
        </>
      ) : status === "cancelled" ? (
        <>
          <div className="w-12 h-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Payment cancelled</h1>
          <p className="text-gray-600">
            You cancelled the payment process. You can try again if you want.
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 text-yellow-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Subscription not found</h1>
          <p className="text-gray-600">
            We couldn't verify your subscription. Please try subscribing again.
          </p>
        </>
      )}

      {timer > 0 && (subscriptionStatus === "active" || status === "cancelled") && (
        <p className="text-sm text-gray-500 mt-4">
          You will be redirected in {timer} seconds
        </p>
      )}

      {subscriptionStatus === "active" ? (
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() =>
            profileComplete
              ? navigate("/main-app/dashboard")
              : navigate("/main-app-forms")
          }
        >
          Go to app now
        </button>
      ) : (
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => navigate("/subscribe")}
        >
          {status === "cancelled" ? "Try again" : "Choose a subscription"}
        </button>
      )}

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 p-4 bg-gray-100 rounded max-w-md w-full text-xs font-mono">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre>{JSON.stringify({
            ...debugInfo,
            subscriptionStatus,
            profileComplete,
            loading,
            currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;