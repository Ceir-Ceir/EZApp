// src/components/SubscriptionGuard.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated import path

const SubscriptionGuard = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (currentUser.subscriptionStatus !== 'active') {
        return <Navigate to="/subscribe" />;
    }

    return children;
};

export default SubscriptionGuard;