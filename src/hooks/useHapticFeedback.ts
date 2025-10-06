import { useCallback, useEffect, useState } from "react";

export type HapticFeedbackType =
  | "impact-light"
  | "impact-medium"
  | "impact-heavy"
  | "notification-success"
  | "notification-warning"
  | "notification-error"
  | "selection"
  | "rigid"
  | "soft";

export type HapticPattern =
  | "single"
  | "double"
  | "triple"
  | "pulse"
  | "success-pattern"
  | "error-pattern"
  | "progress-tick";

export interface HapticConfig {
  enabled: boolean;
  intensity?: number; // 0-1
  respectSystemSettings?: boolean;
  respectUserPreferences?: boolean;
  respectReducedMotion?: boolean;
  debugMode?: boolean;
}

export interface HapticFeedbackState {
  isSupported: boolean;
  isEnabled: boolean;
  canVibrate: boolean;
  userPreferences: HapticConfig;
}

// Default haptic patterns (Web Vibration API values)
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  single: 50,
  double: [50, 50, 50],
  triple: [50, 50, 50, 50, 50],
  pulse: [100, 50, 100, 50, 100],
  "success-pattern": [50, 25, 25, 25, 50],
  "error-pattern": [100, 50, 100, 50, 200],
  "progress-tick": 25,
};

// Intensity multipliers for different feedback types
const INTENSITY_MULTIPLIERS: Record<HapticFeedbackType, number> = {
  "impact-light": 0.3,
  "impact-medium": 0.7,
  "impact-heavy": 1.0,
  "notification-success": 0.6,
  "notification-warning": 0.8,
  "notification-error": 1.0,
  selection: 0.2,
  rigid: 0.9,
  soft: 0.4,
};

/**
 * Hook for providing haptic feedback across different devices and platforms
 * Supports both iOS Safari Haptic API and Web Vibration API
 */
