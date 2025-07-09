import { useState } from 'react';
import { motion } from 'framer-motion';
import { BGPattern } from './bg-pattern';
import { Code, Shield } from 'lucide-react';

interface GoogleAuthProps {
  onSuccess: (userData: any) => void;
}

export function GoogleAuth({ onSuccess }: GoogleAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth flow
    setTimeout(() => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://via.placeholder.com/40'
      };
      
      onSuccess(mockUser);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Same Background as Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary grid pattern */}
        <BGPattern 
          variant="grid" 
          mask="fade-edges" 
          size={40} 
          fill="rgba(139, 92, 246, 0.08)" 
          className="opacity-60"
        />
        
        {/* Secondary dots pattern */}
        <BGPattern 
          variant="dots" 
          mask="fade-center" 
          size={60} 
          fill="rgba(99, 102, 241, 0.06)" 
          className="opacity-40"
        />
        
        {/* Diagonal stripes for texture */}
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-y" 
          size={80} 
          fill="rgba(168, 85, 247, 0.03)" 
          className="opacity-30"
        />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/15 rounded-full filter blur-[96px] animate-pulse delay-1000" />
        
        {/* Geometric elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-violet-500/20 rounded-lg rotate-45 animate-pulse delay-500" />
        <div className="absolute bottom-40 left-20 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse delay-1500" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-lg rotate-12 animate-pulse delay-2000" />
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/4 left-1/6 w-8 h-8 bg-violet-400/30 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/6 w-6 h-6 bg-indigo-400/30 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to CodeReview AI</h1>
            <p className="text-gray-400">Sign in with Google to get started</p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
              Privacy Policy
            </a>
          </p>

          {/* Security Note */}
          <div className="flex items-center gap-2 mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
            <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              Your code is encrypted and never stored permanently
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}