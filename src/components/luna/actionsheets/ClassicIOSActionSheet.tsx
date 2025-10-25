import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps } from '@/components/luna/actionsheets/types';

export const ClassicIOSActionSheet: React.FC<ActionSheetProps> = ({
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

      {/* Action Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl border-t z-50',
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center p-3">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <LunaAvatar size="medium" expression="happy" />
            <div>
              <h3 className="font-semibold text-foreground">Luna AI</h3>
              <p className="text-sm text-muted-foreground">Choose an action</p>
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActionClick(action)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn('p-2 rounded-lg', action.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground block">{action.label}</span>
                    {action.description && (
                      <span className="text-sm text-muted-foreground">{action.description}</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
};