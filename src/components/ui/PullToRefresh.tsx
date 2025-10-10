import React from 'react';
import { RotateCcw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  className,
}) => {
  const {
    containerRef,
    isPulling,
    isRefreshing,
    isTriggered,
    progress,
    indicatorStyle,
    containerStyle,
  } = usePullToRefresh({
    onRefresh,
    disabled,
    threshold,
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto apple-scrollbar',
        'touch-pan-y', // Enable vertical panning
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className={cn(
          'absolute top-0 left-1/2 transform -translate-x-1/2 z-10',
          'flex flex-col items-center justify-center',
          'transition-all duration-200 ease-out',
          isPulling || isRefreshing ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        style={{
          transform: `translateX(-50%) translateY(${isPulling || isRefreshing ? 16 : -60}px)`,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'bg-white shadow-lg',
            'text-[#007aff]'
          )}
          style={indicatorStyle}
        >
          {isRefreshing ? (
            <RotateCcw className="w-4 h-4" />
          ) : (
            <ArrowDown className={cn('w-4 h-4 transition-transform duration-200', isTriggered && 'rotate-180')} />
          )}
        </div>

        {/* Pull hint text */}
        <div
          className={cn(
            'mt-2 px-3 py-1 rounded-full',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'text-xs font-medium text-[#86868b]',
            'transition-opacity duration-200',
            (isPulling || isRefreshing) ? 'opacity-100' : 'opacity-0'
          )}
        >
          {isRefreshing
            ? 'Refreshing...'
            : isTriggered
            ? 'Release to refresh'
            : 'Pull to refresh'}
        </div>
      </div>

      {/* Content Container */}
      <div
        className="relative"
        style={containerStyle}
      >
        {children}
      </div>

      {/* Progress Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007aff] to-[#34c759]',
          'transform origin-left transition-transform duration-200',
          isPulling ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
};

// Simplified version for basic use cases
export const SimplePullToRefresh: React.FC<{
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}> = ({ onRefresh, children, className }) => {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={cn('h-full', className)}
    >
      {children}
    </PullToRefresh>
  );
};