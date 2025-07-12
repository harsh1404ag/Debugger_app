// src/pages/Dashboard.tsx - Corrected
import React, { useState } from 'react';
import Sidebar from '../components/ui/Sidebar';
import { MessageSquare, History, CreditCard, Settings } from 'lucide-react'; // Ensure these are imported if used in sidebarItems
import { useAuth } from '../hooks/useAuth'; // Ensure this path is correct
import { useUsageLimits } from '../hooks/useUsageLimits'; // Ensure this path is correct

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    // Destructure all usage limit properties, even if not directly used in Dashboard's JSX,
    // as they are passed down to other components like the main chat area.
    const { messagesUsed, messagesLimit, lineLimit, canSendMessage, incrementUsage, validateCodeLength } = useUsageLimits();

    const sidebarItems = [
        { name: 'Code Review', href: '/app', icon: MessageSquare },
        { name: 'History', href: '/app/history', icon: History },
        { name: 'Upgrade', href: '/app/upgrade', icon: CreditCard },
        { name: 'Settings', href: '/app/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                items={sidebarItems}
                onLogout={handleLogout}
            />
            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header/Mobile Toggle */}
                <header className="flex items-center justify-between p-4 bg-gray-800 md:hidden">
                    <button onClick={() => setSidebarOpen(true)}>
                        <MessageSquare className="h-6 w-6 text-white" /> {/* Example icon */}
                    </button>
                    <h1 className="text-xl font-bold">Code Review</h1>
                    <span>{messagesUsed}/{messagesLimit} messages</span>
                </header>

                {/* Chat/Review Area - This is where you'd pass the usage props */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* You would have your main chat component here,
                        and pass the usage limits and functions to it.
                        Example: <CodeReviewChat
                            messagesUsed={messagesUsed}
                            messagesLimit={messagesLimit}
                            lineLimit={lineLimit}
                            canSendMessage={canSendMessage}
                            incrementUsage={incrementUsage}
                            validateCodeLength={validateCodeLength}
                        />
                    */}
                    <div className="max-w-3xl mx-auto">
                        {/* Placeholder for actual chat/review UI */}
                        <h2 className="text-center text-3xl font-bold mb-8">How can I help review your code today?</h2>
                        <div className="bg-gray-800 rounded-lg p-6 mb-4">
                            <textarea
                                className="w-full h-32 bg-gray-700 text-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Paste your code or use a command to get started"
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
                                    disabled={!canSendMessage} // Disable send button if limit reached
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                        {/* Placeholder for AI response */}
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
