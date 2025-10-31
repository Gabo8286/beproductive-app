import * as path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// Vite config with mobile development support
// Use 'npm run dev:mobile' for mobile-sized floating window development
export default defineConfig(({ mode }) => ({
  server: {
    // Fix for Safari WebSocket connection issues - always bind to all interfaces
    host: '127.0.0.1',
    port: 8080,
    strictPort: true, // Force specific port to avoid conflicts
    open: false, // Browser opening controlled by mobile development scripts
    // Connection and timeout settings for stability
    cors: true,
    // Development performance optimizations
    ...(mode === 'development' && {
      hmr: {
        overlay: false, // Reduce overlay interference
        host: '127.0.0.1', // Match main server host binding
        port: 8080, // Use same port as main server to avoid conflicts
      },
      fs: {
        strict: false, // Allow broader file access
      },
      // Docker compatibility
      watch: {
        usePolling: true, // Required for Docker on macOS
        interval: 1000,
      },
    }),
    // Custom middleware for health check endpoint
    middlewareMode: false
  },
  plugins: [
    react(),
    // Health check endpoint plugin for Docker monitoring
    {
      name: 'health-check',
      configureServer(server) {
        server.middlewares.use('/health', (req, res, next) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            port: 8080,
            environment: mode || 'development'
          }));
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // Reasonable limit to avoid over-chunking
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React libraries - keep together for better compatibility
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }

            // UI component libraries
            if (id.includes('@radix-ui')) {
              return 'ui-components';
            }

            // Large utility libraries
            if (id.includes('date-fns') || id.includes('framer-motion') || id.includes('recharts')) {
              return 'heavy-vendor';
            }

            // Everything else
            return 'vendor';
          }
        },
        // Optimize chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      treeshake: {
        preset: 'safest' // Use safest settings to avoid module resolution issues
      }
    },
    // Tree shaking and dead code elimination
    cssCodeSplit: true,
  },
  // Optimize dependencies for better pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/postgrest-js',
      '@supabase/realtime-js',
      '@supabase/storage-js',
      // Include recharts and its dependencies to ensure proper initialization
      'recharts',
      'recharts/es6',
      'd3-shape',
      'd3-scale',
      'd3-path',
      'd3-array',
      'd3-interpolate',
      'd3-format',
      'd3-time',
      'd3-time-format'
    ]
  },
  css: {
    devSourcemap: true, // Inline sourcemaps to prevent separate file downloads
  },
}));