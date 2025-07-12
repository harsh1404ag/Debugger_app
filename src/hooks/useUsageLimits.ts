// src/hooks/useUsageLimits.ts
import { useState, useEffect } from 'react';

interface UsageLimits {
    messagesUsed: number;
    messagesLimit: number;
    lineLimit: number;
    linesPerMessage: number;
    resetTime: string;
    canSendMessage: boolean;
    timeUntilReset: string;
    incrementUsage: () => void;
    validateCodeLength: (code: string) => { valid: boolean; message?: string };
}

interface User {
    subscriptionStatus: 'free' | 'pro';
}

export function useUsageLimits(user: User | null): UsageLimits {
    const PRO_MESSAGE_LIMIT = 5000;
    const FREE_MESSAGE_LIMIT = 10;
    const PRO_LINE_LIMIT = 2500;
    const FREE_LINE_LIMIT = 250;

    const currentMessagesLimit = user?.subscriptionStatus === 'pro' ? PRO_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT;
    const currentLinesPerMessage = user?.subscriptionStatus === 'pro' ? PRO_LINE_LIMIT : FREE_LINE_LIMIT;

    const [usage, setUsage] = useState<UsageLimits>({
        messagesUsed: 0,
        messagesLimit: currentMessagesLimit,
        linesPerMessage: currentLinesPerMessage,
        resetTime: '',
        canSendMessage: true,
        timeUntilReset: '',
        incrementUsage: () => {},
        validateCodeLength: () => ({ valid: true })
    });

    const incrementUsage = () => {
        setUsage(prev => {
            const newMessagesUsed = prev.messagesUsed + 1;
            return {
                ...prev,
                messagesUsed: newMessagesUsed,
                canSendMessage: newMessagesUsed < prev.messagesLimit
            };
        });
    };

    const validateCodeLength = (code: string) => {
        const lines = code.split('\n').length;
        if (lines > usage.linesPerMessage) {
            return {
                valid: false,
                message: `Code exceeds ${usage.linesPerMessage} line limit. Current: ${lines} lines.`
            };
        }
        return { valid: true };
    };

    // ⛔️ Temporarily skip backend fetch if not implemented yet
    useEffect(() => {
        // If API is present later, uncomment this logic
        /*
        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/usage', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsage(prev => ({
                        ...prev,
                        messagesUsed: data.messagesUsed || 0,
                        resetTime: data.resetTime || '',
                        canSendMessage: (data.messagesUsed || 0) < currentMessagesLimit,
                        timeUntilReset: calculateTimeUntilReset(data.resetTime),
                    }));
                } else {
                    console.error('Failed to fetch usage: ', response.statusText);
                }
            } catch (err) {
                console.error('Error fetching usage:', err);
            }
        };
        fetchUsage();
        */
    }, [user]);

    return {
        ...usage,
        incrementUsage,
        validateCodeLength
    };
}
