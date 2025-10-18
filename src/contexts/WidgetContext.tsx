import React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface WidgetConfig {
  id: string;
  type: string;
  size: "small" | "medium" | "large";
  position: number;
  visible: boolean;
}

interface WidgetContextType {
  widgets: WidgetConfig[];
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
  toggleWidget: (id: string) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
  resetLayout: () => void;
  undoLayout: () => void;
  redoLayout: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const defaultWidgets: WidgetConfig[] = [
  { id: "goals", type: "goals", size: "medium", position: 0, visible: true },
  { id: "tasks", type: "tasks", size: "medium", position: 1, visible: true },
  {
    id: "gamification",
    type: "gamification",
    size: "medium",
    position: 2,
    visible: true,
  },
  {
    id: "quick-todos",
    type: "quick-todos",
    size: "small",
    position: 3,
    visible: true,
  },
  {
    id: "productivity-profile",
    type: "productivity-profile",
    size: "medium",
    position: 4,
    visible: true,
  },
  { id: "notes", type: "notes", size: "medium", position: 5, visible: true },
  { id: "habits", type: "habits", size: "medium", position: 6, visible: true },
  {
    id: "reflections",
    type: "reflections",
    size: "small",
    position: 7,
    visible: true,
  },
];

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [layoutHistory, setLayoutHistory] = useState<WidgetConfig[][]>([]);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(-1);

  // Load saved layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("widget-layout");
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setWidgets(parsed);
        setLayoutHistory([parsed]);
        setCurrentLayoutIndex(0);
      } catch (error) {
        console.error("Failed to load saved layout:", error);
      }
    } else {
      setLayoutHistory([defaultWidgets]);
      setCurrentLayoutIndex(0);
    }
  }, []);

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem("widget-layout", JSON.stringify(widgets));
    }
  }, [widgets]);

  const saveLayoutState = (newWidgets: WidgetConfig[]) => {
    const newHistory = layoutHistory.slice(0, currentLayoutIndex + 1);
    newHistory.push([...newWidgets]);
    setLayoutHistory(newHistory);
    setCurrentLayoutIndex(newHistory.length - 1);
  };

  const updateWidget = (id: string, config: Partial<WidgetConfig>) => {
    const newWidgets = widgets.map((widget) =>
      widget.id === id ? { ...widget, ...config } : widget,
    );
    setWidgets(newWidgets);
    saveLayoutState(newWidgets);
  };

  const toggleWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (widget) {
      updateWidget(id, { visible: !widget.visible });
    }
  };

  const reorderWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    saveLayoutState(newWidgets);
  };

  const resetLayout = () => {
    setWidgets(defaultWidgets);
    saveLayoutState(defaultWidgets);
  };

  const undoLayout = () => {
    if (currentLayoutIndex > 0) {
      setCurrentLayoutIndex(currentLayoutIndex - 1);
      setWidgets([...layoutHistory[currentLayoutIndex - 1]]);
    }
  };

  const redoLayout = () => {
    if (currentLayoutIndex < layoutHistory.length - 1) {
      setCurrentLayoutIndex(currentLayoutIndex + 1);
      setWidgets([...layoutHistory[currentLayoutIndex + 1]]);
    }
  };

  const canUndo = currentLayoutIndex > 0;
  const canRedo = currentLayoutIndex < layoutHistory.length - 1;

  return (
    <WidgetContext.Provider
      value={{
        widgets,
        updateWidget,
        toggleWidget,
        reorderWidgets,
        resetLayout,
        undoLayout,
        redoLayout,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgets must be used within WidgetProvider");
  }
  return context;
}
