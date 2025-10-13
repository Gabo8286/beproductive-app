/**
 * Memoization Provider
 * Global context for managing memoization strategies and performance monitoring
 */
import React, { createContext, useContext, useCallback, useRef, useMemo, ReactNode } from 'react';

interface MemoizationMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoizationHits: number;
  memoizationMisses: number;
  propChanges: Record<string, number>;
}

interface MemoizationContextType {
  // Performance tracking
  trackRender: (componentName: string, renderTime?: number) => void;
  trackMemoization: (componentName: string, hit: boolean) => void;
  trackPropChange: (componentName: string, propName: string) => void;

  // Metrics access
  getMetrics: (componentName?: string) => MemoizationMetrics[];
  clearMetrics: () => void;

  // Configuration
  enableTracking: boolean;
  performanceBudget: number;
  warnThreshold: number;
}

const MemoizationContext = createContext<MemoizationContextType | undefined>(undefined);

interface MemoizationProviderProps {
  children: ReactNode;
  enableTracking?: boolean;
  performanceBudget?: number; // ms per render
  warnThreshold?: number; // ms threshold for warnings
}

export const MemoizationProvider: React.FC<MemoizationProviderProps> = ({
  children,
  enableTracking = process.env.NODE_ENV === 'development',
  performanceBudget = 16, // 60fps frame budget
  warnThreshold = 10
}) => {
  const metricsRef = useRef<Map<string, MemoizationMetrics>>(new Map());

  const trackRender = useCallback((componentName: string, renderTime?: number) => {
    if (!enableTracking) return;

    const now = performance.now();
    const actualRenderTime = renderTime || 0;
    const metrics = metricsRef.current.get(componentName) || {
      componentName,
      renderCount: 0,
      lastRenderTime: now,
      averageRenderTime: 0,
      memoizationHits: 0,
      memoizationMisses: 0,
      propChanges: {}
    };

    metrics.renderCount++;
    metrics.lastRenderTime = now;

    if (actualRenderTime > 0) {
      metrics.averageRenderTime =
        (metrics.averageRenderTime * (metrics.renderCount - 1) + actualRenderTime) / metrics.renderCount;

      // Performance warnings
      if (actualRenderTime > warnThreshold) {
        console.warn(`🐌 Slow render: ${componentName} took ${actualRenderTime.toFixed(2)}ms`, {
          renderCount: metrics.renderCount,
          averageTime: metrics.averageRenderTime.toFixed(2),
          budget: performanceBudget
        });
      }

      if (actualRenderTime > performanceBudget) {
        console.error(`💥 Budget exceeded: ${componentName} took ${actualRenderTime.toFixed(2)}ms (budget: ${performanceBudget}ms)`);
      }
    }

    metricsRef.current.set(componentName, metrics);
  }, [enableTracking, performanceBudget, warnThreshold]);

  const trackMemoization = useCallback((componentName: string, hit: boolean) => {
    if (!enableTracking) return;

    const metrics = metricsRef.current.get(componentName);
    if (metrics) {
      if (hit) {
        metrics.memoizationHits++;
      } else {
        metrics.memoizationMisses++;
      }
      metricsRef.current.set(componentName, metrics);
    }
  }, [enableTracking]);

  const trackPropChange = useCallback((componentName: string, propName: string) => {
    if (!enableTracking) return;

    const metrics = metricsRef.current.get(componentName);
    if (metrics) {
      metrics.propChanges[propName] = (metrics.propChanges[propName] || 0) + 1;
      metricsRef.current.set(componentName, metrics);
    }
  }, [enableTracking]);

  const getMetrics = useCallback((componentName?: string) => {
    if (componentName) {
      const metric = metricsRef.current.get(componentName);
      return metric ? [metric] : [];
    }
    return Array.from(metricsRef.current.values());
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
  }, []);

  const contextValue = useMemo(() => ({
    trackRender,
    trackMemoization,
    trackPropChange,
    getMetrics,
    clearMetrics,
    enableTracking,
    performanceBudget,
    warnThreshold
  }), [
    trackRender,
    trackMemoization,
    trackPropChange,
    getMetrics,
    clearMetrics,
    enableTracking,
    performanceBudget,
    warnThreshold
  ]);

  return (
    <MemoizationContext.Provider value={contextValue}>
      {children}
    </MemoizationContext.Provider>
  );
};

