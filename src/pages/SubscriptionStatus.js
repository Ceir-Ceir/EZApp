// src/pages/subscriptionStatus.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';

export default function SubscriptionStatus() {
    const { currentUser, subscriptionStatus } = useAuth();
    const navigate = useNavigate();
    const [debugInfo, setDebugInfo] = useState({});
    const [timer, setTimer] = useState(15); // Reduced to 15 seconds
    
    // Add console logs for debugging
    console.log('SubscriptionStatus - Current user:', currentUser?.uid);
    console.log('SubscriptionStatus - Subscription status:', subscriptionStatus);

    // Main redirect effect
    useEffect(() => {
        console.log('SubscriptionStatus useEffect - Current user:', currentUser?.uid);
        console.log('SubscriptionStatus useEffect - Subscription status:', subscriptionStatus);
        
        if (!currentUser) {
            console.log('No user logged in, redirecting to login');
            navigate('/login');
            return;
        }
        
        // Handle different subscription statuses
        if (subscriptionStatus === 'active') {
            console.log('Subscription is active, redirecting to main app forms');
            navigate('/main-app-forms');
        } else if (subscriptionStatus === 'inactive') {
            console.log('Inactive status - should consider redirecting to subscribe page');
            // We'll let the user stay on this page for a bit in case webhook updates are coming
            // The timeout will redirect them to subscribe if no update happens
        } else if (subscriptionStatus === 'free') {
            console.log('Free tier detected - should redirect to subscribe page');
            // Will be handled by timeout
        } else {
            console.log('Unknown subscription status:', subscriptionStatus);
        }
        
        // Gather debug info
        setDebugInfo({
            currentUser: currentUser ? { 
                uid: currentUser.uid,
                email: currentUser.email
            } : null,
            subscriptionStatus,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString()
        });
    }, [currentUser, subscriptionStatus, navigate]);
    
    // Timeout effect - conditional redirect based on status
    useEffect(() => {
        if (!currentUser) return; // Don't set timers if no user
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        // Automatic redirect after timeout based on subscription status
        const redirectTimeout = setTimeout(() => {
            if (currentUser && window.location.pathname === '/subscription-status') {
                if (subscriptionStatus === 'active') {
                    console.log('Timeout reached - active subscription, redirecting to app');
                    window.location.href = '/main-app-forms';
                } else {
                    console.log('Timeout reached - no active subscription, redirecting to subscribe');
                    window.location.href = '/subscribe';
                }
            }
        }, 15000); // Reduced to 15 seconds
        
        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimeout);
        };
    }, [currentUser, subscriptionStatus]);
    
    // Manual update function (for debugging only)
    const manuallyUpdateSubscription = async () => {
        if (!currentUser) return;
        
        try {
            const db = getFirestore();
            const userRef = doc(db, 'Users', currentUser.uid);
            
            await updateDoc(userRef, {
                subscriptionStatus: 'active',
                updatedAt: new Date()
            });
            
            console.log('Manually updated subscription status to active');
            setTimeout(() => navigate('/main-app-forms'), 1000);
        } catch (error) {
            console.error('Error updating subscription status:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            
            {/* Dynamic title and content based on subscription status */}
            <h1 className="text-xl font-semibold">
                {subscriptionStatus === 'active' 
                    ? 'Subscription confirmed!' 
                    : 'Verifying your subscription...'}
            </h1>
            
            {/* Status-specific messaging */}
            {subscriptionStatus === 'active' ? (
                <p className="text-gray-600">
                    Your subscription is active! Redirecting you to the app...
                </p>
            ) : subscriptionStatus === 'inactive' || subscriptionStatus === 'free' ? (
                <p className="text-gray-600">
                    We're waiting for confirmation of your payment. If you haven't completed payment yet, 
                    you'll be redirected to the subscription page in a moment.
                </p>
            ) : (
                <p className="text-gray-600">
                    Please wait while we verify your subscription status...
                </p>
            )}
            
            {/* Auto-redirect notice with different destinations based on status */}
            <p className="text-sm text-gray-500 mt-4">
                You will be redirected {subscriptionStatus === 'active' 
                    ? 'to the app' 
                    : 'to the subscription page'} in {timer} seconds
            </p>
            
            {/* Conditional action buttons based on status */}
            {subscriptionStatus === 'active' ? (
                <button 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => window.location.href = '/main-app-forms'}
                >
                    Go to app now
                </button>
            ) : (
                <button 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => window.location.href = '/subscribe'}
                >
                    Choose a subscription
                </button>
            )}
            
            {/* Debug button - only visible in development */}
            {process.env.NODE_ENV !== 'production' && (
                <button 
                    className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                    onClick={manuallyUpdateSubscription}
                >
                    Debug: Set subscription active
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