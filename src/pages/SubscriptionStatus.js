import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkSubscriptionStatus, isSubscriptionActive } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionStatus() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

                if (status === 'success') {
                    const subscriptionStatus = await checkSubscriptionStatus(currentUser.uid);

                    if (isSubscriptionActive(subscriptionStatus)) {
                        alert('Subscription successful!');
                        navigate('/dashboard'); // Redirect to the dashboard or main app area
                    } else {
                        alert('Subscription processing. Please wait a moment and refresh the page.');
                    }
                } else if (status === 'cancelled') {
                    alert('Subscription cancelled. You can try again.');
                    navigate('/subscribe'); // Redirect back to the subscription page
                } else {
                    alert('Subscription validation failed. Please contact support.');
                }
            } catch (error) {
                console.error('Error validating subscription:', error.message);
                alert('Something went wrong while validating your subscription. Please try again.');
                navigate('/subscribe');
            }
        }

        validateSubscription();
    }, [currentUser, navigate, location]);

    return <div>Validating your subscription...</div>;
}
