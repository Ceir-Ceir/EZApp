// src/pages/subscribe.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';

const stripePromise = loadStripe(process.env.STRIPE_SECRET_KEY); 

const Subscribe = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    
        // Load Stripe Pricing Table script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        document.body.appendChild(script);
    
        return () => {
            // Cleanup script when component unmounts
            const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
            console.log('Script exists:', existingScript);
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, [currentUser, navigate]);

    // Function to handle success from Stripe
    const handleSuccess = async (paymentIntent) => {
        try {
            const subscriptionRef = doc(db, 'subscriptions', currentUser.uid);
            await setDoc(subscriptionRef, {
                status: 'active',
                paymentIntentId: paymentIntent.id,
                timestamp: new Date(),
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving subscription to Firestore:", error);
            setError("Something went wrong while saving your subscription. Please try again.");
        }
    };

    // Function to handle failure from Stripe
    const handleFailure = (error) => {
        console.error("Payment failed:", error);
        setError("Payment failed. Please try again.");
        navigate('/subscribe');
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout(); // Assuming logout function from AuthContext
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            setError("Logout failed. Please try again.");
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            {/* Logout Button - Display only if the user is logged in */}
            {currentUser && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white py-2 px-4 rounded-md"
                        >
                            Logout
                        </button>
                    </div>
                )}
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Choose Your Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Select the plan that best fits your needs
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-md mx-auto mt-8">
                        <div className="bg-red-100 text-red-700 p-4 rounded-md">
                            {error}
                        </div>
                    </div>
                )}

                {/* Stripe Pricing Table */}
                <div className="mt-12">
                    <stripe-pricing-table 
                        pricing-table-id="prctbl_1QKsvxK15hFjPN4iIj6XoBYS"
                        publishable-key="pk_test_51QJhxLK15hFjPN4iALvmbUuaKxuNE3pthjbKBxNmKO5nrOxXNxgDs5KPxPSrCebcRL59697NZppmi2RTprQCibl000uyb5mhWP"
                        client-reference-id={currentUser?.uid}
                        customer-email={currentUser?.email}
                        onPaymentSuccess={handleSuccess}  // Callback on successful payment
                        onPaymentFailure={handleFailure}  // Callback on failed payment
                        >
                    </stripe-pricing-table>
                </div>
            </div>
        </div>
    );
};

export default Subscribe;