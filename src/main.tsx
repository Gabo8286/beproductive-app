import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./utils/performance/webVitals";
import { initializeAccessibilityTesting } from "./utils/accessibility/testing";
import {
  logEnvironmentValidation,
  isEnvironmentReady,
  createEnvironmentErrorMessage,
} from "./utils/environment/validation";
import { AppErrorBoundary } from "./components/errors/AppErrorBoundary";
import { diagnostics, diagnostic } from "./utils/diagnostics/logger";

// Step 1: Start diagnostic logging and validate environment
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
  diagnostics.failStep(
    "Environment Validation",
    "Environment validation failed",
    envValidation,
  );
  diagnostics.printReport();

  // Show environment error in the DOM instead of blank screen
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        padding: 2rem;
        max-width: 800px;
        margin: 2rem auto;
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #991b1b;
      ">
        <h1 style="margin-top: 0; color: #dc2626;">Configuration Error</h1>
        <pre style="
          background: #fff;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          white-space: pre-wrap;
          color: #374151;
        ">${createEnvironmentErrorMessage(envValidation)}</pre>
        <p style="margin-bottom: 0;">
          Please fix the configuration issues above and refresh the page.
        </p>
        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer;">Diagnostic Report</summary>
          <pre style="font-size: 10px; margin-top: 0.5rem;">${diagnostics.exportReport()}</pre>
        </details>
      </div>
    `;
  }
  throw new Error("Environment validation failed - cannot start application");
}

// Step 2: Initialize Web Vitals tracking (with safe storage)
diagnostic.measureSync("Web Vitals Initialization", () => {
  try {
    initWebVitals();
    console.log("[Main] Web Vitals initialized");
  } catch (error) {
    console.warn("[Main] Web Vitals initialization failed:", error);
    // Continue without Web Vitals - don't block the app
    diagnostic.logBrowserBehavior("Web Vitals Failed", {
      error: error instanceof Error ? error.message : error,
    });
  }
});

// Step 3: Prepare for React rendering
diagnostic.checkpoint("Pre-React Setup");
console.log("[Main] Environment validated - rendering React app...");

const rootElement = diagnostic.measureSync("Root Element Check", () => {
  const element = document.getElementById("root");
  if (!element) {
    throw new Error("Root element not found - cannot mount React app");
  }
  return element;
});

const root = diagnostic.measureSync("React Root Creation", () => {
  return createRoot(rootElement);
});

// Add global error handler for unhandled errors
window.addEventListener("error", (event) => {
  console.error("[Main] Unhandled error:", event.error);
  diagnostics.logEvent("Unhandled Error", {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Main] Unhandled promise rejection:", event.reason);
  diagnostics.logEvent("Unhandled Promise Rejection", {
    reason: event.reason instanceof Error ? event.reason.message : event.reason,
  });
});

// Step 4: Render React application
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
  } catch (error) {
    console.error("[Main] Failed to render React app:", error);
    diagnostics.failStep("React Render", error as Error);
    diagnostics.printReport();

    // Show error in DOM instead of blank screen
    rootElement.innerHTML = `
    <div style="
      padding: 2rem;
      max-width: 600px;
      margin: 2rem auto;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #991b1b;
    ">
      <h1 style="margin-top: 0;">Application Error</h1>
      <p>The application failed to start. Please refresh the page to try again.</p>
      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer;">Error Details</summary>
        <pre style="
          background: #fff;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-top: 0.5rem;
          color: #374151;
        ">${error instanceof Error ? error.message : "Unknown error"}</pre>
      </details>
      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer;">Diagnostic Report</summary>
        <pre style="font-size: 10px; margin-top: 0.5rem;">${diagnostics.exportReport()}</pre>
      </details>
    </div>
  `;

    throw error;
  }
});

// Step 5: Initialize accessibility testing AFTER React mount (non-blocking)
// Temporarily disabled for debugging
// if (import.meta.env.DEV) {
//   setTimeout(() => {
//     diagnostic
//       .measure("Accessibility Testing Setup", async () => {
//         await initializeAccessibilityTesting();
//       })
//       .catch((error) => {
//         console.warn(
//           "[Main] Failed to initialize accessibility testing:",
//           error,
//         );
//         diagnostic.logBrowserBehavior("Accessibility Testing Failed", {
//           error: error.message,
//         });
//       });
//   }, 100);
// }

// Final completion
setTimeout(() => {
  diagnostic.checkpoint("Initialization Complete");
  console.log("[Main] Application initialization completed");

  // Print final diagnostic report for debugging
  if (import.meta.env.DEV) {
    diagnostics.printReport();
  }
}, 200);
