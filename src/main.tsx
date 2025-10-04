import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./utils/performance/webVitals";
import { initializeAccessibilityTesting } from "./utils/accessibility/testing";

// Initialize Web Vitals tracking
initWebVitals();

// Render React app first
console.log('🚀 Initializing React app...');
const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Initialize accessibility testing AFTER React mount (non-blocking)
if (import.meta.env.DEV) {
  // Use setTimeout to ensure this runs after React has mounted
  setTimeout(() => {
    initializeAccessibilityTesting().catch(error => {
      console.warn('⚠️ Failed to initialize accessibility testing:', error);
    });
  }, 100);
}

console.log('✅ React app render initiated');
