import { Component, ErrorInfo, ReactNode, ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type WidgetErrorSeverity = "low" | "medium" | "high" | "critical";
export type WidgetRecoveryStrategy = "retry" | "fallback" | "remove" | "disable";

export interface WidgetError {
  error: Error;
  errorInfo: ErrorInfo;
  widgetId: string;
  widgetType: string;
  severity: WidgetErrorSeverity;
  timestamp: string;
  userContext?: Record<string, any>;
}

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
  onWidgetError?: (widgetError: WidgetError) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetDisable?: (widgetId: string) => void;
  fallbackComponent?: ComponentType<WidgetErrorFallbackProps>;
  recoveryStrategies?: WidgetRecoveryStrategy[];
  maxRetries?: number;
  className?: string;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  severity: WidgetErrorSeverity;
  isMinimized: boolean;
  recoveryAttempts: Record<WidgetRecoveryStrategy, number>;
}

export interface WidgetErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
  retryCount: number;
  maxRetries: number;
  severity: WidgetErrorSeverity;
  onRetry: () => void;
  onRemove: () => void;
  onDisable: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

/**
 * Granular error boundary for individual widgets with advanced recovery strategies
 * Provides isolated error handling that doesn't affect other widgets or app functionality
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  private errorReportingTimeout: NodeJS.Timeout | null = null;

  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      severity: "low",
      isMinimized: false,
      recoveryAttempts: {
        retry: 0,
        fallback: 0,
        remove: 0,
        disable: 0,
      },
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return {
      hasError: true,
      error,
      severity: WidgetErrorBoundary.determineSeverity(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { widgetId, widgetType, onWidgetError } = this.props;

    // Enhanced error logging with widget context
    console.group(`[WidgetErrorBoundary] Widget Error - ${widgetType}:${widgetId}`);
    console.error("Error:", error.message);
    console.error("Widget ID:", widgetId);
    console.error("Widget Type:", widgetType);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Retry Count:", this.state.retryCount);
    console.groupEnd();

    this.setState({ errorInfo });

    // Create comprehensive error report
    const widgetError: WidgetError = {
      error,
      errorInfo,
      widgetId,
      widgetType,
      severity: this.state.severity,
      timestamp: new Date().toISOString(),
      userContext: this.gatherUserContext(),
    };

    // Report error with debouncing to prevent spam
    this.scheduleErrorReporting(widgetError);

    // Call custom error handler
    onWidgetError?.(widgetError);

    // Show user notification based on severity
    this.showErrorNotification(error, this.state.severity);
  }

  private static determineSeverity(error: Error): WidgetErrorSeverity {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || "";

    // Critical errors that could affect data integrity
    if (
      message.includes("network") ||
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      stack.includes("supabase")
    ) {
      return "critical";
    }

    // High severity for core functionality failures
    if (
      message.includes("failed to fetch") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      stack.includes("async")
    ) {
      return "high";
    }

    // Medium severity for UI/UX disruptions
    if (
      message.includes("render") ||
      message.includes("props") ||
      message.includes("undefined")
    ) {
      return "medium";
    }

    // Low severity for minor issues
    return "low";
  }

  private gatherUserContext(): Record<string, any> {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
      } : null,
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null,
    };
  }

  private scheduleErrorReporting(widgetError: WidgetError) {
    if (this.errorReportingTimeout) {
      clearTimeout(this.errorReportingTimeout);
    }

    this.errorReportingTimeout = setTimeout(() => {
      this.reportWidgetError(widgetError);
    }, 1000); // Debounce by 1 second
  }

  private async reportWidgetError(widgetError: WidgetError) {
    try {
      // In production, send to error tracking service
      if (process.env.NODE_ENV === "production") {
        await fetch("/api/errors/widget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(widgetError),
        });
      }
    } catch (reportError) {
      console.error("Failed to report widget error:", reportError);
    }
  }

  private showErrorNotification(error: Error, severity: WidgetErrorSeverity) {
    const { widgetTitle } = this.props;

    switch (severity) {
      case "critical":
        toast.error(`Critical error in ${widgetTitle}`, {
          description: "This widget will be temporarily disabled.",
          duration: 5000,
        });
        break;
      case "high":
        toast.error(`Error in ${widgetTitle}`, {
          description: "Attempting automatic recovery...",
          duration: 3000,
        });
        break;
      case "medium":
        toast.warning(`Issue with ${widgetTitle}`, {
          description: "Widget functionality may be limited.",
          duration: 2000,
        });
        break;
      case "low":
        // Silent for low severity, just log
        break;
    }
  }

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;

    if (this.state.retryCount < maxRetries) {
      console.log(
        `[WidgetErrorBoundary] Retry attempt ${this.state.retryCount + 1}/${maxRetries} for widget ${this.props.widgetId}`
      );

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        recoveryAttempts: {
          ...prevState.recoveryAttempts,
          retry: prevState.recoveryAttempts.retry + 1,
        },
      }));

      toast.success("Retrying widget...", { duration: 1000 });
    } else {
      toast.error("Maximum retries reached", {
        description: "Please try removing and re-adding the widget.",
      });
    }
  };

  private handleRemove = () => {
    const { onWidgetRemove, widgetId } = this.props;

    this.setState(prevState => ({
      recoveryAttempts: {
        ...prevState.recoveryAttempts,
        remove: prevState.recoveryAttempts.remove + 1,
      },
    }));

    onWidgetRemove?.(widgetId);
    toast.info("Widget removed from dashboard");
  };

  private handleDisable = () => {
    const { onWidgetDisable, widgetId } = this.props;

    this.setState(prevState => ({
      recoveryAttempts: {
        ...prevState.recoveryAttempts,
        disable: prevState.recoveryAttempts.disable + 1,
      },
    }));

    onWidgetDisable?.(widgetId);
    toast.info("Widget temporarily disabled");
  };

  private handleMinimize = () => {
    this.setState(prevState => ({
      isMinimized: !prevState.isMinimized,
    }));
  };

  private renderErrorFallback(): ReactNode {
    const {
      fallbackComponent: FallbackComponent,
      widgetId,
      widgetType,
      widgetTitle,
      maxRetries = 3,
    } = this.props;

    const {
      error,
      errorInfo,
      retryCount,
      severity,
      isMinimized
    } = this.state;

    if (!error) return null;

    // Use custom fallback component if provided
    if (FallbackComponent) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          widgetId={widgetId}
          widgetType={widgetType}
          widgetTitle={widgetTitle}
          retryCount={retryCount}
          maxRetries={maxRetries}
          severity={severity}
          onRetry={this.handleRetry}
          onRemove={this.handleRemove}
          onDisable={this.handleDisable}
          onMinimize={this.handleMinimize}
          isMinimized={isMinimized}
        />
      );
    }

    // Default error fallback UI
    return (
      <Card className={cn(
        "widget-error-boundary",
        "border-destructive/50 bg-destructive/5",
        isMinimized && "h-16"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">
                {widgetTitle} Error
              </span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                severity === "critical" && "bg-red-100 text-red-800",
                severity === "high" && "bg-orange-100 text-orange-800",
                severity === "medium" && "bg-yellow-100 text-yellow-800",
                severity === "low" && "bg-blue-100 text-blue-800"
              )}>
                {severity}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleMinimize}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          </div>

          {!isMinimized && (
            <>
              <Alert className="mt-3 mb-3">
                <AlertDescription className="text-xs">
                  {error.message}
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-2">
                {retryCount < maxRetries && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleRetry}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry ({maxRetries - retryCount} left)
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleDisable}
                  className="h-8 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Disable
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={this.handleRemove}
                  className="h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// Higher-order component for easier widget error boundary usage
export function withWidgetErrorBoundary<P extends object>(
  WidgetComponent: React.ComponentType<P>,
  boundaryProps: Omit<WidgetErrorBoundaryProps, "children">
) {
  const WrappedWidget = (props: P) => (
    <WidgetErrorBoundary {...boundaryProps}>
      <WidgetComponent {...props} />
    </WidgetErrorBoundary>
  );

  WrappedWidget.displayName = `withWidgetErrorBoundary(${
    WidgetComponent.displayName || WidgetComponent.name
  })`;

  return WrappedWidget;
}