import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/SignupPage";
import Subscribe from "./pages/Subscribe";
import SubscriptionFlow from "./components/SubFlow";
import MainApp from "./pages/MainApp";
import DashboardView from "./pages/DashboardView";
import JobSearch from "./pages/JobSearch";
import MainAppForm from "./pages/MainAppForms";
import SubscriptionStatus from "./pages/SubscriptionStatus";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (commented out for now) */}
          <Route
            path="/subscribe"
            element={
              <Subscribe />
              // <ProtectedRoute>
              //   <Subscribe />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/subscription-flow"
            element={
              <SubscriptionFlow />
              // <ProtectedRoute>
              //   <SubscriptionFlow />
              // </ProtectedRoute>
            }
          />

          {/* Main App Pages */}
          <Route path="/main-app" element={<MainApp />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/job-search" element={<JobSearch />} />
          <Route path="/main-app-forms" element={<MainAppForm />} />
          <Route path="/subscribe-status" element={<SubscriptionStatus />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
// testing new modification. 