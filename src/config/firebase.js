// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
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

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBRLMSFD4cmO1N-z9OTHuNRlWjeaPyMSfQ",
//   authDomain: "ezapp-91d8e.firebaseapp.com",
//   projectId: "ezapp-91d8e",
//   storageBucket: "ezapp-91d8e.firebasestorage.app",
//   messagingSenderId: "815195617363",
//   appId: "1:815195617363:web:edf96aa0eca7d56a7aaea6",
//   measurementId: "G-86382R5E5V"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

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