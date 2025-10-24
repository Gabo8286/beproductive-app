/**
 * Design tokens for premium Luna menu system
 * Provides consistent spacing, colors, sizing, and design foundations
 */

// === SIZING SYSTEM ===
export const lunaSize = {
  // Button sizes with proper hierarchy
  center: 80,      // Primary Luna button
  category: 64,    // Secondary category buttons
  action: 48,      // Tertiary action items

  // Spacing using 8px grid system
  radius: {
    small: 120,    // Tight circular layout
    medium: 140,   // Default comfortable spacing
    large: 160,    // Spacious layout for larger screens

    // Mobile-optimized corner layouts
    corner: {
      mobile: 90,    // Comfortable thumb reach on mobile
      tablet: 110,   // Slightly larger for tablet
      desktop: 130,  // Maintain mobile feel on desktop
    },
  },

  // Border radius for modern feel
  borderRadius: {
    small: 12,
    medium: 16,
    large: 20,
    circle: '50%',
  },

  // Mobile-first corner positioning
  corner: {
    // Thumb zone optimization (based on mobile UX research)
    thumbReach: {
      comfortable: 90,  // Easy reach zone
      maximum: 120,     // Maximum comfortable reach
      optimal: 100,     // Sweet spot for most users
    },

    // Corner positioning offsets
    offset: {
      mobile: 16,       // Distance from screen edges on mobile
      tablet: 24,       // Larger offset for tablets
      desktop: 32,      // Desktop offset
    },

    // Arc configuration for corner layout
    arc: {
      // Bottom-right corner (default)
      bottomRight: {
        startAngle: 180,  // Start from left (180°)
        endAngle: 270,    // End at top (270°)
        range: 90,        // 90° arc for corner layout
      },
      // Bottom-left corner
      bottomLeft: {
        startAngle: 270,  // Start from top (270°)
        endAngle: 360,    // End at right (360°/0°)
        range: 90,        // 90° arc for corner layout
      },
    },

    // Drag configuration for corner switching
    drag: {
      threshold: 50,        // Minimum drag distance to trigger corner switch
      deadZone: 100,        // Center area where no corner switching occurs
      animationDuration: 300, // Animation duration for corner transitions
    },
  },
} as const;

// === PREMIUM COLOR SYSTEM ===
export const lunaColors = {
  // Primary Luna gradients - sophisticated and deep
  primary: {
    from: '#3B82F6',     // Rich blue
    via: '#6366F1',      // Indigo transition
    to: '#8B5CF6',       // Purple endpoint
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
  },

  // Category color system - semantic and refined
  categories: {
    capture: {
      primary: '#3B82F6',    // Blue - calm, thoughtful
      secondary: '#60A5FA',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-400',
      light: '#DBEAFE',
    },
    plan: {
      primary: '#10B981',    // Emerald - growth, progress
      secondary: '#34D399',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-400',
      light: '#D1FAE5',
    },
    organize: {
      primary: '#8B5CF6',    // Purple - creativity, organization
      secondary: '#A78BFA',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-400',
      light: '#EDE9FE',
    },
    track: {
      primary: '#F59E0B',    // Amber - energy, achievement
      secondary: '#FBBF24',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-400',
      light: '#FEF3C7',
    },
    share: {
      primary: '#EC4899',    // Pink - connection, sharing
      secondary: '#F472B6',
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-400',
      light: '#FCE7F3',
    },
    learn: {
      primary: '#14B8A6',    // Teal - wisdom, learning
      secondary: '#2DD4BF',
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-400',
      light: '#CCFBF1',
    },
  },

  // Neutral system for backgrounds and text
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray600: '#6B7280',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // Interactive states
  states: {
    hover: 'rgba(255, 255, 255, 0.1)',
    active: 'rgba(255, 255, 255, 0.2)',
    focus: '#3B82F6',
    disabled: 'rgba(156, 163, 175, 0.5)',
  },
} as const;

