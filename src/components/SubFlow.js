// src/components/SubFlow.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSubscription } from '../services/stripe';

// Define plans array
const plans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 9,
        features: [
            'Feature 1',
            'Feature 2',
            'Feature 3'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 19,
        features: [
            'All Basic features',
            'Pro Feature 1',
            'Pro Feature 2'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49,
        features: [
            'All Pro features',
            'Enterprise Feature 1',
            'Enterprise Feature 2'
        ]
    }
];

const SubscriptionFlow = () => {
    const { currentUser } = useAuth();  // Changed from user to currentUser to match AuthContext
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubscribe = async () => {
        if (!selectedPlan) return;
        
        setLoading(true);
        setError(null);
        
        try {
            await createSubscription(currentUser.uid, selectedPlan.id);
        } catch (error) {
            setError(error.message);
            console.error('Subscription error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">Choose your plan</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`p-6 rounded-lg border cursor-pointer transition-all ${
                            selectedPlan?.id === plan.id 
                                ? 'border-[#004aad] shadow-lg' 
                                : 'border-gray-200 hover:border-[#004aad]'
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                    >
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold mb-4">${plan.price}<span className="text-lg text-gray-500">/mo</span></div>
                        
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        
                        <button 
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-[#004aad] text-white py-3 rounded-lg hover:bg-[#003c8d] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Subscribe Now'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionFlow;