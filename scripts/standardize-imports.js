#!/usr/bin/env node

/**
 * Import Pattern Standardization Script
 * Converts relative imports to absolute imports with @/ alias
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class ImportStandardizer {
  constructor() {
    this.changedFiles = [];
    this.errors = [];
    this.statistics = {
      filesProcessed: 0,
      importsConverted: 0,
      relativeImportsFound: 0,
      absoluteImportsFound: 0
    };
  }

  async standardizeAllImports() {
    console.log('🔧 Standardizing Import Patterns...\n');

    try {
      // Get all TypeScript/JavaScript files
      const sourceFiles = await this.getSourceFiles();
      console.log(`📁 Found ${sourceFiles.length} files to process\n`);

      // Process each file
      for (const filePath of sourceFiles) {
        await this.processFile(filePath);
      }

      // Generate report
      this.generateReport();

      return {
        success: this.errors.length === 0,
        statistics: this.statistics,
        changedFiles: this.changedFiles,
        errors: this.errors
      };

    } catch (error) {
      console.error('❌ Error during import standardization:', error);
      throw error;
    }
  }

  async getSourceFiles() {
    try {
      const { stdout } = await execAsync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"');
      return stdout.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      console.error('Error finding source files:', error);
      return [];
    }
  }

  async processFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      // Analyze current imports
      const analysis = this.analyzeImports(content, filePath);

      // Convert relative imports to absolute
      const convertedContent = this.convertImports(content, filePath, analysis);

      // Update statistics
      this.updateStatistics(analysis);

      // Write file if changed
      if (convertedContent !== originalContent) {
        await fs.writeFile(filePath, convertedContent);
        this.changedFiles.push({
          file: filePath,
          conversions: analysis.relativeImports.length
        });
        console.log(`✅ Updated ${filePath} (${analysis.relativeImports.length} imports converted)`);
      }

      this.statistics.filesProcessed++;

    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  analyzeImports(content, filePath) {
    const lines = content.split('\n');
    const imports = {
      relativeImports: [],
      absoluteImports: [],
      externalImports: [],
      allImports: []
    };

    lines.forEach((line, index) => {
      // Match import statements
      const importMatch = line.match(/^import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*(?:,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))?\s*from\s+['"]([^'"]+)['"];?/);

      if (importMatch) {
        const importPath = importMatch[1];
        const importInfo = {
          line: index + 1,
          originalLine: line,
          importPath,
          fullMatch: importMatch[0]
        };

        imports.allImports.push(importInfo);

        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          imports.relativeImports.push(importInfo);
        } else if (importPath.startsWith('@/')) {
          imports.absoluteImports.push(importInfo);
        } else {
          imports.externalImports.push(importInfo);
        }
      }
    });

    return imports;
  }

  convertImports(content, filePath, analysis) {
    let convertedContent = content;

    // Convert each relative import to absolute
    for (const importInfo of analysis.relativeImports) {
      const absolutePath = this.convertRelativeToAbsolute(importInfo.importPath, filePath);

      if (absolutePath) {
        const newImportLine = importInfo.originalLine.replace(
          importInfo.importPath,
          absolutePath
        );

        convertedContent = convertedContent.replace(
          importInfo.originalLine,
          newImportLine
        );

        console.log(`  📝 ${importInfo.importPath} → ${absolutePath}`);
        this.statistics.importsConverted++;
      }
    }

    return convertedContent;
  }

  convertRelativeToAbsolute(relativePath, currentFilePath) {
    try {
      // Calculate the absolute path from src root
      const currentDir = path.dirname(currentFilePath);
      const targetPath = path.resolve(currentDir, relativePath);

      // Convert to relative path from src root
      const srcRoot = path.resolve('src');
      let relativeToBSrc = path.relative(srcRoot, targetPath);

      // Normalize path separators for cross-platform compatibility
      relativeToBSrc = relativeToBSrc.replace(/\\/g, '/');

      // Remove file extension for TypeScript/JavaScript imports
      relativeToBSrc = this.removeFileExtension(relativeToBSrc);

      return `@/${relativeToBSrc}`;

    } catch (error) {
      console.warn(`Warning: Could not convert ${relativePath} in ${currentFilePath}:`, error.message);
      return null;
    }
  }

  removeFileExtension(filePath) {
    // Remove common TypeScript/JavaScript extensions
    const extensionsToRemove = ['.ts', '.tsx', '.js', '.jsx'];

    for (const ext of extensionsToRemove) {
      if (filePath.endsWith(ext)) {
        return filePath.slice(0, -ext.length);
      }
    }

    // If it's an index file, remove it
    if (filePath.endsWith('/index')) {
      return filePath.slice(0, -6); // Remove '/index'
    }

    return filePath;
  }

  updateStatistics(analysis) {
    this.statistics.relativeImportsFound += analysis.relativeImports.length;
    this.statistics.absoluteImportsFound += analysis.absoluteImports.length;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT STANDARDIZATION REPORT');
    console.log('='.repeat(60));

    console.log('\n📈 STATISTICS:');
    console.log(`   Files Processed: ${this.statistics.filesProcessed}`);
    console.log(`   Files Modified: ${this.changedFiles.length}`);
    console.log(`   Imports Converted: ${this.statistics.importsConverted}`);
    console.log(`   Relative Imports Found: ${this.statistics.relativeImportsFound}`);
    console.log(`   Absolute Imports Found: ${this.statistics.absoluteImportsFound}`);

    if (this.changedFiles.length > 0) {
      console.log('\n📝 MODIFIED FILES:');
      this.changedFiles.forEach(({ file, conversions }) => {
        console.log(`   • ${file} (${conversions} conversions)`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run `npm run type-check` to verify no TypeScript errors');
    console.log('   2. Run `npm run lint` to check for any linting issues');
    console.log('   3. Run `npm run test` to ensure all tests still pass');
    console.log('   4. Consider updating your IDE settings to prefer absolute imports');

    console.log('\n🎯 RECOMMENDATIONS:');

    if (this.statistics.relativeImportsFound > 0) {
      console.log('   • Configure your IDE to auto-import with @/ alias');
      console.log('   • Add ESLint rule to prevent relative imports outside current directory');
    }

    console.log('   • Ensure tsconfig.json has proper path mapping configured');
    console.log('   • Consider setting up import ordering rules in ESLint');

    console.log('\n' + '='.repeat(60));

    // Write detailed report to file
    const detailedReport = {
      timestamp: new Date().toISOString(),
      statistics: this.statistics,
      changedFiles: this.changedFiles,
      errors: this.errors,
      recommendations: [
        'Configure IDE for @/ alias auto-imports',
        'Add ESLint rules for import patterns',
        'Verify tsconfig.json path mapping',
        'Set up import ordering rules'
      ]
    };

    return fs.writeFile(
      'quality-reports/import-standardization-report.json',
      JSON.stringify(detailedReport, null, 2)
    ).then(() => {
      console.log('📄 Detailed report saved to: quality-reports/import-standardization-report.json');
    }).catch(err => {
      console.warn('Warning: Could not save detailed report:', err.message);
    });
  }

  // Additional utility methods

  async validateTsConfig() {
    try {
      const tsConfigPath = 'tsconfig.json';
      const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
      const tsConfig = JSON.parse(tsConfigContent);

      const hasPathMapping = tsConfig.compilerOptions?.paths?.['@/*'];

      if (!hasPathMapping) {
        console.warn('⚠️  Warning: No @/* path mapping found in tsconfig.json');
        console.log('   Add this to your tsconfig.json compilerOptions:');
        console.log('   "paths": { "@/*": ["./src/*"] }');
      } else {
        console.log('✅ TypeScript path mapping is correctly configured');
      }

      return hasPathMapping;
    } catch (error) {
      console.warn('⚠️  Warning: Could not validate tsconfig.json:', error.message);
      return false;
    }
  }

  async updateESLintConfig() {
    try {
      const eslintConfigPath = '.eslintrc.json';
      const eslintContent = await fs.readFile(eslintConfigPath, 'utf-8');
      const eslintConfig = JSON.parse(eslintContent);

      // Add import rules if not present
      if (!eslintConfig.rules) {
        eslintConfig.rules = {};
      }

      const importRules = {
        'import/no-relative-parent-imports': 'error',
        'import/order': [
          'error',
          {
            'groups': [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index'
            ],
            'pathGroups': [
              {
                'pattern': '@/**',
                'group': 'internal',
                'position': 'before'
              }
            ],
            'pathGroupsExcludedImportTypes': ['builtin']
          }
        ]
      };

      let configUpdated = false;
      Object.entries(importRules).forEach(([rule, config]) => {
        if (!eslintConfig.rules[rule]) {
          eslintConfig.rules[rule] = config;
          configUpdated = true;
        }
      });

      if (configUpdated) {
        await fs.writeFile(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
        console.log('✅ Updated ESLint configuration with import rules');
      }

      return configUpdated;
    } catch (error) {
      console.warn('⚠️  Warning: Could not update ESLint config:', error.message);
      return false;
    }
  }
}

// Additional standalone functions

export async function checkImportConsistency() {
  console.log('🔍 Checking Import Pattern Consistency...\n');

  const standardizer = new ImportStandardizer();
  const sourceFiles = await standardizer.getSourceFiles();

  let totalRelative = 0;
  let totalAbsolute = 0;
  let filesWithMixed = 0;

  for (const filePath of sourceFiles.slice(0, 50)) { // Sample files
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = standardizer.analyzeImports(content, filePath);

      totalRelative += analysis.relativeImports.length;
      totalAbsolute += analysis.absoluteImports.length;

      if (analysis.relativeImports.length > 0 && analysis.absoluteImports.length > 0) {
        filesWithMixed++;
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  console.log('📊 Import Pattern Analysis:');
  console.log(`   Relative imports: ${totalRelative}`);
  console.log(`   Absolute imports: ${totalAbsolute}`);
  console.log(`   Files with mixed patterns: ${filesWithMixed}`);

  const consistency = totalAbsolute / (totalRelative + totalAbsolute) * 100;
  console.log(`   Consistency score: ${consistency.toFixed(1)}%`);

  return {
    relativeImports: totalRelative,
    absoluteImports: totalAbsolute,
    mixedFiles: filesWithMixed,
    consistencyScore: consistency
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const standardizer = new ImportStandardizer();

  standardizer.standardizeAllImports()
    .then(async (result) => {
      // Validate configuration
      await standardizer.validateTsConfig();
      await standardizer.updateESLintConfig();

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { ImportStandardizer };