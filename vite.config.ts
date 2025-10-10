import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Minimal Vite config for debugging
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
  },
});