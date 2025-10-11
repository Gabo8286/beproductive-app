import { useConfig } from '@/contexts/ConfigContext';
import { useMemo, useCallback } from 'react';
import type { ThemeName } from '@/config/app.config';

export function useAppConfig() {
  const { state, setTheme, updateThemeColors, updateComponentConfig, updateFeatureConfig } = useConfig();

  const theme = useMemo(() => state.config.theme, [state.config.theme]);
  const currentThemeName = useMemo(() => state.currentTheme, [state.currentTheme]);
  const components = useMemo(() => state.config.components, [state.config.components]);
  const features = useMemo(() => state.config.features, [state.config.features]);

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeName = currentThemeName === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [currentThemeName, setTheme]);

  const isDark = useMemo(() => currentThemeName === 'dark', [currentThemeName]);
  const isLight = useMemo(() => currentThemeName === 'light', [currentThemeName]);

  // Utility functions for accessing theme values
  const getColor = useCallback((path: string) => {
    const keys = path.split('.');
    let value: any = theme.colors;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    return value || '';
  }, [theme.colors]);

  const getSpacing = useCallback((size: keyof typeof theme.spacing) => {
    return theme.spacing[size] || theme.spacing.md;
  }, [theme.spacing]);

  const getFontSize = useCallback((size: keyof typeof theme.typography.fontSize) => {
    return theme.typography.fontSize[size] || theme.typography.fontSize.base;
  }, [theme.typography.fontSize]);

  const getBorderRadius = useCallback((size: keyof typeof theme.borderRadius) => {
    return theme.borderRadius[size] || theme.borderRadius.md;
  }, [theme.borderRadius]);

  const getShadow = useCallback((level: keyof typeof theme.shadows) => {
    return theme.shadows[level] || theme.shadows.md;
  }, [theme.shadows]);

  // CSS custom property getters
  const getCSSVar = useCallback((varName: string) => {
    return `var(--${varName})`;
  }, []);

  const getColorVar = useCallback((colorPath: string) => {
    return getCSSVar(`color-${colorPath.replace('.', '-')}`);
  }, [getCSSVar]);

  const getSpacingVar = useCallback((size: string) => {
    return getCSSVar(`spacing-${size}`);
  }, [getCSSVar]);

  // Component configuration getters
  const getComponentConfig = useCallback((componentName: string) => {
    return components[componentName as keyof typeof components];
  }, [components]);

  const getButtonConfig = useCallback(() => components.button, [components.button]);
  const getCardConfig = useCallback(() => components.card, [components.card]);
  const getModalConfig = useCallback(() => components.modal, [components.modal]);
  const getInputConfig = useCallback(() => components.input, [components.input]);

  // Feature configuration getters
  const getFeatureConfig = useCallback((featureName: string) => {
    return features[featureName as keyof typeof features];
  }, [features]);

  const isFeatureEnabled = useCallback((featureName: string) => {
    const feature = features[featureName as keyof typeof features];
    return feature && 'enabled' in feature ? feature.enabled : false;
  }, [features]);

  return {
    // Theme
    theme,
    currentTheme: currentThemeName,
    setTheme,
    toggleTheme,
    updateColors: updateThemeColors,
    isDark,
    isLight,

    // Components
    components,
    updateComponentConfig,
    getComponentConfig,
    getButtonConfig,
    getCardConfig,
    getModalConfig,
    getInputConfig,

    // Features
    features,
    updateFeatureConfig,
    getFeatureConfig,
    isFeatureEnabled,

    // Value getters
    getColor,
    getSpacing,
    getFontSize,
    getBorderRadius,
    getShadow,

    // CSS variable getters
    getCSSVar,
    getColorVar,
    getSpacingVar,

    // Configuration state
    isLoading: state.isLoading,
    isDirty: state.isDirty,

    // Common color shortcuts
    colors: {
      primary: getColor('primary'),
      secondary: getColor('secondary'),
      accent: getColor('accent'),
      success: getColor('success'),
      warning: getColor('warning'),
      error: getColor('error'),
      info: getColor('info'),
      background: getColor('background'),
      surface: getColor('surface'),
      text: {
        primary: getColor('text.primary'),
        secondary: getColor('text.secondary'),
        muted: getColor('text.muted'),
        inverse: getColor('text.inverse'),
      },
      border: getColor('border'),
    },

    // CSS variable shortcuts
    cssVars: {
      primary: getColorVar('primary'),
      secondary: getColorVar('secondary'),
      accent: getColorVar('accent'),
      background: getColorVar('background'),
      surface: getColorVar('surface'),
      textPrimary: getColorVar('text-primary'),
      textSecondary: getColorVar('text-secondary'),
      border: getColorVar('border'),
    }
  };
}