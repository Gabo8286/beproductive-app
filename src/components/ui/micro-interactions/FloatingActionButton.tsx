/**
 * Floating Action Button Component
 * Material Design inspired FAB with micro-interactions
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RippleEffect } from './RippleEffect';

interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  loading?: boolean;
  extended?: boolean;
  label?: string;
  className?: string;
  tooltip?: string;
  mini?: boolean;
}

const SIZE_CONFIGS = {
  sm: {
    button: 'w-12 h-12',
    icon: 'w-5 h-5',
    extended: 'px-4 h-12',
    text: 'text-sm',
  },
  md: {
    button: 'w-14 h-14',
    icon: 'w-6 h-6',
    extended: 'px-6 h-14',
    text: 'text-base',
  },
  lg: {
    button: 'w-16 h-16',
    icon: 'w-7 h-7',
    extended: 'px-8 h-16',
    text: 'text-lg',
  },
};

const POSITION_CONFIGS = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  custom: '',
};

const VARIANT_CONFIGS = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white shadow-gray-500/25',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/25',
  error: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25',
};

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({
  icon = <Plus />,
  onClick,
  size = 'md',
  position = 'bottom-right',
  variant = 'primary',
  disabled = false,
  loading = false,
  extended = false,
  label,
  className,
  tooltip,
  mini = false,
}, ref) => {
  const sizeConfig = SIZE_CONFIGS[size];
  const positionConfig = POSITION_CONFIGS[position];
  const variantConfig = VARIANT_CONFIGS[variant];

  const actualSize = mini ? SIZE_CONFIGS.sm : sizeConfig;

  const buttonVariants = {
    initial: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.05,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
    pressed: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const labelVariants = {
    hidden: {
      opacity: 0,
      width: 0,
      marginRight: 0,
    },
    visible: {
      opacity: 1,
      width: 'auto',
      marginRight: 12,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const shadowVariants = {
    initial: {
      boxShadow: `0 4px 12px var(--tw-shadow-color, ${variantConfig.includes('shadow-') ? variantConfig.split('shadow-')[1] : 'rgba(0,0,0,0.15)'})`,
    },
    hover: {
      boxShadow: `0 8px 24px var(--tw-shadow-color, ${variantConfig.includes('shadow-') ? variantConfig.split('shadow-')[1] : 'rgba(0,0,0,0.25)'})`,
      y: -2,
    },
    pressed: {
      boxShadow: `0 2px 8px var(--tw-shadow-color, ${variantConfig.includes('shadow-') ? variantConfig.split('shadow-')[1] : 'rgba(0,0,0,0.15)'})`,
      y: 0,
    },
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50',
        position !== 'custom' && positionConfig,
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      <RippleEffect
        color="rgba(255, 255, 255, 0.3)"
        bounded={true}
      >
        <motion.button
          ref={ref}
          className={cn(
            'relative flex items-center justify-center rounded-full font-medium transition-colors',
            'focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-background',
            extended ? actualSize.extended : actualSize.button,
            extended && actualSize.text,
            variantConfig,
            disabled && 'opacity-50 cursor-not-allowed',
            loading && 'cursor-wait'
          )}
          variants={buttonVariants}
          initial="initial"
          animate={loading ? 'loading' : 'initial'}
          whileHover={!disabled && !loading ? 'hover' : undefined}
          whileTap={!disabled && !loading ? 'pressed' : undefined}
          onClick={!disabled && !loading ? onClick : undefined}
          disabled={disabled || loading}
          title={tooltip}
        >
          {/* Shadow animation */}
          <motion.div
            className="absolute inset-0 rounded-full"
            variants={shadowVariants}
            initial="initial"
            whileHover={!disabled && !loading ? 'hover' : undefined}
            whileTap={!disabled && !loading ? 'pressed' : undefined}
          />

          {/* Content */}
          <div className="relative flex items-center">
            {/* Label (for extended FAB) */}
            <AnimatePresence>
              {extended && label && (
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
              className={cn('flex items-center justify-center', actualSize.icon)}
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? {
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              } : undefined}
            >
              {loading ? (
                <div className={cn('border-2 border-current border-t-transparent rounded-full', actualSize.icon)} />
              ) : (
                icon
              )}
            </motion.div>
          </div>
        </motion.button>
      </RippleEffect>
    </motion.div>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

// Preset FAB components
export function ScrollToTopFAB({
  isVisible = true,
  onClick,
  ...props
}: Omit<FloatingActionButtonProps, 'icon'> & { isVisible?: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <FloatingActionButton
          icon={<ChevronUp />}
          onClick={onClick}
          variant="secondary"
          position="bottom-right"
          tooltip="Scroll to top"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

export function AddFAB(props: FloatingActionButtonProps) {
  return (
    <FloatingActionButton
      icon={<Plus />}
      tooltip="Add new item"
      {...props}
    />
  );
}