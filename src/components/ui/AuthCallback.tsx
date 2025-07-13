// src/components/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleGoogleLogin } = useAuth(); // Assuming useAuth provides this function

  useEffect(() => {
    // This component handles the redirect from Google OAuth.
    // Google's new One Tap/Sign-in doesn't typically use a direct callback page
    // for the initial login flow as much as older methods.
    // However, if you're using a full redirect flow or need to process a token from the URL,
    // this is where you'd do it.

    // For Google One Tap/Sign-in, the token is usually handled by the
    // GoogleOAuthProvider and the callback function you provide to it.
    // This component might be more for a traditional OAuth redirect.

    // If this component is meant to process a URL parameter, you'd extract it here.
    // For example, if Google redirects with a 'code' or 'token' in the URL:
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // Or 'token', 'id_token', etc. depending on your OAuth flow

    if (code) {
      // Process the code/token
      console.log('Auth callback code received:', code);
      // You might call a backend endpoint here to exchange the code for your JWT
      // For Google One Tap, the JWT is often received directly in the client-side callback.
      // If handleGoogleLogin is designed to process this, call it.
      // handleGoogleLogin(code); // Example if handleGoogleLogin takes a code

      // After successful authentication, redirect to dashboard
      navigate('/app');
    } else {
      // If no code/token, or if it's just a placeholder, redirect to home or dashboard
      console.log('No auth code found in callback URL. Redirecting to dashboard.');
      navigate('/app');
    }

  }, [navigate, handleGoogleLogin]); // Add handleGoogleLogin to dependency array

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;

