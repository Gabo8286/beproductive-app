#!/usr/bin/env node

/**
 * Build Validation Script - FMEW Comprehensive Build Verification
 *
 * This script provides comprehensive build validation including:
 * 1. Pre-build dependency and code quality checks
 * 2. Build process execution and verification
 * 3. Post-build artifact validation
 * 4. Performance and size analysis
 *
 * Addresses Multiple FMEW Failure Modes:
 * - FM-01: Dependency Drift
 * - FM-02: Import Path Inconsistency
 * - FM-04: CSS Class Validation Gap
 * - FM-05: Security Vulnerability Accumulation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🏗️ Starting comprehensive build validation...');

// Configuration
const CONFIG = {
  buildCommand: 'npm run build',
  distPath: path.join(projectRoot, 'dist'),
  maxBundleSize: 2 * 1024 * 1024, // 2MB warning threshold
  requiredFiles: ['index.html'],
  requiredAssets: ['assets'],
  timeout: 300000, // 5 minutes
};

// Validation phases
const PHASES = {
  PRE_BUILD: 'pre-build',
  BUILD: 'build',
  POST_BUILD: 'post-build',
  ANALYSIS: 'analysis',
};

let startTime = Date.now();
let validationResults = {
  phases: {},
  errors: [],
  warnings: [],
  metrics: {},
};

// Utility functions
function logPhase(phase, message) {
  const timestamp = new Date().toISOString();
  console.log(`\n🔄 [${phase.toUpperCase()}] ${message}`);
  console.log(`⏰ ${timestamp}\n`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
  validationResults.warnings.push(message);
}

function logError(message) {
  console.log(`❌ ${message}`);
  validationResults.errors.push(message);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: CONFIG.timeout,
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || error.stderr || error.message,
      error: error.message,
    };
  }
}

// Phase 1: Pre-build validation
async function validatePreBuild() {
  logPhase(PHASES.PRE_BUILD, 'Running pre-build validations...');

  const checks = [
    {
      name: 'Dependency Validation',
      command: 'node scripts/validate-dependencies.js',
      critical: true,
    },
    {
      name: 'Import Path Validation',
      command: 'node scripts/validate-imports.js',
      critical: true,
    },
    {
      name: 'CSS Class Validation',
      command: 'node scripts/validate-css-classes.js',
      critical: true,
    },
    {
      name: 'TypeScript Compilation Check',
      command: 'npx tsc --noEmit',
      critical: true,
    },
    {
      name: 'ESLint Check',
      command: 'npm run lint',
      critical: false,
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`🔍 Running ${check.name}...`);
    const result = runCommand(check.command);

    if (result.success) {
      logSuccess(`${check.name} passed`);
    } else {
      const message = `${check.name} failed: ${result.error}`;
      if (check.critical) {
        logError(message);
        allPassed = false;
      } else {
        logWarning(message);
      }
    }
  }

  validationResults.phases[PHASES.PRE_BUILD] = {
    passed: allPassed,
    timestamp: new Date().toISOString(),
  };

  return allPassed;
}

// Phase 2: Build execution
async function executeBuild() {
  logPhase(PHASES.BUILD, 'Executing build process...');

  // Clean previous build
  if (fs.existsSync(CONFIG.distPath)) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync(CONFIG.distPath, { recursive: true, force: true });
  }

  // Execute build
  console.log(`🏗️ Running: ${CONFIG.buildCommand}`);
  const buildStart = Date.now();
  const result = runCommand(CONFIG.buildCommand);
  const buildTime = Date.now() - buildStart;

  validationResults.metrics.buildTime = buildTime;

  if (result.success) {
    logSuccess(`Build completed in ${buildTime}ms`);
    validationResults.phases[PHASES.BUILD] = {
      passed: true,
      buildTime,
      timestamp: new Date().toISOString(),
    };
    return true;
  } else {
    logError(`Build failed: ${result.error}`);
    validationResults.phases[PHASES.BUILD] = {
      passed: false,
      error: result.error,
      timestamp: new Date().toISOString(),
    };
    return false;
  }
}

// Phase 3: Post-build validation
async function validatePostBuild() {
  logPhase(PHASES.POST_BUILD, 'Validating build output...');

  let allPassed = true;

  // Check if dist directory exists
  if (!fs.existsSync(CONFIG.distPath)) {
    logError('Build output directory does not exist');
    allPassed = false;
    return false;
  }

  // Check required files
  for (const file of CONFIG.requiredFiles) {
    const filePath = path.join(CONFIG.distPath, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Required file found: ${file}`);
    } else {
      logError(`Required file missing: ${file}`);
      allPassed = false;
    }
  }

  // Check required asset directories
  for (const asset of CONFIG.requiredAssets) {
    const assetPath = path.join(CONFIG.distPath, asset);
    if (fs.existsSync(assetPath)) {
      logSuccess(`Required asset directory found: ${asset}`);
    } else {
      logError(`Required asset directory missing: ${asset}`);
      allPassed = false;
    }
  }

  // Validate index.html content
  const indexPath = path.join(CONFIG.distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');

    // Check for basic HTML structure
    if (content.includes('<html') && content.includes('</html>')) {
      logSuccess('index.html has valid HTML structure');
    } else {
      logError('index.html appears to be malformed');
      allPassed = false;
    }

    // Check for script tags (indicating bundled JS)
    if (content.includes('<script')) {
      logSuccess('index.html includes bundled scripts');
    } else {
      logWarning('index.html may be missing bundled scripts');
    }

    // Check for CSS links
    if (content.includes('<link') && content.includes('stylesheet')) {
      logSuccess('index.html includes stylesheets');
    } else {
      logWarning('index.html may be missing stylesheets');
    }
  }

  validationResults.phases[PHASES.POST_BUILD] = {
    passed: allPassed,
    timestamp: new Date().toISOString(),
  };

  return allPassed;
}

// Phase 4: Build analysis
async function analyzeBuild() {
  logPhase(PHASES.ANALYSIS, 'Analyzing build output...');

  const analysis = {
    totalSize: 0,
    fileCount: 0,
    assetSizes: {},
    warnings: [],
  };

  // Calculate total build size
  function calculateDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subResult = calculateDirectorySize(fullPath);
          totalSize += subResult.size;
          fileCount += subResult.count;
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
          fileCount += 1;

          // Track large files
          if (stats.size > 500 * 1024) { // > 500KB
            analysis.warnings.push(`Large file detected: ${entry.name} (${(stats.size / 1024).toFixed(2)}KB)`);
          }

          // Track asset sizes by type
          const ext = path.extname(entry.name).toLowerCase();
          if (!analysis.assetSizes[ext]) {
            analysis.assetSizes[ext] = { count: 0, totalSize: 0 };
          }
          analysis.assetSizes[ext].count += 1;
          analysis.assetSizes[ext].totalSize += stats.size;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze directory ${dirPath}: ${error.message}`);
    }

    return { size: totalSize, count: fileCount };
  }

  const sizeResult = calculateDirectorySize(CONFIG.distPath);
  analysis.totalSize = sizeResult.size;
  analysis.fileCount = sizeResult.count;

  // Report analysis results
  console.log(`📊 Build Analysis Results:`);
  console.log(`   Total Size: ${(analysis.totalSize / 1024).toFixed(2)}KB`);
  console.log(`   File Count: ${analysis.fileCount}`);

  // Check bundle size
  if (analysis.totalSize > CONFIG.maxBundleSize) {
    logWarning(`Build size exceeds recommended threshold: ${(analysis.totalSize / 1024).toFixed(2)}KB > ${(CONFIG.maxBundleSize / 1024).toFixed(2)}KB`);
  } else {
    logSuccess(`Build size is within recommended limits`);
  }

  // Report asset breakdown
  console.log(`\n📁 Asset Breakdown:`);
  Object.entries(analysis.assetSizes).forEach(([ext, data]) => {
    console.log(`   ${ext || 'no-ext'}: ${data.count} files, ${(data.totalSize / 1024).toFixed(2)}KB`);
  });

  // Report warnings
  if (analysis.warnings.length > 0) {
    console.log(`\n⚠️  Build Warnings:`);
    analysis.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  validationResults.metrics = {
    ...validationResults.metrics,
    totalSize: analysis.totalSize,
    fileCount: analysis.fileCount,
    assetSizes: analysis.assetSizes,
  };

  validationResults.phases[PHASES.ANALYSIS] = {
    passed: true,
    analysis,
    timestamp: new Date().toISOString(),
  };

  return true;
}

// Generate final report
function generateReport() {
  const totalTime = Date.now() - startTime;
  const allPhasesPassed = Object.values(validationResults.phases).every(phase => phase.passed);

  console.log('\n' + '='.repeat(60));
  console.log('🏗️ BUILD VALIDATION REPORT');
  console.log('='.repeat(60));

  console.log(`\n📊 Summary:`);
  console.log(`   Total Time: ${totalTime}ms`);
  console.log(`   Phases: ${Object.keys(validationResults.phases).length}`);
  console.log(`   Errors: ${validationResults.errors.length}`);
  console.log(`   Warnings: ${validationResults.warnings.length}`);

  console.log(`\n📋 Phase Results:`);
  Object.entries(validationResults.phases).forEach(([phase, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${status} ${phase}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  });

  if (validationResults.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    validationResults.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (validationResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    validationResults.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (validationResults.metrics.buildTime) {
    console.log(`\n⏱️  Performance Metrics:`);
    console.log(`   Build Time: ${validationResults.metrics.buildTime}ms`);
    if (validationResults.metrics.totalSize) {
      console.log(`   Bundle Size: ${(validationResults.metrics.totalSize / 1024).toFixed(2)}KB`);
      console.log(`   File Count: ${validationResults.metrics.fileCount}`);
    }
  }

  console.log('\n' + '='.repeat(60));

  return allPhasesPassed;
}

// Main execution
async function main() {
  try {
    // Execute all validation phases
    const preValidation = await validatePreBuild();
    if (!preValidation) {
      console.log('\n💥 Pre-build validation failed. Stopping build process.');
      return false;
    }

    const buildSuccess = await executeBuild();
    if (!buildSuccess) {
      console.log('\n💥 Build execution failed.');
      return false;
    }

    const postValidation = await validatePostBuild();
    const analysis = await analyzeBuild();

    // Generate final report
    const overallSuccess = generateReport();

    if (overallSuccess) {
      console.log('\n🎉 BUILD VALIDATION SUCCESSFUL!');
      console.log('All quality gates passed. Build is ready for deployment.');
      return true;
    } else {
      console.log('\n💥 BUILD VALIDATION FAILED!');
      console.log('Please fix the issues above before deploying.');
      return false;
    }
  } catch (error) {
    logError(`Build validation failed with error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { main as validateBuild };