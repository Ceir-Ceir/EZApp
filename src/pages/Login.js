// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate('/subscribe');
        }
    }, [currentUser, navigate]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        
        try {
            const provider = new GoogleAuthProvider();
            // Changed from signInWithRedirect to signInWithPopup
            const result = await signInWithPopup(auth, provider);
            navigate('/subscribe');
        } catch (error) {
            setError('Failed to log in with Google.');
            console.error('Google Login Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <img 
                        src="/images/logoez.png" 
                        alt="Logo" 
                        className="mx-auto h-32 w-auto"
                    />
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Continue with Google to access your account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <img src="./images/google_signin.png" alt="Google" className="w-6 h-6" />
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;