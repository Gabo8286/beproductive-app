import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps } from '@/components/luna/actionsheets/types';

export const FloatingPanelActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();

  const handleActionClick = (action: any) => {
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

      {/* Floating Panel */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-24 left-4 right-4 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border z-50 max-w-sm mx-auto',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <LunaAvatar size="medium" expression="happy" />
            <div>
              <h3 className="font-semibold text-foreground">Luna AI</h3>
              <p className="text-sm text-muted-foreground">How can I help?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActionClick(action)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className={cn('p-3 rounded-xl', action.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 pt-0">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
              💡 Tip: Luna learns from your usage patterns to provide better suggestions
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};