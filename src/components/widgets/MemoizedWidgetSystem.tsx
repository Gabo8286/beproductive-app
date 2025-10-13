/**
 * Memoized Widget System
 * Advanced memoization implementation for the widget grid and components
 */
import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { FixedSizeGrid as Grid } from 'react-window';
import {
  useStableMemo,
  useStableCallback,
  useExpensiveMemo,
  useObjectMemo,
  useArrayMemo,
  useBatchMemo,
  usePerformanceBudgetMemo
} from '@/hooks/useMemoization';
import { withRenderTracking, useComponentMemo } from '@/components/optimization/MemoizationProvider';
import { useWidgetLayout } from '@/hooks/useWidgetLayout';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { OptimizedDraggableWidget } from './OptimizedDraggableWidget';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Grid3X3, List, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  config?: Record<string, any>;
  position: number;
  size?: { width: number; height: number };
  minimized?: boolean;
}

interface MemoizedWidgetSystemProps {
  className?: string;
  widgets: Widget[];
  onWidgetAdd?: () => void;
  onWidgetRemove?: (id: string) => void;
  onWidgetReorder?: (sourceIndex: number, destinationIndex: number) => void;
  onWidgetConfigure?: (id: string) => void;
  layout?: 'grid' | 'list';
  itemWidth?: number;
  itemHeight?: number;
  enableVirtualization?: boolean;
  performanceMode?: boolean;
}

// Memoized widget grid metrics calculator
const useGridMetrics = (
  containerWidth: number,
  itemWidth: number,
  itemHeight: number,
  widgets: Widget[],
  layout: 'grid' | 'list'
) => {
  return useExpensiveMemo(
    () => {
      if (layout === 'list') {
        return {
          columnCount: 1,
          rowCount: widgets.length,
          actualItemWidth: containerWidth - 32, // Account for padding
          actualItemHeight: itemHeight
        };
      }

      const availableWidth = containerWidth - 32; // Account for padding
      const columnCount = Math.max(1, Math.floor(availableWidth / itemWidth));
      const rowCount = Math.ceil(widgets.length / columnCount);
      const actualItemWidth = Math.floor(availableWidth / columnCount);

      return {
        columnCount,
        rowCount,
        actualItemWidth,
        actualItemHeight: itemHeight
      };
    },
    [containerWidth, itemWidth, itemHeight, widgets.length, layout],
    {
      maxCacheSize: 5,
      ttl: 30000, // Cache for 30 seconds
      debugName: 'GridMetrics'
    }
  );
};

