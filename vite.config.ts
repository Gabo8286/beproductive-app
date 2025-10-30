import * as path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { componentTagger } from "lovable-tagger";

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
    mode === 'development' && componentTagger(),
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
    // EMERGENCY: Strict performance budgets to force smaller chunks
    chunkSizeWarningLimit: 500, // Reduced back to force smaller chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Emergency bundle size reduction - aggressive chunking strategy
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

            // Charts - large but only used in specific pages - split further
            if (id.includes('recharts')) {
              return 'charts-recharts';
            }
            if (id.includes('d3')) {
              return 'charts-d3';
            }

            // Utilities - split into smaller chunks
            if (id.includes('zod')) {
              return 'utils-validation';
            }
            if (id.includes('date-fns')) {
              return 'utils-date';
            }
            if (id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils-styling';
            }

            // AI libraries - feature-specific, can be lazy loaded
            if (id.includes('openai') || id.includes('anthropic')) {
              return 'ai-services';
            }

            // Forms and validation - common but can be split
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }

            // Internationalization - large but can be split
            if (id.includes('react-i18next') || id.includes('i18next')) {
              return 'i18n';
            }

            // Testing libraries - development only
            if (id.includes('vitest') || id.includes('@testing-library')) {
              return 'testing';
            }

            // Large utility libraries
            if (id.includes('lodash') || id.includes('ramda') || id.includes('moment')) {
              return 'utilities-large';
            }

            // Everything else from node_modules
            return 'vendor-misc';
          }

          // EMERGENCY: Aggressive app code chunking to reduce main bundle
          if (id.includes('src/')) {
            // Admin features - rarely used, separate chunk
            if (id.includes('src/pages/admin/') || id.includes('src/components/admin/')) {
              return 'admin-features';
            }

            // Analytics features - heavy, separate chunk
            if (id.includes('Analytics') || id.includes('analytics') || id.includes('src/components/analytics/')) {
              return 'analytics-features';
            }

            // AI and Luna features - feature-specific
            if (id.includes('luna') || id.includes('Luna') || id.includes('src/components/ai/')) {
              return 'ai-features';
            }

            // Automation features - complex, separate chunk
            if (id.includes('automation') || id.includes('Automation')) {
              return 'automation-features';
            }

            // Habit features - large component set
            if (id.includes('habit') || id.includes('Habit')) {
              return 'habit-features';
            }

            // Goal features - large component set
            if (id.includes('goal') || id.includes('Goal')) {
              return 'goal-features';
            }

            // Reflection features
            if (id.includes('reflection') || id.includes('Reflection')) {
              return 'reflection-features';
            }

            // Task features - core but can be chunked
            if (id.includes('task') || id.includes('Task') || id.includes('src/pages/Tasks')) {
              return 'task-features';
            }

            // Widget system - modular loading
            if (id.includes('widget') || id.includes('Widget')) {
              return 'widget-system';
            }

            // Settings and config
            if (id.includes('settings') || id.includes('Settings') || id.includes('config') || id.includes('Config')) {
              return 'settings-features';
            }
          }
        },
        // Optimize chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Conservative tree shaking to avoid empty chunks
      treeshake: {
        preset: 'recommended' // Use recommended settings only
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
      'd3-time-format',
      'victory-vendor'
    ]
  },
  css: {
    devSourcemap: true, // Inline sourcemaps to prevent separate file downloads
  },
}));