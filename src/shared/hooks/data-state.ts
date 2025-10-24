/**
 * Data & State Management Hooks Module
 * Consolidated hooks for data fetching, caching, configuration, and state management
 * Optimizes data operations and reduces redundant state logic
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

// MARK: - Configuration & Settings Hooks

interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  privacy: {
    analytics: boolean;
    errorReporting: boolean;
    dataSharing: boolean;
  };
  experimental: {
    betaFeatures: boolean;
    aiFeatures: boolean;
    advancedMode: boolean;
  };
}

/**
 * Centralized app configuration management
 */
export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(() => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to load app config:', error);
        }
      }
    }

    // Default configuration
    return {
      theme: 'auto',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        enabled: true,
        email: true,
        push: false,
        frequency: 'daily'
      },
      privacy: {
        analytics: true,
        errorReporting: true,
        dataSharing: false
      },
      experimental: {
        betaFeatures: false,
        aiFeatures: true,
        advancedMode: false
      }
    };
  });

  const updateConfig = useCallback(<K extends keyof AppConfig>(
    key: K,
    value: Partial<AppConfig[K]> | AppConfig[K]
  ) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [key]: typeof value === 'object' && !Array.isArray(value)
          ? { ...prev[key], ...value }
          : value
      };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-config', JSON.stringify(newConfig));
      }

      return newConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      theme: 'auto',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        enabled: true,
        email: true,
        push: false,
        frequency: 'daily'
      },
      privacy: {
        analytics: true,
        errorReporting: true,
        dataSharing: false
      },
      experimental: {
        betaFeatures: false,
        aiFeatures: true,
        advancedMode: false
      }
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('app-config');
    }
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    // Convenience getters
    theme: config.theme,
    language: config.language,
    timezone: config.timezone,
    isExperimentalEnabled: config.experimental.betaFeatures,
    isAIEnabled: config.experimental.aiFeatures
  };
}

// MARK: - Analytics & Metrics Hooks

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  sessionId: string;
  isEnabled: boolean;
  pendingEvents: AnalyticsEvent[];
}

/**
 * Analytics tracking and metrics collection
 */
export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>(() => ({
    events: [],
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isEnabled: true,
    pendingEvents: []
  }));

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (!state.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
      sessionId: state.sessionId,
      userId: 'current-user' // Would be actual user ID
    };

    setState(prev => ({
      ...prev,
      events: [...prev.events.slice(-99), analyticsEvent], // Keep last 100 events
      pendingEvents: [...prev.pendingEvents, analyticsEvent]
    }));

    // In production, this would send to analytics service
    console.log('📊 Analytics:', analyticsEvent);
  }, [state.isEnabled, state.sessionId]);

  const flush = useCallback(async () => {
    if (state.pendingEvents.length === 0) return;

    try {
      // In production, send pending events to analytics service
      console.log('📤 Flushing analytics:', state.pendingEvents);

      setState(prev => ({
        ...prev,
        pendingEvents: []
      }));
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }, [state.pendingEvents]);

  const toggleAnalytics = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isEnabled: enabled
    }));
  }, []);

  const getEventsByType = useCallback((eventType: string) => {
    return state.events.filter(event => event.event === eventType);
  }, [state.events]);

  const getEventsInTimeRange = useCallback((start: Date, end: Date) => {
    return state.events.filter(event =>
      event.timestamp >= start && event.timestamp <= end
    );
  }, [state.events]);

  // Auto-flush pending events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.pendingEvents.length > 0) {
        flush();
      }
    }, 30000); // Flush every 30 seconds

    return () => clearInterval(interval);
  }, [flush, state.pendingEvents.length]);

  return {
    track,
    flush,
    toggleAnalytics,
    getEventsByType,
    getEventsInTimeRange,
    sessionId: state.sessionId,
    isEnabled: state.isEnabled,
    eventCount: state.events.length,
    pendingCount: state.pendingEvents.length,
    // Convenience tracking methods
    trackPageView: (page: string) => track('page_view', { page }),
    trackClick: (element: string, location?: string) => track('click', { element, location }),
    trackFeatureUse: (feature: string, context?: Record<string, any>) => track('feature_use', { feature, ...context })
  };
}

// MARK: - Supabase Data Hooks

interface UseSupabaseQueryOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastFetched: Date | null;
}

/**
 * Supabase query hook with caching and optimization
 */
export function useSupabaseQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<T>,
  supabaseClient: SupabaseClient,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    cacheKey,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastFetched: null
  });

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const execute = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check if data is still fresh (unless forced)
    if (!force && state.data && state.lastFetched) {
      const isStale = Date.now() - state.lastFetched.getTime() > staleTime;
      if (!isStale) return state.data;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await queryFnRef.current(supabaseClient);

      setState({
        data,
        isLoading: false,
        error: null,
        lastFetched: new Date()
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error as Error;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err
      }));

      onError?.(err);
      throw error;
    }
  }, [enabled, supabaseClient, staleTime, state.data, state.lastFetched, onSuccess, onError]);

  const refetch = useCallback(() => execute(true), [execute]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      execute();
    }
  }, [enabled, execute]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => execute(), refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, execute]);

  return {
    ...state,
    refetch,
    execute,
    isStale: state.lastFetched ? Date.now() - state.lastFetched.getTime() > staleTime : true
  };
}

