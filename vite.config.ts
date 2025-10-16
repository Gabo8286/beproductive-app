import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// Vite config with mobile development support
// Use 'npm run dev:mobile' for mobile-sized floating window development
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Note: Browser opening is controlled by mobile development scripts for device simulation
    // Development performance optimizations
    ...(mode === 'development' && {
      hmr: {
        overlay: false, // Reduce overlay interference
      },
      fs: {
        strict: false, // Allow broader file access
      },
    }),
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    // Optimized performance budgets
    chunkSizeWarningLimit: 500, // Adjusted limit for vendor chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Optimized chunking strategy based on actual usage patterns and load priorities
          if (id.includes('node_modules')) {
            // Core React libraries - split for better caching and loading
            if (id.includes('react/') || id.includes('react-dom/client')) {
              return 'react-runtime';
            }
            if (id.includes('react-dom') && !id.includes('client')) {
              return 'react-dom';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }

            // UI Component libraries - frequently used, cache separately
            if (id.includes('@radix-ui') || id.includes('radix-ui')) {
              return 'ui-components';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }

            // Data & Backend - heavy but essential
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }

            // Charts - large but only used in specific pages
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }

            // Utilities - small, frequently used
            if (id.includes('zod') || id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils';
            }

            // AI libraries - feature-specific, can be lazy loaded
            if (id.includes('openai') || id.includes('anthropic')) {
              return 'ai-services';
            }

            // Everything else from node_modules
            return 'vendor-misc';
          }

          // App code chunking for better code splitting
          if (id.includes('src/pages/')) {
            // Group admin pages together (lower priority)
            if (id.includes('src/pages/admin/')) {
              return 'pages-admin';
            }
            // Let Vite handle other pages automatically for optimal splitting
          }
        },
        // Optimize chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
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
      '@supabase/storage-js'
    ],
    exclude: [
      // Large libraries that should be loaded on demand
      'recharts'
    ]
  },
  css: {
    devSourcemap: true, // Inline sourcemaps to prevent separate file downloads
  },
}));