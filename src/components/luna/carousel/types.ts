import { LucideIcon } from 'lucide-react';

export interface CarouselItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  href?: string;
  description?: string;
}

export interface CarouselCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: CarouselItem[];
  color?: string;
}

export interface CarouselPosition {
  x: number;
  y: number;
  angle: number;
  index: number;
}

export type DragDirection = 'right' | 'up' | 'left' | 'down' | null;

export interface CarouselState {
  activeCategory: string | null;
  isExpanded: boolean;
  rotation: number;
  chatOpen: boolean;
  isLongPressing: boolean;
  dragOffset: number;
  isDragging: boolean;
  dragDirection: DragDirection;
  showContextMenu: boolean;
  showFavorites: boolean;
  showSearch: boolean;
}

export interface CarouselConfig {
  radius: number;
  centerSize: number;
  buttonSize: number;
  animationDuration: number;
  longPressDuration: number;
  hapticEnabled: boolean;
  dragThreshold: number;
  dragSensitivity: number;
}