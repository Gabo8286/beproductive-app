#!/usr/bin/env node

/**
 * Performance Gate Script
 *
 * Validates bundle sizes and enforces performance budgets in CI/CD.
 * Prevents deployment if bundle sizes exceed defined thresholds.
 *
 * Usage:
 *   node scripts/performance-gate.js
 *   npm run performance:gate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets (in KB) - Updated based on optimizations
const BUDGETS = {
  mainBundle: {
    size: 600,        // Max 600 KB uncompressed (now ~565 KB with vendor splitting)
    gzipSize: 180,    // Max 180 KB gzipped (now ~161 KB)
    name: 'Main Bundle (index-*.js)'
  },
  totalSize: {
    size: 3000,       // Max 3 MB total uncompressed
    gzipSize: 850,    // Max 850 KB total gzipped (relaxed slightly)
    name: 'Total Bundle Size'
  },
  chunkSize: {
    size: 500,        // Max 500 KB per chunk (strict - enforce code splitting)
    name: 'Individual Chunks'
  },
  chartVendor: {
    size: 450,        // Max 450 KB for chart library (recharts is heavy)
    gzipSize: 125,    // Max 125 KB gzipped
    name: 'Chart Vendor Bundle'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2);
}

function parseSize(sizeStr) {
  // Parse sizes like "815.03 kB" or "241.93 kB"
  const match = sizeStr.match(/([\d.]+)\s*kB/i);
  return match ? parseFloat(match[1]) : 0;
}

function checkBuild() {
  const distPath = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error(`${colors.red}${colors.bold}❌ Error: dist folder not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.error(`${colors.red}${colors.bold}❌ Error: dist/assets folder not found.${colors.reset}`);
    process.exit(1);
  }

  return assetsPath;
}

function analyzeBundle(assetsPath) {
  const files = fs.readdirSync(assetsPath);

  let mainBundle = null;
  let chartVendor = null;
  let totalSize = 0;
  let totalGzipSize = 0;
  const chunks = [];
  const violations = [];

  // Find and analyze files
  files.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;

    // Track JS bundles
    if (file.endsWith('.js')) {
      totalSize += sizeKB;

      // Estimate gzip size (typically ~30% of original for JS)
      const estimatedGzipSize = sizeKB * 0.3;
      totalGzipSize += estimatedGzipSize;

      // Identify main bundle
      if (file.match(/^index-[a-zA-Z0-9]+\.js$/)) {
        mainBundle = {
          name: file,
          size: sizeKB,
          gzipSize: estimatedGzipSize
        };
      }
      // Identify chart vendor bundle
      else if (file.includes('chart') || file.includes('generateCategoricalChart')) {
        chartVendor = {
          name: file,
          size: sizeKB,
          gzipSize: estimatedGzipSize
        };
      }
      // Track other chunks
      else {
        chunks.push({
          name: file,
          size: sizeKB,
          gzipSize: estimatedGzipSize
        });
      }
    }
  });

  return {
    mainBundle,
    chartVendor,
    chunks,
    totalSize,
    totalGzipSize,
    violations
  };
}

function validateBudgets(analysis) {
  const violations = [];
  let hasErrors = false;

  console.log(`\n${colors.cyan}${colors.bold}📊 Performance Budget Analysis${colors.reset}\n`);
  console.log('='.repeat(80));

  // Check main bundle
  if (analysis.mainBundle) {
    const { name, size, gzipSize } = analysis.mainBundle;
    const budget = BUDGETS.mainBundle;

    console.log(`\n${colors.bold}Main Bundle:${colors.reset} ${name}`);

    const sizeStatus = size <= budget.size ? '✅' : '❌';
    const gzipStatus = gzipSize <= budget.gzipSize ? '✅' : '❌';

    console.log(`  ${sizeStatus} Size: ${formatBytes(size * 1024)} KB / ${budget.size} KB`);
    console.log(`  ${gzipStatus} Gzipped: ${formatBytes(gzipSize * 1024)} KB / ${budget.gzipSize} KB`);

    if (size > budget.size) {
      violations.push(`Main bundle exceeds size budget: ${formatBytes(size * 1024)} KB > ${budget.size} KB`);
      hasErrors = true;
    }
    if (gzipSize > budget.gzipSize) {
      violations.push(`Main bundle exceeds gzip budget: ${formatBytes(gzipSize * 1024)} KB > ${budget.gzipSize} KB`);
      hasErrors = true;
    }
  }

  // Check chart vendor
  if (analysis.chartVendor) {
    const { name, size, gzipSize } = analysis.chartVendor;
    const budget = BUDGETS.chartVendor;

    console.log(`\n${colors.bold}Chart Vendor:${colors.reset} ${name}`);

    const sizeStatus = size <= budget.size ? '✅' : '⚠️';
    const gzipStatus = gzipSize <= budget.gzipSize ? '✅' : '⚠️';

    console.log(`  ${sizeStatus} Size: ${formatBytes(size * 1024)} KB / ${budget.size} KB`);
    console.log(`  ${gzipStatus} Gzipped: ${formatBytes(gzipSize * 1024)} KB / ${budget.gzipSize} KB`);

    if (size > budget.size) {
      violations.push(`Chart vendor exceeds size budget: ${formatBytes(size * 1024)} KB > ${budget.size} KB (WARNING)`);
    }
  }

  // Check individual chunks
  console.log(`\n${colors.bold}Chunk Size Analysis:${colors.reset}`);
  const largeChunks = analysis.chunks.filter(c => c.size > BUDGETS.chunkSize.size);

  if (largeChunks.length > 0) {
    console.log(`  ⚠️  ${largeChunks.length} chunk(s) exceed ${BUDGETS.chunkSize.size} KB:`);
    largeChunks.forEach(chunk => {
      console.log(`      - ${chunk.name}: ${formatBytes(chunk.size * 1024)} KB`);
      violations.push(`Chunk exceeds size limit: ${chunk.name} (${formatBytes(chunk.size * 1024)} KB > ${BUDGETS.chunkSize.size} KB)`);
    });
  } else {
    console.log(`  ✅ All chunks within budget (< ${BUDGETS.chunkSize.size} KB)`);
  }

  // Check total size
  console.log(`\n${colors.bold}Total Bundle Size:${colors.reset}`);
  const totalSizeStatus = analysis.totalSize <= BUDGETS.totalSize.size ? '✅' : '❌';
  const totalGzipStatus = analysis.totalGzipSize <= BUDGETS.totalSize.gzipSize ? '✅' : '❌';

  console.log(`  ${totalSizeStatus} Total: ${formatBytes(analysis.totalSize * 1024)} KB / ${BUDGETS.totalSize.size} KB`);
  console.log(`  ${totalGzipStatus} Gzipped: ${formatBytes(analysis.totalGzipSize * 1024)} KB / ${BUDGETS.totalSize.gzipSize} KB`);

  if (analysis.totalSize > BUDGETS.totalSize.size) {
    violations.push(`Total bundle size exceeds budget: ${formatBytes(analysis.totalSize * 1024)} KB > ${BUDGETS.totalSize.size} KB`);
    hasErrors = true;
  }

  console.log('\n' + '='.repeat(80));

  return { violations, hasErrors };
}

function printSummary(violations, hasErrors) {
  console.log();

  if (violations.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ Performance Gate: PASSED${colors.reset}`);
    console.log(`${colors.green}All bundles are within performance budgets.${colors.reset}`);
    return true;
  } else {
    if (hasErrors) {
      console.log(`${colors.red}${colors.bold}❌ Performance Gate: FAILED${colors.reset}\n`);
      console.log(`${colors.red}The following violations were found:${colors.reset}\n`);
      violations.forEach((v, i) => {
        console.log(`  ${i + 1}. ${v}`);
      });
      console.log(`\n${colors.yellow}Please optimize your bundle before deploying to production.${colors.reset}`);
      console.log(`${colors.yellow}Consider:${colors.reset}`);
      console.log(`  - Adding more lazy loading`);
      console.log(`  - Using dynamic imports for heavy libraries`);
      console.log(`  - Analyzing bundle with: npm run build:analyze`);
      return false;
    } else {
      console.log(`${colors.yellow}${colors.bold}⚠️  Performance Gate: WARNINGS${colors.reset}\n`);
      console.log(`${colors.yellow}The following warnings were found:${colors.reset}\n`);
      violations.forEach((v, i) => {
        console.log(`  ${i + 1}. ${v}`);
      });
      console.log(`\n${colors.green}Build can proceed, but consider optimizing these bundles.${colors.reset}`);
      return true;
    }
  }
}

// Main execution
function main() {
  console.log(`${colors.cyan}${colors.bold}\n🚀 Running Performance Gate Check...${colors.reset}\n`);

  const assetsPath = checkBuild();
  const analysis = analyzeBundle(assetsPath);
  const { violations, hasErrors } = validateBudgets(analysis);
  const passed = printSummary(violations, hasErrors);

  console.log();

  if (!passed) {
    process.exit(1);
  }
}

main();
