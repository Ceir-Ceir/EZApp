import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Subscribe = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Logout failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
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
