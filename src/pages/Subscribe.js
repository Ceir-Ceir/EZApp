import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
        script.onload = () => setIsStripeLoaded(true);
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [currentUser, navigate]);

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
