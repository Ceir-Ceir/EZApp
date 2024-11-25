// src/services/stripe.js
import { loadStripe } from '@stripe/stripe-js';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { STRIPE_PRICES } from '../config/stripe';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export async function createSubscription(userId, priceId) {
    try {
        const stripe = await stripePromise;

        // Validate Stripe object
        if (!stripe) {
            throw new Error('Stripe.js failed to initialize.');
        }

        // Get user data from Firestore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error('User not found in Firestore.');
        }

        const userData = userSnap.data();

        // Call your backend API to create a session
        const response = await fetch('http://localhost:4242/api/create-session-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                priceId,
                email: userData.email,
            }),
        });

        const { sessionId } = await response.json();

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId,
        });

        if (error) {
            throw new Error(error.message);
        }
        
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}

// Update the subscription status in Firestore
export async function handleSubscriptionStatusChange(userId, status) {
    if (!userId || typeof status !== 'string') {
        throw new Error('Invalid parameters for updating subscription status.');
    }
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscriptionStatus: status,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating subscription status:', error);
        throw error;
    }
}

// Check the user's subscription status from Firestore
export async function checkSubscriptionStatus(userId) {
    console.log("Checking subscription status for user: ", userId)
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        console.log("userSnap: ", userSnap);

        if (!userSnap.exists()) {
            return 'inactive';
        }

        const userData = userSnap.data();
        console.log("userData: ", userData);
        return userData.subscriptionStatus || 'inactive';
    } catch (error) {
        console.error('Error checking subscription status:', error.message);
        return 'inactive';
    }
}

// Helper function to validate subscription status
export function isSubscriptionActive(status) {
    return status === 'active' || status === 'trialing';
}

// Export the prices for easy access
export { STRIPE_PRICES };