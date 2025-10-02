import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./utils/performance/webVitals";
import { initializeAccessibilityTesting } from "./utils/accessibility/testing";

// Initialize Web Vitals tracking
initWebVitals();

// Initialize accessibility testing in development
if (import.meta.env.DEV) {
  initializeAccessibilityTesting();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
