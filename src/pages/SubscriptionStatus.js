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

                if (!status) {
                    alert('Missing subscription status. Redirecting to subscription page.');
                    navigate('/subscribe');
                    return;
                }

                if (status === 'success') {
                    await updateSubscriptionStatus('active');
                    navigate('/main-app-forms'); // Navigate to the main app
                } else if (status === 'cancelled') {
                    alert('Subscription cancelled. You can try again.');
                    navigate('/subscribe');
                } else {
                    alert('Invalid subscription status. Please contact support.');
                    navigate('/subscribe');
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

            const userRef = doc(db, "Users", currentUser.uid);
            await updateDoc(userRef, {
                subscriptionStatus: status,
                subscriptionUpdatedAt: new Date().toISOString(), // ISO timestamp for consistency
            });
            console.log('Subscription status updated to:', status);
        } catch (error) {
            console.error('Error updating subscription status:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Simple loader component
    }

    return null; // Render nothing once the validation is done
}
