import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

export type GestureType =
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "pinch-in"
  | "pinch-out"
  | "long-press"
  | "double-tap"
  | "three-finger-tap";

export type GestureAction =
  | "back"
  | "forward"
  | "close-modal"
  | "open-menu"
  | "refresh"
  | "zoom-in"
  | "zoom-out"
  | "context-menu"
  | "quick-action"
  | "accessibility-menu";

export interface GestureConfig {
  enabled: boolean;
  swipeThreshold?: number; // pixels
  longPressThreshold?: number; // milliseconds
  pinchThreshold?: number; // scale factor
  preventDefault?: boolean;
  respectReducedMotion?: boolean;
  debugMode?: boolean;
}

export interface GestureMapping {
  gesture: GestureType;
  action: GestureAction;
  condition?: () => boolean;
  customHandler?: () => void;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

export interface GestureState {
  isTracking: boolean;
  currentGesture: GestureType | null;
  touchPoints: Map<number, TouchPoint>;
  lastGesture: {
    type: GestureType;
    timestamp: number;
    data?: any;
  } | null;
}

const DEFAULT_GESTURE_MAPPINGS: GestureMapping[] = [
  {
    gesture: "swipe-right",
    action: "back",
    condition: () => window.history.length > 1,
  },
  {
    gesture: "swipe-left",
    action: "forward",
  },
  {
    gesture: "swipe-down",
    action: "refresh",
    condition: () => window.scrollY === 0,
  },
  {
    gesture: "swipe-up",
    action: "close-modal",
  },
  {
    gesture: "pinch-out",
    action: "zoom-in",
  },
  {
    gesture: "pinch-in",
    action: "zoom-out",
  },
  {
    gesture: "long-press",
    action: "context-menu",
  },
  {
    gesture: "double-tap",
    action: "quick-action",
  },
  {
    gesture: "three-finger-tap",
    action: "accessibility-menu",
  },
];

/**
 * Hook for implementing gesture-based navigation and interactions
 * Supports touch gestures, accessibility features, and customizable mappings
 */
export function useGestureNavigation(
  targetRef?: React.RefObject<HTMLElement>,
  customMappings: GestureMapping[] = [],
  config: Partial<GestureConfig> = {}
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageTransition, success, buttonPress } = useHapticFeedback();
  // Analytics temporarily disabled
  const trackEvent = () => {};

  const defaultConfig: GestureConfig = {
    enabled: true,
    swipeThreshold: 50,
    longPressThreshold: 800,
    pinchThreshold: 0.2,
    preventDefault: true,
    respectReducedMotion: true,
    debugMode: false,
    ...config,
  };

  const [state, setState] = useState<GestureState>({
    isTracking: false,
    currentGesture: null,
    touchPoints: new Map(),
    lastGesture: null,
  });

  const gestureTimeoutRef = useRef<number>();
  const longPressTimeoutRef = useRef<number>();
  const doubleTapTimeoutRef = useRef<number>();
  const lastTapTimeRef = useRef<number>(0);

  // Combine default and custom gesture mappings
  const gestureMappings = [...DEFAULT_GESTURE_MAPPINGS, ...customMappings];

  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gesturesEnabled = defaultConfig.enabled &&
                         (!prefersReducedMotion || !defaultConfig.respectReducedMotion);

