/**
 * Optimized Capture Tab with Strategic Memoization
 * Demonstrates advanced memoization patterns for performance optimization
 */
import React, { useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Archive,
  Trash2,
  CheckSquare,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SwipeableListItem, createSwipeActions } from '@/components/ui/SwipeableListItem';
import { quickAddItems, sampleRecentCaptures, type QuickAddItem, type RecentCapture } from '@/constants';
import {
  useStableMemo,
  useStableCallback,
  useObjectMemo,
  useArrayMemo,
  useConditionalMemo
} from '@/hooks/useMemoization';
import { withRenderTracking, useComponentMemo } from '@/components/optimization/MemoizationProvider';

interface CaptureTabProps {
  className?: string;
}

// Memoized QuickAdd Button Component
const QuickAddButton = memo<{
  item: QuickAddItem;
  onClick: (href: string) => void;
  index: number;
}>(({ item, onClick, index }) => {
  const handleClick = useStableCallback(() => {
    onClick(item.href);
  }, [onClick, item.href], `QuickAddButton-${item.title}`);

  // Memoize button props to prevent unnecessary re-renders
  const buttonProps = useObjectMemo({
    className: cn(
      "flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 active:scale-95",
      item.color
    ),
    onClick: handleClick,
    style: { animationDelay: `${index * 50}ms` }
  }, ['className', 'onClick', 'style'], `QuickAddButton-props-${item.title}`);

  return (
    <button {...buttonProps}>
      <div className="text-2xl mb-2">{item.icon}</div>
      <span className="text-sm font-medium text-gray-700">{item.title}</span>
    </button>
  );
});

QuickAddButton.displayName = 'QuickAddButton';

// Memoized Recent Capture Item Component
const RecentCaptureItem = memo<{
  item: RecentCapture;
  onItemClick: (item: RecentCapture) => void;
  onEdit: (item: RecentCapture) => void;
  onArchive: (item: RecentCapture) => void;
  onDelete: (item: RecentCapture) => void;
  onComplete?: (item: RecentCapture) => void;
}>(({ item, onItemClick, onEdit, onArchive, onDelete, onComplete }) => {

  const handleItemClick = useStableCallback(() => {
    onItemClick(item);
  }, [onItemClick, item.id], `RecentItem-click-${item.id}`);

  const handleEdit = useStableCallback(() => {
    onEdit(item);
  }, [onEdit, item.id], `RecentItem-edit-${item.id}`);

  const handleArchive = useStableCallback(() => {
    onArchive(item);
  }, [onArchive, item.id], `RecentItem-archive-${item.id}`);

  const handleDelete = useStableCallback(() => {
    onDelete(item);
  }, [onDelete, item.id], `RecentItem-delete-${item.id}`);

  const handleComplete = useStableCallback(() => {
    onComplete?.(item);
  }, [onComplete, item.id], `RecentItem-complete-${item.id}`);

  // Memoize swipe actions based on item type
  const swipeActions = useStableMemo(() => {
    const baseActions = [
      createSwipeActions.edit(handleEdit),
      createSwipeActions.archive(handleArchive),
      createSwipeActions.delete(handleDelete),
    ];

    // Add complete action for tasks and goals
    if ((item.type === 'task' || item.type === 'goal') && onComplete) {
      baseActions.unshift(createSwipeActions.complete(handleComplete));
    }

    return baseActions;
  }, [item.type, handleEdit, handleArchive, handleDelete, handleComplete, onComplete], `RecentItem-actions-${item.id}`);

  // Memoize item styling based on type and status
  const itemStyles = useStableMemo(() => ({
    container: cn(
      "p-4 bg-white rounded-lg border border-gray-100 transition-all duration-200",
      item.type === 'task' && "border-l-4 border-l-blue-500",
      item.type === 'goal' && "border-l-4 border-l-purple-500",
      item.type === 'note' && "border-l-4 border-l-green-500",
      item.type === 'reflection' && "border-l-4 border-l-orange-500"
    ),
    title: "font-medium text-gray-900 mb-1",
    content: "text-sm text-gray-600 line-clamp-2",
    meta: "text-xs text-gray-400 mt-2 flex items-center justify-between"
  }), [item.type], `RecentItem-styles-${item.id}`);

  // Memoize formatted date
  const formattedDate = useStableMemo(() => {
    return new Date(item.timestamp).toLocaleDateString();
  }, [item.timestamp], `RecentItem-date-${item.id}`);

  return (
    <SwipeableListItem
      actions={swipeActions}
      onTap={handleItemClick}
      className="mb-3 last:mb-0"
    >
      <div className={itemStyles.container}>
        <h3 className={itemStyles.title}>{item.title}</h3>
        <p className={itemStyles.content}>{item.content}</p>
        <div className={itemStyles.meta}>
          <span className="capitalize">{item.type}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </SwipeableListItem>
  );
});

