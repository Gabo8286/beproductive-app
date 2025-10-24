/**
 * Component Utilities Module
 * Shared utilities, helpers, and development tools for components
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// MARK: - CSS Utilities

/**
 * Combine class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate responsive class names
 */
export function responsive(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string,
  '2xl'?: string
): string {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  if ('2xl') classes.push(`2xl:${arguments[5]}`);
  return classes.join(' ');
}

/**
 * Generate variant classes based on props
 */
export function variant<T extends Record<string, any>>(
  variants: T,
  selectedVariant: keyof T,
  defaultVariant?: keyof T
): string {
  const variantKey = selectedVariant || defaultVariant;
  return variantKey ? variants[variantKey] || '' : '';
}

// MARK: - Component Composition Utilities

/**
 * Compose multiple components into a single component
 */
export function composeComponents<T extends Record<string, any>>(
  ...components: Array<React.ComponentType<T>>
): React.ComponentType<T> {
  return (props: T) => {
    return components.reduceRight(
      (acc, Component) => React.createElement(Component, props, acc),
      null
    );
  };
}

/**
 * Create a compound component with sub-components
 */
export function createCompoundComponent<
  T extends React.ComponentType<any>,
  S extends Record<string, React.ComponentType<any>>
>(Component: T, subComponents: S): T & S {
  Object.assign(Component, subComponents);
  return Component as T & S;
}

/**
 * Forward ref with proper TypeScript typing
 */
export function forwardRefWithAs<T extends keyof JSX.IntrinsicElements, P = {}>(
  render: (
    props: P & { as?: T },
    ref: React.Ref<any>
  ) => React.ReactElement | null
) {
  return React.forwardRef(render) as <TT extends keyof JSX.IntrinsicElements = T>(
    props: P & { as?: TT } & React.RefAttributes<any>
  ) => React.ReactElement | null;
}

// MARK: - Props Utilities

/**
 * Omit specific props from a component props type
 */
export type OmitProps<T, K extends keyof T> = Omit<T, K>;

/**
 * Extract props that start with a specific prefix
 */
export function extractProps<T extends Record<string, any>>(
  props: T,
  prefix: string
): { extracted: Record<string, any>; remaining: Omit<T, keyof any> } {
  const extracted: Record<string, any> = {};
  const remaining = { ...props };

  Object.keys(props).forEach(key => {
    if (key.startsWith(prefix)) {
      extracted[key] = props[key];
      delete remaining[key];
    }
  });

  return { extracted, remaining };
}

/**
 * Merge props with default values
 */
export function mergeProps<T extends Record<string, any>>(
  defaultProps: Partial<T>,
  props: T
): T {
  return { ...defaultProps, ...props };
}

/**
 * Create polymorphic component props
 */
export type PolymorphicProps<T extends keyof JSX.IntrinsicElements, P = {}> = P & {
  as?: T;
} & Omit<JSX.IntrinsicElements[T], keyof P>;

// MARK: - Event Utilities

/**
 * Create a debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedCallback = React.useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return debouncedCallback;
}

/**
 * Create a throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = React.useRef<number>(0);

  const throttledCallback = React.useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Compose multiple event handlers
 */
export function composeEventHandlers<T extends (...args: any[]) => any>(
  ...handlers: Array<T | undefined>
): T {
  return ((...args: Parameters<T>) => {
    handlers.forEach(handler => {
      if (handler) {
        handler(...args);
      }
    });
  }) as T;
}

// MARK: - Accessibility Utilities

/**
 * Generate unique IDs for accessibility
 */
export function useId(prefix?: string): string {
  const [id] = React.useState(() => {
    const randomId = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}-${randomId}` : randomId;
  });
  return id;
}

/**
 * Create ARIA attributes object
 */
export function createAriaAttributes(
  label?: string,
  describedBy?: string,
  expanded?: boolean,
  controls?: string
): Record<string, any> {
  const attrs: Record<string, any> = {};

  if (label) attrs['aria-label'] = label;
  if (describedBy) attrs['aria-describedby'] = describedBy;
  if (expanded !== undefined) attrs['aria-expanded'] = expanded;
  if (controls) attrs['aria-controls'] = controls;

  return attrs;
}

/**
 * Create focus trap for modals
 */
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled]);

  return containerRef;
}

// MARK: - Performance Utilities

/**
 * Memoize component with custom comparison
 */
export function memoizeComponent<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
): T {
  return React.memo(Component, areEqual) as T;
}

/**
 * Create a virtualized list hook
 */
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = React.useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%'
        }
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  return {
    visibleItems,
    totalHeight: itemCount * itemHeight,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

// MARK: - Development Utilities

/**
 * Component development logger
 */
export function useComponentLogger(componentName: string, props?: any) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔧 ${componentName}`);
      if (props) {
        console.log('Props:', props);
      }
      console.log('Rendered at:', new Date().toISOString());
      console.groupEnd();
    }
  });
}

/**
 * Component performance profiler
 */
export function usePerformanceProfiler(componentName: string) {
  const renderCount = React.useRef(0);
  const renderTimes: number[] = [];

  React.useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now();
    renderTimes.push(renderTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} render #${renderCount.current} at ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.length > 0 ?
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length : 0
  };
}

/**
 * Component prop validator
 */
export function validateComponentProps<T extends Record<string, any>>(
  props: T,
  schema: Record<keyof T, (value: any) => boolean>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.keys(schema).forEach(key => {
    const validator = schema[key];
    const value = props[key];

    if (!validator(value)) {
      errors.push(`Invalid prop ${key}: ${value}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// MARK: - Export Utilities Info

export const COMPONENT_UTILITIES_INFO = {
  version: '1.0.0',
  categories: {
    css: ['cn', 'responsive', 'variant'],
    composition: ['composeComponents', 'createCompoundComponent', 'forwardRefWithAs'],
    props: ['extractProps', 'mergeProps', 'PolymorphicProps'],
    events: ['useDebouncedCallback', 'useThrottledCallback', 'composeEventHandlers'],
    accessibility: ['useId', 'createAriaAttributes', 'useFocusTrap'],
    performance: ['memoizeComponent', 'useVirtualization'],
    development: ['useComponentLogger', 'usePerformanceProfiler', 'validateComponentProps']
  },
  patterns: [
    'Polymorphic components with "as" prop',
    'Compound components with sub-components',
    'Event handler composition',
    'Focus management for accessibility',
    'Performance optimization with memoization',
    'Development-time debugging and profiling'
  ]
};

/**
 * Get component utilities information
 */
export function getComponentUtilitiesInfo() {
  return COMPONENT_UTILITIES_INFO;
}