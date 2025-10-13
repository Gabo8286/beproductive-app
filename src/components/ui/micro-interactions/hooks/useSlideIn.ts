/**
 * useSlideIn Hook
 * Manages slide-in animations from different directions
 */

import { useState, useCallback } from 'react';
import { AnimationConfig } from '../types';

interface UseSlideInConfig {
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function useSlideIn({
  direction = 'left',
  distance = 100,
  duration = 300,
  autoPlay = false,
  onComplete,
}: UseSlideInConfig = {}) {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 };
      case 'right':
        return { x: distance, y: 0 };
      case 'up':
        return { x: 0, y: -distance };
      case 'down':
        return { x: 0, y: distance };
      default:
        return { x: 0, y: 0 };
    }
  };

  const getAnimationConfig = (): AnimationConfig => ({
    duration,
    ease: 'easeOut',
  });

  const slideIn = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsVisible(true);

    setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, duration);
  }, [isAnimating, duration, onComplete]);

  const slideOut = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, duration);
  }, [isAnimating, duration]);

  const toggle = useCallback(() => {
    if (isVisible) {
      slideOut();
    } else {
      slideIn();
    }
  }, [isVisible, slideIn, slideOut]);

  const variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: duration / 1000,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      ...getInitialPosition(),
      transition: {
        duration: (duration * 0.75) / 1000,
        ease: 'easeIn',
      },
    },
  };

  return {
    isVisible,
    isAnimating,
    slideIn,
    slideOut,
    toggle,
    variants,
    animationConfig: getAnimationConfig(),
  };
}