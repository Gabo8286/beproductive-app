/**
 * Luna AI Framework - Assets Module
 * Centralized Luna visual assets and branding management
 * Cross-platform compatible asset handling
 */

import { LunaSize, LunaExpression, LunaAssetConfig, LunaVisualState } from './types';

// MARK: - Luna Visual Assets

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

export const LUNA_SIZES = {
  tiny: {
    width: 24,
    height: 24,
    description: 'Notifications, badges, inline mentions',
    scaleFactor: 0.5
  },
  small: {
    width: 40,
    height: 40,
    description: 'Chat bubbles, FAB menu, floating avatar',
    scaleFactor: 0.8
  },
  medium: {
    width: 80,
    height: 80,
    description: 'Empty states, cards, modal headers',
    scaleFactor: 1.0
  },
  large: {
    width: 120,
    height: 120,
    description: 'Onboarding, full-screen interactions',
    scaleFactor: 1.5
  },
  hero: {
    width: 200,
    height: 200,
    description: 'Splash screen, celebrations, marketing',
    scaleFactor: 2.0
  },
} as const;

export const LUNA_EXPRESSIONS = {
  default: {
    emoji: '🦊',
    description: 'Neutral, attentive expression',
    mood: 'neutral',
    useCase: 'Default state, waiting for input'
  },
  happy: {
    emoji: '😊',
    description: 'Pleased, satisfied expression',
    mood: 'positive',
    useCase: 'Task completed successfully'
  },
  thinking: {
    emoji: '🤔',
    description: 'Concentrated, processing expression',
    mood: 'focused',
    useCase: 'Processing request, analyzing'
  },
  confused: {
    emoji: '😕',
    description: 'Puzzled, uncertain expression',
    mood: 'uncertain',
    useCase: 'Unable to understand request'
  },
  excited: {
    emoji: '🤩',
    description: 'Enthusiastic, energetic expression',
    mood: 'energetic',
    useCase: 'Discovered insight, celebration'
  },
  success: {
    emoji: '✅',
    description: 'Achievement, completion expression',
    mood: 'accomplished',
    useCase: 'Major task completion, milestone'
  },
  error: {
    emoji: '😔',
    description: 'Apologetic, concerned expression',
    mood: 'apologetic',
    useCase: 'Error occurred, failed request'
  },
  focused: {
    emoji: '🎯',
    description: 'Intense concentration expression',
    mood: 'concentrated',
    useCase: 'Deep work mode, complex analysis'
  },
  curious: {
    emoji: '🧐',
    description: 'Inquisitive, investigative expression',
    mood: 'investigative',
    useCase: 'Learning new information, exploring'
  },
  sleeping: {
    emoji: '😴',
    description: 'Resting, inactive expression',
    mood: 'inactive',
    useCase: 'Do not disturb mode, after hours'
  },
  busy: {
    emoji: '⚡',
    description: 'Active, working expression',
    mood: 'active',
    useCase: 'Multiple tasks, high activity'
  }
} as const;

// MARK: - Asset Management Class

export class LunaAssetManager {
  private static instance: LunaAssetManager;
  private assetCache: Map<string, string> = new Map();
  private preloadedAssets: Set<string> = new Set();

  static getInstance(): LunaAssetManager {
    if (!LunaAssetManager.instance) {
      LunaAssetManager.instance = new LunaAssetManager();
    }
    return LunaAssetManager.instance;
  }

  /**
   * Get Luna asset path with intelligent fallback
   */
  getLunaAsset(size: LunaSize, expression: LunaExpression = 'default'): string {
    const assetKey = `${size}-${expression}`;

    // Check cache first
    if (this.assetCache.has(assetKey)) {
      return this.assetCache.get(assetKey)!;
    }

    // Try to get actual SVG asset
    const assetPath = `/assets/luna/${size}/luna-${size}-${expression}.svg`;

    // For now, cache and return the path (in production, would validate existence)
    this.assetCache.set(assetKey, assetPath);
    return assetPath;
  }

  /**
   * Get Luna asset with emoji fallback for development/degraded states
   */
  getLunaAssetWithFallback(size: LunaSize, expression: LunaExpression = 'default'): string {
    // In production environments, try to get the actual asset
    if (this.isProductionEnvironment()) {
      return this.getLunaAsset(size, expression);
    }

    // Development fallback to emoji
    const expressionData = LUNA_EXPRESSIONS[expression];
    return expressionData ? expressionData.emoji : '🦊';
  }

  /**
   * Get appropriate Luna size for pixel dimensions
   */
  getLunaSizeForDimension(dimension: number): LunaSize {
    if (dimension <= 24) return 'tiny';
    if (dimension <= 40) return 'small';
    if (dimension <= 80) return 'medium';
    if (dimension <= 120) return 'large';
    return 'hero';
  }

  /**
   * Get Luna expression based on application state
   */
  getLunaExpressionForState(state: string): LunaExpression {
    const stateMap: Record<string, LunaExpression> = {
      idle: 'default',
      loading: 'thinking',
      processing: 'focused',
      success: 'happy',
      completed: 'success',
      error: 'error',
      failed: 'confused',
      excited: 'excited',
      analyzing: 'curious',
      sleeping: 'sleeping',
      busy: 'busy',
      working: 'focused'
    };

    return stateMap[state.toLowerCase()] || 'default';
  }

  /**
   * Create visual state object for Luna
   */
  createVisualState(
    size: LunaSize = 'medium',
    expression: LunaExpression = 'default',
    isAnimating: boolean = false,
    animationType?: string
  ): LunaVisualState {
    return {
      size,
      expression,
      isAnimating,
      animationType: animationType as any,
      customProps: {
        timestamp: Date.now(),
        assetUrl: this.getLunaAsset(size, expression)
      }
    };
  }

