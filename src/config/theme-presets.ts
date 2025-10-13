/**
 * Theme Presets Configuration
 * Defines predefined theme combinations for quick application
 */

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'auto' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontScale: number;
    lineHeight: number;
  };
  spacing: {
    scale: number;
    baseUnit: number;
  };
  borderRadius: {
    scale: number;
  };
  motion: {
    speedMultiplier: number;
    reducedMotion: boolean;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  // Light Themes
  {
    id: 'light-modern',
    name: 'Modern Light',
    description: 'Clean and contemporary with subtle shadows',
    category: 'light',
    colors: {
      primary: '#3b82f6', // Blue 500
      secondary: '#6366f1', // Indigo 500
      accent: '#06b6d4', // Cyan 500
      background: '#ffffff',
      surface: '#f8fafc', // Slate 50
      text: '#0f172a', // Slate 900
      textSecondary: '#64748b', // Slate 500
      border: '#e2e8f0', // Slate 200
      success: '#10b981', // Emerald 500
      warning: '#f59e0b', // Amber 500
      error: '#ef4444', // Red 500
      info: '#3b82f6', // Blue 500
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.5,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.0,
    },
    motion: {
      speedMultiplier: 1.0,
      reducedMotion: false,
    },
  },
  {
    id: 'light-warm',
    name: 'Warm Light',
    description: 'Cozy and inviting with warm orange accents',
    category: 'light',
    colors: {
      primary: '#ea580c', // Orange 600
      secondary: '#dc2626', // Red 600
      accent: '#f59e0b', // Amber 500
      background: '#fefdf8', // Warm white
      surface: '#fef7ed', // Orange 50
      text: '#1c1917', // Stone 900
      textSecondary: '#78716c', // Stone 500
      border: '#e7e5e4', // Stone 200
      success: '#16a34a', // Green 600
      warning: '#d97706', // Amber 600
      error: '#dc2626', // Red 600
      info: '#2563eb', // Blue 600
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.6,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.2,
    },
    motion: {
      speedMultiplier: 0.9,
      reducedMotion: false,
    },
  },
  {
    id: 'light-minimal',
    name: 'Minimal Light',
    description: 'Ultra-clean with maximum whitespace',
    category: 'light',
    colors: {
      primary: '#171717', // Neutral 900
      secondary: '#525252', // Neutral 600
      accent: '#737373', // Neutral 500
      background: '#ffffff',
      surface: '#fafafa', // Neutral 50
      text: '#171717', // Neutral 900
      textSecondary: '#737373', // Neutral 500
      border: '#e5e5e5', // Neutral 200
      success: '#22c55e', // Green 500
      warning: '#eab308', // Yellow 500
      error: '#ef4444', // Red 500
      info: '#6b7280', // Gray 500
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 0.95,
      lineHeight: 1.7,
    },
    spacing: {
      scale: 1.25,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 0.5,
    },
    motion: {
      speedMultiplier: 1.2,
      reducedMotion: false,
    },
  },

  // Dark Themes
  {
    id: 'dark-modern',
    name: 'Modern Dark',
    description: 'Sleek dark theme with blue accents',
    category: 'dark',
    colors: {
      primary: '#60a5fa', // Blue 400
      secondary: '#818cf8', // Indigo 400
      accent: '#22d3ee', // Cyan 400
      background: '#0f172a', // Slate 900
      surface: '#1e293b', // Slate 800
      text: '#f1f5f9', // Slate 100
      textSecondary: '#94a3b8', // Slate 400
      border: '#334155', // Slate 700
      success: '#34d399', // Emerald 400
      warning: '#fbbf24', // Amber 400
      error: '#f87171', // Red 400
      info: '#60a5fa', // Blue 400
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.5,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.0,
    },
    motion: {
      speedMultiplier: 1.0,
      reducedMotion: false,
    },
  },
  {
    id: 'dark-purple',
    name: 'Purple Dark',
    description: 'Rich purple theme for creative work',
    category: 'dark',
    colors: {
      primary: '#a855f7', // Purple 500
      secondary: '#ec4899', // Pink 500
      accent: '#8b5cf6', // Violet 500
      background: '#1e1b4b', // Indigo 900
      surface: '#312e81', // Indigo 800
      text: '#f8fafc', // Slate 50
      textSecondary: '#cbd5e1', // Slate 300
      border: '#4338ca', // Indigo 700
      success: '#10b981', // Emerald 500
      warning: '#f59e0b', // Amber 500
      error: '#ef4444', // Red 500
      info: '#6366f1', // Indigo 500
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.05,
      lineHeight: 1.6,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.3,
    },
    motion: {
      speedMultiplier: 0.8,
      reducedMotion: false,
    },
  },
  {
    id: 'dark-green',
    name: 'Forest Dark',
    description: 'Natural green theme for focus',
    category: 'dark',
    colors: {
      primary: '#22c55e', // Green 500
      secondary: '#059669', // Emerald 600
      accent: '#84cc16', // Lime 500
      background: '#052e16', // Green 950
      surface: '#14532d', // Green 900
      text: '#f0fdf4', // Green 50
      textSecondary: '#86efac', // Green 300
      border: '#166534', // Green 800
      success: '#22c55e', // Green 500
      warning: '#eab308', // Yellow 500
      error: '#dc2626', // Red 600
      info: '#06b6d4', // Cyan 500
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.5,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 0.8,
    },
    motion: {
      speedMultiplier: 1.1,
      reducedMotion: false,
    },
  },

  // High Contrast Themes
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'Maximum contrast for accessibility',
    category: 'light',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#0066cc',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#333333',
      border: '#000000',
      success: '#006600',
      warning: '#cc6600',
      error: '#cc0000',
      info: '#0066cc',
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.1,
      lineHeight: 1.6,
    },
    spacing: {
      scale: 1.2,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 0.3,
    },
    motion: {
      speedMultiplier: 0.5,
      reducedMotion: true,
    },
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'Maximum contrast dark theme',
    category: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#e6e6e6',
      accent: '#66ccff',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      success: '#66ff66',
      warning: '#ffcc66',
      error: '#ff6666',
      info: '#66ccff',
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.1,
      lineHeight: 1.6,
    },
    spacing: {
      scale: 1.2,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 0.3,
    },
    motion: {
      speedMultiplier: 0.5,
      reducedMotion: true,
    },
  },

  // Creative Themes
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm gradient inspired by golden hour',
    category: 'custom',
    colors: {
      primary: '#f97316', // Orange 500
      secondary: '#ec4899', // Pink 500
      accent: '#eab308', // Yellow 500
      background: '#fef3c7', // Amber 100
      surface: '#fef7ed', // Orange 50
      text: '#7c2d12', // Orange 900
      textSecondary: '#c2410c', // Orange 700
      border: '#fed7aa', // Orange 200
      success: '#15803d', // Green 700
      warning: '#d97706', // Amber 600
      error: '#dc2626', // Red 600
      info: '#1d4ed8', // Blue 700
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.5,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.5,
    },
    motion: {
      speedMultiplier: 0.9,
      reducedMotion: false,
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blues and teals like ocean depths',
    category: 'custom',
    colors: {
      primary: '#0891b2', // Cyan 600
      secondary: '#1e40af', // Blue 700
      accent: '#059669', // Emerald 600
      background: '#cffafe', // Cyan 50
      surface: '#e0f7fa',
      text: '#164e63', // Cyan 900
      textSecondary: '#0e7490', // Cyan 700
      border: '#a7f3d0', // Emerald 200
      success: '#047857', // Emerald 700
      warning: '#d97706', // Amber 600
      error: '#dc2626', // Red 600
      info: '#0369a1', // Sky 700
    },
    typography: {
      fontFamily: 'Inter',
      fontScale: 1.0,
      lineHeight: 1.5,
    },
    spacing: {
      scale: 1.0,
      baseUnit: 4,
    },
    borderRadius: {
      scale: 1.0,
    },
    motion: {
      speedMultiplier: 1.1,
      reducedMotion: false,
    },
  },
];

