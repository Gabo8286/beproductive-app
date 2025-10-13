/**
 * useSpring Hook
 * Spring physics animations for natural motion
 */

import { useState, useCallback } from 'react';
import { SpringConfig } from '../types';

interface UseSpringConfig extends SpringConfig {
  from?: any;
  to?: any;
  onUpdate?: (value: any) => void;
  onComplete?: () => void;
}

export function useSpring({
  tension = 120,
  friction = 14,
  mass = 1,
  from = { scale: 1 },
  to = { scale: 1.1 },
  onUpdate,
  onComplete,
}: UseSpringConfig = {}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentValue, setCurrentValue] = useState(from);

  const animate = useCallback((targetValue?: any) => {
    if (isAnimating) return;

    const target = targetValue || to;
    setIsAnimating(true);

    // Spring animation configuration for framer-motion
    const springConfig = {
      type: 'spring',
      stiffness: tension,
      damping: friction,
      mass,
    };

    // Simulate spring animation
    let progress = 0;
    const duration = 1000; // Base duration, actual duration depends on spring physics
    const startTime = Date.now();
    const startValue = currentValue;

    const step = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Spring easing function (approximation)
      const springProgress = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2);

      const interpolatedValue = Object.keys(target).reduce((acc, key) => {
        const start = startValue[key] || 0;
        const end = target[key] || 0;
        acc[key] = start + (end - start) * springProgress;
        return acc;
      }, {} as any);

      setCurrentValue(interpolatedValue);
      onUpdate?.(interpolatedValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
        onComplete?.();
      }
    };

    requestAnimationFrame(step);
  }, [isAnimating, to, tension, friction, mass, currentValue, onUpdate, onComplete]);

  const reset = useCallback(() => {
    setCurrentValue(from);
    setIsAnimating(false);
  }, [from]);

  const stop = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Framer Motion spring configuration
  const springVariants = {
    initial: from,
    animate: to,
    transition: {
      type: 'spring',
      stiffness: tension,
      damping: friction,
      mass,
    },
  };

  return {
    currentValue,
    isAnimating,
    animate,
    reset,
    stop,
    springConfig: {
      type: 'spring' as const,
      stiffness: tension,
      damping: friction,
      mass,
    },
    springVariants,
  };
}

// Preset spring configurations
export const SPRING_PRESETS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  wobbly: { tension: 180, friction: 12, mass: 1 },
  stiff: { tension: 400, friction: 30, mass: 1 },
  slow: { tension: 60, friction: 20, mass: 1 },
  molasses: { tension: 30, friction: 25, mass: 2 },
  bouncy: { tension: 300, friction: 10, mass: 1 },
  snappy: { tension: 500, friction: 40, mass: 1 },
} as const;