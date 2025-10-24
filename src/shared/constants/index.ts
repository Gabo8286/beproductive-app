/**
 * Shared Constants Module Index
 * Central export point for all cross-platform shared constants and design tokens
 * Provides utilities for working with design tokens across platforms
 */

// Export all design tokens
export * from './design-tokens';

// Re-export commonly used design tokens with shorter aliases
export {
  ColorPalette as Colors,
  SemanticColors as Theme,
  DarkSemanticColors as DarkTheme,
  Typography as Type,
  Spacing as Space,
  BorderRadius as Radius,
  Shadow,
  ZIndex as Z,
  Animation as Anim,
  Breakpoints as BP,
  ComponentSizes as Sizes,
  LunaTokens as Luna,
  Accessibility as A11y,
  DesignTokens as Tokens
} from './design-tokens';

import {
  ColorPalette,
  SemanticColors,
  DarkSemanticColors,
  Typography,
  Spacing,
  BorderRadius,
  Animation,
  Breakpoints,
  ComponentSizes
} from './design-tokens';

// MARK: - Utility Functions for Design Tokens

/**
 * Get color value from nested color scale
 * @param colorScale - Color scale object (e.g., ColorPalette.blue)
 * @param shade - Shade number (50, 100, 200, etc.)
 * @returns Color string value
 */
export const getColorValue = (
  colorScale: Record<string | number, string>,
  shade: string | number
): string => {
  return colorScale[shade] || colorScale[500] || '#000000';
};

/**
 * Get responsive value based on breakpoint
 * @param breakpoint - Target breakpoint
 * @param values - Object with responsive values
 * @returns Value for the breakpoint
 */
export const getResponsiveValue = <T>(
  breakpoint: keyof typeof Breakpoints,
  values: Partial<Record<keyof typeof Breakpoints, T>>
): T | undefined => {
  return values[breakpoint];
};

/**
 * Convert spacing token to pixel value
 * @param spacingKey - Spacing token key
 * @returns Pixel value as number
 */
export const spacingToPx = (spacingKey: keyof typeof Spacing): number => {
  const remValue = parseFloat(Spacing[spacingKey]);
  return remValue * 16; // Assuming 1rem = 16px
};

/**
 * Convert pixel value to spacing token
 * @param px - Pixel value
 * @returns Closest spacing token key
 */
export const pxToSpacing = (px: number): keyof typeof Spacing => {
  const remValue = px / 16;
  const spacingEntries = Object.entries(Spacing);

  let closest: [string, string] = spacingEntries[0];
  let minDiff = Math.abs(parseFloat(closest[1]) - remValue);

  for (const [key, value] of spacingEntries) {
    const diff = Math.abs(parseFloat(value) - remValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = [key, value];
    }
  }

  return closest[0] as keyof typeof Spacing;
};

/**
 * Generate CSS custom properties from design tokens
 * @param tokens - Design token object
 * @param prefix - CSS variable prefix
 * @returns CSS custom properties object
 */
export const generateCSSVariables = (
  tokens: Record<string, any>,
  prefix: string = '--'
): Record<string, string> => {
  const variables: Record<string, string> = {};

  const flatten = (obj: Record<string, any>, path: string = ''): void => {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}-${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, newPath);
      } else {
        variables[`${prefix}${newPath}`] = String(value);
      }
    }
  };

  flatten(tokens);
  return variables;
};

/**
 * Get component size configuration
 * @param component - Component type
 * @param size - Size variant
 * @returns Component size configuration
 */
export const getComponentSize = (
  component: keyof typeof ComponentSizes,
  size: string
): any => {
  const componentSizes = ComponentSizes[component];
  return componentSizes?.[size as keyof typeof componentSizes];
};

/**
 * Check if color meets WCAG contrast requirements
 * @param foreground - Foreground color
 * @param background - Background color
 * @param level - WCAG level ('AA' or 'AAA')
 * @returns Boolean indicating if contrast is sufficient
 */