export const useMemoizationContext = () => {
  const context = useContext(MemoizationContext);
  if (!context) {
    throw new Error('useMemoizationContext must be used within a MemoizationProvider');
  }
  return context;
};

/**
 * Higher-order component for automatic render tracking
 */
export function withRenderTracking<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.memo((props: P) => {
    const { trackRender, trackPropChange, enableTracking } = useMemoizationContext();
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    const prevPropsRef = useRef<P>();

    // Track prop changes
    React.useEffect(() => {
      if (enableTracking && prevPropsRef.current) {
        const currentProps = props;
        const prevProps = prevPropsRef.current;

        Object.keys(currentProps).forEach(key => {
          if (currentProps[key] !== prevProps[key]) {
            trackPropChange(name, key);
          }
        });
      }
      prevPropsRef.current = props;
    });

    // Track render performance
    React.useLayoutEffect(() => {
      const startTime = performance.now();

      return () => {
        const renderTime = performance.now() - startTime;
        trackRender(name, renderTime);
      };
    });

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withRenderTracking(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for component-level memoization with automatic tracking
 */
export function useComponentMemo<T>(
  value: T,
  deps: React.DependencyList,
  componentName: string
): T {
  const { trackMemoization } = useMemoizationContext();
  const prevDepsRef = useRef<React.DependencyList>();
  const prevValueRef = useRef<T>(value);

  return React.useMemo(() => {
    const hasChanged = !prevDepsRef.current ||
      deps.some((dep, index) => dep !== prevDepsRef.current![index]);

    trackMemoization(componentName, !hasChanged);

    if (hasChanged) {
      prevDepsRef.current = deps;
      prevValueRef.current = value;
      return value;
    }

    return prevValueRef.current;
  }, deps);
}

/**
 * Performance monitoring component
 */
export const PerformanceMonitor: React.FC<{
  onSlowComponent?: (componentName: string, metrics: MemoizationMetrics) => void;
  checkInterval?: number;
}> = ({ onSlowComponent, checkInterval = 5000 }) => {
  const { getMetrics, performanceBudget } = useMemoizationContext();

  React.useEffect(() => {
    if (!onSlowComponent) return;

    const interval = setInterval(() => {
      const metrics = getMetrics();
      metrics.forEach(metric => {
        if (metric.averageRenderTime > performanceBudget) {
          onSlowComponent(metric.componentName, metric);
        }
      });
    }, checkInterval);

    return () => clearInterval(interval);
  }, [getMetrics, onSlowComponent, performanceBudget, checkInterval]);

  return null;
};

/**
 * Debug component for visualizing memoization metrics
 */
export const MemoizationDebugger: React.FC<{
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ visible = process.env.NODE_ENV === 'development', position = 'bottom-right' }) => {
  const { getMetrics, clearMetrics } = useMemoizationContext();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!visible) return null;

  const metrics = getMetrics();
  const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
  const totalHits = metrics.reduce((sum, m) => sum + m.memoizationHits, 0);
  const totalMisses = metrics.reduce((sum, m) => sum + m.memoizationMisses, 0);
  const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses) * 100) : 0;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] bg-black/90 text-white p-2 rounded text-xs font-mono`}>
      <div
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        📊 Renders: {totalRenders} | Hit Rate: {hitRate.toFixed(1)}%
      </div>

      {isExpanded && (
        <div className="mt-2 max-h-96 overflow-auto">
          <div className="flex gap-2 mb-2">
            <button
              onClick={clearMetrics}
              className="px-2 py-1 bg-red-600 rounded text-xs"
            >
              Clear
            </button>
          </div>

          {metrics.sort((a, b) => b.renderCount - a.renderCount).map(metric => (
            <div key={metric.componentName} className="mb-2 p-2 bg-gray-800 rounded">
              <div className="font-semibold">{metric.componentName}</div>
              <div>Renders: {metric.renderCount}</div>
              <div>Avg Time: {metric.averageRenderTime.toFixed(2)}ms</div>
              <div>Hits/Misses: {metric.memoizationHits}/{metric.memoizationMisses}</div>
              {Object.keys(metric.propChanges).length > 0 && (
                <div>
                  Props: {Object.entries(metric.propChanges)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([prop, count]) => `${prop}(${count})`)
                    .join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};