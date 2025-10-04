import { ReactNode, useCallback, useMemo } from "react";
import { BaseWidget, BaseWidgetProps } from "./BaseWidget";
import { WidgetErrorBoundary, WidgetErrorSeverity, WidgetRecoveryStrategy } from "../errors/WidgetErrorBoundary";
import { useWidget } from "@/contexts/WidgetContext";
import { toast } from "sonner";

interface EnhancedBaseWidgetProps extends BaseWidgetProps {
  widgetId: string;
  widgetType: string;
  errorBoundaryEnabled?: boolean;
  maxRetries?: number;
  recoveryStrategies?: WidgetRecoveryStrategy[];
  onWidgetError?: (error: Error, severity: WidgetErrorSeverity) => void;
  criticalWidget?: boolean; // If true, widget errors are escalated to section level
}

/**
 * Enhanced BaseWidget with integrated error boundary and advanced error handling
 * Provides seamless error isolation while maintaining widget functionality
 */
export function EnhancedBaseWidget({
  children,
  widgetId,
  widgetType,
  title,
  errorBoundaryEnabled = true,
  maxRetries = 3,
  recoveryStrategies = ["retry", "disable", "remove"],
  onWidgetError,
  criticalWidget = false,
  ...baseWidgetProps
}: EnhancedBaseWidgetProps) {
  const { removeWidget, disableWidget } = useWidget();

  // Memoize error handling callbacks to prevent unnecessary re-renders
  const handleWidgetError = useCallback(
    (widgetError: any) => {
      console.warn(`[EnhancedBaseWidget] Error in widget ${widgetId}:`, widgetError);

      // Call custom error handler if provided
      onWidgetError?.(widgetError.error, widgetError.severity);

      // If this is a critical widget and has high/critical severity, escalate
      if (criticalWidget && (widgetError.severity === "high" || widgetError.severity === "critical")) {
        console.error(`[EnhancedBaseWidget] Critical widget ${widgetId} failed, escalating...`);

        // You could emit an event here to trigger section-level error handling
        window.dispatchEvent(new CustomEvent("widget:critical-error", {
          detail: { widgetId, widgetType, error: widgetError }
        }));
      }
    },
    [widgetId, widgetType, onWidgetError, criticalWidget]
  );

  const handleWidgetRemove = useCallback(
    (id: string) => {
      try {
        removeWidget(id);
        toast.success(`${title || widgetType} widget removed from dashboard`);
      } catch (error) {
        console.error("Failed to remove widget:", error);
        toast.error("Failed to remove widget");
      }
    },
    [removeWidget, title, widgetType]
  );

  const handleWidgetDisable = useCallback(
    (id: string) => {
      try {
        disableWidget(id);
        toast.warning(`${title || widgetType} widget temporarily disabled`);
      } catch (error) {
        console.error("Failed to disable widget:", error);
        toast.error("Failed to disable widget");
      }
    },
    [disableWidget, title, widgetType]
  );

  // Enhanced widget props with error context
  const enhancedProps = useMemo(
    () => ({
      ...baseWidgetProps,
      title,
      "data-widget-id": widgetId,
      "data-widget-type": widgetType,
      "data-widget-critical": criticalWidget,
    }),
    [baseWidgetProps, title, widgetId, widgetType, criticalWidget]
  );

  // If error boundary is disabled, render widget directly
  if (!errorBoundaryEnabled) {
    return (
      <BaseWidget {...enhancedProps}>
        {children}
      </BaseWidget>
    );
  }

  // Render widget with error boundary protection
  return (
    <WidgetErrorBoundary
      widgetId={widgetId}
      widgetType={widgetType}
      widgetTitle={title || widgetType}
      onWidgetError={handleWidgetError}
      onWidgetRemove={handleWidgetRemove}
      onWidgetDisable={handleWidgetDisable}
      maxRetries={maxRetries}
      recoveryStrategies={recoveryStrategies}
    >
      <BaseWidget {...enhancedProps}>
        {children}
      </BaseWidget>
    </WidgetErrorBoundary>
  );
}

// Utility function to create widgets with enhanced error handling
export function createEnhancedWidget<P extends object>(
  WidgetComponent: React.ComponentType<P>,
  widgetConfig: {
    widgetType: string;
    defaultTitle?: string;
    criticalWidget?: boolean;
    maxRetries?: number;
    recoveryStrategies?: WidgetRecoveryStrategy[];
  }
) {
  const EnhancedWidget = ({ widgetId, title, ...props }: P & { widgetId: string; title?: string }) => (
    <EnhancedBaseWidget
      widgetId={widgetId}
      widgetType={widgetConfig.widgetType}
      title={title || widgetConfig.defaultTitle}
      criticalWidget={widgetConfig.criticalWidget}
      maxRetries={widgetConfig.maxRetries}
      recoveryStrategies={widgetConfig.recoveryStrategies}
    >
      <WidgetComponent {...(props as P)} />
    </EnhancedBaseWidget>
  );

  EnhancedWidget.displayName = `Enhanced${WidgetComponent.displayName || WidgetComponent.name}`;
  return EnhancedWidget;
}

// Hook for widget-level error reporting
export function useWidgetErrorReporting(widgetId: string, widgetType: string) {
  const reportError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      console.error(`[Widget:${widgetType}:${widgetId}] Error:`, error);

      // Create error event for centralized handling
      window.dispatchEvent(new CustomEvent("widget:error", {
        detail: {
          widgetId,
          widgetType,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        },
      }));
    },
    [widgetId, widgetType]
  );

  const reportWarning = useCallback(
    (message: string, context?: Record<string, any>) => {
      console.warn(`[Widget:${widgetType}:${widgetId}] Warning:`, message);

      window.dispatchEvent(new CustomEvent("widget:warning", {
        detail: {
          widgetId,
          widgetType,
          message,
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        },
      }));
    },
    [widgetId, widgetType]
  );

  return { reportError, reportWarning };
}