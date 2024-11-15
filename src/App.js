// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './pages/MainApp';
import Login from './pages/Login';
import Signup from './pages/SignupPage';  // Updated to match SignupPage.js
import Dashboard from './pages/Dashboard';
import Subscribe from './pages/Subscribe';  // Matches case of Subscribe.js
import SubscriptionGuard from './components/SubscriptionGuard';
import ProtectedRoute from './components/ProtectedRoute';
import SubscriptionFlow from './components/SubFlow';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription-flow"
            element={
              <ProtectedRoute>
                <SubscriptionFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <Dashboard />
                </SubscriptionGuard>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;