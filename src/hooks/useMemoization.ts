/**
 * Strategic Memoization Hooks
 * Advanced memoization utilities for optimizing React performance
 */
import { useMemo, useCallback, useRef, useEffect, DependencyList } from 'react';

/**
 * Enhanced useMemo with automatic dependency tracking and debugging
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debugName?: string
): T {
  const prevDepsRef = useRef<DependencyList>();
  const memoizedValue = useMemo(() => {
    if (process.env.NODE_ENV === 'development' && debugName) {
      const hasChanged = !prevDepsRef.current ||
        deps.some((dep, index) => dep !== prevDepsRef.current![index]);

      if (hasChanged) {
        console.debug(`🔄 Memoization: ${debugName} recalculated`, {
          previousDeps: prevDepsRef.current,
          currentDeps: deps,
          changedIndices: deps.map((dep, index) =>
            dep !== prevDepsRef.current?.[index] ? index : null
          ).filter(i => i !== null)
        });
      }
    }

    prevDepsRef.current = deps;
    return factory();
  }, deps);

  return memoizedValue;
}

/**
 * Enhanced useCallback with automatic dependency optimization
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  debugName?: string
): T {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Update callback ref when dependencies change
  const hasDepChanged = useMemo(() => {
    const changed = !depsRef.current ||
      deps.some((dep, index) => dep !== depsRef.current[index]);

    if (changed) {
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.debug(`🔄 Callback: ${debugName} recreated`, {
          previousDeps: depsRef.current,
          currentDeps: deps
        });
      }
      callbackRef.current = callback;
      depsRef.current = deps;
    }

    return changed;
  }, deps);

  return useCallback(callbackRef.current, deps) as T;
}

/**
 * Memo hook for expensive computations with result caching
 */
export function useExpensiveMemo<T>(
  computation: () => T,
  deps: DependencyList,
  options: {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
    debugName?: string;
  } = {}
): T {
  const { maxCacheSize = 10, ttl = 60000, debugName } = options;
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());

  return useMemo(() => {
    const depsKey = JSON.stringify(deps);
    const now = Date.now();
    const cached = cacheRef.current.get(depsKey);

    // Check if we have a valid cached result
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.debug(`💾 Cache hit: ${debugName}`, { depsKey, age: now - cached.timestamp });
      }
      return cached.value;
    }

    // Compute new value
    const startTime = performance.now();
    const result = computation();
    const computeTime = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development' && debugName) {
      console.debug(`⚡ Expensive computation: ${debugName}`, {
        computeTime: `${computeTime.toFixed(2)}ms`,
        depsKey,
        cacheSize: cacheRef.current.size
      });
    }

    // Cache the result
    cacheRef.current.set(depsKey, { value: result, timestamp: now });

    // Prune cache if it's too large
    if (cacheRef.current.size > maxCacheSize) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, entries.length - maxCacheSize);
      toDelete.forEach(([key]) => cacheRef.current.delete(key));
    }

    return result;
  }, deps);
}

/**
 * Hook for deep equality comparison with memoization
 */
export function useDeepMemo<T>(value: T, debugName?: string): T {
  const ref = useRef<T>(value);
  const serializedValue = JSON.stringify(value);
  const serializedRef = useRef(serializedValue);

  return useMemo(() => {
    if (serializedValue !== serializedRef.current) {
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.debug(`🔍 Deep comparison: ${debugName} changed`, {
          previous: serializedRef.current,
          current: serializedValue
        });
      }
      ref.current = value;
      serializedRef.current = serializedValue;
    }
    return ref.current;
  }, [serializedValue]);
}

/**
 * Memoization hook for object properties to prevent unnecessary re-renders
 */
export function useObjectMemo<T extends Record<string, any>>(
  obj: T,
  keys?: (keyof T)[],
  debugName?: string
): T {
  const keysToWatch = keys || Object.keys(obj) as (keyof T)[];

  return useStableMemo(() => {
    const result = {} as T;
    for (const key of keysToWatch) {
      result[key] = obj[key];
    }
    return result;
  }, keysToWatch.map(key => obj[key]), debugName);
}

