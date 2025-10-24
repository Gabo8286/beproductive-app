import { useState, useCallback, useEffect } from 'react';
import { lunaSize } from '@/components/luna/design/DesignTokens';

export type CornerPosition = 'bottomRight' | 'bottomLeft';

const CORNER_PREFERENCE_KEY = 'luna-corner-preference';

/**
 * Hook to manage Luna button corner positioning preference
 * Handles persistence, drag-to-switch functionality, and smooth transitions
 */
export const useCornerPreference = () => {
  // Load initial preference from localStorage
  const [cornerPreference, setCornerPreference] = useState<CornerPosition>(() => {
    try {
      const saved = localStorage.getItem(CORNER_PREFERENCE_KEY);
      return (saved as CornerPosition) || 'bottomRight';
    } catch {
      return 'bottomRight';
    }
  });

  // Drag state for corner switching
  const [isDraggingCorner, setIsDraggingCorner] = useState(false);
  const [dragTransitionProgress, setDragTransitionProgress] = useState(0);

  // Persist corner preference
  const persistCornerPreference = useCallback((corner: CornerPosition) => {
    try {
      localStorage.setItem(CORNER_PREFERENCE_KEY, corner);
    } catch (error) {
      console.warn('Failed to persist corner preference:', error);
    }
  }, []);

  // Switch to specific corner
  const switchToCorner = useCallback((corner: CornerPosition) => {
    setCornerPreference(corner);
    persistCornerPreference(corner);
    setDragTransitionProgress(0);
    setIsDraggingCorner(false);
  }, [persistCornerPreference]);

  // Start corner drag operation
  const startCornerDrag = useCallback(() => {
    setIsDraggingCorner(true);
    setDragTransitionProgress(0);
  }, []);

  // Update drag progress during corner switching
  const updateCornerDragProgress = useCallback((progress: number) => {
    setDragTransitionProgress(Math.max(0, Math.min(1, progress)));
  }, []);

  // Complete corner drag operation
  const completeCornerDrag = useCallback((targetCorner: CornerPosition | null) => {
    if (targetCorner && targetCorner !== cornerPreference) {
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      switchToCorner(targetCorner);
    } else {
      // Reset if no valid target
      setDragTransitionProgress(0);
      setIsDraggingCorner(false);
    }
  }, [cornerPreference, switchToCorner]);

  // Cancel corner drag operation
  const cancelCornerDrag = useCallback(() => {
    setIsDraggingCorner(false);
    setDragTransitionProgress(0);
  }, []);

  // Force reset Luna FAB to corner position (emergency reset)
  const forceResetToCorner = useCallback(() => {
    console.log('🔧 Force resetting Luna FAB to corner position');
    setIsDraggingCorner(false);
    setDragTransitionProgress(0);
    // Optionally reset to default corner
    // setCornerPreference('bottomRight');
  }, []);

  // Toggle between corners (for accessibility/keyboard users)
  const toggleCorner = useCallback(() => {
    const newCorner = cornerPreference === 'bottomRight' ? 'bottomLeft' : 'bottomRight';
    switchToCorner(newCorner);
  }, [cornerPreference, switchToCorner]);

  // Get corner-specific styling properties
  const getCornerStyles = useCallback((screenWidth: number) => {
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;

    const offset = isMobile
      ? lunaSize.corner.offset.mobile
      : isTablet
      ? lunaSize.corner.offset.tablet
      : lunaSize.corner.offset.desktop;

    // Debug logging for positioning calculations
    console.log('🔍 Luna FAB Positioning Debug:', {
      screenWidth,
      isMobile,
      isTablet,
      cornerPreference,
      offset,
      isDraggingCorner,
      dragTransitionProgress,
      lunaSize: lunaSize.corner
    });

    // Base styles for current corner
    const baseStyles = {
      bottom: offset,
      [cornerPreference === 'bottomLeft' ? 'left' : 'right']: offset,
    };

    console.log('📍 Base positioning styles:', baseStyles);

    // Add transition effects if dragging
    if (isDraggingCorner && dragTransitionProgress > 0) {
      console.warn('⚠️ Luna FAB in DRAGGING STATE - This may cause centering!', {
        isDraggingCorner,
        dragTransitionProgress,
        cornerPreference
      });

      const centerX = screenWidth / 2;
      const currentX = cornerPreference === 'bottomLeft'
        ? offset + lunaSize.center / 2
        : screenWidth - offset - lunaSize.center / 2;

      // Calculate transition position
      const targetX = cornerPreference === 'bottomLeft'
        ? screenWidth - offset - lunaSize.center / 2
        : offset + lunaSize.center / 2;

      const transitionX = currentX + (targetX - currentX) * dragTransitionProgress;

      const transitionStyles = {
        bottom: offset,
        left: transitionX - lunaSize.center / 2,
        right: 'auto',
        transform: `scale(${1 + dragTransitionProgress * 0.1})`,
        opacity: 0.8 + dragTransitionProgress * 0.2,
      };

      console.log('🔄 Transition positioning styles:', transitionStyles);
      return transitionStyles;
    }

    return baseStyles;
  }, [cornerPreference, isDraggingCorner, dragTransitionProgress]);

  // Auto-save preference changes
  useEffect(() => {
    persistCornerPreference(cornerPreference);
  }, [cornerPreference, persistCornerPreference]);

  return {
    // State
    cornerPreference,
    isDraggingCorner,
    dragTransitionProgress,

    // Actions
    switchToCorner,
    toggleCorner,
    startCornerDrag,
    updateCornerDragProgress,
    completeCornerDrag,
    cancelCornerDrag,
    forceResetToCorner,

    // Utilities
    getCornerStyles,
  };
};