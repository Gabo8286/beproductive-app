import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Clock, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps, LunaAction } from '@/components/luna/actionsheets/types';

export const ContextualActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const location = useLocation();

  // Smart context-aware action filtering and prioritization
  const contextualActions = useMemo(() => {
    const currentPath = location.pathname;
    const currentTime = new Date().getHours();

    // Score actions based on context
    const scoredActions = actions.map((action) => {
      let score = 0;

      // Time-based scoring
      if (currentTime >= 9 && currentTime <= 11) {
        // Morning productivity hours
        if (action.category === 'productivity' || action.category === 'capture') {
          score += 3;
        }
      } else if (currentTime >= 14 && currentTime <= 16) {
        // Afternoon communication hours
        if (action.category === 'communication') {
          score += 3;
        }
      }

      // Route-based scoring
      if (currentPath.includes('/capture') && action.category === 'capture') {
        score += 2;
      } else if (currentPath.includes('/plan') && action.category === 'productivity') {
        score += 2;
      } else if (currentPath.includes('/engage') && action.category === 'communication') {
        score += 2;
      }

      // Priority-based scoring
      if (action.priority === 'high') score += 2;
      if (action.priority === 'medium') score += 1;

      return { ...action, contextScore: score };
    });

    // Sort by score and return top 3
    return scoredActions
      .sort((a, b) => b.contextScore - a.contextScore)
      .slice(0, 3);
  }, [actions, location.pathname]);

  const getContextualMessage = () => {
    const currentPath = location.pathname;
    const currentTime = new Date().getHours();

    if (currentPath.includes('/capture')) {
      return "Perfect time to capture ideas!";
    } else if (currentPath.includes('/plan')) {
      return "Let's organize your day";
    } else if (currentPath.includes('/engage')) {
      return "Ready to take action?";
    } else if (currentTime >= 9 && currentTime <= 11) {
      return "Your peak productivity window";
    } else if (currentTime >= 18) {
      return "Winding down for the day";
    }

    return "Smart suggestions for you";
  };

  const handleActionClick = (action: LunaAction) => {
    buttonPress();
    action.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Contextual Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-24 left-4 right-4 bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl border z-50 max-w-sm mx-auto',
          className
        )}
      >
        <div className="p-4">
          {/* Header with context */}
          <div className="flex items-center gap-3 mb-4">
            <LunaAvatar size="medium" expression="thinking" />
            <div>
              <h3 className="font-semibold text-foreground">Smart Suggestions</h3>
              <p className="text-sm text-muted-foreground">{getContextualMessage()}</p>
            </div>
          </div>

          {/* Context Indicator */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Based on your current activity and time patterns
            </span>
          </div>

          {/* Contextual Actions */}
          <div className="space-y-2">
            {contextualActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleActionClick(action)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
                >
                  <div className={cn('p-2 rounded-lg', action.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{action.label}</span>
                      {action.contextScore >= 3 && (
                        <Star className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Recommended for you
                      </span>
                      {action.contextScore >= 2 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Good timing</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Score: {action.contextScore}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* All Actions Link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              // Could open a full action sheet or navigate to a dedicated page
              onClose();
            }}
            className="w-full mt-4 p-2 text-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all actions →
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};