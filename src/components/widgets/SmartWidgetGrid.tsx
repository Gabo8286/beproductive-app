import { ReactNode, useState, useEffect, useRef } from "react";
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableWidget } from "./SortableWidget";
import { useWidgets } from "@/contexts/WidgetContext";
import { cn } from "@/lib/utils";

interface SmartWidgetGridProps {
  children: ReactNode[];
  className?: string;
  enableDragDrop?: boolean;
}

export function SmartWidgetGrid({ 
  children, 
  className,
  enableDragDrop = true 
}: SmartWidgetGridProps) {
  const { widgets, reorderWidgets } = useWidgets();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive breakpoints
  useEffect(() => {
    const updateGridCols = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      if (width < 640) setGridCols(1);      // Mobile
      else if (width < 1024) setGridCols(2); // Tablet
      else if (width < 1280) setGridCols(3); // Small desktop
      else setGridCols(4);                   // Large desktop
    };

    updateGridCols();

    const resizeObserver = new ResizeObserver(updateGridCols);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate optimal widget placement
  const getOptimalLayout = () => {
    const visibleWidgets = widgets.filter(w => w.visible);
    const sortedWidgets = [...visibleWidgets].sort((a, b) => a.position - b.position);

    return sortedWidgets.map((widget, index) => ({
      ...widget,
      gridPosition: {
        col: index % gridCols,
        row: Math.floor(index / gridCols),
        colSpan: widget.size === 'large' ? Math.min(2, gridCols) :
                widget.size === 'medium' ? Math.min(2, gridCols) : 1,
        rowSpan: widget.size === 'large' ? 2 : 1
      }
    }));
  };

  const layoutWidgets = getOptimalLayout();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      reorderWidgets(newWidgets.map((w, i) => ({ ...w, position: i })));
    }

    setActiveId(null);
  };

  const activeWidget = widgets.find(w => w.id === activeId);

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid gap-6 transition-all duration-300",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      style={{
        gridAutoRows: 'minmax(200px, auto)',
      }}
    >
      {enableDragDrop ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={layoutWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            {layoutWidgets.map((widget, index) => (
              <SortableWidget
                key={widget.id}
                id={widget.id}
                widget={widget}
                isActive={activeId === widget.id}
              >
                {children[index]}
              </SortableWidget>
            ))}
          </SortableContext>

          <DragOverlay>
            {activeWidget ? (
              <div className="opacity-50 rotate-3 scale-105 transition-transform">
                {children[widgets.findIndex(w => w.id === activeId)]}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        layoutWidgets.map((widget, index) => (
          <div
            key={widget.id}
            className={cn(
              "transition-all duration-300",
              widget.size === 'large' && 'md:col-span-2 md:row-span-2',
              widget.size === 'medium' && 'md:col-span-2',
              widget.size === 'small' && 'col-span-1'
            )}
          >
            {children[index]}
          </div>
        ))
      )}
    </div>
  );
}
