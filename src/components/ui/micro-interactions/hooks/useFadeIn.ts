/**
 * useFadeIn Hook
 * Manages fade-in/out animations with timing control
 */

import { useState, useCallback, useEffect } from 'react';

interface UseFadeInConfig {
  duration?: number;
  delay?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
}

export function useFadeIn({
  duration = 300,
  delay = 0,
  autoPlay = false,
  onComplete,
  onStart,
}: UseFadeInConfig = {}) {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      fadeIn();
    }
  }, [autoPlay]);

  const fadeIn = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    onStart?.();

    setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, delay + duration);
  }, [isAnimating, delay, duration, onStart, onComplete]);

  const fadeOut = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsVisible(false);

    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [isAnimating, duration]);

  const toggle = useCallback(() => {
    if (isVisible) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, [isVisible, fadeIn, fadeOut]);

  const variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: (duration * 0.75) / 1000,
        ease: 'easeIn',
      },
    },
  };

  const styles = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-out ${delay}ms`,
  };

  return {
    isVisible,
    isAnimating,
    fadeIn,
    fadeOut,
    toggle,
    variants,
    styles,
  };
}