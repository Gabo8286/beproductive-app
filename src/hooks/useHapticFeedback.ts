import { useCallback } from "react";

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Web Vibration API
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50]
      };

      navigator.vibrate(patterns[type]);
    }

    // Visual feedback for devices without haptics
    document.body.style.transform = 'scale(0.999)';
    requestAnimationFrame(() => {
      document.body.style.transform = '';
    });
  }, []);

  return { triggerHaptic };
}
