import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
    mode === 'development' && componentTagger(),
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
    // Performance budgets to prevent bundle bloat
    chunkSizeWarningLimit: 400, // Stricter size limit
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Simplified chunking strategy to prevent React initialization race conditions
          if (id.includes('node_modules')) {
            // Consolidate ALL React-related libraries into one chunk to prevent race conditions
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            // UI components and styling
            if (id.includes('@radix-ui') || id.includes('radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Data and backend
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3')) {
              return 'chart-vendor';
            }
            // Utilities and validation
            if (id.includes('zod') || id.includes('date-fns') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // AI and ML libraries
            if (id.includes('openai') || id.includes('anthropic')) {
              return 'ai-vendor';
            }
            // Everything else from node_modules
            return 'vendor';
          }

          // Let Vite handle app code chunking automatically to prevent dependency issues
          // Removed manual app-specific chunking to avoid interfering with React context initialization
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