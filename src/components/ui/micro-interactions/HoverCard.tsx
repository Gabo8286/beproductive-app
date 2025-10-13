/**
 * Hover Card Component
 * Interactive card with hover effects and micro-interactions
 */

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardProps } from '@/components/ui/card';
import { HOVER_ANIMATIONS } from './configs/animations';
import { SPRING_PRESETS } from './configs/easing';

interface HoverCardProps extends CardProps {
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'fade' | 'rotate' | 'slideUp' | 'none';
  intensity?: 'subtle' | 'normal' | 'pronounced';
  clickable?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const INTENSITY_MULTIPLIERS = {
  subtle: 0.5,
  normal: 1,
  pronounced: 1.5,
};

export const HoverCard = forwardRef<
  HTMLDivElement,
  HoverCardProps & MotionProps
>(({
  hoverEffect = 'lift',
  intensity = 'normal',
  clickable = false,
  disabled = false,
  children,
  className,
  onClick,
  ...props
}, ref) => {
  const multiplier = INTENSITY_MULTIPLIERS[intensity];

  const getHoverVariants = () => {
    if (hoverEffect === 'none' || disabled) {
      return {
        initial: {},
        hover: {},
        pressed: {},
      };
    }

    const baseAnimation = HOVER_ANIMATIONS[hoverEffect];
    if (!baseAnimation) return HOVER_ANIMATIONS.lift;

    // Apply intensity multiplier
    const scaleMultiplier = (value: number) => {
      if (value === 1) return 1;
      return 1 + (value - 1) * multiplier;
    };

    const variants = {
      initial: { ...baseAnimation.initial },
      hover: {
        ...baseAnimation.hover,
        ...(baseAnimation.hover.scale && {
          scale: scaleMultiplier(baseAnimation.hover.scale as number),
        }),
        ...(baseAnimation.hover.y && {
          y: (baseAnimation.hover.y as number) * multiplier,
        }),
      },
      pressed: clickable
        ? {
            ...baseAnimation.pressed,
            ...(baseAnimation.pressed.scale && {
              scale: scaleMultiplier(baseAnimation.pressed.scale as number),
            }),
            ...(baseAnimation.pressed.y && {
              y: (baseAnimation.pressed.y as number) * multiplier,
            }),
          }
        : baseAnimation.initial,
    };

    return variants;
  };

  const variants = getHoverVariants();

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={clickable && !disabled ? "pressed" : undefined}
      transition={SPRING_PRESETS.gentle}
      className={cn(
        'block',
        clickable && !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      <Card
        className={cn(
          'h-full transition-all duration-200',
          'border border-border/50',
          !disabled && hoverEffect !== 'none' && 'hover:border-border',
          clickable && !disabled && 'focus:outline-none focus:ring-2 focus:ring-primary/20',
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
});

HoverCard.displayName = 'HoverCard';