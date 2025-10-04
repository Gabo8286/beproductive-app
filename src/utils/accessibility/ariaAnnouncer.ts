/**
 * Announce messages to screen readers using ARIA live regions
 */

type AnnouncementPriority = "polite" | "assertive";

/**
 * Announce a message to screen readers
 * @param message The message to announce
 * @param priority 'polite' (default) or 'assertive' for urgent announcements
 */
export const announce = (
  message: string,
  priority: AnnouncementPriority = "polite",
): void => {
  const regionId =
    priority === "assertive" ? "aria-live-assertive" : "aria-live-polite";
  const liveRegion = document.getElementById(regionId);

  if (liveRegion) {
    // Clear the region first
    liveRegion.textContent = "";

    // Use a small delay to ensure the screen reader picks up the change
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 3000);
  }
};

/**
 * Announce success messages (polite)
 */
export const announceSuccess = (message: string): void => {
  announce(message, "polite");
};

/**
 * Announce error messages (assertive)
 */
export const announceError = (message: string): void => {
  announce(message, "assertive");
};

/**
 * Announce loading states
 */
export const announceLoading = (message: string = "Loading..."): void => {
  announce(message, "polite");
};

/**
 * Announce completion of actions
 */
export const announceComplete = (message: string): void => {
  announce(message, "polite");
};
