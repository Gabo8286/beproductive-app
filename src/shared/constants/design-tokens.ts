/**
 * Design Tokens for Cross-Platform Consistency
 * Shared design constants that can be mirrored in Swift for iOS
 * WCAG AAA compliant with semantic naming for easy cross-platform adoption
 */

// MARK: - Color Palette (Raw Values)
export const ColorPalette = {
  // Primary Blue Scale
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary Gray Scale
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Success Green Scale
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },

  // Warning Orange Scale
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },

  // Error Red Scale
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },

  // Purple (Luna AI Brand)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },

  // High Contrast Colors
  contrast: {
    black: '#000000',
    white: '#ffffff',
    darkGray: '#1a1a1a',
    lightGray: '#f5f5f5'
  }
} as const;

// MARK: - Semantic Color Tokens
export const SemanticColors = {
  // Brand Colors
  brand: {
    primary: ColorPalette.blue[600],
    primaryHover: ColorPalette.blue[700],
    primaryActive: ColorPalette.blue[800],
    secondary: ColorPalette.gray[600],
    accent: ColorPalette.purple[600],
    luna: ColorPalette.purple[600]
  },

  // System Colors
  system: {
    success: ColorPalette.green[600],
    successLight: ColorPalette.green[100],
    warning: ColorPalette.orange[600],
    warningLight: ColorPalette.orange[100],
    error: ColorPalette.red[600],
    errorLight: ColorPalette.red[100],
    info: ColorPalette.blue[600],
    infoLight: ColorPalette.blue[100]
  },

  // Text Colors
  text: {
    primary: ColorPalette.gray[900],
    secondary: ColorPalette.gray[600],
    tertiary: ColorPalette.gray[400],
    inverse: ColorPalette.gray[50],
    disabled: ColorPalette.gray[300],
    link: ColorPalette.blue[600],
    linkHover: ColorPalette.blue[700]
  },

  // Background Colors
  background: {
    primary: ColorPalette.gray[50],
    secondary: ColorPalette.gray[100],
    tertiary: ColorPalette.gray[200],
    inverse: ColorPalette.gray[900],
    surface: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    frosted: 'rgba(255, 255, 255, 0.8)'
  },

  // Border Colors
  border: {
    primary: ColorPalette.gray[200],
    secondary: ColorPalette.gray[300],
    focus: ColorPalette.blue[500],
    error: ColorPalette.red[500],
    success: ColorPalette.green[500],
    warning: ColorPalette.orange[500]
  }
} as const;

// MARK: - Dark Theme Color Overrides
export const DarkSemanticColors = {
  text: {
    primary: ColorPalette.gray[50],
    secondary: ColorPalette.gray[300],
    tertiary: ColorPalette.gray[400],
    inverse: ColorPalette.gray[900],
    disabled: ColorPalette.gray[600],
    link: ColorPalette.blue[400],
    linkHover: ColorPalette.blue[300]
  },

  background: {
    primary: ColorPalette.gray[900],
    secondary: ColorPalette.gray[800],
    tertiary: ColorPalette.gray[700],
    inverse: ColorPalette.gray[50],
    surface: ColorPalette.gray[950],
    overlay: 'rgba(0, 0, 0, 0.7)',
    frosted: 'rgba(0, 0, 0, 0.8)'
  },

  border: {
    primary: ColorPalette.gray[700],
    secondary: ColorPalette.gray[600],
    focus: ColorPalette.blue[400],
    error: ColorPalette.red[400],
    success: ColorPalette.green[400],
    warning: ColorPalette.orange[400]
  }
} as const;

// MARK: - Typography Tokens
export const Typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif']
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem'   // 60px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;

// MARK: - Spacing Tokens
export const Spacing = {
  0: '0rem',      // 0px
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
} as const;

// MARK: - Border Radius Tokens
export const BorderRadius = {
  none: '0rem',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

// MARK: - Shadow Tokens
export const Shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000'
} as const;

// MARK: - Z-Index Tokens
export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  max: 2147483647
} as const;

// MARK: - Animation & Transition Tokens
export const Animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms'
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  }
} as const;

// MARK: - Breakpoint Tokens
export const Breakpoints = {
  xs: '320px',   // Small mobile
  sm: '640px',   // Large mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
} as const;

// MARK: - Component Size Tokens
export const ComponentSizes = {
  button: {
    xs: { height: '24px', padding: '4px 8px', fontSize: Typography.fontSize.xs },
    sm: { height: '32px', padding: '6px 12px', fontSize: Typography.fontSize.sm },
    md: { height: '40px', padding: '8px 16px', fontSize: Typography.fontSize.base },
    lg: { height: '48px', padding: '12px 20px', fontSize: Typography.fontSize.lg },
    xl: { height: '56px', padding: '16px 24px', fontSize: Typography.fontSize.xl }
  },

  input: {
    sm: { height: '32px', padding: '6px 12px', fontSize: Typography.fontSize.sm },
    md: { height: '40px', padding: '8px 16px', fontSize: Typography.fontSize.base },
    lg: { height: '48px', padding: '12px 20px', fontSize: Typography.fontSize.lg }
  },

  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '80px'
  }
} as const;

// MARK: - Luna AI Specific Tokens
export const LunaTokens = {
  colors: {
    primary: ColorPalette.purple[600],
    secondary: ColorPalette.purple[400],
    background: ColorPalette.purple[50],
    text: ColorPalette.purple[900],
    accent: ColorPalette.blue[500]
  },

  orbital: {
    radius: '120px',
    buttonSize: '48px',
    animationDuration: Animation.duration.normal,
    hoverScale: '1.1',
    activeScale: '0.95'
  },

  fab: {
    size: '56px',
    shadow: Shadow.lg,
    backgroundBlur: '10px',
    borderRadius: BorderRadius.full
  }
} as const;

// MARK: - Accessibility Tokens
export const Accessibility = {
  contrastRatio: {
    aa: 4.5,
    aaa: 7.0
  },

  focusRing: {
    width: '2px',
    color: SemanticColors.border.focus,
    style: 'solid',
    offset: '2px'
  },

  reducedMotion: {
    duration: Animation.duration.instant,
    easing: Animation.easing.linear
  },

  touchTarget: {
    minSize: '44px'
  }
} as const;

// MARK: - Export Design System Object
export const DesignTokens = {
  ColorPalette,
  SemanticColors,
  DarkSemanticColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadow,
  ZIndex,
  Animation,
  Breakpoints,
  ComponentSizes,
  LunaTokens,
  Accessibility
} as const;

// MARK: - Type Definitions for TypeScript
export type ColorPaletteType = typeof ColorPalette;
export type SemanticColorsType = typeof SemanticColors;
export type TypographyType = typeof Typography;
export type SpacingType = typeof Spacing;
export type BorderRadiusType = typeof BorderRadius;
export type ShadowType = typeof Shadow;
export type ZIndexType = typeof ZIndex;
export type AnimationType = typeof Animation;
export type BreakpointsType = typeof Breakpoints;
export type ComponentSizesType = typeof ComponentSizes;
export type LunaTokensType = typeof LunaTokens;
export type AccessibilityType = typeof Accessibility;

// MARK: - Design Token Version for Cross-Platform Sync
export const DESIGN_TOKENS_VERSION = '1.0.0';
export const PLATFORM_COMPATIBILITY = {
  web: true,
  ios: true,
  android: true, // Future compatibility
  swift: '>=5.7.0',
  css: '>=3.0'
};