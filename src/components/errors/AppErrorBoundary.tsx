import { Component, ErrorInfo, ReactNode } from "react";
import { getSupabaseStatus } from "@/integrations/supabase/client";
import { getEnvironmentInfo } from "@/utils/environment/validation";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Comprehensive error boundary for application initialization failures
 * Provides detailed debugging information and recovery options
 */
export class AppErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary] Caught application error:", error);
    console.error("[AppErrorBoundary] Error info:", errorInfo);

    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log detailed error information
    this.logDetailedError(error, errorInfo);
  }

  private logDetailedError = (error: Error, errorInfo: ErrorInfo) => {
    console.group("[AppErrorBoundary] Detailed Error Report");

    // Basic error info
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);

    // Environment info
    const envInfo = getEnvironmentInfo();
    console.log("Environment:", envInfo);

    // Supabase status
    const supabaseStatus = getSupabaseStatus();
    console.log("Supabase Status:", supabaseStatus);

    // Browser info
    console.log("Browser Info:", {
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      onLine: navigator.onLine,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // localStorage availability
    try {
      const testKey = "__error_boundary_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      console.log("localStorage: Available");
    } catch (storageError) {
      console.error("localStorage: Not available", storageError);
    }

    // Performance info
    if (typeof performance !== "undefined" && performance.now) {
      console.log("Performance:", {
        now: performance.now(),
        navigation: performance.getEntriesByType?.("navigation")[0],
      });
    }

    console.groupEnd();
  };

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount <= this.maxRetries) {
      console.log(
        `[AppErrorBoundary] Retry attempt ${newRetryCount}/${this.maxRetries}`,
      );
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: newRetryCount,
      });
    } else {
      console.error("[AppErrorBoundary] Max retries reached, giving up");
    }
  };

  private handleReload = () => {
    console.log("[AppErrorBoundary] Reloading page...");
    window.location.reload();
  };

  private renderErrorUI = (): ReactNode => {
    const { error, errorInfo, retryCount } = this.state;

    if (!error) return null;

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback(error, errorInfo!);
    }

    // Default error UI with debugging info
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "800px",
          margin: "2rem auto",
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: "1.6",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#991b1b",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#dc2626" }}>Application Error</h1>

        <p>
          The application encountered an unexpected error and couldn't continue.
          This might be due to a temporary issue or a configuration problem.
        </p>

        <div
          style={{
            background: "#fff",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            color: "#374151",
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          {retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Try Again ({this.maxRetries - retryCount} attempts left)
            </button>
          )}

          <button
            onClick={this.handleReload}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#374151",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Reload Page
          </button>
        </div>

        <details style={{ marginTop: "1rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
            Technical Details
          </summary>
          <div
            style={{
              background: "#fff",
              padding: "1rem",
              borderRadius: "4px",
              marginTop: "0.5rem",
              fontSize: "12px",
              color: "#374151",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <strong>Error Stack:</strong>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "0.5rem 0",
                  background: "#f9fafb",
                  padding: "0.5rem",
                  borderRadius: "2px",
                  overflow: "auto",
                }}
              >
                {error.stack}
              </pre>
            </div>

            {errorInfo && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Component Stack:</strong>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: "0.5rem 0",
                    background: "#f9fafb",
                    padding: "0.5rem",
                    borderRadius: "2px",
                    overflow: "auto",
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div>
              <strong>Troubleshooting Steps:</strong>
              <ol style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try refreshing the page</li>
                <li>Try opening the app in an incognito/private window</li>
                <li>Check if the issue persists in a different browser</li>
                <li>Contact support if the problem continues</li>
              </ol>
            </div>

            <div
              style={{ marginTop: "1rem", fontSize: "11px", color: "#6b7280" }}
            >
              <strong>Error ID:</strong> {Date.now().toString(36)}
              <br />
              <strong>Timestamp:</strong> {new Date().toISOString()}
              <br />
              <strong>Browser:</strong> {navigator.userAgent}
            </div>
          </div>
        </details>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <AppErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AppErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
