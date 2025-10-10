import { useCallback, useEffect, useRef, useState } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

export interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  position: 'left' | 'right';
  onAction: () => void | Promise<void>;
}

interface SwipeOptions {
  threshold?: number; // Distance needed to reveal actions
  maxDistance?: number; // Maximum swipe distance
  snapThreshold?: number; // Distance to auto-complete action
  disabled?: boolean;
  actions?: SwipeAction[];
}

interface SwipeState {
  isSwipeActive: boolean;
  swipeDistance: number;
  swipeDirection: 'left' | 'right' | null;
  revealedActions: SwipeAction[];
  activeAction: SwipeAction | null;
  canSwipe: boolean;
}

/**
 * Hook for implementing Apple-style swipe actions on list items
 * Supports left and right swipe with customizable actions
 */
export const useSwipeActions = (options: SwipeOptions = {}) => {
  const {
    threshold = 60,
    maxDistance = 180,
    snapThreshold = 120,
    disabled = false,
    actions = [],
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SwipeState>({
    isSwipeActive: false,
    swipeDistance: 0,
    swipeDirection: null,
    revealedActions: [],
    activeAction: null,
    canSwipe: false,
  });

  const { buttonPress, warning } = useHapticFeedback();

  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean>(false);

  // Get actions for a specific direction
  const getActionsForDirection = useCallback((direction: 'left' | 'right') => {
    return actions.filter(action => action.position === direction);
  }, [actions]);

  // Calculate swipe distance with boundaries
  const calculateSwipeDistance = useCallback((deltaX: number) => {
    const absDistance = Math.abs(deltaX);
    if (absDistance < threshold) return 0;

    const clampedDistance = Math.min(absDistance - threshold, maxDistance - threshold);
    return deltaX > 0 ? clampedDistance : -clampedDistance;
  }, [threshold, maxDistance]);

  // Get the action color classes
  const getActionColorClasses = useCallback((color: SwipeAction['color']) => {
    const colorMap = {
      blue: 'bg-[#007aff] text-white',
      green: 'bg-[#34c759] text-white',
      orange: 'bg-[#ff9500] text-white',
      red: 'bg-[#ff3b30] text-white',
      gray: 'bg-[#86868b] text-white',
    };
    return colorMap[color];
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || actions.length === 0) return;

    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = startX.current;
    currentY.current = startY.current;
    isHorizontalSwipe.current = false;

    setState(prev => ({
      ...prev,
      canSwipe: true,
    }));
  }, [disabled, actions.length]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !state.canSwipe) return;

    const touch = e.touches[0];
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    // Determine if this is a horizontal swipe
    if (!isHorizontalSwipe.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > 10 || absY > 10) {
        isHorizontalSwipe.current = absX > absY;

        if (!isHorizontalSwipe.current) {
          // This is a vertical swipe, abort
          setState(prev => ({
            ...prev,
            canSwipe: false,
            isSwipeActive: false,
            swipeDistance: 0,
            swipeDirection: null,
            revealedActions: [],
            activeAction: null,
          }));
          return;
        }
      }
    }

    if (!isHorizontalSwipe.current) return;

    // Prevent default scrolling during horizontal swipe
    e.preventDefault();

    const direction = deltaX > 0 ? 'right' : 'left';
    const availableActions = getActionsForDirection(direction === 'right' ? 'left' : 'right');

    if (availableActions.length === 0) return;

    const swipeDistance = calculateSwipeDistance(deltaX);
    const absSwipeDistance = Math.abs(swipeDistance);

    // Trigger haptic feedback when crossing threshold
    if (absSwipeDistance > 0 && !state.isSwipeActive) {
      buttonPress();
    }

    // Determine active action based on swipe distance
    let activeAction: SwipeAction | null = null;
    if (absSwipeDistance >= snapThreshold - threshold) {
      activeAction = availableActions[0]; // First action for deep swipe
      if (!state.activeAction) {
        buttonPress(); // Haptic feedback when action becomes active
      }
    }

    setState(prev => ({
      ...prev,
      isSwipeActive: absSwipeDistance > 0,
      swipeDistance,
      swipeDirection: direction,
      revealedActions: availableActions,
      activeAction,
    }));
  }, [disabled, state.canSwipe, state.isSwipeActive, state.activeAction, getActionsForDirection, calculateSwipeDistance, snapThreshold, threshold, buttonPress]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (disabled || !state.isSwipeActive) {
      setState(prev => ({
        ...prev,
        canSwipe: false,
      }));
      return;
    }

    const shouldExecuteAction = state.activeAction && Math.abs(state.swipeDistance) >= snapThreshold - threshold;

    if (shouldExecuteAction && state.activeAction) {
      // Execute the action
      warning(); // Haptic feedback for action execution

      try {
        await state.activeAction.onAction();
      } catch (error) {
        console.error('Swipe action failed:', error);
      }

      // Reset state
      setState(prev => ({
        ...prev,
        isSwipeActive: false,
        swipeDistance: 0,
        swipeDirection: null,
        revealedActions: [],
        activeAction: null,
        canSwipe: false,
      }));
    } else {
      // Snap back without executing action
      setState(prev => ({
        ...prev,
        isSwipeActive: false,
        swipeDistance: 0,
        swipeDirection: null,
        revealedActions: [],
        activeAction: null,
        canSwipe: false,
      }));
    }
  }, [disabled, state.isSwipeActive, state.activeAction, state.swipeDistance, snapThreshold, threshold, warning]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Reset state when disabled
  useEffect(() => {
    if (disabled) {
      setState({
        isSwipeActive: false,
        swipeDistance: 0,
        swipeDirection: null,
        revealedActions: [],
        activeAction: null,
        canSwipe: false,
      });
    }
  }, [disabled]);

  // Get container transform style
  const getContainerStyle = useCallback(() => {
    if (!state.isSwipeActive) return {};

    return {
      transform: `translateX(${state.swipeDistance}px)`,
      transition: 'none', // No transition during swipe
    };
  }, [state.isSwipeActive, state.swipeDistance]);

  // Get snap back style
  const getSnapBackStyle = useCallback(() => {
    if (state.isSwipeActive) return {};

    return {
      transform: 'translateX(0px)',
      transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  }, [state.isSwipeActive]);

  // Get actions style for left side
  const getLeftActionsStyle = useCallback(() => {
    const distance = state.swipeDirection === 'right' ? Math.max(0, state.swipeDistance) : 0;
    return {
      transform: `translateX(${-threshold + Math.min(distance, maxDistance - threshold)}px)`,
      opacity: distance > 0 ? 1 : 0,
    };
  }, [state.swipeDirection, state.swipeDistance, threshold, maxDistance]);

  // Get actions style for right side
  const getRightActionsStyle = useCallback(() => {
    const distance = state.swipeDirection === 'left' ? Math.max(0, -state.swipeDistance) : 0;
    return {
      transform: `translateX(${threshold - Math.min(distance, maxDistance - threshold)}px)`,
      opacity: distance > 0 ? 1 : 0,
    };
  }, [state.swipeDirection, state.swipeDistance, threshold, maxDistance]);

  return {
    // Refs
    elementRef,

    // State
    ...state,

    // Progress
    progress: Math.abs(state.swipeDistance) / (maxDistance - threshold),

    // Styles
    containerStyle: state.isSwipeActive ? getContainerStyle() : getSnapBackStyle(),
    leftActionsStyle: getLeftActionsStyle(),
    rightActionsStyle: getRightActionsStyle(),

    // Utilities
    getActionColorClasses,
    isActive: state.isSwipeActive,

    // Manual reset
    resetSwipe: useCallback(() => {
      setState({
        isSwipeActive: false,
        swipeDistance: 0,
        swipeDirection: null,
        revealedActions: [],
        activeAction: null,
        canSwipe: false,
      });
    }, []),
  };
};