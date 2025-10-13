/**
 * Fade Transition Component
 * Smooth fade transitions for content changes
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DURATION_PRESETS } from './configs/easing';

interface FadeTransitionProps {
  children: React.ReactNode;
  isVisible?: boolean;
  duration?: keyof typeof DURATION_PRESETS;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  delay?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export function FadeTransition({
  children,
  isVisible = true,
  duration = 'normal',
  direction = 'none',
  distance = 20,
  className,
  delay = 0,
  onComplete,
  onStart,
}: FadeTransitionProps) {
  const durationMs = DURATION_PRESETS[duration];

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return {};
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: durationMs / 1000,
        delay: delay / 1000,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      ...getDirectionOffset(),
      transition: {
        duration: (durationMs * 0.75) / 1000,
        ease: 'easeIn',
      },
    },
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          onAnimationStart={onStart}
          onAnimationComplete={onComplete}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Staggered fade for lists
interface StaggeredFadeProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: keyof typeof DURATION_PRESETS;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function StaggeredFade({
  children,
  staggerDelay = 100,
  duration = 'normal',
  direction = 'up',
  className,
}: StaggeredFadeProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay / 1000,
      },
    },
  };

  const durationMs = DURATION_PRESETS[duration];

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up':
        return { y: 20 };
      case 'down':
        return { y: -20 };
      case 'left':
        return { x: 20 };
      case 'right':
        return { x: -20 };
      default:
        return {};
    }
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: durationMs / 1000,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <FadeTransition
      direction="up"
      duration="normal"
      distance={10}
      className={cn('w-full', className)}
    >
      {children}
    </FadeTransition>
  );
}