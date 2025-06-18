// subscription-status.js
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const SubscriptionStatus = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
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

        // Option 1: Check Firestore status (requires webhook)
        const userRef = doc(db, "Users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        try {
          if (docSnap.exists()) {
            if (docSnap.data().subscriptionStatus === "active") {
              setSubscriptionStatus(
                docSnap.data().subscriptionStatus || "active"
              );
              navigate("/main-app/dashboard");
              return;
            }
          } else {
            setSubscriptionStatus("inactive");
            setProfileComplete(false);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error checking subscription status:", error);
          setSubscriptionStatus("inactive");
          setProfileComplete(false);
          setLoading(false);
        }

        // Option 2: Verify with backend if webhook might be delayed
        if (sessionId) {
          const response = await fetch("/api/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, userId: currentUser.uid }),
          });

          const data = await response.json();
          if (data.verified) {
            navigate("/main-app/dashboard");
          }
        }

        // If neither worked, show appropriate message
      } catch (error) {
        console.error("Verification error:", error);
      }
    };

    verifySubscription();
  }, [sessionId, currentUser, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>

      <h1 className="text-xl font-semibold">
        {subscriptionStatus === "active"
          ? "Subscription confirmed!"
          : status === "cancelled"
          ? "Payment cancelled"
          : "Verifying your subscription..."}
      </h1>

      {subscriptionStatus === "active" ? (
        <p className="text-gray-600">
          Your subscription is active! Redirecting you to the app...
        </p>
      ) : status === "cancelled" ? (
        <p className="text-gray-600">
          You cancelled the payment process. You can try again if you want.
        </p>
      ) : (
        <p className="text-gray-600">
          We're waiting for confirmation of your payment. This may take a few
          moments.
        </p>
      )}

      <p className="text-sm text-gray-500 mt-4">
        You will be redirected in {timer} seconds
      </p>

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
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