RecentCaptureItem.displayName = 'RecentCaptureItem';

// Main CaptureTab component with strategic memoization
const CaptureTabComponent: React.FC<CaptureTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const { taskCreate, buttonPress, loadingComplete, success, warning } = useHapticFeedback();
  const [refreshKey, setRefreshKey] = useState(0);
  const [captures, setCaptures] = useState(sampleRecentCaptures);

  // Memoize navigation handlers
  const handleQuickAddClick = useStableCallback((href: string) => {
    taskCreate();
    navigate(href);
  }, [taskCreate, navigate], 'CaptureTab-quickAdd');

  const handleRecentItemClick = useStableCallback((item: RecentCapture) => {
    buttonPress();
    // Navigate to appropriate detail view based on type
    switch (item.type) {
      case 'goal':
        navigate('/goals');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'reflection':
        navigate('/reflections');
        break;
      default:
        navigate('/app/capture');
    }
  }, [buttonPress, navigate], 'CaptureTab-itemClick');

  // Memoize CRUD handlers
  const handleEdit = useStableCallback((item: RecentCapture) => {
    buttonPress();
    // Navigate to edit view
    navigate(`/edit/${item.type}/${item.id}`);
  }, [buttonPress, navigate], 'CaptureTab-edit');

  const handleArchive = useStableCallback((item: RecentCapture) => {
    warning();
    setCaptures(prev => prev.filter(c => c.id !== item.id));
  }, [warning], 'CaptureTab-archive');

  const handleDelete = useStableCallback((item: RecentCapture) => {
    warning();
    setCaptures(prev => prev.filter(c => c.id !== item.id));
  }, [warning], 'CaptureTab-delete');

  const handleComplete = useStableCallback((item: RecentCapture) => {
    success();
    setCaptures(prev => prev.map(c =>
      c.id === item.id ? { ...c, completed: true } : c
    ));
  }, [success], 'CaptureTab-complete');

  // Memoize pull-to-refresh handler
  const handleRefresh = useStableCallback(async () => {
    loadingComplete();
    setRefreshKey(prev => prev + 1);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, [loadingComplete], 'CaptureTab-refresh');

  // Memoize filtered and sorted captures
  const processedCaptures = useStableMemo(() => {
    return captures
      .filter(capture => !capture.completed)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [captures], 'CaptureTab-processedCaptures');

  // Memoize quick add items array (stable reference)
  const stableQuickAddItems = useArrayMemo(
    quickAddItems,
    (item) => item.href,
    'CaptureTab-quickAddItems'
  );

  // Conditionally memoize expensive operations only when needed
  const shouldMemoizeExpensive = captures.length > 10;
  const expensiveProcessedData = useConditionalMemo(
    () => {
      // Simulate expensive processing
      return processedCaptures.map(capture => ({
        ...capture,
        processedContent: capture.content.slice(0, 100) + '...',
        relativeTime: getRelativeTime(capture.timestamp)
      }));
    },
    [processedCaptures],
    shouldMemoizeExpensive,
    'CaptureTab-expensiveProcessing'
  );

  const dataToRender = shouldMemoizeExpensive ? expensiveProcessedData : processedCaptures;

  // Memoize component props
  const captureTabProps = useComponentMemo({
    className: cn("h-full flex flex-col bg-gray-50", className),
    key: refreshKey
  }, [className, refreshKey], 'CaptureTab');

  return (
    <div {...captureTabProps}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="flex-1 overflow-auto">
          {/* Quick Add Section */}
          <section className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h2>
            <div className="grid grid-cols-2 gap-3">
              {stableQuickAddItems.map((item, index) => (
                <QuickAddButton
                  key={item.href}
                  item={item}
                  onClick={handleQuickAddClick}
                  index={index}
                />
              ))}
            </div>
          </section>

          {/* Recent Captures Section */}
          <section className="p-4 pt-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Captures</h2>
            {dataToRender.length > 0 ? (
              <div className="space-y-3">
                {dataToRender.map((item) => (
                  <RecentCaptureItem
                    key={item.id}
                    item={item}
                    onItemClick={handleRecentItemClick}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent captures</p>
                <p className="text-sm mt-1">Start by adding a new task or goal above</p>
              </div>
            )}
          </section>
        </div>
      </PullToRefresh>
    </div>
  );
};

// Helper function for relative time calculation
function getRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Export the component with render tracking
export const OptimizedCaptureTab = withRenderTracking(
  memo(CaptureTabComponent),
  'OptimizedCaptureTab'
);