import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA disabled temporarily due to workbox configuration issues
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'BeProductive - Spark Bloom Flow',
    //     short_name: 'BeProductive',
    //     description: 'Your journey to productivity mastery starts here',
    //     theme_color: '#6366f1',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     categories: ['productivity', 'business', 'utilities'],
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           },
    //           cacheKeyWillBeUsed: async ({ request }) => {
    //             return `${request.url}?${new Date().getTime()}`;
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/api\.beproductive\.app\/.*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 // 1 day
    //           },
    //           networkTimeoutSeconds: 10
    //         }
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: true
    //   }
    // }),
    mode === 'production' && visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
    mode === 'production' && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
      },
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }

          // Query libraries
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }

          // UI components (Radix)
          if (id.includes('@radix-ui/')) {
            return 'ui-vendor';
          }

          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }

          // Charts and visualization
          if (id.includes('recharts') || id.includes('d3') || id.includes('chart')) {
            return 'charts-vendor';
          }

          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms-vendor';
          }

          // Date/time utilities
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }

          // Utility libraries
          if (id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils-vendor';
          }

          // Supabase
          if (id.includes('@supabase/')) {
            return 'supabase-vendor';
          }

          // DnD libraries
          if (id.includes('@dnd-kit/')) {
            return 'dnd-vendor';
          }

          // Testing libraries (should not be in production, but just in case)
          if (id.includes('vitest') || id.includes('@testing-library') || id.includes('msw') || id.includes('playwright')) {
            return 'test-vendor';
          }

          // Large vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          let extType = info[info.length - 1] || 'misc';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
      external: [],
      plugins: []
    },
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.trace'] : [],
      },
      mangle: {
        safari10: true,
      },
      format: {
        safari10: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development' ? 'inline' : false,
    assetsInlineLimit: 4096, // 4kb
  },
}));
