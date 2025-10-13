/**
 * Animated Button Component
 * Enhanced button with smooth micro-interactions
 */

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { BUTTON_VARIANTS } from './configs/animations';
import { SPRING_PRESETS, DURATION_PRESETS } from './configs/easing';
import { AnimationVariant } from './types';

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  animationVariant?: AnimationVariant;
  ripple?: boolean;
  lift?: boolean;
  glow?: boolean;
  bounce?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps & MotionProps
>(({
  variant = 'primary',
  animationVariant = 'normal',
  ripple = true,
  lift = false,
  glow = false,
  bounce = false,
  disabled = false,
  loading = false,
  icon,
  children,
  className,
  onClick,
  ...props
}, ref) => {
  const buttonVariant = BUTTON_VARIANTS[variant as keyof typeof BUTTON_VARIANTS] || BUTTON_VARIANTS.primary;

  const motionVariants = {
    initial: {
      ...buttonVariant.initial,
      ...(lift && { y: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }),
      ...(glow && { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }),
    },
    hover: {
      ...buttonVariant.hover,
      ...(lift && { y: -2, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }),
      ...(glow && { boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' }),
    },
    pressed: {
      ...buttonVariant.pressed,
      ...(lift && { y: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }),
      ...(glow && { boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)' }),
    },
  };

  const springConfig = bounce ? SPRING_PRESETS.wobbly : SPRING_PRESETS.gentle;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect if enabled
    if (ripple) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const rippleElement = document.createElement('span');
      rippleElement.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        transform: scale(0);
        animation: ripple 600ms linear;
        z-index: 1;
      `;

      // Add ripple animation keyframes if not already present
      if (!document.querySelector('#ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(rippleElement);

      setTimeout(() => {
        rippleElement.remove();
      }, 600);
    }

    onClick?.(e);
  };

  return (
    <motion.div
      variants={motionVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "pressed" : undefined}
      transition={springConfig}
      className="inline-block"
    >
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        className={cn(
          'relative transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          loading && 'cursor-wait',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION_PRESETS.fast / 1000 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}

        <motion.div
          className={cn(
            'flex items-center space-x-2',
            loading && 'opacity-0'
          )}
          transition={{ duration: DURATION_PRESETS.fast / 1000 }}
        >
          {icon && (
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 5 }}
              transition={{ duration: DURATION_PRESETS.fast / 1000 }}
            >
              {icon}
            </motion.span>
          )}
          {children && <span>{children}</span>}
        </motion.div>
      </Button>
    </motion.div>
  );
});

AnimatedButton.displayName = 'AnimatedButton';