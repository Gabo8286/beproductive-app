#!/usr/bin/env node

/**
 * Modular Build System - Module Builder
 * Builds individual modules with optimized tree-shaking and bundle analysis
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { promises as fs } from 'fs';
import { build } from 'esbuild';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import analyzer from 'rollup-plugin-analyzer';
import chalk from 'chalk';
import ora from 'ora';
import prettyBytes from 'pretty-bytes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../');

// MARK: - Module Configuration

const MODULES = {
  types: {
    entry: 'src/shared/types/index.ts',
    output: 'dist/types',
    name: 'SparkBloomFlowTypes',
    description: 'Shared TypeScript types and interfaces',
    treeshake: true,
    externals: []
  },
  constants: {
    entry: 'src/shared/constants/index.ts',
    output: 'dist/constants',
    name: 'SparkBloomFlowConstants',
    description: 'Design tokens and shared constants',
    treeshake: true,
    externals: []
  },
  hooks: {
    entry: 'src/shared/hooks/index.ts',
    output: 'dist/hooks',
    name: 'SparkBloomFlowHooks',
    description: 'Consolidated React hooks (5 modules)',
    treeshake: true,
    externals: ['react', 'react-dom']
  },
  components: {
    entry: 'src/shared/components/index.ts',
    output: 'dist/components',
    name: 'SparkBloomFlowComponents',
    description: 'Standardized component library',
    treeshake: true,
    externals: ['react', 'react-dom', '@radix-ui/react-*']
  },
  analytics: {
    entry: 'src/shared/analytics/index.ts',
    output: 'dist/analytics',
    name: 'SparkBloomFlowAnalytics',
    description: 'Modular analytics system (9 modules)',
    treeshake: true,
    externals: []
  },
  luna: {
    entry: 'src/shared/luna/index.ts',
    output: 'dist/luna',
    name: 'SparkBloomFlowLuna',
    description: 'Luna AI framework and integration',
    treeshake: true,
    externals: ['react', 'react-dom']
  }
};

// MARK: - Build Configuration

const BUILD_FORMATS = {
  esm: {
    format: 'es',
    suffix: '.js',
    target: 'es2020'
  },
  cjs: {
    format: 'cjs',
    suffix: '.cjs',
    target: 'es2018'
  },
  umd: {
    format: 'umd',
    suffix: '.umd.js',
    target: 'es2017'
  }
};

// MARK: - Bundle Analysis

class BundleAnalyzer {
  constructor() {
    this.results = new Map();
  }

  recordResult(moduleName, format, result) {
    if (!this.results.has(moduleName)) {
      this.results.set(moduleName, {});
    }
    this.results.get(moduleName)[format] = result;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      modules: {},
      totals: {
        originalSize: 0,
        bundleSize: 0,
        gzipSize: 0,
        reduction: 0
      }
    };

    for (const [moduleName, formats] of this.results) {
      const moduleReport = {
        formats: {},
        bestFormat: null,
        compression: {}
      };

      let smallestSize = Infinity;
      let bestFormat = null;

      for (const [format, result] of Object.entries(formats)) {
        moduleReport.formats[format] = {
          size: result.size,
          gzipSize: result.gzipSize,
          exports: result.exports || [],
          dependencies: result.dependencies || []
        };

        if (result.size < smallestSize) {
          smallestSize = result.size;
          bestFormat = format;
        }

        report.totals.bundleSize += result.size;
        report.totals.gzipSize += result.gzipSize || 0;
      }

      moduleReport.bestFormat = bestFormat;
      moduleReport.compression.ratio = formats.esm?.gzipSize && formats.esm?.size ?
        (formats.esm.gzipSize / formats.esm.size) : 0;

      report.modules[moduleName] = moduleReport;
    }

    return report;
  }

  printSummary() {
    const report = this.generateReport();

    console.log(chalk.bold.blue('\n📊 Module Bundle Analysis Summary\n'));

    // Module-by-module breakdown
    for (const [moduleName, moduleData] of Object.entries(report.modules)) {
      const config = MODULES[moduleName];
      console.log(chalk.bold.cyan(`🔧 ${config.name}`));
      console.log(chalk.gray(`   ${config.description}`));

      for (const [format, data] of Object.entries(moduleData.formats)) {
        const sizeColor = data.size < 50000 ? 'green' : data.size < 100000 ? 'yellow' : 'red';
        console.log(chalk[sizeColor](`   ${format.toUpperCase()}: ${prettyBytes(data.size)}`));
        if (data.gzipSize) {
          console.log(chalk.gray(`        Gzipped: ${prettyBytes(data.gzipSize)}`));
        }
      }

      if (moduleData.bestFormat) {
        console.log(chalk.green(`   ✅ Recommended: ${moduleData.bestFormat.toUpperCase()}`));
      }
      console.log();
    }

    // Overall totals
    console.log(chalk.bold.yellow('📈 Overall Statistics'));
    console.log(chalk.white(`   Total Bundle Size: ${prettyBytes(report.totals.bundleSize)}`));
    console.log(chalk.white(`   Total Gzipped: ${prettyBytes(report.totals.gzipSize)}`));
    console.log(chalk.green(`   Average Compression: ${((report.totals.gzipSize / report.totals.bundleSize) * 100).toFixed(1)}%`));

    // Tree-shaking effectiveness
    console.log(chalk.bold.green('\n🌳 Tree-Shaking Benefits'));
    console.log(chalk.white('   • Dead code elimination enabled'));
    console.log(chalk.white('   • Unused exports automatically removed'));
    console.log(chalk.white('   • Optimized import paths'));
    console.log(chalk.white('   • Cross-module dependency tracking'));
  }
}

// MARK: - Module Builder

class ModuleBuilder {
  constructor() {
    this.analyzer = new BundleAnalyzer();
    this.buildStats = {
      successful: 0,
      failed: 0,
      totalTime: 0
    };
  }

  async buildModule(moduleName, config) {
    const spinner = ora(`Building ${chalk.cyan(config.name)}...`).start();
    const startTime = Date.now();

    try {
      // Ensure output directory exists
      const outputDir = join(projectRoot, config.output);
      await fs.mkdir(outputDir, { recursive: true });

      // Build all formats
      const results = {};
      for (const [formatName, formatConfig] of Object.entries(BUILD_FORMATS)) {
        try {
          const result = await this.buildFormat(moduleName, config, formatName, formatConfig);
          results[formatName] = result;
          this.analyzer.recordResult(moduleName, formatName, result);
        } catch (error) {
          spinner.fail(`Failed to build ${formatName} format for ${moduleName}`);
          console.error(chalk.red(error.message));
          throw error;
        }
      }

      // Generate type definitions
      await this.generateTypeDefinitions(config);

      const duration = Date.now() - startTime;
      this.buildStats.totalTime += duration;
      this.buildStats.successful++;

      spinner.succeed(`${chalk.green(config.name)} built in ${duration}ms`);
      return results;

    } catch (error) {
      this.buildStats.failed++;
      spinner.fail(`Failed to build ${chalk.red(config.name)}`);
      throw error;
    }
  }

  async buildFormat(moduleName, config, formatName, formatConfig) {
    const entryPath = join(projectRoot, config.entry);
    const outputPath = join(projectRoot, config.output, `index${formatConfig.suffix}`);

    // Check if entry file exists
    try {
      await fs.access(entryPath);
    } catch (error) {
      throw new Error(`Entry file not found: ${entryPath}`);
    }

    if (formatName === 'esm' || formatName === 'cjs') {
      // Use Rollup for ESM and CJS (better tree-shaking)
      return await this.buildWithRollup(entryPath, outputPath, config, formatConfig);
    } else {
      // Use esbuild for UMD (faster builds)
      return await this.buildWithEsbuild(entryPath, outputPath, config, formatConfig);
    }
  }

  async buildWithRollup(entryPath, outputPath, config, formatConfig) {
    const bundle = await rollup({
      input: entryPath,
      external: config.externals,
      treeshake: config.treeshake ? {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      } : false,
      plugins: [
        nodeResolve({
          preferBuiltins: false,
          browser: true
        }),
        commonjs(),
        typescript({
          tsconfig: join(projectRoot, 'tsconfig.json'),
          declaration: false,
          declarationMap: false
        }),
        formatConfig.format !== 'es' && terser({
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          }
        }),
        filesize({
          showMinifiedSize: false,
          showGzippedSize: true
        })
      ].filter(Boolean)
    });

    const { output } = await bundle.generate({
      format: formatConfig.format,
      name: config.name,
      exports: 'auto'
    });

    await bundle.write({
      file: outputPath,
      format: formatConfig.format,
      name: config.name,
      exports: 'auto'
    });

    await bundle.close();

    // Get file stats
    const stats = await fs.stat(outputPath);
    return {
      size: stats.size,
      format: formatConfig.format,
      exports: output[0].exports || [],
      dependencies: config.externals
    };
  }

  async buildWithEsbuild(entryPath, outputPath, config, formatConfig) {
    const result = await build({
      entryPoints: [entryPath],
      bundle: true,
      minify: true,
      sourcemap: true,
      target: formatConfig.target,
      format: formatConfig.format === 'umd' ? 'iife' : formatConfig.format,
      globalName: config.name,
      external: config.externals,
      outfile: outputPath,
      treeShaking: config.treeshake,
      write: true,
      metafile: true
    });

    const stats = await fs.stat(outputPath);
    return {
      size: stats.size,
      format: formatConfig.format,
      dependencies: config.externals,
      metafile: result.metafile
    };
  }

  async generateTypeDefinitions(config) {
    const entryPath = join(projectRoot, config.entry);
    const outputPath = join(projectRoot, config.output, 'index.d.ts');

    // Use TypeScript compiler to generate declarations
    try {
      const bundle = await rollup({
        input: entryPath,
        external: config.externals,
        plugins: [
          typescript({
            tsconfig: join(projectRoot, 'tsconfig.json'),
            declaration: true,
            declarationMap: true,
            emitDeclarationOnly: true
          })
        ]
      });

      await bundle.write({
        file: outputPath,
        format: 'es'
      });

      await bundle.close();
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not generate type definitions for ${config.name}`));
      console.warn(chalk.gray(error.message));
    }
  }

  async validateModules() {
    const spinner = ora('Validating module dependencies...').start();

    try {
      for (const [moduleName, config] of Object.entries(MODULES)) {
        const entryPath = join(projectRoot, config.entry);

        try {
          await fs.access(entryPath);
        } catch (error) {
          throw new Error(`Module entry not found: ${entryPath}`);
        }
      }

      spinner.succeed('All modules validated successfully');
    } catch (error) {
      spinner.fail('Module validation failed');
      throw error;
    }
  }

  async buildAll() {
    const startTime = Date.now();

    console.log(chalk.bold.blue('🏗️  Starting Modular Build System\n'));

    // Validate modules first
    await this.validateModules();

    // Build each module
    for (const [moduleName, config] of Object.entries(MODULES)) {
      await this.buildModule(moduleName, config);
    }

    // Generate analysis report
    this.analyzer.printSummary();

    // Print build statistics
    const totalTime = Date.now() - startTime;
    console.log(chalk.bold.green('\n✅ Build Complete!'));
    console.log(chalk.white(`   Modules Built: ${this.buildStats.successful}`));
    console.log(chalk.white(`   Failed Builds: ${this.buildStats.failed}`));
    console.log(chalk.white(`   Total Time: ${totalTime}ms`));
    console.log(chalk.white(`   Average Time: ${Math.round(totalTime / Object.keys(MODULES).length)}ms per module`));

    // Save analysis report
    const report = this.analyzer.generateReport();
    const reportPath = join(projectRoot, 'build-system/reports/bundle-analysis.json');
    await fs.mkdir(dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.gray(`\n📄 Report saved to: ${reportPath}`));
  }
}

// MARK: - CLI Execution

async function main() {
  try {
    const builder = new ModuleBuilder();
    await builder.buildAll();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n❌ Build failed:'));
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}

export { ModuleBuilder, BundleAnalyzer, MODULES };