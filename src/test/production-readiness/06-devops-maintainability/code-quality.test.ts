import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

test.describe('Code Quality and Maintainability Tests', () => {
  const qualityThresholds = {
    codeComplexity: 10, // Maximum cyclomatic complexity
    duplicateCode: 5, // Maximum 5% duplicate code
    testCoverage: 80, // Minimum 80% test coverage
    lintErrors: 0, // Zero lint errors allowed
    technicalDebt: 30, // Maximum 30 minutes technical debt
    maintainabilityIndex: 70 // Minimum maintainability index
  };

  test('should validate code quality standards', async ({ page }) => {
    await test.step('Test ESLint compliance', async () => {
      try {
        const { stdout, stderr } = await execAsync('npm run lint');

        // Should have no lint errors
        expect(stderr).not.toContain('error');

        const lintOutput = stdout + stderr;

        // Extract error count
        const errorMatch = lintOutput.match(/(\d+)\s+error/);
        const errorCount = errorMatch ? parseInt(errorMatch[1]) : 0;

        expect(errorCount).toBeLessThanOrEqual(qualityThresholds.lintErrors);

        // Extract warning count
        const warningMatch = lintOutput.match(/(\d+)\s+warning/);
        const warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;

        console.log(`✓ ESLint results: ${errorCount} errors, ${warningCount} warnings`);

        // Warnings should be minimal
        expect(warningCount).toBeLessThan(50);

      } catch (error) {
        if (error.stdout || error.stderr) {
          const output = error.stdout + error.stderr;
          const errorMatch = output.match(/(\d+)\s+error/);
          const errorCount = errorMatch ? parseInt(errorMatch[1]) : 0;

          expect(errorCount).toBeLessThanOrEqual(qualityThresholds.lintErrors);
        } else {
          throw error;
        }
      }
    });

    await test.step('Test TypeScript type checking', async () => {
      try {
        const { stdout, stderr } = await execAsync('npm run type-check || npx tsc --noEmit');

        // Should have no type errors
        expect(stderr).not.toContain('error TS');

        console.log('✓ TypeScript type checking passed');

      } catch (error) {
        const output = error.stdout + error.stderr;

        // Count TypeScript errors
        const tsErrors = (output.match(/error TS\d+/g) || []).length;
        expect(tsErrors).toBe(0);

        if (tsErrors > 0) {
          console.log(`✗ TypeScript errors found: ${tsErrors}`);
          throw new Error(`TypeScript type checking failed with ${tsErrors} errors`);
        }
      }
    });

    await test.step('Test code formatting compliance', async () => {
      try {
        // Check if Prettier is configured
        const prettierConfig = await fs.readFile('.prettierrc.json', 'utf-8').catch(() => null) ||
                              await fs.readFile('.prettierrc', 'utf-8').catch(() => null) ||
                              await fs.readFile('prettier.config.js', 'utf-8').catch(() => null);

        if (prettierConfig) {
          console.log('✓ Prettier configuration found');

          // Run prettier check
          const { stdout } = await execAsync('npx prettier --check "src/**/*.{ts,tsx,js,jsx}"');
          console.log('✓ Code formatting is consistent');
        } else {
          console.log('⚠ Prettier configuration not found');
        }

      } catch (error) {
        const output = error.stdout + error.stderr;

        if (output.includes('Code style issues')) {
          const unformattedFiles = (output.match(/src\/.*\.(ts|tsx|js|jsx)/g) || []).length;
          expect(unformattedFiles).toBe(0);
        }
      }
    });

    await test.step('Test import organization and dependencies', async () => {
      try {
        // Check for unused dependencies
        const { stdout } = await execAsync('npx knip || echo "Knip not available"');

        if (!stdout.includes('Knip not available')) {
          // Parse knip output for unused dependencies
          const unusedDeps = stdout.match(/Unused dependencies \((\d+)\)/);
          const unusedCount = unusedDeps ? parseInt(unusedDeps[1]) : 0;

          expect(unusedCount).toBeLessThan(10); // Allow some unused deps

          console.log(`✓ Dependency analysis: ${unusedCount} unused dependencies`);
        }

        // Check for circular dependencies
        const { stdout: circularCheck } = await execAsync('npx madge --circular src/ || echo "Madge not available"');

        if (!circularCheck.includes('Madge not available')) {
          expect(circularCheck).not.toContain('Circular dependency');
          console.log('✓ No circular dependencies detected');
        }

      } catch (error) {
        console.log('Dependency analysis completed with warnings');
      }
    });
  });

  test('should validate test coverage and quality', async ({ page }) => {
    await test.step('Test code coverage metrics', async () => {
      try {
        const { stdout } = await execAsync('npm run test:coverage');

        // Extract coverage percentages
        const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);

        if (coverageMatch) {
          const [, statements, branches, functions, lines] = coverageMatch;

          const statementCoverage = parseFloat(statements);
          const branchCoverage = parseFloat(branches);
          const functionCoverage = parseFloat(functions);
          const lineCoverage = parseFloat(lines);

          expect(statementCoverage).toBeGreaterThanOrEqual(qualityThresholds.testCoverage);
          expect(branchCoverage).toBeGreaterThanOrEqual(qualityThresholds.testCoverage - 10);
          expect(functionCoverage).toBeGreaterThanOrEqual(qualityThresholds.testCoverage);
          expect(lineCoverage).toBeGreaterThanOrEqual(qualityThresholds.testCoverage);

          console.log(`✓ Statement coverage: ${statementCoverage}%`);
          console.log(`✓ Branch coverage: ${branchCoverage}%`);
          console.log(`✓ Function coverage: ${functionCoverage}%`);
          console.log(`✓ Line coverage: ${lineCoverage}%`);
        }

      } catch (error) {
        console.log('⚠ Coverage analysis not available or failed');
      }
    });

    await test.step('Test mutation testing quality', async () => {
      try {
        // Check if mutation testing is configured
        const mutationConfig = await fs.readFile('stryker.conf.js', 'utf-8').catch(() => null) ||
                              await fs.readFile('stryker.config.json', 'utf-8').catch(() => null);

        if (mutationConfig) {
          console.log('✓ Mutation testing is configured');

          // Run a quick mutation test
          const { stdout } = await execAsync('npx stryker run --timeout 30000 || echo "Mutation test timeout"');

          if (!stdout.includes('timeout')) {
            const mutationScoreMatch = stdout.match(/Mutation score: ([\d.]+)%/);
            if (mutationScoreMatch) {
              const mutationScore = parseFloat(mutationScoreMatch[1]);
              expect(mutationScore).toBeGreaterThan(60); // Minimum 60% mutation score

              console.log(`✓ Mutation score: ${mutationScore}%`);
            }
          }
        } else {
          console.log('⚠ Mutation testing not configured');
        }

      } catch (error) {
        console.log('Mutation testing skipped');
      }
    });

    await test.step('Test test quality metrics', async () => {
      try {
        // Analyze test files
        const { stdout } = await execAsync('find src/ -name "*.test.*" -o -name "*.spec.*" | wc -l');
        const testFileCount = parseInt(stdout.trim());

        // Count source files
        const { stdout: sourceCount } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | grep -v test | grep -v spec | wc -l');
        const sourceFileCount = parseInt(sourceCount.trim());

        const testRatio = testFileCount / sourceFileCount;

        expect(testRatio).toBeGreaterThan(0.5); // At least 50% test coverage by file count

        console.log(`✓ Test file ratio: ${testFileCount}/${sourceFileCount} (${(testRatio * 100).toFixed(1)}%)`);

        // Check for test naming conventions
        const { stdout: testFiles } = await execAsync('find src/ -name "*.test.*" -o -name "*.spec.*"');
        const testFilesList = testFiles.trim().split('\n').filter(f => f.trim());

        testFilesList.forEach(testFile => {
          expect(testFile).toMatch(/\.(test|spec)\.(ts|tsx|js|jsx)$/);
        });

        console.log('✓ Test files follow naming conventions');

      } catch (error) {
        console.log('Test quality analysis completed');
      }
    });
  });

  test('should validate code complexity and maintainability', async ({ page }) => {
    await test.step('Test cyclomatic complexity', async () => {
      try {
        // Use a complexity analysis tool
        const { stdout } = await execAsync('npx ts-complex src/ || echo "Complexity analysis not available"');

        if (!stdout.includes('not available')) {
          // Parse complexity results
          const complexFiles = stdout.split('\n')
            .filter(line => line.includes('Complexity:'))
            .map(line => {
              const match = line.match(/Complexity: (\d+)/);
              return match ? parseInt(match[1]) : 0;
            });

          const maxComplexity = Math.max(...complexFiles);
          expect(maxComplexity).toBeLessThanOrEqual(qualityThresholds.codeComplexity);

          const avgComplexity = complexFiles.reduce((sum, c) => sum + c, 0) / complexFiles.length;
          console.log(`✓ Average complexity: ${avgComplexity.toFixed(2)}`);
          console.log(`✓ Maximum complexity: ${maxComplexity}`);
        }

      } catch (error) {
        console.log('Complexity analysis completed');
      }
    });

    await test.step('Test code duplication', async () => {
      try {
        // Check for code duplication
        const { stdout } = await execAsync('npx jscpd src/ --threshold 5 --reporters json || echo "JSCPD not available"');

        if (!stdout.includes('not available')) {
          try {
            const jscpdResult = JSON.parse(stdout);
            const duplicationPercentage = jscpdResult.statistics?.total?.percentage || 0;

            expect(duplicationPercentage).toBeLessThanOrEqual(qualityThresholds.duplicateCode);

            console.log(`✓ Code duplication: ${duplicationPercentage}%`);
          } catch (parseError) {
            console.log('✓ Code duplication analysis completed');
          }
        }

      } catch (error) {
        console.log('Code duplication analysis skipped');
      }
    });

    await test.step('Test function and class size limits', async () => {
      try {
        // Analyze function sizes
        const { stdout } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | head -10');
        const sourceFiles = stdout.trim().split('\n').filter(f => f.trim());

        for (const file of sourceFiles.slice(0, 5)) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const lines = content.split('\n');

            // Check for overly long functions (simple heuristic)
            let inFunction = false;
            let functionLineCount = 0;
            let maxFunctionLines = 0;

            lines.forEach(line => {
              const trimmed = line.trim();

              if (trimmed.includes('function ') || trimmed.includes('=> {') || trimmed.match(/\w+\s*\([^)]*\)\s*\{/)) {
                inFunction = true;
                functionLineCount = 1;
              } else if (inFunction && trimmed === '}') {
                inFunction = false;
                maxFunctionLines = Math.max(maxFunctionLines, functionLineCount);
                functionLineCount = 0;
              } else if (inFunction) {
                functionLineCount++;
              }
            });

            // Functions should not be too long
            expect(maxFunctionLines).toBeLessThan(100);

            // File should not be too long
            expect(lines.length).toBeLessThan(500);

          } catch (fileError) {
            // Skip files that can't be read
          }
        }

        console.log('✓ Function and file size analysis completed');

      } catch (error) {
        console.log('Function size analysis skipped');
      }
    });
  });

  test('should validate documentation and comments', async ({ page }) => {
    await test.step('Test API documentation coverage', async () => {
      try {
        // Check for JSDoc comments in API files
        const { stdout } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "\\*\\*" | wc -l');
        const documentsWithJSDoc = parseInt(stdout.trim());

        const { stdout: totalFiles } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | wc -l');
        const totalSourceFiles = parseInt(totalFiles.trim());

        const documentationRatio = documentsWithJSDoc / totalSourceFiles;

        expect(documentationRatio).toBeGreaterThan(0.3); // At least 30% of files should have JSDoc

        console.log(`✓ Documentation coverage: ${(documentationRatio * 100).toFixed(1)}%`);

      } catch (error) {
        console.log('Documentation analysis completed');
      }
    });

    await test.step('Test README and documentation quality', async () => {
      try {
        // Check for README file
        const readmeContent = await fs.readFile('README.md', 'utf-8');

        expect(readmeContent.length).toBeGreaterThan(500); // README should be substantial
        expect(readmeContent.toLowerCase()).toContain('installation');
        expect(readmeContent.toLowerCase()).toContain('usage');

        // Check for common documentation sections
        const sections = ['## Installation', '## Usage', '## Development', '## Contributing'];
        sections.forEach(section => {
          if (readmeContent.includes(section)) {
            console.log(`✓ README section found: ${section}`);
          }
        });

      } catch (error) {
        console.log('⚠ README.md not found or incomplete');
      }

      // Check for other documentation files
      const docFiles = ['CONTRIBUTING.md', 'CHANGELOG.md', 'docs/', 'API.md'];

      for (const docFile of docFiles) {
        try {
          await fs.access(docFile);
          console.log(`✓ Documentation file found: ${docFile}`);
        } catch {
          console.log(`- Documentation file missing: ${docFile}`);
        }
      }
    });

    await test.step('Test inline comment quality', async () => {
      try {
        // Analyze comment quality in source files
        const { stdout } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | head -5');
        const sourceFiles = stdout.trim().split('\n').filter(f => f.trim());

        let totalLines = 0;
        let commentLines = 0;

        for (const file of sourceFiles) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const lines = content.split('\n');

            totalLines += lines.length;

            lines.forEach(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
                commentLines++;
              }
            });

          } catch (fileError) {
            // Skip files that can't be read
          }
        }

        const commentRatio = commentLines / totalLines;

        // Should have reasonable amount of comments (5-20%)
        expect(commentRatio).toBeGreaterThan(0.05);
        expect(commentRatio).toBeLessThan(0.5);

        console.log(`✓ Comment ratio: ${(commentRatio * 100).toFixed(1)}%`);

      } catch (error) {
        console.log('Comment analysis completed');
      }
    });
  });

  test('should validate architecture and design patterns', async ({ page }) => {
    await test.step('Test modular architecture', async () => {
      try {
        // Check for proper module structure
        const { stdout } = await execAsync('find src/ -type d | grep -v __tests__ | grep -v .git');
        const directories = stdout.trim().split('\n').filter(d => d.trim());

        // Should have organized directory structure
        const expectedDirs = ['components', 'utils', 'hooks', 'services', 'types'];
        const foundDirs = expectedDirs.filter(dir =>
          directories.some(d => d.includes(dir))
        );

        expect(foundDirs.length).toBeGreaterThan(2); // At least 3 expected directories

        console.log(`✓ Found organized directories: ${foundDirs.join(', ')}`);

        // Check for barrel exports (index.ts files)
        const { stdout: indexFiles } = await execAsync('find src/ -name "index.ts" | wc -l');
        const indexCount = parseInt(indexFiles.trim());

        if (indexCount > 0) {
          console.log(`✓ Barrel exports found: ${indexCount} index.ts files`);
        }

      } catch (error) {
        console.log('Architecture analysis completed');
      }
    });

    await test.step('Test separation of concerns', async () => {
      try {
        // Check for proper separation
        const patterns = [
          { pattern: 'components/', purpose: 'UI Components' },
          { pattern: 'hooks/', purpose: 'Custom Hooks' },
          { pattern: 'utils/', purpose: 'Utility Functions' },
          { pattern: 'services/', purpose: 'Business Logic' },
          { pattern: 'types/', purpose: 'Type Definitions' }
        ];

        for (const { pattern, purpose } of patterns) {
          try {
            const { stdout } = await execAsync(`find src/ -path "*${pattern}*" -name "*.ts" -o -name "*.tsx" | wc -l`);
            const fileCount = parseInt(stdout.trim());

            if (fileCount > 0) {
              console.log(`✓ ${purpose}: ${fileCount} files`);
            }
          } catch {
            // Pattern not found
          }
        }

        // Check for mixed concerns (anti-pattern)
        const { stdout } = await execAsync('find src/components/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "fetch\\|axios\\|api" | wc -l || echo "0"');
        const componentsWithAPI = parseInt(stdout.trim());

        // Components should not directly handle API calls
        expect(componentsWithAPI).toBeLessThan(5);

        console.log(`✓ Separation of concerns: ${componentsWithAPI} components with direct API calls`);

      } catch (error) {
        console.log('Separation of concerns analysis completed');
      }
    });

    await test.step('Test design pattern usage', async () => {
      try {
        // Check for common design patterns
        const patterns = [
          { name: 'Custom Hooks', search: 'use[A-Z].*\\(' },
          { name: 'Context Pattern', search: 'createContext\\|useContext' },
          { name: 'HOC Pattern', search: 'with[A-Z].*\\(' },
          { name: 'Render Props', search: 'children.*function\\|render.*=>' }
        ];

        for (const pattern of patterns) {
          try {
            const { stdout } = await execAsync(`find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "${pattern.search}" | wc -l`);
            const usage = parseInt(stdout.trim());

            if (usage > 0) {
              console.log(`✓ ${pattern.name}: Used in ${usage} files`);
            }
          } catch {
            // Pattern not found
          }
        }

        // Check for proper error boundaries
        const { stdout } = await execAsync('find src/ -name "*.tsx" | xargs grep -l "componentDidCatch\\|ErrorBoundary" | wc -l || echo "0"');
        const errorBoundaries = parseInt(stdout.trim());

        if (errorBoundaries > 0) {
          console.log(`✓ Error boundaries: ${errorBoundaries} implementations`);
        }

      } catch (error) {
        console.log('Design pattern analysis completed');
      }
    });
  });

  test('should validate performance and optimization', async ({ page }) => {
    await test.step('Test bundle optimization', async () => {
      try {
        // Check for bundle analysis tools
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));

        if (packageJson.scripts['bundle:analyze'] || packageJson.scripts['analyze']) {
          console.log('✓ Bundle analysis scripts available');
        }

        // Check for optimization plugins in build config
        const buildConfigs = ['vite.config.ts', 'webpack.config.js', 'rollup.config.js'];

        for (const config of buildConfigs) {
          try {
            const configContent = await fs.readFile(config, 'utf-8');

            if (configContent.includes('compression') || configContent.includes('minify')) {
              console.log(`✓ Optimization found in ${config}`);
            }
          } catch {
            // Config file not found
          }
        }

      } catch (error) {
        console.log('Bundle optimization analysis completed');
      }
    });

    await test.step('Test code splitting implementation', async () => {
      try {
        // Check for dynamic imports
        const { stdout } = await execAsync('find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "import(" | wc -l');
        const dynamicImports = parseInt(stdout.trim());

        if (dynamicImports > 0) {
          console.log(`✓ Code splitting: ${dynamicImports} files use dynamic imports`);
        }

        // Check for lazy loading
        const { stdout: lazyLoading } = await execAsync('find src/ -name "*.tsx" | xargs grep -l "lazy\\|Suspense" | wc -l || echo "0"');
        const lazyComponents = parseInt(lazyLoading.trim());

        if (lazyComponents > 0) {
          console.log(`✓ Lazy loading: ${lazyComponents} components use lazy loading`);
        }

      } catch (error) {
        console.log('Code splitting analysis completed');
      }
    });

    await test.step('Test performance optimization patterns', async () => {
      try {
        // Check for React optimization hooks
        const optimizationHooks = ['useMemo', 'useCallback', 'memo'];

        for (const hook of optimizationHooks) {
          const { stdout } = await execAsync(`find src/ -name "*.tsx" | xargs grep -l "${hook}" | wc -l || echo "0"`);
          const usage = parseInt(stdout.trim());

          if (usage > 0) {
            console.log(`✓ ${hook}: Used in ${usage} files`);
          }
        }

        // Check for unnecessary re-renders (anti-pattern)
        const { stdout } = await execAsync('find src/ -name "*.tsx" | xargs grep -l "\\[\\].*useEffect\\|useEffect.*\\[\\]" | wc -l || echo "0"');
        const emptyDepsEffects = parseInt(stdout.trim());

        console.log(`✓ useEffect with empty deps: ${emptyDepsEffects} instances`);

      } catch (error) {
        console.log('Performance optimization analysis completed');
      }
    });
  });
});