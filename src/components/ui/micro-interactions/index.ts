/**
 * Micro-interactions Library
 * Export all micro-interaction components for easy importing
 */

export { AnimatedButton } from './AnimatedButton';
export { HoverCard } from './HoverCard';
export { LoadingSpinner } from './LoadingSpinner';
export { PulseIcon } from './PulseIcon';
export { SlideInPanel } from './SlideInPanel';
export { FadeTransition } from './FadeTransition';
export { BouncyCheckbox } from './BouncyCheckbox';
export { RippleEffect } from './RippleEffect';
export { FloatingActionButton } from './FloatingActionButton';
export { ProgressIndicator } from './ProgressIndicator';

// Animation hooks and utilities
export { useHover } from './hooks/useHover';
export { useRipple } from './hooks/useRipple';
export { useSlideIn } from './hooks/useSlideIn';
export { useFadeIn } from './hooks/useFadeIn';
export { useSpring } from './hooks/useSpring';

// Constants and configurations
export { ANIMATION_CONFIGS } from './configs/animations';
export { EASING_FUNCTIONS } from './configs/easing';

// Types
export type {
  AnimationConfig,
  EasingFunction,
  MicroInteractionProps,
  HoverState,
  AnimationVariant,
} from './types';