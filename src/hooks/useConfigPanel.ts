import { useState, useCallback, useEffect } from 'react';

export function useConfigPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Keyboard shortcut to toggle config panel (Ctrl/Cmd + Shift + ,)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === ',') {
        event.preventDefault();
        toggle();
      }

      // ESC to close
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}