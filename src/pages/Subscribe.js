import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';

const Subscribe = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [profileComplete, setProfileComplete] = useState(null);

    const db = getFirestore();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            fetchSubscriptionStatus();
        }

        // Load Stripe pricing table script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        script.onload = () => {
            setIsStripeLoaded(true);
            // Add event listener for pricing table clicks
            document.addEventListener('stripe-pricing-table-click', handlePricingTableClick);
        };
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            document.removeEventListener('stripe-pricing-table-click', handlePricingTableClick);
        };
    }, [currentUser, navigate]);

    // In your handlePricingTableClick function
const handlePricingTableClick = async (event) => {
    console.log('Pricing table clicked:', event.detail);
    
    if (!currentUser) {
        // Store the selected price ID in session storage
        sessionStorage.setItem('selectedPriceId', event.detail.priceId);
        // Redirect to signup
        navigate('/signup');
        return;
    }

    // User is already logged in, create checkout session
    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://us-central1-ezapp-91d8e.cloudfunctions.net/api';
        console.log('Creating checkout session for logged-in user:', {
            priceId: event.detail.priceId,
            userId: currentUser.uid,
            userEmail: currentUser.email
        });
        
        const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: event.detail.priceId,
                userId: currentUser.uid,
                userEmail: currentUser.email
            }),
        });

        const session = await response.json();
        console.log('Checkout session created:', session);
        
        if (session.url) {
            console.log('Redirecting to Stripe checkout:', session.url);
            window.location.href = session.url;
        } else {
            throw new Error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        setError('Failed to create checkout session. Please try again.');
    }
};

    // Fetch subscription status from Firestore based on current user's email
    const fetchSubscriptionStatus = async () => {
        try {
            if (currentUser && currentUser.email) {
                const userRef = doc(db, 'Users', currentUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setSubscriptionStatus(docSnap.data().subscriptionStatus);
                    setProfileComplete(docSnap.data().profileComplete);
                } else {
                    console.error('No such document!');
                    setSubscriptionStatus('inactive');
                    setProfileComplete('false');
                }
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setError('Failed to fetch subscription status.');
        }
    };

    // Redirect if already subscribed
    useEffect(() => {
        if (subscriptionStatus === 'active' && profileComplete === true) {
            navigate('/main-app/dashboard');
        } else if (subscriptionStatus === 'active' && profileComplete !== true) {
            navigate('/main-app-forms');
        }
    }, [subscriptionStatus, profileComplete, navigate]);

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
                    <stripe-pricing-table 
                        pricing-table-id="prctbl_1RK7aSK15hFjPN4iScgEWVz8"
                        publishable-key="pk_live_51QJhxLK15hFjPN4ibtTTu9HLgdeMEGEnes4yuQoNFFOkJfwl5gAjMMrA9iZTYMGz1wjmQl95UxjRiyDQ8qVTnuFg00RZUi2wmK">
                    </stripe-pricing-table>
                </div>
            </div>
        </div>
    );
};

export default Subscribe;
