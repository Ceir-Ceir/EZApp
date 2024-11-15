// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";  // Only if you need Analytics

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Analytics (optional)
export const auth = getAuth(app);
export const analytics = getAnalytics(app); // Only export this if you're using Analytics
