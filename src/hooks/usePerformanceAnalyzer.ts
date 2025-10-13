/**
 * Performance Analyzer Hook
 * Comprehensive tool for measuring and analyzing React component performance
 */
import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useMemoizationContext } from '@/components/optimization/MemoizationProvider';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentPerformanceData {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  memoryUsage: number[];
  memoizationEfficiency: number;
  propChangeFrequency: Record<string, number>;
  slowRenders: number;
  lastAnalysis: number;
}

interface PerformanceBenchmark {
  name: string;
  baseline: number;
  current: number;
  improvement: number;
  trend: 'improving' | 'degrading' | 'stable';
}

interface PerformanceAnalysisResult {
  overall: {
    totalComponents: number;
    averageRenderTime: number;
    memoizationHitRate: number;
    memoryEfficiency: number;
    performanceScore: number;
  };
  components: ComponentPerformanceData[];
  benchmarks: PerformanceBenchmark[];
  recommendations: string[];
  criticalIssues: string[];
}

export function usePerformanceAnalyzer(options: {
  enableProfiling?: boolean;
  sampleInterval?: number;
  maxSamples?: number;
  thresholds?: {
    slowRender?: number;
    memoryLeakThreshold?: number;
    memoizationThreshold?: number;
  };
} = {}) {
  const {
    enableProfiling = process.env.NODE_ENV === 'development',
    sampleInterval = 1000,
    maxSamples = 1000,
    thresholds = {
      slowRender: 16,
      memoryLeakThreshold: 100 * 1024 * 1024, // 100MB
      memoizationThreshold: 0.8 // 80% hit rate
    }
  } = options;

  const { getMetrics } = useMemoizationContext();
  const metricsRef = useRef<Map<string, PerformanceMetric[]>>(new Map());
  const baselineRef = useRef<Map<string, number>>(new Map());
  const analysisHistoryRef = useRef<PerformanceAnalysisResult[]>([]);

  // Record a performance metric
  const recordMetric = useCallback((name: string, value: number, metadata?: Record<string, any>) => {
    if (!enableProfiling) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: performance.now(),
      metadata
    };

    const existing = metricsRef.current.get(name) || [];
    existing.push(metric);

    // Limit the number of samples
    if (existing.length > maxSamples) {
      existing.splice(0, existing.length - maxSamples);
    }

    metricsRef.current.set(name, existing);
  }, [enableProfiling, maxSamples]);

  // Set performance baseline
  const setBaseline = useCallback((name: string, value: number) => {
    baselineRef.current.set(name, value);
  }, []);

  // Get metrics for a specific component or all metrics
  const getAnalyticsData = useCallback((componentName?: string) => {
    if (componentName) {
      return metricsRef.current.get(componentName) || [];
    }
    return Array.from(metricsRef.current.entries());
  }, []);

  // Calculate component performance data
  const calculateComponentPerformance = useCallback((componentName: string): ComponentPerformanceData => {
    const memoizationMetrics = getMetrics(componentName)[0];
    const performanceMetrics = metricsRef.current.get(`render-${componentName}`) || [];
    const memoryMetrics = metricsRef.current.get(`memory-${componentName}`) || [];

    const renderTimes = performanceMetrics.map(m => m.value).filter(v => v > 0);
    const memoryUsage = memoryMetrics.map(m => m.value);

    const totalRenderTime = renderTimes.reduce((sum, time) => sum + time, 0);
    const averageRenderTime = renderTimes.length > 0 ? totalRenderTime / renderTimes.length : 0;
    const minRenderTime = renderTimes.length > 0 ? Math.min(...renderTimes) : 0;
    const maxRenderTime = renderTimes.length > 0 ? Math.max(...renderTimes) : 0;
    const slowRenders = renderTimes.filter(time => time > (thresholds.slowRender || 16)).length;

    const memoizationHits = memoizationMetrics?.memoizationHits || 0;
    const memoizationMisses = memoizationMetrics?.memoizationMisses || 0;
    const memoizationTotal = memoizationHits + memoizationMisses;
    const memoizationEfficiency = memoizationTotal > 0 ? memoizationHits / memoizationTotal : 0;

    return {
      componentName,
      renderCount: renderTimes.length,
      totalRenderTime,
      averageRenderTime,
      minRenderTime,
      maxRenderTime,
      memoryUsage,
      memoizationEfficiency,
      propChangeFrequency: memoizationMetrics?.propChanges || {},
      slowRenders,
      lastAnalysis: Date.now()
    };
  }, [getMetrics, thresholds.slowRender]);

  // Calculate performance benchmarks
  const calculateBenchmarks = useCallback((): PerformanceBenchmark[] => {
    const benchmarks: PerformanceBenchmark[] = [];

    baselineRef.current.forEach((baseline, name) => {
      const currentMetrics = metricsRef.current.get(name) || [];
      const recentMetrics = currentMetrics.slice(-10); // Last 10 samples
      const current = recentMetrics.length > 0 ?
        recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length :
        baseline;

      const improvement = ((baseline - current) / baseline) * 100;
      let trend: 'improving' | 'degrading' | 'stable' = 'stable';

      if (Math.abs(improvement) > 5) {
        trend = improvement > 0 ? 'improving' : 'degrading';
      }

      benchmarks.push({
        name,
        baseline,
        current,
        improvement,
        trend
      });
    });

    return benchmarks;
  }, []);

  // Generate performance recommendations
  const generateRecommendations = useCallback((componentsData: ComponentPerformanceData[]): string[] => {
    const recommendations: string[] = [];

    componentsData.forEach(component => {
      // Slow render recommendations
      if (component.averageRenderTime > (thresholds.slowRender || 16)) {
        recommendations.push(
          `Consider optimizing ${component.componentName}: average render time is ${component.averageRenderTime.toFixed(2)}ms`
        );
      }

      // Memoization recommendations
      if (component.memoizationEfficiency < (thresholds.memoizationThreshold || 0.8) && component.renderCount > 10) {
        recommendations.push(
          `Improve memoization for ${component.componentName}: only ${(component.memoizationEfficiency * 100).toFixed(1)}% hit rate`
        );
      }

      // Prop change frequency recommendations
      const propChanges = Object.entries(component.propChangeFrequency);
      const frequentProps = propChanges.filter(([, count]) => count > component.renderCount * 0.5);
      if (frequentProps.length > 0) {
        recommendations.push(
          `Frequently changing props in ${component.componentName}: ${frequentProps.map(([prop]) => prop).join(', ')}`
        );
      }

      // Memory recommendations
      if (component.memoryUsage.length > 10) {
        const memoryTrend = component.memoryUsage.slice(-5).reduce((sum, usage) => sum + usage, 0) / 5 -
          component.memoryUsage.slice(0, 5).reduce((sum, usage) => sum + usage, 0) / 5;

        if (memoryTrend > (thresholds.memoryLeakThreshold || 100 * 1024 * 1024) * 0.1) {
          recommendations.push(
            `Potential memory leak in ${component.componentName}: memory usage trending upward`
          );
        }
      }
    });

    return recommendations;
  }, [thresholds]);

  // Identify critical performance issues
  const identifyCriticalIssues = useCallback((componentsData: ComponentPerformanceData[]): string[] => {
    const issues: string[] = [];

    componentsData.forEach(component => {
      // Critical render time issues
      if (component.maxRenderTime > 100) {
        issues.push(
          `CRITICAL: ${component.componentName} had a render that took ${component.maxRenderTime.toFixed(2)}ms`
        );
      }

      // Critical memory issues
      const currentMemory = component.memoryUsage[component.memoryUsage.length - 1];
      if (currentMemory > (thresholds.memoryLeakThreshold || 100 * 1024 * 1024)) {
        issues.push(
          `CRITICAL: ${component.componentName} is using ${(currentMemory / 1024 / 1024).toFixed(1)}MB of memory`
        );
      }

      // Critical slow render frequency
      const slowRenderPercentage = component.renderCount > 0 ? (component.slowRenders / component.renderCount) * 100 : 0;
      if (slowRenderPercentage > 20) {
        issues.push(
          `CRITICAL: ${component.componentName} has ${slowRenderPercentage.toFixed(1)}% slow renders`
        );
      }
    });

    return issues;
  }, [thresholds]);

  // Perform comprehensive performance analysis
  const analyzePerformance = useCallback((): PerformanceAnalysisResult => {
    const memoizationMetrics = getMetrics();
    const componentNames = new Set([
      ...memoizationMetrics.map(m => m.componentName),
      ...Array.from(metricsRef.current.keys()).map(key => key.replace(/^(render|memory)-/, ''))
    ]);

    const componentsData = Array.from(componentNames).map(calculateComponentPerformance);
    const benchmarks = calculateBenchmarks();
    const recommendations = generateRecommendations(componentsData);
    const criticalIssues = identifyCriticalIssues(componentsData);

    // Calculate overall performance metrics
    const totalRenderTime = componentsData.reduce((sum, c) => sum + c.totalRenderTime, 0);
    const totalRenders = componentsData.reduce((sum, c) => sum + c.renderCount, 0);
    const averageRenderTime = totalRenders > 0 ? totalRenderTime / totalRenders : 0;

    const totalMemoizationHits = memoizationMetrics.reduce((sum, m) => sum + m.memoizationHits, 0);
    const totalMemoizationMisses = memoizationMetrics.reduce((sum, m) => sum + m.memoizationMisses, 0);
    const memoizationTotal = totalMemoizationHits + totalMemoizationMisses;
    const memoizationHitRate = memoizationTotal > 0 ? totalMemoizationHits / memoizationTotal : 0;

    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryEfficiency = Math.max(0, 1 - (currentMemory / (thresholds.memoryLeakThreshold || 100 * 1024 * 1024)));

    // Calculate performance score (0-100)
    const renderScore = Math.max(0, 100 - (averageRenderTime / (thresholds.slowRender || 16)) * 100);
    const memoizationScore = memoizationHitRate * 100;
    const memoryScore = memoryEfficiency * 100;
    const performanceScore = (renderScore + memoizationScore + memoryScore) / 3;

    const result: PerformanceAnalysisResult = {
      overall: {
        totalComponents: componentsData.length,
        averageRenderTime,
        memoizationHitRate,
        memoryEfficiency,
        performanceScore
      },
      components: componentsData,
      benchmarks,
      recommendations,
      criticalIssues
    };

    // Store in history
    analysisHistoryRef.current.push(result);
    if (analysisHistoryRef.current.length > 50) {
      analysisHistoryRef.current.shift();
    }

    return result;
  }, [
    getMetrics,
    calculateComponentPerformance,
    calculateBenchmarks,
    generateRecommendations,
    identifyCriticalIssues,
    thresholds
  ]);

  // Get historical analysis data
  const getAnalysisHistory = useCallback(() => {
    return analysisHistoryRef.current;
  }, []);

  // Clear all performance data
  const clearPerformanceData = useCallback(() => {
    metricsRef.current.clear();
    baselineRef.current.clear();
    analysisHistoryRef.current.length = 0;
  }, []);

  // Export performance data
  const exportPerformanceData = useCallback(() => {
    return {
      metrics: Object.fromEntries(metricsRef.current),
      baselines: Object.fromEntries(baselineRef.current),
      history: analysisHistoryRef.current,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Automatic performance monitoring
  useEffect(() => {
    if (!enableProfiling) return;

    const interval = setInterval(() => {
      // Record memory usage
      const memory = (performance as any).memory;
      if (memory) {
        recordMetric('global-memory', memory.usedJSHeapSize, {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }

      // Record FPS if available
      const now = performance.now();
      recordMetric('fps-timestamp', now);
    }, sampleInterval);

    return () => clearInterval(interval);
  }, [enableProfiling, sampleInterval, recordMetric]);

  return {
    recordMetric,
    setBaseline,
    getAnalyticsData,
    analyzePerformance,
    getAnalysisHistory,
    clearPerformanceData,
    exportPerformanceData,
    isProfilingEnabled: enableProfiling
  };
}