// src/components/SubscriptionGuard.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubscriptionGuard = ({ children }) => {
    const { currentUser } = useAuth();

    // Check if user is authenticated
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Check subscription status
    if (currentUser.subscriptionStatus !== 'active') {
        return <Navigate to="/subscribe" />;
    }

    return children;
};

export default SubscriptionGuard;