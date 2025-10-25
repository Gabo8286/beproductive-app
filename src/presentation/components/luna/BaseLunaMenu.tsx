import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * Base Luna Menu Types
 */
export type MenuStyle = 'radial' | 'bottom-navigation' | 'ios-tab-bar' | 'action-sheet' | 'command-palette' | 'floating-panel';

export type MenuPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface MenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  shortcut?: string;
  category?: string;
  disabled?: boolean;
  destructive?: boolean;
  onAction: () => void;
}

export interface MenuSection {
  id: string;
  title?: string;
  actions: MenuAction[];
}

export interface BaseMenuProps {
  style: MenuStyle;
  position?: MenuPosition;
  isOpen: boolean;
  onClose: () => void;
  sections: MenuSection[];
  searchable?: boolean;
  shortcuts?: boolean;
  className?: string;

  // Style-specific props
  radialRadius?: number;
  maxVisibleItems?: number;
  showLabels?: boolean;
  compactMode?: boolean;

  // Callbacks
  onActionSelect?: (action: MenuAction) => void;
  onSearch?: (query: string) => void;
}

/**
 * Animation configurations for different menu styles
 */
const menuAnimations = {
  radial: {
    container: {
      initial: { scale: 0, opacity: 0, rotate: -180 },
      animate: { scale: 1, opacity: 1, rotate: 0 },
      exit: { scale: 0, opacity: 0, rotate: 180 }
    },
    item: (index: number) => ({
      initial: { scale: 0, opacity: 0, rotate: -90 },
      animate: {
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: { delay: index * 0.05 }
      },
      exit: { scale: 0, opacity: 0, rotate: 90 }
    })
  },
  'bottom-navigation': {
    container: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 }
    },
    item: (index: number) => ({
      initial: { y: 20, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: { delay: index * 0.03 }
      },
      exit: { y: 20, opacity: 0 }
    })
  },
  'ios-tab-bar': {
    container: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 }
    },
    item: (index: number) => ({
      initial: { scale: 0.8, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: { delay: index * 0.02 }
      },
      exit: { scale: 0.8, opacity: 0 }
    })
  },
  'action-sheet': {
    container: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 }
    },
    item: (index: number) => ({
      initial: { x: -20, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { delay: index * 0.04 }
      },
      exit: { x: -20, opacity: 0 }
    })
  },
  'command-palette': {
    container: {
      initial: { scale: 0.95, opacity: 0, y: -20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.95, opacity: 0, y: -20 }
    },
    item: (index: number) => ({
      initial: { x: -10, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { delay: index * 0.02 }
      },
      exit: { x: -10, opacity: 0 }
    })
  },
  'floating-panel': {
    container: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    },
    item: (index: number) => ({
      initial: { y: 10, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: { delay: index * 0.03 }
      },
      exit: { y: 10, opacity: 0 }
    })
  }
};

/**
 * Style configurations for different menu layouts
 */
const styleConfigs = {
  radial: {
    containerClass: 'fixed inset-0 flex items-center justify-center z-50',
    menuClass: 'relative',
    itemClass: 'absolute flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border hover:bg-gray-50 transition-colors',
    backdrop: true
  },
  'bottom-navigation': {
    containerClass: 'fixed bottom-0 left-0 right-0 z-50',
    menuClass: 'bg-white border-t shadow-lg px-4 py-2',
    itemClass: 'flex flex-col items-center justify-center p-2 min-w-0 flex-1 hover:bg-gray-50 rounded-lg transition-colors',
    backdrop: false
  },
  'ios-tab-bar': {
    containerClass: 'fixed bottom-0 left-0 right-0 z-50',
    menuClass: 'bg-white/95 backdrop-blur-sm border-t border-gray-200 px-2 py-1',
    itemClass: 'flex flex-col items-center justify-center p-3 min-w-0 flex-1 hover:bg-gray-100/50 rounded-xl transition-all',
    backdrop: false
  },
  'action-sheet': {
    containerClass: 'fixed inset-0 z-50 flex items-end',
    menuClass: 'w-full bg-white rounded-t-xl shadow-xl border-t',
    itemClass: 'flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
    backdrop: true
  },
  'command-palette': {
    containerClass: 'fixed inset-0 z-50 flex items-start justify-center pt-20',
    menuClass: 'w-full max-w-lg bg-white rounded-lg shadow-2xl border mx-4',
    itemClass: 'flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer',
    backdrop: true
  },
  'floating-panel': {
    containerClass: 'fixed inset-0 z-50 flex items-center justify-center',
    menuClass: 'bg-white rounded-xl shadow-2xl border p-2 min-w-80',
    itemClass: 'flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer',
    backdrop: true
  }
};

/**
 * Base Luna Menu Component
 * Consolidates all Luna menu patterns into a single, configurable component
 */