// Memoized widget cell component
const WidgetCell = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    widgets: Widget[];
    columnCount: number;
    onRemove: (id: string) => void;
    onConfigure: (id: string) => void;
    itemWidth: number;
    itemHeight: number;
    enableLazyLoading: boolean;
  };
}>(({ index, style, data }) => {
  const { widgets, columnCount, onRemove, onConfigure, enableLazyLoading } = data;

  // Calculate widget position from flat index
  const widgetPosition = useStableMemo(() => {
    const rowIndex = Math.floor(index / columnCount);
    const columnIndex = index % columnCount;
    const widgetIndex = rowIndex * columnCount + columnIndex;
    return { rowIndex, columnIndex, widgetIndex };
  }, [index, columnCount], `WidgetCell-position-${index}`);

  const widget = widgets[widgetPosition.widgetIndex];

  // Memoize cell handlers
  const handleRemove = useStableCallback(() => {
    onRemove(widget.id);
  }, [onRemove, widget?.id], `WidgetCell-remove-${widget?.id}`);

  const handleConfigure = useStableCallback(() => {
    onConfigure(widget.id);
  }, [onConfigure, widget?.id], `WidgetCell-configure-${widget?.id}`);

  // Memoize style with padding
  const cellStyle = useObjectMemo({
    ...style,
    padding: '8px'
  }, ['padding'], `WidgetCell-style-${index}`);

  if (!widget) {
    return (
      <div style={cellStyle}>
        <div className="w-full h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground">
          <Plus className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div style={cellStyle}>
      <OptimizedDraggableWidget
        widget={widget}
        index={widgetPosition.widgetIndex}
        onRemove={handleRemove}
        onConfigure={handleConfigure}
        enableLazyLoading={enableLazyLoading}
      />
    </div>
  );
});

WidgetCell.displayName = 'WidgetCell';

// Memoized widget list item for list layout
const WidgetListItem = memo<{
  widget: Widget;
  index: number;
  onRemove: (id: string) => void;
  onConfigure: (id: string) => void;
}>(({ widget, index, onRemove, onConfigure }) => {
  const handleRemove = useStableCallback(() => {
    onRemove(widget.id);
  }, [onRemove, widget.id], `WidgetListItem-remove-${widget.id}`);

  const handleConfigure = useStableCallback(() => {
    onConfigure(widget.id);
  }, [onConfigure, widget.id], `WidgetListItem-configure-${widget.id}`);

  return (
    <div className="mb-4" style={{ animationDelay: `${index * 50}ms` }}>
      <OptimizedDraggableWidget
        widget={widget}
        index={index}
        onRemove={handleRemove}
        onConfigure={handleConfigure}
        enableLazyLoading={true}
      />
    </div>
  );
});

WidgetListItem.displayName = 'WidgetListItem';

// Memoized performance metrics display
const PerformanceMetrics = memo<{
  visible: boolean;
  widgets: Widget[];
  renderTime: number;
}>(({ visible, widgets, renderTime }) => {
  if (!visible || process.env.NODE_ENV !== 'development') return null;

  const metrics = useStableMemo(() => ({
    widgetCount: widgets.length,
    renderTime: renderTime.toFixed(2),
    memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    timestamp: new Date().toLocaleTimeString()
  }), [widgets.length, renderTime], 'PerformanceMetrics');

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div>Widgets: {metrics.widgetCount}</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      <div>Time: {metrics.timestamp}</div>
    </div>
  );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';

// Main widget system component
const MemoizedWidgetSystemComponent: React.FC<MemoizedWidgetSystemProps> = ({
  className,
  widgets,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetReorder,
  onWidgetConfigure,
  layout = 'grid',
  itemWidth = 300,
  itemHeight = 250,
  enableVirtualization = true,
  performanceMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [renderTime, setRenderTime] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);

  const { trackMetric } = usePerformanceMonitor();

  // Measure render performance
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      trackMetric('widget-system-render', duration);
    };
  });

  // Debounced container width measurement
  const updateContainerWidth = useDebounce(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, 250);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [updateContainerWidth]);

  // Memoize stable widget array
  const stableWidgets = useArrayMemo(
    widgets,
    (widget) => `${widget.id}-${widget.position}`,
    'MemoizedWidgetSystem-widgets'
  );

  // Memoize grid metrics
  const gridMetrics = useGridMetrics(
    containerWidth,
    itemWidth,
    itemHeight,
    stableWidgets,
    layout
  );

  // Batch memoize all handlers
  const handlers = useBatchMemo({
    onRemove: () => useStableCallback((id: string) => {
      onWidgetRemove?.(id);
    }, [onWidgetRemove], 'MemoizedWidgetSystem-remove'),

    onConfigure: () => useStableCallback((id: string) => {
      onWidgetConfigure?.(id);
    }, [onWidgetConfigure], 'MemoizedWidgetSystem-configure'),

    onDragEnd: () => useStableCallback((result: DropResult) => {
      if (!result.destination || !onWidgetReorder) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex !== destinationIndex) {
        onWidgetReorder(sourceIndex, destinationIndex);
      }
    }, [onWidgetReorder], 'MemoizedWidgetSystem-dragEnd'),

    onAdd: () => useStableCallback(() => {
      onWidgetAdd?.();
    }, [onWidgetAdd], 'MemoizedWidgetSystem-add')
  }, [onWidgetRemove, onWidgetConfigure, onWidgetReorder, onWidgetAdd], 'MemoizedWidgetSystem-handlers');

  // Memoize virtualized grid data with performance budget
  const gridData = usePerformanceBudgetMemo(() => ({
    widgets: stableWidgets,
    columnCount: gridMetrics.columnCount,
    onRemove: handlers.onRemove,
    onConfigure: handlers.onConfigure,
    itemWidth: gridMetrics.actualItemWidth,
    itemHeight: gridMetrics.actualItemHeight,
    enableLazyLoading: performanceMode
  }), [
    stableWidgets,
    gridMetrics,
    handlers.onRemove,
    handlers.onConfigure,
    performanceMode
  ], 16, 'MemoizedWidgetSystem-gridData');

  // Memoize container props
  const containerProps = useComponentMemo({
    ref: containerRef,
    className: cn('widget-system-container h-full flex flex-col', className)
  }, [className], 'MemoizedWidgetSystem-container');

  // Conditionally render based on performance mode and widget count
  const shouldUseVirtualization = enableVirtualization && stableWidgets.length > 20;

  const renderGrid = () => {
    if (layout === 'list') {
      return (
        <div className="flex-1 overflow-auto space-y-4 p-4">
          {stableWidgets.map((widget, index) => (
            <WidgetListItem
              key={widget.id}
              widget={widget}
              index={index}
              onRemove={handlers.onRemove}
              onConfigure={handlers.onConfigure}
            />
          ))}
        </div>
      );
    }

    if (shouldUseVirtualization) {
      return (
        <div className="flex-1">
          <Grid
            columnCount={gridMetrics.columnCount}
            rowCount={gridMetrics.rowCount}
            columnWidth={gridMetrics.actualItemWidth}
            rowHeight={gridMetrics.actualItemHeight}
            height={400} // Fixed height for virtualization
            width={containerWidth}
            itemData={gridData}
          >
            {WidgetCell}
          </Grid>
        </div>
      );
    }

    // Standard grid layout
    return (
      <div
        className="flex-1 overflow-auto p-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridMetrics.columnCount}, 1fr)`,
          gap: '16px'
        }}
      >
        {stableWidgets.map((widget, index) => (
          <OptimizedDraggableWidget
            key={widget.id}
            widget={widget}
            index={index}
            onRemove={handlers.onRemove}
            onConfigure={handlers.onConfigure}
            enableLazyLoading={performanceMode}
          />
        ))}
      </div>
    );
  };

  return (
    <div {...containerProps}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Widgets ({stableWidgets.length})</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlers.onAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Widget content area */}
      <DragDropContext onDragEnd={handlers.onDragEnd}>
        <Droppable droppableId="widget-grid" type="widget">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 min-h-0"
            >
              {renderGrid()}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Performance metrics overlay */}
      <PerformanceMetrics
        visible={showMetrics}
        widgets={stableWidgets}
        renderTime={renderTime}
      />
    </div>
  );
};

// Export with render tracking
export const MemoizedWidgetSystem = withRenderTracking(
  memo(MemoizedWidgetSystemComponent),
  'MemoizedWidgetSystem'
);