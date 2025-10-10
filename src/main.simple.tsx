import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>BeProductive v2 - Test Mode</h1>
      <p>If you see this, the React app is working!</p>
      <p>Environment: {import.meta.env.VITE_APP_ENVIRONMENT}</p>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
    </div>
  );
}

// Simple initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(<TestApp />);

console.log("Simple React app initialized successfully");