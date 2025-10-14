import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLuna, useLunaFloat } from '../context/LunaContext';
import { LunaAvatar } from '../core/LunaAvatar';
import { LunaContextualMenu } from '../context/LunaContextualMenu';
import { LUNA_COLORS } from '@/assets/luna/luna-assets';

interface LunaFloatProps {
  className?: string;
  draggable?: boolean;
  showTooltip?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const LunaFloat: React.FC<LunaFloatProps> = ({
  className,
  draggable = false,
  showTooltip = true,
  autoHide = false,
  autoHideDelay = 10000, // 10 seconds
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);
  const [pointerDownPos, setPointerDownPos] = useState<{ x: number; y: number } | null>(null);
  const [radixReady, setRadixReady] = useState(false);

  const {
    currentExpression,
    hasUnreadMessages,
    currentContext,
    isOpen,
  } = useLuna();

  const {
    isFloating,
    floatPosition,
    showFloat,
    hideFloat,
    setFloatPosition,
  } = useLunaFloat();

  // Ensure React context is stable before showing Radix components
  useEffect(() => {
    const timer = setTimeout(() => setRadixReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && isFloating && !hasUnreadMessages) {
      const timer = setTimeout(() => {
        hideFloat();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, isFloating, hasUnreadMessages, hideFloat]);

  // Position the float based on floatPosition setting
  useEffect(() => {
    const updatePosition = () => {
      const padding = 20;
      const avatarSize = 60; // approximate size of the avatar

      switch (floatPosition) {
        case 'top-right':
          setPosition({
            x: window.innerWidth - avatarSize - padding,
            y: padding + 60, // Account for top navigation
          });
          break;
        case 'bottom-right':
          setPosition({
            x: window.innerWidth - avatarSize - padding,
            y: window.innerHeight - avatarSize - padding - 80, // Account for FAB
          });
          break;
        default:
          break;
      }
    };

    if (isFloating && !isDragging) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [floatPosition, isFloating, isDragging]);

  // Handle mouse/touch interactions for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;

    e.preventDefault();
    setHasMovedDuringDrag(false);
    setPointerDownPos({ x: e.clientX, y: e.clientY });
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });

    // Capture pointer for smooth dragging
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggable || !pointerDownPos) return;

    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    const distance = Math.hypot(dx, dy);
    const threshold = 5; // pixels

    if (!isDragging && distance > threshold) {
      setIsDragging(true);
      setHasMovedDuringDrag(true);
    }

    if (!isDragging) return;

    const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStart.y));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggable) return;

    // Release pointer capture if held
    const el = e.target as Element;
    const anyEl = el as any;
    try {
      if (anyEl?.hasPointerCapture && anyEl.hasPointerCapture(e.pointerId)) {
        anyEl.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (!isDragging && !hasMovedDuringDrag) {
      // Clicking is now handled by the contextual menu
      setPointerDownPos(null);
      return;
    }

    // End dragging and snap
    setIsDragging(false);
    setHasMovedDuringDrag(false);
    setPointerDownPos(null);

    // Snap to edges after dragging
    const centerX = window.innerWidth / 2;
    const newPosition = position.x < centerX ? 'bottom-left' : 'bottom-right';

    // Update the context position preference
    setFloatPosition(newPosition as any);
  };

  // Avatar click is now handled by the contextual menu

  const handleTooltipShow = () => {
    if (!isDragging && showTooltip) {
      setShowTooltipState(true);
    }
  };

  const handleTooltipHide = () => {
    setShowTooltipState(false);
  };

  if (!isFloating || floatPosition === 'hidden') {
    return null;
  }

  return (
    <>
      {/* Floating Avatar */}
      <div
        className={cn(
          'fixed z-50 select-none transition-all duration-300 ease-out',
          isDragging ? 'scale-110 cursor-grabbing' : 'cursor-pointer hover:scale-105',
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)',
        }}
        // Click handling is now managed by the contextual menu
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={handleTooltipShow}
        onMouseLeave={handleTooltipHide}
      >
        {/* Floating Shadow/Glow */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-300',
            isDragging ? 'opacity-60 scale-125' : 'opacity-30',
          )}
          style={{
            background: `radial-gradient(circle, ${LUNA_COLORS.lanternGlow}40 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />

        {/* Main Avatar with Contextual Menu */}
        <div className="relative">
          {radixReady && (
            <LunaContextualMenu>
              <div className="relative">
              <LunaAvatar
                size="medium"
                expression={currentExpression}
                animated={!isDragging}
                className={cn(
                  'shadow-lg transition-all duration-200 cursor-pointer',
                  hasUnreadMessages ? 'ring-4' : 'ring-2 ring-white',
                )}
              />

              {/* Unread Messages Indicator */}
              {hasUnreadMessages && (
                <div
                  className={cn(
                    'absolute -top-1 -right-1 w-4 h-4 rounded-full',
                    'flex items-center justify-center text-white text-xs font-bold',
                    'animate-pulse pointer-events-none'
                  )}
                  style={{ backgroundColor: LUNA_COLORS.orangePrimary }}
                >
                  !
                </div>
              )}

              {/* Typing Indicator */}
              {isOpen && (
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full animate-pulse pointer-events-none"
                  style={{ backgroundColor: LUNA_COLORS.lanternGlow }}
                />
              )}
              </div>
            </LunaContextualMenu>
          )}

          {/* Fallback when Radix isn't ready yet */}
          {!radixReady && (
            <div className="relative">
              <LunaAvatar
                size="medium"
                expression={currentExpression}
                animated={!isDragging}
              />
            </div>
          )}
        </div>

        {/* Tooltip */}
        {showTooltipState && !isOpen && !isDragging && (
          <div
            className={cn(
              'absolute mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg',
              'opacity-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
              'pointer-events-none whitespace-nowrap z-10',
              // Position tooltip based on float position
              floatPosition === 'top-right' ? 'bottom-full left-1/2 transform -translate-x-1/2' :
              floatPosition === 'bottom-right' ? 'top-full left-1/2 transform -translate-x-1/2' :
              'top-full left-1/2 transform -translate-x-1/2'
            )}
            style={{
              opacity: showTooltipState ? 1 : 0,
            }}
          >
            {hasUnreadMessages
              ? 'You have unread messages from Luna!'
              : `Click for navigation & chat • ${currentContext} mode`
            }

            {/* Tooltip Arrow */}
            <div
              className={cn(
                'absolute left-1/2 transform -translate-x-1/2 w-0 h-0',
                'border-l-4 border-r-4 border-transparent',
                floatPosition === 'top-right' ? 'top-full border-t-4 border-t-gray-900' :
                'bottom-full border-b-4 border-b-gray-900'
              )}
            />
          </div>
        )}
      </div>

      {/* Chat is now accessed through the contextual menu */}
    </>
  );
};

// Preset components for common use cases
export const LunaFloatTopRight: React.FC<Omit<LunaFloatProps, 'floatPosition'>> = (props) => {
  const { setFloatPosition } = useLunaFloat();

  useEffect(() => {
    setFloatPosition('top-right');
  }, [setFloatPosition]);

  return <LunaFloat {...props} />;
};

export const LunaFloatBottomRight: React.FC<Omit<LunaFloatProps, 'floatPosition'>> = (props) => {
  const { setFloatPosition } = useLunaFloat();

  useEffect(() => {
    setFloatPosition('bottom-right');
  }, [setFloatPosition]);

  return <LunaFloat {...props} />;
};

// Auto-showing Luna for contextual help
export const LunaFloatContextual: React.FC<LunaFloatProps & {
  showOnPaths?: string[];
  hideOnPaths?: string[];
}> = ({
  showOnPaths = [],
  hideOnPaths = [],
  ...props
}) => {
  const { showFloat, hideFloat } = useLunaFloat();

  useEffect(() => {
    const currentPath = window.location.pathname;

    const shouldShow = showOnPaths.length === 0 || showOnPaths.some(path => currentPath.includes(path));
    const shouldHide = hideOnPaths.some(path => currentPath.includes(path));

    if (shouldShow && !shouldHide) {
      showFloat();
    } else if (shouldHide) {
      hideFloat();
    }
  }, [showOnPaths, hideOnPaths, showFloat, hideFloat]);

  return <LunaFloat {...props} />;
};

export default LunaFloat;