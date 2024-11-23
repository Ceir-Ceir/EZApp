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
        
        // Get user data for the checkout session
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error('User not found in Firestore.');
        }

        const userData = userSnap.data();
         // Create a Checkout Session directly using Stripe.js
         const { error } = await stripe.redirectToCheckout({
            mode: 'subscription',
            lineItems: [{ price: priceId, quantity: 1 }],
            customerEmail: userData.email,
            successUrl: `${window.location.origin}/subscription-status?status=success`,
            cancelUrl: `${window.location.origin}/subscription-status?status=cancelled`,
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
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return 'inactive';
        }

        const userData = userSnap.data();
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