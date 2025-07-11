import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';
import { FeedbackForm } from '../components/ui/feedback-form';
import { UsageIndicator } from '../components/ui/usage-indicator';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { 
  Code, 
  History, 
  Crown, 
  Settings, 
  LogOut, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  Menu,
  X,
  CreditCard,
  MessageSquare,
  HelpCircle
} 
from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState('review');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [userState] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    subscriptionStatus: 'free' as 'free' | 'pro'
  });

  const usageLimits = useUsageLimits(userState);

  const [reviewHistory] = useState([
    {
      id: 1,
      title: 'React Component Optimization',
      language: 'JavaScript',
      date: '2024-01-15',
      status: 'completed',
      linesOfCode: 150
    },
    {
      id: 2,
      title: 'Python API Security Review',
      language: 'Python',
      date: '2024-01-14',
      status: 'completed',
      linesOfCode: 280
    },
    {
      id: 3,
      title: 'Database Query Optimization',
      language: 'SQL',
      date: '2024-01-13',
      status: 'completed',
      linesOfCode: 45
    }
  ]);

  const sidebarItems = [
    { id: 'review', icon: <Code className="w-5 h-5" />, label: 'New Review' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'Review History' },
    { id: 'upgrade', icon: <Crown className="w-5 h-5" />, label: 'Upgrade to Pro' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { id: 'help', icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Feedback' },
  ];

  const handleUpgradeClick = () => {
    window.open('https://buy.stripe.com/test_pro_plan_15_monthly', '_blank');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'review':
        return (
          <div className="h-full w-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">Code Review</h1>
                <UsageIndicator
                  messagesUsed={usageLimits.messagesUsed}
                  messagesLimit={usageLimits.messagesLimit}
                  timeUntilReset={usageLimits.timeUntilReset}
                  subscriptionStatus={userState.subscriptionStatus}
                  onUpgrade={() => setActiveView('upgrade')}
                />
              </div>
            </div>
            <AnimatedAIChat 
              usageLimits={usageLimits}
              subscriptionStatus={userState.subscriptionStatus}
            />
          </div>
        );
      // ...rest of renderContent blocks remain unchanged (history, upgrade, help, settings)
    }
  };

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      {/* Background effects, Sidebar, Main layout, FeedbackForm remain unchanged */}
      {renderContent()}
    </div>
  );
}
