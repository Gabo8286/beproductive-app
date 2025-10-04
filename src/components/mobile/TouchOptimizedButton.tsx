import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  longPressMs?: number;
  onLongPress?: () => void;
  rippleColor?: string;
}

export function TouchOptimizedButton({
  children,
  className,
  hapticFeedback = true,
  longPressMs = 800,
  onLongPress,
  onClick,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  ...props
}: TouchOptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const rippleIdRef = useRef(0);

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Very light vibration
    }
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    triggerHapticFeedback();

    // Create ripple effect
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      const newRipple = { id: rippleIdRef.current++, x, y };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        triggerHapticFeedback();
        onLongPress();
      }, longPressMs);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHapticFeedback();
    onClick?.(e);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <Button
      ref={buttonRef}
      className={cn(
        // Base touch optimization styles
        'touch-manipulation select-none relative overflow-hidden',
        // Minimum touch target size (44px as per Apple HIG)
        'min-h-[44px] min-w-[44px]',
        // Enhanced visual feedback
        'transition-all duration-150 ease-out',
        // Active state
        isPressed && 'scale-[0.97] brightness-95',
        // Hover state for desktop
        'hover:scale-[1.02] hover:shadow-md',
        // Focus state for accessibility
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: rippleColor,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>

      {/* CSS for ripple animation */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
          }
        }
      `}</style>
    </Button>
  );
}

// Higher-order component for touch optimization
export function withTouchOptimization<T extends ButtonProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function TouchOptimizedComponent(props: T & TouchOptimizedButtonProps) {
    return (
      <TouchOptimizedButton {...props}>
        <WrappedComponent {...props} />
      </TouchOptimizedButton>
    );
  };
}

// Touch-optimized card component
interface TouchOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticFeedback?: boolean;
  pressable?: boolean;
}

export function TouchOptimizedCard({
  children,
  className,
  onPress,
  onLongPress,
  hapticFeedback = true,
  pressable = true,
  ...props
}: TouchOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchStart = () => {
    if (!pressable) return;

    setIsPressed(true);
    triggerHapticFeedback();

    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        triggerHapticFeedback();
        onLongPress();
      }, 800);
    }
  };

  const handleTouchEnd = () => {
    if (!pressable) return;

    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleClick = () => {
    if (!pressable) return;

    triggerHapticFeedback();
    onPress?.();
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        'touch-manipulation select-none transition-all duration-150 ease-out',
        pressable && [
          'cursor-pointer',
          'hover:scale-[1.01] hover:shadow-md',
          'active:scale-[0.99]',
          isPressed && 'scale-[0.99] brightness-95'
        ],
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}