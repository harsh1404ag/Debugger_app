// src/App.tsx (Example - adjust based on your actual code)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthCallback from './components/AuthCallback';
import { useAuth } from './hooks/useAuth'; // Assuming you have useAuth
import { useUsageLimits } from './hooks/useUsageLimits'; // Assuming you have useUsageLimits

function App() {
  const { user, logout } = useAuth(); // Assuming useAuth provides user and logout
  const { messagesUsed, messagesLimit, lineLimit, resetTime, canSendMessage, incrementUsage, validateCodeLength } = useUsageLimits();

  // Ensure handleLogout is used by passing it down
  const handleLogout = () => {
    logout(); // Call the logout function from useAuth
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/app" /> : <LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app/*" element={user ? (
            <Dashboard
              onLogout={handleLogout} // Pass handleLogout to Dashboard (or Sidebar within Dashboard)
              messagesUsed={messagesUsed}
              messagesLimit={messagesLimit}
              lineLimit={lineLimit}
              resetTime={resetTime}
              canSendMessage={canSendMessage}
              incrementUsage={incrementUsage}
              validateCodeLength={validateCodeLength}
            />
          ) : (
            <Navigate to="/" />
          )} />
          {/* Add routes for success/cancel pages if not already there */}
          <Route path="/success" element={<div>Payment Success!</div>} />
          <Route path="/cancel" element={<div>Payment Cancelled.</div>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
