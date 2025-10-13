import React, { Component, ErrorInfo, ReactNode, ComponentType } from "react";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Bug, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack: string;
  level: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  errorBoundary: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
}

interface Props {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; errorInfo: ErrorInfo; resetError: () => void }>;
  level?: "page" | "section" | "component" | "widget";
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolateFailures?: boolean; // If true, errors won't bubble up
  retryLimit?: number; // Maximum number of automatic retries
  name?: string; // Boundary identifier for debugging
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
  errorId: string | null;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private errorTimeouts: Set<NodeJS.Timeout> = new Set();

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = "component", onError, name } = this.props;

    // Enhanced error logging with context
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      buildVersion: this.getBuildVersion(),
      errorBoundary: name || `${level}-boundary`,
      props: this.sanitizeProps(this.props),
      state: this.sanitizeState(this.state),
    };

    console.group(`[EnhancedErrorBoundary] Error in ${errorReport.errorBoundary}`);
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Full Report:", errorReport);
    console.groupEnd();

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Report error to monitoring service
    this.reportError(errorReport);

    // Show user notification based on error severity
    this.notifyUser(error, level);

    // Attempt automatic recovery for certain error types
    this.attemptRecovery(error, errorReport);
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Attempt to get user ID from context or localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore errors in getting user ID
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  private getBuildVersion(): string | undefined {
    return import.meta.env.VITE_BUILD_VERSION || undefined;
  }

  private sanitizeProps(props: Props): Record<string, unknown> {
    const { children, fallback, onError, ...safeProps } = props;
    return {
      ...safeProps,
      hasChildren: !!children,
      hasFallback: !!fallback,
      hasOnError: !!onError,
    };
  }

  private sanitizeState(state: State): Record<string, unknown> {
    return {
      hasError: state.hasError,
      retryCount: state.retryCount,
      showDetails: state.showDetails,
      errorId: state.errorId,
      errorMessage: state.error?.message,
    };
  }

  private async reportError(errorReport: ErrorReport): Promise<void> {
    try {
      // In development, just log to console
      if (import.meta.env.MODE === 'development') {
        console.warn('[ErrorBoundary] Error report (dev mode):', errorReport);
        return;
      }

      // Send to error monitoring service
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }

      console.log('[ErrorBoundary] Error reported successfully');
    } catch (reportError) {
      console.error('[ErrorBoundary] Failed to report error:', reportError);

      // Fallback: Store error locally for later reporting
      try {
        const storedErrors = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
        storedErrors.push(errorReport);
        // Keep only last 10 errors to prevent localStorage bloat
        if (storedErrors.length > 10) {
          storedErrors.splice(0, storedErrors.length - 10);
        }
        localStorage.setItem('pendingErrors', JSON.stringify(storedErrors));
      } catch {
        // If localStorage fails, there's nothing more we can do
      }
    }
  }

  private notifyUser(error: Error, level: string): void {
    const isNetworkError = error.message.includes('fetch') ||
                          error.message.includes('network') ||
                          error.message.includes('Failed to fetch');

    const isCritical = level === 'page' || error.message.includes('chunk load failed');

    if (isNetworkError) {
      toast.error('Network Error', {
        description: 'Please check your connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => this.resetError(),
        },
      });
    } else if (isCritical) {
      toast.error('Application Error', {
        description: 'A critical error occurred. The page will be refreshed.',
        duration: 5000,
        action: {
          label: 'Refresh Now',
          onClick: () => window.location.reload(),
        },
      });
    } else {
      toast.error('Something went wrong', {
        description: 'This section encountered an error.',
        action: {
          label: 'Try Again',
          onClick: () => this.resetError(),
        },
      });
    }
  }

  private attemptRecovery(error: Error, errorReport: ErrorReport): void {
    const { retryLimit = 3 } = this.props;

    // Automatic recovery for specific error types
    if (error.message.includes('chunk load failed') ||
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module')) {

      // Network/chunk loading errors - attempt reload after delay
      const timeout = setTimeout(() => {
        console.log('[ErrorBoundary] Attempting automatic recovery for chunk load error');
        window.location.reload();
      }, 2000);

      this.errorTimeouts.add(timeout);
      return;
    }

    // For network errors, attempt automatic retry with exponential backoff
    if (this.isNetworkError(error) && this.state.retryCount < retryLimit) {
      const retryDelay = Math.pow(2, this.state.retryCount) * 1000; // Exponential backoff

      const timeout = setTimeout(() => {
        console.log(`[ErrorBoundary] Automatic retry attempt ${this.state.retryCount + 1}`);
        this.setState(prev => ({ retryCount: prev.retryCount + 1 }));
        this.resetError();
      }, retryDelay);

      this.errorTimeouts.add(timeout);
    }
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('NETWORK_ERROR');
  }

  componentWillUnmount() {
    // Clean up timeouts
    this.errorTimeouts.forEach(timeout => clearTimeout(timeout));
    this.errorTimeouts.clear();
  }

  resetError = (): void => {
    console.log('[ErrorBoundary] Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });

    // Clear any pending recovery timeouts
    this.errorTimeouts.forEach(timeout => clearTimeout(timeout));
    this.errorTimeouts.clear();
  };

  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  forceRefresh = (): void => {
    console.log('[ErrorBoundary] Force refreshing application');
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo!}
            resetError={this.resetError}
          />
        );
      }

      // Enhanced default fallback UI
      const { level = "component", name } = this.props;
      const { error, errorInfo, showDetails, errorId, retryCount } = this.state;

      const isPritical = level === 'page';
      const isRetrying = retryCount > 0;

      return (
        <div className={`
          rounded-lg border p-6 space-y-4
          ${isPritical
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
            : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
          }
        `}>
          {/* Error Header */}
          <div className="flex items-start gap-3">
            <AlertCircle className={`
              h-5 w-5 mt-0.5 flex-shrink-0
              ${isPritical ? 'text-red-600' : 'text-orange-600'}
            `} />
            <div className="flex-1 space-y-2">
              <div>
                <h3 className={`
                  font-semibold
                  ${isPritical ? 'text-red-900 dark:text-red-100' : 'text-orange-900 dark:text-orange-100'}
                `}>
                  {isPritical ? 'Critical Application Error' : 'Component Error'}
                </h3>
                <p className={`
                  text-sm mt-1
                  ${isPritical ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}
                `}>
                  {isPritical
                    ? 'The application encountered a critical error and needs to be refreshed.'
                    : 'This section encountered an error but other parts of the app should still work.'
                  }
                </p>
              </div>

              {/* Error Details */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Error: {error.message}
                </p>

                {errorId && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Error ID: {errorId}
                  </p>
                )}

                {isRetrying && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Automatic retry attempt {retryCount}...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={this.resetError}
                  size="sm"
                  variant="outline"
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>

                {isPritical && (
                  <Button
                    onClick={this.forceRefresh}
                    size="sm"
                    variant="destructive"
                    className="h-8"
                  >
                    Refresh Page
                  </Button>
                )}

                <Button
                  onClick={this.toggleDetails}
                  size="sm"
                  variant="ghost"
                  className="h-8"
                >
                  <Bug className="h-3 w-3 mr-1" />
                  {showDetails ? 'Hide' : 'Show'} Details
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>

              {/* Technical Details */}
              {showDetails && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border text-xs space-y-2">
                  <div>
                    <strong>Boundary:</strong> {name || `${level}-boundary`}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <strong>Timestamp:</strong> {new Date().toISOString()}
                  </div>
                  <div>
                    <strong>URL:</strong> {window.location.href}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundaries in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    // Log error
    console.error('[useErrorHandler] Error caught:', error);

    // You can throw the error to trigger the nearest error boundary
    throw error;
  };
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}