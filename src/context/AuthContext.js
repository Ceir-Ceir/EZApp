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

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email,
                createdAt: new Date().toISOString(),
                subscriptionStatus: 'inactive'
            });
            return userCredential.user;
        } catch (error) {
            throw error;
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
            const userDoc = await getDoc(doc(db, 'users', userId));
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
        try {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
                    setCurrentUser({ ...user, subscriptionStatus });
                } else {
                    setCurrentUser(null);
                }
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Auth state change error:', error);
            setLoading(false);
        }
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