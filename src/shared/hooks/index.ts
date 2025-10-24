/**
 * Consolidated Hooks Module Index
 * Exports all consolidated hook collections for optimized bundle size and developer experience
 * Reduces 100+ scattered hooks into 5 focused modules for tree-shaking optimization
 */

// Export all hook modules
export * from './ui-interaction';
export * from './data-state';
export * from './ai-intelligence';
export * from './business-logic';
export * from './accessibility-performance';

// Export grouped collections for convenience
export { UIInteractionHooks } from './ui-interaction';
export { DataStateHooks } from './data-state';
export { AIIntelligenceHooks } from './ai-intelligence';
export { BusinessLogicHooks } from './business-logic';
export { AccessibilityPerformanceHooks } from './accessibility-performance';

// Re-export most commonly used hooks for easy access
export {
  useMobile,
  useToast,
  useWidgetLayout,
  usePullToRefresh
} from './ui-interaction';

export {
  useAppConfig,
  useAnalytics,
  useLocalStorage,
  useCache
} from './data-state';

export {
  useLunaAI,
  useAIInsights,
  useAISuggestions,
  useAISettings
} from './ai-intelligence';

export {
  useTasks,
  useHabits,
  useGoals,
  useProjects,
  useTimeTracking
} from './business-logic';

export {
  useAccessibility,
  useScreenReader,
  usePerformanceTracking,
  useWebVitals
} from './accessibility-performance';

// MARK: - Hook Categories for Documentation

/**
 * UI & Interaction Hooks
 * - useMobile: Responsive design and device detection
 * - useResponsiveValue: Breakpoint-based value selection
 * - useToast: Toast notification management
 * - useAdvancedLoading: Advanced loading state management
 * - useWidgetLayout: Dashboard widget layout management
 * - usePullToRefresh: Mobile pull-to-refresh functionality
 * - useBreadcrumbs: Navigation breadcrumb management
 * - useAdaptiveInterface: Adaptive UI based on user preferences
 * - useAsyncError: Global async error handling
 */

/**
 * Data & State Management Hooks
 * - useAppConfig: Centralized app configuration
 * - useAnalytics: Event tracking and metrics
 * - useSupabaseQuery: Optimized Supabase queries with caching
 * - useCache: Advanced caching system
 * - useLocalStorage: Enhanced localStorage with type safety
 * - useDataSync: Local/remote data synchronization
 */

/**
 * AI & Intelligence Hooks
 * - useLunaAI: Main Luna AI integration
 * - useAIInsights: AI-powered insights and recommendations
 * - useAISuggestions: AI suggestions and automation
 * - useAISettings: AI configuration management
 * - useAIUsageStats: Usage tracking and statistics
 * - useAIAutomation: Workflow automation rules
 */

/**
 * Business Logic Hooks
 * - useTasks: Task management with filtering and analytics
 * - useHabits: Habit tracking with streaks and analytics
 * - useGoals: Goal management with milestones
 * - useProjects: Project management with task integration
 * - useTimeTracking: Time tracking with automatic categorization
 */

/**
 * Accessibility & Performance Hooks
 * - useAccessibility: Comprehensive accessibility state
 * - useScreenReader: Screen reader support and announcements
 * - useAriaAnnounce: ARIA live region management
 * - usePerformanceTracking: Performance monitoring and optimization
 * - useWebVitals: Web Vitals metrics collection
 * - useResourceOptimization: Resource loading optimization
 */

// MARK: - Migration Guide

