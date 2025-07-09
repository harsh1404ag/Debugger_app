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
    // TODO: Implement Stripe checkout for $15/month Pro plan
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

      case 'history':
        return (
          <div className="space-y-6 w-full">
            <h1 className="text-2xl font-bold text-white">Review History</h1>
            
            <div className="space-y-4">
              {reviewHistory.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-violet-400" />
                        <h3 className="font-semibold text-white">{review.title}</h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {review.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {review.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Code className="w-4 h-4" />
                          {review.linesOfCode} lines
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-green-300">Completed</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'upgrade':
        return (
          <div className="space-y-6 w-full">
            <h1 className="text-2xl font-bold text-white">Upgrade to Pro</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">Free Plan</h3>
                  <div className="text-3xl font-bold mb-4 text-white">$0<span className="text-sm text-gray-400">/month</span></div>
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">Current Plan</span>
                </div>
                
                <ul className="space-y-3">
                  {[
                    "10 messages per day",
                    "Max 250 lines per message", 
                    "Basic review focus",
                    "Standard AI model",
                    "Community support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg border border-violet-500/30 p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">Pro Plan</h3>
                  <div className="text-3xl font-bold mb-4 text-white">$15<span className="text-sm text-gray-400">/month</span></div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {[
                    "50 messages per day",
                    "Up to 1000 lines per message",
                    "Advanced review focus",
                    "Advanced AI model",
                    "Security & Performance analysis",
                    "Review history saved",
                    "Priority support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={handleUpgradeClick}
                  className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 rounded-lg text-center font-semibold transition-all duration-200 text-white flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6 w-full">
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>
            
            <div className="grid gap-6">
              {/* Quick Help */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Quick Help</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">Free Plan:</strong> 10 messages/day, 250 lines per message, GPT-4o Mini
                    <strong className="text-white">Free Plan:</strong> 10 messages/day, 250 lines per message, Standard AI
                  </div>
                  <div>
                    <strong className="text-white">Pro Plan:</strong> 50 messages/day, 1000 lines per message, Advanced AI
                  </div>
                  <div>
                    <strong className="text-white">Usage resets:</strong> Every 24 hours from your first message
                  </div>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Send Feedback</h3>
                <p className="text-gray-300 mb-4">
                  Have suggestions, found a bug, or need help? We'd love to hear from you!
                </p>
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Feedback Form
                </button>
              </div>

              {/* FAQ */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    {
                      q: "What's the difference between Standard and Advanced AI?",
                      a: "Advanced AI offers more sophisticated reasoning capabilities and better code analysis for Pro users."
                    },
                    {
                      q: "When does my usage limit reset?",
                      a: "Your daily limits reset 24 hours after your first message of the day."
                    },
                    {
                      q: "Can I upgrade or downgrade anytime?",
                      a: "Yes, you can change your plan at any time. Changes take effect immediately."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-white/10 pb-3 last:border-b-0">
                      <h4 className="font-medium text-white mb-2">{faq.q}</h4>
                      <p className="text-sm text-gray-400">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 w-full">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input 
                      type="text" 
                      value={userState.name}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={userState.email}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Subscription</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Current Plan: {userState.subscriptionStatus === 'free' ? 'Free' : 'Pro'}</p>
                    <p className="text-gray-400 text-sm">
                      {userState.subscriptionStatus === 'free' ? 'Upgrade for more messages and advanced AI' : '50 messages/day with Advanced AI'}
                    </p>
                  </div>
                  {userState.subscriptionStatus === 'free' && (
                    <button
                      onClick={() => setActiveView('upgrade')}
                      className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[128px] animate-pulse delay-700" />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Sliding Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-50"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">CodeReview AI</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveView(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          activeView === item.id
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{userState.name}</p>
                    <p className="text-gray-400 text-sm truncate">{userState.email}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-xl border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-md flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CodeReview AI</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback Form Modal */}
      <FeedbackForm 
        isOpen={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)} 
      />
    </div>
  );
}