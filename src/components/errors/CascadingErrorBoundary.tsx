import { Component, ErrorInfo, ReactNode } from "react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Shield,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ErrorLevel = "widget" | "section" | "page" | "app";
export type ErrorEscalationStrategy = "retry" | "fallback" | "redirect" | "reload";

interface CascadingErrorContext {
  level: ErrorLevel;
  componentName: string;
  errorCount: number;
  lastErrorTime: number;
  escalationHistory: ErrorLevel[];
}

interface CascadingErrorBoundaryProps {
  children: ReactNode;
  level: ErrorLevel;
  componentName: string;
  fallbackComponent?: React.ComponentType<CascadingErrorFallbackProps>;
  escalationStrategies?: ErrorEscalationStrategy[];
  maxRetries?: number;
  escalationThreshold?: number; // Time in ms before escalating to next level
  onErrorEscalation?: (context: CascadingErrorContext) => void;
  redirectPath?: string; // Path to redirect on error
  className?: string;
}

interface CascadingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorContext: CascadingErrorContext;
  shouldEscalate: boolean;
  retryCount: number;
}

export interface CascadingErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorContext: CascadingErrorContext;
  onRetry: () => void;
  onEscalate: () => void;
  onRedirect: () => void;
  onReload: () => void;
  retryCount: number;
  maxRetries: number;
}

/**
 * Cascading Error Boundary System
 * Provides multi-level error handling with automatic escalation
 * Widget → Section → Page → App level error management
 */
export class CascadingErrorBoundary extends Component<
  CascadingErrorBoundaryProps,
  CascadingErrorBoundaryState