// Font Family Options
export const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'system', name: 'System', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'source-sans', name: 'Source Sans Pro', family: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'work-sans', name: 'Work Sans', family: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

// Size Scales
export const SIZE_SCALES = [
  { id: 'compact', name: 'Compact', scale: 0.875, description: 'Tight spacing for information density' },
  { id: 'normal', name: 'Normal', scale: 1.0, description: 'Standard comfortable spacing' },
  { id: 'comfortable', name: 'Comfortable', scale: 1.125, description: 'Generous spacing for relaxed use' },
  { id: 'spacious', name: 'Spacious', scale: 1.25, description: 'Maximum spacing for accessibility' },
];

// Motion Preferences
export const MOTION_PREFERENCES = [
  { id: 'reduced', name: 'Reduced Motion', speedMultiplier: 0.1, reducedMotion: true },
  { id: 'standard', name: 'Standard', speedMultiplier: 1.0, reducedMotion: false },
  { id: 'enhanced', name: 'Enhanced', speedMultiplier: 1.3, reducedMotion: false },
];

// Utility functions
export function getThemePresetById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find(preset => preset.id === id);
}

export function getThemePresetsByCategory(category: ThemePreset['category']): ThemePreset[] {
  return THEME_PRESETS.filter(preset => preset.category === category);
}

export function getFontFamilyById(id: string) {
  return FONT_FAMILIES.find(font => font.id === id);
}

export function getSizeScaleById(id: string) {
  return SIZE_SCALES.find(scale => scale.id === id);
}

export function getMotionPreferenceById(id: string) {
  return MOTION_PREFERENCES.find(motion => motion.id === id);
}