/**
 * Global error handlers for unhandled errors and promise rejections
 * Centralizes error handling setup for better maintainability
 */

import { diagnostics } from "@/utils/diagnostics/logger";

/**
 * Setup global error handlers for window errors and unhandled promise rejections
 * Should be called early in application initialization
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors
  window.addEventListener("error", (event: ErrorEvent) => {
    console.error("[Main] Unhandled error:", event.error);
    diagnostics.logEvent("Unhandled Error", {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    console.error("[Main] Unhandled promise rejection:", event.reason);
    diagnostics.logEvent("Unhandled Promise Rejection", {
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
  });

  console.log("[Main] Global error handlers initialized");
}
