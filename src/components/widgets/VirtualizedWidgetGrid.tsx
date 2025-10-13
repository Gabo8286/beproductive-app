/**
 * VirtualizedWidgetGrid Component
 * Location: src/components/widgets/VirtualizedWidgetGrid.tsx
 * Purpose: High-performance widget container with virtualization for large widget collections
 */
import React, { useMemo, useCallback, useRef, useEffect, useState, memo } from 'react';
import { FixedSizeGrid as Grid, VariableSizeGrid, GridChildComponentProps, areEqual } from 'react-window';
import { DragDropContext, Droppable, DropResult, DraggableLocation } from 'react-beautiful-dnd';
import { useVirtual } from '@tanstack/react-virtual';
import { useWidgetLayout } from '@/hooks/useWidgetLayout';
import { OptimizedDraggableWidget } from './OptimizedDraggableWidget';
import { WidgetSelector } from './WidgetSelector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, List, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface VirtualizedWidgetGridProps {
  className?: string;
  itemWidth?: number;
  itemHeight?: number;
  overscan?: number;
  enableVirtualization?: boolean;
  maxColumnsPerRow?: number;
}

interface WidgetItemData {
  widgets: any[];
  columnCount: number;
  onRemove: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  itemWidth: number;
  itemHeight: number;
}

// Memoized widget cell component for virtualization
const WidgetCell = memo(({ index, style, data }: GridChildComponentProps<WidgetItemData>) => {
  const { widgets, columnCount, onRemove, itemWidth, itemHeight } = data;
  const rowIndex = Math.floor(index / columnCount);
  const columnIndex = index % columnCount;
  const widgetIndex = rowIndex * columnCount + columnIndex;
  const widget = widgets[widgetIndex];

  if (!widget) {
    return (
      <div style={style} className="p-2">
        <div className="w-full h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div style={style} className="p-2">
      <OptimizedDraggableWidget
        widget={widget}
        index={widgetIndex}
        onRemove={() => onRemove(widget.id)}
        style={{
          width: itemWidth - 16, // Account for padding
          height: itemHeight - 16,
        }}
      />
    </div>
  );
}, areEqual);

WidgetCell.displayName = 'WidgetCell';

// Hook for calculating optimal grid dimensions
function useGridDimensions(
  containerWidth: number,
  itemWidth: number,
  maxColumns: number
) {
  return useMemo(() => {
    if (containerWidth === 0) return { columnCount: 1, actualItemWidth: itemWidth };

    const availableWidth = containerWidth - 32; // Account for padding
    const possibleColumns = Math.floor(availableWidth / itemWidth);
    const columnCount = Math.min(Math.max(1, possibleColumns), maxColumns);
    const actualItemWidth = availableWidth / columnCount;

    return { columnCount, actualItemWidth };
  }, [containerWidth, itemWidth, maxColumns]);
}

// Hook for performance monitoring
function useWidgetPerformance() {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const renderStartTime = useRef(0);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setLastRenderTime(renderTime);
    setRenderCount(prev => prev + 1);
  }, []);

  return { renderCount, lastRenderTime, startRender, endRender };
}

