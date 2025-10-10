// Luna Asset Management
export type LunaSize = 'tiny' | 'small' | 'medium' | 'large' | 'hero';
export type LunaExpression = 'default' | 'happy' | 'thinking' | 'confused' | 'excited' | 'success' | 'error' | 'focused' | 'curious';

export interface LunaAssetConfig {
  size: LunaSize;
  expression: LunaExpression;
  filename: string;
  fallback?: string;
}

// Luna color palette from specifications
export const LUNA_COLORS = {
  // Primary fur colors
  furPrimary: '#2B5A9E',      // Deep blue
  furLight: '#4A7BC8',         // Light blue highlight
  furShadow: '#1E3A6B',        // Dark blue shadow

  // Accent colors
  orangePrimary: '#FF9933',    // Orange markings
  orangeLight: '#FFB366',      // Light orange
  orangeDark: '#E67E00',       // Dark orange

  // Facial features
  eyeOuter: '#1A1A1A',         // Eye outline
  eyeAmber: '#FF8800',         // Eye color
  eyeHighlight: '#FFFFFF',     // Eye shine
  nose: '#2C2C2C',             // Nose

  // Chest/accents
  cream: '#FFE6B3',            // Cream chest
  white: '#FFFFFF',            // White markings

  // Lantern
  lanternBronze: '#8B6914',    // Bronze metal
  lanternGold: '#B8860B',      // Gold highlights
  lanternGlow: '#FFD700',      // Warm glow
  lanternLight: '#FFF4D6',     // Light emission

  // Magical effects
  glowGreen: '#D4FF8F',        // Paw print glow
  glowYellow: '#FFEB8F',       // Alternative glow
  sparkle: '#E8F4FF',          // Sparkle/star color
} as const;

// Size specifications for different Luna variants
export const LUNA_SIZES = {
  tiny: { width: 24, height: 24, description: 'Notifications, badges, inline mentions' },
  small: { width: 40, height: 40, description: 'Chat bubbles, FAB menu, floating avatar' },
  medium: { width: 80, height: 80, description: 'Empty states, cards, modal headers' },
  large: { width: 120, height: 120, description: 'Onboarding, full-screen interactions' },
  hero: { width: 200, height: 200, description: 'Splash screen, celebrations, marketing' },
} as const;

/**
 * Get the path to a Luna asset based on size and expression
 */
export function getLunaAsset(size: LunaSize, expression: LunaExpression = 'default'): string {
  return `/src/assets/luna/${size}/luna-${size}-${expression}.svg`;
}

/**
 * Get Luna asset with fallback to emoji for development
 */
export function getLunaAssetWithFallback(size: LunaSize, expression: LunaExpression = 'default'): string {
  // For now, return fox emoji as placeholder until we have actual assets
  // In production, this would return the actual SVG path
  return '🦊';
}

/**
 * Get the appropriate Luna size for a given pixel dimension
 */
export function getLunaSizeForDimension(dimension: number): LunaSize {
  if (dimension <= 24) return 'tiny';
  if (dimension <= 40) return 'small';
  if (dimension <= 80) return 'medium';
  if (dimension <= 120) return 'large';
  return 'hero';
}

/**
 * Get Luna expression based on application state
 */
export function getLunaExpressionForState(state: 'idle' | 'loading' | 'success' | 'error' | 'excited'): LunaExpression {
  switch (state) {
    case 'loading':
      return 'thinking';
    case 'success':
      return 'happy';
    case 'error':
      return 'confused';
    case 'excited':
      return 'excited';
    default:
      return 'default';
  }
}

// Asset preload configuration for performance
export const LUNA_PRELOAD_ASSETS: LunaAssetConfig[] = [
  { size: 'small', expression: 'default', filename: 'luna-small-default.svg' },
  { size: 'small', expression: 'thinking', filename: 'luna-small-thinking.svg' },
  { size: 'medium', expression: 'default', filename: 'luna-medium-default.svg' },
  { size: 'large', expression: 'default', filename: 'luna-large-default.svg' },
];

/**
 * Preload critical Luna assets for better performance
 */
export function preloadLunaAssets(): void {
  if (typeof window === 'undefined') return;

  LUNA_PRELOAD_ASSETS.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getLunaAsset(asset.size, asset.expression);
    document.head.appendChild(link);
  });
}