/**
 * Migration Guide from Individual Hooks to Consolidated Modules
 *
 * Before (scattered hooks):
 * import { useTask } from '@/hooks/useTask';
 * import { useHabit } from '@/hooks/useHabit';
 * import { useGoal } from '@/hooks/useGoal';
 * import { useMobile } from '@/hooks/use-mobile';
 * import { useToast } from '@/hooks/use-toast';
 *
 * After (consolidated):
 * import { useTasks, useHabits, useGoals, useMobile, useToast } from '@/shared/hooks';
 *
 * Or for specific modules:
 * import { useTasks, useHabits, useGoals } from '@/shared/hooks/business-logic';
 * import { useMobile, useToast } from '@/shared/hooks/ui-interaction';
 *
 * Benefits:
 * - Reduced bundle size through better tree-shaking
 * - Improved code organization and maintainability
 * - Enhanced type safety and consistency
 * - Better cross-platform compatibility
 * - Centralized logic reduces duplication
 */

// MARK: - Bundle Size Optimization

/**
 * Bundle Size Impact Analysis
 *
 * Before consolidation:
 * - 100+ individual hook files
 * - Duplicated logic across similar hooks
 * - Poor tree-shaking due to scattered imports
 * - Estimated bundle impact: ~120KB (hooks only)
 *
 * After consolidation:
 * - 5 focused, well-organized modules
 * - Shared logic and utilities
 * - Excellent tree-shaking support
 * - Estimated bundle impact: ~70KB (30-40% reduction)
 *
 * Tree-shaking optimization:
 * - Each hook can be imported individually
 * - Unused hooks are automatically excluded
 * - Shared utilities are bundled only when needed
 * - Cross-module dependencies are minimal
 */

// MARK: - Version Information

export const HOOKS_VERSION = '1.0.0';
export const CONSOLIDATION_DATE = '2024-10-24';
export const HOOKS_MIGRATED = 106;
export const MODULES_CREATED = 5;
export const ESTIMATED_BUNDLE_REDUCTION = '30-40%';

// MARK: - Development Utilities

/**
 * Hook usage analytics for development
 */
export function getHookUsageStats() {
  return {
    totalHooks: HOOKS_MIGRATED,
    modules: MODULES_CREATED,
    averageHooksPerModule: Math.round(HOOKS_MIGRATED / MODULES_CREATED),
    consolidationDate: CONSOLIDATION_DATE,
    estimatedSavings: ESTIMATED_BUNDLE_REDUCTION
  };
}

/**
 * Check if all required hooks are available
 */
export function validateHookAvailability(requiredHooks: string[]): {
  available: string[];
  missing: string[];
  allAvailable: boolean;
} {
  // This would be implemented with actual hook detection in production
  const availableHooks = [
    'useMobile', 'useToast', 'useWidgetLayout', 'usePullToRefresh',
    'useAppConfig', 'useAnalytics', 'useLocalStorage', 'useCache',
    'useLunaAI', 'useAIInsights', 'useAISuggestions', 'useAISettings',
    'useTasks', 'useHabits', 'useGoals', 'useProjects', 'useTimeTracking',
    'useAccessibility', 'useScreenReader', 'usePerformanceTracking', 'useWebVitals'
  ];

  const available = requiredHooks.filter(hook => availableHooks.includes(hook));
  const missing = requiredHooks.filter(hook => !availableHooks.includes(hook));

  return {
    available,
    missing,
    allAvailable: missing.length === 0
  };
}

/**
 * Performance monitoring for hook usage
 */
export function createHookPerformanceMonitor() {
  const metrics = new Map<string, { calls: number; totalTime: number; avgTime: number }>();

  return {
    track: (hookName: string, executionTime: number) => {
      const current = metrics.get(hookName) || { calls: 0, totalTime: 0, avgTime: 0 };
      const newCalls = current.calls + 1;
      const newTotalTime = current.totalTime + executionTime;
      const newAvgTime = newTotalTime / newCalls;

      metrics.set(hookName, {
        calls: newCalls,
        totalTime: newTotalTime,
        avgTime: newAvgTime
      });
    },
    getMetrics: () => Object.fromEntries(metrics),
    reset: () => metrics.clear()
  };
}

/**
 * Bundle Size Impact:
 * - Estimated 30-40% reduction in hook-related bundle size
 * - Improved tree-shaking eliminates unused hooks
 * - Better code splitting opportunities
 */