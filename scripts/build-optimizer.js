#!/usr/bin/env node

/**
 * Advanced Build Optimizer
 * Comprehensive build analysis and optimization tool
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class BuildOptimizer {
  constructor(options = {}) {
    this.options = {
      mode: 'production',
      analyze: true,
      compress: true,
      benchmark: true,
      outputDir: 'dist',
      ...options
    };

    this.metrics = {
      buildTime: 0,
      bundleSize: 0,
      chunkCount: 0,
      assets: [],
      dependencies: {},
      performance: {}
    };
  }

  // Run the complete optimization process
  async optimize() {
    console.log('🚀 Starting build optimization process...\n');

    try {
      // Pre-build analysis
      await this.preAnalysis();

      // Clean previous builds
      await this.cleanBuild();

      // Run optimized build
      await this.runBuild();

      // Post-build analysis
      await this.postAnalysis();

      // Generate compression artifacts
      if (this.options.compress) {
        await this.compressAssets();
      }

      // Run performance benchmarks
      if (this.options.benchmark) {
        await this.runBenchmarks();
      }

      // Generate optimization report
      await this.generateReport();

      console.log('\n✅ Build optimization completed successfully!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Build optimization failed:', error.message);
      process.exit(1);
    }
  }

  // Analyze dependencies before build
  async preAnalysis() {
    console.log('📊 Running pre-build analysis...');

    // Analyze package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    );

    this.metrics.dependencies = {
      production: Object.keys(packageJson.dependencies || {}),
      development: Object.keys(packageJson.devDependencies || {}),
      total: Object.keys({
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }).length
    };

    // Analyze source code
    const srcStats = await this.analyzeSrcDirectory();
    this.metrics.sourceCode = srcStats;

    console.log(`   Dependencies: ${this.metrics.dependencies.total} total`);
    console.log(`   Source files: ${srcStats.fileCount} files`);
    console.log(`   Source size: ${(srcStats.totalSize / 1024).toFixed(2)}KB`);
  }

  // Analyze source directory
  async analyzeSrcDirectory() {
    const srcDir = path.join(projectRoot, 'src');
    let fileCount = 0;
    let totalSize = 0;
    const fileTypes = {};

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          fileCount++;
          totalSize += stat.size;

          const ext = path.extname(file);
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      });
    };

    if (fs.existsSync(srcDir)) {
      walkDir(srcDir);
    }

    return { fileCount, totalSize, fileTypes };
  }

  // Clean previous build
  async cleanBuild() {
    console.log('🧹 Cleaning previous build...');

    const distDir = path.join(projectRoot, this.options.outputDir);
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  }

  // Run the optimized build
  async runBuild() {
    console.log('🔨 Running optimized build...');

    const startTime = Date.now();

    try {
      // Use standard optimized vite config
      const configFile = 'vite.config.ts';

      const buildCommand = `npm run build -- --config ${configFile} --mode ${this.options.mode}`;

      console.log(`   Command: ${buildCommand}`);

      const output = execSync(buildCommand, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      this.metrics.buildTime = Date.now() - startTime;
      this.metrics.buildOutput = output;

      console.log(`   Build completed in ${this.metrics.buildTime}ms`);

    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  // Analyze build output
  async postAnalysis() {
    console.log('📈 Analyzing build output...');

    const distDir = path.join(projectRoot, this.options.outputDir);

    if (!fs.existsSync(distDir)) {
      throw new Error('Build output directory not found');
    }

    // Analyze bundle structure
    const bundleAnalysis = await this.analyzeBundleStructure(distDir);
    this.metrics = { ...this.metrics, ...bundleAnalysis };

    // Check for bundle analysis file
    const analysisFile = path.join(distDir, 'bundle-analysis.html');
    if (fs.existsSync(analysisFile)) {
      console.log(`   Bundle analysis available at: ${analysisFile}`);
    }

    console.log(`   Total bundle size: ${(this.metrics.bundleSize / 1024).toFixed(2)}KB`);
    console.log(`   Number of chunks: ${this.metrics.chunkCount}`);
  }

  // Analyze bundle structure
  async analyzeBundleStructure(distDir) {
    let totalSize = 0;
    let chunkCount = 0;
    const assets = [];
    const chunks = {};

    const walkDir = (dir, relativePath = '') => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativeFilePath = path.join(relativePath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, relativeFilePath);
        } else {
          const asset = {
            name: file,
            path: relativeFilePath,
            size: stat.size,
            type: this.getAssetType(file)
          };

          assets.push(asset);
          totalSize += stat.size;

          if (asset.type === 'js') {
            chunkCount++;
            chunks[file] = asset;
          }
        }
      });
    };

    walkDir(distDir);

    return {
      bundleSize: totalSize,
      chunkCount,
      assets: assets.sort((a, b) => b.size - a.size),
      chunks
    };
  }

  // Determine asset type
  getAssetType(filename) {
    const ext = path.extname(filename).toLowerCase();

    if (['.js', '.mjs'].includes(ext)) return 'js';
    if (['.css'].includes(ext)) return 'css';
    if (['.html'].includes(ext)) return 'html';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) return 'font';

    return 'other';
  }

  // Compress assets using gzip and brotli
  async compressAssets() {
    console.log('🗜️  Compressing assets...');

    const distDir = path.join(projectRoot, this.options.outputDir);

    // Find compressible assets
    const compressibleAssets = this.metrics.assets.filter(asset =>
      ['js', 'css', 'html'].includes(asset.type) && asset.size > 1024
    );

    for (const asset of compressibleAssets) {
      const assetPath = path.join(distDir, asset.path);

      try {
        // Gzip compression
        execSync(`gzip -9 -c "${assetPath}" > "${assetPath}.gz"`, { stdio: 'pipe' });

        // Brotli compression (if available)
        try {
          execSync(`brotli -9 -c "${assetPath}" > "${assetPath}.br"`, { stdio: 'pipe' });
        } catch {
          // Brotli might not be available, skip silently
        }

        // Calculate compression ratios
        const originalSize = asset.size;
        const gzipSize = fs.statSync(`${assetPath}.gz`).size;
        const gzipRatio = ((originalSize - gzipSize) / originalSize * 100).toFixed(1);

        asset.compressed = {
          gzip: { size: gzipSize, ratio: gzipRatio }
        };

        if (fs.existsSync(`${assetPath}.br`)) {
          const brotliSize = fs.statSync(`${assetPath}.br`).size;
          const brotliRatio = ((originalSize - brotliSize) / originalSize * 100).toFixed(1);
          asset.compressed.brotli = { size: brotliSize, ratio: brotliRatio };
        }

      } catch (error) {
        console.warn(`   Warning: Could not compress ${asset.path}`);
      }
    }

    console.log(`   Compressed ${compressibleAssets.length} assets`);
  }

  // Run performance benchmarks
  async runBenchmarks() {
    console.log('⚡ Running performance benchmarks...');

    try {
      // Bundle size analysis
      const jsAssets = this.metrics.assets.filter(a => a.type === 'js');
      const cssAssets = this.metrics.assets.filter(a => a.type === 'css');

      this.metrics.performance = {
        totalJS: jsAssets.reduce((sum, a) => sum + a.size, 0),
        totalCSS: cssAssets.reduce((sum, a) => sum + a.size, 0),
        largestChunk: Math.max(...jsAssets.map(a => a.size)),
        chunkSizeDistribution: this.calculateChunkDistribution(jsAssets),
        compressionEfficiency: this.calculateCompressionEfficiency()
      };

      // Performance score calculation
      this.metrics.performance.score = this.calculatePerformanceScore();

      console.log(`   Performance score: ${this.metrics.performance.score}/100`);

    } catch (error) {
      console.warn('   Warning: Could not complete performance benchmarks');
    }
  }

  // Calculate chunk size distribution
  calculateChunkDistribution(jsAssets) {
    const sizes = jsAssets.map(a => a.size).sort((a, b) => a - b);
    const total = sizes.length;

    return {
      smallest: sizes[0] || 0,
      largest: sizes[total - 1] || 0,
      median: sizes[Math.floor(total / 2)] || 0,
      average: total > 0 ? sizes.reduce((sum, size) => sum + size, 0) / total : 0
    };
  }

  // Calculate compression efficiency
  calculateCompressionEfficiency() {
    const compressedAssets = this.metrics.assets.filter(a => a.compressed);

    if (compressedAssets.length === 0) return null;

    const totalOriginal = compressedAssets.reduce((sum, a) => sum + a.size, 0);
    const totalGzipped = compressedAssets.reduce((sum, a) => sum + (a.compressed?.gzip?.size || a.size), 0);

    return {
      ratio: ((totalOriginal - totalGzipped) / totalOriginal * 100).toFixed(1),
      savings: totalOriginal - totalGzipped
    };
  }

  // Calculate overall performance score
  calculatePerformanceScore() {
    let score = 100;

    // Deduct points for large bundle size
    const totalSize = this.metrics.bundleSize;
    if (totalSize > 1024 * 1024) score -= 20; // -20 for >1MB
    else if (totalSize > 512 * 1024) score -= 10; // -10 for >512KB

    // Deduct points for too many chunks
    if (this.metrics.chunkCount > 20) score -= 15;
    else if (this.metrics.chunkCount > 10) score -= 5;

    // Deduct points for large individual chunks
    const largestChunk = this.metrics.performance?.largestChunk || 0;
    if (largestChunk > 250 * 1024) score -= 15; // -15 for >250KB chunks
    else if (largestChunk > 100 * 1024) score -= 5; // -5 for >100KB chunks

    // Deduct points for poor compression
    const compression = this.metrics.performance?.compressionEfficiency;
    if (compression && parseFloat(compression.ratio) < 60) score -= 10;

    return Math.max(0, score);
  }

  // Generate comprehensive optimization report
  async generateReport() {
    console.log('📄 Generating optimization report...');

    const reportData = {
      timestamp: new Date().toISOString(),
      buildTime: this.metrics.buildTime,
      bundle: {
        totalSize: this.metrics.bundleSize,
        chunkCount: this.metrics.chunkCount,
        assets: this.metrics.assets
      },
      performance: this.metrics.performance,
      dependencies: this.metrics.dependencies,
      sourceCode: this.metrics.sourceCode,
      recommendations: this.generateRecommendations()
    };

    // Write JSON report
    const reportPath = path.join(projectRoot, this.options.outputDir, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Write markdown report
    const markdownReport = this.generateMarkdownReport(reportData);
    const markdownPath = path.join(projectRoot, this.options.outputDir, 'optimization-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`   Reports saved to: ${this.options.outputDir}/`);
  }

  // Generate optimization recommendations
  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    if (this.metrics.bundleSize > 1024 * 1024) {
      recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        message: 'Bundle size exceeds 1MB. Consider code splitting and lazy loading.',
        impact: 'performance'
      });
    }

    // Chunk count recommendations
    if (this.metrics.chunkCount > 20) {
      recommendations.push({
        type: 'chunk-count',
        severity: 'medium',
        message: 'Too many chunks may increase network overhead. Consider consolidating.',
        impact: 'performance'
      });
    }

    // Large chunk recommendations
    const largeChunks = this.metrics.assets
      .filter(a => a.type === 'js' && a.size > 250 * 1024);

    largeChunks.forEach(chunk => {
      recommendations.push({
        type: 'large-chunk',
        severity: 'medium',
        message: `Chunk ${chunk.name} is ${(chunk.size / 1024).toFixed(2)}KB. Consider splitting.`,
        impact: 'performance'
      });
    });

    // Compression recommendations
    const uncompressedAssets = this.metrics.assets
      .filter(a => ['js', 'css'].includes(a.type) && a.size > 10 * 1024 && !a.compressed);

    if (uncompressedAssets.length > 0) {
      recommendations.push({
        type: 'compression',
        severity: 'low',
        message: 'Enable gzip/brotli compression for better transfer efficiency.',
        impact: 'performance'
      });
    }

    return recommendations;
  }

  // Generate markdown report
  generateMarkdownReport(data) {
    return `# Build Optimization Report

Generated: ${data.timestamp}

## Summary

- **Build Time**: ${data.buildTime}ms
- **Bundle Size**: ${(data.bundle.totalSize / 1024).toFixed(2)}KB
- **Chunk Count**: ${data.bundle.chunkCount}
- **Performance Score**: ${data.performance?.score || 'N/A'}/100

## Bundle Analysis

### Assets by Size

| Asset | Type | Size | Compressed |
|-------|------|------|------------|
${data.bundle.assets.slice(0, 10).map(asset => {
  const compressed = asset.compressed?.gzip
    ? `${(asset.compressed.gzip.size / 1024).toFixed(2)}KB (${asset.compressed.gzip.ratio}%)`
    : 'No';
  return `| ${asset.name} | ${asset.type.toUpperCase()} | ${(asset.size / 1024).toFixed(2)}KB | ${compressed} |`;
}).join('\n')}

### Performance Metrics

- **Total JavaScript**: ${(data.performance?.totalJS / 1024 || 0).toFixed(2)}KB
- **Total CSS**: ${(data.performance?.totalCSS / 1024 || 0).toFixed(2)}KB
- **Largest Chunk**: ${(data.performance?.largestChunk / 1024 || 0).toFixed(2)}KB

## Recommendations

${data.recommendations.map(rec =>
  `- **${rec.severity.toUpperCase()}**: ${rec.message}`
).join('\n')}

## Dependencies

- **Production**: ${data.dependencies.production.length} packages
- **Development**: ${data.dependencies.development.length} packages
- **Total**: ${data.dependencies.total} packages

## Source Code

- **Files**: ${data.sourceCode?.fileCount || 'N/A'}
- **Total Size**: ${(data.sourceCode?.totalSize / 1024 || 0).toFixed(2)}KB
`;
  }

  // Print summary to console
  printSummary() {
    console.log('\n📊 Build Optimization Summary:');
    console.log('================================');
    console.log(`Build Time: ${this.metrics.buildTime}ms`);
    console.log(`Bundle Size: ${(this.metrics.bundleSize / 1024).toFixed(2)}KB`);
    console.log(`Chunk Count: ${this.metrics.chunkCount}`);
    console.log(`Performance Score: ${this.metrics.performance?.score || 'N/A'}/100`);

    const topAssets = this.metrics.assets.slice(0, 5);
    console.log('\nTop 5 Assets by Size:');
    topAssets.forEach((asset, i) => {
      console.log(`${i + 1}. ${asset.name}: ${(asset.size / 1024).toFixed(2)}KB`);
    });

    if (this.metrics.performance?.compressionEfficiency) {
      console.log(`\nCompression Savings: ${this.metrics.performance.compressionEfficiency.ratio}%`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode' && args[i + 1]) {
      options.mode = args[i + 1];
      i++;
    } else if (arg === '--no-analyze') {
      options.analyze = false;
    } else if (arg === '--no-compress') {
      options.compress = false;
    } else if (arg === '--no-benchmark') {
      options.benchmark = false;
    } else if (arg === '--output-dir' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    }
  }

  const optimizer = new BuildOptimizer(options);
  await optimizer.optimize();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BuildOptimizer };