import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';

console.log('Environment Variables:', process.env);

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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

// Initialize Storage with explicit app parameter
const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
console.log('Storage instance created successfully');

// Export the services
export { auth, db, storage, app };