> {
  private escalationTimer: NodeJS.Timeout | null = null;
  private errorBuffer: Error[] = [];

  constructor(props: CascadingErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: {
        level: props.level,
        componentName: props.componentName,
        errorCount: 0,
        lastErrorTime: 0,
        escalationHistory: [],
      },
      shouldEscalate: false,
      retryCount: 0,
    };

    // Listen for widget critical errors if this is a section-level boundary
    if (props.level === "section") {
      this.setupWidgetErrorListener();
    }
  }

  componentWillUnmount() {
    if (this.escalationTimer) {
      clearTimeout(this.escalationTimer);
    }

    // Clean up event listeners
    window.removeEventListener("widget:critical-error", this.handleWidgetCriticalError);
  }

  private setupWidgetErrorListener() {
    window.addEventListener("widget:critical-error", this.handleWidgetCriticalError);
  }

  private handleWidgetCriticalError = (event: CustomEvent) => {
    const { widgetId, widgetType, error } = event.detail;

    console.warn(
      `[CascadingErrorBoundary:${this.props.level}] Handling critical widget error from ${widgetType}:${widgetId}`
    );

    // Add to error buffer for pattern analysis
    this.errorBuffer.push(error.error);

    // Check if we should escalate based on error frequency
    if (this.shouldEscalateBasedOnFrequency()) {
      this.escalateError(error.error, null);
    }
  };

  private shouldEscalateBasedOnFrequency(): boolean {
    const { escalationThreshold = 5000 } = this.props; // 5 seconds default
    const now = Date.now();

    // Remove old errors (older than threshold)
    this.errorBuffer = this.errorBuffer.filter(
      (_, index) => now - this.state.errorContext.lastErrorTime < escalationThreshold
    );

    // Escalate if we have multiple errors in a short time
    return this.errorBuffer.length >= 3;
  }

  static getDerivedStateFromError(error: Error): Partial<CascadingErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level, componentName, onErrorEscalation, escalationThreshold = 10000 } = this.props;
    const now = Date.now();

    console.group(`[CascadingErrorBoundary:${level}] Error in ${componentName}`);
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();

    // Update error context
    const newErrorContext: CascadingErrorContext = {
      ...this.state.errorContext,
      errorCount: this.state.errorContext.errorCount + 1,
      lastErrorTime: now,
    };

    this.setState({
      errorInfo,
      errorContext: newErrorContext,
    });

    // Schedule escalation if configured
    if (escalationThreshold > 0) {
      this.escalationTimer = setTimeout(() => {
        this.escalateError(error, errorInfo);
      }, escalationThreshold);
    }

    // Call escalation handler
    onErrorEscalation?.(newErrorContext);

    // Show user notification based on level
    this.showLevelAppropriateNotification(error, level);
  }

  private escalateError(error: Error, errorInfo: ErrorInfo | null) {
    const { level } = this.props;
    const nextLevel = this.getNextEscalationLevel(level);

    if (!nextLevel) {
      console.error("[CascadingErrorBoundary] Cannot escalate beyond app level");
      return;
    }

    console.warn(
      `[CascadingErrorBoundary] Escalating error from ${level} to ${nextLevel}`
    );

    this.setState(prevState => ({
      shouldEscalate: true,
      errorContext: {
        ...prevState.errorContext,
        escalationHistory: [...prevState.errorContext.escalationHistory, level],
      },
    }));

    // Emit escalation event for parent boundaries to catch
    window.dispatchEvent(new CustomEvent("error:escalate", {
      detail: {
        originalLevel: level,
        nextLevel,
        error,
        errorInfo,
        context: this.state.errorContext,
      },
    }));

    toast.error(`Error escalated to ${nextLevel} level`, {
      description: "Attempting higher-level recovery...",
    });
  }

  private getNextEscalationLevel(currentLevel: ErrorLevel): ErrorLevel | null {
    const escalationOrder: ErrorLevel[] = ["widget", "section", "page", "app"];
    const currentIndex = escalationOrder.indexOf(currentLevel);

    if (currentIndex === -1 || currentIndex === escalationOrder.length - 1) {
      return null; // Already at highest level or invalid level
    }

    return escalationOrder[currentIndex + 1];
  }

  private showLevelAppropriateNotification(error: Error, level: ErrorLevel) {
    switch (level) {
      case "section":
        toast.warning("Section temporarily unavailable", {
          description: "Some features may be limited.",
          duration: 3000,
        });
        break;
      case "page":
        toast.error("Page error occurred", {
          description: "Attempting to recover...",
          duration: 4000,
        });
        break;
      case "app":
        toast.error("Application error", {
          description: "Please try refreshing the page.",
          duration: 5000,
        });
        break;
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount < maxRetries) {
      console.log(
        `[CascadingErrorBoundary:${this.props.level}] Retry attempt ${this.state.retryCount + 1}/${maxRetries}`
      );

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        shouldEscalate: false,
        retryCount: prevState.retryCount + 1,
        errorContext: {
          ...prevState.errorContext,
          errorCount: 0, // Reset error count on manual retry
        },
      }));

      // Clear escalation timer
      if (this.escalationTimer) {
        clearTimeout(this.escalationTimer);
      }

      toast.success("Retrying...", { duration: 1000 });
    } else {
      this.escalateError(this.state.error!, this.state.errorInfo);
    }
  };

  private handleEscalate = () => {
    this.escalateError(this.state.error!, this.state.errorInfo);
  };

  private handleRedirect = () => {
    const { redirectPath = "/" } = this.props;

    console.log(`[CascadingErrorBoundary] Redirecting to ${redirectPath}`);
    toast.info("Redirecting to safe page...");

    // Use router navigation if available, otherwise window.location
    if (window.history && window.history.pushState) {
      window.history.pushState({}, "", redirectPath);
      window.location.reload();
    } else {
      window.location.href = redirectPath;
    }
  };

  private handleReload = () => {
    console.log("[CascadingErrorBoundary] Reloading page...");
    toast.info("Reloading page...");
    window.location.reload();
  };

  private renderErrorFallback(): ReactNode {
    const {
      fallbackComponent: FallbackComponent,
      level,
      componentName,
      maxRetries = 3,
    } = this.props;

    const {
      error,
      errorInfo,
      errorContext,
      retryCount
    } = this.state;

    if (!error) return null;

    // Use custom fallback if provided
    if (FallbackComponent) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          errorContext={errorContext}
          onRetry={this.handleRetry}
          onEscalate={this.handleEscalate}
          onRedirect={this.handleRedirect}
          onReload={this.handleReload}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    // Default fallback UI based on level
    return this.renderDefaultFallback();
  }

  private renderDefaultFallback(): ReactNode {
    const { level, componentName, maxRetries = 3 } = this.props;
    const { error, retryCount, errorContext } = this.state;

    if (!error) return null;

    const levelConfig = {
      section: {
        icon: Shield,
        title: "Section Unavailable",
        description: "This section is temporarily unavailable due to an error.",
        bgColor: "bg-orange-50 border-orange-200",
        textColor: "text-orange-800",
      },
      page: {
        icon: TrendingDown,
        title: "Page Error",
        description: "This page encountered an error and couldn't load properly.",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
      },
      app: {
        icon: AlertTriangle,
        title: "Application Error",
        description: "The application encountered a critical error.",
        bgColor: "bg-red-100 border-red-300",
        textColor: "text-red-900",
      },
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.section;
    const Icon = config.icon;

    return (
      <Card className={cn("p-6 max-w-md mx-auto", config.bgColor)}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Icon className={cn("h-12 w-12", config.textColor)} />
          </div>

          <div>
            <h3 className={cn("font-semibold text-lg", config.textColor)}>
              {config.title}
            </h3>
            <p className={cn("text-sm mt-1", config.textColor)}>
              {config.description}
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm">Error Details</AlertTitle>
            <AlertDescription className="text-xs">
              <strong>Component:</strong> {componentName}<br />
              <strong>Level:</strong> {level}<br />
              <strong>Error:</strong> {error.message}<br />
              <strong>Count:</strong> {errorContext.errorCount}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            {retryCount < maxRetries && (
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry ({maxRetries - retryCount} attempts left)
              </Button>
            )}

            {level !== "app" && (
              <Button
                onClick={this.handleEscalate}
                className="w-full"
                variant="secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Escalate Error
              </Button>
            )}

            <Button
              onClick={this.handleRedirect}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>

            <Button
              onClick={this.handleReload}
              className="w-full"
              variant="destructive"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  render() {
    if (this.state.hasError || this.state.shouldEscalate) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// Convenience wrapper components for different levels
export const SectionErrorBoundary: React.FC<{
  children: ReactNode;
  sectionName: string;
  className?: string;
}> = ({ children, sectionName, className }) => (
  <CascadingErrorBoundary
    level="section"
    componentName={sectionName}
    className={className}
    escalationThreshold={8000}
  >
    {children}
  </CascadingErrorBoundary>
);

export const PageErrorBoundary: React.FC<{
  children: ReactNode;
  pageName: string;
  className?: string;
}> = ({ children, pageName, className }) => (
  <CascadingErrorBoundary
    level="page"
    componentName={pageName}
    className={className}
    escalationThreshold={15000}
    redirectPath="/"
  >
    {children}
  </CascadingErrorBoundary>
);