/**
 * Hook for memoizing array operations
 */
export function useArrayMemo<T>(
  array: T[],
  keySelector?: (item: T) => string | number,
  debugName?: string
): T[] {
  const keyFn = keySelector || ((item: T, index: number) =>
    typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item) + index
  );

  return useStableMemo(() => {
    return [...array];
  }, [
    array.length,
    ...array.map((item, index) => keyFn(item, index))
  ], debugName);
}

/**
 * Selective memoization based on performance budget
 */
export function usePerformanceBudgetMemo<T>(
  computation: () => T,
  deps: DependencyList,
  budgetMs: number = 16, // Frame budget (60fps = 16.67ms per frame)
  debugName?: string
): T {
  const lastComputeTimeRef = useRef<number>(0);
  const fallbackValueRef = useRef<T>();

  return useMemo(() => {
    const startTime = performance.now();

    // If last computation exceeded budget, consider skipping
    if (lastComputeTimeRef.current > budgetMs && fallbackValueRef.current !== undefined) {
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.warn(`⚠️ Performance budget exceeded: ${debugName} (${lastComputeTimeRef.current.toFixed(2)}ms > ${budgetMs}ms), using fallback`);
      }
      return fallbackValueRef.current;
    }

    const result = computation();
    const computeTime = performance.now() - startTime;
    lastComputeTimeRef.current = computeTime;
    fallbackValueRef.current = result;

    if (process.env.NODE_ENV === 'development' && debugName && computeTime > budgetMs * 0.8) {
      console.warn(`⚠️ Performance budget warning: ${debugName} (${computeTime.toFixed(2)}ms approaching ${budgetMs}ms budget)`);
    }

    return result;
  }, deps);
}

/**
 * Conditional memoization - only memoizes when condition is met
 */
export function useConditionalMemo<T>(
  computation: () => T,
  deps: DependencyList,
  shouldMemoize: boolean,
  debugName?: string
): T {
  const nonMemoizedRef = useRef<T>();

  const memoizedValue = useMemo(() => {
    if (!shouldMemoize) {
      return undefined;
    }

    if (process.env.NODE_ENV === 'development' && debugName) {
      console.debug(`💾 Conditional memoization active: ${debugName}`);
    }

    return computation();
  }, shouldMemoize ? deps : []);

  if (!shouldMemoize) {
    nonMemoizedRef.current = computation();
    return nonMemoizedRef.current;
  }

  return memoizedValue as T;
}

/**
 * Batch memoization for multiple related computations
 */
export function useBatchMemo<T extends Record<string, any>>(
  computations: { [K in keyof T]: () => T[K] },
  deps: DependencyList,
  debugName?: string
): T {
  return useStableMemo(() => {
    const startTime = performance.now();
    const result = {} as T;

    for (const [key, computation] of Object.entries(computations)) {
      result[key as keyof T] = computation();
    }

    if (process.env.NODE_ENV === 'development' && debugName) {
      const computeTime = performance.now() - startTime;
      console.debug(`📦 Batch computation: ${debugName}`, {
        computeTime: `${computeTime.toFixed(2)}ms`,
        computationCount: Object.keys(computations).length
      });
    }

    return result;
  }, deps, debugName);
}

/**
 * Memoization with cleanup for resource management
 */
export function useMemoWithCleanup<T>(
  factory: () => T,
  cleanup: (value: T) => void,
  deps: DependencyList,
  debugName?: string
): T {
  const cleanupRef = useRef<((value: T) => void) | null>(null);
  const valueRef = useRef<T>();

  const memoizedValue = useMemo(() => {
    // Cleanup previous value if it exists
    if (cleanupRef.current && valueRef.current !== undefined) {
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.debug(`🧹 Cleanup: ${debugName}`);
      }
      cleanupRef.current(valueRef.current);
    }

    const newValue = factory();
    cleanupRef.current = cleanup;
    valueRef.current = newValue;

    return newValue;
  }, deps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current && valueRef.current !== undefined) {
        cleanupRef.current(valueRef.current);
      }
    };
  }, []);

  return memoizedValue;
}