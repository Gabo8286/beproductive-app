import { useState, useEffect } from 'react';

interface MobileBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export function useMobile(): MobileBreakpoints {
  const [breakpoints, setBreakpoints] = useState<MobileBreakpoints>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        orientation: 'landscape',
        screenSize: 'lg',
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 }
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isTouchDevice,
      orientation: width > height ? 'landscape' : 'portrait',
      screenSize: getScreenSize(width),
      safeAreaInsets: getSafeAreaInsets()
    };
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice,
        orientation: width > height ? 'landscape' : 'portrait',
        screenSize: getScreenSize(width),
        safeAreaInsets: getSafeAreaInsets()
      });
    };

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateBreakpoints);
    window.addEventListener('orientationchange', updateBreakpoints);

    // Initial call
    updateBreakpoints();

    return () => {
      window.removeEventListener('resize', updateBreakpoints);
      window.removeEventListener('orientationchange', updateBreakpoints);
    };
  }, []);

  return breakpoints;
}

function getScreenSize(width: number): MobileBreakpoints['screenSize'] {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  // Get CSS environment variables for safe area insets
  const getInset = (side: string) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--safe-area-inset-${side}`)
      .trim();
    return value ? parseInt(value.replace('px', '')) : 0;
  };

  return {
    top: getInset('top'),
    right: getInset('right'),
    bottom: getInset('bottom'),
    left: getInset('left')
  };
}

// Hook for device orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// Hook for touch capabilities
export function useTouchCapabilities() {
  const [capabilities, setCapabilities] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        maxTouchPoints: 0,
        hasForceTouchSupport: false,
        hasHoverSupport: true
      };
    }

    return {
      hasTouch: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasForceTouchSupport: 'ontouchforcechange' in window,
      hasHoverSupport: window.matchMedia('(hover: hover)').matches
    };
  });

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        hasTouch: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        hasForceTouchSupport: 'ontouchforcechange' in window,
        hasHoverSupport: window.matchMedia('(hover: hover)').matches
      });
    };

    // Listen for changes (though these rarely change during runtime)
    window.addEventListener('resize', updateCapabilities);

    return () => {
      window.removeEventListener('resize', updateCapabilities);
    };
  }, []);

  return capabilities;
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

// Hook for network information
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return {
        online: true,
        effectiveType: '4g' as const,
        downlink: 10,
        saveData: false
      };
    }

    const connection = (navigator as any).connection;
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      saveData: connection?.saveData || false
    };
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        saveData: connection?.saveData || false
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}