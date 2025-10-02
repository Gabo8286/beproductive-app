import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts for quick navigation
 * Follow macOS conventions (Cmd+Shift) and Windows conventions (Ctrl+Shift)
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey; // Ctrl on Windows, Cmd on Mac
      
      // Only trigger if modifier + shift is pressed
      if (!isMod || !event.shiftKey) return;

      switch (event.key.toUpperCase()) {
        case 'D':
          // Cmd/Ctrl + Shift + D -> Dashboard
          event.preventDefault();
          navigate('/dashboard');
          break;
          
        case 'G':
          // Cmd/Ctrl + Shift + G -> Goals
          event.preventDefault();
          navigate('/goals');
          break;
          
        case 'T':
          // Cmd/Ctrl + Shift + T -> Quick To-Dos (Travel Notes)
          event.preventDefault();
          navigate('/quick-todos');
          break;
          
        case 'K':
          // Cmd/Ctrl + Shift + K -> Tasks
          event.preventDefault();
          navigate('/tasks');
          break;
          
        case 'H':
          // Cmd/Ctrl + Shift + H -> Habits
          event.preventDefault();
          navigate('/habits');
          break;
          
        case 'R':
          // Cmd/Ctrl + Shift + R -> Reflections
          event.preventDefault();
          navigate('/reflections');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
