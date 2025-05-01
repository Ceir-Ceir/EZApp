import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Login.js";
import Signup from "./pages/SignupPage.js";
import Subscribe from "./pages/Subscribe.js";
import SubFlow from "./components/SubFlow.js";
import MainApp from "./pages/MainApp.js";
import DashboardView from "./pages/DashboardView.js";
import JobSearch from "./pages/JobSearch.js";
import MainAppForm from "./pages/MainAppForms.js";
import SubscriptionStatus from "./pages/SubscriptionStatus.js";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Subscription Routes */}
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/subscription-flow" element={<SubFlow />} />
          <Route path="/main-app-forms" element={<MainAppForm />} />
          <Route path="/subscription-status" element={<SubscriptionStatus />} />

          {/* Main App with Nested Routes */}
          <Route path="/main-app" element={<MainApp />}>
            <Route index element={<MainAppForm />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="job-search" element={<JobSearch />} />
           
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
