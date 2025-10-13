#!/usr/bin/env node

/**
 * Advanced Bundle Analyzer
 * Comprehensive analysis tool for Vite build outputs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class AdvancedBundleAnalyzer {
  constructor(options = {}) {
    this.options = {
      buildDir: 'dist',
      outputFile: 'bundle-analysis-detailed.json',
      generateHtml: true,
      threshold: 1024, // Only analyze files larger than 1KB
      ...options
    };

    this.analysis = {
      timestamp: new Date().toISOString(),
      summary: {},
      chunks: [],
      dependencies: {},
      duplicates: [],
      unusedExports: [],
      recommendations: []
    };
  }

  // Main analysis method
  async analyze() {
    console.log('🔍 Starting advanced bundle analysis...\n');

    const buildDir = path.join(projectRoot, this.options.buildDir);

    if (!fs.existsSync(buildDir)) {
      throw new Error(`Build directory not found: ${buildDir}`);
    }

    // Step 1: Analyze build output structure
    await this.analyzeStructure(buildDir);

    // Step 2: Analyze chunk contents and dependencies
    await this.analyzeChunks(buildDir);

    // Step 3: Detect duplicate code
    await this.detectDuplicates();

    // Step 4: Analyze dependency usage
    await this.analyzeDependencies();

    // Step 5: Generate recommendations
    this.generateRecommendations();

    // Step 6: Save analysis results
    await this.saveResults();

    console.log('\n✅ Bundle analysis completed!');
    this.printSummary();
  }

  // Analyze build output structure
  async analyzeStructure(buildDir) {
    console.log('📊 Analyzing build structure...');

    const structure = this.walkDirectory(buildDir);

    this.analysis.summary = {
      totalFiles: structure.files.length,
      totalSize: structure.totalSize,
      assetTypes: this.categorizeAssets(structure.files),
      directories: structure.directories
    };

    console.log(`   Found ${structure.files.length} files (${(structure.totalSize / 1024).toFixed(2)}KB total)`);
  }

  // Walk directory and collect file information
  walkDirectory(dir, relativePath = '') {
    let files = [];
    let totalSize = 0;
    let directories = [];

    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        directories.push(relativeItemPath);
        const subResult = this.walkDirectory(itemPath, relativeItemPath);
        files = files.concat(subResult.files);
        totalSize += subResult.totalSize;
      } else {
        const fileInfo = {
          name: item,
          path: relativeItemPath,
          fullPath: itemPath,
          size: stat.size,
          type: this.getFileType(item),
          extension: path.extname(item)
        };

        files.push(fileInfo);
        totalSize += stat.size;
      }
    });

    return { files, totalSize, directories };
  }

  // Get file type based on extension
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();

    if (['.js', '.mjs', '.ts'].includes(ext)) return 'javascript';
    if (['.css', '.scss', '.sass', '.less'].includes(ext)) return 'stylesheet';
    if (['.html', '.htm'].includes(ext)) return 'html';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) return 'font';
    if (['.json'].includes(ext)) return 'data';
    if (['.map'].includes(ext)) return 'sourcemap';

    return 'other';
  }

  // Categorize assets by type
  categorizeAssets(files) {
    const categories = {};

    files.forEach(file => {
      const type = file.type;
      if (!categories[type]) {
        categories[type] = {
          count: 0,
          totalSize: 0,
          files: []
        };
      }

      categories[type].count++;
      categories[type].totalSize += file.size;
      categories[type].files.push(file);
    });

    return categories;
  }

  // Analyze individual chunks
  async analyzeChunks(buildDir) {
    console.log('🧩 Analyzing JavaScript chunks...');

    const jsFiles = this.analysis.summary.assetTypes.javascript?.files || [];

    for (const file of jsFiles) {
      if (file.size < this.options.threshold) continue;

      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const chunkAnalysis = this.analyzeChunkContent(file, content);
        this.analysis.chunks.push(chunkAnalysis);
      } catch (error) {
        console.warn(`   Warning: Could not analyze ${file.name}: ${error.message}`);
      }
    }

    console.log(`   Analyzed ${this.analysis.chunks.length} JavaScript chunks`);
  }

  // Analyze individual chunk content
  analyzeChunkContent(file, content) {
    const analysis = {
      file: file.name,
      path: file.path,
      size: file.size,
      imports: [],
      exports: [],
      dependencies: [],
      complexity: this.calculateComplexity(content),
      functions: this.extractFunctions(content),
      components: this.extractComponents(content)
    };

    // Extract import statements
    const importMatches = content.match(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g) || [];
    analysis.imports = importMatches.map(match => {
      const fromMatch = match.match(/from\s+['"`]([^'"`]+)['"`]/);
      return fromMatch ? fromMatch[1] : null;
    }).filter(Boolean);

    // Extract export statements
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g) || [];
    analysis.exports = exportMatches.map(match => {
      const nameMatch = match.match(/(?:class|function|const|let|var)\s+(\w+)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);

    // Identify third-party dependencies
    analysis.dependencies = analysis.imports
      .filter(imp => !imp.startsWith('.') && !imp.startsWith('/'))
      .map(dep => dep.split('/')[0]);

    return analysis;
  }

  // Calculate code complexity score
  calculateComplexity(content) {
    const metrics = {
      lines: content.split('\n').length,
      functions: (content.match(/function\s+\w+/g) || []).length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      conditions: (content.match(/if\s*\(/g) || []).length,
      loops: (content.match(/(for|while)\s*\(/g) || []).length,
      callbacks: (content.match(/\=\>\s*[{(]/g) || []).length
    };

    // Simple complexity score
    const score = metrics.functions * 2 +
                  metrics.classes * 3 +
                  metrics.conditions +
                  metrics.loops * 2 +
                  metrics.callbacks;

    return { ...metrics, score };
  }

  // Extract function names
  extractFunctions(content) {
    const functionMatches = content.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*=>\s*{|function))/g) || [];
    return functionMatches.map(match => {
      const nameMatch = match.match(/(?:function\s+(\w+)|const\s+(\w+))/);
      return nameMatch ? (nameMatch[1] || nameMatch[2]) : null;
    }).filter(Boolean);
  }

  // Extract React component names
  extractComponents(content) {
    const componentMatches = content.match(/(?:const|function)\s+([A-Z]\w+)(?:\s*=\s*(?:React\.)?(?:memo|forwardRef)?\s*\(|\s*\()/g) || [];
    return componentMatches.map(match => {
      const nameMatch = match.match(/(?:const|function)\s+([A-Z]\w+)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  }

  // Detect duplicate code across chunks
  async detectDuplicates() {
    console.log('🔍 Detecting duplicate code...');

    const duplicates = new Map();

    // Compare chunks for similar function signatures
    for (let i = 0; i < this.analysis.chunks.length; i++) {
      for (let j = i + 1; j < this.analysis.chunks.length; j++) {
        const chunk1 = this.analysis.chunks[i];
        const chunk2 = this.analysis.chunks[j];

        // Check for common functions
        const commonFunctions = chunk1.functions.filter(fn =>
          chunk2.functions.includes(fn)
        );

        if (commonFunctions.length > 0) {
          const key = commonFunctions.sort().join(',');
          if (!duplicates.has(key)) {
            duplicates.set(key, []);
          }
          duplicates.get(key).push(chunk1.file, chunk2.file);
        }

        // Check for common dependencies
        const commonDeps = chunk1.dependencies.filter(dep =>
          chunk2.dependencies.includes(dep)
        );

        if (commonDeps.length > 3) { // Threshold for potential optimization
          this.analysis.duplicates.push({
            type: 'dependencies',
            files: [chunk1.file, chunk2.file],
            items: commonDeps,
            impact: 'medium'
          });
        }
      }
    }

    // Convert function duplicates to analysis format
    duplicates.forEach((files, functions) => {
      this.analysis.duplicates.push({
        type: 'functions',
        files: [...new Set(files)],
        items: functions.split(','),
        impact: 'high'
      });
    });

    console.log(`   Found ${this.analysis.duplicates.length} potential duplications`);
  }

  // Analyze dependency usage patterns
  async analyzeDependencies() {
    console.log('📦 Analyzing dependency patterns...');

    const depUsage = new Map();

    // Count dependency usage across chunks
    this.analysis.chunks.forEach(chunk => {
      chunk.dependencies.forEach(dep => {
        if (!depUsage.has(dep)) {
          depUsage.set(dep, {
            name: dep,
            usage: 0,
            chunks: [],
            totalSize: 0
          });
        }

        const usage = depUsage.get(dep);
        usage.usage++;
        usage.chunks.push(chunk.file);
        usage.totalSize += chunk.size;
      });
    });

    // Convert to analysis format
    this.analysis.dependencies = Array.from(depUsage.values())
      .sort((a, b) => b.usage - a.usage);

    console.log(`   Analyzed ${this.analysis.dependencies.length} unique dependencies`);
  }

  // Generate optimization recommendations
  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // Large chunk recommendations
    const largeChunks = this.analysis.chunks
      .filter(chunk => chunk.size > 250 * 1024)
      .sort((a, b) => b.size - a.size);

    largeChunks.forEach(chunk => {
      recommendations.push({
        type: 'large-chunk',
        severity: 'high',
        title: `Large chunk detected: ${chunk.file}`,
        description: `Chunk is ${(chunk.size / 1024).toFixed(2)}KB. Consider code splitting.`,
        file: chunk.file,
        impact: 'performance',
        effort: 'medium'
      });
    });

    // Duplicate code recommendations
    this.analysis.duplicates.forEach(duplicate => {
      if (duplicate.type === 'functions' && duplicate.files.length > 2) {
        recommendations.push({
          type: 'duplicate-code',
          severity: 'medium',
          title: 'Duplicate functions detected',
          description: `Functions ${duplicate.items.join(', ')} appear in multiple chunks.`,
          files: duplicate.files,
          impact: 'bundle-size',
          effort: 'high'
        });
      }
    });

    // Dependency optimization recommendations
    const heavyDeps = this.analysis.dependencies
      .filter(dep => dep.usage === 1 && dep.totalSize > 50 * 1024);

    heavyDeps.forEach(dep => {
      recommendations.push({
        type: 'heavy-dependency',
        severity: 'medium',
        title: `Heavy dependency used once: ${dep.name}`,
        description: `${dep.name} is only used in one chunk but adds significant size.`,
        dependency: dep.name,
        impact: 'bundle-size',
        effort: 'low'
      });
    });

    // Unused exports recommendations
    const chunksWithManyExports = this.analysis.chunks
      .filter(chunk => chunk.exports.length > 10 && chunk.complexity.score > 100);

    chunksWithManyExports.forEach(chunk => {
      recommendations.push({
        type: 'potential-tree-shaking',
        severity: 'low',
        title: `Many exports in complex chunk: ${chunk.file}`,
        description: 'Consider reviewing exports for tree-shaking opportunities.',
        file: chunk.file,
        impact: 'bundle-size',
        effort: 'medium'
      });
    });

    this.analysis.recommendations = recommendations
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

    console.log(`   Generated ${recommendations.length} recommendations`);
  }

  // Save analysis results
  async saveResults() {
    const outputPath = path.join(projectRoot, this.options.buildDir, this.options.outputFile);

    // Save JSON report
    fs.writeFileSync(outputPath, JSON.stringify(this.analysis, null, 2));

    // Generate HTML report if requested
    if (this.options.generateHtml) {
      const htmlPath = path.join(projectRoot, this.options.buildDir, 'bundle-analysis-detailed.html');
      const htmlContent = this.generateHtmlReport();
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`   HTML report: ${htmlPath}`);
    }

    console.log(`   Analysis saved: ${outputPath}`);
  }

  // Generate HTML report
  generateHtmlReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Bundle Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .chunk { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .recommendation { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .high { background: #ffebee; border-left: 4px solid #f44336; }
        .medium { background: #fff3e0; border-left: 4px solid #ff9800; }
        .low { background: #e8f5e8; border-left: 4px solid #4caf50; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Advanced Bundle Analysis Report</h1>
    <p>Generated: ${this.analysis.timestamp}</p>

    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Files:</strong> ${this.analysis.summary.totalFiles}</p>
        <p><strong>Total Size:</strong> ${(this.analysis.summary.totalSize / 1024).toFixed(2)}KB</p>
        <p><strong>JavaScript Chunks:</strong> ${this.analysis.chunks.length}</p>
        <p><strong>Dependencies:</strong> ${this.analysis.dependencies.length}</p>
        <p><strong>Duplicates Found:</strong> ${this.analysis.duplicates.length}</p>
        <p><strong>Recommendations:</strong> ${this.analysis.recommendations.length}</p>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        ${this.analysis.recommendations.map(rec => `
            <div class="recommendation ${rec.severity}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <small>Impact: ${rec.impact} | Effort: ${rec.effort}</small>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Largest Chunks</h2>
        <table>
            <tr>
                <th>File</th>
                <th>Size</th>
                <th>Functions</th>
                <th>Components</th>
                <th>Dependencies</th>
                <th>Complexity</th>
            </tr>
            ${this.analysis.chunks
              .sort((a, b) => b.size - a.size)
              .slice(0, 10)
              .map(chunk => `
                <tr>
                    <td>${chunk.file}</td>
                    <td>${(chunk.size / 1024).toFixed(2)}KB</td>
                    <td>${chunk.functions.length}</td>
                    <td>${chunk.components.length}</td>
                    <td>${chunk.dependencies.length}</td>
                    <td>${chunk.complexity.score}</td>
                </tr>
              `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Dependencies Usage</h2>
        <table>
            <tr>
                <th>Dependency</th>
                <th>Usage Count</th>
                <th>Chunks</th>
            </tr>
            ${this.analysis.dependencies.slice(0, 20).map(dep => `
                <tr>
                    <td>${dep.name}</td>
                    <td>${dep.usage}</td>
                    <td>${dep.chunks.length}</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>`;
  }

  // Print summary to console
  printSummary() {
    console.log('\n📊 Bundle Analysis Summary:');
    console.log('============================');
    console.log(`Total Files: ${this.analysis.summary.totalFiles}`);
    console.log(`Total Size: ${(this.analysis.summary.totalSize / 1024).toFixed(2)}KB`);
    console.log(`JavaScript Chunks: ${this.analysis.chunks.length}`);
    console.log(`Dependencies: ${this.analysis.dependencies.length}`);
    console.log(`Recommendations: ${this.analysis.recommendations.length}`);

    if (this.analysis.recommendations.length > 0) {
      console.log('\nTop Recommendations:');
      this.analysis.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.severity.toUpperCase()}] ${rec.title}`);
      });
    }

    const largestChunks = this.analysis.chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 3);

    if (largestChunks.length > 0) {
      console.log('\nLargest Chunks:');
      largestChunks.forEach((chunk, i) => {
        console.log(`${i + 1}. ${chunk.file}: ${(chunk.size / 1024).toFixed(2)}KB`);
      });
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

    if (arg === '--build-dir' && args[i + 1]) {
      options.buildDir = args[i + 1];
      i++;
    } else if (arg === '--output' && args[i + 1]) {
      options.outputFile = args[i + 1];
      i++;
    } else if (arg === '--no-html') {
      options.generateHtml = false;
    } else if (arg === '--threshold' && args[i + 1]) {
      options.threshold = parseInt(args[i + 1]);
      i++;
    }
  }

  const analyzer = new AdvancedBundleAnalyzer(options);
  await analyzer.analyze();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AdvancedBundleAnalyzer };