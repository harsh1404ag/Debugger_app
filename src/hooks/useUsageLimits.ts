// src/hooks/useUsageLimits.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth'; // Example: if useAuth.ts is in the same folder

interface UsageLimits {
    messagesUsed: number;
    messagesLimit: number;
    lineLimit: number; // Added this line
    resetTime: string;
    canSendMessage: boolean;
    timeUntilReset: string;
    incrementUsage: () => void;
    validateCodeLength: (code: string) => { isValid: boolean; message: string };
}

export const useUsageLimits = (): UsageLimits => {
    const { user } = useAuth();
    const [usage, setUsage] = useState<Omit<UsageLimits, 'incrementUsage' | 'validateCodeLength'>>({
        messagesUsed: 0,
        messagesLimit: 10, // Default for free tier
        lineLimit: 250,    // Default for free tier
        resetTime: '',
        canSendMessage: false,
        timeUntilReset: ''
    });

    const fetchUsage = useCallback(async () => {
        if (!user) {
            // If no user, set default free limits
            setUsage(prev => ({
                ...prev,
                messagesUsed: 0,
                messagesLimit: 10,
                lineLimit: 250,
                canSendMessage: true, // Allow sending if no user (e.g. for initial demo)
                resetTime: '',
                timeUntilReset: ''
            }));
            return;
        }

        try {
            const token = await user.getIdToken();
            const response = await axios.get('/api/usage', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data;

            const currentMessagesLimit = data.messageLimit || 10;
            const currentLinesPerMessage = data.lineLimit || 250;

            setUsage({
                messagesUsed: data.messagesUsed || 0,
                messagesLimit: currentMessagesLimit,
                lineLimit: currentLinesPerMessage, // Set lineLimit from fetched data
                resetTime: data.resetTime || '',
                canSendMessage: (data.messagesUsed || 0) < currentMessagesLimit,
                timeUntilReset: calculateTimeUntilReset(data.resetTime),
            });
        } catch (error) {
            console.error('Failed to fetch usage limits:', error);
            // Fallback to default free limits on error
            setUsage(prev => ({
                ...prev,
                messagesUsed: 0,
                messagesLimit: 10,
                lineLimit: 250,
                canSendMessage: true,
                resetTime: '',
                timeUntilReset: ''
            }));
        }
    }, [user]);

    useEffect(() => {
        fetchUsage();
        const interval = setInterval(fetchUsage, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchUsage]);

    const incrementUsage = useCallback(() => {
        setUsage(prev => {
            const newMessagesUsed = prev.messagesUsed + 1;
            const newCanSendMessage = newMessagesUsed < prev.messagesLimit;
            return {
                ...prev,
                messagesUsed: newMessagesUsed,
                canSendMessage: newCanSendMessage
            };
        });
    }, []);

    const validateCodeLength = useCallback((code: string) => {
        const lines = code.split('\n').length;
        if (lines > usage.lineLimit) {
            return { isValid: false, message: `Code exceeds ${usage.lineLimit} lines. Please shorten your code or upgrade to Pro.` };
        }
        return { isValid: true, message: '' };
    }, [usage.lineLimit]);

    const calculateTimeUntilReset = (resetTime: string) => {
        if (!resetTime) return '';
        const resetDate = new Date(resetTime);
        const now = new Date();
        const diffMs = resetDate.getTime() - now.getTime();

        if (diffMs <= 0) return 'Resetting soon';

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        let timeString = '';
        if (diffHours > 0) timeString += `${diffHours}h `;
        if (diffMinutes > 0) timeString += `${diffMinutes}m `;
        timeString += `${diffSeconds}s`;

        return `Resets in ${timeString.trim()}`;
    };

    return { ...usage, incrementUsage, validateCodeLength };
};