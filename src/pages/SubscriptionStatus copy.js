// src/pages/subscriptionStatus.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';

export default function SubscriptionStatus() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [debugInfo, setDebugInfo] = useState({});
    const [timer, setTimer] = useState(15);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get status from URL query params
    const queryParams = new URLSearchParams(location.search);
    console.log("queryParams", queryParams);
    const status = queryParams.get('status');
    console.log("status", status);
    const sessionId = queryParams.get('session_id');

    // Check subscription status in Firestore with real-time listener
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const db = getFirestore();
        const userRef = doc(db, 'Users', currentUser.uid);

        const unsubscribe = onSnapshot(userRef, (doc) => {
            try {
                if (doc.exists()) {
                    const data = doc.data();
                    setSubscriptionStatus(data.subscriptionStatus || 'inactive');
                    setProfileComplete(data.profileComplete || false);
                    
                    // Update debug info
                    setDebugInfo({
                        userId: currentUser?.uid,
                        email: currentUser?.email,
                        subscriptionStatus: data.subscriptionStatus,
                        profileComplete: data.profileComplete,
                        urlStatus: status,
                        sessionId,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    setSubscriptionStatus('inactive');
                    setProfileComplete(false);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error checking subscription status:', error);
                setSubscriptionStatus('inactive');
                setProfileComplete(false);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [currentUser, navigate, status, sessionId]);

    // Main redirect effect
    useEffect(() => {
        if (loading || !currentUser) return;

        console.log('Current subscription status:', subscriptionStatus);
        console.log('Profile complete:', profileComplete);

        if (subscriptionStatus === 'active') {
            if (profileComplete) {
                navigate('/main-app/dashboard');
            } else {
                navigate('/main-app-forms');
            }
        } else if (status === 'cancelled') {
            // User cancelled the payment, show message but wait for timeout
            console.log('Payment was cancelled by user');
        }
    }, [subscriptionStatus, profileComplete, loading, currentUser, navigate, status]);

    // Timeout effect
   useEffect(() => {
  if (loading) {
    console.log("[Step 1] Still loading, exiting early...");
    return;
  }

  console.log("[Step 2] Starting countdown timer and redirect logic...");
  const countdownInterval = setInterval(() => {
    setTimer(prev => {
      const newTime = prev > 0 ? prev - 1 : 0;
      console.log(`[Timer Tick] Time remaining: ${newTime}s`);
      return newTime;
    });
  }, 1000);

  const redirectTimeout = setTimeout(() => {
    console.log("[Step 3] 15-second timeout reached. Checking subscription and profile status...");
    
    if (subscriptionStatus === 'active') {
      if (profileComplete) {
        console.log("[Step 4] Subscription is active and profile is complete → Redirecting to /main-app/dashboard");
        navigate('/main-app/dashboard');
      } else {
        console.log("[Step 5] Subscription is active but profile is incomplete → Redirecting to /main-app-forms");
        navigate('/main-app-forms');
      }
    } else {
      console.log("[Step 6] Subscription is not active → Redirecting to /subscribe");
      navigate('/subscribe');
    }
  }, 15000);

  return () => {
    console.log("[Cleanup] Clearing countdown and timeout...");
    clearInterval(countdownInterval);
    clearTimeout(redirectTimeout);
  };
}, [subscriptionStatus, profileComplete, loading, navigate]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            
            <h1 className="text-xl font-semibold">
                {subscriptionStatus === 'active' 
                    ? 'Subscription confirmed!' 
                    : status === 'cancelled'
                    ? 'Payment cancelled'
                    : 'Verifying your subscription...'}
            </h1>
            
            {subscriptionStatus === 'active' ? (
                <p className="text-gray-600">
                    Your subscription is active! Redirecting you to the app...
                </p>
            ) : status === 'cancelled' ? (
                <p className="text-gray-600">
                    You cancelled the payment process. You can try again if you want.
                </p>
            ) : (
                <p className="text-gray-600">
                    We're waiting for confirmation of your payment. This may take a few moments.
                </p>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
                You will be redirected in {timer} seconds
            </p>
            
            {subscriptionStatus === 'active' ? (
                <button 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => profileComplete 
                        ? navigate('/main-app/dashboard') 
                        : navigate('/main-app-forms')}
                >
                    Go to app now
                </button>
            ) : (
                <button 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => navigate('/subscribe')}
                >
                    {status === 'cancelled' ? 'Try again' : 'Choose a subscription'}
                </button>
            )}
            
            {/* Debug info - only visible in development */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 p-4 bg-gray-100 rounded max-w-md w-full text-xs font-mono">
                    <h3 className="font-bold mb-2">Debug Info:</h3>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}