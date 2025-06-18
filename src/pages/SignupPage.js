// src/pages/signup.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, currentUser } = useAuth();

    // Redirect if already logged in
   useEffect(() => {
  if (currentUser) {
    console.log("[Step 1] Current user is present:", currentUser.uid);

    const subscriptionStatus = sessionStorage.getItem('subscriptionStatus');
    console.log("[Step 2] Retrieved subscriptionStatus from sessionStorage:", subscriptionStatus);

    if (subscriptionStatus === 'success') {
      console.log("[Step 3] Subscription status is 'success'. Clearing and redirecting...");

      sessionStorage.removeItem('subscriptionStatus');
      console.log("[Step 4] subscriptionStatus removed from sessionStorage");

      navigate('/subscription-status?status=success');
      console.log("[Step 5] Navigated to /subscription-status?status=success");
    } else {
      console.log("[Step 6] No successful subscription found. Redirecting to /subscribe...");
      navigate('/subscribe');
    }
  } else {
    console.log("[Step 0] No current user. Skipping subscription check.");
  }
}, [currentUser, navigate]);


    // Handle Email/Password Signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            
            // Get the stored price ID from session storage
            const priceId = sessionStorage.getItem('selectedPriceId');
            
            // Sign up the user with the price ID if it exists
            await signup(email, password, priceId);
            
            // Clear the stored price ID
            sessionStorage.removeItem('selectedPriceId');
            
            // Check if there's a pending subscription
            const subscriptionStatus = sessionStorage.getItem('subscriptionStatus');
            if (subscriptionStatus === 'success') {
                // Clear the stored status
                sessionStorage.removeItem('subscriptionStatus');
                // Navigate to subscription status to complete the process
                navigate('/subscription-status?status=success');
            } else {
                // Navigate to subscription status page
                navigate('/subscription-status');
            }
        } catch (error) {
            setError('Failed to create an account: ' + error.message);
        }
        setLoading(false);
    };

    // Handle Google Signup
    const handleGoogleSignup = async () => {
        try {
            setError('');
            setLoading(true);
            
            // Get the stored price ID from session storage
            const priceId = sessionStorage.getItem('selectedPriceId');
            
            // Sign up with Google
            await signup(null, null, priceId, 'google');
            
            // Clear the stored price ID
            sessionStorage.removeItem('selectedPriceId');
            
            // Check if there's a pending subscription
            const subscriptionStatus = sessionStorage.getItem('subscriptionStatus');
            if (subscriptionStatus === 'success') {
                // Clear the stored status
                sessionStorage.removeItem('subscriptionStatus');
                // Navigate to subscription status to complete the process
                navigate('/subscription-status?status=success');
            } else {
                // Navigate to subscription status page
                navigate('/subscription-status');
            }
        } catch (error) {
            setError('Failed to sign up with Google: ' + error.message);
        }
        setLoading(false);
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div>
                    <img 
                        src="/images/logoez.png" 
                        alt="Logo" 
                        className="mx-auto h-32 w-auto"
                    />
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>

                {/* OR Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Google Sign Up Button */}
                <div>
                    <button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <img
                            className="h-5 w-5 mr-2"
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google logo"
                        />
                        Sign up with Google
                    </button>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;