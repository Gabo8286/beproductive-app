#!/usr/bin/env node

/**
 * Import Path Validation Script - FMEW Countermeasure for FM-02
 *
 * This script enforces consistent import path patterns by validating:
 * 1. All internal imports use the @/ alias consistently
 * 2. No mixed relative/alias path usage
 * 3. Proper import path structure
 * 4. No circular dependencies
 *
 * Addresses FMEW Failure Mode: FM-02 (Import Path Inconsistency)
 * Risk Priority Number: 336 (High)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Starting import path validation...');

// Configuration
const CONFIG = {
  srcPath: path.join(projectRoot, 'src'),
  aliasPattern: /^@\//,
  relativePattern: /^\.{1,2}\//,
  maxImportDepth: 3, // Maximum relative import depth (../../../)
};

// Get all TypeScript/JavaScript files
function getSourceFiles() {
  const files = [];

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(CONFIG.srcPath)) {
    scanDirectory(CONFIG.srcPath);
  }

  return files;
}

// Extract import information from file
function extractImportInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const lines = content.split('\n');

  // Match various import patterns
  const importPatterns = [
    /import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // Dynamic imports
  ];

  lines.forEach((line, lineNumber) => {
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const importPath = match[1];
        imports.push({
          path: importPath,
          line: lineNumber + 1,
          fullLine: line.trim(),
        });
      }
      pattern.lastIndex = 0; // Reset regex
    });
  });

  return imports;
}

// Validate import path consistency
function validateImportConsistency(filePath, imports) {
  const errors = [];
  const relativePath = path.relative(CONFIG.srcPath, filePath);

  for (const imp of imports) {
    const { path: importPath, line, fullLine } = imp;

    // Skip external packages (those without relative or alias paths)
    if (!CONFIG.aliasPattern.test(importPath) && !CONFIG.relativePattern.test(importPath)) {
      continue;
    }

    // Check for mixed patterns within the same file
    if (CONFIG.relativePattern.test(importPath)) {
      // Validate relative import depth
      const depth = (importPath.match(/\.\.\//g) || []).length;
      if (depth > CONFIG.maxImportDepth) {
        errors.push({
          file: relativePath,
          line,
          message: `Relative import depth (${depth}) exceeds maximum (${CONFIG.maxImportDepth})`,
          suggestion: 'Consider using @/ alias instead',
          fullLine,
        });
      }

      // Check if this should use alias instead
      const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
      const isWithinSrc = absoluteImportPath.startsWith(CONFIG.srcPath);

      if (isWithinSrc && depth >= 2) {
        errors.push({
          file: relativePath,
          line,
          message: 'Deep relative import should use @/ alias for better maintainability',
          suggestion: `Use @/ alias instead of ${importPath}`,
          fullLine,
        });
      }
    }

    // Validate alias imports
    if (CONFIG.aliasPattern.test(importPath)) {
      // Check if alias resolves correctly
      const aliasPath = importPath.replace(/^@\//, '');
      const absolutePath = path.join(CONFIG.srcPath, aliasPath);

      // Check if the file exists (with possible extensions)
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      const fileExists = extensions.some(ext => {
        try {
          return fs.existsSync(absolutePath + ext);
        } catch {
          return false;
        }
      });

      if (!fileExists) {
        errors.push({
          file: relativePath,
          line,
          message: `Alias import path does not resolve to existing file: ${importPath}`,
          suggestion: 'Check the path and ensure the file exists',
          fullLine,
        });
      }
    }
  }

  return errors;
}

// Check for circular dependencies
function detectCircularDependencies(files) {
  const dependencyGraph = new Map();
  const errors = [];

  // Build dependency graph
  for (const file of files) {
    const imports = extractImportInfo(file);
    const internalImports = imports
      .filter(imp => CONFIG.aliasPattern.test(imp.path) || CONFIG.relativePattern.test(imp.path))
      .map(imp => {
        if (CONFIG.aliasPattern.test(imp.path)) {
          return path.join(CONFIG.srcPath, imp.path.replace(/^@\//, ''));
        } else {
          return path.resolve(path.dirname(file), imp.path);
        }
      })
      .filter(Boolean);

    dependencyGraph.set(file, internalImports);
  }

  // Detect cycles using DFS
  function hasCycle(node, visited, recStack, path) {
    if (recStack.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      errors.push({
        type: 'circular_dependency',
        message: 'Circular dependency detected',
        cycle: cycle.map(f => path.relative(CONFIG.srcPath, f)),
      });
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    recStack.add(node);
    path.push(node);

    const dependencies = dependencyGraph.get(node) || [];
    for (const dep of dependencies) {
      if (dependencyGraph.has(dep) && hasCycle(dep, visited, recStack, [...path])) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  const visited = new Set();
  for (const file of files) {
    if (!visited.has(file)) {
      hasCycle(file, visited, new Set(), []);
    }
  }

  return errors;
}

// Main validation function
function validateImports() {
  const files = getSourceFiles();
  let allErrors = [];

  console.log(`📁 Scanning ${files.length} source files...`);

  // Validate each file
  for (const file of files) {
    try {
      const imports = extractImportInfo(file);
      const errors = validateImportConsistency(file, imports);
      allErrors = allErrors.concat(errors);
    } catch (error) {
      allErrors.push({
        file: path.relative(CONFIG.srcPath, file),
        line: 0,
        message: `Failed to process file: ${error.message}`,
        fullLine: '',
      });
    }
  }

  // Check for circular dependencies
  console.log('🔄 Checking for circular dependencies...');
  const circularErrors = detectCircularDependencies(files);
  allErrors = allErrors.concat(circularErrors);

  return allErrors;
}

// Format and display errors
function displayErrors(errors) {
  if (errors.length === 0) {
    console.log('✅ All import paths are valid and consistent!');
    return true;
  }

  console.log(`❌ Found ${errors.length} import path issues:\n`);

  // Group errors by type
  const groupedErrors = {
    consistency: errors.filter(e => e.type !== 'circular_dependency'),
    circular: errors.filter(e => e.type === 'circular_dependency'),
  };

  // Display consistency errors
  if (groupedErrors.consistency.length > 0) {
    console.log('📋 Import Path Issues:');
    for (const error of groupedErrors.consistency) {
      console.log(`   ${error.file}:${error.line}`);
      console.log(`     ❌ ${error.message}`);
      if (error.suggestion) {
        console.log(`     💡 ${error.suggestion}`);
      }
      if (error.fullLine) {
        console.log(`     📝 ${error.fullLine}`);
      }
      console.log('');
    }
  }

  // Display circular dependency errors
  if (groupedErrors.circular.length > 0) {
    console.log('🔄 Circular Dependencies:');
    for (const error of groupedErrors.circular) {
      console.log(`   ❌ ${error.message}`);
      console.log(`   📍 Cycle: ${error.cycle.join(' → ')}`);
      console.log('');
    }
  }

  console.log('💡 Fix these issues to ensure consistent and maintainable imports.');
  return false;
}

// Main execution
async function main() {
  try {
    const errors = validateImports();
    const isValid = displayErrors(errors);

    if (isValid) {
      console.log('🎉 Import validation passed!');
      process.exit(0);
    } else {
      console.log('💥 Import validation failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error(`💥 Import validation failed with error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}