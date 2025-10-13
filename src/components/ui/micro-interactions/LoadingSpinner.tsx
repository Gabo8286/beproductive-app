/**
 * Loading Spinner Component
 * Animated loading indicators with various styles
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spin' | 'pulse' | 'dots' | 'bars' | 'ring' | 'bounce';
  color?: string;
  className?: string;
  text?: string;
}

const SIZE_CONFIGS = {
  sm: { size: 'w-4 h-4', text: 'text-sm' },
  md: { size: 'w-6 h-6', text: 'text-base' },
  lg: { size: 'w-8 h-8', text: 'text-lg' },
  xl: { size: 'w-12 h-12', text: 'text-xl' },
};

export function LoadingSpinner({
  size = 'md',
  variant = 'spin',
  color = 'currentColor',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeConfig = SIZE_CONFIGS[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'spin':
        return (
          <motion.div
            className={cn(
              'border-2 border-gray-200 border-t-current rounded-full',
              sizeConfig.size
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ borderTopColor: color }}
          />
        );

      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-current',
              sizeConfig.size
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ color }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full bg-current"
                animate={{
                  y: [-4, 4, -4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
                style={{ color }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="w-1 bg-current rounded-sm"
                style={{ color }}
                animate={{
                  height: ['12px', '24px', '12px'],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div className={cn('relative', sizeConfig.size)}>
            <motion.div
              className="absolute inset-0 border-2 border-gray-200 rounded-full"
              style={{ borderColor: `${color}20` }}
            />
            <motion.div
              className="absolute inset-0 border-2 border-transparent border-t-current rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ borderTopColor: color }}
            />
          </div>
        );

      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 rounded-full bg-current"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
                style={{ color }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className="flex items-center justify-center">
        {renderSpinner()}
      </div>
      {text && (
        <motion.p
          className={cn('text-gray-600 dark:text-gray-400', sizeConfig.text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Preset loading states
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingSpinner
      variant="spin"
      size={size}
      color="currentColor"
      className="inline-flex"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner
        variant="spin"
        size="lg"
        text="Loading..."
        className="text-primary"
      />
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <LoadingSpinner
      variant="dots"
      size="sm"
      text={text}
      className="inline-flex items-center space-x-2"
    />
  );
}