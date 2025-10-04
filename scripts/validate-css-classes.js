#!/usr/bin/env node

/**
 * CSS Class Validation Script - FMEW Countermeasure for FM-04
 *
 * This script prevents CSS class validation gaps by checking:
 * 1. All CSS classes used in code exist in stylesheets or Tailwind
 * 2. No undefined CSS classes are applied
 * 3. Tailwind class consistency and validity
 * 4. Custom CSS class definitions
 *
 * Addresses FMEW Failure Mode: FM-04 (CSS Class Validation Gap)
 * Risk Priority Number: 120 (Medium)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Starting CSS class validation...');

// Configuration
const CONFIG = {
  srcPath: path.join(projectRoot, 'src'),
  cssFiles: [
    path.join(projectRoot, 'src', 'index.css'),
    path.join(projectRoot, 'src', 'app.css'),
  ],
  tailwindConfigPath: path.join(projectRoot, 'tailwind.config.ts'),
  excludePatterns: [
    /^lucide-/, // Lucide icon classes
    /^radix-/, // Radix UI classes
    /^data-/, // Data attributes
    /^aria-/, // ARIA attributes
  ],
};

// Tailwind CSS classes (common ones - this could be expanded)
const TAILWIND_CLASSES = new Set([
  // Layout
  'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'grid', 'hidden',
  'flow-root', 'contents', 'list-item', 'table-caption', 'table-cell', 'table-column',
  'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row',

  // Flexbox & Grid
  'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse', 'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
  'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
  'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',

  // Spacing (sample - Tailwind has many variations)
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'py-0', 'py-1', 'py-2', 'py-3', 'py-4',

  // Typography
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold',
  'text-left', 'text-center', 'text-right', 'text-justify',

  // Colors (sample)
  'text-black', 'text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500',
  'text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500',
  'bg-black', 'bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500',
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',

  // Borders
  'border', 'border-0', 'border-2', 'border-4', 'border-8', 'border-t', 'border-r', 'border-b', 'border-l',
  'rounded', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',

  // Effects
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none',
  'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',

  // Transitions
  'transition', 'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
  'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',

  // Positioning
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'top-0', 'right-0', 'bottom-0', 'left-0', 'inset-0',

  // Sizing
  'w-0', 'w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20', 'w-24', 'w-32', 'w-40', 'w-48', 'w-56', 'w-64',
  'w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
  'h-0', 'h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24', 'h-32', 'h-40', 'h-48', 'h-56', 'h-64',
  'h-auto', 'h-full', 'h-screen', 'h-min', 'h-max', 'h-fit',

  // Display
  'visible', 'invisible', 'sr-only', 'not-sr-only',
]);

// Get all source files
function getSourceFiles() {
  const files = [];

  function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dir}: ${error.message}`);
    }
  }

  if (fs.existsSync(CONFIG.srcPath)) {
    scanDirectory(CONFIG.srcPath);
  }

  return files;
}

// Extract CSS classes from file content
function extractCSSClasses(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const classes = new Set();

  // Patterns to match className attributes and similar
  const patterns = [
    /className\s*=\s*{[^}]*["'`]([^"'`]+)["'`][^}]*}/g, // Template literals in className
    /className\s*=\s*["'`]([^"'`]+)["'`]/g, // Simple className strings
    /class\s*=\s*["'`]([^"'`]+)["'`]/g, // HTML class attributes
    /@apply\s+([^;]+)/g, // Tailwind @apply directives
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const classString = match[1];

      // Split by whitespace and filter out dynamic parts
      const individualClasses = classString
        .split(/\s+/)
        .filter(cls => cls.trim() && !cls.includes('${') && !cls.includes('${'))
        .map(cls => cls.trim());

      individualClasses.forEach(cls => classes.add(cls));
    }
  });

  return Array.from(classes);
}

// Load custom CSS classes from stylesheets
function loadCustomCSSClasses() {
  const customClasses = new Set();

  CONFIG.cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
      try {
        const content = fs.readFileSync(cssFile, 'utf8');

        // Extract class definitions
        const classPattern = /\.([a-zA-Z][\w-]*)/g;
        let match;

        while ((match = classPattern.exec(content)) !== null) {
          customClasses.add(match[1]);
        }
      } catch (error) {
        console.warn(`⚠️  Could not read CSS file ${cssFile}: ${error.message}`);
      }
    }
  });

  return customClasses;
}

// Check if class is a valid Tailwind class using more comprehensive patterns
function isTailwindClass(className) {
  // Check exact matches first
  if (TAILWIND_CLASSES.has(className)) {
    return true;
  }

  // Check Tailwind patterns
  const tailwindPatterns = [
    /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-\d+$/, // Spacing
    /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/, // Text sizes
    /^text-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Text colors
    /^bg-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Background colors
    /^border-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Border colors
    /^(w|h|min-w|min-h|max-w|max-h)-\d+$/, // Sizing
    /^(top|right|bottom|left|inset)-(0|\d+)$/, // Positioning
    /^(flex|grid)-\d+$/, // Flex/Grid
    /^gap-(x-|y-)?\d+$/, // Gap
    /^opacity-\d+$/, // Opacity
    /^(rotate|scale|translate[xy]?)-\d+$/, // Transforms
    /^duration-\d+$/, // Transitions
    /^rounded(-[a-z]+)?(-\d+)?$/, // Border radius
    /^shadow(-[a-z]+)?$/, // Shadows
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/, // Font weights
    /^leading-\d+$/, // Line height
    /^tracking-\w+$/, // Letter spacing
    /^z-\d+$/, // Z-index
    /^order-\d+$/, // Flex order
    /^col-span-\d+$/, // Grid columns
    /^row-span-\d+$/, // Grid rows
    /^bg-gradient-to-(r|l|t|b|tr|tl|br|bl)$/, // Gradients
    /^from-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Gradient from
    /^to-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Gradient to
    /^via-(black|white|gray|red|yellow|green|blue|indigo|purple|pink)-\d{2,3}$/, // Gradient via
    /^(hover|focus|active|disabled|group-hover|group-focus):/, // State variants
    /^(sm|md|lg|xl|2xl):/, // Responsive variants
    /^dark:/, // Dark mode variants
  ];

  return tailwindPatterns.some(pattern => pattern.test(className));
}

// Validate CSS classes
function validateCSSClasses() {
  const files = getSourceFiles();
  const customClasses = loadCustomCSSClasses();
  const errors = [];

  console.log(`📁 Scanning ${files.length} source files for CSS classes...`);
  console.log(`🎨 Found ${customClasses.size} custom CSS classes`);

  files.forEach(file => {
    try {
      const classes = extractCSSClasses(file);
      const relativePath = path.relative(CONFIG.srcPath, file);

      classes.forEach(className => {
        // Skip excluded patterns
        if (CONFIG.excludePatterns.some(pattern => pattern.test(className))) {
          return;
        }

        // Check if class exists in any known source
        const isValid =
          TAILWIND_CLASSES.has(className) ||
          isTailwindClass(className) ||
          customClasses.has(className) ||
          className.startsWith('data-') ||
          className.startsWith('aria-') ||
          className === '' || // Empty class
          /^\$\{/.test(className); // Template literal placeholder

        if (!isValid) {
          errors.push({
            file: relativePath,
            className,
            message: `Undefined CSS class: ${className}`,
            suggestion: 'Verify the class exists in Tailwind CSS, custom CSS, or component libraries',
          });
        }
      });
    } catch (error) {
      errors.push({
        file: path.relative(CONFIG.srcPath, file),
        className: '',
        message: `Failed to process file: ${error.message}`,
        suggestion: 'Check file syntax and formatting',
      });
    }
  });

  return errors;
}

// Check for unused custom CSS classes
function checkUnusedCustomClasses() {
  const files = getSourceFiles();
  const customClasses = loadCustomCSSClasses();
  const usedClasses = new Set();

  // Collect all used classes
  files.forEach(file => {
    try {
      const classes = extractCSSClasses(file);
      classes.forEach(cls => usedClasses.add(cls));
    } catch (error) {
      // Skip files with errors
    }
  });

  // Find unused custom classes
  const unusedClasses = [];
  customClasses.forEach(cls => {
    if (!usedClasses.has(cls)) {
      unusedClasses.push(cls);
    }
  });

  return unusedClasses;
}

// Display validation results
function displayResults(errors, unusedClasses) {
  let success = true;

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} CSS class issues:\n`);

    errors.forEach(error => {
      console.log(`   ${error.file}`);
      console.log(`     ❌ ${error.message}`);
      console.log(`     💡 ${error.suggestion}`);
      console.log('');
    });

    success = false;
  }

  if (unusedClasses.length > 0) {
    console.log(`⚠️  Found ${unusedClasses.length} unused custom CSS classes:`);
    unusedClasses.forEach(cls => {
      console.log(`     - .${cls}`);
    });
    console.log('   💡 Consider removing unused classes to reduce bundle size\n');
    // Don't fail for unused classes, just warn
  }

  if (success && unusedClasses.length === 0) {
    console.log('✅ All CSS classes are valid and in use!');
  } else if (success) {
    console.log('✅ All CSS classes are valid!');
  }

  return success;
}

// Main validation function
async function main() {
  try {
    console.log('🔍 Validating CSS classes...');

    const errors = validateCSSClasses();
    const unusedClasses = checkUnusedCustomClasses();
    const isValid = displayResults(errors, unusedClasses);

    if (isValid) {
      console.log('🎉 CSS class validation passed!');
      process.exit(0);
    } else {
      console.log('💥 CSS class validation failed!');
      console.log('Please fix the issues above before committing.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`💥 CSS validation failed with error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}