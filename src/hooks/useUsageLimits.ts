// src/hooks/useUsageLimits.ts
import { useState, useEffect } from 'react';

// Define the UsageLimits interface to include all properties returned by the hook
interface UsageLimits {
    messagesUsed: number;
    messagesLimit: number; // Corrected to match backend limits
    linesPerMessage: number; // Corrected to match backend limits
    resetTime: string;
    canSendMessage: boolean;
    timeUntilReset: string;
    // Added the missing properties that the Dashboard/AnimatedAIChat components expect
    incrementUsage: () => void;
    validateCodeLength: (code: string) => { valid: boolean; message?: string };
}

interface User {
    subscriptionStatus: 'free' | 'pro';
}

export function useUsageLimits(user: User | null): UsageLimits {
    // Define the limits based on subscription status
    const PRO_MESSAGE_LIMIT = 5000; // Matches backend
    const FREE_MESSAGE_LIMIT = 10;  // Matches backend
    const PRO_LINE_LIMIT = 2500;    // Matches backend
    const FREE_LINE_LIMIT = 250;    // Matches backend

    const [usage, setUsage] = useState<UsageLimits>({
        messagesUsed: 0,
        messagesLimit: user?.subscriptionStatus === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT,
        linesPerMessage: user?.subscriptionStatus === 'pro' ? PRO_LINE_LIMIT : FREE_LINE_LIMIT,
        resetTime: '',
        canSendMessage: true, // Will be updated by fetchUsage
        timeUntilReset: '',
        incrementUsage: () => { /* no-op, actual logic below */ },
        validateCodeLength: () => ({ valid: true }) // no-op, actual logic below
    });

    // Function to calculate time until reset for display
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

    // Function to increment usage count (called by frontend before sending message)
    const incrementUsage = () => {
        setUsage(prev => ({
            ...prev,
            messagesUsed: prev.messagesUsed + 1,
            // Re-evaluate canSendMessage based on new count
            canSendMessage: prev.messagesUsed + 1 < prev.messagesLimit
        }));
    };

    // Function to validate code length (called by frontend before sending message)
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

    // Effect to fetch usage data from backend
    useEffect(() => {
        if (!user) return; // Only fetch if user is logged in

        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/usage', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const currentMessagesLimit = user.subscriptionStatus === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT;
                    const currentLinesPerMessage = user.subscriptionStatus === 'pro' ? PRO_LINE_LIMIT : FREE_LINE_LIMIT;

                    setUsage({
                        messagesUsed: data.messagesUsed || 0,
                        messagesLimit: currentMessagesLimit,
                        linesPerMessage: currentLinesPerMessage,
                        resetTime: data.resetTime || '',
                        canSendMessage: (data.messagesUsed || 0) < currentMessagesLimit, // Ensure canSendMessage is accurate
                        timeUntilReset: calculateTimeUntilReset(data.resetTime),
                        incrementUsage: incrementUsage, // Assign the function
                        validateCodeLength: validateCodeLength // Assign the function
                    });
                } else {
                    console.error('Failed to fetch usage: ', response.status, response.statusText);
                    // Potentially set canSendMessage to false or show an error state
                    setUsage(prev => ({ ...prev, canSendMessage: false }));
                }
            } catch (error) {
                console.error('Failed to fetch usage:', error);
                setUsage(prev => ({ ...prev, canSendMessage: false }));
            }
        };

        fetchUsage(); // Fetch immediately on mount or user change

        // Update every minute (60 seconds)
        const interval = setInterval(fetchUsage, 60 * 1000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [user, PRO_MESSAGE_LIMIT, FREE_MESSAGE_LIMIT, PRO_LINE_LIMIT, FREE_LINE_LIMIT]); // Dependencies for useEffect

    // Return the usage state along with the functions
    return {
        ...usage,
        incrementUsage,
        validateCodeLength
    };
}