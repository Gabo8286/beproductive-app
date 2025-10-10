/**
 * Z-index hierarchy constants for consistent layering
 *
 * This ensures proper stacking order throughout the application
 * and prevents overlapping UI elements.
 */

export const Z_INDEX = {
  // Base layers (0-9)
  BASE: 0,
  CONTENT: 1,

  // Interactive elements (10-19)
  DROPDOWN: 10,
  TOOLTIP: 15,

  // Navigation and menus (20-49)
  BREADCRUMBS: 30,
  FAB_MENU: 40,
  BOTTOM_NAV: 40,
  NAVIGATION: 45,
  
  // Overlays and modals (50-59)
  BACKDROP: 45,
  MODAL: 50,
  TOAST: 55,

  // Floating elements (60-79)
  FLOATING_BUTTON: 50,
  QUICK_FAB: 50,
  FLOATING_TIMER: 65,
  FLOATING_NOTIFICATION: 70,

  // Critical overlays (80-99)
  LOADING_SPINNER: 80,
  ERROR_OVERLAY: 90,
  CRITICAL_ALERT: 99,
} as const;

// Helper function to get z-index value
export const getZIndex = (layer: keyof typeof Z_INDEX): number => {
  return Z_INDEX[layer];
};

// CSS custom properties for use in components
export const zIndexVars = {
  '--z-base': Z_INDEX.BASE.toString(),
  '--z-content': Z_INDEX.CONTENT.toString(),
  '--z-dropdown': Z_INDEX.DROPDOWN.toString(),
  '--z-tooltip': Z_INDEX.TOOLTIP.toString(),
  '--z-breadcrumbs': Z_INDEX.BREADCRUMBS.toString(),
  '--z-fab-menu': Z_INDEX.FAB_MENU.toString(),
  '--z-bottom-nav': Z_INDEX.BOTTOM_NAV.toString(),
  '--z-navigation': Z_INDEX.NAVIGATION.toString(),
  '--z-backdrop': Z_INDEX.BACKDROP.toString(),
  '--z-modal': Z_INDEX.MODAL.toString(),
  '--z-toast': Z_INDEX.TOAST.toString(),
  '--z-floating-button': Z_INDEX.FLOATING_BUTTON.toString(),
  '--z-quick-fab': Z_INDEX.QUICK_FAB.toString(),
  '--z-floating-timer': Z_INDEX.FLOATING_TIMER.toString(),
  '--z-floating-notification': Z_INDEX.FLOATING_NOTIFICATION.toString(),
  '--z-loading-spinner': Z_INDEX.LOADING_SPINNER.toString(),
  '--z-error-overlay': Z_INDEX.ERROR_OVERLAY.toString(),
  '--z-critical-alert': Z_INDEX.CRITICAL_ALERT.toString(),
} as const;