  // Get touch coordinates
  const getTouchPoint = useCallback((touch: Touch): TouchPoint => {
    return {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate swipe direction and distance
  const getSwipeData = useCallback((startPoint: TouchPoint, endPoint: TouchPoint) => {
    const deltaX = endPoint.x - startPoint.startX;
    const deltaY = endPoint.y - startPoint.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    let direction: GestureType | null = null;

    if (distance > defaultConfig.swipeThreshold!) {
      if (Math.abs(angle) < 45) {
        direction = "swipe-right";
      } else if (Math.abs(angle) > 135) {
        direction = "swipe-left";
      } else if (angle > 45 && angle < 135) {
        direction = "swipe-down";
      } else if (angle < -45 && angle > -135) {
        direction = "swipe-up";
      }
    }

    return { direction, distance, deltaX, deltaY, angle };
  }, [defaultConfig.swipeThreshold]);

  // Execute gesture action
  const executeGestureAction = useCallback((gesture: GestureType, data?: any) => {
    const mapping = gestureMappings.find(m => m.gesture === gesture);
    if (!mapping) return false;

    // Check condition if provided
    if (mapping.condition && !mapping.condition()) {
      if (defaultConfig.debugMode) {
        console.log(`Gesture ${gesture} condition not met`);
      }
      return false;
    }

    // Execute custom handler if provided
    if (mapping.customHandler) {
      mapping.customHandler();
      return true;
    }

    // Execute built-in actions
    switch (mapping.action) {
      case "back":
        if (window.history.length > 1) {
          navigate(-1);
          pageTransition();
        }
        break;

      case "forward":
        navigate(1);
        pageTransition();
        break;

      case "refresh":
        window.location.reload();
        break;

      case "close-modal":
        // Dispatch custom event for modal close
        window.dispatchEvent(new CustomEvent("gesture-close-modal"));
        buttonPress();
        break;

      case "open-menu":
        // Dispatch custom event for menu open
        window.dispatchEvent(new CustomEvent("gesture-open-menu"));
        buttonPress();
        break;

      case "zoom-in":
        // Dispatch custom event for zoom
        window.dispatchEvent(new CustomEvent("gesture-zoom", { detail: { direction: "in", scale: data?.scale } }));
        buttonPress();
        break;

      case "zoom-out":
        // Dispatch custom event for zoom
        window.dispatchEvent(new CustomEvent("gesture-zoom", { detail: { direction: "out", scale: data?.scale } }));
        buttonPress();
        break;

      case "context-menu":
        // Dispatch custom event for context menu
        window.dispatchEvent(new CustomEvent("gesture-context-menu", { detail: data }));
        buttonPress();
        break;

      case "quick-action":
        // Dispatch custom event for quick action
        window.dispatchEvent(new CustomEvent("gesture-quick-action"));
        success();
        break;

      case "accessibility-menu":
        // Dispatch custom event for accessibility menu
        window.dispatchEvent(new CustomEvent("gesture-accessibility-menu"));
        buttonPress();
        break;

      default:
        return false;
    }

    // Track gesture usage
    trackEvent("gesture_navigation", "engagement", {
      gesture,
      action: mapping.action,
      page: location.pathname,
      data,
      timestamp: new Date().toISOString(),
    });

    if (defaultConfig.debugMode) {
      console.log(`Executed gesture: ${gesture} -> ${mapping.action}`, data);
    }

    return true;
  }, [
    gestureMappings,
    defaultConfig.debugMode,
    navigate,
    pageTransition,
    buttonPress,
    success,
    trackEvent,
    location.pathname,
  ]);

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled) return;

    const touches = Array.from(event.touches);
    const newTouchPoints = new Map(state.touchPoints);

    touches.forEach(touch => {
      const point = getTouchPoint(touch);
      newTouchPoints.set(touch.identifier, point);
    });

    setState(prev => ({
      ...prev,
      isTracking: true,
      touchPoints: newTouchPoints,
    }));

    // Handle long press detection
    if (touches.length === 1) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = window.setTimeout(() => {
        const gesture: GestureType = "long-press";
        const touch = touches[0];
        executeGestureAction(gesture, {
          x: touch.clientX,
          y: touch.clientY,
          target: event.target,
        });

        setState(prev => ({
          ...prev,
          currentGesture: gesture,
          lastGesture: { type: gesture, timestamp: Date.now() },
        }));
      }, defaultConfig.longPressThreshold);
    }

    // Handle double tap detection
    if (touches.length === 1) {
      const now = Date.now();
      const timeDiff = now - lastTapTimeRef.current;

      if (timeDiff < 300) {
        clearTimeout(doubleTapTimeoutRef.current);
        const gesture: GestureType = "double-tap";
        executeGestureAction(gesture, {
          x: touches[0].clientX,
          y: touches[0].clientY,
          target: event.target,
        });

        setState(prev => ({
          ...prev,
          currentGesture: gesture,
          lastGesture: { type: gesture, timestamp: Date.now() },
        }));
      }

      lastTapTimeRef.current = now;
    }

    // Handle three-finger tap
    if (touches.length === 3) {
      const gesture: GestureType = "three-finger-tap";
      executeGestureAction(gesture, {
        touches: touches.map(t => ({ x: t.clientX, y: t.clientY })),
        target: event.target,
      });

      setState(prev => ({
        ...prev,
        currentGesture: gesture,
        lastGesture: { type: gesture, timestamp: Date.now() },
      }));
    }

    if (defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [
    gesturesEnabled,
    state.touchPoints,
    getTouchPoint,
    defaultConfig.longPressThreshold,
    defaultConfig.preventDefault,
    executeGestureAction,
  ]);

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled || !state.isTracking) return;

    const touches = Array.from(event.touches);
    const updatedTouchPoints = new Map(state.touchPoints);

    touches.forEach(touch => {
      const existingPoint = updatedTouchPoints.get(touch.identifier);
      if (existingPoint) {
        updatedTouchPoints.set(touch.identifier, {
          ...existingPoint,
          x: touch.clientX,
          y: touch.clientY,
        });
      }
    });

    setState(prev => ({
      ...prev,
      touchPoints: updatedTouchPoints,
    }));

