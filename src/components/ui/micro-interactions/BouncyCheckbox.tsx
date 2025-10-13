/**
 * Bouncy Checkbox Component
 * Animated checkbox with spring physics and visual feedback
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BouncyCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

const SIZE_CONFIGS = {
  sm: {
    checkbox: 'w-4 h-4',
    icon: 'w-3 h-3',
    text: 'text-sm',
  },
  md: {
    checkbox: 'w-5 h-5',
    icon: 'w-4 h-4',
    text: 'text-base',
  },
  lg: {
    checkbox: 'w-6 h-6',
    icon: 'w-5 h-5',
    text: 'text-lg',
  },
};

const COLOR_CONFIGS = {
  primary: {
    checked: 'bg-blue-500 border-blue-500',
    unchecked: 'bg-transparent border-gray-300 dark:border-gray-600',
    focus: 'ring-blue-500/20',
  },
  secondary: {
    checked: 'bg-gray-500 border-gray-500',
    unchecked: 'bg-transparent border-gray-300 dark:border-gray-600',
    focus: 'ring-gray-500/20',
  },
  success: {
    checked: 'bg-green-500 border-green-500',
    unchecked: 'bg-transparent border-gray-300 dark:border-gray-600',
    focus: 'ring-green-500/20',
  },
  warning: {
    checked: 'bg-yellow-500 border-yellow-500',
    unchecked: 'bg-transparent border-gray-300 dark:border-gray-600',
    focus: 'ring-yellow-500/20',
  },
  error: {
    checked: 'bg-red-500 border-red-500',
    unchecked: 'bg-transparent border-gray-300 dark:border-gray-600',
    focus: 'ring-red-500/20',
  },
};

export const BouncyCheckbox = forwardRef<HTMLInputElement, BouncyCheckboxProps>(
  ({
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    color = 'primary',
    label,
    description,
    className,
    id,
  }, ref) => {
    const sizeConfig = SIZE_CONFIGS[size];
    const colorConfig = COLOR_CONFIGS[color];

    const handleChange = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    const checkboxVariants = {
      unchecked: {
        scale: 1,
        rotate: 0,
      },
      checked: {
        scale: [1, 1.2, 1],
        rotate: [0, 5, 0],
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 15,
          duration: 0.3,
        },
      },
      pressed: {
        scale: 0.95,
        transition: {
          duration: 0.1,
        },
      },
    };

    const checkIconVariants = {
      unchecked: {
        opacity: 0,
        scale: 0,
        rotate: -90,
      },
      checked: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
          type: 'spring',
          stiffness: 600,
          damping: 15,
          delay: 0.1,
        },
      },
    };

    const rippleVariants = {
      initial: {
        scale: 0,
        opacity: 0.5,
      },
      animate: {
        scale: 1.5,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut',
        },
      },
    };

    return (
      <label
        className={cn(
          'flex items-start space-x-3 cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        htmlFor={id}
      >
        <div className="relative flex items-center">
          {/* Hidden input */}
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />

          {/* Custom checkbox */}
          <motion.div
            className={cn(
              'relative flex items-center justify-center border-2 rounded transition-colors',
              sizeConfig.checkbox,
              checked ? colorConfig.checked : colorConfig.unchecked,
              !disabled && 'group-focus-within:ring-4',
              !disabled && colorConfig.focus,
              disabled && 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
            )}
            variants={checkboxVariants}
            initial="unchecked"
            animate={checked ? 'checked' : 'unchecked'}
            whileTap={!disabled ? 'pressed' : undefined}
          >
            {/* Ripple effect */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded border-2',
                    colorConfig.checked
                  )}
                  variants={rippleVariants}
                  initial="initial"
                  animate="animate"
                  exit="initial"
                />
              )}
            </AnimatePresence>

            {/* Check icon */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  variants={checkIconVariants}
                  initial="unchecked"
                  animate="checked"
                  exit="unchecked"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check
                    className={cn(
                      'text-white stroke-[3]',
                      sizeConfig.icon
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <motion.div
                className={cn(
                  'font-medium text-gray-900 dark:text-gray-100',
                  sizeConfig.text,
                  disabled && 'text-gray-400 dark:text-gray-600'
                )}
                layout
              >
                {label}
              </motion.div>
            )}
            {description && (
              <motion.div
                className={cn(
                  'text-gray-500 dark:text-gray-400',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                  disabled && 'text-gray-400 dark:text-gray-600'
                )}
                layout
              >
                {description}
              </motion.div>
            )}
          </div>
        )}
      </label>
    );
  }
);

BouncyCheckbox.displayName = 'BouncyCheckbox';