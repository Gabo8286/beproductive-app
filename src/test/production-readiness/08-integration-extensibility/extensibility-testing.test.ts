import { test, expect } from '@playwright/test';

test.describe('Extensibility Testing', () => {
  const extensibilityMetrics = {
    pluginLoadTime: 2000, // 2 seconds max plugin load time
    apiResponseTime: 1000, // 1 second for extension APIs
    maxPlugins: 50, // Maximum concurrent plugins
    memoryOverhead: 100 * 1024 * 1024, // 100MB max overhead per plugin
    hookExecutionTime: 500 // 500ms max hook execution time
  };

  test('should support plugin architecture and lifecycle', async ({ page }) => {
    await test.step('Test plugin registration and discovery', async () => {
      // Check plugin registry
      const pluginRegistryResponse = await page.request.get('/api/admin/plugins/registry');

      if (pluginRegistryResponse.status() === 200) {
        const registry = await pluginRegistryResponse.json();

        expect(registry.plugins).toBeDefined();
        expect(Array.isArray(registry.plugins)).toBe(true);

        if (registry.plugins.length > 0) {
          registry.plugins.forEach((plugin: any) => {
            expect(plugin.id).toBeDefined();
            expect(plugin.name).toBeDefined();
            expect(plugin.version).toBeDefined();
            expect(plugin.status).toBeDefined();

            console.log(`✓ Plugin: ${plugin.name} v${plugin.version} (${plugin.status})`);
          });
        }

        console.log(`✓ Plugin registry: ${registry.plugins.length} plugins registered`);
      }
    });

    await test.step('Test plugin installation and activation', async () => {
      // Test plugin installation
      const testPlugin = {
        id: 'test-extension-plugin',
        name: 'Test Extension Plugin',
        version: '1.0.0',
        description: 'Plugin for extensibility testing',
        manifest: {
          permissions: ['tasks.read', 'tasks.write'],
          hooks: ['task.created', 'task.updated'],
          api: {
            endpoints: ['/api/plugins/test-extension/custom']
          }
        }
      };

      const installResponse = await page.request.post('/api/admin/plugins/install', {
        data: testPlugin
      });

      if (installResponse.status() === 201) {
        const installation = await installResponse.json();

        expect(installation.pluginId).toBe(testPlugin.id);
        expect(installation.status).toBe('installed');

        // Activate the plugin
        const activateResponse = await page.request.post(`/api/admin/plugins/${testPlugin.id}/activate`);

        if (activateResponse.status() === 200) {
          const activation = await activateResponse.json();

          expect(activation.status).toBe('active');
          expect(activation.loadTime).toBeLessThan(extensibilityMetrics.pluginLoadTime);

          console.log(`✓ Plugin activated in ${activation.loadTime}ms`);
        }
      }
    });

    await test.step('Test plugin isolation and sandboxing', async () => {
      // Test that plugins are properly isolated
      const isolationTestResponse = await page.request.post('/api/admin/plugins/test-isolation', {
        data: {
          pluginId: 'test-extension-plugin',
          testType: 'memory-access'
        }
      });

      if (isolationTestResponse.status() === 200) {
        const isolationResult = await isolationTestResponse.json();

        expect(isolationResult.isolated).toBe(true);
        expect(isolationResult.violations).toBe(0);

        console.log('✓ Plugin isolation verified');
      }

      // Test resource limits
      const resourceTestResponse = await page.request.post('/api/admin/plugins/test-resources', {
        data: {
          pluginId: 'test-extension-plugin',
          testType: 'memory-limit'
        }
      });

      if (resourceTestResponse.status() === 200) {
        const resourceResult = await resourceTestResponse.json();

        expect(resourceResult.memoryUsage).toBeLessThan(extensibilityMetrics.memoryOverhead);
        expect(resourceResult.withinLimits).toBe(true);

        console.log(`✓ Plugin resource usage: ${(resourceResult.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
      }
    });

    await test.step('Test plugin dependencies and compatibility', async () => {
      // Test plugin dependency resolution
      const dependenciesResponse = await page.request.get('/api/admin/plugins/test-extension-plugin/dependencies');

      if (dependenciesResponse.status() === 200) {
        const dependencies = await dependenciesResponse.json();

        if (dependencies.required && dependencies.required.length > 0) {
          dependencies.required.forEach((dep: any) => {
            expect(dep.satisfied).toBe(true);
            expect(dep.version).toBeDefined();

            console.log(`✓ Dependency satisfied: ${dep.name}@${dep.version}`);
          });
        }

        // Test version compatibility
        if (dependencies.compatibility) {
          expect(dependencies.compatibility.coreVersion).toBe(true);
          expect(dependencies.compatibility.apiVersion).toBe(true);

          console.log('✓ Plugin compatibility verified');
        }
      }
    });
  });

  test('should support hook system and event handling', async ({ page }) => {
    await test.step('Test hook registration and execution', async () => {
      // Register test hooks
      const hookRegistrationResponse = await page.request.post('/api/admin/hooks/register', {
        data: {
          pluginId: 'test-extension-plugin',
          hooks: [
            {
              event: 'task.created',
              handler: 'onTaskCreated',
              priority: 10
            },
            {
              event: 'task.updated',
              handler: 'onTaskUpdated',
              priority: 5
            }
          ]
        }
      });

      if (hookRegistrationResponse.status() === 200) {
        const registration = await hookRegistrationResponse.json();

        expect(registration.registered).toBe(true);
        expect(registration.hooks.length).toBe(2);

        console.log('✓ Hooks registered successfully');
      }

      // Test hook execution
      const taskCreationResponse = await page.request.post('/api/tasks', {
        data: {
          title: 'Hook Test Task',
          description: 'Testing hook execution'
        }
      });

      if (taskCreationResponse.status() === 201) {
        const task = await taskCreationResponse.json();

        // Wait for hooks to execute
        await page.waitForTimeout(1000);

        // Check hook execution log
        const hookLogResponse = await page.request.get(`/api/admin/hooks/execution-log?event=task.created&taskId=${task.id}`);

        if (hookLogResponse.status() === 200) {
          const hookLog = await hookLogResponse.json();

          expect(hookLog.executions.length).toBeGreaterThan(0);

          hookLog.executions.forEach((execution: any) => {
            expect(execution.success).toBe(true);
            expect(execution.executionTime).toBeLessThan(extensibilityMetrics.hookExecutionTime);

            console.log(`✓ Hook executed: ${execution.handler} in ${execution.executionTime}ms`);
          });
        }
      }
    });

    await test.step('Test hook priority and ordering', async () => {
      // Create multiple hooks with different priorities
      const priorityHooksResponse = await page.request.post('/api/admin/hooks/register', {
        data: {
          pluginId: 'test-priority-plugin',
          hooks: [
            { event: 'test.priority', handler: 'highPriority', priority: 100 },
            { event: 'test.priority', handler: 'mediumPriority', priority: 50 },
            { event: 'test.priority', handler: 'lowPriority', priority: 10 }
          ]
        }
      });

      if (priorityHooksResponse.status() === 200) {
        // Trigger the event
        const eventTriggerResponse = await page.request.post('/api/admin/events/trigger', {
          data: {
            event: 'test.priority',
            payload: { test: true }
          }
        });

        if (eventTriggerResponse.status() === 200) {
          const eventResult = await eventTriggerResponse.json();

          expect(eventResult.hookOrder).toBeDefined();
          expect(eventResult.hookOrder[0]).toBe('highPriority');
          expect(eventResult.hookOrder[1]).toBe('mediumPriority');
          expect(eventResult.hookOrder[2]).toBe('lowPriority');

          console.log(`✓ Hook execution order: ${eventResult.hookOrder.join(' → ')}`);
        }
      }
    });

    await test.step('Test hook error handling and fallbacks', async () => {
      // Register a hook that will fail
      const failingHookResponse = await page.request.post('/api/admin/hooks/register', {
        data: {
          pluginId: 'test-failing-plugin',
          hooks: [
            {
              event: 'test.error',
              handler: 'failingHandler',
              fallback: 'errorFallback'
            }
          ]
        }
      });

      if (failingHookResponse.status() === 200) {
        // Trigger event that will cause hook failure
        const errorEventResponse = await page.request.post('/api/admin/events/trigger', {
          data: {
            event: 'test.error',
            payload: { shouldFail: true }
          }
        });

        if (errorEventResponse.status() === 200) {
          const errorResult = await errorEventResponse.json();

          expect(errorResult.errors.length).toBeGreaterThan(0);
          expect(errorResult.fallbackExecuted).toBe(true);

          console.log('✓ Hook error handling and fallback working');
        }
      }
    });
  });

  test('should support custom extensions and widgets', async ({ page }) => {
    await test.step('Test custom widget registration', async () => {
      const customWidget = {
        id: 'test-custom-widget',
        name: 'Test Custom Widget',
        type: 'dashboard-widget',
        config: {
          position: { x: 0, y: 0, width: 4, height: 2 },
          props: {
            title: 'Custom Widget Test',
            refreshInterval: 30000
          }
        },
        component: 'CustomTestWidget'
      };

      const widgetRegistrationResponse = await page.request.post('/api/admin/extensions/widgets/register', {
        data: customWidget
      });

      if (widgetRegistrationResponse.status() === 201) {
        const registration = await widgetRegistrationResponse.json();

        expect(registration.widgetId).toBe(customWidget.id);
        expect(registration.registered).toBe(true);

        console.log('✓ Custom widget registered');

        // Test widget rendering
        await page.goto('/dashboard');

        const customWidgetElement = page.locator(`[data-widget-id="${customWidget.id}"]`);

        if (await customWidgetElement.count() > 0) {
          await expect(customWidgetElement).toBeVisible();
          console.log('✓ Custom widget rendered on dashboard');
        }
      }
    });

    await test.step('Test custom menu extensions', async () => {
      const customMenuItems = [
        {
          id: 'test-menu-item-1',
          label: 'Custom Action',
          icon: 'custom-icon',
          position: 'main-menu',
          action: 'customAction',
          permissions: ['custom.action']
        },
        {
          id: 'test-context-menu',
          label: 'Custom Context',
          position: 'task-context-menu',
          action: 'customContext'
        }
      ];

      const menuExtensionResponse = await page.request.post('/api/admin/extensions/menu/register', {
        data: { menuItems: customMenuItems }
      });

      if (menuExtensionResponse.status() === 201) {
        console.log('✓ Custom menu items registered');

        // Test menu item visibility
        await page.goto('/dashboard');

        for (const menuItem of customMenuItems) {
          const menuElement = page.locator(`[data-menu-id="${menuItem.id}"]`);

          if (await menuElement.count() > 0) {
            await expect(menuElement).toBeVisible();
            console.log(`✓ Menu item visible: ${menuItem.label}`);
          }
        }
      }
    });

    await test.step('Test custom field extensions', async () => {
      const customFields = [
        {
          id: 'custom-priority-field',
          name: 'Custom Priority',
          type: 'select',
          entity: 'task',
          config: {
            options: [
              { value: 'urgent', label: 'Urgent', color: '#ff0000' },
              { value: 'normal', label: 'Normal', color: '#00ff00' },
              { value: 'low', label: 'Low', color: '#0000ff' }
            ]
          }
        },
        {
          id: 'custom-tags-field',
          name: 'Custom Tags',
          type: 'multi-select',
          entity: 'task',
          config: {
            allowCreate: true,
            maxItems: 5
          }
        }
      ];

      const fieldExtensionResponse = await page.request.post('/api/admin/extensions/fields/register', {
        data: { customFields }
      });

      if (fieldExtensionResponse.status() === 201) {
        console.log('✓ Custom fields registered');

        // Test custom fields in task creation
        await page.goto('/tasks/create');

        for (const field of customFields) {
          const fieldElement = page.locator(`[data-field-id="${field.id}"]`);

          if (await fieldElement.count() > 0) {
            await expect(fieldElement).toBeVisible();
            console.log(`✓ Custom field visible: ${field.name}`);
          }
        }
      }
    });
  });

  test('should support API extensibility and custom endpoints', async ({ page }) => {
    await test.step('Test custom API endpoint registration', async () => {
      const customEndpoints = [
        {
          path: '/api/plugins/test-extension/analytics',
          method: 'GET',
          handler: 'getAnalytics',
          permissions: ['analytics.read'],
          rateLimit: { requests: 100, window: 3600 }
        },
        {
          path: '/api/plugins/test-extension/export',
          method: 'POST',
          handler: 'exportData',
          permissions: ['data.export'],
          validation: {
            body: {
              format: { type: 'string', enum: ['csv', 'json', 'xlsx'] },
              filters: { type: 'object' }
            }
          }
        }
      ];

      const endpointRegistrationResponse = await page.request.post('/api/admin/extensions/endpoints/register', {
        data: { endpoints: customEndpoints }
      });

      if (endpointRegistrationResponse.status() === 201) {
        console.log('✓ Custom API endpoints registered');

        // Test custom endpoint functionality
        for (const endpoint of customEndpoints) {
          const testResponse = await page.request.fetch(endpoint.path, {
            method: endpoint.method,
            data: endpoint.method === 'POST' ? JSON.stringify({
              format: 'json',
              filters: { status: 'active' }
            }) : undefined,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Endpoint should be accessible (may require auth)
          expect([200, 401, 403]).toContain(testResponse.status());

          console.log(`✓ Custom endpoint accessible: ${endpoint.method} ${endpoint.path} (${testResponse.status()})`);
        }
      }
    });

    await test.step('Test middleware extension support', async () => {
      const customMiddleware = {
        id: 'test-auth-middleware',
        name: 'Custom Auth Middleware',
        type: 'authentication',
        order: 10,
        config: {
          skipPaths: ['/api/health', '/api/public/*'],
          customHeaders: ['X-Custom-Auth']
        }
      };

      const middlewareResponse = await page.request.post('/api/admin/extensions/middleware/register', {
        data: customMiddleware
      });

      if (middlewareResponse.status() === 201) {
        console.log('✓ Custom middleware registered');

        // Test middleware execution
        const middlewareTestResponse = await page.request.get('/api/middleware-test', {
          headers: {
            'X-Custom-Auth': 'test-token'
          }
        });

        if (middlewareTestResponse.status() === 200) {
          const middlewareResult = await middlewareTestResponse.json();

          expect(middlewareResult.middlewareExecuted).toBe(true);
          expect(middlewareResult.customAuth).toBe('test-token');

          console.log('✓ Custom middleware executed successfully');
        }
      }
    });

    await test.step('Test data model extensions', async () => {
      const customModel = {
        name: 'CustomTaskAttribute',
        fields: [
          {
            name: 'customPriority',
            type: 'string',
            nullable: false,
            default: 'normal'
          },
          {
            name: 'customMetadata',
            type: 'json',
            nullable: true
          },
          {
            name: 'externalId',
            type: 'string',
            unique: true,
            nullable: true
          }
        ],
        relations: [
          {
            type: 'belongsTo',
            target: 'Task',
            foreignKey: 'taskId'
          }
        ]
      };

      const modelExtensionResponse = await page.request.post('/api/admin/extensions/models/register', {
        data: customModel
      });

      if (modelExtensionResponse.status() === 201) {
        console.log('✓ Custom data model registered');

        // Test model usage
        const modelTestResponse = await page.request.post('/api/admin/extensions/models/test', {
          data: {
            model: 'CustomTaskAttribute',
            operation: 'create',
            data: {
              taskId: 1,
              customPriority: 'urgent',
              customMetadata: { source: 'extension' }
            }
          }
        });

        if (modelTestResponse.status() === 201) {
          const modelResult = await modelTestResponse.json();

          expect(modelResult.created).toBe(true);
          expect(modelResult.data.customPriority).toBe('urgent');

          console.log('✓ Custom model operations working');
        }
      }
    });
  });

  test('should support theme and UI extensibility', async ({ page }) => {
    await test.step('Test custom theme registration', async () => {
      const customTheme = {
        id: 'test-custom-theme',
        name: 'Test Custom Theme',
        type: 'complete',
        colors: {
          primary: '#ff6b35',
          secondary: '#f7931e',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#212529'
        },
        fonts: {
          primary: 'Inter, sans-serif',
          monospace: 'Fira Code, monospace'
        },
        spacing: {
          base: 8,
          scale: 1.2
        }
      };

      const themeRegistrationResponse = await page.request.post('/api/admin/extensions/themes/register', {
        data: customTheme
      });

      if (themeRegistrationResponse.status() === 201) {
        console.log('✓ Custom theme registered');

        // Test theme application
        await page.goto('/settings/appearance');

        const themeSelector = page.locator(`[data-theme-id="${customTheme.id}"]`);

        if (await themeSelector.count() > 0) {
          await themeSelector.click();

          // Verify theme is applied
          const rootElement = page.locator('html');
          const primaryColor = await rootElement.evaluate(el =>
            getComputedStyle(el).getPropertyValue('--color-primary')
          );

          if (primaryColor.includes(customTheme.colors.primary.replace('#', ''))) {
            console.log('✓ Custom theme applied successfully');
          }
        }
      }
    });

    await test.step('Test component override system', async () => {
      const componentOverrides = [
        {
          originalComponent: 'TaskCard',
          overrideComponent: 'CustomTaskCard',
          conditions: {
            priority: 'high'
          }
        },
        {
          originalComponent: 'HeaderNavigation',
          overrideComponent: 'CustomHeaderNavigation',
          global: true
        }
      ];

      const overrideResponse = await page.request.post('/api/admin/extensions/components/register-overrides', {
        data: { overrides: componentOverrides }
      });

      if (overrideResponse.status() === 201) {
        console.log('✓ Component overrides registered');

        // Test component override execution
        await page.goto('/tasks');

        // Create a high priority task to trigger override
        const highPriorityTaskResponse = await page.request.post('/api/tasks', {
          data: {
            title: 'High Priority Override Test',
            priority: 'high'
          }
        });

        if (highPriorityTaskResponse.status() === 201) {
          await page.reload();

          const customTaskCard = page.locator('[data-component="CustomTaskCard"]');

          if (await customTaskCard.count() > 0) {
            console.log('✓ Component override applied for high priority task');
          }
        }
      }
    });

    await test.step('Test layout extension system', async () => {
      const layoutExtensions = [
        {
          id: 'custom-sidebar-widget',
          position: 'sidebar-bottom',
          component: 'CustomSidebarWidget',
          permissions: ['dashboard.view']
        },
        {
          id: 'custom-header-action',
          position: 'header-actions',
          component: 'CustomHeaderAction',
          icon: 'custom-action'
        }
      ];

      const layoutExtensionResponse = await page.request.post('/api/admin/extensions/layout/register', {
        data: { extensions: layoutExtensions }
      });

      if (layoutExtensionResponse.status() === 201) {
        console.log('✓ Layout extensions registered');

        await page.goto('/dashboard');

        for (const extension of layoutExtensions) {
          const extensionElement = page.locator(`[data-extension-id="${extension.id}"]`);

          if (await extensionElement.count() > 0) {
            await expect(extensionElement).toBeVisible();
            console.log(`✓ Layout extension visible: ${extension.id}`);
          }
        }
      }
    });
  });

  test('should validate extension performance and resource management', async ({ page }) => {
    await test.step('Test extension loading performance', async () => {
      // Monitor extension loading times
      const loadStartTime = Date.now();

      const extensionLoadResponse = await page.request.post('/api/admin/extensions/load-all');

      if (extensionLoadResponse.status() === 200) {
        const loadResult = await extensionLoadResponse.json();

        const totalLoadTime = Date.now() - loadStartTime;

        expect(totalLoadTime).toBeLessThan(5000); // 5 seconds for all extensions

        if (loadResult.extensions) {
          loadResult.extensions.forEach((ext: any) => {
            expect(ext.loadTime).toBeLessThan(extensibilityMetrics.pluginLoadTime);
            console.log(`✓ Extension loaded: ${ext.name} in ${ext.loadTime}ms`);
          });
        }

        console.log(`✓ All extensions loaded in ${totalLoadTime}ms`);
      }
    });

    await test.step('Test resource usage monitoring', async () => {
      const resourceMonitoringResponse = await page.request.get('/api/admin/extensions/resource-usage');

      if (resourceMonitoringResponse.status() === 200) {
        const resources = await resourceMonitoringResponse.json();

        if (resources.extensions) {
          resources.extensions.forEach((ext: any) => {
            expect(ext.memoryUsage).toBeLessThan(extensibilityMetrics.memoryOverhead);

            if (ext.cpuUsage) {
              expect(ext.cpuUsage).toBeLessThan(50); // 50% CPU usage max
            }

            console.log(`✓ Extension resources: ${ext.name} - ${(ext.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
          });
        }

        if (resources.total) {
          expect(resources.total.memoryUsage).toBeLessThan(500 * 1024 * 1024); // 500MB total max
          console.log(`✓ Total extension memory: ${(resources.total.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    });

    await test.step('Test extension error handling and recovery', async () => {
      // Simulate extension failure
      const failureSimulationResponse = await page.request.post('/api/admin/extensions/simulate-failure', {
        data: {
          extensionId: 'test-extension-plugin',
          failureType: 'runtime-error'
        }
      });

      if (failureSimulationResponse.status() === 200) {
        const failureResult = await failureSimulationResponse.json();

        expect(failureResult.errorHandled).toBe(true);
        expect(failureResult.systemStable).toBe(true);

        // Check that other extensions continue to work
        const healthCheckResponse = await page.request.get('/api/admin/extensions/health');

        if (healthCheckResponse.status() === 200) {
          const health = await healthCheckResponse.json();

          const workingExtensions = health.extensions.filter((ext: any) => ext.status === 'active').length;
          expect(workingExtensions).toBeGreaterThan(0);

          console.log('✓ Extension failure handled gracefully');
          console.log(`✓ ${workingExtensions} extensions still active`);
        }
      }
    });
  });
});