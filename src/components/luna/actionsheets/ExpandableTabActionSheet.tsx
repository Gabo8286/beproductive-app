import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps, LunaAction } from '@/components/luna/actionsheets/types';

export const ExpandableTabActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleActionClick = (action: LunaAction) => {
    buttonPress();
    action.action();
    onClose();
  };

  const toggleCategory = (category: string) => {
    buttonPress();
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Group actions by category
  const categorizedActions = actions.reduce((acc, action) => {
    const category = action.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(action);
    return acc;
  }, {} as Record<string, LunaAction[]>);

  const categoryConfig = {
    capture: { label: 'Capture', color: 'bg-blue-500', icon: '📝' },
    communication: { label: 'Communication', color: 'bg-green-500', icon: '💬' },
    productivity: { label: 'Productivity', color: 'bg-orange-500', icon: '⚡' },
    insights: { label: 'Insights', color: 'bg-purple-500', icon: '📊' },
    general: { label: 'Quick Actions', color: 'bg-gray-500', icon: '🚀' }
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

      {/* Expandable Tab Panel */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-24 left-4 right-4 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border z-50 max-w-md mx-auto max-h-[60vh] overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/50">
          <div className="flex items-center gap-3">
            <LunaAvatar size="medium" expression="happy" />
            <div>
              <h3 className="font-semibold text-foreground">Luna AI</h3>
              <p className="text-sm text-muted-foreground">Organized by category</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Categories */}
        <div className="overflow-y-auto max-h-[calc(60vh-80px)]">
          {Object.entries(categorizedActions).map(([category, categoryActions]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general;
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="border-b last:border-b-0">
                {/* Category Tab */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color)}>
                      <span className="text-sm">{config.icon}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryActions.length} action{categoryActions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Expandable Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 p-4 pt-0 bg-accent/20">
                        {categoryActions.map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <motion.button
                              key={action.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleActionClick(action)}
                              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-background/80 transition-colors"
                            >
                              <div className={cn('p-2 rounded-lg', action.color)}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-medium text-foreground text-center">
                                {action.label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="p-4 bg-accent/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>💡</span>
            <span>Tap category headers to expand and organize your workflow</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};