    // Handle pinch gestures (two fingers)
    if (touches.length === 2) {
      const touchArray = Array.from(updatedTouchPoints.values());
      if (touchArray.length >= 2) {
        const point1 = touchArray[0];
        const point2 = touchArray[1];

        const currentDistance = getDistance(point1, point2);
        const startDistance = getDistance(
          { ...point1, x: point1.startX, y: point1.startY } as TouchPoint,
          { ...point2, x: point2.startX, y: point2.startY } as TouchPoint
        );

        const scale = currentDistance / startDistance;
        const scaleDiff = Math.abs(scale - 1);

        if (scaleDiff > defaultConfig.pinchThreshold!) {
          const gesture: GestureType = scale > 1 ? "pinch-out" : "pinch-in";

          // Throttle pinch events
          clearTimeout(gestureTimeoutRef.current);
          gestureTimeoutRef.current = window.setTimeout(() => {
            executeGestureAction(gesture, { scale, currentDistance, startDistance });

            setState(prev => ({
              ...prev,
              currentGesture: gesture,
              lastGesture: { type: gesture, timestamp: Date.now(), data: { scale } },
            }));
          }, 100);
        }
      }
    }

    // Clear long press timeout on move
    clearTimeout(longPressTimeoutRef.current);

    if (defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [
    gesturesEnabled,
    state.isTracking,
    state.touchPoints,
    getDistance,
    defaultConfig.pinchThreshold,
    defaultConfig.preventDefault,
    executeGestureAction,
  ]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled) return;

    const remainingTouches = Array.from(event.touches);
    const endedTouchPoints = Array.from(state.touchPoints.values()).filter(
      point => !remainingTouches.some(touch => touch.identifier === point.id)
    );

    // Handle swipe gestures (single finger)
    if (endedTouchPoints.length === 1 && state.touchPoints.size === 1) {
      const point = endedTouchPoints[0];
      const currentPoint = { ...point, x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
      const swipeData = getSwipeData(point, currentPoint);

      if (swipeData.direction) {
        executeGestureAction(swipeData.direction, swipeData);

        setState(prev => ({
          ...prev,
          currentGesture: swipeData.direction,
          lastGesture: { type: swipeData.direction!, timestamp: Date.now(), data: swipeData },
        }));
      }
    }

    // Update touch points
    const updatedTouchPoints = new Map(state.touchPoints);
    endedTouchPoints.forEach(point => {
      updatedTouchPoints.delete(point.id);
    });

    setState(prev => ({
      ...prev,
      isTracking: updatedTouchPoints.size > 0,
      touchPoints: updatedTouchPoints,
      currentGesture: updatedTouchPoints.size > 0 ? prev.currentGesture : null,
    }));

    // Clear timeouts
    clearTimeout(longPressTimeoutRef.current);
    clearTimeout(gestureTimeoutRef.current);

    if (defaultConfig.preventDefault) {
      event.preventDefault();
    }
  }, [
    gesturesEnabled,
    state.touchPoints,
    getSwipeData,
    executeGestureAction,
    defaultConfig.preventDefault,
  ]);

  // Attach event listeners
  useEffect(() => {
    if (!gesturesEnabled) return;

    const target = targetRef?.current || document;

    target.addEventListener('touchstart', handleTouchStart, { passive: !defaultConfig.preventDefault });
    target.addEventListener('touchmove', handleTouchMove, { passive: !defaultConfig.preventDefault });
    target.addEventListener('touchend', handleTouchEnd, { passive: !defaultConfig.preventDefault });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(longPressTimeoutRef.current);
      clearTimeout(gestureTimeoutRef.current);
      clearTimeout(doubleTapTimeoutRef.current);
    };
  }, [
    gesturesEnabled,
    targetRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    defaultConfig.preventDefault,
  ]);

  // Manually trigger gesture
  const triggerGesture = useCallback((gesture: GestureType, data?: any) => {
    return executeGestureAction(gesture, data);
  }, [executeGestureAction]);

  // Add custom gesture mapping
  const addGestureMapping = useCallback((mapping: GestureMapping) => {
    gestureMappings.push(mapping);
  }, [gestureMappings]);

  return {
    // State
    ...state,
    isEnabled: gesturesEnabled,
    config: defaultConfig,

    // Actions
    triggerGesture,
    addGestureMapping,

    // Gesture mappings
    mappings: gestureMappings,
  };
}

// Specialized hooks for specific gesture patterns
export function useSwipeNavigation() {
  const navigate = useNavigate();
  const { pageTransition } = useHapticFeedback();

  return useGestureNavigation(undefined, [
    {
      gesture: "swipe-right",
      action: "back",
      customHandler: () => {
        navigate(-1);
        pageTransition();
      },
    },
    {
      gesture: "swipe-left",
      action: "forward",
      customHandler: () => {
        navigate(1);
        pageTransition();
      },
    },
  ]);
}

export function useModalGestures(onClose?: () => void) {
  return useGestureNavigation(undefined, [
    {
      gesture: "swipe-down",
      action: "close-modal",
      customHandler: onClose,
    },
    {
      gesture: "swipe-up",
      action: "close-modal",
      customHandler: onClose,
    },
  ]);
}