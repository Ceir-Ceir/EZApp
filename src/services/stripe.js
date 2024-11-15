// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { STRIPE_PRICES } from '../config/stripe';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export async function createSubscription(userId, priceId) {
    try {
        const stripe = await stripePromise;
        
        // Get user data for the checkout session
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        // Create a new checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                priceId,
                email: userData.email,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const session = await response.json();
        
        // If sessionId is a URL (new Stripe behavior), redirect directly
        if (session.sessionId.startsWith('http')) {
            window.location.href = session.sessionId;
            return;
        }

        // Otherwise, use redirectToCheckout
        const result = await stripe.redirectToCheckout({
            sessionId: session.sessionId
        });

        if (result?.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}

export async function handleSubscriptionStatusChange(userId, status) {
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
        console.error('Error checking subscription status:', error);
        return 'inactive';
    }
}

// Helper function to validate subscription status
export function isSubscriptionActive(status) {
    return status === 'active' || status === 'trialing';
}

// Export the prices for easy access
export { STRIPE_PRICES };