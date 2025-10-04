import { useState, useEffect } from "react";

/**
 * Hook to manage keyboard shortcuts dialog state
 * Opens dialog when user presses '?'
 */
export function useKeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user pressed '?' (Shift + /)
      if (
        event.key === "?" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        // Don't trigger in input fields
        const target = event.target as HTMLElement;
        const isInputField =
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.isContentEditable;

        if (!isInputField) {
          event.preventDefault();
          setIsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
