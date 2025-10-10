import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts for quick navigation
 * Follow macOS conventions (Cmd+Shift) and Windows conventions (Ctrl+Shift)
 *
 * Available shortcuts:
 * - Cmd/Ctrl + Shift + D: Dashboard
 * - Cmd/Ctrl + Shift + G: Goals
 * - Cmd/Ctrl + Shift + T: Quick To-Dos
 * - Cmd/Ctrl + Shift + K: Tasks
 * - Cmd/Ctrl + Shift + H: Habits
 * - Cmd/Ctrl + Shift + R: Reflections
 * - ?: Show keyboard shortcuts help (coming soon)
 *
 * Note: These shortcuts are designed to not conflict with screen reader shortcuts
 * which typically use Insert/CapsLock + other keys
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable;

      const isMod = event.ctrlKey || event.metaKey; // Ctrl on Windows, Cmd on Mac

      // Only trigger if modifier + shift is pressed (and not in input field)
      if (!isMod || !event.shiftKey || isInputField) return;

      switch (event.key.toUpperCase()) {
        case "D":
          // Cmd/Ctrl + Shift + D -> Dashboard
          event.preventDefault();
          navigate("/app/capture");
          break;

        case "G":
          // Cmd/Ctrl + Shift + G -> Goals
          event.preventDefault();
          navigate("/goals");
          break;

        case "T":
          // Cmd/Ctrl + Shift + T -> Quick To-Dos (Travel Notes)
          event.preventDefault();
          navigate("/quick-todos");
          break;

        case "K":
          // Cmd/Ctrl + Shift + K -> Tasks
          event.preventDefault();
          navigate("/tasks");
          break;

        case "H":
          // Cmd/Ctrl + Shift + H -> Habits
          event.preventDefault();
          navigate("/habits");
          break;

        case "R":
          // Cmd/Ctrl + Shift + R -> Reflections
          event.preventDefault();
          navigate("/reflections");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
