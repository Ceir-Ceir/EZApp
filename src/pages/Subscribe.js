import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Subscribe = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [plans, setPlans] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    const db = getFirestore(); // Initialize Firestore

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            // Fetch subscription status from Firestore when the user is logged in
            fetchSubscriptionStatus();
        }

        // Fetch plans (Optional: If you want dynamic plans)
        fetch('http://localhost:4242/api/get-plans') // Update with your endpoint
            .then((res) => res.json())
            .then((data) => setPlans(data))
            .catch((err) => {
                console.error('Error fetching plans:', err);
                setError('Failed to load plans.');
            });
    }, [currentUser, navigate]);

    const handleSubscribe = async (priceId) => {
        try {
            const stripe = await stripePromise;

            const response = await fetch('http://localhost:4242/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: currentUser?.uid,
                    userEmail: currentUser?.email,
                }),
            });

            const session = await response.json();

            console.log("Session Response:", session);

            if (!response.ok) {
                console.error('Server error:', session);
                throw new Error(session.error || 'Server error');
            }
    
            if (session.error) {
                console.error('Stripe error:', session.error);
                throw new Error(session.error.message);
            }

            // Redirect to Stripe Checkout
            await stripe.redirectToCheckout({ sessionId: session.id });
        } catch (err) {
            console.error('Error during subscription:', err.message);
            setError('Something went wrong. Please try again.');
        }
    };

    // Fetch subscription status from Firestore based on current user's email
    const fetchSubscriptionStatus = async () => {
        try {
            if (currentUser && currentUser.email) {
                const userRef = doc(db, 'Users', currentUser.email);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setSubscriptionStatus(docSnap.data().subscriptionStatus); // Set the status from Firestore
                } else {
                    console.error('No such document!');
                    setSubscriptionStatus('inactive'); // Default to inactive if no status found
                }
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setError('Failed to fetch subscription status.');
        }
    };



        // Redirect if already subscribed
        useEffect(() => {
            if (subscriptionStatus === 'active') {
                navigate('/dashboard');
            }
        }, [subscriptionStatus, navigate]);

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

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-6 shadow-md">
                            <h3 className="text-xl font-semibold">{plan.name}</h3>
                            <p className="mt-4 text-gray-600">{plan.description}</p>
                            <p className="mt-2 text-lg font-bold">{plan.price}</p>
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                className="bg-blue-600 text-white mt-4 py-2 px-4 rounded-md"
                            >
                                Subscribe
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscribe;
