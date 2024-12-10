import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Subscribe = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [profileComplete, setProfileComplete] = useState(false);

    const db = getFirestore();

    // Fetch plans from the server
    const fetchPlans = async () => {
        try {
            setLoading(true);
            console.log('Fetching plans...');
            
            const response = await fetch('http://localhost:4242/api/get-plans');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched plans:', data);
            setPlans(data);
        } catch (err) {
            console.error('Error fetching plans:', err);
            setError('Failed to load subscription plans. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle subscription creation
    const handleSubscribe = async (priceId) => {
        try {
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Failed to load Stripe');
            }

            console.log('Creating checkout session...');
            const response = await fetch('http://localhost:4242/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: currentUser?.uid,
                    userEmail: currentUser?.email,
                }),
            });

            const session = await response.json();

            if (!response.ok || session.error) {
                throw new Error(session.error || 'Failed to create checkout session');
            }

            console.log('Redirecting to Stripe Checkout...');
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
            
            if (error) {
                throw error;
            }
        } catch (err) {
            console.error('Subscription error:', err);
            setError('Failed to initiate subscription. Please try again.');
        }
    };

    // Fetch subscription status from Firestore
    const fetchSubscriptionStatus = async () => {
        try {
            if (!currentUser?.uid) return;

            const userRef = doc(db, 'Users', currentUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setSubscriptionStatus(data.subscriptionStatus || 'inactive');
                setProfileComplete(data.profileComplete || false);
            } else {
                setSubscriptionStatus('inactive');
                setProfileComplete(false);
            }
        } catch (err) {
            console.error('Error fetching subscription status:', err);
            setError('Failed to fetch subscription status');
        }
    };

    // Initial setup
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        Promise.all([
            fetchSubscriptionStatus(),
            fetchPlans()
        ]).catch(err => {
            console.error('Setup error:', err);
            setError('Failed to load subscription information');
        });
    }, [currentUser, navigate]);

    // Handle subscription status redirects
    useEffect(() => {
        if (subscriptionStatus === 'active') {
            navigate(profileComplete ? '/main-app/dashboard' : '/main-app-forms');
        }
    }, [subscriptionStatus, profileComplete, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading subscription plans...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Choose Your Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Select the plan that best fits your needs.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-md mx-auto mt-8">
                        <div className="bg-red-100 text-red-700 p-4 rounded-md">
                            {error}
                        </div>
                    </div>
                )}

                {/* Subscription Plans */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.id} 
                             className="bg-white border rounded-lg p-8 shadow-md flex flex-col">
                            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                            <p className="text-gray-600 flex-grow">{plan.description}</p>
                            <div className="mt-4">
                                <p className="text-2xl font-bold">
                                    ${plan.price} {plan.currency}
                                    <span className="text-base font-normal text-gray-600">
                                        /{plan.interval}
                                    </span>
                                </p>
                                {plan.features && (
                                    <ul className="mt-4 space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="h-5 w-5 text-green-500 mr-2" 
                                                     fill="none" 
                                                     strokeLinecap="round" 
                                                     strokeLinejoin="round" 
                                                     strokeWidth="2" 
                                                     viewBox="0 0 24 24" 
                                                     stroke="currentColor">
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscribe;