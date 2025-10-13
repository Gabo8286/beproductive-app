/**
 * Accessibility Provider
 * Central provider for accessibility settings and preferences
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// Temporarily removing theme dependency to fix circular import
// import { useTheme } from '@/contexts/ThemeContext';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announcements: boolean;
  autoplay: boolean;
  animations: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  skipToContent: () => void;
  getAccessibilityProps: (element: string) => Record<string, any>;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusVisible: true,
  announcements: true,
  autoplay: true,
  animations: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Temporarily disabled to fix circular dependency
  // const { setMotionPreference } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('beproductive-accessibility-settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Live region for screen reader announcements
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  // Initialize accessibility features on mount
  useEffect(() => {
    // Create screen reader announcer
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.setAttribute('id', 'accessibility-announcer');
    announcerElement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    // Detect system preferences
    detectSystemPreferences();

    // Listen for system preference changes
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-data: reduce)'), // Approximation
    };

    const handleMediaChange = () => {
      detectSystemPreferences();
    };

    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', handleMediaChange);
    });

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', handleMediaChange);
      });
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  // Detect system accessibility preferences
  const detectSystemPreferences = useCallback(() => {
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };

    setSettings(prev => ({
      ...prev,
      ...systemPreferences,
    }));
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('beproductive-accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }, [settings]);

  // Apply accessibility settings to the DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply CSS custom properties for accessibility
    root.style.setProperty('--motion-reduce', settings.reducedMotion ? '1' : '0');
    root.style.setProperty('--high-contrast', settings.highContrast ? '1' : '0');
    root.style.setProperty('--large-text', settings.largeText ? '1' : '0');
    root.style.setProperty('--animations-enabled', settings.animations ? '1' : '0');

    // Update document classes
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('screen-reader-mode', settings.screenReaderMode);
    root.classList.toggle('keyboard-navigation', settings.keyboardNavigation);
    root.classList.toggle('focus-visible', settings.focusVisible);

    // Update theme motion preference
    // Temporarily disabled to fix circular dependency
    // if (settings.reducedMotion) {
    //   setMotionPreference('reduced');
    // }

    // Disable autoplay if not allowed
    if (!settings.autoplay) {
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        (video as HTMLVideoElement).removeAttribute('autoplay');
      });
    }
  }, [settings]); // Removed setMotionPreference dependency temporarily

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const announceToScreenReader = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!settings.announcements || !announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }, [settings.announcements, announcer]);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Skipped to main content');
    }
  }, [announceToScreenReader]);

  const getAccessibilityProps = useCallback((element: string) => {
    const baseProps = {
      'data-accessibility': 'true',
    };

    switch (element) {
      case 'button':
        return {
          ...baseProps,
          role: 'button',
          tabIndex: settings.keyboardNavigation ? 0 : -1,
        };
      case 'link':
        return {
          ...baseProps,
          tabIndex: settings.keyboardNavigation ? 0 : -1,
        };
      case 'interactive':
        return {
          ...baseProps,
          tabIndex: settings.keyboardNavigation ? 0 : -1,
          'aria-label': settings.screenReaderMode ? 'Interactive element' : undefined,
        };
      default:
        return baseProps;
    }
  }, [settings]);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader,
    skipToContent,
    getAccessibilityProps,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}