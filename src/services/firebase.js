import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Comment this out

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRLMSFD4cmO1N-z9OTHuNRlWjeaPyMSfQ",
  authDomain: "ezapp-91d8e.firebaseapp.com",
  projectId: "ezapp-91d8e",
  storageBucket: "ezapp-91d8e.firebasestorage.app",
  messagingSenderId: "815195617363",
  appId: "1:815195617363:web:edf96aa0eca7d56a7aaea6",
  measurementId: "G-86382R5E5V"
};

// Initialize Firebase
console.log('Initializing Firebase...', firebaseConfig);
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');
const auth = getAuth(app);
console.log('Auth instance created successfully');
const db = getFirestore(app); // Comment this out

export { auth, db }; // Export only the services you need
