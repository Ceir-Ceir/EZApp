// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    
    // React Router hooks
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);

            if (user) {
                // Set up subscription status listener
                const userRef = doc(db, 'Users', user.uid);
                const unsubscribeSubscription = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        console.log('Firebase document updated:', userData);
                        
                        setSubscriptionStatus(userData.subscriptionStatus);
                        
                        // Handle subscription status changes - only redirect if PAID subscription
                        if (userData.subscriptionStatus === 'active' && 
                            location.pathname === '/subscription-status') {
                            console.log('Navigating to main-app-forms due to active subscription');
                            try {
                                navigate('/main-app-forms');
                            } catch (error) {
                                console.error('Navigation error:', error);
                                // Fallback to direct navigation
                                window.location.href = '/main-app-forms';
                            }
                        }
                    }
                });

                // Cleanup subscription listener when auth state changes
                return () => unsubscribeSubscription();
            } else {
                setSubscriptionStatus(null);
            }
        });

        return unsubscribe;
    }, [navigate, location.pathname, subscriptionStatus]);

    const signup = async (email, password, priceId = null, provider = 'email') => {
        try {
            let userCredential;
            
            if (provider === 'google') {
                const googleProvider = new GoogleAuthProvider();
                userCredential = await signInWithPopup(auth, googleProvider);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;
            
            // Save user data to Firestore
            await setDoc(doc(db, 'Users', user.uid), {
                email: user.email,
                createdAt: new Date(),
                subscriptionStatus: 'inactive',
                profileComplete: false
            });

            // If a price ID was provided, create a subscription
            if (priceId) {
                try {
                    console.log('Creating checkout session with:', {
                        priceId,
                        userId: user.uid,
                        userEmail: user.email
                    });
                    
                    const apiUrl = process.env.REACT_APP_API_URL || 'https://us-central1-ezapp-91d8e.cloudfunctions.net/api';
                    console.log('Using API URL:', apiUrl);
                    
                    const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            priceId,
                            userId: user.uid,
                            userEmail: user.email
                        }),
                    });

                    const session = await response.json();
                    console.log('Received checkout session:', session);
                    
                    if (session.url) {
                        console.log('Redirecting to checkout URL:', session.url);
                        window.location.href = session.url;
                    } else {
                        throw new Error('Failed to create checkout session');
                    }
                } catch (error) {
                    console.error('Error creating subscription:', error);
                    // Don't throw here, as the user is already created
                }
            }

            return userCredential;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

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

    const value = {
        currentUser,
        subscriptionStatus,
        signup,
        login,
        logout,
        getUserSubscriptionStatus,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}