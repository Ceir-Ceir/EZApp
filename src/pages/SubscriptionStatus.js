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
                        await updateSubscriptionStatus('active');
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

    const updateSubscriptionStatus = async (status) => {
        try {
            if (!currentUser) {
                console.error('No current user to update subscription status');
                return;
            }

            const userEmail = currentUser.email; // Use the user's email
            const userRef = doc(db, "Users", currentUser.uid);
            await updateDoc(userRef, {
                subscriptionStatus: status, // Update subscription status
                subscriptionUpdatedAt: new Date(), // Add a timestamp for the update
            });
            console.log('Subscription status updated to:', status);
        } catch (error) {
            console.error('Error updating subscription status:', error);
        }
    };

  
}
