// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from '../components/ui/Sidebar';
import { MessageSquare, History, CreditCard, Settings, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsageLimits } from '../hooks/useUsageLimits';

interface DashboardProps {
    onLogout: () => void;
    messagesUsed: number;
    messagesLimit: number;
    lineLimit: number;
    resetTime: string;
    canSendMessage: boolean;
    incrementUsage: () => void;
    validateCodeLength: (code: string) => { isValid: boolean; message: string };
}

const Dashboard: React.FC<DashboardProps> = ({
    onLogout,
    messagesUsed,
    messagesLimit,
    lineLimit,
    resetTime,
    canSendMessage,
    incrementUsage,
    validateCodeLength
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarItems = [
        { name: 'Code Review', href: '/app', icon: MessageSquare },
        { name: 'History', href: '/app/history', icon: History },
        { name: 'Upgrade', href: '/app/upgrade', icon: CreditCard },
        { name: 'Settings', href: '/app/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                items={sidebarItems}
                onLogout={onLogout}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-gray-800 md:hidden">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold">Code Review</h1>
                    <span>{messagesUsed}/{messagesLimit} messages</span>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-center text-3xl font-bold mb-8">How can I help review your code today?</h2>
                        <div className="bg-gray-800 rounded-lg p-6 mb-4">
                            <textarea
                                className="w-full h-32 bg-gray-700 text-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Paste your code (max ${lineLimit} lines) or use a command to get started`}
                            ></textarea>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-gray-400">
                                    {messagesUsed}/{messagesLimit} messages
                                    {messagesUsed >= messagesLimit && (
                                        <span className="text-red-400 ml-2">Daily limit reached. Upgrade to Pro for more messages.</span>
                                    )}
                                </span>
                                <button
                                    className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!canSendMessage}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">AI Review:</h3>
                            <p className="text-gray-300">Your review will appear here.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;