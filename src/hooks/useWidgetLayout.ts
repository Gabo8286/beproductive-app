import React, { useState, useEffect, useCallback } from "react";

interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  config?: Record<string, any>;
  position: number;
}

interface WidgetLayout {
  widgets: Widget[];
  reorderWidgets: (sourceIndex: number, destinationIndex: number) => void;
  addWidget: (widgetType?: string) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, config: Record<string, any>) => void;
  maxWidgets: number;
}

// Available widget types
const WIDGET_TYPES = {
  tasks: {
    title: "Tasks",
    component: React.lazy(() => import("@/components/widgets/TasksWidget")),
  },
  goals: {
    title: "Goals",
    component: React.lazy(() => import("@/components/widgets/GoalsWidget")),
  },
  "time-tracking": {
    title: "Time Tracking",
    component: React.lazy(() => import("@/components/widgets/TimeTrackingWidget")),
  },
  notes: {
    title: "Notes",
    component: React.lazy(() => import("@/components/widgets/NotesWidget")),
  },
  analytics: {
    title: "Analytics",
    component: React.lazy(() => import("@/components/widgets/JourneyProgressWidget")),
  },
  "ai-insights": {
    title: "AI Insights",
    component: React.lazy(
      () => import("@/components/widgets/SmartRecommendationsWidget"),
    ),
  },
};

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: "default-tasks",
    type: "tasks",
    title: "Tasks",
    component: WIDGET_TYPES.tasks.component,
    position: 0,
  },
  {
    id: "default-goals",
    type: "goals",
    title: "Goals",
    component: WIDGET_TYPES.goals.component,
    position: 1,
  },
  {
    id: "default-ai-insights",
    type: "ai-insights",
    title: "AI Insights",
    component: WIDGET_TYPES["ai-insights"].component,
    position: 2,
  },
];

export const useWidgetLayout = (): WidgetLayout => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const maxWidgets = 6;

  // Load layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("widget-layout");
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        // Restore component references
        const widgetsWithComponents = parsedLayout.map((widget: any) => ({
          ...widget,
          component:
            WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES]?.component,
        }));
        setWidgets(widgetsWithComponents);
      } catch (error) {
        console.error("Failed to load widget layout:", error);
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, []);

  // Save layout to localStorage whenever widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      const serializableWidgets = widgets.map(
        ({ component, ...widget }) => widget,
      );
      localStorage.setItem(
        "widget-layout",
        JSON.stringify(serializableWidgets),
      );
    }
  }, [widgets]);

  const reorderWidgets = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setWidgets((current) => {
        const result = Array.from(current);
        const [removed] = result.splice(sourceIndex, 1);
        result.splice(destinationIndex, 0, removed);

        // Update positions
        return result.map((widget, index) => ({
          ...widget,
          position: index,
        }));
      });
    },
    [],
  );

  const addWidget = useCallback(
    (widgetType?: string) => {
      if (widgets.length >= maxWidgets) {
        alert(`Maximum of ${maxWidgets} widgets allowed`);
        return;
      }

      // If no type specified, open widget selector
      if (!widgetType) {
        // This would trigger the widget selector modal
        // For now, just add a tasks widget as default
        widgetType = "tasks";
      }

      const widgetConfig =
        WIDGET_TYPES[widgetType as keyof typeof WIDGET_TYPES];
      if (!widgetConfig) {
        console.error(`Unknown widget type: ${widgetType}`);
        return;
      }

      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type: widgetType,
        title: widgetConfig.title,
        component: widgetConfig.component,
        position: widgets.length,
      };

      setWidgets((current) => [...current, newWidget]);
    },
    [widgets.length, maxWidgets],
  );

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((current) =>
      current
        .filter((widget) => widget.id !== widgetId)
        .map((widget, index) => ({
          ...widget,
          position: index,
        })),
    );
  }, []);

  const updateWidget = useCallback(
    (widgetId: string, config: Record<string, any>) => {
      setWidgets((current) =>
        current.map((widget) =>
          widget.id === widgetId
            ? { ...widget, config: { ...widget.config, ...config } }
            : widget,
        ),
      );
    },
    [],
  );

  return {
    widgets,
    reorderWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    maxWidgets,
  };
};

// Hook for widget-specific functionality
export const useWidget = (widgetId: string) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expandWidget = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapseWidget = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const refreshWidget = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Trigger widget data refresh
      // This would typically involve refetching data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh widget");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isExpanded,
    isLoading,
    error,
    expandWidget,
    collapseWidget,
    refreshWidget,
  };
};
