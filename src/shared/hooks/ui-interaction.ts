/**
 * UI & Interaction Hooks Module
 * Consolidated hooks for user interface interactions, layout, and visual state management
 * Reduces bundle size by centralizing UI-related hook logic
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

// MARK: - Mobile & Responsive Hooks

/**
 * Hook for detecting mobile devices and responsive breakpoints
 */
export function useMobile() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1025px)' });
  const isTouch = useMediaQuery({ query: '(pointer: coarse)' });

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    default: T;
  }
): T {
  const { isMobile, isTablet, isDesktop } = useMobile();

  return useMemo(() => {
    if (isMobile && values.mobile !== undefined) return values.mobile;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    return values.default;
  }, [isMobile, isTablet, isDesktop, values]);
}

// MARK: - Toast & Notification Hooks

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  action?: ToastOptions['action'];
  timestamp: number;
}

/**
 * Centralized toast notification management
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, options: ToastOptions = {}) => {
    const toast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type: options.type || 'info',
      duration: options.duration || 4000,
      action: options.action,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    // Convenience methods
    success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'success' }),
    error: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'error' }),
    warning: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'warning' }),
    info: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'info' })
  };
}

// MARK: - Loading State Hooks

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

/**
 * Advanced loading state management with error handling
 */
export function useAdvancedLoading() {
  const [states, setStates] = useState<Record<string, LoadingState>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading: loading, error: loading ? null : prev[key]?.error || null }
    }));
  }, []);

  const setError = useCallback((key: string, error: Error | null) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error, isLoading: false }
    }));
  }, []);

  const setData = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], data, isLoading: false, error: null }
    }));
  }, []);

  const getState = useCallback((key: string): LoadingState => {
    return states[key] || { isLoading: false, error: null, data: null };
  }, [states]);

  const executeAsync = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      const result = await asyncFn();
      setData(key, result);
      return result;
    } catch (error) {
      setError(key, error as Error);
      throw error;
    }
  }, [setLoading, setData, setError]);

  return {
    states,
    setLoading,
    setError,
    setData,
    getState,
    executeAsync,
    isAnyLoading: Object.values(states).some(state => state.isLoading),
    hasAnyError: Object.values(states).some(state => state.error !== null)
  };
}

// MARK: - Layout & Widget Hooks

interface WidgetLayout {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
  order: number;
}

/**
 * Widget layout management for dashboard customization
 */
