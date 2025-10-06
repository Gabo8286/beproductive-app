/**
 * Accessibility Preferences Types
 */

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  enhancedFocus: boolean;
  skipAnimations: boolean;
}

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusIndicators: true,
  colorBlindMode: "none",
  enhancedFocus: false,
  skipAnimations: false,
};
