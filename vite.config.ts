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
    react({
      // Fast refresh configuration for better HMR
      fastRefresh: true,
    }),
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
          // Dynamic chunking based on module path for better optimization
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
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

          // Application chunks based on feature areas
          if (id.includes('/components/luna/')) {
            return 'luna-framework';
          }
          if (id.includes('/components/widgets/')) {
            return 'widgets';
          }
          if (id.includes('/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/contexts/') || id.includes('/hooks/')) {
            return 'app-core';
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
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
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