export function useWidgetLayout(initialWidgets: WidgetLayout[] = []) {
  const [widgets, setWidgets] = useState<WidgetLayout[]>(initialWidgets);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const updateWidgetPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, position } : widget
    ));
  }, []);

  const updateWidgetSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, size } : widget
    ));
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, isVisible: !widget.isVisible } : widget
    ));
  }, []);

  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, removed);

      // Update order values
      return newWidgets.map((widget, index) => ({ ...widget, order: index }));
    });
  }, []);

  const addWidget = useCallback((widget: Omit<WidgetLayout, 'order'>) => {
    setWidgets(prev => [...prev, { ...widget, order: prev.length }]);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  const startDrag = useCallback((id: string) => {
    setIsDragging(true);
    setDraggedWidget(id);
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedWidget(null);
  }, []);

  const visibleWidgets = useMemo(() =>
    widgets.filter(widget => widget.isVisible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  return {
    widgets,
    visibleWidgets,
    isDragging,
    draggedWidget,
    updateWidgetPosition,
    updateWidgetSize,
    toggleWidgetVisibility,
    reorderWidgets,
    addWidget,
    removeWidget,
    resetLayout,
    startDrag,
    endDrag
  };
}

// MARK: - Pull to Refresh Hook

/**
 * Pull to refresh functionality for mobile interfaces
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const threshold = 80; // Pull distance threshold
  const maxDistance = 120; // Maximum pull distance

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartRef.current !== null && containerRef.current?.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.min(currentY - touchStartRef.current, maxDistance);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
      }
    }
  }, [maxDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    touchStartRef.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isPulling = pullDistance > 0;
  const shouldRefresh = pullDistance >= threshold;

  return {
    containerRef,
    isRefreshing,
    isPulling,
    shouldRefresh,
    pullProgress,
    pullDistance: Math.max(0, pullDistance)
  };
}

// MARK: - Breadcrumb Navigation Hook

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
}

/**
 * Breadcrumb navigation management
 */
export function useBreadcrumbs() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs(prev => {
      // Avoid duplicates
      const exists = prev.some(crumb => crumb.path === item.path);
      if (exists) return prev;

      return [...prev, item];
    });
  }, []);

  const removeBreadcrumb = useCallback((path: string) => {
    setBreadcrumbs(prev => prev.filter(crumb => crumb.path !== path));
  }, []);

  const navigateToDepth = useCallback((depth: number) => {
    setBreadcrumbs(prev => prev.slice(0, depth + 1));
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  const updateBreadcrumb = useCallback((path: string, updates: Partial<BreadcrumbItem>) => {
    setBreadcrumbs(prev => prev.map(crumb =>
      crumb.path === path ? { ...crumb, ...updates } : crumb
    ));
  }, []);

  return {
    breadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    navigateToDepth,
    clearBreadcrumbs,
    updateBreadcrumb,
    currentPath: breadcrumbs[breadcrumbs.length - 1]?.path || '',
    depth: breadcrumbs.length
  };
}

// MARK: - Adaptive Interface Hook

interface InterfaceAdaptation {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  density: 'compact' | 'comfortable' | 'spacious';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
}

/**
 * Adaptive interface based on user preferences and capabilities
 */
export function useAdaptiveInterface() {
  const [adaptations, setAdaptations] = useState<InterfaceAdaptation>({
    fontSize: 'medium',
    density: 'comfortable',
    contrast: 'normal',
    reducedMotion: false
  });

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    setAdaptations(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      contrast: prefersHighContrast ? 'high' : 'normal'
    }));
  }, []);

  const updateAdaptation = useCallback(<K extends keyof InterfaceAdaptation>(
    key: K,
    value: InterfaceAdaptation[K]
  ) => {
    setAdaptations(prev => ({ ...prev, [key]: value }));
  }, []);

  const getFontSizeScale = useCallback(() => {
    const scales = {
      'small': 0.875,
      'medium': 1,
      'large': 1.125,
      'extra-large': 1.25
    };
    return scales[adaptations.fontSize];
  }, [adaptations.fontSize]);

  const getDensitySpacing = useCallback(() => {
    const spacings = {
      'compact': 0.75,
      'comfortable': 1,
      'spacious': 1.25
    };
    return spacings[adaptations.density];
  }, [adaptations.density]);

  return {
    adaptations,
    updateAdaptation,
    getFontSizeScale,
    getDensitySpacing,
    cssVariables: {
      '--font-scale': getFontSizeScale().toString(),
      '--density-scale': getDensitySpacing().toString(),
      '--contrast-mode': adaptations.contrast,
      '--motion-mode': adaptations.reducedMotion ? 'reduced' : 'normal'
    }
  };
}

// MARK: - Async Error Handling Hook

/**
 * Global async error boundary and handling
 */
export function useAsyncError() {
  const [error, setError] = useState<Error | null>(null);

  const throwError = useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const wrapAsync = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        throwError(error as Error);
        throw error;
      }
    };
  }, [throwError]);

  // Reset error when component unmounts
  useEffect(() => {
    return () => setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    throwError,
    clearError,
    wrapAsync
  };
}

// MARK: - Export All Hooks

export const UIInteractionHooks = {
  useMobile,
  useResponsiveValue,
  useToast,
  useAdvancedLoading,
  useWidgetLayout,
  usePullToRefresh,
  useBreadcrumbs,
  useAdaptiveInterface,
  useAsyncError
};

export default UIInteractionHooks;