import { motion } from 'framer-motion';
import { Clock, Crown } from 'lucide-react';

interface UsageIndicatorProps {
  messagesUsed: number;
  messagesLimit: number;
  timeUntilReset: string;
  subscriptionStatus: 'free' | 'pro';
  onUpgrade: () => void;
}

export function UsageIndicator({ 
  messagesUsed, 
  messagesLimit, 
  timeUntilReset, 
  subscriptionStatus,
  onUpgrade 
}: UsageIndicatorProps) {
  const percentage = (messagesUsed / messagesLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = messagesUsed >= messagesLimit;

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Usage Bar */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 whitespace-nowrap">
          {messagesUsed}/{messagesLimit} messages
        </span>
        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${
              isAtLimit 
                ? 'bg-red-500' 
                : isNearLimit 
                ? 'bg-amber-500' 
                : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Reset Timer */}
      {timeUntilReset && (
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          <span className="whitespace-nowrap">Resets in {timeUntilReset}</span>
        </div>
      )}

      {/* Upgrade Button for Free Users */}
      {subscriptionStatus === 'free' && isNearLimit && (
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded text-xs font-medium transition-all duration-200"
        >
          <Crown className="w-3 h-3" />
          Upgrade
        </button>
      )}
    </div>
  );
}