import React from 'react';
import { cn } from '@/lib/utils';
import { useSwipeActions, SwipeAction } from '@/hooks/useSwipeActions';

interface SwipeableListItemProps {
  children: React.ReactNode;
  actions?: SwipeAction[];
  className?: string;
  disabled?: boolean;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  actions = [],
  className,
  disabled = false,
  onSwipe,
}) => {
  const {
    elementRef,
    isSwipeActive,
    swipeDirection,
    revealedActions,
    activeAction,
    containerStyle,
    leftActionsStyle,
    rightActionsStyle,
    getActionColorClasses,
  } = useSwipeActions({
    actions,
    disabled,
    threshold: 60,
    maxDistance: 180,
    snapThreshold: 120,
  });

  // Get actions for each side
  const leftActions = actions.filter(action => action.position === 'left');
  const rightActions = actions.filter(action => action.position === 'right');

  return (
    <div
      ref={elementRef}
      className={cn(
        'relative overflow-hidden touch-pan-y', // Enable only vertical panning by default
        className
      )}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 flex items-center',
            'transition-all duration-200 ease-out'
          )}
          style={leftActionsStyle}
        >
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            const isActive = activeAction?.id === action.id;

            return (
              <button
                key={action.id}
                className={cn(
                  'h-full px-4 flex flex-col items-center justify-center gap-1',
                  'min-w-[60px] transition-all duration-200',
                  getActionColorClasses(action.color),
                  isActive && 'scale-110'
                )}
                style={{
                  marginLeft: index === 0 ? '-60px' : '0px', // Initially hidden
                }}
                disabled={!isSwipeActive}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 flex items-center',
            'transition-all duration-200 ease-out'
          )}
          style={rightActionsStyle}
        >
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            const isActive = activeAction?.id === action.id;

            return (
              <button
                key={action.id}
                className={cn(
                  'h-full px-4 flex flex-col items-center justify-center gap-1',
                  'min-w-[60px] transition-all duration-200',
                  getActionColorClasses(action.color),
                  isActive && 'scale-110'
                )}
                style={{
                  marginRight: index === rightActions.length - 1 ? '-60px' : '0px', // Initially hidden
                }}
                disabled={!isSwipeActive}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'relative bg-white transition-all duration-200',
          isSwipeActive && 'shadow-lg'
        )}
        style={containerStyle}
      >
        {children}
      </div>

      {/* Active Action Indicator */}
      {activeAction && isSwipeActive && (
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'border-2 border-white rounded-lg',
            'animate-pulse'
          )}
          style={{
            backgroundColor: `var(--${activeAction.color === 'blue' ? 'apple-blue' :
              activeAction.color === 'green' ? 'apple-green' :
              activeAction.color === 'orange' ? 'apple-orange' :
              activeAction.color === 'red' ? 'apple-red' : 'apple-gray'})`,
            opacity: 0.1,
          }}
        />
      )}
    </div>
  );
};

// Pre-configured swipe actions for common use cases
export const createSwipeActions = {
  // Task actions
  task: (onComplete: () => void, onDelete: () => void): SwipeAction[] => [
    {
      id: 'complete',
      label: 'Done',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'green' as const,
      position: 'right' as const,
      onAction: onComplete,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'red' as const,
      position: 'right' as const,
      onAction: onDelete,
    },
  ],

  // Note actions
  note: (onEdit: () => void, onArchive: () => void): SwipeAction[] => [
    {
      id: 'edit',
      label: 'Edit',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'blue' as const,
      position: 'left' as const,
      onAction: onEdit,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
        </svg>
      ),
      color: 'gray' as const,
      position: 'right' as const,
      onAction: onArchive,
    },
  ],

  // Goal actions
  goal: (onEdit: () => void, onComplete: () => void): SwipeAction[] => [
    {
      id: 'edit',
      label: 'Edit',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'blue' as const,
      position: 'left' as const,
      onAction: onEdit,
    },
    {
      id: 'complete',
      label: 'Achieve',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'green' as const,
      position: 'right' as const,
      onAction: onComplete,
    },
  ],
};