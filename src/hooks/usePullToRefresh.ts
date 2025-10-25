import { useCallback, useEffect, useRef, useState } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface PullToRefreshOptions {
  threshold?: number; // Distance needed to trigger refresh
  maxDistance?: number; // Maximum distance to pull
  resistance?: number; // How much resistance when pulling (0-1)
  snapBackDuration?: number; // Duration for snap back animation
  onRefresh?: () => Promise<void> | void;
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  isTriggered: boolean;
  canPull: boolean;
}

/**
 * Hook for implementing Apple-style pull-to-refresh gesture
 * Provides smooth animations and haptic feedback
 */
export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const {
    threshold = 80,
    maxDistance = 120,
    resistance = 0.5,
    snapBackDuration = 300,
    onRefresh,
    disabled = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    isTriggered: false,
    canPull: false,
  });

  const { success: hapticSuccess, widgetRefresh } = useHapticFeedback();

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isScrollAtTop = useRef<boolean>(true);

  // Check if container is scrolled to top
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return false;
    const scrollTop = containerRef.current.scrollTop;
    isScrollAtTop.current = scrollTop <= 0;
    return isScrollAtTop.current;
  }, []);

  // Calculate pull distance with resistance
  const calculatePullDistance = useCallback((deltaY: number) => {
    if (deltaY <= 0) return 0;

    const resistedDistance = deltaY * resistance;
    return Math.min(resistedDistance, maxDistance);
  }, [resistance, maxDistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;

    const isAtTop = checkScrollPosition();
    if (!isAtTop) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;

    setState(prev => ({
      ...prev,
      canPull: true,
    }));
  }, [disabled, checkScrollPosition]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !state.canPull || state.isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    // Only pull down and when at top
    if (deltaY <= 0 || !isScrollAtTop.current) {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        isTriggered: false,
      }));
      return;
    }

    // Prevent default scrolling when pulling
    e.preventDefault();

    const pullDistance = calculatePullDistance(deltaY);
    const isTriggered = pullDistance >= threshold;

    // Trigger haptic feedback when crossing threshold
    if (isTriggered && !state.isTriggered) {
      widgetRefresh();
    }

    setState(prev => ({
      ...prev,
      isPulling: true,
      pullDistance,
      isTriggered,
    }));
  }, [disabled, state.canPull, state.isRefreshing, state.isTriggered, calculatePullDistance, threshold, widgetRefresh]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (disabled || !state.isPulling) return;

    const shouldRefresh = state.isTriggered && !state.isRefreshing;

    if (shouldRefresh && onRefresh) {
      // Trigger success haptic
      hapticSuccess();

      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          isTriggered: false,
          canPull: false,
        }));
      }
    } else {
      // Snap back without refreshing
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        isTriggered: false,
        canPull: false,
      }));
    }
  }, [disabled, state.isPulling, state.isTriggered, state.isRefreshing, onRefresh, hapticSuccess]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Scroll event to check position
    container.addEventListener('scroll', checkScrollPosition, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd, checkScrollPosition]);

  // Reset state when disabled
  useEffect(() => {
    if (disabled) {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        isTriggered: false,
        canPull: false,
      });
    }
  }, [disabled]);

  // Get pull indicator opacity and scale
  const getIndicatorStyle = useCallback(() => {
    const progress = Math.min(state.pullDistance / threshold, 1);
    const opacity = state.isPulling ? Math.min(progress * 1.5, 1) : 0;
    const scale = state.isPulling ? Math.min(0.5 + (progress * 0.5), 1) : 0.5;
    const rotation = state.isRefreshing ? 360 : progress * 360;

    return {
      opacity,
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transition: state.isRefreshing ? 'transform 1s linear infinite' : 'opacity 0.2s ease, transform 0.2s ease',
    };
  }, [state.pullDistance, state.isPulling, state.isRefreshing, threshold]);

  // Get container transform style
  const getContainerStyle = useCallback(() => {
    if (!state.isPulling && !state.isRefreshing) return {};

    const translateY = state.isRefreshing ? threshold * 0.5 : state.pullDistance;

    return {
      transform: `translateY(${translateY}px)`,
      transition: state.isPulling ? 'none' : `transform ${snapBackDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    };
  }, [state.isPulling, state.isRefreshing, state.pullDistance, threshold, snapBackDuration]);

  return {
    // Refs
    containerRef,

    // State
    ...state,

    // Progress
    progress: Math.min(state.pullDistance / threshold, 1),

    // Styles
    indicatorStyle: getIndicatorStyle(),
    containerStyle: getContainerStyle(),

    // Utilities
    isActive: state.isPulling || state.isRefreshing,

    // Manual trigger (for testing)
    triggerRefresh: useCallback(async () => {
      if (state.isRefreshing || !onRefresh) return;

      setState(prev => ({ ...prev, isRefreshing: true }));

      try {
        await onRefresh();
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          isTriggered: false,
        }));
      }
    }, [state.isRefreshing, onRefresh]),
  };
};