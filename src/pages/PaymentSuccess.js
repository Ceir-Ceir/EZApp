// PaymentSuccess.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get('uid');

  useEffect(() => {
    // Show success message and prompt to return to app
    // You might want to add a button that links to your login page
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-6">Please return to the app and log in to access your account.</p>
        <a 
          href="/login" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Return to App
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;