import { useState, useCallback, useRef, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { CarouselState, CarouselPosition, CarouselCategory, CarouselItem, CarouselConfig, DragDirection } from '@/components/luna/carousel/types';
import {
  lunaSize,
  getCornerFABPosition,
  getCornerArcPositions,
  validateCornerMenuBounds
} from '@/components/luna/design/DesignTokens';

const DEFAULT_CONFIG: CarouselConfig = {
  radius: 120, // Will be overridden by mobile-optimized corner radius
  centerSize: 60,
  buttonSize: 48,
  animationDuration: 300,
  longPressDuration: 800, // Increased for mobile
  hapticEnabled: true,
  dragThreshold: 40, // Increased for mobile precision
  dragSensitivity: 1.2, // Reduced for better mobile control
};

export const useLunaCarousel = (
  categories: CarouselCategory[],
  config: Partial<CarouselConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { triggerHaptic } = useHapticFeedback();

  const [state, setState] = useState<CarouselState>({
    activeCategory: null,
    isExpanded: false,
    rotation: 0,
    chatOpen: false,
    isLongPressing: false,
    dragOffset: 0,
    isDragging: false,
    dragDirection: null,
    showContextMenu: false,
    showFavorites: false,
    showSearch: false,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const dragStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragCurrent = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchStarted = useRef<boolean>(false);
  const preventClick = useRef<boolean>(false);

  // Calculate button positions around the circle with perfect distribution
  const calculatePositions = useCallback((items: CarouselCategory[] | CarouselItem[]): CarouselPosition[] => {
    const count = items.length;
    if (count === 0) return [];

    return items.map((_, index) => {
      // Start from top and distribute evenly
      // -90° to start from top, then space evenly
      const angle = (360 / count) * index - 90;
      const radian = (angle * Math.PI) / 180;

      // Calculate exact positions on the circle
      const x = Math.cos(radian) * finalConfig.radius;
      const y = Math.sin(radian) * finalConfig.radius;

      return {
        x: Math.round(x * 100) / 100, // Round to 2 decimal places for precision
        y: Math.round(y * 100) / 100,
        angle,
        index,
      };
    });
  }, [finalConfig.radius]);

  // Get current items to display (categories or items within a category)
  const getCurrentItems = useCallback((): (CarouselCategory | CarouselItem)[] => {
    if (!state.activeCategory) {
      return categories;
    }

    const category = categories.find(cat => cat.id === state.activeCategory);
    return category?.items || [];
  }, [categories, state.activeCategory]);

  const currentPositions = calculatePositions(getCurrentItems());

  // Handle category/item selection
  const handleItemSelect = useCallback((item: CarouselCategory | CarouselItem) => {
    if (finalConfig.hapticEnabled) {
      triggerHaptic();
    }

    // Check if it's a category (has 'items' property)
    if ('items' in item) {
      // It's a category - expand to show items
      setState(prev => ({
        ...prev,
        activeCategory: item.id,
        isExpanded: true,
      }));
    } else {
      // It's an item - execute action
      item.action();

      // Close carousel after action
      setState(prev => ({
        ...prev,
        activeCategory: null,
        isExpanded: false,
      }));
    }
  }, [finalConfig.hapticEnabled, triggerHaptic]);

  // Handle going back to categories
  const handleBack = useCallback(() => {
    if (finalConfig.hapticEnabled) {
      triggerHaptic();
    }

    setState(prev => ({
      ...prev,
      activeCategory: null,
      isExpanded: false,
    }));
  }, [finalConfig.hapticEnabled, triggerHaptic]);

  // Long press handlers for Luna chat
  const handleLongPressStart = useCallback(() => {
    if (state.activeCategory) return; // Don't allow long press when expanded

    setState(prev => ({ ...prev, isLongPressing: true }));

    longPressTimer.current = setTimeout(() => {
      if (finalConfig.hapticEnabled) {
        triggerHaptic('medium');
      }

      setState(prev => ({
        ...prev,
        chatOpen: true,
        isLongPressing: false,
      }));
    }, finalConfig.longPressDuration);
  }, [state.activeCategory, finalConfig.hapticEnabled, finalConfig.longPressDuration, triggerHaptic]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    setState(prev => ({ ...prev, isLongPressing: false }));
  }, []);

  // Utility: Calculate drag direction
  const calculateDragDirection = useCallback((startX: number, startY: number, currentX: number, currentY: number): DragDirection => {
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < finalConfig.dragThreshold) return null;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Normalize angle to 0-360
    const normalizedAngle = angle < 0 ? angle + 360 : angle;

    // Determine direction based on angle ranges
    if (normalizedAngle >= 315 || normalizedAngle < 45) return 'right';
    if (normalizedAngle >= 45 && normalizedAngle < 135) return 'down';
    if (normalizedAngle >= 135 && normalizedAngle < 225) return 'left';
    if (normalizedAngle >= 225 && normalizedAngle < 315) return 'up';

    return null;
  }, [finalConfig.dragThreshold]);

  // Handle drag start with enhanced mobile support
  const handleDragStart = useCallback((clientX: number, clientY: number, isTouch: boolean = false) => {
    const now = Date.now();
    dragStart.current = { x: clientX, y: clientY, time: now };
    dragCurrent.current = { x: clientX, y: clientY, time: now };
    touchStarted.current = isTouch;
    preventClick.current = false;

    // Provide immediate haptic feedback on touch start
    if (isTouch && finalConfig.hapticEnabled) {
      triggerHaptic('light');
    }

    setState(prev => ({
      ...prev,
      isDragging: true,
      dragDirection: null,
      showContextMenu: false,
      showFavorites: false,
      showSearch: false,
    }));
  }, [finalConfig.hapticEnabled, triggerHaptic]);

  // Handle drag move with momentum and better feedback
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStart.current || !state.isDragging) return;

    const now = Date.now();
    dragCurrent.current = { x: clientX, y: clientY, time: now };

    const direction = calculateDragDirection(
      dragStart.current.x,
      dragStart.current.y,
      clientX,
      clientY
    );

    // Prevent accidental clicks when dragging
    if (direction) {
      preventClick.current = true;
    }

    // Provide haptic feedback when direction changes (only once per direction)
    if (direction && direction !== state.dragDirection && finalConfig.hapticEnabled && touchStarted.current) {
      triggerHaptic('light');
    }

    setState(prev => ({ ...prev, dragDirection: direction }));
  }, [state.isDragging, state.dragDirection, calculateDragDirection, finalConfig.hapticEnabled, triggerHaptic]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragStart.current || !dragCurrent.current || !state.isDragging) {
      setState(prev => ({ ...prev, isDragging: false, dragDirection: null }));
      return;
    }

    const direction = calculateDragDirection(
      dragStart.current.x,
      dragStart.current.y,
      dragCurrent.current.x,
      dragCurrent.current.y
    );

    if (direction && finalConfig.hapticEnabled) {
      triggerHaptic('medium');
    }

    // Execute directional actions
    switch (direction) {
      case 'right':
        setState(prev => ({
          ...prev,
          showContextMenu: true,
          isExpanded: true,
          isDragging: false,
          dragDirection: null
        }));
        break;
      case 'up':
        setState(prev => ({
          ...prev,
          showFavorites: true,
          isExpanded: true,
          isDragging: false,
          dragDirection: null
        }));
        break;
      case 'left':
        setState(prev => ({
          ...prev,
          showSearch: true,
          isExpanded: true,
          isDragging: false,
          dragDirection: null
        }));
        break;
      default:
        setState(prev => ({ ...prev, isDragging: false, dragDirection: null }));
    }

    dragStart.current = null;
    dragCurrent.current = null;
  }, [state.isDragging, calculateDragDirection, finalConfig.hapticEnabled, triggerHaptic]);

  // Handle rotation via drag (legacy)
  const handleDragUpdate = useCallback((offset: number) => {
    setState(prev => ({ ...prev, dragOffset: offset }));
  }, []);

  // Handle tap on Luna center button with click prevention
  const handleLunaTap = useCallback(() => {
    // Prevent click if user was dragging
    if (preventClick.current) {
      preventClick.current = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    lastTapTime.current = now;

    // Haptic feedback on tap
    if (finalConfig.hapticEnabled) {
      triggerHaptic();
    }

    // Double tap detection (within 300ms)
    if (timeSinceLastTap < 300) {
      setState(prev => ({ ...prev, chatOpen: true }));
      return;
    }

    // Single tap - toggle expansion or go back
    if (state.activeCategory) {
      handleBack();
    } else {
      setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
    }
  }, [state.activeCategory, handleBack, finalConfig.hapticEnabled, triggerHaptic]);

  // Close chat
  const handleCloseChat = useCallback(() => {
    setState(prev => ({ ...prev, chatOpen: false }));
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    state,
    config: finalConfig,
    currentItems: getCurrentItems(),
    currentPositions,
    actions: {
      handleItemSelect,
      handleBack,
      handleLongPressStart,
      handleLongPressEnd,
      handleDragStart,
      handleDragMove,
      handleDragEnd,
      handleDragUpdate,
      handleLunaTap,
      handleCloseChat,
    },
  };
};