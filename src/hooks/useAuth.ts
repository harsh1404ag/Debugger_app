// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

// Define a type for your user object
interface User {
  userId: string; // Or number, depending on your backend's user ID type
  email: string;
  name: string;
  subscriptionStatus: string;
  messagesUsed: number;
  // Add any other user properties you expect from your backend
  getIdToken: () => Promise<string>; // Function to get the latest ID token
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  handleGoogleLogin: (credential: string) => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to decode JWT and set user state
  const decodeAndSetUser = useCallback((token: string) => {
    try {
      const decoded: any = jwtDecode(token); // Decode the JWT
      const expiry = decoded.exp * 1000; // Convert expiry to milliseconds
      if (expiry < Date.now()) {
        console.warn('JWT token expired.');
        localStorage.removeItem('jwtToken');
        setUser(null);
        return;
      }

      // Create a user object that includes a method to get the ID token
      // For Google OAuth, the ID token is the JWT itself.
      const currentUser: User = {
        userId: decoded.userId, // Ensure this matches your JWT payload
        email: decoded.email,
        name: decoded.name || decoded.email, // Fallback for name if not in token
        subscriptionStatus: decoded.subscriptionStatus || 'free', // Default or from token
        messagesUsed: decoded.messagesUsed || 0, // Default or from token
        getIdToken: async () => token, // Simply return the stored token
      };
      setUser(currentUser);
      localStorage.setItem('jwtToken', token); // Store token in local storage
    } catch (error) {
      console.error('Failed to decode or process JWT:', error);
      localStorage.removeItem('jwtToken');
      setUser(null);
    }
  }, []);

  // Login function
  const login = useCallback(async (token: string) => {
    setLoading(true);
    decodeAndSetUser(token);
    setLoading(false);
  }, [decodeAndSetUser]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    // Optionally redirect to login page
    window.location.href = '/'; // Redirect to landing page
  }, []);

  // Handle Google Login (sends credential to backend)
  const handleGoogleLogin = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        token: credential // Google ID token
      });
      const { token, user: userData } = response.data;
      if (token && userData) {
        // Backend returns its own JWT and user data
        decodeAndSetUser(token); // Store backend's JWT
        setUser(prev => ({ ...prev!, ...userData })); // Update user with backend data
      }
    } catch (error) {
      console.error('Google login failed:', error);
      logout(); // Log out on failure
    } finally {
      setLoading(false);
    }
  }, [decodeAndSetUser, logout]);

  // Effect to check for existing token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      decodeAndSetUser(storedToken);
    }
    setLoading(false);
  }, [decodeAndSetUser]);

  return { user, loading, login, logout, handleGoogleLogin };
};

