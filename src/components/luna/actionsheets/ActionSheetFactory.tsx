import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ClassicIOSActionSheet } from '@/components/luna/actionsheets/ClassicIOSActionSheet';
import { FloatingPanelActionSheet } from '@/components/luna/actionsheets/FloatingPanelActionSheet';
import { RadialMenuActionSheet } from '@/components/luna/actionsheets/RadialMenuActionSheet';
import { ContextualActionSheet } from '@/components/luna/actionsheets/ContextualActionSheet';
import { ExpandableTabActionSheet } from '@/components/luna/actionsheets/ExpandableTabActionSheet';
import { PopupGridActionSheet } from '@/components/luna/actionsheets/PopupGridActionSheet';
import { MultiLevelActionSheet } from '@/components/luna/actionsheets/MultiLevelActionSheet';
import { SideStripActionSheet } from '@/components/luna/actionsheets/SideStripActionSheet';
import { ActionSheetType, ActionSheetProps } from '@/components/luna/actionsheets/types';

interface ActionSheetFactoryProps extends ActionSheetProps {
  type: ActionSheetType;
}

export const ActionSheetFactory: React.FC<ActionSheetFactoryProps> = ({
  type,
  isOpen,
  onClose,
  actions,
  className
}) => {
  const renderActionSheet = () => {
    const props = { isOpen, onClose, actions, className };

    switch (type) {
      case 'classic-ios':
        return <ClassicIOSActionSheet {...props} />;
      case 'floating-panel':
        return <FloatingPanelActionSheet {...props} />;
      case 'radial-menu':
        return <RadialMenuActionSheet {...props} />;
      case 'contextual-sheet':
        return <ContextualActionSheet {...props} />;
      case 'expandable-tab':
        return <ExpandableTabActionSheet {...props} />;
      case 'popup-grid':
        return <PopupGridActionSheet {...props} />;
      case 'multi-level':
        return <MultiLevelActionSheet {...props} />;
      case 'side-strip':
        return <SideStripActionSheet {...props} />;
      default:
        return <FloatingPanelActionSheet {...props} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && renderActionSheet()}
    </AnimatePresence>
  );
};

// Action Sheet Configuration Registry
export const ACTION_SHEET_CONFIGS = {
  'classic-ios': {
    type: 'classic-ios' as ActionSheetType,
    label: 'Classic iOS',
    description: 'Traditional iOS bottom sheet with list items',
    bestFor: ['accessibility', 'familiarity', 'text-heavy actions'],
    gestureSupport: ['tap', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'floating-panel': {
    type: 'floating-panel' as ActionSheetType,
    label: 'Floating Panel',
    description: 'Rounded panel floating above content',
    bestFor: ['modern design', 'grid layouts', 'visual actions'],
    gestureSupport: ['tap', 'long-press'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'radial-menu': {
    type: 'radial-menu' as ActionSheetType,
    label: 'Radial Menu',
    description: 'Circular arrangement around center point',
    bestFor: ['quick access', 'spatial memory', 'gaming interfaces'],
    gestureSupport: ['tap', 'drag', 'swipe'],
    accessibility: {
      screenReader: false,
      keyboardNav: true,
      reducedMotion: false,
    },
  },
  'contextual-sheet': {
    type: 'contextual-sheet' as ActionSheetType,
    label: 'Contextual',
    description: 'Smart suggestions based on current context',
    bestFor: ['AI assistance', 'personalization', 'efficiency'],
    gestureSupport: ['tap'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'expandable-tab': {
    type: 'expandable-tab' as ActionSheetType,
    label: 'Expandable Tab',
    description: 'Category-based expandable sections',
    bestFor: ['organization', 'large action sets', 'categorization'],
    gestureSupport: ['tap', 'long-press'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'popup-grid': {
    type: 'popup-grid' as ActionSheetType,
    label: 'Pop-up Grid',
    description: 'Animated grid with pagination',
    bestFor: ['visual discovery', 'app-like interface', 'multiple pages'],
    gestureSupport: ['tap', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'multi-level': {
    type: 'multi-level' as ActionSheetType,
    label: 'Multi-Level Menu',
    description: 'Hierarchical navigation with breadcrumbs',
    bestFor: ['complex workflows', 'deep organization', 'power users'],
    gestureSupport: ['tap', 'long-press'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
  'side-strip': {
    type: 'side-strip' as ActionSheetType,
    label: 'Side Strip',
    description: 'Compact vertical action strip',
    bestFor: ['space efficiency', 'persistent access', 'minimal design'],
    gestureSupport: ['tap', 'long-press'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true,
    },
  },
} as const;