// === PREMIUM SHADOW SYSTEM ===
export const lunaShadows = {
  // Multi-layer shadow system for realistic depth
  elevation: {
    // Subtle elevation for resting state
    low: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      className: 'shadow-sm',
    },

    // Medium elevation for hover states
    medium: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      className: 'shadow-md',
    },

    // High elevation for active/pressed states
    high: {
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      className: 'shadow-lg',
    },

    // Premium elevation for primary elements
    premium: {
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
      className: 'shadow-xl',
    },
  },

  // Colored shadows for brand elements
  colored: {
    blue: '0 8px 32px rgba(59, 130, 246, 0.3)',
    purple: '0 8px 32px rgba(139, 92, 246, 0.3)',
    green: '0 8px 32px rgba(16, 185, 129, 0.3)',
    amber: '0 8px 32px rgba(245, 158, 11, 0.3)',
    pink: '0 8px 32px rgba(236, 72, 153, 0.3)',
    teal: '0 8px 32px rgba(20, 184, 166, 0.3)',
  },
} as const;

// === SPACING SYSTEM ===
export const lunaSpacing = {
  // Based on 8px grid for consistency
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Specific spacing for layout elements
  container: {
    padding: 24,
    gap: 16,
  },

  // Button spacing
  button: {
    padding: 12,
    gap: 8,
  },
} as const;

// === TYPOGRAPHY SYSTEM ===
export const lunaTypography = {
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Label-specific typography
  labels: {
    size: '0.75rem',        // 12px for compact labels
    weight: 500,            // Medium weight for readability
    lineHeight: 1.2,        // Tight line height
    letterSpacing: '0.025em', // Slight letter spacing for clarity
    maxWidth: '60px',       // Maximum width before truncation
  },
} as const;

// === ANIMATION SYSTEM ===
export const lunaTimings = {
  // Duration values in milliseconds
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing functions for natural movement
  easing: {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },

  // Spring configurations for Framer Motion
  spring: {
    gentle: { type: 'spring', stiffness: 300, damping: 25 },
    bouncy: { type: 'spring', stiffness: 400, damping: 15 },
    snappy: { type: 'spring', stiffness: 500, damping: 30 },
  },
} as const;

// === BREAKPOINTS ===
export const lunaBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// === UTILITY FUNCTIONS ===

/**
 * Get category color configuration by ID
 */
export const getCategoryColor = (categoryId: string) => {
  const colorMap: Record<string, keyof typeof lunaColors.categories> = {
    capture: 'capture',
    plan: 'plan',
    organize: 'organize',
    track: 'track',
    share: 'share',
    collaborate: 'share', // Alias
    learn: 'learn',
  };

  return lunaColors.categories[colorMap[categoryId]] || lunaColors.categories.capture;
};

/**
 * Generate shadow style for colored elements
 */
export const getColoredShadow = (color: keyof typeof lunaShadows.colored) => {
  return { boxShadow: lunaShadows.colored[color] };
};

/**
 * Generate responsive container size with proper centering and label space
 */
export const getContainerSize = (radius: number, buttonSize: number, includeLabels: boolean = true) => {
  // Calculate the actual space needed for the full circle
  // Need to account for button radius extending beyond the circle
  const buttonRadius = buttonSize / 2;
  const totalRadius = radius + buttonRadius;

  // Account for labels below buttons if they're enabled
  const labelSpace = includeLabels ? 24 : 0; // Space for text labels

  // Container needs to be square to accommodate the full circle plus labels
  return totalRadius * 2 + lunaSpacing.container.padding * 2 + labelSpace;
};

/**
 * Calculate corner-anchored FAB position based on screen size and corner preference
 */
