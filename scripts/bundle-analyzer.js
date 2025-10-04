#!/usr/bin/env node

import { analyzeBundle } from 'rollup-plugin-visualizer';
import { build } from 'vite';
import fs from 'fs/promises';
import path from 'path';

/**
 * Advanced Bundle Analysis Tool
 * Provides detailed insights into bundle composition, optimization opportunities,
 * and performance recommendations for production builds.
 */

class BundleAnalyzer {
  constructor() {
    this.outputDir = 'bundle-analysis';
    this.reports = [];
  }

  async initialize() {
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    console.log('🔍 Bundle Analysis Tool Initialized');
  }

  async analyzeBundleComposition() {
    console.log('📊 Analyzing bundle composition...');

    // Build with detailed analysis
    await build({
      build: {
        rollupOptions: {
          plugins: [
            analyzeBundle({
              filename: `${this.outputDir}/bundle-composition.html`,
              title: 'BeProductive Bundle Analysis',
              open: false,
              gzipSize: true,
              brotliSize: true,
              template: 'treemap'
            })
          ]
        }
      }
    });

    // Generate detailed report
    const compositionReport = await this.generateCompositionReport();
    this.reports.push(compositionReport);

    return compositionReport;
  }

  async generateCompositionReport() {
    // Analyze chunk sizes and dependencies
    const distPath = 'dist/assets';
    let files = [];

    try {
      const dirContents = await fs.readdir(distPath);
      files = await Promise.all(
        dirContents.map(async (file) => {
          const filePath = path.join(distPath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            type: path.extname(file),
            path: filePath
          };
        })
      );
    } catch (error) {
      console.warn('⚠️ Could not analyze dist files, building first...');
    }

    const report = {
      timestamp: new Date().toISOString(),
      files: files.sort((a, b) => b.size - a.size),
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      jsFiles: files.filter(f => f.type === '.js'),
      cssFiles: files.filter(f => f.type === '.css'),
      assetFiles: files.filter(f => !['.js', '.css'].includes(f.type))
    };

    // Calculate optimization opportunities
    report.optimizations = this.calculateOptimizations(report);

    await fs.writeFile(
      `${this.outputDir}/composition-report.json`,
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  calculateOptimizations(report) {
    const optimizations = [];

    // Large bundle detection
    const largeBundles = report.jsFiles.filter(f => f.size > 1024 * 1024); // > 1MB
    if (largeBundles.length > 0) {
      optimizations.push({
        type: 'large-bundles',
        severity: 'high',
        message: `Found ${largeBundles.length} large JavaScript bundles`,
        files: largeBundles.map(f => f.name),
        recommendation: 'Consider code splitting and lazy loading'
      });
    }

    // Duplicate dependency detection (simplified)
    const potentialDuplicates = this.findPotentialDuplicates(report.jsFiles);
    if (potentialDuplicates.length > 0) {
      optimizations.push({
        type: 'potential-duplicates',
        severity: 'medium',
        message: 'Potential duplicate dependencies detected',
        files: potentialDuplicates,
        recommendation: 'Review bundler configuration for deduplication'
      });
    }

    // Asset optimization
    const largeAssets = report.assetFiles.filter(f => f.size > 512 * 1024); // > 512KB
    if (largeAssets.length > 0) {
      optimizations.push({
        type: 'large-assets',
        severity: 'medium',
        message: `Found ${largeAssets.length} large asset files`,
        files: largeAssets.map(f => f.name),
        recommendation: 'Consider asset optimization and compression'
      });
    }

    return optimizations;
  }

  findPotentialDuplicates(jsFiles) {
    // Simple heuristic: files with similar names might be duplicates
    const duplicates = [];
    const basenames = jsFiles.map(f => f.name.replace(/[-.\d]+/, ''));
    const counts = {};

    basenames.forEach(base => {
      counts[base] = (counts[base] || 0) + 1;
    });

    Object.entries(counts).forEach(([base, count]) => {
      if (count > 1) {
        duplicates.push(base);
      }
    });

    return duplicates;
  }

  async generatePerformanceBudget() {
    console.log('💰 Generating performance budget...');

    const budget = {
      maxBundleSize: 2 * 1024 * 1024, // 2MB
      maxChunkSize: 1 * 1024 * 1024,   // 1MB
      maxAssetSize: 512 * 1024,        // 512KB
      maxTotalSize: 5 * 1024 * 1024,   // 5MB
      maxChunks: 20,
      compression: {
        gzip: 0.3,  // Expected gzip ratio
        brotli: 0.25 // Expected brotli ratio
      },
      performance: {
        firstContentfulPaint: 1.5, // seconds
        largestContentfulPaint: 2.5,
        firstInputDelay: 100, // milliseconds
        cumulativeLayoutShift: 0.1
      }
    };

    const report = this.reports[this.reports.length - 1];
    if (report) {
      budget.violations = this.checkBudgetViolations(budget, report);
    }

    await fs.writeFile(
      `${this.outputDir}/performance-budget.json`,
      JSON.stringify(budget, null, 2)
    );

    return budget;
  }

  checkBudgetViolations(budget, report) {
    const violations = [];

    // Check total size
    if (report.totalSize > budget.maxTotalSize) {
      violations.push({
        type: 'total-size',
        current: report.totalSize,
        limit: budget.maxTotalSize,
        severity: 'high'
      });
    }

    // Check individual file sizes
    report.jsFiles.forEach(file => {
      if (file.size > budget.maxChunkSize) {
        violations.push({
          type: 'chunk-size',
          file: file.name,
          current: file.size,
          limit: budget.maxChunkSize,
          severity: 'medium'
        });
      }
    });

    // Check number of chunks
    if (report.jsFiles.length > budget.maxChunks) {
      violations.push({
        type: 'chunk-count',
        current: report.jsFiles.length,
        limit: budget.maxChunks,
        severity: 'low'
      });
    }

    return violations;
  }

  async generateOptimizationRecommendations() {
    console.log('🎯 Generating optimization recommendations...');

    const recommendations = {
      codeSpplitting: {
        routes: 'Implement route-based code splitting',
        components: 'Lazy load heavy components',
        libraries: 'Split vendor libraries into separate chunks'
      },
      compression: {
        gzip: 'Enable gzip compression on server',
        brotli: 'Enable Brotli compression for better ratios',
        assets: 'Compress images and optimize formats'
      },
      caching: {
        longTerm: 'Use content hashing for long-term caching',
        serviceWorker: 'Implement service worker for offline caching',
        cdn: 'Use CDN for static assets'
      },
      treeshaking: {
        unused: 'Remove unused code',
        imports: 'Use named imports instead of default imports',
        sideEffects: 'Mark packages as side-effect free'
      },
      preloading: {
        critical: 'Preload critical resources',
        dns: 'Use DNS prefetching for external resources',
        modules: 'Preload key JavaScript modules'
      }
    };

    await fs.writeFile(
      `${this.outputDir}/optimization-recommendations.json`,
      JSON.stringify(recommendations, null, 2)
    );

    return recommendations;
  }

  async generateSummaryReport() {
    console.log('📋 Generating summary report...');

    const summary = {
      timestamp: new Date().toISOString(),
      analysis: {
        totalReports: this.reports.length,
        bundleSize: this.reports[0]?.totalSize || 0,
        optimizations: this.reports[0]?.optimizations?.length || 0
      },
      recommendations: [
        'Implement code splitting for routes',
        'Optimize large assets',
        'Enable compression',
        'Set up performance monitoring'
      ],
      nextSteps: [
        'Review bundle composition report',
        'Implement recommended optimizations',
        'Set up automated performance budgets',
        'Monitor bundle size in CI/CD'
      ]
    };

    await fs.writeFile(
      `${this.outputDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    );

    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport(summary);
    await fs.writeFile(`${this.outputDir}/BUNDLE_ANALYSIS.md`, humanReport);

    return summary;
  }

  generateHumanReadableReport(summary) {
    return `# Bundle Analysis Report

Generated: ${summary.timestamp}

## Summary
- **Bundle Size**: ${(summary.analysis.bundleSize / 1024 / 1024).toFixed(2)} MB
- **Optimization Opportunities**: ${summary.analysis.optimizations}
- **Reports Generated**: ${summary.analysis.totalReports}

## Key Recommendations

${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${summary.nextSteps.map(step => `1. ${step}`).join('\n')}

## Files Generated
- \`bundle-composition.html\` - Interactive bundle visualization
- \`composition-report.json\` - Detailed composition analysis
- \`performance-budget.json\` - Performance budget configuration
- \`optimization-recommendations.json\` - Optimization strategies

## Usage
1. Open \`bundle-composition.html\` in your browser for interactive analysis
2. Review optimization recommendations
3. Implement suggested improvements
4. Monitor bundle size in CI/CD pipeline
`;
  }

  async run() {
    try {
      await this.initialize();

      console.log('🚀 Starting comprehensive bundle analysis...\n');

      await this.analyzeBundleComposition();
      await this.generatePerformanceBudget();
      await this.generateOptimizationRecommendations();
      const summary = await this.generateSummaryReport();

      console.log('\n✅ Bundle analysis complete!');
      console.log(`📁 Reports saved to: ${this.outputDir}/`);
      console.log(`📊 Bundle size: ${(summary.analysis.bundleSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🎯 Optimizations found: ${summary.analysis.optimizations}`);

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer();
  analyzer.run();
}

export default BundleAnalyzer;