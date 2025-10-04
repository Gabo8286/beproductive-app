/**
 * Theme utilities for BeProductive v2
 * Provides comprehensive theme management with accessibility support
 */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  cssClass: string;
  dataAttribute: string;
  contrastRatio: number;
  isAccessible: boolean;
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Light mode with comfortable contrast for day use',
    cssClass: 'light',
    dataAttribute: 'light',
    contrastRatio: 4.5,
    isAccessible: true
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: 'Dark mode for reduced eye strain in low light',
    cssClass: 'dark',
    dataAttribute: 'dark',
    contrastRatio: 7.0,
    isAccessible: true
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'High Contrast',
    description: 'Maximum contrast for accessibility compliance (WCAG AAA)',
    cssClass: 'high-contrast',
    dataAttribute: 'high-contrast',
    contrastRatio: 7.0,
    isAccessible: true
  },
  system: {
    name: 'system',
    displayName: 'System',
    description: 'Follow system preference automatically',
    cssClass: 'system',
    dataAttribute: 'system',
    contrastRatio: 4.5,
    isAccessible: true
  }
};

/**
 * Get the effective theme based on system preferences
 */
export function getEffectiveTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme !== 'system') {
    return theme;
  }

  // Check system preference
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    if (prefersHighContrast) {
      return 'high-contrast';
    }

    return prefersDark ? 'dark' : 'light';
  }

  return 'light'; // Default fallback
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const effectiveTheme = getEffectiveTheme(theme);
  const config = themeConfigs[effectiveTheme];

  // Remove all theme classes
  Object.values(themeConfigs).forEach(({ cssClass }) => {
    document.documentElement.classList.remove(cssClass);
  });

  // Add current theme class
  document.documentElement.classList.add(config.cssClass);

  // Set data attribute
  document.documentElement.setAttribute('data-theme', config.dataAttribute);

  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(effectiveTheme);

  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', {
    detail: { theme: effectiveTheme, config }
  }));
}

/**
 * Update meta theme-color for mobile browsers
 */
function updateMetaThemeColor(theme: Exclude<Theme, 'system'>): void {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  const colors = {
    light: '#ffffff',
    dark: '#0f172a',
    'high-contrast': '#000000'
  };

  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', colors[theme]);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = colors[theme];
    document.head.appendChild(meta);
  }
}

/**
 * Get theme from localStorage with fallback
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = localStorage.getItem('theme') as Theme;
    return stored && Object.keys(themeConfigs).includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Store theme in localStorage
 */
export function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Failed to store theme preference:', error);
  }
}

/**
 * Check if current theme meets accessibility standards
 */
export function isThemeAccessible(theme: Theme): boolean {
  const config = themeConfigs[theme];
  return config.isAccessible && config.contrastRatio >= 4.5;
}

/**
 * Get recommended theme based on user preferences and accessibility needs
 */
export function getRecommendedTheme(options: {
  prefersDark?: boolean;
  needsHighContrast?: boolean;
  followSystem?: boolean;
}): Theme {
  const { prefersDark, needsHighContrast, followSystem } = options;

  if (needsHighContrast) {
    return 'high-contrast';
  }

  if (followSystem) {
    return 'system';
  }

  return prefersDark ? 'dark' : 'light';
}

/**
 * Listen for system theme changes
 */
export function setupSystemThemeListener(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

  const handleChange = () => {
    const prefersDark = darkModeQuery.matches;
    const prefersHighContrast = highContrastQuery.matches;

    let newTheme: Theme = 'light';
    if (prefersHighContrast) {
      newTheme = 'high-contrast';
    } else if (prefersDark) {
      newTheme = 'dark';
    }

    callback(newTheme);
  };

  darkModeQuery.addEventListener('change', handleChange);
  highContrastQuery.addEventListener('change', handleChange);

  // Cleanup function
  return () => {
    darkModeQuery.removeEventListener('change', handleChange);
    highContrastQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Get CSS custom property value for current theme
 */
export function getThemeValue(property: string): string {
  if (typeof window === 'undefined') return '';

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${property}`);

  return value.trim();
}

/**
 * Generate theme-aware color palette
 */
export function generateThemeColors(baseColor: string, theme: Theme): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
} {
  const effectiveTheme = getEffectiveTheme(theme);

  // This would typically use a color manipulation library
  // For now, return theme-appropriate defaults
  const colorSchemes = {
    light: {
      primary: baseColor,
      secondary: '#f1f5f9',
      accent: '#e2e8f0',
      background: '#ffffff',
      foreground: '#0f172a'
    },
    dark: {
      primary: baseColor,
      secondary: '#1e293b',
      accent: '#334155',
      background: '#0f172a',
      foreground: '#f8fafc'
    },
    'high-contrast': {
      primary: '#0066cc',
      secondary: '#333333',
      accent: '#666666',
      background: '#000000',
      foreground: '#ffffff'
    }
  };

  return colorSchemes[effectiveTheme];
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): boolean {
  const required = ['name', 'displayName', 'cssClass', 'dataAttribute'];
  return required.every(field => field in config && config[field as keyof ThemeConfig]);
}

export default {
  themeConfigs,
  getEffectiveTheme,
  applyTheme,
  getStoredTheme,
  storeTheme,
  isThemeAccessible,
  getRecommendedTheme,
  setupSystemThemeListener,
  getThemeValue,
  generateThemeColors,
  validateThemeConfig
};