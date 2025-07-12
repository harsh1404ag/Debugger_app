// src/App.tsx - Corrected
import { useState, useEffect } from 'react'; // Keep useState, useEffect might be used by useAuth or useUsageLimits
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // This import is correct
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthCallback from './components/AuthCallback'; // This import is correct if file exists
import { useAuth } from './hooks/useAuth'; // This import is correct if file exists
import { useUsageLimits } from './hooks/useUsageLimits'; // This import is correct if file exists

function App() {
  const { user, logout } = useAuth();
  const { messagesUsed, messagesLimit, lineLimit, resetTime, canSendMessage, incrementUsage, validateCodeLength } = useUsageLimits();

  const handleLogout = () => {
    logout();
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/app" /> : <LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app/*" element={user ? (
            <Dashboard
              onLogout={handleLogout}
              messagesUsed={messagesUsed}
              messagesLimit={messagesLimit}
              lineLimit={lineLimit} // Pass lineLimit
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
