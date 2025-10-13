/**
 * Ripple Effect Component
 * Material Design inspired ripple effect for interactive elements
 */

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRipple } from './hooks/useRipple';

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  color?: string;
  duration?: number;
  size?: number;
  opacity?: number;
  bounded?: boolean;
  center?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onPointerDown?: (event: React.PointerEvent) => void;
}

export function RippleEffect({
  children,
  className,
  disabled = false,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  size,
  opacity = 0.3,
  bounded = true,
  center = false,
  onClick,
  onPointerDown,
}: RippleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ripples, createRipple } = useRipple({
    color,
    duration,
    size,
    opacity,
  });

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let x, y;

    if (center) {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    createRipple(x, y, rect);
    onPointerDown?.(event);
  }, [disabled, center, createRipple, onPointerDown]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    onClick?.(event);
  }, [onClick]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        bounded && 'overflow-hidden',
        className
      )}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {children}

      {/* Ripple container */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: ripple.color,
              }}
              initial={{
                scale: 0,
                opacity: ripple.opacity,
              }}
              animate={{
                scale: 1,
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: ripple.duration / 1000,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// HOC for adding ripple effect to any component
export function withRipple<T extends React.ComponentProps<any>>(
  Component: React.ComponentType<T>,
  rippleConfig?: Partial<RippleEffectProps>
) {
  return React.forwardRef<any, T & { rippleDisabled?: boolean }>((props, ref) => {
    const { rippleDisabled, ...componentProps } = props;

    if (rippleDisabled) {
      return <Component ref={ref} {...componentProps as T} />;
    }

    return (
      <RippleEffect {...rippleConfig}>
        <Component ref={ref} {...componentProps as T} />
      </RippleEffect>
    );
  });
}

// Pre-made ripple button
export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    rippleColor?: string;
    rippleDisabled?: boolean;
  }
>(({ children, className, rippleColor, rippleDisabled, ...props }, ref) => {
  if (rippleDisabled) {
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <RippleEffect color={rippleColor}>
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </button>
    </RippleEffect>
  );
});

RippleButton.displayName = 'RippleButton';