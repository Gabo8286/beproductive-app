import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { monitoring } from './monitoring';
import { advancedMonitoring } from './advanced-monitoring';

/**
 * Advanced Error Recovery and Resilience System
 * Provides comprehensive error handling, recovery strategies,
 * and resilience patterns for production applications
 */

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;
  autoRecover?: boolean;
  reportToMonitoring?: boolean;
}

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
  lastErrorTime: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: number;
}

// Enhanced Error Boundary with Recovery Mechanisms
export class AdvancedErrorBoundary extends Component<
  {
    children: ReactNode;
    options?: ErrorRecoveryOptions;
    fallback?: (error: Error, retry: () => void) => ReactNode;
  },
  ErrorState
> {
  private retryTimeout: number | null = null;
  private readonly options: Required<ErrorRecoveryOptions>;

  constructor(props: any) {
    super(props);

    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackComponent: null,
      onError: () => {},
      autoRecover: true,
      reportToMonitoring: true,
      ...props.options
    };

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const newState = {
      ...this.state,
      error,
      errorInfo,
      hasError: true,
      lastErrorTime: Date.now()
    };

    this.setState(newState);

    // Report to monitoring
    if (this.options.reportToMonitoring) {
      monitoring.trackError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount,
        autoRecovery: this.options.autoRecover
      });

      // Track as critical performance issue
      advancedMonitoring.checkPerformanceBudget('error-rate', 1);
    }

    // Call custom error handler
    this.options.onError(error, errorInfo);

    // Auto-recovery attempt
    if (this.options.autoRecover && this.state.retryCount < this.options.maxRetries) {
      this.scheduleRecovery();
    }
  }

  private scheduleRecovery = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({ isRecovering: true });

    this.retryTimeout = window.setTimeout(() => {
      this.attemptRecovery();
    }, this.options.retryDelay * Math.pow(2, this.state.retryCount)); // Exponential backoff
  };

  private attemptRecovery = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
      isRecovering: false
    });

    // Log recovery attempt
    monitoring.trackUserAction({
      action: 'error_recovery_attempt',
      category: 'reliability',
      label: this.state.error?.message || 'unknown',
      value: this.state.retryCount + 1,
      sessionId: '',
      timestamp: Date.now(),
      properties: {
        retryCount: this.state.retryCount + 1,
        errorType: this.state.error?.name,
        autoRecovery: true
      }
    });
  };

  private handleManualRetry = () => {
    if (this.state.retryCount < this.options.maxRetries) {
      this.attemptRecovery();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleManualRetry);
      }

      // Use fallback component if provided
      if (this.options.fallbackComponent) {
        return this.options.fallbackComponent;
      }

      // Default error UI
      return (
        <ErrorFallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.options.maxRetries}
          isRecovering={this.state.isRecovering}
          onRetry={this.handleManualRetry}
        />
      );
    }

    return this.props.children;
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }
}

// Default Error Fallback Component
const ErrorFallbackComponent: React.FC<{
  error: Error;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
  isRecovering: boolean;
  onRetry: () => void;
}> = ({ error, retryCount, maxRetries, isRecovering, onRetry }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-center max-w-md">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>

        {retryCount < maxRetries && (
          <div className="space-y-3">
            {isRecovering ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">Recovering...</span>
              </div>
            ) : (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again ({retryCount}/{maxRetries})
              </button>
            )}
          </div>
        )}

        {retryCount >= maxRetries && (
          <div className="text-sm text-gray-500">
            Maximum retry attempts reached. Please refresh the page.
          </div>
        )}
      </div>
    </div>
  );
};

