import { useEffect, RefObject } from 'react';
import { lazy as reactLazy, ComponentType } from 'react';

/**
 * Lazy load component with preload capability
 */
export const lazyWithPreload = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const Component = reactLazy(factory);
  (Component as any).preload = factory;
  return Component;
};

/**
 * Hook for lazy loading images with IntersectionObserver
 */
export const useLazyLoad = (
  ref: RefObject<HTMLElement>,
  callback?: () => void
) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;

            // Load image
            if (target.dataset.src) {
              target.src = target.dataset.src;
              delete target.dataset.src;
            }

            // Load background image
            if (target.dataset.backgroundImage) {
              target.style.backgroundImage = `url(${target.dataset.backgroundImage})`;
              delete target.dataset.backgroundImage;
            }

            // Execute callback
            if (callback) {
              callback();
            }

            observer.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
};

/**
 * Preload resources (images, scripts, etc.)
 */
export const preloadResource = (
  href: string,
  as: 'image' | 'script' | 'style' | 'font' = 'image'
) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
};

/**
 * Prefetch resource for future navigation
 */
export const prefetchResource = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request Idle Callback wrapper with fallback
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        }, 1);
      };

/**
 * Cancel Idle Callback wrapper with fallback
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => {
        clearTimeout(id);
      };

/**
 * Measure function execution time
 */
export const measureExecutionTime = <T extends (...args: any[]) => any>(
  func: T,
  label: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      }) as ReturnType<T>;
    }

    const duration = performance.now() - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  }) as T;
};

/**
 * Check if device prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Get connection speed
 */
export const getConnectionSpeed = (): string => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  return connection?.effectiveType || 'unknown';
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = (): boolean => {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
};
