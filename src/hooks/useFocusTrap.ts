import { useEffect, RefObject } from "react";
import { focusTrap } from "@/utils/accessibility/focusManagement";

/**
 * React hook wrapper for focus trap utility
 * Automatically traps focus within an element (e.g., modals, dialogs)
 * Cleans up on unmount
 *
 * @param elementRef - Ref to the element that should trap focus
 * @param enabled - Whether the focus trap is active (default: true)
 */
export function useFocusTrap(
  elementRef: RefObject<HTMLElement>,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const cleanup = focusTrap(elementRef.current);
    return cleanup;
  }, [elementRef, enabled]);
}
