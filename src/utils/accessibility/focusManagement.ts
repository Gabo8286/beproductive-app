/**
 * Trap focus within a given element (e.g., modals, dialogs)
 * @param element The element to trap focus within
 * @returns Cleanup function to remove the trap
 */
export const focusTrap = (element: HTMLElement): (() => void) => {
  const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const focusableElements =
    element.querySelectorAll<HTMLElement>(focusableSelector);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", trapFocus);
  firstFocusable?.focus();

  return () => element.removeEventListener("keydown", trapFocus);
};

/**
 * Convert pathname to readable page name
 */
export const getPageName = (pathname: string): string => {
  const pageNames: Record<string, string> = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/goals": "Goals",
    "/goals/new": "New Goal",
    "/tasks": "Tasks",
    "/quick-todos": "Quick Todos",
    "/habits": "Habits",
    "/reflections": "Reflections",
    "/templates": "Templates",
    "/recurring-tasks": "Recurring Tasks",
    "/tags": "Tag Management",
    "/automation": "Automation",
    "/profile": "Profile",
    "/login": "Login",
    "/signup": "Sign Up",
    "/forgot-password": "Forgot Password",
  };

  // Check for dynamic routes
  if (pathname.startsWith("/goals/") && pathname !== "/goals/new") {
    return "Goal Details";
  }
  if (pathname.startsWith("/tasks/")) {
    return "Task Details";
  }
  if (pathname.startsWith("/habits/")) {
    return "Habit Details";
  }
  if (pathname.startsWith("/reflections/")) {
    return "Reflection Details";
  }

  return pageNames[pathname] || "Page";
};

/**
 * Announce route changes to screen readers
 */
export const announceRouteChange = (pathname: string): void => {
  const pageName = getPageName(pathname);
  const announcement = `Navigated to ${pageName}`;

  const liveRegion = document.getElementById("aria-live-polite");
  if (liveRegion) {
    // Clear and re-set to ensure announcement
    liveRegion.textContent = "";
    setTimeout(() => {
      liveRegion.textContent = announcement;
    }, 100);
  }
};
