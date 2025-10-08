/**
 * Application initialization utilities
 * Handles environment validation and error display
 */

import { diagnostics, diagnostic } from "@/utils/diagnostics/logger";
import {
  logEnvironmentValidation,
  isEnvironmentReady,
  createEnvironmentErrorMessage,
  type ValidationResult,
} from "@/utils/environment/validation";
import { renderError } from "@/utils/errors/renderError";

/**
 * Initialize and validate application environment
 * @throws Error if environment validation fails
 */
export async function initializeApplication(): Promise<ValidationResult> {
  diagnostics.startStep("Application Initialization");
  diagnostic.checkpoint("App Start", {
    timestamp: Date.now(),
    url: window.location.href,
  });

  const envValidation = diagnostic.measureSync("Environment Validation", () => {
    console.log("[Main] Starting application initialization...");
    return logEnvironmentValidation();
  });

  if (!isEnvironmentReady()) {
    showEnvironmentError(envValidation);
    diagnostics.failStep(
      "Environment Validation",
      "Environment validation failed",
      envValidation,
    );
    diagnostics.printReport();
    throw new Error("Environment validation failed - cannot start application");
  }

  return envValidation;
}

/**
 * Display environment validation errors in DOM
 */
function showEnvironmentError(envValidation: ValidationResult): void {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  renderError(
    rootElement,
    "Configuration Error",
    createEnvironmentErrorMessage(envValidation),
    diagnostics.exportReport(),
  );
}
