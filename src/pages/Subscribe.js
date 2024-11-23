// src/pages/subscribe.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Subscribe = () => {
    const { currentUser } = useAuth();
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
    
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
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
                        customer-email={currentUser?.email}>
                    </stripe-pricing-table>
                </div>
            </div>
        </div>
    );
};

export default Subscribe;