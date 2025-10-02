import { createContext, useContext, ReactNode, useState } from "react";

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
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: "goals", type: "goals", size: "medium", position: 0, visible: true },
    { id: "tasks", type: "tasks", size: "medium", position: 1, visible: true },
    { id: "quick-todos", type: "quick-todos", size: "small", position: 2, visible: true },
    { id: "habits", type: "habits", size: "medium", position: 3, visible: true },
    { id: "reflections", type: "reflections", size: "small", position: 4, visible: true },
  ]);

  const updateWidget = (id: string, config: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, ...config } : widget
    ));
  };

  const toggleWidget = (id: string) => {
    updateWidget(id, { visible: !widgets.find(w => w.id === id)?.visible });
  };

  const reorderWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
  };

  return (
    <WidgetContext.Provider value={{
      widgets,
      updateWidget,
      toggleWidget,
      reorderWidgets
    }}>
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
