/**
 * WidgetGrid Component
 * Location: src/components/widgets/WidgetGrid.tsx
 * Index Reference: CODE_INDEX.md - Widget System > Core Widget Infrastructure
 * Purpose: Main widget container with responsive layout and drag-and-drop functionality
 */
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { DraggableWidget } from "./DraggableWidget";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetGridProps {
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ className }) => {
  const {
    widgets,
    reorderWidgets,
    addWidget,
    removeWidget,
    maxWidgets = 6,
  } = useWidgetLayout();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    reorderWidgets(result.source.index, result.destination.index);
  };

  const canAddMoreWidgets = widgets.length < maxWidgets;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {canAddMoreWidgets && (
          <Button
            onClick={() => addWidget()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widget-grid">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                "min-h-[200px] transition-colors duration-200",
                snapshot.isDraggingOver && "bg-muted/50 rounded-lg p-2",
              )}
            >
              {widgets.map((widget, index) => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  index={index}
                  onRemove={() => removeWidget(widget.id)}
                />
              ))}
              {provided.placeholder}

              {widgets.length === 0 && (
                <Card className="col-span-full p-8 text-center border-dashed">
                  <h3 className="text-lg font-medium mb-2">
                    Welcome to Your Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add widgets to customize your productivity workspace
                  </p>
                  <Button onClick={() => addWidget()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Widget
                  </Button>
                </Card>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {widgets.length >= maxWidgets && (
        <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You've reached the maximum of {maxWidgets} widgets. Remove a widget
            to add a new one.
          </p>
        </Card>
      )}
    </div>
  );
};
