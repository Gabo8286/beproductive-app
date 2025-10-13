/**
 * OptimizedDraggableWidget Component
 * Location: src/components/widgets/OptimizedDraggableWidget.tsx
 * Purpose: High-performance draggable widget with memoization and optimized rendering
 */
import React, { memo, useMemo, useCallback, Suspense, useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EnhancedErrorBoundary } from '@/components/errors/EnhancedErrorBoundary';
import { useWidget } from '@/hooks/useWidgetLayout';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LoadingSkeleton } from '@/components/ai/LoadingSkeleton';

interface OptimizedDraggableWidgetProps {
  widget: {
    id: string;
    type: string;
    title: string;
    component: React.ComponentType<any>;
    config?: Record<string, any>;
    position: number;
  };
  index: number;
  onRemove: () => void;
  onConfigure?: () => void;
  style?: React.CSSProperties;
  isDragDisabled?: boolean;
  enableLazyLoading?: boolean;
}

// Memoized loading fallback
const WidgetLoadingFallback = memo(() => (
  <div className="h-full w-full flex items-center justify-center p-4">
    <LoadingSkeleton type="widget" />
  </div>
));

WidgetLoadingFallback.displayName = 'WidgetLoadingFallback';

// Memoized error fallback
const WidgetErrorFallback = memo(({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
    <h3 className="text-sm font-medium mb-1">Widget Error</h3>
    <p className="text-xs text-muted-foreground mb-3">
      {error.message || 'Failed to load widget'}
    </p>
    <Button onClick={resetError} size="sm" variant="outline">
      <RefreshCw className="h-3 w-3 mr-1" />
      Retry
    </Button>
  </div>
));

WidgetErrorFallback.displayName = 'WidgetErrorFallback';

// Widget content with lazy loading support
const WidgetContent = memo(({
  widget,
  isVisible,
  enableLazyLoading
}: {
  widget: OptimizedDraggableWidgetProps['widget'];
  isVisible: boolean;
  enableLazyLoading: boolean;
}) => {
  const [shouldRender, setShouldRender] = useState(!enableLazyLoading);

  useEffect(() => {
    if (enableLazyLoading && isVisible && !shouldRender) {
      setShouldRender(true);
    }
  }, [isVisible, enableLazyLoading, shouldRender]);

  if (enableLazyLoading && !shouldRender) {
    return <WidgetLoadingFallback />;
  }

  const WidgetComponent = widget.component;

  return (
    <EnhancedErrorBoundary
      level="widget"
      name={`${widget.type}-widget`}
      fallback={WidgetErrorFallback}
      isolateFailures
    >
      <Suspense fallback={<WidgetLoadingFallback />}>
        <WidgetComponent
          widgetId={widget.id}
          config={widget.config}
          {...(widget.config || {})}
        />
      </Suspense>
    </EnhancedErrorBoundary>
  );
});

WidgetContent.displayName = 'WidgetContent';

export const OptimizedDraggableWidget = memo<OptimizedDraggableWidgetProps>(({
  widget,
  index,
  onRemove,
  onConfigure,
  style,
  isDragDisabled = false,
  enableLazyLoading = true,
}) => {
  const {
    isExpanded,
    isLoading,
    error,
    expandWidget,
    collapseWidget,
    refreshWidget,
  } = useWidget(widget.id);

  const [isHovered, setIsHovered] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  const { isVisible } = useIntersectionObserver(widgetRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Memoized drag handle
  const dragHandle = useMemo(() => (
    <div className={cn(
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
      isHovered && "opacity-100"
    )}>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
        disabled={isDragDisabled}
      >
        <GripVertical className="h-3 w-3" />
      </Button>
    </div>
  ), [isDragDisabled, isHovered]);

  // Memoized widget actions
  const widgetActions = useMemo(() => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isHovered && "opacity-100"
          )}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={refreshWidget} disabled={isLoading}>
          <RefreshCw className={cn("h-3 w-3 mr-2", isLoading && "animate-spin")} />
          Refresh
        </DropdownMenuItem>

        <DropdownMenuItem onClick={isExpanded ? collapseWidget : expandWidget}>
          {isExpanded ? (
            <>
              <Minimize2 className="h-3 w-3 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3 mr-2" />
              Expand
            </>
          )}
        </DropdownMenuItem>

        {onConfigure && (
          <DropdownMenuItem onClick={onConfigure}>
            <Settings className="h-3 w-3 mr-2" />
            Configure
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onRemove}
          className="text-destructive focus:text-destructive"
        >
          <X className="h-3 w-3 mr-2" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [
    isHovered,
    refreshWidget,
    isLoading,
    isExpanded,
    collapseWidget,
    expandWidget,
    onConfigure,
    onRemove,
  ]);

  // Optimized event handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Memoized card content
  const cardContent = useMemo(() => (
    <Card
      ref={widgetRef}
      className={cn(
        "group h-full transition-all duration-200 hover:shadow-md",
        isExpanded && "ring-2 ring-primary",
        error && "border-destructive",
        isLoading && "opacity-70"
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Widget Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2">
        <div className="flex items-center gap-2">
          {dragHandle}
          <h3 className="text-sm font-medium truncate">
            {widget.title}
          </h3>
          {error && (
            <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
          )}
        </div>
        {widgetActions}
      </CardHeader>

      {/* Widget Content */}
      <CardContent className="px-3 py-2 pt-0 h-[calc(100%-60px)] overflow-hidden">
        <WidgetContent
          widget={widget}
          isVisible={isVisible}
          enableLazyLoading={enableLazyLoading}
        />
      </CardContent>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
      )}
    </Card>
  ), [
    widget,
    style,
    isExpanded,
    error,
    isLoading,
    isVisible,
    enableLazyLoading,
    dragHandle,
    widgetActions,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  return (
    <Draggable
      draggableId={widget.id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "relative transition-transform duration-200",
            snapshot.isDragging && "rotate-1 scale-105 shadow-lg",
            snapshot.isDragging && "z-50"
          )}
          style={{
            ...provided.draggableProps.style,
            ...style,
          }}
        >
          {cardContent}
        </div>
      )}
    </Draggable>
  );
});

OptimizedDraggableWidget.displayName = 'OptimizedDraggableWidget';