export const BaseLunaMenu: React.FC<BaseMenuProps> = ({
  style,
  position = 'center',
  isOpen,
  onClose,
  sections,
  searchable = false,
  shortcuts = false,
  className = '',
  radialRadius = 100,
  maxVisibleItems = 8,
  showLabels = true,
  compactMode = false,
  onActionSelect,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const config = styleConfigs[style];
  const animations = menuAnimations[style];

  // Filter actions based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;

    return sections.map(section => ({
      ...section,
      actions: section.actions.filter(action =>
        action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.actions.length > 0);
  }, [sections, searchQuery]);

  // Flatten all actions for keyboard navigation
  const allActions = useMemo(() => {
    return filteredSections.flatMap(section => section.actions);
  }, [filteredSections]);

  // Handle action selection
  const handleActionSelect = useCallback((action: MenuAction) => {
    if (action.disabled) return;

    action.onAction();
    onActionSelect?.(action);
    onClose();
  }, [onActionSelect, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % allActions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + allActions.length) % allActions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (allActions[focusedIndex]) {
          handleActionSelect(allActions[focusedIndex]);
        }
        break;
    }
  }, [onClose, allActions, focusedIndex, handleActionSelect]);

  // Calculate radial positions for radial menu
  const getRadialPosition = useCallback((index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radialRadius;
    const y = Math.sin(angle) * radialRadius;
    return { x, y };
  }, [radialRadius]);

  // Render search input
  const renderSearchInput = () => {
    if (!searchable) return null;

    return (
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search actions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>
    );
  };

  // Render menu items based on style
  const renderMenuItems = () => {
    let actionIndex = 0;

    return filteredSections.map((section, sectionIndex) => (
      <div key={section.id}>
        {section.title && style !== 'radial' && (
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            {section.title}
          </div>
        )}

        {section.actions.map((action, itemIndex) => {
          const globalIndex = actionIndex++;
          const Icon = action.icon;
          const isFocused = globalIndex === focusedIndex;

          // Calculate position for radial menu
          const radialPos = style === 'radial'
            ? getRadialPosition(globalIndex, Math.min(allActions.length, maxVisibleItems))
            : null;

          const itemStyle = style === 'radial' && radialPos
            ? {
                transform: `translate(${radialPos.x}px, ${radialPos.y}px)`,
              }
            : undefined;

          return (
            <motion.button
              key={action.id}
              className={`
                ${config.itemClass}
                ${isFocused ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${action.destructive ? 'text-red-600 hover:bg-red-50' : ''}
                ${compactMode ? 'p-2' : ''}
              `}
              style={itemStyle}
              disabled={action.disabled}
              onClick={() => handleActionSelect(action)}
              variants={animations.item(globalIndex)}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover={{ scale: action.disabled ? 1 : 1.02 }}
              whileTap={{ scale: action.disabled ? 1 : 0.98 }}
            >
              <Icon className={`
                ${style === 'radial' ? 'w-5 h-5' : 'w-4 h-4'}
                ${style === 'bottom-navigation' || style === 'ios-tab-bar' ? 'mb-1' : ''}
              `} />

              {showLabels && (style !== 'radial' || compactMode) && (
                <div className="flex flex-col min-w-0">
                  <span className={`
                    font-medium truncate
                    ${style === 'bottom-navigation' || style === 'ios-tab-bar' ? 'text-xs' : 'text-sm'}
                  `}>
                    {action.label}
                  </span>

                  {action.description && style !== 'bottom-navigation' && style !== 'ios-tab-bar' && (
                    <span className="text-xs text-gray-500 truncate">
                      {action.description}
                    </span>
                  )}
                </div>
              )}

              {shortcuts && action.shortcut && (
                <span className="text-xs text-gray-400 ml-auto">
                  {action.shortcut}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    ));
  };

  // Render backdrop
  const renderBackdrop = () => {
    if (!config.backdrop) return null;

    return (
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className={`${config.containerClass} ${className}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {renderBackdrop()}

        <motion.div
          className={config.menuClass}
          variants={animations.container}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderSearchInput()}

          <div className={`
            ${style === 'radial' ? 'relative' : ''}
            ${style === 'bottom-navigation' || style === 'ios-tab-bar' ? 'flex' : ''}
            ${style === 'action-sheet' || style === 'command-palette' || style === 'floating-panel' ? 'divide-y' : ''}
          `}>
            {renderMenuItems()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Convenience hooks for different menu styles
 */
export const useRadialMenu = (actions: MenuAction[]) => {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const menuProps: Partial<BaseMenuProps> = {
    style: 'radial',
    isOpen,
    onClose: closeMenu,
    sections: [{ id: 'main', actions }],
    showLabels: false
  };

  return { isOpen, openMenu, closeMenu, menuProps };
};

export const useBottomNavigation = (actions: MenuAction[]) => {
  const [isOpen, setIsOpen] = useState(true); // Usually always open

  const menuProps: Partial<BaseMenuProps> = {
    style: 'bottom-navigation',
    isOpen,
    onClose: () => setIsOpen(false),
    sections: [{ id: 'main', actions }],
    showLabels: true,
    compactMode: true
  };

  return { isOpen, setIsOpen, menuProps };
};

export const useCommandPalette = (sections: MenuSection[]) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = useCallback(() => setIsOpen(true), []);
  const closePalette = useCallback(() => setIsOpen(false), []);

  const menuProps: Partial<BaseMenuProps> = {
    style: 'command-palette',
    isOpen,
    onClose: closePalette,
    sections,
    searchable: true,
    shortcuts: true
  };

  return { isOpen, openPalette, closePalette, menuProps };
};

export default BaseLunaMenu;