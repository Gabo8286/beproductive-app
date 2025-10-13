/**
 * useRipple Hook
 * Manages ripple effect state and animations
 */

import { useState, useCallback } from 'react';
import { RippleConfig } from '../types';

interface Ripple {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
}

interface UseRippleConfig extends RippleConfig {
  maxRipples?: number;
}

export function useRipple({
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  size,
  opacity = 0.3,
  maxRipples = 5,
}: UseRippleConfig = {}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((
    x: number,
    y: number,
    containerRect: DOMRect
  ) => {
    const rippleSize = size || Math.max(containerRect.width, containerRect.height) * 2;
    const id = `ripple-${Date.now()}-${Math.random()}`;

    const newRipple: Ripple = {
      id,
      x,
      y,
      size: rippleSize,
      color,
      opacity,
      duration,
    };

    setRipples(prev => {
      const updated = [...prev, newRipple];
      // Limit the number of concurrent ripples
      return updated.slice(-maxRipples);
    });

    // Auto-remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, duration);
  }, [color, duration, size, opacity, maxRipples]);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    createRipple,
    clearRipples,
  };
}