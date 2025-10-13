/**
 * Easing Functions for Smooth Animations
 * CSS and JavaScript compatible easing functions
 */

import { EasingFunction } from '../types';

export const EASING_FUNCTIONS: Record<EasingFunction, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  easeInElastic: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutElastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutElastic: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  easeInBounce: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Framer Motion compatible easing
export const FRAMER_EASING = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeInBack: [0.6, -0.28, 0.735, 0.045],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55],
  bouncy: [0.68, -0.6, 0.32, 1.6],
  gentle: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.4, 0, 0.2, 1],
} as const;

// Spring animations for natural motion
export const SPRING_PRESETS = {
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
    mass: 1,
  },
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
  stiff: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  slow: {
    type: 'spring',
    stiffness: 60,
    damping: 20,
    mass: 1,
  },
  molasses: {
    type: 'spring',
    stiffness: 30,
    damping: 25,
    mass: 2,
  },
} as const;

// Duration presets
export const DURATION_PRESETS = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
} as const;