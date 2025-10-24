/**
 * Theme Customization Service
 * Advanced theming and appearance customization for Luna navigation
 */

import { NavigationHubId } from '@/types/navigation';

export interface ThemeColors {
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
}

export interface HubCustomization {
  hubId: NavigationHubId;
  color: string;
  icon?: string;
  name?: string;
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
  customIcon?: string; // Base64 or URL
}

export interface NavigationTheme {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'custom' | 'community';
  colors: ThemeColors;
  hubCustomizations: HubCustomization[];
  appearance: {
    borderRadius: number;
    shadowIntensity: number;
    animationSpeed: number;
    glassmorphism: boolean;
    gradients: boolean;
    patterns: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    colorBlindFriendly: boolean;
  };
  author?: string;
  version: string;
  preview?: string; // Base64 image
}

export interface CustomizationPreferences {
  activeTheme: string;
  customThemes: NavigationTheme[];
  hubCustomizations: HubCustomization[];
  globalSettings: {
    showAnimations: boolean;
    useSystemColors: boolean;
    autoSwitchTheme: boolean; // Based on time of day
    seasonalThemes: boolean;
  };
}

class ThemeCustomizationService {
  private themes: Map<string, NavigationTheme> = new Map();
  private preferences: CustomizationPreferences;
  private cssVariables: Map<string, string> = new Map();

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.initializeSystemThemes();
    this.loadCustomPreferences();
    this.setupThemeWatchers();
  }

  /**
   * Initialize system themes
   */
  private initializeSystemThemes(): void {
    // Luna Default Theme
    this.registerTheme({
      id: 'luna-default',
      name: 'Luna Default',
      description: 'The classic Luna navigation experience',
      category: 'system',
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#8B5CF6',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#334155',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
      },
      hubCustomizations: [
        { hubId: 'capture-productivity', color: 'bg-blue-500 hover:bg-blue-600' },
        { hubId: 'planning-time', color: 'bg-green-500 hover:bg-green-600' },
        { hubId: 'engage-collaboration', color: 'bg-purple-500 hover:bg-purple-600' },
        { hubId: 'profile-user', color: 'bg-gray-500 hover:bg-gray-600' },
        { hubId: 'insights-growth', color: 'bg-orange-500 hover:bg-orange-600' },
        { hubId: 'advanced-admin', color: 'bg-red-500 hover:bg-red-600' },
        { hubId: 'search-assistant', color: 'bg-indigo-500 hover:bg-indigo-600' },
      ],
      appearance: {
        borderRadius: 12,
        shadowIntensity: 0.3,
        animationSpeed: 1.0,
        glassmorphism: true,
        gradients: true,
        patterns: false,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindFriendly: false,
      },
      version: '1.0.0',
    });

    // High Contrast Theme
    this.registerTheme({
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum contrast for accessibility',
      category: 'system',
      colors: {
        primary: '#FFFFFF',
        secondary: '#000000',
        accent: '#FFD700',
        background: '#000000',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#E0E0E0',
        border: '#FFFFFF',
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0000',
        info: '#00FFFF',
      },
      hubCustomizations: [
        { hubId: 'capture-productivity', color: 'bg-white hover:bg-gray-100 text-black' },
        { hubId: 'planning-time', color: 'bg-yellow-400 hover:bg-yellow-300 text-black' },
        { hubId: 'engage-collaboration', color: 'bg-cyan-400 hover:bg-cyan-300 text-black' },
        { hubId: 'profile-user', color: 'bg-gray-300 hover:bg-gray-200 text-black' },
        { hubId: 'insights-growth', color: 'bg-orange-400 hover:bg-orange-300 text-black' },
        { hubId: 'advanced-admin', color: 'bg-red-400 hover:bg-red-300 text-black' },
        { hubId: 'search-assistant', color: 'bg-blue-400 hover:bg-blue-300 text-black' },
      ],
      appearance: {
        borderRadius: 4,
        shadowIntensity: 0.8,
        animationSpeed: 0.5,
        glassmorphism: false,
        gradients: false,
        patterns: false,
      },
      accessibility: {
        highContrast: true,
        reducedMotion: true,
        largeText: true,
        colorBlindFriendly: true,
      },
      version: '1.0.0',
    });

    // Minimalist Theme
    this.registerTheme({
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Clean and simple design',
      category: 'system',
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#7C3AED',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1E293B',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0284C7',
      },
      hubCustomizations: [
        { hubId: 'capture-productivity', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200' },
        { hubId: 'planning-time', color: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200' },
        { hubId: 'engage-collaboration', color: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200' },
        { hubId: 'profile-user', color: 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200' },
        { hubId: 'insights-growth', color: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200' },
        { hubId: 'advanced-admin', color: 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' },
        { hubId: 'search-assistant', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200' },
      ],
      appearance: {
        borderRadius: 8,
        shadowIntensity: 0.1,
        animationSpeed: 0.8,
        glassmorphism: false,
        gradients: false,
        patterns: false,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindFriendly: false,
      },
      version: '1.0.0',
    });

    // Cyberpunk Theme
    this.registerTheme({
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Futuristic neon aesthetics',
      category: 'system',
      colors: {
        primary: '#00FFFF',
        secondary: '#FF00FF',
        accent: '#FFFF00',
        background: '#0A0A0A',
        surface: '#1A0A1A',
        text: '#00FFFF',
        textSecondary: '#FF00FF',
        border: '#00FFFF',
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0040',
        info: '#0080FF',
      },
      hubCustomizations: [
        { hubId: 'capture-productivity', color: 'bg-cyan-900 hover:bg-cyan-800 text-cyan-300 border-cyan-500' },
        { hubId: 'planning-time', color: 'bg-green-900 hover:bg-green-800 text-green-300 border-green-500' },
        { hubId: 'engage-collaboration', color: 'bg-purple-900 hover:bg-purple-800 text-purple-300 border-purple-500' },
        { hubId: 'profile-user', color: 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-500' },
        { hubId: 'insights-growth', color: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300 border-yellow-500' },
        { hubId: 'advanced-admin', color: 'bg-red-900 hover:bg-red-800 text-red-300 border-red-500' },
        { hubId: 'search-assistant', color: 'bg-blue-900 hover:bg-blue-800 text-blue-300 border-blue-500' },
      ],
      appearance: {
        borderRadius: 0,
        shadowIntensity: 0.6,
        animationSpeed: 1.2,
        glassmorphism: false,
        gradients: true,
        patterns: true,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindFriendly: false,
      },
      version: '1.0.0',
    });

    // Nature Theme
    this.registerTheme({
      id: 'nature',
      name: 'Nature',
      description: 'Earth tones and organic feel',
      category: 'system',
      colors: {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#84CC16',
        background: '#1C2E1C',
        surface: '#2D3D2D',
        text: '#ECFDF5',
        textSecondary: '#A7F3D0',
        border: '#047857',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
      },
      hubCustomizations: [
        { hubId: 'capture-productivity', color: 'bg-emerald-600 hover:bg-emerald-700' },
        { hubId: 'planning-time', color: 'bg-green-600 hover:bg-green-700' },
        { hubId: 'engage-collaboration', color: 'bg-teal-600 hover:bg-teal-700' },
        { hubId: 'profile-user', color: 'bg-slate-600 hover:bg-slate-700' },
        { hubId: 'insights-growth', color: 'bg-lime-600 hover:bg-lime-700' },
        { hubId: 'advanced-admin', color: 'bg-amber-600 hover:bg-amber-700' },
        { hubId: 'search-assistant', color: 'bg-cyan-600 hover:bg-cyan-700' },
      ],
      appearance: {
        borderRadius: 16,
        shadowIntensity: 0.2,
        animationSpeed: 0.9,
        glassmorphism: true,
        gradients: true,
        patterns: true,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindFriendly: true,
      },
      version: '1.0.0',
    });
  }

  /**
   * Register a theme
   */
  public registerTheme(theme: NavigationTheme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get all available themes
   */
  public getAllThemes(): NavigationTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get theme by ID
   */
  public getTheme(themeId: string): NavigationTheme | null {
    return this.themes.get(themeId) || null;
  }

  /**
   * Get current active theme
   */
  public getActiveTheme(): NavigationTheme {
    const activeTheme = this.getTheme(this.preferences.activeTheme);
    return activeTheme || this.getTheme('luna-default')!;
  }

  /**
   * Apply theme to the application
   */
  public applyTheme(themeId: string): void {
    const theme = this.getTheme(themeId);
    if (!theme) return;

    this.preferences.activeTheme = themeId;
    this.updateCSSVariables(theme);
    this.savePreferences();

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme, themeId }
    }));
  }

  /**
   * Create a custom theme
   */
  public createCustomTheme(
    baseThemeId: string,
    customizations: Partial<NavigationTheme>
  ): NavigationTheme {
    const baseTheme = this.getTheme(baseThemeId);
    if (!baseTheme) throw new Error(`Base theme ${baseThemeId} not found`);

    const customTheme: NavigationTheme = {
      ...baseTheme,
      ...customizations,
      id: customizations.id || `custom-${Date.now()}`,
      name: customizations.name || `Custom ${baseTheme.name}`,
      category: 'custom',
      author: 'User',
      version: '1.0.0',
    };

    this.registerTheme(customTheme);
    this.preferences.customThemes.push(customTheme);
    this.savePreferences();

    return customTheme;
  }

  /**
   * Update hub customization
   */
  public updateHubCustomization(hubId: NavigationHubId, customization: Partial<HubCustomization>): void {
    const existingIndex = this.preferences.hubCustomizations.findIndex(
      c => c.hubId === hubId
    );

    const updatedCustomization: HubCustomization = {
      hubId,
      color: customization.color || 'bg-gray-500 hover:bg-gray-600',
      ...customization,
    };

    if (existingIndex >= 0) {
      this.preferences.hubCustomizations[existingIndex] = updatedCustomization;
    } else {
      this.preferences.hubCustomizations.push(updatedCustomization);
    }

    this.savePreferences();
  }

  /**
   * Get hub customization
   */
  public getHubCustomization(hubId: NavigationHubId): HubCustomization | null {
    // First check user customizations
    const userCustomization = this.preferences.hubCustomizations.find(
      c => c.hubId === hubId
    );
    if (userCustomization) return userCustomization;

    // Then check active theme
    const activeTheme = this.getActiveTheme();
    const themeCustomization = activeTheme.hubCustomizations.find(
      c => c.hubId === hubId
    );
    if (themeCustomization) return themeCustomization;

    return null;
  }

  /**
   * Update CSS variables based on theme
   */
  private updateCSSVariables(theme: NavigationTheme): void {
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--luna-${key}`, value);
    });

    // Apply appearance variables
    root.style.setProperty('--luna-border-radius', `${theme.appearance.borderRadius}px`);
    root.style.setProperty('--luna-shadow-intensity', theme.appearance.shadowIntensity.toString());
    root.style.setProperty('--luna-animation-speed', theme.appearance.animationSpeed.toString());

    // Apply accessibility settings
    if (theme.accessibility.reducedMotion) {
      root.style.setProperty('--luna-animation-duration', '0.01s');
    } else {
      root.style.setProperty('--luna-animation-duration', `${0.3 / theme.appearance.animationSpeed}s`);
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    }
  }

  /**
   * Generate theme preview
   */
  public generateThemePreview(theme: NavigationTheme): string {
    // This would generate a base64 image preview of the theme
    // For now, return a simple data URL
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // Draw background
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, 200, 100);

    // Draw sample elements
    ctx.fillStyle = theme.colors.primary;
    ctx.fillRect(10, 10, 60, 20);

    ctx.fillStyle = theme.colors.secondary;
    ctx.fillRect(80, 10, 60, 20);

    ctx.fillStyle = theme.colors.accent;
    ctx.fillRect(150, 10, 40, 20);

    return canvas.toDataURL();
  }

  /**
   * Auto-switch theme based on time
   */
  private setupThemeWatchers(): void {
    if (!this.preferences.globalSettings.autoSwitchTheme) return;

    const checkTimeBasedTheme = () => {
      const hour = new Date().getHours();
      let targetTheme = 'luna-default';

      if (hour >= 6 && hour < 18) {
        // Day time - use light or default theme
        targetTheme = 'minimalist';
      } else {
        // Night time - use dark theme
        targetTheme = 'luna-default';
      }

      if (this.preferences.activeTheme !== targetTheme) {
        this.applyTheme(targetTheme);
      }
    };

    // Check every hour
    setInterval(checkTimeBasedTheme, 60 * 60 * 1000);
    checkTimeBasedTheme(); // Check immediately
  }

  /**
   * Export theme
   */
  public exportTheme(themeId: string): string {
    const theme = this.getTheme(themeId);
    if (!theme) throw new Error(`Theme ${themeId} not found`);

    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme
   */
  public importTheme(themeJson: string): NavigationTheme {
    try {
      const theme = JSON.parse(themeJson) as NavigationTheme;

      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors) {
        throw new Error('Invalid theme structure');
      }

      // Ensure unique ID
      theme.id = `imported-${theme.id}-${Date.now()}`;
      theme.category = 'custom';

      this.registerTheme(theme);
      this.preferences.customThemes.push(theme);
      this.savePreferences();

      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error.message}`);
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): CustomizationPreferences {
    return {
      activeTheme: 'luna-default',
      customThemes: [],
      hubCustomizations: [],
      globalSettings: {
        showAnimations: true,
        useSystemColors: false,
        autoSwitchTheme: false,
        seasonalThemes: false,
      },
    };
  }

  /**
   * Load preferences from localStorage
   */
  private loadCustomPreferences(): void {
    try {
      const stored = localStorage.getItem('luna-theme-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...this.preferences, ...parsed };

        // Register custom themes
        this.preferences.customThemes.forEach(theme => {
          this.registerTheme(theme);
        });

        // Apply active theme
        this.applyTheme(this.preferences.activeTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('luna-theme-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
    }
  }

  /**
   * Get preferences
   */
  public getPreferences(): CustomizationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  public updatePreferences(updates: Partial<CustomizationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  /**
   * Reset to defaults
   */
  public resetToDefaults(): void {
    this.preferences = this.getDefaultPreferences();
    this.applyTheme('luna-default');
    this.savePreferences();
  }
}

// Export singleton instance
export const themeCustomizationService = new ThemeCustomizationService();