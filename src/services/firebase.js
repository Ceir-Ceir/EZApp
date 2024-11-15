// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRLMSFD4cmO1N-z9OTHuNRlWjeaPyMSfQ",
  authDomain: "ezapp-91d8e.firebaseapp.com",
  projectId: "ezapp-91d8e",
  storageBucket: "ezapp-91d8e.appspot.com",
  messagingSenderId: "815195617363",
  appId: "1:815195617363:web:edf96aa0eca7d56a7aaea6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Log to verify initialization
console.log('Firebase initialized:', !!app);
console.log('Auth initialized:', !!auth);