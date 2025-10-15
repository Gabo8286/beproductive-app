/**
 * WidgetGrid Component
 * Location: src/components/widgets/WidgetGrid.tsx
 * Index Reference: CODE_INDEX.md - Widget System > Core Widget Infrastructure
 * Purpose: Main widget container with responsive layout and drag-and-drop functionality
 */
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableWidget } from "./DraggableWidget";
import { WidgetSelector } from "./WidgetSelector";
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

  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id);

      reorderWidgets(oldIndex, newIndex);
    }
  };

  const handleWidgetSelect = (widget: { type: string }) => {
    addWidget(widget.type);
    setIsWidgetSelectorOpen(false);
  };

  const handleAddWidgetClick = () => {
    setIsWidgetSelectorOpen(true);
  };

  const canAddMoreWidgets = widgets.length < maxWidgets;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {canAddMoreWidgets && (
          <Button
            onClick={handleAddWidgetClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
              "min-h-[200px] transition-colors duration-200",
            )}
          >
            {widgets.map((widget) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                onRemove={() => removeWidget(widget.id)}
              />
            ))}

            {widgets.length === 0 && (
              <Card className="col-span-full p-8 text-center border-dashed">
                <h3 className="text-lg font-medium mb-2">
                  Welcome to Your Dashboard
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add widgets to customize your productivity workspace
                </p>
                <Button onClick={handleAddWidgetClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Widget
                </Button>
              </Card>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {widgets.length >= maxWidgets && (
        <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You've reached the maximum of {maxWidgets} widgets. Remove a widget
            to add a new one.
          </p>
        </Card>
      )}

      <WidgetSelector
        isOpen={isWidgetSelectorOpen}
        onOpenChange={setIsWidgetSelectorOpen}
        onSelectWidget={handleWidgetSelect}
      />
    </div>
  );
};
