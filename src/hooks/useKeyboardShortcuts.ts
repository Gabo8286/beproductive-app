import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isInputField && !event.metaKey && !event.ctrlKey) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlKey = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Global keyboard shortcuts for task creation
export const getTaskCreationShortcuts = (
  onQuickCreate: () => void,
  onQuickCreateInStatus: () => void,
) => [
  {
    key: 'n',
    ctrl: true,
    description: 'Create new task',
    callback: onQuickCreate,
  },
  {
    key: 'n',
    ctrl: true,
    shift: true,
    description: 'Create task in current status',
    callback: onQuickCreateInStatus,
  },
];
