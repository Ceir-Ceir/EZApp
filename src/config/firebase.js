// src/config/firebase.js
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';

// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// export const auth = getAuth(app);
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user document in Firestore
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().subscriptionStatus;
    }
    return 'inactive';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const subscriptionStatus = await getUserSubscriptionStatus(user.uid);
        setCurrentUser({ ...user, subscriptionStatus });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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