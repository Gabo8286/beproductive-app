/**
 * Animation Configuration Presets
 * Pre-defined animation configs for consistent micro-interactions
 */

import { AnimationConfig, AnimationVariant } from '../types';

export const ANIMATION_CONFIGS: Record<AnimationVariant, AnimationConfig> = {
  subtle: {
    duration: 150,
    ease: 'easeOut',
  },
  normal: {
    duration: 250,
    ease: 'easeInOut',
  },
  pronounced: {
    duration: 350,
    ease: 'easeOutBack',
  },
  dramatic: {
    duration: 500,
    ease: 'easeInOutElastic',
  },
  gentle: {
    duration: 300,
    ease: 'easeInOut',
  },
  energetic: {
    duration: 200,
    ease: 'easeOutBounce',
  },
};

export const HOVER_ANIMATIONS = {
  scale: {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    pressed: { scale: 0.95 },
  },
  lift: {
    initial: { y: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    hover: { y: -2, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
    pressed: { y: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  },
  glow: {
    initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
    hover: { boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' },
    pressed: { boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)' },
  },
  fade: {
    initial: { opacity: 1 },
    hover: { opacity: 0.8 },
    pressed: { opacity: 0.9 },
  },
  rotate: {
    initial: { rotate: 0 },
    hover: { rotate: 5 },
    pressed: { rotate: -2 },
  },
  slideUp: {
    initial: { y: 0 },
    hover: { y: -4 },
    pressed: { y: 2 },
  },
};

export const BUTTON_VARIANTS = {
  primary: {
    initial: {
      background: 'var(--color-primary)',
      color: 'white',
      scale: 1,
    },
    hover: {
      background: 'var(--color-primary)',
      filter: 'brightness(1.1)',
      scale: 1.02,
    },
    pressed: {
      scale: 0.98,
      filter: 'brightness(0.95)',
    },
  },
  secondary: {
    initial: {
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      scale: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    hover: {
      background: 'var(--color-surface)',
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    pressed: {
      scale: 0.98,
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
  },
  ghost: {
    initial: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      scale: 1,
    },
    hover: {
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      scale: 1.02,
    },
    pressed: {
      scale: 0.98,
      background: 'var(--color-border)',
    },
  },
};

export const LOADING_ANIMATIONS = {
  spin: {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1.2, opacity: 0.6 },
    transition: {
      duration: 1,
      repeat: Infinity,
      direction: 'alternate',
    },
  },
  dots: {
    initial: { y: 0 },
    animate: { y: -10 },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      direction: 'alternate',
      ease: 'easeInOut',
    },
  },
};

export const PAGE_TRANSITIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};