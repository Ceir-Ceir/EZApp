// src/services/stripe.js
import { loadStripe } from '@stripe/stripe-js';
import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { STRIPE_PRICES } from '../config/stripe';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export async function createSubscription(userId, priceId) {
    try {
        console.log('Creating subscription for user:', userId, 'with price:', priceId);
        
        const stripe = await stripePromise;
        const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://us-central1-ezapp-91d8e.cloudfunctions.net/api";
        // Validate Stripe object
        if (!stripe) {
            throw new Error('Stripe.js failed to initialize.');
        }

        // Get user data from Firestore
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error('User not found in Firestore.');
        }

        const userData = userSnap.data();
        console.log('User data retrieved:', userData);

        // Call your backend API to create a session
        const response = await fetch(`${apiUrl}/create-checkout-session`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Add authorization header if your backend requires it
                // 'Authorization': `Bearer ${await currentUser.getIdToken()}`
            },
            body: JSON.stringify({
                userId,
                priceId,
                userEmail: userData.email,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const session = await response.json();
        console.log('Checkout session created:', session);

        // Check if we got a URL directly (compatible with our backend)
        if (session.url) {
            window.location.href = session.url;
            return;
        }

        // Fallback to redirectToCheckout if we got a sessionId
        if (session.id) {
            const { error } = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (error) {
                console.error('Stripe redirect error:', error);
                throw new Error(error.message);
            }
        } else {
            throw new Error('No valid session response from server');
        }
        
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}

// Update the subscription status in Firestore
export const updateUserSubscriptionStatus = async (userId, status, planLevel) => {
    try {
        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
            subscriptionStatus: status,
            planLevel: planLevel,
            updatedAt: serverTimestamp(),
            // Add job automation fields if needed
            jobs_assigned_this_week: 0,
            weekly_job_limit: calculateWeeklyJobs(planLevel),
            last_job_application: null
        });
        console.log(`Updated subscription status for user ${userId} to ${status} with plan level ${planLevel}`);
    } catch (error) {
        console.error('Error updating subscription status:', error);
        throw error;
    }
};

// Helper function to calculate weekly jobs (should match backend)
function calculateWeeklyJobs(planLevel) {
    const monthlyLimits = {
        'basic': 100,
        'pro': 250,
        'enterprise': 500
    };
    
    const monthlyLimit = monthlyLimits[planLevel] || 0;
    return Math.floor(monthlyLimit / 4);
}

// Check the user's subscription status from Firestore
export async function checkSubscriptionStatus(userId) {
    try {
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return {
                status: 'inactive',
                planLevel: 'none'
            };
        }

        const userData = userSnap.data();
        return {
            status: userData.subscriptionStatus || 'inactive',
            planLevel: userData.planLevel || 'none',
            profileComplete: userData.profileComplete || false
        };
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return {
            status: 'inactive',
            planLevel: 'none',
            profileComplete: false
        };
    }
}

// Helper function to validate subscription status
export function isSubscriptionActive(status) {
    return status === 'active' || status === 'trialing';
}

// Export the prices for easy access
export { STRIPE_PRICES };