// Circuit Breaker Pattern Implementation
export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
    nextAttempt: 0
  };

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000,
    private monitoringEnabled: boolean = true
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'open') {
      if (Date.now() < this.state.nextAttempt) {
        throw new Error('Circuit breaker is open - operation not allowed');
      } else {
        this.state.state = 'half-open';
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (this.state.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();

      if (this.monitoringEnabled) {
        monitoring.trackError(error as Error, {
          circuitBreaker: true,
          circuitState: this.state.state,
          failures: this.state.failures
        });
      }

      throw error;
    }
  }

  private recordFailure() {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'open';
      this.state.nextAttempt = Date.now() + this.recoveryTimeout;

      if (this.monitoringEnabled) {
        monitoring.trackUserAction({
          action: 'circuit_breaker_opened',
          category: 'reliability',
          value: this.state.failures,
          sessionId: '',
          timestamp: Date.now(),
          properties: {
            failures: this.state.failures,
            threshold: this.failureThreshold
          }
        });
      }
    }
  }

  private reset() {
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
      nextAttempt: 0
    };

    if (this.monitoringEnabled) {
      monitoring.trackUserAction({
        action: 'circuit_breaker_reset',
        category: 'reliability',
        sessionId: '',
        timestamp: Date.now()
      });
    }
  }

  getState() {
    return { ...this.state };
  }
}

// Retry with Exponential Backoff
export class RetryHandler {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 30000,
    private backoffFactor: number = 2
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(
            this.baseDelay * Math.pow(this.backoffFactor, attempt - 1),
            this.maxDelay
          );

          await this.sleep(delay);

          monitoring.trackUserAction({
            action: 'retry_attempt',
            category: 'reliability',
            value: attempt,
            sessionId: '',
            timestamp: Date.now(),
            properties: {
              attempt,
              delay,
              maxRetries: this.maxRetries
            }
          });
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          monitoring.trackError(lastError, {
            retryExhausted: true,
            attempts: attempt + 1,
            maxRetries: this.maxRetries
          });
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// React Hooks for Error Recovery
export const useErrorRecovery = (options?: ErrorRecoveryOptions) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRecovering: false,
    lastErrorTime: 0
  });

  const handleError = (error: Error) => {
    setErrorState({
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: Date.now()
    });

    if (options?.reportToMonitoring !== false) {
      monitoring.trackError(error, {
        hookBasedErrorRecovery: true
      });
    }
  };

  const retry = () => {
    if (errorState.retryCount < (options?.maxRetries || 3)) {
      setErrorState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
        isRecovering: false
      }));
    }
  };

  const reset = () => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: 0
    });
  };

  return {
    errorState,
    handleError,
    retry,
    reset,
    canRetry: errorState.retryCount < (options?.maxRetries || 3)
  };
};

// React Hook for Circuit Breaker
export const useCircuitBreaker = (
  failureThreshold: number = 5,
  recoveryTimeout: number = 60000
) => {
  const [circuitBreaker] = useState(
    () => new CircuitBreaker(failureThreshold, recoveryTimeout)
  );

  const execute = async <T,>(operation: () => Promise<T>): Promise<T> => {
    return circuitBreaker.execute(operation);
  };

  const getState = () => circuitBreaker.getState();

  return { execute, getState };
};

// React Hook for Retry Logic
export const useRetry = (
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  const [retryHandler] = useState(
    () => new RetryHandler(maxRetries, baseDelay)
  );

  const execute = async <T,>(operation: () => Promise<T>): Promise<T> => {
    return retryHandler.execute(operation);
  };

  return { execute };
};

// HOC for Error Recovery
export const withErrorRecovery = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: ErrorRecoveryOptions
) => {
  const WithErrorRecoveryComponent = (props: P) => {
    return (
      <AdvancedErrorBoundary options={options}>
        <WrappedComponent {...props} />
      </AdvancedErrorBoundary>
    );
  };

  WithErrorRecoveryComponent.displayName = `withErrorRecovery(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorRecoveryComponent;
};

export default {
  AdvancedErrorBoundary,
  CircuitBreaker,
  RetryHandler,
  useErrorRecovery,
  useCircuitBreaker,
  useRetry,
  withErrorRecovery
};