export const VirtualizedWidgetGrid: React.FC<VirtualizedWidgetGridProps> = memo(({
  className,
  itemWidth = 320,
  itemHeight = 240,
  overscan = 2,
  enableVirtualization = true,
  maxColumnsPerRow = 4,
}) => {
  const {
    widgets,
    reorderWidgets,
    addWidget,
    removeWidget,
    maxWidgets = 20, // Increased for virtualization
  } = useWidgetLayout();

  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExpanded, setIsExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const performance = useWidgetPerformance();
  const { trackPerformance } = usePerformanceMonitor();

  // Debounced resize handler
  const debouncedResize = useDebounce(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setContainerSize({ width: offsetWidth, height: offsetHeight });
    }
  }, 150);

  // Setup resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      debouncedResize(); // Initial measurement
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [debouncedResize]);

  // Calculate grid dimensions
  const { columnCount, actualItemWidth } = useGridDimensions(
    containerSize.width,
    itemWidth,
    maxColumnsPerRow
  );

  const rowCount = Math.ceil(widgets.length / columnCount);

  // Optimized drag handler with performance tracking
  const handleDragEnd = useCallback((result: DropResult) => {
    performance.startRender();

    if (!result.destination) {
      performance.endRender();
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      reorderWidgets(sourceIndex, destinationIndex);

      // Track drag performance
      trackPerformance('widget_drag', {
        sourceIndex,
        destinationIndex,
        widgetCount: widgets.length,
      });
    }

    performance.endRender();
  }, [reorderWidgets, widgets.length, performance, trackPerformance]);

  // Optimized widget selection handler
  const handleWidgetSelect = useCallback((widget: { type: string }) => {
    performance.startRender();
    addWidget(widget.type);
    setIsWidgetSelectorOpen(false);
    performance.endRender();

    trackPerformance('widget_add', {
      widgetType: widget.type,
      totalWidgets: widgets.length + 1,
    });
  }, [addWidget, widgets.length, performance, trackPerformance]);

  // Optimized remove handler
  const handleRemoveWidget = useCallback((widgetId: string) => {
    performance.startRender();
    removeWidget(widgetId);
    performance.endRender();

    trackPerformance('widget_remove', {
      widgetId,
      remainingWidgets: widgets.length - 1,
    });
  }, [removeWidget, widgets.length, performance, trackPerformance]);

  // Widget data for virtualization
  const itemData: WidgetItemData = useMemo(() => ({
    widgets,
    columnCount,
    onRemove: handleRemoveWidget,
    onReorder: reorderWidgets,
    itemWidth: actualItemWidth,
    itemHeight,
  }), [
    widgets,
    columnCount,
    handleRemoveWidget,
    reorderWidgets,
    actualItemWidth,
    itemHeight,
  ]);

  const canAddMoreWidgets = widgets.length < maxWidgets;

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Render virtualized grid
  const renderVirtualizedGrid = () => {
    if (!enableVirtualization || widgets.length < 10) {
      // Fall back to regular grid for small collections
      return (
        <div className={cn(
          "grid gap-4 transition-all duration-200",
          viewMode === 'grid'
            ? `grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columnCount, 3)}`
            : "grid-cols-1"
        )}>
          {widgets.map((widget, index) => (
            <OptimizedDraggableWidget
              key={widget.id}
              widget={widget}
              index={index}
              onRemove={() => handleRemoveWidget(widget.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={actualItemWidth}
          rowHeight={itemHeight}
          width={containerSize.width}
          height={isExpanded ? containerSize.height : Math.min(600, rowCount * itemHeight)}
          itemData={itemData}
          overscanRowCount={overscan}
          overscanColumnCount={overscan}
        >
          {WidgetCell}
        </Grid>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)} ref={containerRef}>
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleViewMode}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4" />
                  List
                </>
              ) : (
                <>
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </>
              )}
            </Button>
            <Button
              onClick={toggleExpanded}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Compact
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Performance indicator */}
          {import.meta.env.MODE === 'development' && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Render: {performance.lastRenderTime.toFixed(1)}ms
            </div>
          )}

          {canAddMoreWidgets && (
            <Button
              onClick={() => setIsWidgetSelectorOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>
          )}
        </div>
      </div>

      {/* Widget grid container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="virtualized-widget-grid" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "transition-colors duration-200 rounded-lg",
                snapshot.isDraggingOver && "bg-muted/50 p-2",
                isExpanded ? "h-screen" : "min-h-[300px]"
              )}
            >
              {widgets.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <h3 className="text-lg font-medium mb-2">
                    Welcome to Your Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add widgets to customize your productivity workspace
                  </p>
                  <Button onClick={() => setIsWidgetSelectorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Widget
                  </Button>
                </Card>
              ) : (
                renderVirtualizedGrid()
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Widget limit notification */}
      {widgets.length >= maxWidgets && (
        <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You've reached the maximum of {maxWidgets} widgets. Remove a widget
            to add a new one.
          </p>
        </Card>
      )}

      {/* Widget selector */}
      <WidgetSelector
        isOpen={isWidgetSelectorOpen}
        onOpenChange={setIsWidgetSelectorOpen}
        onSelectWidget={handleWidgetSelect}
      />

      {/* Performance stats (development only) */}
      {import.meta.env.MODE === 'development' && (
        <Card className="p-3 bg-blue-50 border-blue-200 dark:bg-blue-900/20">
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <div>Widgets: {widgets.length} | Columns: {columnCount} | Rows: {rowCount}</div>
            <div>Container: {containerSize.width}×{containerSize.height}</div>
            <div>Virtualization: {enableVirtualization && widgets.length >= 10 ? 'ON' : 'OFF'}</div>
            <div>Render Count: {performance.renderCount}</div>
          </div>
        </Card>
      )}
    </div>
  );
});

VirtualizedWidgetGrid.displayName = 'VirtualizedWidgetGrid';