import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

console.log('Environment Variables:', process.env);

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
console.log('Initializing Firebase...', firebaseConfig);
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');

// Initialize Firebase Auth
const auth = getAuth(app);
console.log('Auth instance created successfully');

// Initialize Firestore
const db = getFirestore(app);
console.log('Firestore instance created successfully');

/**
 * Fetches preferences for all active users with available quotas.
 * @returns {Promise<Array>} List of user preferences with subscription level and quotas.
 */
async function getUserPreferences() {
  try {
    const usersQuery = query(
      collection(db, 'Users'),
      where('subscriptionStatus', '==', 'active'),
      where('quotaRemaining', '>', 0)
    );

    const querySnapshot = await getDocs(usersQuery);
    const preferences = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));

    console.log('Fetched user preferences:', preferences);
    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return [];
  }
}

/**
 * Updates the subscription level for a specific user in Firestore.
 * @param {string} userId - The ID of the user.
 * @param {string} planId - The Stripe plan ID (e.g., 'prod_RCDntr8o33k5Y4').
 * @returns {Promise<void>} Promise resolving when the subscription level is updated.
 */
async function updateSubscriptionLevel(userId, planId) {
  const PLAN_TO_LEVEL = {
    'prod_RDJYaEEgMIyPqF': 'basic',  // Basic Plan
    'prod_RDJYTicEOJVQZQ': 'premium', // Premium Plan
    'prod_RDJYLWEbkLpU1S': 'pro', 
  };

  const subscriptionLevel = PLAN_TO_LEVEL[planId] || 'basic'; // Default to 'basic'

  try {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, { subscriptionLevel });
    console.log(`Subscription level updated for user ${userId} to ${subscriptionLevel}`);
  } catch (error) {
    console.error(`Error updating subscription level for user ${userId}:`, error);
  }
}

export { auth, db, getUserPreferences, updateSubscriptionLevel };