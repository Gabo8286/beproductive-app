import { useEffect } from 'react';

/**
 * Global keyboard navigation utilities
 * Handles escape key for modal closing and other common navigation patterns
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key: Close open modals/dialogs
      if (event.key === 'Escape') {
        const openDialog = document.querySelector('[role="dialog"][data-state="open"]');
        if (openDialog) {
          const closeButton = openDialog.querySelector('[aria-label*="lose"]') as HTMLElement;
          closeButton?.click();
          return;
        }

        // Close dropdown menus
        const openMenu = document.querySelector('[role="menu"][data-state="open"]');
        if (openMenu) {
          const trigger = document.querySelector('[aria-expanded="true"]') as HTMLElement;
          trigger?.click();
          return;
        }
      }

      // Tab key: Focus trap handling for skip link
      if (event.key === 'Tab' && !event.shiftKey && document.activeElement === document.body) {
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
          skipLink.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
