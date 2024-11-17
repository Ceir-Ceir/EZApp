// src/App.js
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Try with explicit .js extensions
import MainApp from './pages/MainApp.js';
import Login from './pages/Login.js';
import Signup from './pages/SignupPage.js';
import Dashboard from './pages/Dashboard.js';
import Subscribe from './pages/Subscribe.js';
import SubscriptionGuard from './components/SubscriptionGuard.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import SubscriptionFlow from './components/SubFlow.js';
import { AuthProvider } from './context/AuthContext.js';

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