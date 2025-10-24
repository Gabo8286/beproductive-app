/**
 * Rollup Configuration for Modular Build System
 * Optimized for tree-shaking, code splitting, and cross-platform compatibility
 */

import { resolve, join } from 'path';
import { createRequire } from 'module';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import analyzer from 'rollup-plugin-analyzer';
import dts from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// MARK: - Build Configuration

const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

const globals = {
  'react': 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'ReactJSXRuntime'
};

// MARK: - Plugin Configurations

const getPlugins = (format, isDeclaration = false) => {
  const plugins = [];

  if (!isDeclaration) {
    // TypeScript compilation
    plugins.push(
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        rootDir: './src',
        exclude: ['**/*.test.*', '**/*.spec.*', '**/tests/**']
      })
    );

    // Node modules resolution
    plugins.push(
      nodeResolve({
        preferBuiltins: false,
        browser: format === 'umd',
        exportConditions: ['import', 'module', 'default']
      })
    );

    // CommonJS support
    plugins.push(
      commonjs({
        include: /node_modules/
      })
    );

    // Minification for production
    if (isProduction) {
      plugins.push(
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug'],
            passes: 2
          },
          mangle: {
            safari10: true,
            properties: {
              regex: /^_/
            }
          },
          format: {
            comments: false
          }
        })
      );
    }

    // Bundle analysis
    if (isAnalyze) {
      plugins.push(
        analyzer({
          summaryOnly: true,
          filterDependencies: true
        })
      );
    }

    // File size reporting
    plugins.push(
      filesize({
        showMinifiedSize: isProduction,
        showGzippedSize: true,
        showBrotliSize: false
      })
    );
  } else {
    // Type declaration generation
    plugins.push(dts());
  }

  return plugins.filter(Boolean);
};

// MARK: - Module Configurations

const modules = {
  types: {
    input: 'src/shared/types/index.ts',
    external: [],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },
  constants: {
    input: 'src/shared/constants/index.ts',
    external: [],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },
  hooks: {
    input: 'src/shared/hooks/index.ts',
    external: ['react', 'react-dom'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false
    }
  },
  components: {
    input: 'src/shared/components/index.ts',
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-*',
      'clsx',
      'tailwind-merge'
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },
  analytics: {
    input: 'src/shared/analytics/index.ts',
    external: [],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },
  luna: {
    input: 'src/shared/luna/index.ts',
    external: ['react', 'react-dom'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  }
};

// MARK: - Build Target Generation

function createConfig(moduleName, moduleConfig) {
  const configs = [];

  // ESM build
  configs.push({
    input: moduleConfig.input,
    external: [...external, ...moduleConfig.external],
    plugins: getPlugins('esm'),
    treeshake: moduleConfig.treeshake,
    output: {
      file: `dist/${moduleName}/index.js`,
      format: 'esm',
      sourcemap: !isProduction,
      exports: 'auto'
    }
  });

  // CommonJS build
  configs.push({
    input: moduleConfig.input,
    external: [...external, ...moduleConfig.external],
    plugins: getPlugins('cjs'),
    treeshake: moduleConfig.treeshake,
    output: {
      file: `dist/${moduleName}/index.cjs`,
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'auto'
    }
  });

  // UMD build (for browser)
  if (['hooks', 'components', 'luna'].includes(moduleName)) {
    configs.push({
      input: moduleConfig.input,
      external: Object.keys(globals),
      plugins: getPlugins('umd'),
      treeshake: moduleConfig.treeshake,
      output: {
        file: `dist/${moduleName}/index.umd.js`,
        format: 'umd',
        name: `SparkBloomFlow${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`,
        globals,
        sourcemap: !isProduction
      }
    });
  }

  // Type declarations
  configs.push({
    input: moduleConfig.input,
    external: [...external, ...moduleConfig.external],
    plugins: getPlugins('dts', true),
    output: {
      file: `dist/${moduleName}/index.d.ts`,
      format: 'esm'
    }
  });

  return configs;
}

// MARK: - Export Configuration

const configs = [];

// Generate configs for all modules
for (const [moduleName, moduleConfig] of Object.entries(modules)) {
  configs.push(...createConfig(moduleName, moduleConfig));
}

export default configs;

// MARK: - Development Utilities

export const getBuildInfo = () => ({
  version: pkg.version,
  modules: Object.keys(modules),
  formats: ['esm', 'cjs', 'umd'],
  production: isProduction,
  analyze: isAnalyze,
  outputDir: 'dist/'
});

export const validateConfiguration = () => {
  const errors = [];

  // Check for required dependencies
  const requiredDeps = ['typescript', 'rollup'];
  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
    } catch (error) {
      errors.push(`Missing required dependency: ${dep}`);
    }
  }

  // Check input files exist
  for (const [moduleName, moduleConfig] of Object.entries(modules)) {
    try {
      require.resolve(resolve(moduleConfig.input));
    } catch (error) {
      errors.push(`Input file not found for ${moduleName}: ${moduleConfig.input}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

// MARK: - Build Optimization Features

export const optimizationFeatures = {
  treeshaking: {
    enabled: true,
    description: 'Removes unused code automatically',
    modules: Object.keys(modules)
  },
  codesplitting: {
    enabled: true,
    description: 'Splits code into smaller chunks for better loading',
    strategy: 'module-based'
  },
  minification: {
    enabled: isProduction,
    description: 'Compresses code for smaller bundle size',
    tool: 'terser'
  },
  sourcemaps: {
    enabled: !isProduction,
    description: 'Provides debugging information',
    type: 'inline'
  },
  bundleAnalysis: {
    enabled: isAnalyze,
    description: 'Analyzes bundle composition and size',
    format: 'summary'
  }
};