  /**
   * Preload critical Luna assets for performance
   */
  async preloadCriticalAssets(): Promise<void> {
    if (typeof window === 'undefined') return;

    const criticalAssets: LunaAssetConfig[] = [
      { size: 'small', expression: 'default', filename: 'luna-small-default.svg' },
      { size: 'small', expression: 'thinking', filename: 'luna-small-thinking.svg' },
      { size: 'medium', expression: 'default', filename: 'luna-medium-default.svg' },
      { size: 'medium', expression: 'happy', filename: 'luna-medium-happy.svg' },
      { size: 'large', expression: 'default', filename: 'luna-large-default.svg' },
    ];

    const preloadPromises = criticalAssets.map(async (asset) => {
      const assetUrl = this.getLunaAsset(asset.size, asset.expression);

      if (!this.preloadedAssets.has(assetUrl)) {
        try {
          await this.preloadAsset(assetUrl);
          this.preloadedAssets.add(assetUrl);
        } catch (error) {
          console.warn(`Failed to preload Luna asset: ${assetUrl}`, error);
        }
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('🦊 Luna: Critical assets preloaded');
  }

  /**
   * Get asset configuration for a specific use case
   */
  getAssetConfigForUseCase(useCase: string): { size: LunaSize; expression: LunaExpression } {
    const useCaseMap: Record<string, { size: LunaSize; expression: LunaExpression }> = {
      'notification': { size: 'tiny', expression: 'default' },
      'chat': { size: 'small', expression: 'default' },
      'fab': { size: 'small', expression: 'happy' },
      'empty-state': { size: 'medium', expression: 'curious' },
      'loading': { size: 'medium', expression: 'thinking' },
      'error': { size: 'medium', expression: 'confused' },
      'success': { size: 'medium', expression: 'success' },
      'onboarding': { size: 'large', expression: 'excited' },
      'welcome': { size: 'hero', expression: 'happy' },
      'celebration': { size: 'hero', expression: 'excited' }
    };

    return useCaseMap[useCase] || { size: 'medium', expression: 'default' };
  }

  /**
   * Generate CSS variables for Luna theming
   */
  generateLunaThemeCSS(): Record<string, string> {
    const cssVars: Record<string, string> = {};

    // Add color variables
    Object.entries(LUNA_COLORS).forEach(([key, value]) => {
      cssVars[`--luna-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    });

    // Add size variables
    Object.entries(LUNA_SIZES).forEach(([size, config]) => {
      cssVars[`--luna-size-${size}-width`] = `${config.width}px`;
      cssVars[`--luna-size-${size}-height`] = `${config.height}px`;
      cssVars[`--luna-size-${size}-scale`] = config.scaleFactor.toString();
    });

    return cssVars;
  }

  /**
   * Get Luna animation configuration
   */
  getAnimationConfig(animationType: string) {
    const animations = {
      idle: {
        duration: '2s',
        easing: 'ease-in-out',
        iteration: 'infinite',
        keyframes: 'luna-idle-float'
      },
      thinking: {
        duration: '1s',
        easing: 'linear',
        iteration: 'infinite',
        keyframes: 'luna-thinking-pulse'
      },
      celebration: {
        duration: '0.6s',
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        iteration: '1',
        keyframes: 'luna-celebration-bounce'
      },
      entrance: {
        duration: '0.4s',
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        iteration: '1',
        keyframes: 'luna-entrance-scale'
      },
      exit: {
        duration: '0.3s',
        easing: 'ease-in',
        iteration: '1',
        keyframes: 'luna-exit-fade'
      }
    };

    return animations[animationType as keyof typeof animations] || animations.idle;
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.assetCache.clear();
    this.preloadedAssets.clear();
    console.log('🧹 Luna Assets: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedAssets: this.assetCache.size,
      preloadedAssets: this.preloadedAssets.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // MARK: - Private Helper Methods

  private async preloadAsset(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      document.head.appendChild(link);

      // Clean up after preload
      setTimeout(() => {
        document.head.removeChild(link);
      }, 100);
    });
  }

  private isProductionEnvironment(): boolean {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  }

  private estimateMemoryUsage(): number {
    // Simplified memory estimation in KB
    return (this.assetCache.size * 0.5) + (this.preloadedAssets.size * 2);
  }
}

// MARK: - Utility Functions

/**
 * Get Luna asset with fallback
 */
export function getLunaAssetWithFallback(
  size: LunaSize,
  expression: LunaExpression = 'default'
): string {
  return LunaAssetManager.getInstance().getLunaAssetWithFallback(size, expression);
}

/**
 * Get Luna expression for application state
 */
export function getLunaExpressionForState(state: string): LunaExpression {
  return LunaAssetManager.getInstance().getLunaExpressionForState(state);
}

/**
 * Create Luna visual state
 */
export function createLunaVisualState(
  size: LunaSize = 'medium',
  expression: LunaExpression = 'default',
  isAnimating: boolean = false
): LunaVisualState {
  return LunaAssetManager.getInstance().createVisualState(size, expression, isAnimating);
}

/**
 * Preload Luna assets
 */
export async function preloadLunaAssets(): Promise<void> {
  return LunaAssetManager.getInstance().preloadCriticalAssets();
}

/**
 * Generate Luna theme CSS variables
 */
export function generateLunaCSS(): string {
  const variables = LunaAssetManager.getInstance().generateLunaThemeCSS();
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

// Export singleton instance
export const lunaAssets = LunaAssetManager.getInstance();