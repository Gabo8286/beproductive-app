import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreVertical, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps, LunaAction } from '@/components/luna/actionsheets/types';

export const SideStripActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const handleActionClick = (action: LunaAction) => {
    buttonPress();
    action.action();
    onClose();
  };

  const handleActionHover = (actionId: string | null) => {
    setHoveredAction(actionId);
  };

  const toggleActionExpand = (actionId: string) => {
    buttonPress();
    setExpandedAction(expandedAction === actionId ? null : actionId);
  };

  // Sort actions by priority for better visibility
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return bPriority - aPriority;
  });

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

      {/* Side Strip */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed right-4 top-1/2 -translate-y-1/2 w-16 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border z-50 max-h-[80vh] overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="p-3 border-b bg-background/50 flex flex-col items-center gap-2">
          <LunaAvatar size="small" expression="happy" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Actions Strip */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] py-2">
          {sortedActions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;
            const isExpanded = expandedAction === action.id;
            const isPriority = action.priority === 'high';

            return (
              <div key={action.id} className="relative">
                {/* Action Button */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-2 mb-2"
                >
                  <button
                    onClick={() => handleActionClick(action)}
                    onMouseEnter={() => handleActionHover(action.id)}
                    onMouseLeave={() => handleActionHover(null)}
                    className={cn(
                      'w-full aspect-square p-3 rounded-xl transition-all duration-200 relative group',
                      'hover:scale-105 hover:shadow-lg',
                      isPriority && 'ring-2 ring-yellow-400/30'
                    )}
                    style={{
                      background: action.color.includes('gradient')
                        ? action.color
                        : `linear-gradient(135deg, ${action.color}, ${action.color}dd)`
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />

                    {/* Priority Indicator */}
                    {isPriority && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-yellow-900" />
                      </div>
                    )}

                    {/* Expand Button */}
                    {action.description && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActionExpand(action.id);
                        }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-background border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-2 h-2 text-muted-foreground" />
                      </button>
                    )}
                  </button>
                </motion.div>

                {/* Tooltip on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ x: 10, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: 10, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-full top-0 mr-2 z-10 pointer-events-none"
                    >
                      <div className="bg-background/95 backdrop-blur-xl border rounded-lg px-3 py-2 shadow-xl max-w-48">
                        <p className="font-medium text-sm text-foreground">{action.label}</p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                        )}
                        {action.category && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {action.category}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="absolute left-full top-3 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-background/95" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Description */}
                <AnimatePresence>
                  {isExpanded && action.description && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-2 overflow-hidden"
                    >
                      <div className="bg-accent/20 rounded-lg p-2 mb-2">
                        <p className="text-xs text-foreground text-center">
                          {action.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-background/50 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="text-xs text-muted-foreground font-medium">Strip</span>
          </div>
          <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full" />
        </div>
      </motion.div>
    </>
  );
};