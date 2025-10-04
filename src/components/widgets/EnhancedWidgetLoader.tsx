import { ReactNode, useEffect, useMemo } from "react";
import { BaseWidget, BaseWidgetProps } from "./BaseWidget";
import { WidgetErrorBoundary } from "../errors/WidgetErrorBoundary";
import {
  EnhancedSkeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  ProgressiveSkeleton,
} from "../ui/EnhancedSkeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAdvancedLoading, useWidgetLoading } from "@/hooks/useAdvancedLoading";
import { Clock, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface WidgetLoadingState {
  isLoading: boolean;
  phase: "idle" | "initial" | "loading" | "slow" | "timeout" | "success" | "error";
  progress: number;
  message: string;
  error?: Error;
  duration: number;
}

export interface EnhancedWidgetLoaderProps extends Omit<BaseWidgetProps, "children"> {
  children: ReactNode;
  widgetId: string;
  widgetType: string;
  loadingState?: WidgetLoadingState;
  loadingVariant?: "skeleton" | "spinner" | "progress" | "custom";
  skeletonVariant?: "pulse" | "wave" | "shimmer" | "fade";
  retryable?: boolean;
  onRetry?: () => void;
  onTimeout?: () => void;
  customSkeleton?: ReactNode;
  showProgress?: boolean;
  showLoadingMessage?: boolean;
  errorBoundaryEnabled?: boolean;
  criticalWidget?: boolean;
  estimatedLoadTime?: number; // in milliseconds
}

/**
 * Enhanced Widget Loader with comprehensive loading states, smart skeletons,
 * error boundaries, and accessibility features
 */
export function EnhancedWidgetLoader({
  children,
  widgetId,
  widgetType,
  loadingState,
  loadingVariant = "skeleton",
  skeletonVariant = "shimmer",
  retryable = true,
  onRetry,
  onTimeout,
  customSkeleton,
  showProgress = true,
  showLoadingMessage = false,
  errorBoundaryEnabled = true,
  criticalWidget = false,
  estimatedLoadTime = 3000,
  ...baseWidgetProps
}: EnhancedWidgetLoaderProps) {
  // Use internal loading state if not provided
  const internalLoading = useWidgetLoading(widgetId, {
    slowThreshold: Math.max(estimatedLoadTime, 2000),
    timeoutThreshold: estimatedLoadTime * 3,
    showToastOnSlow: true,
    showToastOnTimeout: true,
    retryable,
  });

  const finalLoadingState = loadingState || internalLoading.state;

  // Handle retry functionality
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      internalLoading.reset();
      toast.info("Retrying widget load...");
    }
  };

  // Handle timeout
  useEffect(() => {
    if (finalLoadingState.phase === "timeout" && onTimeout) {
      onTimeout();
    }
  }, [finalLoadingState.phase, onTimeout]);

  // Generate smart skeleton based on widget type
  const generateSmartSkeleton = useMemo(() => {
    if (customSkeleton) {
      return customSkeleton;
    }

    const commonProps = {
      variant: skeletonVariant,
      accessibleLabel: `Loading ${widgetType} widget`,
    };

    switch (widgetType.toLowerCase()) {
      case "tasks":
      case "todos":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonText lines={1} {...commonProps} />
              <EnhancedSkeleton shape="circle" size="sm" {...commonProps} />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 border rounded">
                <EnhancedSkeleton shape="circle" size="xs" {...commonProps} />
                <div className="flex-1 space-y-1">
                  <SkeletonText lines={1} {...commonProps} />
                  <EnhancedSkeleton width="60%" height="12px" {...commonProps} />
                </div>
              </div>
            ))}
          </div>
        );

      case "analytics":
      case "stats":
        return (
          <div className="space-y-4">
            <SkeletonText lines={1} {...commonProps} />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <EnhancedSkeleton height="32px" {...commonProps} />
                  <EnhancedSkeleton height="16px" width="80%" {...commonProps} />
                </div>
              ))}
            </div>
            <EnhancedSkeleton height="120px" {...commonProps} />
          </div>
        );

      case "profile":
      case "user":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <SkeletonAvatar size="lg" {...commonProps} />
              <div className="flex-1 space-y-2">
                <SkeletonText lines={1} {...commonProps} />
                <EnhancedSkeleton width="60%" height="12px" {...commonProps} />
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonText lines={2} {...commonProps} />
            </div>
            <SkeletonButton {...commonProps} />
          </div>
        );

      case "notes":
      case "journal":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonText lines={1} {...commonProps} />
              <EnhancedSkeleton shape="circle" size="sm" {...commonProps} />
            </div>
            <SkeletonText lines={4} {...commonProps} />
            <div className="flex justify-between items-center">
              <EnhancedSkeleton width="80px" height="16px" {...commonProps} />
              <SkeletonButton size="sm" {...commonProps} />
            </div>
          </div>
        );

      case "habits":
      case "goals":
        return (
          <div className="space-y-4">
            <SkeletonText lines={1} {...commonProps} />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <EnhancedSkeleton shape="circle" size="sm" {...commonProps} />
                  <SkeletonText lines={1} {...commonProps} />
                </div>
                <EnhancedSkeleton width="60px" height="20px" {...commonProps} />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <SkeletonAvatar size="sm" {...commonProps} />
              <SkeletonText lines={1} {...commonProps} />
            </div>
            <SkeletonText lines={3} {...commonProps} />
            <div className="flex justify-between">
              <SkeletonButton size="sm" {...commonProps} />
              <EnhancedSkeleton width="80px" height="20px" {...commonProps} />
            </div>
          </div>
        );
    }
  }, [widgetType, skeletonVariant, customSkeleton]);

  // Progressive skeleton for different loading phases
  const progressiveSkeleton = useMemo(() => {
    const baseProps = { variant: skeletonVariant };

    return (
      <ProgressiveSkeleton
        stages={[
          {
            component: (
              <div className="space-y-3">
                <EnhancedSkeleton height="20px" width="40%" {...baseProps} />
                <EnhancedSkeleton height="12px" width="60%" {...baseProps} />
              </div>
            ),
            duration: 500,
            label: "Initializing widget...",
          },
          {
            component: (
              <div className="space-y-3">
                <EnhancedSkeleton height="20px" width="40%" {...baseProps} />
                <EnhancedSkeleton height="12px" width="60%" {...baseProps} />
                <EnhancedSkeleton height="60px" width="100%" {...baseProps} />
              </div>
            ),
            duration: 1000,
            label: "Loading widget data...",
          },
          {
            component: generateSmartSkeleton,
            duration: Infinity,
            label: "Finalizing widget content...",
          },
        ]}
      />
    );
  }, [generateSmartSkeleton, skeletonVariant]);

  // Render loading content based on variant and state
  const renderLoadingContent = () => {
    if (finalLoadingState.phase === "error") {
      return (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="text-sm">{finalLoadingState.message}</p>
            {retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (finalLoadingState.phase === "timeout") {
      return (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <Clock className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="text-sm">Loading timed out after {Math.round(finalLoadingState.duration / 1000)}s</p>
            {retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    // Show loading content based on variant
    switch (loadingVariant) {
      case "progress":
        return (
          <div className="space-y-4">
            {showLoadingMessage && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{finalLoadingState.message}</span>
                {finalLoadingState.phase === "slow" && (
                  <WifiOff className="h-4 w-4 text-orange-500" />
                )}
              </div>
            )}
            {showProgress && (
              <Progress
                value={finalLoadingState.progress}
                className={cn(
                  "h-2",
                  finalLoadingState.phase === "slow" && "bg-orange-100"
                )}
              />
            )}
            <div className="opacity-50">{generateSmartSkeleton}</div>
          </div>
        );

      case "spinner":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            {showLoadingMessage && (
              <p className="text-sm text-muted-foreground">{finalLoadingState.message}</p>
            )}
            {showProgress && finalLoadingState.progress > 0 && (
              <div className="text-xs text-muted-foreground">
                {finalLoadingState.progress}%
              </div>
            )}
          </div>
        );

      case "custom":
        return customSkeleton || generateSmartSkeleton;

      case "skeleton":
      default:
        return finalLoadingState.phase === "initial" ? progressiveSkeleton : generateSmartSkeleton;
    }
  };

  // If not loading, show content
  if (!finalLoadingState.isLoading && finalLoadingState.phase !== "error" && finalLoadingState.phase !== "timeout") {
    return (
      <BaseWidget
        {...baseWidgetProps}
        isLoading={false}
        data-widget-id={widgetId}
        data-widget-type={widgetType}
      >
        {children}
      </BaseWidget>
    );
  }

  // Show loading state
  const loadingContent = (
    <BaseWidget
      {...baseWidgetProps}
      isLoading={finalLoadingState.isLoading}
      data-widget-id={widgetId}
      data-widget-type={widgetType}
      data-loading-phase={finalLoadingState.phase}
    >
      {renderLoadingContent()}
    </BaseWidget>
  );

  // Wrap with error boundary if enabled
  if (errorBoundaryEnabled) {
    return (
      <WidgetErrorBoundary
        widgetId={widgetId}
        widgetType={widgetType}
        widgetTitle={baseWidgetProps.title || widgetType}
      >
        {loadingContent}
      </WidgetErrorBoundary>
    );
  }

  return loadingContent;
}

// Convenience wrapper for easy migration from existing widgets
export function withEnhancedLoading<P extends object>(
  WidgetComponent: React.ComponentType<P>,
  widgetConfig: {
    widgetType: string;
    estimatedLoadTime?: number;
    criticalWidget?: boolean;
    loadingVariant?: "skeleton" | "spinner" | "progress" | "custom";
  }
) {
  const EnhancedWidget = ({
    widgetId,
    isLoading = false,
    ...props
  }: P & { widgetId: string; isLoading?: boolean }) => {
    if (isLoading) {
      return (
        <EnhancedWidgetLoader
          widgetId={widgetId}
          widgetType={widgetConfig.widgetType}
          estimatedLoadTime={widgetConfig.estimatedLoadTime}
          criticalWidget={widgetConfig.criticalWidget}
          loadingVariant={widgetConfig.loadingVariant}
          loadingState={{
            isLoading: true,
            phase: "loading",
            progress: 50,
            message: "Loading...",
            duration: 0,
          }}
        >
          <WidgetComponent {...(props as P)} />
        </EnhancedWidgetLoader>
      );
    }

    return (
      <EnhancedWidgetLoader
        widgetId={widgetId}
        widgetType={widgetConfig.widgetType}
        estimatedLoadTime={widgetConfig.estimatedLoadTime}
        criticalWidget={widgetConfig.criticalWidget}
        loadingVariant={widgetConfig.loadingVariant}
      >
        <WidgetComponent {...(props as P)} />
      </EnhancedWidgetLoader>
    );
  };

  EnhancedWidget.displayName = `Enhanced${WidgetComponent.displayName || WidgetComponent.name}`;
  return EnhancedWidget;
}