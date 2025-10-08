import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeApplication } from "./utils/initialization";
import { initializeSupabase } from "./utils/initialization/supabase";
import { initializeWebVitals } from "./utils/initialization/webVitals";
import { setupGlobalErrorHandlers } from "./utils/errors/globalHandlers";
import { renderError } from "./utils/errors/renderError";
import { initializeAccessibilityTesting } from "./utils/accessibility/testing";
import { diagnostics, diagnostic } from "./utils/diagnostics/logger";
import { AppErrorBoundary } from "./components/errors/AppErrorBoundary";

// Diagnostic: confirm single React instance
console.log(`[Diagnostics] React version: ${React.version}`);

/**
 * Handles initialization, error handling, and React rendering
 */
async function bootstrap() {
  // Step 1: Setup global error handlers early
  setupGlobalErrorHandlers();

  // Step 2: Get root element
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found - cannot mount React app");
  }

  try {
    // Step 3: Validate environment
    await initializeApplication();
  } catch (error: unknown) {
    console.error("[Main] Application initialization failed:", error);
    return; // Stop execution - error already displayed in DOM
  }

  // Step 4: Initialize Web Vitals (non-blocking)
  initializeWebVitals();

  // Step 5: Initialize Supabase
  diagnostic.checkpoint("Pre-React Setup");
  console.log("[Main] Environment validated - rendering React app...");
  await initializeSupabase();

  // Step 6: Create React root
  const root = diagnostic.measureSync("React Root Creation", () =>
    createRoot(rootElement),
  );

  // Step 7: Render React application
  diagnostic.measureSync("React Render", () => {
    try {
      root.render(
        <StrictMode>
          <AppErrorBoundary
            onError={(error, errorInfo) => {
              console.error("[Main] App-level error caught by boundary:", error);
              console.error("[Main] Error info:", errorInfo);
              diagnostics.failStep("React Error Boundary", error, { errorInfo });
            }}
          >
            <App />
          </AppErrorBoundary>
        </StrictMode>,
      );
      console.log("[Main] React app render initiated successfully");
      diagnostics.completeStep("Application Initialization");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Main] Failed to render React app:", errorMessage);
      diagnostics.failStep("React Render", error as Error);
      diagnostics.printReport();

      renderError(
        rootElement,
        "Application Error",
        "The application failed to start. Please refresh the page to try again.",
        diagnostics.exportReport(),
      );

      throw error;
    }
  });

  // Step 8: Initialize accessibility testing (non-blocking, development only)
  if (import.meta.env.DEV) {
    setTimeout(async () => {
      try {
        await diagnostic.measure(
          "Accessibility Testing Setup",
          initializeAccessibilityTesting,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(
          "[Main] Failed to initialize accessibility testing:",
          errorMessage,
        );
        diagnostic.logBrowserBehavior("Accessibility Testing Failed", {
          error: errorMessage,
        });
      }
    }, 100);
  }

  // Step 9: Final completion
  setTimeout(() => {
    diagnostic.checkpoint("Initialization Complete");
    console.log("[Main] Application initialization completed");

    // Print diagnostic report in development only
    if (import.meta.env.DEV) {
      diagnostics.printReport();
    }
  }, 200);
}

// Start application bootstrap
bootstrap().catch((error: unknown) => {
  console.error("[Main] Bootstrap failed:", error);
  diagnostics.failStep("Bootstrap", error as Error);
  throw error;
});