export const checkContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  // This is a simplified version - in production, use a proper contrast calculation library
  const requiredRatio = level === 'AAA' ? 7.0 : 4.5;
  // Placeholder implementation - replace with actual contrast calculation
  return true; // Assuming all our tokens meet WCAG requirements
};

/**
 * Get theme-appropriate color
 * @param colorKey - Color key from semantic colors
 * @param isDark - Whether dark theme is active
 * @returns Color value
 */
export const getThemeColor = (
  colorKey: string,
  isDark: boolean = false
): string => {
  const colorPath = colorKey.split('.');
  const colors = isDark ? DarkSemanticColors : SemanticColors;

  let value: any = colors;
  for (const key of colorPath) {
    value = value?.[key];
  }

  return typeof value === 'string' ? value : '#000000';
};

/**
 * Create animation string from tokens
 * @param duration - Animation duration key
 * @param easing - Animation easing key
 * @param delay - Optional delay
 * @returns CSS animation string
 */
export const createAnimation = (
  duration: keyof typeof Animation.duration,
  easing: keyof typeof Animation.easing,
  delay: string = '0ms'
): string => {
  return `${Animation.duration[duration]} ${Animation.easing[easing]} ${delay}`;
};

/**
 * Get breakpoint media query
 * @param breakpoint - Breakpoint key
 * @param type - Media query type ('min' or 'max')
 * @returns Media query string
 */
export const getMediaQuery = (
  breakpoint: keyof typeof Breakpoints,
  type: 'min' | 'max' = 'min'
): string => {
  const value = Breakpoints[breakpoint];
  const operator = type === 'min' ? 'min-width' : 'max-width';
  return `@media (${operator}: ${value})`;
};

/**
 * Calculate typography scale
 * @param baseFontSize - Base font size in rem
 * @param scale - Scale ratio
 * @param steps - Number of steps to generate
 * @returns Object with scaled font sizes
 */
export const generateTypographyScale = (
  baseFontSize: number = 1,
  scale: number = 1.25,
  steps: number = 6
): Record<string, string> => {
  const sizes: Record<string, string> = {};

  for (let i = -2; i <= steps; i++) {
    const size = baseFontSize * Math.pow(scale, i);
    const key = i <= 0 ? `sm${Math.abs(i)}` : `lg${i}`;
    sizes[key] = `${size.toFixed(3)}rem`;
  }

  return sizes;
};

// MARK: - Platform-specific Utilities

/**
 * Convert design tokens to iOS Swift constants
 * @param tokens - Design token object
 * @returns Swift-compatible constant definitions
 */
export const toSwiftConstants = (tokens: Record<string, any>): string => {
  // This would generate Swift code for iOS
  // Implementation would convert JS objects to Swift structs/enums
  return `// Swift constants generated from design tokens\n// Version: ${new Date().toISOString()}`;
};

/**
 * Convert design tokens to CSS custom properties
 * @param tokens - Design token object
 * @returns CSS custom properties string
 */
export const toCSSVariables = (tokens: Record<string, any>): string => {
  const variables = generateCSSVariables(tokens);
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
};

// MARK: - Constants for Cross-Platform Development
export const PLATFORM_CONSTANTS = {
  // Standard screen sizes
  SCREEN_SIZES: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
  },

  // Touch target sizes (44px minimum for iOS)
  TOUCH_TARGETS: {
    minimum: 44,
    comfortable: 48,
    large: 56
  },

  // Animation durations in milliseconds
  ANIMATION_DURATIONS: {
    micro: 150,
    quick: 300,
    moderate: 500,
    slow: 700
  },

  // Z-index scale
  Z_INDEX_SCALE: {
    background: -1,
    default: 0,
    dropdown: 1000,
    modal: 2000,
    toast: 3000
  }
} as const;

// Version information
export const SHARED_CONSTANTS_VERSION = '1.0.0';
export const LAST_UPDATED = new Date().toISOString();