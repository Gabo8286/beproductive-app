/**
 * Types for Micro-interactions Library
 */

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
  repeat?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

export interface MicroInteractionProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  animationConfig?: Partial<AnimationConfig>;
}

export interface HoverState {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
}

export type AnimationVariant =
  | 'subtle'
  | 'normal'
  | 'pronounced'
  | 'dramatic'
  | 'gentle'
  | 'energetic';

export interface RippleConfig {
  color?: string;
  duration?: number;
  size?: number;
  opacity?: number;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}