/**
 * Web Vitals initialization utilities
 */

import { diagnostic } from "@/utils/diagnostics/logger";
import { initWebVitals } from "@/utils/performance/webVitals";

/**
 * Initialize Web Vitals tracking with safe error handling
 * Non-blocking - continues even if initialization fails
 */
export function initializeWebVitals(): void {
  diagnostic.measureSync("Web Vitals Initialization", () => {
    try {
      initWebVitals();
      console.log("[Main] Web Vitals initialized");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn("[Main] Web Vitals initialization failed:", errorMessage);
      diagnostic.logBrowserBehavior("Web Vitals Failed", {
        error: errorMessage,
      });
      // Continue without Web Vitals - don't block the app
    }
  });
}
