    import { useState, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { GoogleOAuthProvider } from '@react-oauth/google';
    import LandingPage from './pages/LandingPage';
    import Dashboard from './pages/Dashboard';
    import AuthCallback from './components/ui/AuthCallback';
    import { useAuth } from './hooks/useAuth';
    import { useUsageLimits } from './hooks/useUsageLimits';

    // Define the Google Client ID here, ensuring it's picked up
    // This needs to be outside the component for Vite to properly inject it
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    function App() {
      const { user, loading, logout } = useAuth();
      const { messagesUsed, messageLimit, lineLimit, resetTime, canSendMessage, incrementUsage, validateCodeLength } = useUsageLimits();

      const handleLogout = () => {
        logout();
      };

      // Show loading indicator or handle initial auth state
      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <p>Loading application...</p>
          </div>
        );
      }

      return (
        // Ensure GOOGLE_CLIENT_ID is not undefined or empty
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
          <Router>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={user ? <Navigate to="/app" /> : <LandingPage />} />

              {/* Auth Callback Page (if needed for specific OAuth flows) */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Dashboard (Protected Route) */}
              <Route
                path="/app"
                element={
                  user ? (
                    <Dashboard
                      onLogout={handleLogout}
                      messagesUsed={messagesUsed}
                      messageLimit={messageLimit}
                      lineLimit={lineLimit}
                      resetTime={resetTime}
                      canSendMessage={canSendMessage}
                      incrementUsage={incrementUsage}
                      validateCodeLength={validateCodeLength}
                    />
                  ) : (
                    <Navigate to="/" /> // Redirect to landing if not authenticated
                  )
                }
              />
              {/* Add other routes as needed */}
            </Routes>
          </Router>
        </GoogleOAuthProvider>
      );
    }

    export default App;
    