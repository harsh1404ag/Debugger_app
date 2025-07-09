import { useState, useEffect } from 'react';

interface UsageLimits {
  messagesUsed: number;
  messagesLimit: number;
  linesPerMessage: number;
  resetTime: string;
  canSendMessage: boolean;
  timeUntilReset: string;
}

interface User {
  subscriptionStatus: 'free' | 'pro';
}

export function useUsageLimits(user: User | null): UsageLimits {
  const [usage, setUsage] = useState<UsageLimits>({
    messagesUsed: 0,
    messagesLimit: user?.subscriptionStatus === 'pro' ? 50 : 10,
    linesPerMessage: user?.subscriptionStatus === 'pro' ? 1000 : 250,
    resetTime: '',
    canSendMessage: true,
    timeUntilReset: ''
  });

  useEffect(() => {
    if (!user) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsage({
            messagesUsed: data.messagesUsed || 0,
            messagesLimit: user.subscriptionStatus === 'pro' ? 50 : 10,
            linesPerMessage: user.subscriptionStatus === 'pro' ? 1000 : 250,
            resetTime: data.resetTime || '',
            canSendMessage: data.messagesUsed < (user.subscriptionStatus === 'pro' ? 50 : 10),
            timeUntilReset: calculateTimeUntilReset(data.resetTime)
          });
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      }
    };

    fetchUsage();
    
    // Update every minute
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const calculateTimeUntilReset = (resetTime: string): string => {
    if (!resetTime) return '';
    
    const now = new Date();
    const reset = new Date(resetTime);
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resetting soon...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const incrementUsage = () => {
    setUsage(prev => ({
      ...prev,
      messagesUsed: prev.messagesUsed + 1,
      canSendMessage: prev.messagesUsed + 1 < prev.messagesLimit
    }));
  };

  const validateCodeLength = (code: string): { valid: boolean; message?: string } => {
    const lines = code.split('\n').length;
    if (lines > usage.linesPerMessage) {
      return {
        valid: false,
        message: `Code exceeds ${usage.linesPerMessage} line limit. Current: ${lines} lines.`
      };
    }
    return { valid: true };
  };

  return {
    ...usage,
    incrementUsage,
    validateCodeLength
  } as UsageLimits & {
    incrementUsage: () => void;
    validateCodeLength: (code: string) => { valid: boolean; message?: string };
  };
}