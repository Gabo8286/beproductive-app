/**
 * Accessibility & Performance Hooks Module
 * Consolidated hooks for accessibility features, performance monitoring, and optimization
 * Ensures inclusive design and optimal application performance
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// MARK: - Accessibility Hooks

interface AccessibilityState {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  voiceControl: boolean;
}

/**
 * Screen reader support and announcements
 */
export function useScreenReader() {
  const [isEnabled, setIsEnabled] = useState(false);
  const announceRef = useRef<HTMLDivElement | null>(null);

  // Detect screen reader
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for screen reader indicators
    const hasScreenReader =
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis !== undefined;

    setIsEnabled(hasScreenReader);

    // Create announcement element
    if (!announceRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announceRef.current = announcer;
    }

    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
        announceRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current || !isEnabled) return;

    announceRef.current.setAttribute('aria-live', priority);
    announceRef.current.textContent = message;

    // Clear after announcement to allow repeat announcements
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 1000);
  }, [isEnabled]);

  const announcePageChange = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`, 'assertive');
  }, [announce]);

  const announceAction = useCallback((action: string, result?: string) => {
    const message = result ? `${action}. ${result}` : action;
    announce(message, 'polite');
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  return {
    isEnabled,
    announce,
    announcePageChange,
    announceAction,
    announceError,
    announceSuccess
  };
}

/**
 * Comprehensive accessibility state management
 */
export function useAccessibility() {
  const [state, setState] = useState<AccessibilityState>(() => {
    if (typeof window === 'undefined') {
      return {
        screenReaderEnabled: false,
        highContrastMode: false,
        reducedMotion: false,
        fontSize: 'medium',
        keyboardNavigation: false,
        voiceControl: false
      };
    }

    return {
      screenReaderEnabled: false, // Will be detected
      highContrastMode: window.matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fontSize: 'medium',
      keyboardNavigation: false,
      voiceControl: false
    };
  });

  const { announce } = useScreenReader();

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = [
      { query: '(prefers-contrast: high)', key: 'highContrastMode' as keyof AccessibilityState },
      { query: '(prefers-reduced-motion: reduce)', key: 'reducedMotion' as keyof AccessibilityState }
    ];

    const handlers = mediaQueries.map(({ query, key }) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setState(prev => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return { mq, handler };
    });

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setState(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      handlers.forEach(({ mq, handler }) => {
        mq.removeEventListener('change', handler);
      });
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilityState>(
    key: K,
    value: AccessibilityState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
    announce(`${key} ${value ? 'enabled' : 'disabled'}`);
  }, [announce]);

  const increaseFontSize = useCallback(() => {
    const sizes: AccessibilityState['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(state.fontSize);
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1];
      updateSetting('fontSize', newSize);
    }
  }, [state.fontSize, updateSetting]);

  const decreaseFontSize = useCallback(() => {
    const sizes: AccessibilityState['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(state.fontSize);
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1];
      updateSetting('fontSize', newSize);
    }
  }, [state.fontSize, updateSetting]);

  const toggleHighContrast = useCallback(() => {
    updateSetting('highContrastMode', !state.highContrastMode);
  }, [state.highContrastMode, updateSetting]);

  const toggleReducedMotion = useCallback(() => {
    updateSetting('reducedMotion', !state.reducedMotion);
  }, [state.reducedMotion, updateSetting]);

  // Generate CSS variables for accessibility
  const cssVariables = useMemo(() => {
    const fontSizeScale = {
      'small': '0.875',
      'medium': '1',
      'large': '1.125',
      'extra-large': '1.25'
    };

    return {
      '--font-scale': fontSizeScale[state.fontSize],
      '--high-contrast': state.highContrastMode ? '1' : '0',
      '--reduced-motion': state.reducedMotion ? '1' : '0',
      '--keyboard-navigation': state.keyboardNavigation ? '1' : '0'
    };
  }, [state]);

  return {
    state,
    updateSetting,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    cssVariables,
    // Convenience getters
    isHighContrast: state.highContrastMode,
    isReducedMotion: state.reducedMotion,
    isKeyboardNavigation: state.keyboardNavigation,
    fontScale: parseFloat(cssVariables['--font-scale'])
  };
}

/**
 * ARIA announcements and live regions
 */
export function useAriaAnnounce() {
  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
    timestamp: Date;
  }>>([]);

  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const announcement = {
      id,
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Auto-remove after duration
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, duration);

    return id;
  }, []);

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  return {
    announcements,
    announce,
    removeAnnouncement,
    clearAnnouncements,
    // Convenience methods
    announceSuccess: (message: string) => announce(`Success: ${message}`, 'polite'),
    announceError: (message: string) => announce(`Error: ${message}`, 'assertive'),
    announceWarning: (message: string) => announce(`Warning: ${message}`, 'assertive'),
    announceInfo: (message: string) => announce(`Info: ${message}`, 'polite')
  };
}

// MARK: - Performance Hooks

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  reRenderCount: number;
  memoryUsage?: number;
  networkRequests: number;
  cacheHitRate: number;
}

/**
 * Performance tracking and monitoring
 */
export function usePerformanceTracking() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    reRenderCount: 0,
    networkRequests: 0,
    cacheHitRate: 0
  });

  const [isTracking, setIsTracking] = useState(false);
  const renderStartRef = useRef<number | null>(null);
  const renderCountRef = useRef(0);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    renderStartRef.current = performance.now();
  }, []);

  const stopTracking = useCallback(() => {
    if (renderStartRef.current && isTracking) {
      const renderTime = performance.now() - renderStartRef.current;
      setMetrics(prev => ({
        ...prev,
        renderTime,
        reRenderCount: prev.reRenderCount + 1
      }));
    }
    setIsTracking(false);
    renderStartRef.current = null;
  }, [isTracking]);

  const trackComponentRender = useCallback((componentName: string) => {
    renderCountRef.current++;

    return {
      onStart: () => {
        if (!isTracking) startTracking();
      },
      onEnd: () => {
        stopTracking();
      }
    };
  }, [isTracking, startTracking, stopTracking]);

  const recordNetworkRequest = useCallback((duration: number, fromCache = false) => {
    setMetrics(prev => {
      const newNetworkRequests = prev.networkRequests + 1;
      const cacheHits = fromCache ? 1 : 0;
      const totalCacheableRequests = newNetworkRequests;
      const newCacheHitRate = totalCacheableRequests > 0
        ? (prev.cacheHitRate * (totalCacheableRequests - 1) + cacheHits) / totalCacheableRequests
        : 0;

      return {
        ...prev,
        networkRequests: newNetworkRequests,
        cacheHitRate: newCacheHitRate
      };
    });
  }, []);

  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  const getPerformanceInsights = useCallback(() => {
    const insights: string[] = [];

    if (metrics.renderTime > 16) {
      insights.push('Render time is above 16ms - consider optimizing components');
    }

    if (metrics.reRenderCount > 10) {
      insights.push('High re-render count detected - check for unnecessary state updates');
    }

    if (metrics.cacheHitRate < 0.7 && metrics.networkRequests > 10) {
      insights.push('Low cache hit rate - consider implementing better caching strategies');
    }

    const memory = getMemoryUsage();
    if (memory && memory.used / memory.limit > 0.8) {
      insights.push('High memory usage detected - check for memory leaks');
    }

    return insights;
  }, [metrics, getMemoryUsage]);

  // Monitor performance periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const memory = getMemoryUsage();
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.used
        }));
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [getMemoryUsage]);

  return {
    metrics,
    isTracking,
    startTracking,
    stopTracking,
    trackComponentRender,
    recordNetworkRequest,
    getMemoryUsage,
    getPerformanceInsights,
    // Performance scoring
    performanceScore: Math.max(0, 100 - (metrics.renderTime * 2) - (metrics.reRenderCount * 0.5))
  };
}

/**
 * Web Vitals monitoring
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
  }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Simulate Web Vitals collection (in production, use actual web-vitals library)
    const collectVitals = () => {
      // These would be real measurements in production
      setVitals({
        lcp: Math.random() * 2000 + 1000, // 1-3 seconds
        fid: Math.random() * 100, // 0-100ms
        cls: Math.random() * 0.25, // 0-0.25
        fcp: Math.random() * 1500 + 500, // 0.5-2 seconds
        ttfb: Math.random() * 600 + 200 // 200-800ms
      });
    };

    const timeout = setTimeout(collectVitals, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const getVitalScore = useCallback((metric: keyof typeof vitals) => {
    const value = vitals[metric];
    if (value === undefined) return null;

    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, [vitals]);

  const getOverallScore = useCallback(() => {
    const scores = Object.keys(vitals).map(metric => getVitalScore(metric as keyof typeof vitals));
    const validScores = scores.filter(score => score !== null);

    if (validScores.length === 0) return null;

    const scoreValues = validScores.map(score => {
      switch (score) {
        case 'good': return 100;
        case 'needs-improvement': return 60;
        case 'poor': return 20;
        default: return 0;
      }
    });

    return Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / validScores.length);
  }, [vitals, getVitalScore]);

  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (getVitalScore('lcp') === 'poor') {
      recommendations.push('Optimize images and preload key resources to improve LCP');
    }

    if (getVitalScore('fid') === 'poor') {
      recommendations.push('Reduce JavaScript execution time to improve FID');
    }

    if (getVitalScore('cls') === 'poor') {
      recommendations.push('Set explicit dimensions for images and ads to reduce CLS');
    }

    if (getVitalScore('fcp') === 'poor') {
      recommendations.push('Optimize critical rendering path to improve FCP');
    }

    if (getVitalScore('ttfb') === 'poor') {
      recommendations.push('Optimize server response time to improve TTFB');
    }

    return recommendations;
  }, [getVitalScore]);

  return {
    vitals,
    getVitalScore,
    getOverallScore,
    getRecommendations,
    overallScore: getOverallScore(),
    recommendations: getRecommendations()
  };
}

/**
 * Resource loading optimization
 */
export function useResourceOptimization() {
  const [resourceStats, setResourceStats] = useState({
    imagesLoaded: 0,
    imagesTotal: 0,
    scriptsLoaded: 0,
    scriptsTotal: 0,
    stylesheets: 0,
    fonts: 0
  });

  const [loadingStrategy, setLoadingStrategy] = useState<{
    lazyImages: boolean;
    preloadCritical: boolean;
    prefetchNext: boolean;
    serviceworker: boolean;
  }>({
    lazyImages: true,
    preloadCritical: true,
    prefetchNext: false,
    serviceworker: false
  });

  const preloadResource = useCallback((href: string, as: string, crossorigin?: string) => {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const prefetchResource = useCallback((href: string) => {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const optimizeImages = useCallback(() => {
    if (typeof document === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);

            setResourceStats(prev => ({
              ...prev,
              imagesLoaded: prev.imagesLoaded + 1
            }));
          }
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    setResourceStats(prev => ({
      ...prev,
      imagesTotal: images.length
    }));

    return () => imageObserver.disconnect();
  }, []);

  const updateLoadingStrategy = useCallback((updates: Partial<typeof loadingStrategy>) => {
    setLoadingStrategy(prev => ({ ...prev, ...updates }));
  }, []);

  const getOptimizationScore = useCallback(() => {
    let score = 0;

    if (loadingStrategy.lazyImages) score += 25;
    if (loadingStrategy.preloadCritical) score += 25;
    if (loadingStrategy.prefetchNext) score += 20;
    if (loadingStrategy.serviceworker) score += 30;

    return score;
  }, [loadingStrategy]);

  // Monitor resource loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateResourceStats = () => {
      const scripts = document.querySelectorAll('script').length;
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
      const fonts = document.fonts ? document.fonts.size : 0;

      setResourceStats(prev => ({
        ...prev,
        scriptsTotal: scripts,
        scriptsLoaded: scripts, // Assume all loaded for now
        stylesheets,
        fonts
      }));
    };

    updateResourceStats();

    if (loadingStrategy.lazyImages) {
      optimizeImages();
    }
  }, [loadingStrategy.lazyImages, optimizeImages]);

  return {
    resourceStats,
    loadingStrategy,
    preloadResource,
    prefetchResource,
    optimizeImages,
    updateLoadingStrategy,
    getOptimizationScore,
    optimizationScore: getOptimizationScore(),
    loadingProgress: resourceStats.imagesTotal > 0
      ? (resourceStats.imagesLoaded / resourceStats.imagesTotal) * 100
      : 100
  };
}

// MARK: - Export All Hooks

export const AccessibilityPerformanceHooks = {
  useScreenReader,
  useAccessibility,
  useAriaAnnounce,
  usePerformanceTracking,
  useWebVitals,
  useResourceOptimization
};

export default AccessibilityPerformanceHooks;