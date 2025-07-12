// src/pages/Dashboard.tsx (Example - adjust based on your actual code)
import React, { useState } from 'react';
import Sidebar from '../components/ui/Sidebar'; // Ensure correct path
import { MessageSquare, History, CreditCard, Settings } from 'lucide-react'; // Import icons used in items
import { useAuth } from '../hooks/useAuth'; // Assuming useAuth hook
import { useUsageLimits } from '../hooks/useUsageLimits'; // Assuming useUsageLimits hook

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth(); // Get logout from useAuth
    const { messagesUsed, messagesLimit, lineLimit, canSendMessage, incrementUsage, validateCodeLength } = useUsageLimits();

    const sidebarItems = [
        { name: 'Code Review', href: '/app', icon: MessageSquare },
        { name: 'History', href: '/app/history', icon: History },
        { name: 'Upgrade', href: '/app/upgrade', icon: CreditCard },
        { name: 'Settings', href: '/app/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout(); // Call the logout function from useAuth
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                items={sidebarItems}
                onLogout={handleLogout} // Pass onLogout here
            />
            {/* ... rest of your Dashboard JSX */}
        </div>
    );
};

export default Dashboard;
