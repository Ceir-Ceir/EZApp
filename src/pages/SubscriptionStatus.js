// src/pages/subscriptionStatus.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkSubscriptionStatus, isSubscriptionActive } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionStatus() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function validateSubscription() {
            if (!currentUser) {
                alert('User not logged in. Please log in to check subscription status.');
                navigate('/login');
                return;
            }

            try {
                const query = new URLSearchParams(location.search);
                const status = query.get('status');

                switch (status) {
                    case 'success':
                        navigate('/main-app-forms');
                        
                        break;

                    case 'cancelled':
                        alert('Subscription cancelled. You can try again.');
                        navigate('/subscribe');
                        break;

                    default:
                        alert('Subscription validation failed. Please contact support.');
                        navigate('/subscribe');
                        break;
                }
            } catch (error) {
                console.error('Error validating subscription:', error);
                alert('Something went wrong while validating your subscription. Please try again.');
                navigate('/subscribe');
            } finally {
                setLoading(false);
            }
        }

        validateSubscription();
    }, [currentUser, navigate, location.search]);

}
