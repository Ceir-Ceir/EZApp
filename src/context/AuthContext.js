// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { createSubscription } from '../services/stripe';

export const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, priceId) {
        try {
            // Step 1: Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const userId = userCredential.user.uid;
            console.log("User created with UID: ", userId);

            // Step 2: Save user information in Firestore with 'inactive' subscription status
            await setDoc(doc(db, 'Users', userId), {
                email,
                createdAt: new Date().toISOString(),
                subscriptionStatus: 'inactive'
            });

            // Step 3: Create a Stripe subscription for the user
            await createSubscription(userId, priceId);

            // Redirect to a waiting page while payment is being processed
            return userCredential.user;
        } catch (error) {
            const errorMessage = error.code === 'auth/email-already-in-use'
                ? 'This email is already in use. Please log in or reset your password.'
                : 'Signup failed. Please try again.';
            console.error(error.message);
            throw new Error(errorMessage);
        }
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    async function getUserSubscriptionStatus(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'Users', userId));
            if (userDoc.exists()) {
                return userDoc.data().subscriptionStatus;
            }
            return 'inactive';
        } catch (error) {
            console.error('Error getting subscription status:', error);
            return 'inactive';
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {

            console.log("Setting up onAuthStateChanged listener...");
            if (user) {
                
                console.log("User data:", user.uid); 
              const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
              setCurrentUser({ ...user, subscriptionStatus });
            } else {
            console.log("No user is signed in.");
              setCurrentUser(null);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
          } finally {
            setLoading(false);
          }
        });
      
        return () => unsubscribe();
      }, []);
      

    const value = {
        currentUser,
        signup,
        login,
        logout,
        getUserSubscriptionStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}