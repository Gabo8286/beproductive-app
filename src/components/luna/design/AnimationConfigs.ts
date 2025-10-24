/**
 * Premium animation configurations for Luna menu system
 * Provides natural, sophisticated motion with proper timing and easing
 */

import { Variants } from 'framer-motion';
import { lunaTimings } from './DesignTokens';

// === SPRING CONFIGURATIONS ===
export const premiumSprings = {
  // Natural, organic feel for primary interactions
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },

  // Responsive feel for hover states
  responsive: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
    mass: 0.8,
  },

  // Snappy feel for button presses
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  },

  // Bouncy feel for playful interactions
  bouncy: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 15,
    mass: 0.5,
  },

  // Smooth feel for layout transitions
  smooth: {
    type: 'spring' as const,
    stiffness: 250,
    damping: 30,
    mass: 1.2,
  },
} as const;

// === ORCHESTRATED ENTRANCE ANIMATIONS ===
export const entranceAnimations: Variants = {
  // Container animation for the entire carousel
  container: {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        ...premiumSprings.gentle,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        ...premiumSprings.smooth,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  },

  // Individual button animations with stagger
  button: {
    hidden: {
      opacity: 0,
      scale: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: premiumSprings.gentle,
    },
    exit: {
      opacity: 0,
      scale: 0,
      y: -10,
      transition: premiumSprings.smooth,
    },
  },

  // Central Luna button with special emphasis
  centerButton: {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        ...premiumSprings.bouncy,
        delay: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      rotate: 180,
      transition: premiumSprings.snappy,
    },
  },
};

// === INTERACTION ANIMATIONS ===
export const interactionAnimations = {
  // Hover state with elegant elevation
  hover: {
    scale: 1.05,
    y: -2,
    transition: premiumSprings.responsive,
  },

  // Active/tap state with satisfying feedback
  tap: {
    scale: 0.95,
    transition: premiumSprings.snappy,
  },

  // Focus state for accessibility
  focus: {
    scale: 1.02,
    transition: premiumSprings.gentle,
  },

  // Long press animation with progressive feedback
  longPress: {
    scale: 1.1,
    rotate: [0, -2, 2, 0],
    transition: {
      scale: premiumSprings.responsive,
      rotate: {
        duration: 0.8,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  },

  // Drag state with dynamic feedback
  drag: {
    scale: 1.15,
    rotate: 5,
    transition: premiumSprings.snappy,
  },
};

// === LAYOUT TRANSITION ANIMATIONS ===
export const layoutAnimations: Variants = {
  // Expanding from collapsed to expanded state
  expand: {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        ...premiumSprings.gentle,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        ...premiumSprings.smooth,
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  },

  // Category switching with smooth transitions
  categorySwitch: {
    initial: {
      x: 50,
      opacity: 0,
      rotateY: 90,
    },
    animate: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        ...premiumSprings.gentle,
        staggerChildren: 0.05,
      },
    },
    exit: {
      x: -50,
      opacity: 0,
      rotateY: -90,
      transition: premiumSprings.smooth,
    },
  },

  // Context menu sliding in
  contextMenu: {
    initial: {
      scale: 0.9,
      opacity: 0,
      y: 10,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        ...premiumSprings.responsive,
        staggerChildren: 0.05,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: -10,
      transition: premiumSprings.snappy,
    },
  },
};

// === DIRECTIONAL INDICATORS ===
export const dragIndicatorAnimations = {
  // Slide in from direction of drag
  slideIn: {
    right: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
    },
    left: {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 },
    },
    up: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },
    down: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 20, opacity: 0 },
    },
  },

  // Pulsing effect for active drag
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// === OVERLAY ANIMATIONS ===
export const overlayAnimations: Variants = {
  // Backdrop fade with blur
  backdrop: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  },

  // Content container with scale and fade
  content: {
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: premiumSprings.gentle,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: premiumSprings.smooth,
    },
  },
};

// === PROGRESS INDICATORS ===
export const progressAnimations = {
  // Long press progress ring
  progressRing: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: [0, 1, 0.8],
      transition: {
        pathLength: { duration: 0.8, ease: 'linear' },
        opacity: { duration: 0.3 },
      },
    },
    exit: {
      pathLength: 0,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },

  // Loading spinner
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// === UTILITY FUNCTIONS ===

/**
 * Create staggered animation with custom delay
 */
export const createStaggeredAnimation = (
  baseDelay: number = 0.1,
  direction: 'normal' | 'reverse' = 'normal'
) => ({
  staggerChildren: baseDelay,
  staggerDirection: direction === 'reverse' ? -1 : 1,
});

/**
 * Create bounce animation with custom intensity
 */
export const createBounceAnimation = (intensity: number = 1) => ({
  ...premiumSprings.bouncy,
  stiffness: 600 * intensity,
  damping: 15 / intensity,
});

/**
 * Create slide animation from direction
 */
export const createSlideAnimation = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
) => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? -distance : distance;

  return {
    initial: { [axis]: value, opacity: 0 },
    animate: { [axis]: 0, opacity: 1 },
    exit: { [axis]: -value, opacity: 0 },
  };
};