// src/components/ui/Sidebar.tsx - Corrected
import React, { Dispatch, SetStateAction } from 'react';
// Import ONLY the icons you actually use in the Sidebar's JSX,
// or if they are passed in the 'items' array as components.
// Based on the example I provided, X and Settings are used directly.
import { X, Settings, MessageSquare, History, CreditCard } from 'lucide-react'; // Keep only used icons

// Define the interface for Sidebar's props
interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
    // items will contain the actual Lucide React components, not just strings
    items: { name: string; href: string; icon: React.ElementType; }[];
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, items, onLogout }) => {
    return (
        <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-64 bg-gray-800 text-white p-4 md:relative md:translate-x-0 md:flex md:flex-col`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">CodeReview AI</h2>
                <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-grow">
                <ul>
                    {items.map((item) => (
                        <li key={item.name} className="mb-2">
                            <a href={item.href} className="flex items-center p-2 rounded-md hover:bg-gray-700">
                                <item.icon className="h-5 w-5 mr-3" /> {/* Render icon component */}
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-700">
                <button onClick={onLogout} className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                    <Settings className="h-5 w-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
