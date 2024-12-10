import { loadStripe } from '@stripe/stripe-js';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { STRIPE_PRICES } from '../config/stripe';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Helper to map Stripe plan IDs to subscription levels
const PLAN_TO_LEVEL = {
    'prod_RDJYaEEgMIyPqF': 100, // Basic Plan
    'prod_RDJYTicEOJVQZQ': 250, // Premium Plan
    'prod_RDJYLWEbkLpU1S': 500, // Deluxe Plan
};


/**
 * Fetches the subscription level for a given Stripe customer ID.
 * @param {string} stripeCustomerId - The Stripe customer ID.
 * @returns {Promise<number>} The subscription level (e.g., 100, 250, 500).
 */

async function getSubscriptionLevel(stripeCustomerId) {
    try {
        const response = await fetch(`https://api.stripe.com/v1/subscriptions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await response.json();
        console.log('Stripe Subscription Data:', data);

        if (data.error) {
            throw new Error(data.error.message);
        }

        const activeSubscription = data.data.find(
            (sub) => sub.customer === stripeCustomerId && sub.status === 'active'
        );

        if (!activeSubscription) {
            console.log('No active subscription found.');
            return 100; // Default to the lowest subscription level
        }

        const productId = activeSubscription.items.data[0].plan.product;
        console.log(`Matched Product ID: ${productId}`);
        return PLAN_TO_LEVEL[productId] || 100; // Map product ID to subscription level
    } catch (error) {
        console.error('Error fetching subscription level:', error);
        return 100; // Default to the lowest subscription level on error
    }
}



/**
 * Creates a subscription for a user.
 * @param {string} userId - The user ID.
 * @param {string} priceId - The Stripe price ID.
 */
export async function createSubscription(userId, priceId) {
    try {
        const stripe = await stripePromise;

        if (!stripe) {
            throw new Error('Stripe.js failed to initialize.');
        }

        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error('User not found in Firestore.');
        }

        const userData = userSnap.data();

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

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
            throw new Error(error.message);
        }
        
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}

/**
 * Handles subscription status changes by updating Firestore with the new status and level.
 * @param {string} userId - The user ID.
 * @param {string} stripeCustomerId - The Stripe customer ID.
 * @param {string} status - The new subscription status.
 */
export async function handleSubscriptionStatusChange(userId, stripeCustomerId, status) {
    try {
        const subscriptionLevel = await getSubscriptionLevel(stripeCustomerId);

        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
            subscriptionStatus: status,
            subscriptionLevel: subscriptionLevel,
            updatedAt: new Date().toISOString(),
        });

        console.log(`Updated user ${userId} with subscriptionStatus: ${status}, subscriptionLevel: ${subscriptionLevel}`);
    } catch (error) {
        console.error('Error updating subscription status and level:', error);
        throw error;
    }
}

/**
 * Checks a user's subscription status and level from Firestore.
 * @param {string} userId - The user ID.
 * @returns {Promise<{status: string, level: number}>} The subscription status and level.
 */
export async function checkSubscriptionStatus(userId) {
    try {
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { status: 'inactive', level: 100 };
        }

        const userData = userSnap.data();
        return {
            status: userData.subscriptionStatus || 'inactive',
            level: userData.subscriptionLevel || 100,
        };
    } catch (error) {
        console.error('Error checking subscription status:', error.message);
        return { status: 'inactive', level: 100 };
    }
}

/**
 * Validates whether a subscription is active.
 * @param {string} status - The subscription status.
 * @returns {boolean} Whether the subscription is active.
 */
export function isSubscriptionActive(status) {
    return status === 'active' || status === 'trialing';
}

// Export the prices for easy access
export { STRIPE_PRICES };
