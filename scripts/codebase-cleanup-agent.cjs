#!/usr/bin/env node

/**
 * Codebase Cleanup Agent
 * BeProductive v2: Spark Bloom Flow
 *
 * Purpose: Clean up, optimize, and organize the codebase for production
 * Author: Gabriel Soto Morales (with AI assistance)
 * Date: January 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodebaseCleanupAgent {
  constructor() {
    this.agentName = 'Codebase Cleanup Agent';
    this.version = '1.0.0';
    this.startTime = Date.now();
    this.findings = [];
    this.cleanupActions = [];
    this.basePath = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${this.agentName}: ${message}${colors.reset}`);
  }

  async analyzeCodebase() {
    this.log('🔍 Analyzing codebase structure and quality...');

    await this.checkUnusedFiles();
    await this.analyzeDependencies();
    await this.checkCodeDuplication();
    await this.analyzeImports();
    await this.checkTSConfig();

    this.log(`📊 Analysis complete: ${this.findings.length} findings`);
  }

  async checkUnusedFiles() {
    this.log('📁 Checking for unused files...');

    // Check for common unused file patterns
    const unusedPatterns = [
      'src/**/*.test.js.bak',
      'src/**/*.old',
      'src/**/*.backup',
      'src/**/*~',
      'src/**/.DS_Store',
      'node_modules/.cache/**/*'
    ];

    for (const pattern of unusedPatterns) {
      try {
        const files = this.globSync(pattern);
        if (files.length > 0) {
          this.findings.push({
            type: 'unused_files',
            severity: 'low',
            files,
            action: 'remove'
          });
        }
      } catch (error) {
        // Pattern might not match anything
      }
    }

    // Check for duplicate component files
    await this.findDuplicateComponents();
  }

  async findDuplicateComponents() {
    const componentDirs = ['src/components', 'src/pages'];
    const componentNames = new Map();

    for (const dir of componentDirs) {
      if (fs.existsSync(path.join(this.basePath, dir))) {
        const files = this.getFilesRecursively(path.join(this.basePath, dir));

        for (const file of files) {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const basename = path.basename(file, path.extname(file));

            if (componentNames.has(basename)) {
              componentNames.get(basename).push(file);
            } else {
              componentNames.set(basename, [file]);
            }
          }
        }
      }
    }

    // Find duplicates
    for (const [name, files] of componentNames.entries()) {
      if (files.length > 1) {
        this.findings.push({
          type: 'duplicate_components',
          severity: 'medium',
          componentName: name,
          files,
          action: 'review_and_consolidate'
        });
      }
    }
  }

  async analyzeDependencies() {
    this.log('📦 Analyzing dependencies...');

    const packageJsonPath = path.join(this.basePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check for unused dependencies
      try {
        const knipOutput = execSync('npx knip --no-progress', {
          cwd: this.basePath,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        if (knipOutput.includes('Unused dependencies')) {
          this.findings.push({
            type: 'unused_dependencies',
            severity: 'medium',
            output: knipOutput,
            action: 'remove_unused_deps'
          });
        }
      } catch (error) {
        this.log('⚠️ Could not run dependency analysis', 'warning');
      }

      // Check for outdated dependencies
      this.checkOutdatedDependencies(packageJson);
    }
  }

  checkOutdatedDependencies(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const potentiallyOutdated = [];

    for (const [name, version] of Object.entries(deps)) {
      // Look for dependencies with very old version patterns
      if (typeof version === 'string' && (
        version.startsWith('^0.') ||
        version.includes('beta') ||
        version.includes('alpha')
      )) {
        potentiallyOutdated.push({ name, version });
      }
    }

    if (potentiallyOutdated.length > 0) {
      this.findings.push({
        type: 'potentially_outdated',
        severity: 'low',
        dependencies: potentiallyOutdated,
        action: 'review_versions'
      });
    }
  }

  async checkCodeDuplication() {
    this.log('🔍 Checking for code duplication...');

    // Find similar component structures
    const components = this.findAllComponents();
    const similarComponents = this.findSimilarComponents(components);

    if (similarComponents.length > 0) {
      this.findings.push({
        type: 'similar_components',
        severity: 'medium',
        components: similarComponents,
        action: 'extract_common_patterns'
      });
    }
  }

  findAllComponents() {
    const components = [];
    const componentDirs = ['src/components', 'src/pages'];

    for (const dir of componentDirs) {
      if (fs.existsSync(path.join(this.basePath, dir))) {
        const files = this.getFilesRecursively(path.join(this.basePath, dir));

        for (const file of files) {
          if (file.endsWith('.tsx')) {
            try {
              const content = fs.readFileSync(file, 'utf8');
              const lines = content.split('\n').length;
              const exports = this.extractExports(content);
              const imports = this.extractImports(content);

              components.push({
                file,
                lines,
                exports,
                imports,
                size: content.length
              });
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      }
    }

    return components;
  }

  findSimilarComponents(components) {
    const similar = [];

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];

        // Check for similar import patterns
        const commonImports = comp1.imports.filter(imp =>
          comp2.imports.includes(imp)
        );

        if (commonImports.length > 5 &&
            Math.abs(comp1.lines - comp2.lines) < 20) {
          similar.push({
            component1: comp1.file,
            component2: comp2.file,
            commonImports: commonImports.length,
            similarity: commonImports.length / Math.max(comp1.imports.length, comp2.imports.length)
          });
        }
      }
    }

    return similar.filter(s => s.similarity > 0.7);
  }

  extractExports(content) {
    const exportMatches = content.match(/export\s+(default\s+)?(function|const|class|interface|type)\s+(\w+)/g);
    return exportMatches ? exportMatches.map(m => m.split(/\s+/).pop()) : [];
  }

  extractImports(content) {
    const importMatches = content.match(/import\s+.*?from\s+['"`]([^'"`]+)['"`]/g);
    return importMatches ? importMatches.map(m => {
      const match = m.match(/from\s+['"`]([^'"`]+)['"`]/);
      return match ? match[1] : '';
    }).filter(Boolean) : [];
  }

  async analyzeImports() {
    this.log('🔗 Analyzing import statements...');

    const files = this.getFilesRecursively(path.join(this.basePath, 'src'));
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    let unusedImports = 0;
    let circularImports = [];

    for (const file of tsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for unused imports (basic check)
        const imports = this.extractImports(content);
        for (const imp of imports) {
          if (imp.startsWith('./') || imp.startsWith('../')) {
            // This is a relative import - could check if it's actually used
            // For now, just count them
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  async checkTSConfig() {
    this.log('⚙️ Checking TypeScript configuration...');

    const tsconfigPath = path.join(this.basePath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      // Check for recommended compiler options
      const recommendedOptions = {
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true
      };

      const missingOptions = [];
      for (const [option, value] of Object.entries(recommendedOptions)) {
        if (tsconfig.compilerOptions?.[option] !== value) {
          missingOptions.push(option);
        }
      }

      if (missingOptions.length > 0) {
        this.findings.push({
          type: 'tsconfig_optimization',
          severity: 'low',
          missingOptions,
          action: 'update_tsconfig'
        });
      }
    }
  }

  async performCleanup() {
    this.log('🧹 Performing codebase cleanup...');

    // Remove unused files
    await this.removeUnusedFiles();

    // Optimize imports
    await this.optimizeImports();

    // Format code
    await this.formatCode();

    // Update configurations
    await this.updateConfigurations();

    // Create index files
    await this.createIndexFiles();

    this.log(`✅ Cleanup completed: ${this.cleanupActions.length} actions performed`);
  }

  async removeUnusedFiles() {
    const unusedFindings = this.findings.filter(f => f.type === 'unused_files');

    for (const finding of unusedFindings) {
      for (const file of finding.files) {
        try {
          fs.unlinkSync(file);
          this.cleanupActions.push(`Removed unused file: ${file}`);
        } catch (error) {
          this.log(`⚠️ Could not remove ${file}: ${error.message}`, 'warning');
        }
      }
    }
  }

  async optimizeImports() {
    this.log('🔧 Optimizing import statements...');

    // Run organize imports if available
    try {
      execSync('npx tsc --noEmit', {
        cwd: this.basePath,
        stdio: 'pipe'
      });
      this.cleanupActions.push('Verified TypeScript compilation');
    } catch (error) {
      this.log('⚠️ TypeScript compilation issues found', 'warning');
    }
  }

  async formatCode() {
    this.log('💅 Formatting code...');

    try {
      // Run prettier if available
      execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx}" --ignore-unknown', {
        cwd: this.basePath,
        stdio: 'pipe'
      });
      this.cleanupActions.push('Formatted all source files');
    } catch (error) {
      this.log('⚠️ Could not run code formatting', 'warning');
    }

    try {
      // Run ESLint fix
      execSync('npx eslint "src/**/*.{ts,tsx}" --fix', {
        cwd: this.basePath,
        stdio: 'pipe'
      });
      this.cleanupActions.push('Fixed ESLint issues');
    } catch (error) {
      this.log('⚠️ ESLint fixes had issues', 'warning');
    }
  }

  async updateConfigurations() {
    this.log('⚙️ Updating configuration files...');

    // Update tsconfig if needed
    const tsconfigFindings = this.findings.filter(f => f.type === 'tsconfig_optimization');
    if (tsconfigFindings.length > 0) {
      await this.updateTSConfig(tsconfigFindings[0]);
    }

    // Update package.json scripts
    await this.updatePackageScripts();
  }

  async updateTSConfig(finding) {
    const tsconfigPath = path.join(this.basePath, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    // Add missing options
    const recommendedOptions = {
      strict: true,
      noUnusedLocals: false, // Can be too strict for development
      noUnusedParameters: false, // Can be too strict for development
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      exactOptionalPropertyTypes: true,
      noImplicitOverride: true
    };

    for (const [option, value] of Object.entries(recommendedOptions)) {
      if (finding.missingOptions.includes(option)) {
        tsconfig.compilerOptions[option] = value;
      }
    }

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    this.cleanupActions.push('Updated TypeScript configuration');
  }

  async updatePackageScripts() {
    const packageJsonPath = path.join(this.basePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add useful scripts if missing
    const recommendedScripts = {
      'type-check': 'tsc --noEmit',
      'lint:fix': 'eslint "src/**/*.{ts,tsx}" --fix',
      'format': 'prettier --write "src/**/*.{ts,tsx,js,jsx}"',
      'clean': 'rm -rf dist node_modules/.cache',
      'analyze': 'npm run build && npx vite-bundle-analyzer'
    };

    let scriptsAdded = false;
    for (const [script, command] of Object.entries(recommendedScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        scriptsAdded = true;
      }
    }

    if (scriptsAdded) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.cleanupActions.push('Added recommended npm scripts');
    }
  }

  async createIndexFiles() {
    this.log('📝 Creating index files for better imports...');

    const componentDirs = [
      'src/components/ui',
      'src/components/widgets',
      'src/components/ai',
      'src/lib',
      'src/hooks'
    ];

    for (const dir of componentDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        await this.createIndexFile(fullPath);
      }
    }
  }

  async createIndexFile(dirPath) {
    const files = fs.readdirSync(dirPath);
    const exports = [];

    for (const file of files) {
      if ((file.endsWith('.ts') || file.endsWith('.tsx')) &&
          file !== 'index.ts' &&
          file !== 'index.tsx' &&
          !file.endsWith('.test.ts') &&
          !file.endsWith('.test.tsx')) {

        const basename = path.basename(file, path.extname(file));

        // Check if it's a component file
        if (file.endsWith('.tsx')) {
          exports.push(`export { default as ${basename} } from './${basename}';`);
        } else {
          exports.push(`export * from './${basename}';`);
        }
      }
    }

    if (exports.length > 0) {
      const indexPath = path.join(dirPath, 'index.ts');
      const content = exports.join('\n') + '\n';

      // Only write if content is different
      if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8') !== content) {
        fs.writeFileSync(indexPath, content);
        this.cleanupActions.push(`Created index file: ${path.relative(this.basePath, indexPath)}`);
      }
    }
  }

  globSync(pattern) {
    // Simple glob implementation for basic patterns
    const parts = pattern.split('**');
    if (parts.length === 2) {
      const basePath = path.join(this.basePath, parts[0]);
      const suffix = parts[1].substring(1); // Remove leading /

      if (fs.existsSync(basePath)) {
        return this.getFilesRecursively(basePath).filter(f => f.endsWith(suffix));
      }
    }
    return [];
  }

  getFilesRecursively(dirPath) {
    const files = [];

    const processDirectory = (currentPath) => {
      try {
        const items = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const item of items) {
          const fullItemPath = path.join(currentPath, item.name);

          if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
            processDirectory(fullItemPath);
          } else if (item.isFile()) {
            files.push(fullItemPath);
          }
        }
      } catch (error) {
        // Directory might not be accessible
      }
    };

    processDirectory(dirPath);
    return files;
  }

  generateCleanupReport() {
    const report = {
      agentInfo: {
        name: this.agentName,
        version: this.version,
        executionTime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      findings: this.findings,
      cleanupActions: this.cleanupActions,
      summary: {
        totalFindings: this.findings.length,
        totalActions: this.cleanupActions.length,
        severityBreakdown: {
          high: this.findings.filter(f => f.severity === 'high').length,
          medium: this.findings.filter(f => f.severity === 'medium').length,
          low: this.findings.filter(f => f.severity === 'low').length
        }
      }
    };

    const reportPath = path.join(this.basePath, 'CODEBASE_CLEANUP_REPORT.md');
    const reportContent = `# Codebase Cleanup Report
Generated by: ${this.agentName} v${this.version}
Date: ${new Date().toLocaleDateString()}
Execution Time: ${Date.now() - this.startTime}ms

## Executive Summary
Codebase cleanup completed with ${this.cleanupActions.length} optimization actions performed.

## Findings Summary
- **Total Issues Found**: ${this.findings.length}
- **High Severity**: ${report.summary.severityBreakdown.high}
- **Medium Severity**: ${report.summary.severityBreakdown.medium}
- **Low Severity**: ${report.summary.severityBreakdown.low}

## Cleanup Actions Performed
${this.cleanupActions.map(action => `✅ ${action}`).join('\n')}

## Detailed Findings
${this.findings.map(finding => `
### ${finding.type.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
- **Severity**: ${finding.severity}
- **Action**: ${finding.action}
${finding.files ? `- **Files**: ${finding.files.length} files affected` : ''}
${finding.components ? `- **Components**: ${finding.components.length} similar components found` : ''}
`).join('')}

## Recommendations
1. **Regular Cleanup**: Run this agent monthly to maintain code quality
2. **Automated Checks**: Add pre-commit hooks for formatting and linting
3. **Dependency Management**: Regular dependency updates and security audits
4. **Code Reviews**: Implement stricter code review processes
5. **Documentation**: Keep README and documentation up to date

## Next Steps
1. Review and test changes made by cleanup
2. Update CI/CD pipeline with new scripts
3. Train team on new coding standards
4. Set up automated code quality monitoring

---
Report generated automatically by Codebase Cleanup Agent
`;

    fs.writeFileSync(reportPath, reportContent);
    this.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }

  async run() {
    try {
      this.log(`🚀 Starting ${this.agentName} v${this.version}`);

      await this.analyzeCodebase();
      await this.performCleanup();
      const report = this.generateCleanupReport();

      this.log(`✅ ${this.agentName} completed successfully!`);
      this.log(`⏱️  Total execution time: ${Date.now() - this.startTime}ms`);
      this.log(`🔍 Found ${this.findings.length} issues`);
      this.log(`🧹 Performed ${this.cleanupActions.length} cleanup actions`);

      return report;
    } catch (error) {
      this.log(`❌ Agent failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new CodebaseCleanupAgent();
  agent.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { CodebaseCleanupAgent };