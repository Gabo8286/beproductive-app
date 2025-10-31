// 🚨 NUCLEAR CACHE BUST: Force COMPLETE Vercel rebuild - Thu Oct 31 05:28:30 GMT 2025
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/integrations/supabase/client";


// Simple, reliable bootstrap
function bootstrap() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('[Main] ERROR: Root element not found!');
    document.body.innerHTML = '<div style="color: red; font-size: 24px; padding: 20px;">ERROR: Root element not found!</div>';
    return;
  }


  try {
    const root = createRoot(rootElement);

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

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