// MARK: - Cache Management Hook

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Advanced caching system for data and computed values
 */
export function useCache<T = any>() {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const set = useCallback((key: string, data: T, ttl = 5 * 60 * 1000) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      cacheRef.current.delete(key);
      return false;
    }

    return true;
  }, []);

  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getOrSet = useCallback(async (
    key: string,
    fetcher: () => Promise<T> | T,
    ttl = 5 * 60 * 1000
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    set(key, data, ttl);
    return data;
  }, [get, set]);

  const invalidatePattern = useCallback((pattern: string | RegExp) => {
    const keys = Array.from(cacheRef.current.keys());
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    keys.forEach(key => {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
      }
    });
  }, []);

  const getStats = useCallback(() => {
    const entries = Array.from(cacheRef.current.entries());
    const now = Date.now();

    return {
      size: entries.length,
      expired: entries.filter(([, entry]) => now - entry.timestamp > entry.ttl).length,
      valid: entries.filter(([, entry]) => now - entry.timestamp <= entry.ttl).length,
      oldestEntry: Math.min(...entries.map(([, entry]) => entry.timestamp)),
      newestEntry: Math.max(...entries.map(([, entry]) => entry.timestamp))
    };
  }, []);

  // Cleanup expired entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const entries = Array.from(cacheRef.current.entries());

      entries.forEach(([key, entry]) => {
        if (now - entry.timestamp > entry.ttl) {
          cacheRef.current.delete(key);
        }
      });
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getOrSet,
    invalidatePattern,
    getStats,
    size: cacheRef.current.size
  };
}

// MARK: - Local Storage Hook

/**
 * Enhanced localStorage hook with JSON serialization and type safety
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// MARK: - Data Synchronization Hook

interface SyncState<T> {
  local: T;
  remote: T | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  hasConflicts: boolean;
  error: Error | null;
}

/**
 * Data synchronization between local and remote sources
 */
export function useDataSync<T>(
  key: string,
  defaultValue: T,
  remoteFetcher: () => Promise<T>,
  remoteSetter: (data: T) => Promise<void>,
  options: {
    syncInterval?: number;
    conflictResolver?: (local: T, remote: T) => T;
  } = {}
) {
  const { syncInterval = 30000, conflictResolver } = options;

  const [localData, setLocalData] = useLocalStorage(key, defaultValue);
  const [state, setState] = useState<SyncState<T>>({
    local: localData,
    remote: null,
    isLoading: false,
    isSyncing: false,
    lastSync: null,
    hasConflicts: false,
    error: null
  });

  const sync = useCallback(async (direction: 'push' | 'pull' | 'both' = 'both') => {
    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      if (direction === 'pull' || direction === 'both') {
        const remoteData = await remoteFetcher();
        setState(prev => ({ ...prev, remote: remoteData }));

        // Check for conflicts
        const hasConflicts = JSON.stringify(localData) !== JSON.stringify(remoteData);

        if (hasConflicts && conflictResolver) {
          const resolved = conflictResolver(localData, remoteData);
          setLocalData(resolved);
          setState(prev => ({ ...prev, local: resolved, hasConflicts: false }));
        } else if (hasConflicts) {
          setState(prev => ({ ...prev, hasConflicts: true }));
        } else {
          setLocalData(remoteData);
          setState(prev => ({ ...prev, local: remoteData, hasConflicts: false }));
        }
      }

      if (direction === 'push' || direction === 'both') {
        await remoteSetter(localData);
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error as Error
      }));
    }
  }, [localData, setLocalData, remoteFetcher, remoteSetter, conflictResolver]);

  const resolveConflict = useCallback((resolution: T) => {
    setLocalData(resolution);
    setState(prev => ({
      ...prev,
      local: resolution,
      hasConflicts: false
    }));
  }, [setLocalData]);

  const forceUpdate = useCallback((data: T) => {
    setLocalData(data);
    setState(prev => ({ ...prev, local: data }));
  }, [setLocalData]);

  // Auto-sync on interval
  useEffect(() => {
    if (syncInterval > 0) {
      const interval = setInterval(() => sync(), syncInterval);
      return () => clearInterval(interval);
    }
  }, [sync, syncInterval]);

  // Initial sync
  useEffect(() => {
    sync('pull');
  }, []);

  return {
    ...state,
    data: localData,
    setData: setLocalData,
    sync,
    resolveConflict,
    forceUpdate,
    // Convenience methods
    pullFromRemote: () => sync('pull'),
    pushToRemote: () => sync('push'),
    hasUnsyncedChanges: state.lastSync ? localData !== state.remote : true
  };
}

// MARK: - Export All Hooks

export const DataStateHooks = {
  useAppConfig,
  useAnalytics,
  useSupabaseQuery,
  useCache,
  useLocalStorage,
  useDataSync
};

export default DataStateHooks;