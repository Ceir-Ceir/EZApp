// src/pages/subscriptionStatus.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export default function SubscriptionStatus() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const db = getFirestore();

    const PLAN_TO_LEVEL = {
        'prod_RCDksq8VlhbRf5': 'basic',  // Basic Plan
        'prod_RCDmHaepSfuAsQ': 'premium', // Premium Plan
        'prod_RCDntr8o33k5Y4': 'deluxe',  // Deluxe Plan
    };

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
                const priceId = query.get('price_id'); // Assuming the price ID is passed in the URL query

                if (!priceId) {
                    console.error('Price ID missing from URL.');
                    alert('Subscription validation failed. Please contact support.');
                    navigate('/subscribe');
                    return;
                }

                const subscriptionLevel = PLAN_TO_LEVEL[priceId] || 'basic';

                switch (status) {
                    case 'success':
                        await updateSubscriptionDetails('active', subscriptionLevel);
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

    const updateSubscriptionDetails = async (status, level) => {
        try {
            if (!currentUser) {
                console.error('No current user to update subscription details');
                return;
            }

            const userRef = doc(db, "Users", currentUser.uid);
            await updateDoc(userRef, {
                subscriptionStatus: status, // Update subscription status
                subscriptionLevel: level,  // Update subscription level
                subscriptionUpdatedAt: new Date(), // Add a timestamp for the update
            });

            console.log('Subscription status updated to:', status);
            console.log('Subscription level updated to:', level);
        } catch (error) {
            console.error('Error updating subscription details:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return null;
}
