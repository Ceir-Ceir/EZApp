// src/app.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/SignupPage';
import MainAppScreen from './pages/MainApp'; // Correct relative path
import Subscribe from './pages/Subscribe';
import SubscriptionGuard from './components/SubscriptionGuard';
import ProtectedRoute from './components/ProtectedRoute';
import SubscriptionFlow from './components/SubFlow';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
            path="/main-app"
            element={
              //<ProtectedRoute>
                //<SubscriptionGuard>
                  <MainAppScreen/>
                //</SubscriptionGuard>
            //</ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;