export function useHapticFeedback(initialConfig: Partial<HapticConfig> = {}) {
  // Analytics temporarily disabled
  const trackEvent = (...args: any[]) => {};

  const [state, setState] = useState<HapticFeedbackState>({
    isSupported: false,
    isEnabled: false,
    canVibrate: false,
    userPreferences: {
      enabled: true,
      intensity: 0.7,
      respectSystemSettings: true,
      respectUserPreferences: true,
      respectReducedMotion: true,
      debugMode: false,
      ...initialConfig,
    },
  });

  // Check device capabilities on mount
  useEffect(() => {
    const checkSupport = () => {
      // Check for iOS Safari Haptic API
      const hasIOSHaptics = 'DeviceMotionEvent' in window &&
                           'requestPermission' in (DeviceMotionEvent as any);

      // Check for Web Vibration API
      const hasVibration = 'vibrate' in navigator;

      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Get user preferences from localStorage
      const savedPreferences = localStorage.getItem('haptic-preferences');
      const userPrefs = savedPreferences ? JSON.parse(savedPreferences) : {};

      const finalPreferences = {
        ...state.userPreferences,
        ...userPrefs,
      };

      // Determine if haptics should be enabled
      const shouldEnable = finalPreferences.enabled &&
                          (hasIOSHaptics || hasVibration) &&
                          (!prefersReducedMotion || !finalPreferences.respectReducedMotion);

      setState(prev => ({
        ...prev,
        isSupported: hasIOSHaptics || hasVibration,
        canVibrate: hasVibration,
        isEnabled: shouldEnable,
        userPreferences: finalPreferences,
      }));

      if (finalPreferences.debugMode) {
        console.log('Haptic feedback support:', {
          hasIOSHaptics,
          hasVibration,
          prefersReducedMotion,
          finalEnabled: shouldEnable,
        });
      }
    };

    checkSupport();

    // Listen for changes in reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => checkSupport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('haptic-preferences', JSON.stringify(state.userPreferences));
  }, [state.userPreferences]);

  // iOS Safari Haptic Feedback (iOS 13+)
  const triggerIOSHaptic = useCallback((type: HapticFeedbackType) => {
    if (!('DeviceMotionEvent' in window) || !state.isEnabled) return false;

    try {
      // Map feedback types to iOS haptic types
      const iOSHapticMap: Record<HapticFeedbackType, string> = {
        "impact-light": "light",
        "impact-medium": "medium",
        "impact-heavy": "heavy",
        "notification-success": "success",
        "notification-warning": "warning",
        "notification-error": "error",
        selection: "selection",
        rigid: "rigid",
        soft: "soft",
      };

      const hapticType = iOSHapticMap[type];

      // Use the Haptic API if available (iOS Safari)
      if ((window as any).DeviceMotionEvent?.requestPermission) {
        if (hapticType in ["light", "medium", "heavy"]) {
          // Impact feedback
          const generator = new (window as any).UIImpactFeedbackGenerator(hapticType);
          generator.prepare();
          generator.impactOccurred(state.userPreferences.intensity);
        } else if (hapticType in ["success", "warning", "error"]) {
          // Notification feedback
          const generator = new (window as any).UINotificationFeedbackGenerator();
          generator.prepare();
          generator.notificationOccurred(hapticType);
        } else if (hapticType === "selection") {
          // Selection feedback
          const generator = new (window as any).UISelectionFeedbackGenerator();
          generator.prepare();
          generator.selectionChanged();
        }
        return true;
      }
    } catch (error) {
      if (state.userPreferences.debugMode) {
        console.warn('iOS haptic feedback failed:', error);
      }
    }
    return false;
  }, [state.isEnabled, state.userPreferences.intensity, state.userPreferences.debugMode]);

  // Web Vibration API fallback
  const triggerVibration = useCallback((pattern: number | number[], intensity: number = 1) => {
    if (!state.canVibrate || !state.isEnabled || !navigator.vibrate) return false;

    try {
      // Apply intensity scaling
      const scaledPattern = Array.isArray(pattern)
        ? pattern.map(duration => Math.round(duration * intensity))
        : Math.round(pattern * intensity);

      navigator.vibrate(scaledPattern);
      return true;
    } catch (error) {
      if (state.userPreferences.debugMode) {
        console.warn('Vibration API failed:', error);
      }
    }
    return false;
  }, [state.canVibrate, state.isEnabled, state.userPreferences.debugMode]);

  // Main haptic feedback function
  const triggerHaptic = useCallback((
    type: HapticFeedbackType,
    pattern: HapticPattern = "single",
    customIntensity?: number
  ) => {
    if (!state.isEnabled) return false;

    const intensity = (customIntensity ?? state.userPreferences.intensity ?? 0.7) *
                     INTENSITY_MULTIPLIERS[type];

    // Try iOS haptic first
    if (triggerIOSHaptic(type)) {
      if (state.userPreferences.debugMode) {
        console.log(`iOS haptic triggered: ${type}`);
      }

      // Track haptic usage
      trackEvent("haptic_feedback", "engagement", {
        type,
        pattern,
        intensity,
        platform: "ios",
        timestamp: new Date().toISOString(),
      });

      return true;
    }

    // Fallback to vibration
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    if (triggerVibration(vibrationPattern, intensity)) {
      if (state.userPreferences.debugMode) {
        console.log(`Vibration triggered: ${type} with pattern ${pattern}`);
      }

      // Track haptic usage
      trackEvent("haptic_feedback", "engagement", {
        type,
        pattern,
        intensity,
        platform: "web",
        timestamp: new Date().toISOString(),
      });

      return true;
    }

    return false;
  }, [
    state.isEnabled,
    state.userPreferences.intensity,
    state.userPreferences.debugMode,
    triggerIOSHaptic,
    triggerVibration,
    trackEvent,
  ]);

  // Convenience methods for common interactions
  const hapticFeedback = {
    // Button and UI interactions
    buttonPress: useCallback(() => triggerHaptic("selection", "single"), [triggerHaptic]),
    buttonHold: useCallback(() => triggerHaptic("impact-medium", "pulse"), [triggerHaptic]),

    // Navigation
    pageTransition: useCallback(() => triggerHaptic("impact-light", "single"), [triggerHaptic]),
    tabSwitch: useCallback(() => triggerHaptic("selection", "single"), [triggerHaptic]),
    modalOpen: useCallback(() => triggerHaptic("impact-light", "double"), [triggerHaptic]),
    modalClose: useCallback(() => triggerHaptic("impact-light", "single"), [triggerHaptic]),

    // Productivity actions
    taskComplete: useCallback(() => triggerHaptic("notification-success", "success-pattern"), [triggerHaptic]),
    taskCreate: useCallback(() => triggerHaptic("impact-light", "single"), [triggerHaptic]),
    goalAchieved: useCallback(() => triggerHaptic("notification-success", "triple"), [triggerHaptic]),
    habitTracked: useCallback(() => triggerHaptic("impact-medium", "double"), [triggerHaptic]),

    // Feedback and notifications
    success: useCallback(() => triggerHaptic("notification-success", "success-pattern"), [triggerHaptic]),
    warning: useCallback(() => triggerHaptic("notification-warning", "double"), [triggerHaptic]),
    error: useCallback(() => triggerHaptic("notification-error", "error-pattern"), [triggerHaptic]),

    // Widget interactions
    widgetRefresh: useCallback(() => triggerHaptic("impact-light", "single"), [triggerHaptic]),
    widgetExpand: useCallback(() => triggerHaptic("impact-light", "double"), [triggerHaptic]),
    widgetCollapse: useCallback(() => triggerHaptic("impact-light", "single"), [triggerHaptic]),

    // Form interactions
    formSubmit: useCallback(() => triggerHaptic("impact-medium", "double"), [triggerHaptic]),
    formError: useCallback(() => triggerHaptic("notification-error", "double"), [triggerHaptic]),
    fieldFocus: useCallback(() => triggerHaptic("selection", "single", 0.3), [triggerHaptic]),

    // Progress and loading
    progressTick: useCallback(() => triggerHaptic("impact-light", "progress-tick", 0.4), [triggerHaptic]),
    loadingComplete: useCallback(() => triggerHaptic("impact-medium", "double"), [triggerHaptic]),
  };

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<HapticConfig>) => {
    setState(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...newPreferences,
      },
    }));
  }, []);

  // Request permissions (mainly for iOS)
  const requestPermission = useCallback(async () => {
    if ('DeviceMotionEvent' in window && 'requestPermission' in (DeviceMotionEvent as any)) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        const granted = permission === 'granted';

        setState(prev => ({
          ...prev,
          isEnabled: granted && prev.userPreferences.enabled,
        }));

        return granted;
      } catch (error) {
        console.warn('Failed to request haptic permission:', error);
        return false;
      }
    }
    return true; // Permission not needed for other platforms
  }, []);

  // Test haptic feedback
  const testHaptic = useCallback((type: HapticFeedbackType = "impact-medium") => {
    const success = triggerHaptic(type, "single");
    if (state.userPreferences.debugMode) {
      console.log(`Haptic test ${success ? 'succeeded' : 'failed'}: ${type}`);
    }
    return success;
  }, [triggerHaptic, state.userPreferences.debugMode]);

  return {
    // State
    ...state,

    // Core functions
    triggerHaptic,
    updatePreferences,
    requestPermission,
    testHaptic,

    // Convenience methods
    ...hapticFeedback,
  };
}
