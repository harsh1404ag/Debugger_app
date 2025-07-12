import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GoogleAuth } from './components/ui/google-auth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear token and navigate to landing page
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen w-full bg-black">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/app" 
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <GoogleAuth onSuccess={handleAuthSuccess} />
              )
            } 
          />
          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