export const getCornerFABPosition = (
  screenWidth: number,
  screenHeight: number,
  corner: 'bottomRight' | 'bottomLeft' = 'bottomRight'
) => {
  // Determine device type based on screen width
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const offset = isMobile
    ? lunaSize.corner.offset.mobile
    : isTablet
    ? lunaSize.corner.offset.tablet
    : lunaSize.corner.offset.desktop;

  const baseY = screenHeight - lunaSize.center / 2 - offset;

  if (corner === 'bottomLeft') {
    return {
      x: lunaSize.center / 2 + offset,
      y: baseY,
    };
  }

  // Default bottom-right
  return {
    x: screenWidth - lunaSize.center / 2 - offset,
    y: baseY,
  };
};

/**
 * Calculate corner arc positions for mobile-optimized layout
 */
export const getCornerArcPositions = (
  anchorX: number,
  anchorY: number,
  itemCount: number,
  corner: 'bottomRight' | 'bottomLeft' = 'bottomRight',
  screenWidth: number = window.innerWidth
): { x: number; y: number; angle: number; index: number }[] => {
  if (itemCount === 0) return [];

  // Get mobile-optimized radius
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const radius = isMobile
    ? lunaSize.radius.corner.mobile
    : isTablet
    ? lunaSize.radius.corner.tablet
    : lunaSize.radius.corner.desktop;

  // Use corner arc configuration based on corner preference
  const arcConfig = lunaSize.corner.arc[corner];
  const { startAngle, range } = arcConfig;
  const angleStep = range / Math.max(itemCount - 1, 1);

  return Array.from({ length: itemCount }, (_, index) => {
    const angle = startAngle + (angleStep * index);
    const radian = (angle * Math.PI) / 180;

    // Calculate position relative to anchor point
    const x = anchorX + Math.cos(radian) * radius;
    const y = anchorY + Math.sin(radian) * radius;

    return {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      angle,
      index,
    };
  });
};

/**
 * Check if corner menu fits within screen bounds
 */
export const validateCornerMenuBounds = (
  anchorX: number,
  anchorY: number,
  screenWidth: number,
  screenHeight: number
): boolean => {
  const maxRadius = lunaSize.corner.thumbReach.maximum;
  const padding = lunaSize.corner.offset.mobile;

  // Check if the full arc fits within screen bounds
  const leftBound = anchorX - maxRadius;
  const topBound = anchorY - maxRadius;

  return leftBound >= padding && topBound >= padding;
};

/**
 * Determine which corner the user is dragging towards
 */
export const getTargetCorner = (
  dragX: number,
  screenWidth: number
): 'bottomRight' | 'bottomLeft' | null => {
  const centerX = screenWidth / 2;
  const deadZone = lunaSize.corner.drag.deadZone;
  const threshold = lunaSize.corner.drag.threshold;

  // Calculate distance from center
  const distanceFromCenter = Math.abs(dragX - centerX);

  // If within dead zone, no corner change
  if (distanceFromCenter < deadZone) {
    return null;
  }

  // If beyond threshold, determine target corner
  if (distanceFromCenter > threshold) {
    return dragX < centerX ? 'bottomLeft' : 'bottomRight';
  }

  return null;
};

/**
 * Calculate corner transition progress (0-1) based on drag position
 */
export const getCornerTransitionProgress = (
  dragX: number,
  screenWidth: number,
  currentCorner: 'bottomRight' | 'bottomLeft'
): number => {
  const centerX = screenWidth / 2;
  const deadZone = lunaSize.corner.drag.deadZone;
  const maxDistance = screenWidth / 2 - deadZone;

  const distanceFromCenter = Math.abs(dragX - centerX);

  // If within dead zone, no progress
  if (distanceFromCenter <= deadZone) {
    return 0;
  }

  // Calculate progress based on distance beyond dead zone
  const progress = Math.min((distanceFromCenter - deadZone) / maxDistance, 1);

  // Determine if dragging towards opposite corner
  const draggingLeft = dragX < centerX;
  const shouldTransition =
    (currentCorner === 'bottomRight' && draggingLeft) ||
    (currentCorner === 'bottomLeft' && !draggingLeft);

  return shouldTransition ? progress : 0;
};