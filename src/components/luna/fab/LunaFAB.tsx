import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { LunaOrbitalButtons } from '@/components/luna/fab/LunaOrbitalButtons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useLuna } from '@/components/luna/context/LunaContext';
import { useCornerPreference } from '@/hooks/useCornerPreference';
import { getTargetCorner, getCornerTransitionProgress } from '@/components/luna/design/DesignTokens';

interface LunaFABProps {
  onOpenCarousel?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showOrbitalButtons?: boolean; // Enable/disable orbital buttons mode
}

export const LunaFAB: React.FC<LunaFABProps> = ({
  onOpenCarousel,
  className,
  size = 'medium',
  showOrbitalButtons = true
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { openChat } = useLuna();
  const {
    cornerPreference,
    isDraggingCorner,
    startCornerDrag,
    updateCornerDragProgress,
    completeCornerDrag,
    cancelCornerDrag,
    forceResetToCorner,
    getCornerStyles
  } = useCornerPreference();

  const fabRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragCurrent = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDragging = useRef<boolean>(false);
  const isLongPressing = useRef<boolean>(false);
  const preventClick = useRef<boolean>(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showOrbitalButtonsState, setShowOrbitalButtonsState] = useState(false);
  const [fabCenter, setFabCenter] = useState({ x: 0, y: 0 });

  // Configuration based on size
  const sizeConfig = {
    small: { size: 40, longPressDuration: 800, dragThreshold: 30 },
    medium: { size: 48, longPressDuration: 800, dragThreshold: 35 },
    large: { size: 56, longPressDuration: 700, dragThreshold: 40 }
  };

  const config = sizeConfig[size];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force reset Luna FAB position on mount to ensure corner positioning
  useEffect(() => {
    console.log('🚀 Luna FAB mounted - forcing reset to corner position');
    forceResetToCorner();
  }, [forceResetToCorner]);

  // Debug orbital buttons state
  useEffect(() => {
    console.log('🌟 showOrbitalButtonsState changed:', showOrbitalButtonsState, 'fabCenter:', fabCenter);
  }, [showOrbitalButtonsState, fabCenter]);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number, isTouch: boolean = false) => {
    const now = Date.now();
    dragStart.current = { x: clientX, y: clientY, time: now };
    dragCurrent.current = { x: clientX, y: clientY, time: now };
    isDragging.current = true;
    preventClick.current = false;

    // Start corner drag tracking
    startCornerDrag();

    if (isTouch) {
      triggerHaptic('light');
    }
  }, [triggerHaptic, startCornerDrag]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStart.current || !isDragging.current) return;

    const now = Date.now();
    dragCurrent.current = { x: clientX, y: clientY, time: now };

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > config.dragThreshold) {
      preventClick.current = true;

      // Check if this is horizontal drag for corner switching
      const isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;

      if (isHorizontalDrag) {
        // Handle corner switching
        const progress = getCornerTransitionProgress(clientX, screenWidth, cornerPreference);
        updateCornerDragProgress(progress);

        // Provide haptic feedback on significant progress
        if (progress > 0.5) {
          triggerHaptic('light');
        }
      } else {
        // Handle directional gestures (vertical/diagonal)
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const normalizedAngle = angle < 0 ? angle + 360 : angle;

        // Determine direction
        if (normalizedAngle >= 315 || normalizedAngle < 45) {
          // Right - Context menu
          triggerHaptic('medium');
          onOpenCarousel();
          isDragging.current = false;
        } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
          // Up - Favorites
          triggerHaptic('medium');
          onOpenCarousel();
          isDragging.current = false;
        } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
          // Left - Search
          triggerHaptic('medium');
          onOpenCarousel();
          isDragging.current = false;
        }
      }
    }
  }, [config.dragThreshold, triggerHaptic, onOpenCarousel, screenWidth, cornerPreference, updateCornerDragProgress]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDraggingCorner && dragCurrent.current) {
      // Determine target corner based on final drag position
      const targetCorner = getTargetCorner(dragCurrent.current.x, screenWidth);
      completeCornerDrag(targetCorner);
    } else {
      cancelCornerDrag();
    }

    isDragging.current = false;
    dragStart.current = null;
    dragCurrent.current = null;
  }, [isDraggingCorner, screenWidth, completeCornerDrag, cancelCornerDrag]);

  // Handle long press start
  const handleLongPressStart = useCallback(() => {
    isLongPressing.current = true;

    longPressTimer.current = setTimeout(() => {
      if (isLongPressing.current) {
        triggerHaptic('medium');
        openChat();
        isLongPressing.current = false;
      }
    }, config.longPressDuration);
  }, [config.longPressDuration, triggerHaptic, openChat]);

  // Handle long press end
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPressing.current = false;
  }, []);

  // Calculate FAB center position for orbital buttons
  const updateFabCenter = useCallback(() => {
    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      const newCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      console.log('📍 FAB center calculated:', newCenter, 'rect:', rect);

      // Update if we have valid measurements
      if (rect.width > 0 && rect.height > 0) {
        setFabCenter(newCenter);
        return newCenter;
      }
    }
    // Return current center if no update
    return fabCenter;
  }, [fabCenter]);

  // Update center on mount and resize with proper timing
  useEffect(() => {
    // Initial update with delay to ensure rendering is complete
    const timer = setTimeout(() => {
      updateFabCenter();
    }, 100);

    // Also update immediately
    updateFabCenter();

    window.addEventListener('resize', updateFabCenter);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateFabCenter);
    };
  }, [updateFabCenter]);

  // Handle tap - show orbital buttons or carousel
  const handleTap = useCallback(() => {
    if (preventClick.current) {
      preventClick.current = false;
      return;
    }

    triggerHaptic();

    if (showOrbitalButtons) {
      console.log('🎯 Luna FAB tapped, showing orbital buttons');

      // Calculate center immediately and show buttons
      const center = updateFabCenter();
      console.log('📍 Using center for orbital buttons:', center);
      setShowOrbitalButtonsState(true);
    } else {
      console.log('🎯 Luna FAB tapped, opening carousel');
      onOpenCarousel?.();
    }
  }, [triggerHaptic, updateFabCenter, showOrbitalButtons, onOpenCarousel]);

  // Handle orbital buttons close
  const handleCloseOrbitalButtons = useCallback(() => {
    setShowOrbitalButtonsState(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Get dynamic positioning styles
  const positionStyles = getCornerStyles(screenWidth);

  return (
    <>
      <motion.button
        ref={fabRef}
        className={cn(
          'fixed z-50 rounded-full shadow-lg border-2 border-white',
          'flex items-center justify-center cursor-pointer',
          'transition-all duration-300 ease-out',
          'bg-gradient-to-br from-blue-500 to-purple-600',
          'dark:from-blue-600 dark:to-purple-700',
          'hover:scale-105 active:scale-95',
          'touch-manipulation select-none',
          isDraggingCorner && 'z-50', // Maintain z-index when dragging
          className
        )}
        style={{
          width: config.size,
          height: config.size,
          ...positionStyles,
        }}
        onClick={handleTap}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleLongPressStart();
          handleDragStart(touch.clientX, touch.clientY, true);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleLongPressEnd();
          handleDragEnd();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleLongPressEnd();
          handleDragEnd();
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressStart();
            handleDragStart(e.clientX, e.clientY, false);
          }
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse') {
            handleDragMove(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressEnd();
            handleDragEnd();
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressEnd();
            handleDragEnd();
          }
        }}
      whileHover={{
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      role="button"
      aria-label="Open Luna menu or long press for chat"
      tabIndex={0}
    >
      <AnimatePresence mode="wait">
        {isLongPressing.current ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <MessageSquare size={config.size * 0.4} className="text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="luna"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <LunaAvatar size="small" className="text-white" animated={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Long press progress indicator */}
      <AnimatePresence>
        {isLongPressing.current && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: 1.2,
              opacity: [0, 1, 0],
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{
              duration: config.longPressDuration / 1000,
              ease: 'linear',
            }}
          />
        )}
      </AnimatePresence>

      {/* Corner switching indicator */}
      <AnimatePresence>
        {isDraggingCorner && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: 1.3,
              opacity: 0.8,
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* Corner switching guide */}
      <AnimatePresence>
        {isDraggingCorner && (
          <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            Drag to {cornerPreference === 'bottomRight' ? 'left' : 'right'} corner
          </motion.div>
        )}
      </AnimatePresence>
      </motion.button>

      {/* Orbital Buttons */}
      {showOrbitalButtons && (
        <LunaOrbitalButtons
          isVisible={showOrbitalButtonsState}
          centerX={fabCenter.x}
          centerY={fabCenter.y}
          radius={80}
          onClose={handleCloseOrbitalButtons}
        />
      )}
    </>
  );
};