/**
 * useHover Hook
 * Manages hover state with additional interaction states
 */

import { useState, useCallback, useRef } from 'react';
import { HoverState } from '../types';

interface UseHoverConfig {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onPress?: () => void;
  onRelease?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  delayEnter?: number;
  delayLeave?: number;
}

export function useHover({
  onHoverStart,
  onHoverEnd,
  onPress,
  onRelease,
  onFocus,
  onBlur,
  delayEnter = 0,
  delayLeave = 0,
}: UseHoverConfig = {}) {
  const [hoverState, setHoverState] = useState<HoverState>({
    isHovered: false,
    isPressed: false,
    isFocused: false,
  });

  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const clearTimeouts = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeouts();

    if (delayEnter > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setHoverState(prev => ({ ...prev, isHovered: true }));
        onHoverStart?.();
      }, delayEnter);
    } else {
      setHoverState(prev => ({ ...prev, isHovered: true }));
      onHoverStart?.();
    }
  }, [delayEnter, onHoverStart, clearTimeouts]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();

    if (delayLeave > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setHoverState(prev => ({ ...prev, isHovered: false }));
        onHoverEnd?.();
      }, delayLeave);
    } else {
      setHoverState(prev => ({ ...prev, isHovered: false }));
      onHoverEnd?.();
    }
  }, [delayLeave, onHoverEnd, clearTimeouts]);

  const handleMouseDown = useCallback(() => {
    setHoverState(prev => ({ ...prev, isPressed: true }));
    onPress?.();
  }, [onPress]);

  const handleMouseUp = useCallback(() => {
    setHoverState(prev => ({ ...prev, isPressed: false }));
    onRelease?.();
  }, [onRelease]);

  const handleFocus = useCallback(() => {
    setHoverState(prev => ({ ...prev, isFocused: true }));
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setHoverState(prev => ({ ...prev, isFocused: false }));
    onBlur?.();
  }, [onBlur]);

  const hoverProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  return {
    hoverState,
    hoverProps,
    isHovered: hoverState.isHovered,
    isPressed: hoverState.isPressed,
    isFocused: hoverState.isFocused,
    isActive: hoverState.isHovered || hoverState.isPressed || hoverState.isFocused,
  };
}