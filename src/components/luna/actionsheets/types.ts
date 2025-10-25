export interface LunaAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  action: () => void;
  color: string;
  priority?: 'high' | 'medium' | 'low';
  context?: string[];
  category?: 'capture' | 'communication' | 'productivity' | 'insights';
}

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: LunaAction[];
  className?: string;
}

export type ActionSheetType =
  | 'classic-ios'
  | 'floating-panel'
  | 'radial-menu'
  | 'expandable-tab'
  | 'popup-grid'
  | 'contextual-sheet'
  | 'multi-level'
  | 'side-strip';

export interface ActionSheetConfig {
  type: ActionSheetType;
  label: string;
  description: string;
  bestFor: string[];
  gestureSupport: ('tap' | 'long-press' | 'swipe' | 'drag')[];
  accessibility: {
    screenReader: boolean;
    keyboardNav: boolean;
    reducedMotion: boolean;
  };
}