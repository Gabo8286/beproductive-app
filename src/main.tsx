import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/integrations/supabase/client";

console.log('[Main] BeProductive app starting with simplified bootstrap...');
console.log(`[Main] React version: ${React.version}`);
console.log('[Main] Environment variables:', {
  SKIP_LOGIN: import.meta.env.VITE_SKIP_LOGIN,
  LOCAL_MODE: import.meta.env.VITE_LOCAL_MODE,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
  NODE_ENV: import.meta.env.NODE_ENV
});

// Simple, reliable bootstrap
function bootstrap() {
  console.log('[Main] Finding root element...');
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('[Main] ERROR: Root element not found!');
    document.body.innerHTML = '<div style="color: red; font-size: 24px; padding: 20px;">ERROR: Root element not found!</div>';
    return;
  }

  console.log('[Main] ✅ Root element found, creating React root...');

  try {
    const root = createRoot(rootElement);
    console.log('[Main] ✅ React root created, rendering app...');

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log('[Main] ✅ BeProductive app rendered successfully');
  } catch (error) {
    console.error('[Main] ❌ Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="color: red; font-size: 18px; padding: 20px; border: 2px solid red;">
        <h2>Application Error</h2>
        <p>The BeProductive app failed to start. Please refresh the page.</p>
        <p>Error: ${error}</p>
      </div>
    `;
  }
}

// Start the application
bootstrap();

console.log('[Main] Bootstrap process completed');