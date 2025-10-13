/**
 * Enhanced Vite Configuration with Advanced Build Optimizations
 * Demonstrates comprehensive build optimization strategies
 */
import { defineConfig, Plugin, UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'module';
import fs from 'fs';

// Custom plugin for advanced chunking strategies
function advancedChunkingPlugin(): Plugin {
  return {
    name: 'advanced-chunking',
    generateBundle(options, bundle) {
      // Analyze bundle and provide chunking insights
      const chunks = Object.entries(bundle).filter(([, chunk]) => chunk.type === 'chunk');
      const totalSize = chunks.reduce((sum, [, chunk]) => sum + (chunk.code?.length || 0), 0);

      console.log(`📦 Bundle Analysis:`);
      console.log(`   Total chunks: ${chunks.length}`);
      console.log(`   Total size: ${(totalSize / 1024).toFixed(2)}KB`);

      chunks.forEach(([name, chunk]) => {
        if (chunk.type === 'chunk' && chunk.code) {
          const size = (chunk.code.length / 1024).toFixed(2);
          console.log(`   ${name}: ${size}KB`);
        }
      });
    }
  };
}

// Custom plugin for build performance monitoring
function buildPerformancePlugin(): Plugin {
  let buildStart: number;

  return {
    name: 'build-performance',
    buildStart() {
      buildStart = Date.now();
      console.log('🚀 Build started...');
    },
    generateBundle() {
      const duration = Date.now() - buildStart;
      console.log(`⏱️  Build completed in ${duration}ms`);

      // Log performance metrics
      if (process.memoryUsage) {
        const memory = process.memoryUsage();
        console.log(`💾 Memory usage: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  };
}

// Custom plugin for dependency optimization
function dependencyOptimizationPlugin(): Plugin {
  return {
    name: 'dependency-optimization',
    config(config) {
      // Enhance optimizeDeps configuration
      config.optimizeDeps = {
        ...config.optimizeDeps,
        // Force optimization of specific dependencies
        include: [
          ...(config.optimizeDeps?.include || []),
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@radix-ui/react-slot',
          '@radix-ui/react-toast',
          'class-variance-authority',
          'clsx',
          'tailwind-merge'
        ],
        // Exclude heavy dependencies that should be lazy-loaded
        exclude: [
          ...(config.optimizeDeps?.exclude || []),
          'react-window',
          '@hello-pangea/dnd',
          'react-beautiful-dnd'
        ]
      };
    }
  };
}

// Enhanced manual chunking strategy
function getManualChunks(id: string) {
  // Core React ecosystem
  if (id.includes('node_modules')) {
    // React core (highest priority, loaded first)
    if (id.includes('react/') || id.includes('react-dom/')) {
      return 'react-core';
    }

    // React ecosystem (second priority)
    if (id.includes('react-router') || id.includes('react-hook-form') || id.includes('react-query')) {
      return 'react-ecosystem';
    }

    // UI Framework (loaded with initial UI)
    if (id.includes('@radix-ui')) {
      return 'ui-framework';
    }

    // Animation libraries (lazy loaded)
    if (id.includes('framer-motion') || id.includes('react-spring')) {
      return 'animations';
    }

    // Icons (frequently used, medium priority)
    if (id.includes('lucide-react') || id.includes('react-icons')) {
      return 'icons';
    }

    // Backend/API (loaded when needed)
    if (id.includes('@supabase') || id.includes('supabase-js')) {
      return 'backend';
    }

    // Data visualization (lazy loaded)
    if (id.includes('recharts') || id.includes('d3-') || id.includes('chart')) {
      return 'charts';
    }

    // Utilities (shared across features)
    if (id.includes('date-fns') || id.includes('zod') || id.includes('lodash')) {
      return 'utilities';
    }

    // AI/ML libraries (lazy loaded)
    if (id.includes('openai') || id.includes('anthropic') || id.includes('tensorflow')) {
      return 'ai-ml';
    }

    // Testing libraries (dev only)
    if (id.includes('vitest') || id.includes('@testing-library') || id.includes('jsdom')) {
      return 'testing';
    }

    // Everything else
    return 'vendor';
  }

  // Application code chunking
  if (id.includes('/src/')) {
    // Core application infrastructure
    if (id.includes('/contexts/') || id.includes('/providers/') || id.includes('/lib/')) {
      return 'app-core';
    }

    // Hooks and utilities
    if (id.includes('/hooks/') || id.includes('/utils/')) {
      return 'app-utils';
    }

    // UI components
    if (id.includes('/components/ui/')) {
      return 'ui-components';
    }

    // Feature-specific chunks
    if (id.includes('/components/luna/')) {
      return 'luna-framework';
    }

    if (id.includes('/components/widgets/')) {
      return 'widgets';
    }

    if (id.includes('/components/auth/')) {
      return 'auth';
    }

    if (id.includes('/components/admin/')) {
      return 'admin';
    }

    if (id.includes('/components/landing/')) {
      return 'landing';
    }

    // Pages (route-based splitting)
    if (id.includes('/pages/')) {
      return 'pages';
    }

    // Tests
    if (id.includes('/__tests__/') || id.includes('.test.') || id.includes('.spec.')) {
      return 'tests';
    }
  }

  return undefined;
}

// Build configuration based on mode
function getBuildConfig(mode: string): UserConfig['build'] {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    target: 'es2020',
    sourcemap: isDevelopment ? 'inline' : false,
    minify: isProduction ? 'esbuild' : false,

    // Performance budgets
    chunkSizeWarningLimit: isProduction ? 300 : 1000,

    // ESBuild configuration for better optimization
    esbuild: {
      // Tree shaking configuration
      treeShaking: true,
      // Remove console logs in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Optimize for size in production
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
    },

    rollupOptions: {
      // Input configuration for multi-page apps
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // Add other entry points if needed
      },

      // External dependencies (for library builds)
      external: isDevelopment ? [] : [
        // Don't externalize anything for app builds
        // But if building a library, externalize React, etc.
      ],

      output: {
        // Chunking strategy
        manualChunks: getManualChunks,

        // File naming for optimal caching
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;

          // Different naming strategies based on chunk type
          if (name.includes('vendor') || name.includes('react') || name.includes('ui')) {
            // Stable names for vendor chunks (longer cache)
            return 'assets/vendor/[name]-[hash].js';
          }

          if (name.includes('pages') || name.includes('admin')) {
            // Route-based chunks
            return 'assets/pages/[name]-[hash].js';
          }

          // Default naming
          return 'assets/chunks/[name]-[hash].js';
        },

        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const name = assetInfo.name || '';

          if (name.endsWith('.css')) {
            return 'assets/styles/[name]-[hash].[ext]';
          }

          if (name.match(/\.(png|jpe?g|gif|svg|webp|avif)$/)) {
            return 'assets/images/[name]-[hash].[ext]';
          }

          if (name.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }

          return 'assets/[name]-[hash].[ext]';
        },

        // Optimize chunk generation
        generatedCode: {
          preset: 'es2015',
          symbols: isProduction
        },

        // Module format optimization
        format: 'es',
        compact: isProduction,

        // Optimize imports
        hoistTransitiveImports: true,

        // Better sourcemap support
        sourcemapExcludeSources: isProduction,
      },

      // Rollup plugins for additional optimization
      plugins: []
    },

    // CSS optimization
    cssCodeSplit: true,
    cssMinify: isProduction,

    // Asset processing
    assetsDir: 'assets',
    assetsInlineLimit: 4096, // 4kb inline limit

    // Optimize chunk loading
    modulePreload: {
      polyfill: true
    },

    // Build performance optimizations
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  };
}

export default defineConfig(({ mode, command }) => {
  const isDev = mode === 'development';
  const isBuild = command === 'build';

  console.log(`🔧 Building in ${mode} mode (${command})`);

  return {
    // Server configuration
    server: {
      host: "::",
      port: 8080,

      // Development optimizations
      ...(isDev && {
        hmr: {
          overlay: false,
          clientPort: 8080
        },
        fs: {
          strict: false,
          allow: ['..'] // Allow parent directory access
        },
        // Pre-bundling configuration
        warmup: {
          clientFiles: [
            './src/App.tsx',
            './src/main.tsx',
            './src/components/**/*.tsx'
          ]
        }
      })
    },

    // Plugin configuration
    plugins: [
      // React with optimized SWC configuration
      react({
        fastRefresh: isDev,
        plugins: [
          // Add React compiler optimizations
          ...(mode === 'production' ? [
            ['@swc/plugin-styled-components', {
              displayName: false,
              ssr: false
            }]
          ] : [])
        ]
      }),

      // Development-only plugins
      ...(isDev ? [
        componentTagger()
      ] : []),

      // Build-only plugins
      ...(isBuild ? [
        buildPerformancePlugin(),
        advancedChunkingPlugin(),

        // Bundle analyzer
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap' // or 'sunburst', 'network'
        }) as Plugin
      ] : []),

      // Always-on plugins
      dependencyOptimizationPlugin()
    ].filter(Boolean),

    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Add more aliases for better tree shaking
        "react": path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom")
      }
    },

    // Build configuration
    build: getBuildConfig(mode),

    // Dependency optimization
    optimizeDeps: {
      // Fast startup optimization
      entries: [
        'src/main.tsx',
        'src/App.tsx'
      ],

      // Core dependencies to pre-bundle
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        '@tanstack/react-query',
        'framer-motion',
        'lucide-react',
        'clsx',
        'tailwind-merge'
      ],

      // Heavy dependencies to exclude from pre-bundling
      exclude: [
        'react-window',
        '@hello-pangea/dnd',
        'recharts'
      ],

      // ESBuild options for dependency optimization
      esbuildOptions: {
        target: 'es2020',
        supported: {
          bigint: true
        }
      }
    },

    // CSS configuration
    css: {
      devSourcemap: isDev,
      postcss: {
        plugins: [
          // Add PostCSS plugins for optimization
        ]
      }
    },

    // Define global constants
    define: {
      __DEV__: isDev,
      __PROD__: !isDev,
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
    },

    // Worker configuration
    worker: {
      format: 'es',
      plugins: [
        react()
      ]
    },

    // Environment variables
    envPrefix: ['VITE_', 'REACT_APP_'],

    // Experimental features
    experimental: {
      renderBuiltUrl(filename: string) {
        // Custom URL generation for assets
        return `/${filename}`;
      }
    }
  };
});