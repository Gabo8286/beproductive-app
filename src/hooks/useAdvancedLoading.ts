import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export type LoadingPhase =
  | "idle"
  | "initial"
  | "loading"
  | "slow"
  | "timeout"
  | "success"
  | "error";

export interface LoadingState {
  phase: LoadingPhase;
  progress: number;
  message: string;
  isLoading: boolean;
  duration: number;
  hasSlowWarning: boolean;
  hasTimeoutWarning: boolean;
}

export interface LoadingConfig {
  slowThreshold?: number; // Time in ms when loading is considered slow
  timeoutThreshold?: number; // Time in ms when loading times out
  progressSteps?: number[]; // Progress milestones for staged loading
  messages?: {
    initial?: string;
    loading?: string;
    slow?: string;
    timeout?: string;
    success?: string;
    error?: string;
  };
  showToastOnSlow?: boolean;
  showToastOnTimeout?: boolean;
  retryable?: boolean;
}

const defaultConfig: Required<LoadingConfig> = {
  slowThreshold: 3000,
  timeoutThreshold: 15000,
  progressSteps: [10, 30, 60, 90],
  messages: {
    initial: "Initializing...",
    loading: "Loading...",
    slow: "This is taking longer than expected...",
    timeout: "Loading timed out. Please try again.",
    success: "Loaded successfully",
    error: "Failed to load",
  },
  showToastOnSlow: true,
  showToastOnTimeout: true,
  retryable: true,
};

/**
 * Advanced loading state management with progress tracking, timeout detection,
 * and user-friendly feedback for better UX during async operations
 */
export function useAdvancedLoading(config: LoadingConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<LoadingState>({
    phase: "idle",
    progress: 0,
    message: finalConfig.messages.initial,
    isLoading: false,
    duration: 0,
    hasSlowWarning: false,
    hasTimeoutWarning: false,
  });

  // Cleanup timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (slowTimeoutRef.current) {
      clearTimeout(slowTimeoutRef.current);
      slowTimeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Start loading with progress simulation
  const startLoading = useCallback((message?: string) => {
    clearTimers();
    startTimeRef.current = Date.now();

    setState({
      phase: "initial",
      progress: 0,
      message: message || finalConfig.messages.initial,
      isLoading: true,
      duration: 0,
      hasSlowWarning: false,
      hasTimeoutWarning: false,
    });

    // Move to loading phase immediately
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: "loading",
        message: finalConfig.messages.loading,
      }));
    }, 100);

    // Setup slow loading detection
    slowTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: "slow",
        message: finalConfig.messages.slow,
        hasSlowWarning: true,
      }));

      if (finalConfig.showToastOnSlow) {
        toast.warning("Loading is taking longer than expected", {
          description: "Please wait a bit more...",
          duration: 3000,
        });
      }
    }, finalConfig.slowThreshold);

    // Setup timeout detection
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: "timeout",
        message: finalConfig.messages.timeout,
        hasTimeoutWarning: true,
        isLoading: false,
      }));

      if (finalConfig.showToastOnTimeout) {
        toast.error("Loading timed out", {
          description: finalConfig.retryable ? "Please try again" : "Operation failed",
          duration: 5000,
        });
      }
    }, finalConfig.timeoutThreshold);

    // Setup progress simulation
    progressIntervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.phase === "timeout" || prev.phase === "success" || prev.phase === "error") {
          return prev;
        }

        const elapsed = Date.now() - (startTimeRef.current || 0);
        const progressPercent = Math.min(
          95, // Never reach 100% through simulation
          Math.floor((elapsed / finalConfig.timeoutThreshold) * 100)
        );

        return {
          ...prev,
          progress: progressPercent,
          duration: elapsed,
        };
      });
    }, 100);
  }, [finalConfig, clearTimers]);

  // Set specific progress value
  const setProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message,
    }));
  }, []);

  // Mark loading as successful
  const setSuccess = useCallback((message?: string) => {
    clearTimers();

    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

    setState(prev => ({
      ...prev,
      phase: "success",
      progress: 100,
      message: message || finalConfig.messages.success,
      isLoading: false,
      duration,
    }));
  }, [finalConfig.messages.success, clearTimers]);

  // Mark loading as failed
  const setError = useCallback((message?: string, error?: Error) => {
    clearTimers();

    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

    setState(prev => ({
      ...prev,
      phase: "error",
      message: message || error?.message || finalConfig.messages.error,
      isLoading: false,
      duration,
    }));

    console.error("[useAdvancedLoading] Loading failed:", error);
  }, [finalConfig.messages.error, clearTimers]);

  // Reset to idle state
  const reset = useCallback(() => {
    clearTimers();
    startTimeRef.current = null;

    setState({
      phase: "idle",
      progress: 0,
      message: finalConfig.messages.initial,
      isLoading: false,
      duration: 0,
      hasSlowWarning: false,
      hasTimeoutWarning: false,
    });
  }, [finalConfig.messages.initial, clearTimers]);

  // Wrap an async function with loading states
  const withLoading = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: {
        startMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      }
    ): Promise<T> => {
      try {
        startLoading(options?.startMessage);
        const result = await asyncFn();
        setSuccess(options?.successMessage);
        return result;
      } catch (error) {
        setError(options?.errorMessage, error as Error);
        throw error;
      }
    },
    [startLoading, setSuccess, setError]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    state,
    startLoading,
    setProgress,
    setSuccess,
    setError,
    reset,
    withLoading,

    // Computed properties for convenience
    isIdle: state.phase === "idle",
    isInitial: state.phase === "initial",
    isLoading: state.isLoading,
    isSlowLoading: state.phase === "slow",
    hasTimedOut: state.phase === "timeout",
    isSuccess: state.phase === "success",
    isError: state.phase === "error",
    canRetry: finalConfig.retryable && (state.phase === "timeout" || state.phase === "error"),
  };
}

// Hook for widget-specific loading with automatic skeleton management
export function useWidgetLoading(widgetId: string, config?: LoadingConfig) {
  const loading = useAdvancedLoading(config);

  // Enhanced loading specific for widgets
  const loadWidgetData = useCallback(
    async <T>(
      dataLoader: () => Promise<T>,
      options?: {
        cacheable?: boolean;
        retryCount?: number;
        fallbackData?: T;
      }
    ): Promise<T> => {
      try {
        return await loading.withLoading(async () => {
          // Add widget-specific loading logic here
          console.log(`[Widget:${widgetId}] Starting data load...`);

          const result = await dataLoader();

          console.log(`[Widget:${widgetId}] Data loaded successfully`);
          return result;
        });
      } catch (error) {
        console.error(`[Widget:${widgetId}] Data load failed:`, error);

        // Return fallback data if available
        if (options?.fallbackData !== undefined) {
          return options.fallbackData;
        }

        throw error;
      }
    },
    [loading, widgetId]
  );

  return {
    ...loading,
    loadWidgetData,
  };
}