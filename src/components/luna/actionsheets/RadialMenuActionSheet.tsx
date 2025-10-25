import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps } from '@/components/luna/actionsheets/types';

export const RadialMenuActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const radius = 80;
  const centerX = 50; // percentage
  const centerY = 50; // percentage

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Radial Container */}
      <div className={cn('fixed inset-0 flex items-center justify-center z-50 pointer-events-none', className)}>
        <div className="relative w-80 h-80 pointer-events-auto">
          {/* Center Luna Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-background"
            onClick={onClose}
          >
            <LunaAvatar size="medium" expression="happy" />
          </motion.div>

          {/* Radial Action Items */}
          {actions.map((action, index) => {
            const angle = (index * 360) / actions.length;
            const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  damping: 20,
                  stiffness: 300
                }}
                onClick={() => handleActionClick(action)}
                className="absolute w-14 h-14 rounded-full bg-background shadow-xl border-2 border-border flex items-center justify-center hover:scale-110 transition-transform group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className={cn('p-2 rounded-full', action.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Floating Label */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg"
                >
                  {action.label}
                </motion.div>
              </motion.button>
            );
          })}

          {/* Connection Lines */}
          {actions.map((_, index) => {
            const angle = (index * 360) / actions.length;
            const lineLength = radius - 20;
            const x1 = 50;
            const y1 = 50;
            const x2 = x1 + (lineLength * Math.cos((angle - 90) * Math.PI / 180)) / 3.2;
            const y2 = y1 + (lineLength * Math.sin((angle - 90) * Math.PI / 180)) / 3.2;

            return (
              <motion.svg
                key={`line-${index}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              >
                <motion.line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-orange-400"
                  strokeDasharray="3,3"
                />
              </motion.svg>
            );
          })}
        </div>
      </div>
    </>
  );
};