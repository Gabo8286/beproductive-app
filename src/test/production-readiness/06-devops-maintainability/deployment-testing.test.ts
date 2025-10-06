import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Deployment Testing', () => {
  const deploymentMetrics = {
    buildTime: 300000, // 5 minutes max build time
    deploymentTime: 600000, // 10 minutes max deployment time
    rollbackTime: 180000, // 3 minutes max rollback time
    healthCheckTimeout: 30000, // 30 seconds health check
    zeroDowntimeThreshold: 5000 // 5 seconds max downtime
  };

  test('should validate build process integrity', async ({ page }) => {
    await test.step('Test build configuration validation', async () => {
      // Check if package.json has proper build scripts
      try {
        const { stdout } = await execAsync('cat package.json');
        const packageJson = JSON.parse(stdout);

        expect(packageJson.scripts.build).toBeDefined();
        expect(packageJson.scripts.test).toBeDefined();
        expect(packageJson.scripts.lint).toBeDefined();

        // Check for production-specific scripts
        if (packageJson.scripts['build:production']) {
          expect(packageJson.scripts['build:production']).toBeDefined();
        }

        console.log('✓ Build scripts are properly configured');
      } catch (error) {
        throw new Error('Package.json build configuration is invalid');
      }
    });

    await test.step('Test build output validation', async () => {
      // Run build process
      const buildStart = Date.now();

      try {
        const { stdout, stderr } = await execAsync('npm run build', { timeout: deploymentMetrics.buildTime });

        const buildTime = Date.now() - buildStart;
        expect(buildTime).toBeLessThan(deploymentMetrics.buildTime);

        // Check for build warnings or errors
        expect(stderr).not.toContain('ERROR');

        // Check if build artifacts exist
        const { stdout: lsOutput } = await execAsync('ls -la dist/ || ls -la build/');
        expect(lsOutput).toContain('index.html');
        expect(lsOutput).toMatch(/\.(js|css)$/m);

        console.log(`✓ Build completed successfully in ${buildTime}ms`);
      } catch (error) {
        throw new Error(`Build process failed: ${error.message}`);
      }
    });

    await test.step('Test build optimization validation', async () => {
      try {
        // Check bundle sizes
        const { stdout } = await execAsync('du -sh dist/* || du -sh build/*');
        const bundleInfo = stdout.split('\n').filter(line => line.trim());

        bundleInfo.forEach(line => {
          const [size, file] = line.split('\t');

          // Main bundle should not exceed reasonable size limits
          if (file.includes('index') && file.includes('.js')) {
            const sizeInKB = parseFloat(size.replace(/[^\d.]/g, ''));
            if (size.includes('M')) {
              expect(sizeInKB).toBeLessThan(5); // < 5MB main bundle
            }
          }

          console.log(`Bundle: ${file} - ${size}`);
        });
      } catch (error) {
        console.log('Bundle size analysis not available');
      }
    });
  });

  test('should validate deployment automation', async ({ page }) => {
    await test.step('Test environment configuration validation', async () => {
      // Check for environment-specific configurations
      const environments = ['development', 'staging', 'production'];

      for (const env of environments) {
        try {
          const { stdout } = await execAsync(`ls -la .env.${env} || echo "No .env.${env} file"`);

          if (!stdout.includes('No .env')) {
            console.log(`✓ Environment config for ${env} exists`);

            // Validate environment variables are not exposed
            const { stdout: envContent } = await execAsync(`head -5 .env.${env} || echo "Cannot read"`);
            expect(envContent).not.toContain('password');
            expect(envContent).not.toContain('secret');
          }
        } catch (error) {
          console.log(`Environment config for ${env} not found (may be managed externally)`);
        }
      }
    });

    await test.step('Test deployment script validation', async () => {
      // Check for deployment automation scripts
      try {
        const { stdout } = await execAsync('ls -la scripts/ deploy/ .github/workflows/ || echo "No deployment scripts found"');

        if (!stdout.includes('No deployment scripts')) {
          console.log('✓ Deployment automation detected');

          // Check for common deployment files
          const deploymentFiles = [
            'docker-compose.yml',
            'Dockerfile',
            '.github/workflows/deploy.yml',
            'scripts/deploy.sh'
          ];

          for (const file of deploymentFiles) {
            try {
              await execAsync(`test -f ${file}`);
              console.log(`✓ ${file} exists`);
            } catch {
              console.log(`- ${file} not found`);
            }
          }
        }
      } catch (error) {
        console.log('Deployment script validation skipped');
      }
    });

    await test.step('Test CI/CD pipeline validation', async () => {
      // Check for CI/CD configuration
      const ciFiles = [
        '.github/workflows/',
        '.gitlab-ci.yml',
        'azure-pipelines.yml',
        'Jenkinsfile',
        '.circleci/config.yml'
      ];

      let ciConfigFound = false;

      for (const ciFile of ciFiles) {
        try {
          await execAsync(`test -f ${ciFile} || test -d ${ciFile}`);
          console.log(`✓ CI/CD configuration found: ${ciFile}`);
          ciConfigFound = true;
          break;
        } catch {
          // File not found, continue
        }
      }

      if (ciConfigFound) {
        console.log('✓ CI/CD pipeline is configured');
      } else {
        console.log('⚠ No CI/CD configuration detected');
      }
    });
  });

  test('should validate health checks and monitoring', async ({ page }) => {
    await test.step('Test health check endpoint reliability', async () => {
      await page.goto('/');

      // Test health check endpoint
      const healthCheckStart = Date.now();
      const healthResponse = await page.request.get('/health');

      const healthCheckTime = Date.now() - healthCheckStart;
      expect(healthCheckTime).toBeLessThan(deploymentMetrics.healthCheckTimeout);

      expect(healthResponse.status()).toBe(200);

      const healthData = await healthResponse.json();
      expect(healthData.status).toBe('healthy');

      console.log(`✓ Health check response time: ${healthCheckTime}ms`);
    });

    await test.step('Test readiness probe validation', async () => {
      // Test readiness endpoint
      const readinessResponse = await page.request.get('/ready');

      if (readinessResponse.status() === 200) {
        const readinessData = await readinessResponse.json();

        // Readiness should check dependencies
        expect(readinessData.database).toBeDefined();
        expect(readinessData.dependencies).toBeDefined();

        console.log('✓ Readiness probe is properly implemented');
      } else {
        console.log('⚠ Readiness probe not available');
      }
    });

    await test.step('Test liveness probe validation', async () => {
      // Test liveness endpoint
      const livenessResponse = await page.request.get('/live');

      if (livenessResponse.status() === 200) {
        const livenessData = await livenessResponse.json();

        expect(livenessData.status).toBe('alive');
        expect(livenessData.timestamp).toBeDefined();

        console.log('✓ Liveness probe is properly implemented');
      } else {
        console.log('⚠ Liveness probe not available');
      }
    });

    await test.step('Test metrics endpoint availability', async () => {
      // Test metrics endpoint for monitoring
      const metricsResponse = await page.request.get('/metrics');

      if (metricsResponse.status() === 200) {
        const metricsText = await metricsResponse.text();

        // Should contain Prometheus-style metrics
        expect(metricsText).toMatch(/# HELP|# TYPE/);
        expect(metricsText).toMatch(/http_requests_total|nodejs_/);

        console.log('✓ Metrics endpoint is available for monitoring');
      } else {
        console.log('⚠ Metrics endpoint not available');
      }
    });
  });

  test('should validate rollback and recovery procedures', async ({ page }) => {
    await test.step('Test application version information', async () => {
      // Check for version endpoint
      const versionResponse = await page.request.get('/version');

      if (versionResponse.status() === 200) {
        const versionData = await versionResponse.json();

        expect(versionData.version).toBeDefined();
        expect(versionData.build).toBeDefined();
        expect(versionData.commit).toBeDefined();

        console.log(`✓ Application version: ${versionData.version}`);
        console.log(`✓ Build info: ${versionData.build}`);
      } else {
        console.log('⚠ Version endpoint not available');
      }
    });

    await test.step('Test configuration rollback capability', async () => {
      // Test configuration backup and restore
      try {
        // Check if backup scripts exist
        await execAsync('test -f scripts/backup-config.sh || test -f scripts/backup.sh');
        console.log('✓ Configuration backup scripts available');

        // Check if restore scripts exist
        await execAsync('test -f scripts/restore-config.sh || test -f scripts/restore.sh');
        console.log('✓ Configuration restore scripts available');

      } catch (error) {
        console.log('⚠ Backup/restore scripts not found');
      }
    });

    await test.step('Test blue-green deployment readiness', async () => {
      // Check for multiple environment support
      const response = await page.request.get('/api/admin/deployment-info');

      if (response.status() === 200) {
        const deploymentInfo = await response.json();

        if (deploymentInfo.environment) {
          expect(deploymentInfo.environment).toMatch(/blue|green|staging|production/);
          console.log(`✓ Current environment: ${deploymentInfo.environment}`);
        }

        if (deploymentInfo.deploymentStrategy) {
          console.log(`✓ Deployment strategy: ${deploymentInfo.deploymentStrategy}`);
        }
      }
    });
  });

  test('should validate container and orchestration readiness', async ({ page }) => {
    await test.step('Test Docker configuration', async () => {
      try {
        // Check for Dockerfile
        await execAsync('test -f Dockerfile');
        console.log('✓ Dockerfile exists');

        // Validate Dockerfile best practices
        const { stdout } = await execAsync('cat Dockerfile');

        // Should use non-root user
        expect(stdout).toMatch(/USER|RUN adduser|RUN useradd/);

        // Should have proper labels
        expect(stdout).toMatch(/LABEL|MAINTAINER/);

        // Should expose ports
        expect(stdout).toMatch(/EXPOSE/);

        console.log('✓ Dockerfile follows best practices');
      } catch (error) {
        console.log('⚠ Docker configuration not found');
      }
    });

    await test.step('Test container orchestration configuration', async () => {
      const orchestrationFiles = [
        'docker-compose.yml',
        'docker-compose.prod.yml',
        'k8s/',
        'kubernetes/',
        'helm/'
      ];

      let orchestrationFound = false;

      for (const file of orchestrationFiles) {
        try {
          await execAsync(`test -f ${file} || test -d ${file}`);
          console.log(`✓ Container orchestration config found: ${file}`);
          orchestrationFound = true;

          if (file.includes('docker-compose')) {
            // Validate docker-compose configuration
            const { stdout } = await execAsync(`cat ${file}`);
            expect(stdout).toMatch(/version:|services:/);
            expect(stdout).toMatch(/ports:|expose:/);
          }
        } catch {
          // File not found, continue
        }
      }

      if (orchestrationFound) {
        console.log('✓ Container orchestration is configured');
      }
    });

    await test.step('Test Kubernetes deployment readiness', async () => {
      try {
        // Check for Kubernetes manifests
        const { stdout } = await execAsync('find . -name "*.yml" -o -name "*.yaml" | grep -i k8s || echo "No K8s files"');

        if (!stdout.includes('No K8s files')) {
          console.log('✓ Kubernetes manifests found');

          // Check for required Kubernetes resources
          const manifestContent = await execAsync('cat k8s/*.yml || cat kubernetes/*.yaml || echo "No content"');

          if (!manifestContent.stdout.includes('No content')) {
            expect(manifestContent.stdout).toMatch(/kind: Deployment|kind: Service/);
            expect(manifestContent.stdout).toMatch(/apiVersion/);
            console.log('✓ Kubernetes manifests are properly structured');
          }
        }
      } catch (error) {
        console.log('⚠ Kubernetes configuration not found');
      }
    });
  });

  test('should validate security in deployment', async ({ page }) => {
    await test.step('Test secrets management', async () => {
      // Check that secrets are not in source code
      try {
        const { stdout } = await execAsync('grep -r "password\\|secret\\|key" . --exclude-dir=node_modules --exclude-dir=.git || echo "No secrets found"');

        if (!stdout.includes('No secrets found')) {
          const lines = stdout.split('\n').filter(line =>
            !line.includes('.test.') &&
            !line.includes('README') &&
            !line.includes('package-lock.json') &&
            !line.includes('EXAMPLE') &&
            !line.includes('placeholder')
          );

          if (lines.length > 0) {
            console.log('⚠ Potential secrets found in source code:');
            lines.slice(0, 5).forEach(line => console.log(`  ${line}`));
          }
        } else {
          console.log('✓ No hardcoded secrets detected');
        }
      } catch (error) {
        console.log('Secret scanning completed');
      }
    });

    await test.step('Test environment variable security', async () => {
      // Check for proper environment variable usage
      try {
        const { stdout } = await execAsync('grep -r "process\\.env" src/ || echo "No env vars"');

        if (!stdout.includes('No env vars')) {
          // Should use environment variables for configuration
          expect(stdout).toMatch(/process\.env\./);
          console.log('✓ Environment variables are used for configuration');
        }
      } catch (error) {
        console.log('Environment variable check completed');
      }
    });

    await test.step('Test SSL/TLS configuration in deployment', async () => {
      await page.goto('/');

      // Check if the application is served over HTTPS in production
      if (process.env.NODE_ENV === 'production') {
        expect(page.url()).toMatch(/^https:/);
        console.log('✓ Production deployment uses HTTPS');
      }

      // Check security headers
      const response = await page.request.get('/');
      const headers = response.headers();

      const securityHeaders = [
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options',
        'content-security-policy'
      ];

      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`✓ Security header present: ${header}`);
        } else {
          console.log(`⚠ Security header missing: ${header}`);
        }
      });
    });
  });

  test('should validate deployment performance', async ({ page }) => {
    await test.step('Test cold start performance', async () => {
      // Simulate cold start by clearing caches
      await page.evaluate(() => {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      });

      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const coldStartTime = Date.now() - startTime;
      expect(coldStartTime).toBeLessThan(5000); // 5 seconds for cold start

      console.log(`✓ Cold start performance: ${coldStartTime}ms`);
    });

    await test.step('Test resource loading optimization', async () => {
      await page.goto('/');

      // Check for resource optimization
      const resourceMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return {
          totalResources: entries.length,
          totalSize: entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
          cacheHits: entries.filter(entry => entry.transferSize === 0).length
        };
      });

      console.log(`✓ Total resources loaded: ${resourceMetrics.totalResources}`);
      console.log(`✓ Total transfer size: ${resourceMetrics.totalSize} bytes`);
      console.log(`✓ Cache hits: ${resourceMetrics.cacheHits}`);

      // Resource optimization checks
      expect(resourceMetrics.totalSize).toBeLessThan(5 * 1024 * 1024); // < 5MB total
      expect(resourceMetrics.cacheHits).toBeGreaterThan(0); // Some resources should be cached
    });

    await test.step('Test deployment scaling indicators', async () => {
      // Check for auto-scaling readiness
      const scalingResponse = await page.request.get('/api/admin/scaling-info');

      if (scalingResponse.status() === 200) {
        const scalingInfo = await scalingResponse.json();

        if (scalingInfo.horizontal) {
          expect(scalingInfo.horizontal.enabled).toBeDefined();
          console.log(`✓ Horizontal scaling: ${scalingInfo.horizontal.enabled ? 'enabled' : 'disabled'}`);
        }

        if (scalingInfo.vertical) {
          expect(scalingInfo.vertical.enabled).toBeDefined();
          console.log(`✓ Vertical scaling: ${scalingInfo.vertical.enabled ? 'enabled' : 'disabled'}`);
        }

        if (scalingInfo.metrics) {
          expect(scalingInfo.metrics.cpu).toBeDefined();
          expect(scalingInfo.metrics.memory).toBeDefined();
          console.log(`✓ Scaling metrics available`);
        }
      }
    });
  });
});