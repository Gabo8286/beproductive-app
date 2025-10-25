import { useCallback, useRef, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface GestureConfig {
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinch?: (scale: number) => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  enableHaptics?: boolean;
}

export interface GestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  moved: boolean;
}

export const useGestureSupport = (config: GestureConfig): GestureHandlers => {
  const { buttonPress, impactLight, impactMedium } = useHapticFeedback();
  const touchDataRef = useRef<TouchData | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseDownRef = useRef(false);

  const {
    onTap,
    onLongPress,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    longPressDelay = 500,
    swipeThreshold = 50,
    enableHaptics = true
  } = config;

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const startLongPressTimer = useCallback(() => {
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (enableHaptics) {
          impactMedium();
        }
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, enableHaptics, impactMedium]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    touchDataRef.current = {
      startX: clientX,
      startY: clientY,
      startTime: Date.now(),
      moved: false
    };

    startLongPressTimer();
  }, [startLongPressTimer]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!touchDataRef.current) return;

    const deltaX = Math.abs(clientX - touchDataRef.current.startX);
    const deltaY = Math.abs(clientY - touchDataRef.current.startY);

    // If moved significantly, clear long press timer and mark as moved
    if (deltaX > 10 || deltaY > 10) {
      touchDataRef.current.moved = true;
      clearLongPressTimer();
    }
  }, [clearLongPressTimer]);

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    clearLongPressTimer();

    if (!touchDataRef.current) return;

    const { startX, startY, startTime, moved } = touchDataRef.current;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    const deltaTime = Date.now() - startTime;

    // Check for swipe gestures
    if (moved && deltaTime < 500) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > swipeThreshold || absY > swipeThreshold) {
        if (enableHaptics) {
          impactLight();
        }

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          } else if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          }
        }
        return;
      }
    }

    // Handle tap if not moved and was quick
    if (!moved && deltaTime < 300 && onTap) {
      if (enableHaptics) {
        buttonPress();
      }
      onTap();
    }

    touchDataRef.current = null;
  }, [clearLongPressTimer, swipeThreshold, enableHaptics, impactLight, buttonPress, onTap, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  }, [handleEnd]);

  // Mouse handlers (for desktop testing)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMouseDownRef.current) {
      handleMove(e.clientX, e.clientY);
    }
  }, [handleMove]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      handleEnd(e.clientX, e.clientY);
    }
  }, [handleEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp
  };
};

// Enhanced hook for action sheet specific gestures
export const useActionSheetGestures = (
  onOpen: () => void,
  onClose: () => void,
  onCycleType?: () => void
) => {
  const { buttonPress, impactMedium } = useHapticFeedback();

  return useGestureSupport({
    onTap: () => {
      buttonPress();
      onOpen();
    },
    onLongPress: () => {
      impactMedium();
      if (onCycleType) {
        onCycleType();
      }
    },
    onSwipeUp: onOpen,
    onSwipeDown: onClose,
    longPressDelay: 600,
    swipeThreshold: 30,
    enableHaptics: true
  });
};