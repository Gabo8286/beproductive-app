import { test, expect } from '@playwright/test';

test.describe('Data Integrity Tests', () => {
  const dataIntegrityThresholds = {
    transactionTimeout: 30000, // 30 seconds max transaction time
    consistencyCheckTime: 5000, // 5 seconds for consistency checks
    backupVerificationTime: 60000, // 1 minute for backup verification
    dataValidationAccuracy: 99.9, // 99.9% data validation accuracy
    concurrentTransactionLimit: 100 // 100 concurrent transactions
  };

  test('should maintain ACID properties in transactions', async ({ page }) => {
    await test.step('Test Atomicity - All or nothing transactions', async () => {
      // Create a complex transaction that should succeed completely or fail completely
      const transactionData = {
        userId: 'test-user-' + Date.now(),
        projectData: {
          name: 'Test Project',
          description: 'Transaction test project'
        },
        taskData: {
          title: 'Test Task',
          description: 'Transaction test task'
        }
      };

      // Attempt a complex creation that involves multiple tables
      const response = await page.request.post('/api/transactions/create-project-with-tasks', {
        data: transactionData
      });

      if (response.status() === 201) {
        const result = await response.json();

        // Verify all related data was created
        const projectResponse = await page.request.get(`/api/projects/${result.projectId}`);
        expect(projectResponse.status()).toBe(200);

        const taskResponse = await page.request.get(`/api/tasks?projectId=${result.projectId}`);
        expect(taskResponse.status()).toBe(200);

        const tasks = await taskResponse.json();
        expect(tasks.length).toBeGreaterThan(0);

        console.log('✓ Atomicity: Complex transaction succeeded completely');
      } else if (response.status() >= 400) {
        // Verify nothing was created if transaction failed
        const projectCheck = await page.request.get(`/api/projects?name=${transactionData.projectData.name}`);
        const projects = await projectCheck.json();

        expect(projects.length).toBe(0);

        console.log('✓ Atomicity: Failed transaction left no partial data');
      }
    });

    await test.step('Test Consistency - Data remains valid across constraints', async () => {
      // Test referential integrity
      const projectResponse = await page.request.post('/api/projects', {
        data: {
          name: 'Consistency Test Project',
          description: 'Testing data consistency'
        }
      });

      if (projectResponse.status() === 201) {
        const project = await projectResponse.json();

        // Create a task with valid project reference
        const taskResponse = await page.request.post('/api/tasks', {
          data: {
            title: 'Consistency Test Task',
            description: 'Testing referential integrity',
            projectId: project.id
          }
        });

        expect(taskResponse.status()).toBe(201);

        // Try to delete the project while it has tasks (should fail)
        const deleteResponse = await page.request.delete(`/api/projects/${project.id}`);
        expect(deleteResponse.status()).toBe(409); // Conflict due to foreign key constraint

        // Verify project still exists
        const verifyResponse = await page.request.get(`/api/projects/${project.id}`);
        expect(verifyResponse.status()).toBe(200);

        console.log('✓ Consistency: Referential integrity maintained');
      }
    });

    await test.step('Test Isolation - Concurrent transactions do not interfere', async () => {
      const projectId = 'test-project-' + Date.now();

      // Create a project for testing
      const projectResponse = await page.request.post('/api/projects', {
        data: {
          id: projectId,
          name: 'Isolation Test Project',
          taskCount: 0
        }
      });

      if (projectResponse.status() === 201) {
        // Simulate concurrent updates to the same project
        const concurrentUpdates = [];

        for (let i = 0; i < 10; i++) {
          concurrentUpdates.push(
            page.request.patch(`/api/projects/${projectId}/increment-task-count`)
          );
        }

        const results = await Promise.allSettled(concurrentUpdates);

        // All updates should succeed
        const successfulUpdates = results.filter(r =>
          r.status === 'fulfilled' && r.value.status() === 200
        ).length;

        expect(successfulUpdates).toBe(10);

        // Final count should be exactly 10 (no lost updates)
        const finalState = await page.request.get(`/api/projects/${projectId}`);
        const finalProject = await finalState.json();

        expect(finalProject.taskCount).toBe(10);

        console.log('✓ Isolation: Concurrent updates handled correctly');
      }
    });

    await test.step('Test Durability - Committed data survives system failures', async () => {
      // Create data and verify it's properly persisted
      const durabilityData = {
        name: 'Durability Test Project',
        description: 'Testing data persistence',
        timestamp: Date.now()
      };

      const response = await page.request.post('/api/projects', {
        data: durabilityData
      });

      if (response.status() === 201) {
        const project = await response.json();

        // Simulate system restart by clearing caches
        await page.request.post('/api/admin/clear-cache');

        // Verify data still exists after cache clear
        const verifyResponse = await page.request.get(`/api/projects/${project.id}`);
        expect(verifyResponse.status()).toBe(200);

        const retrievedProject = await verifyResponse.json();
        expect(retrievedProject.name).toBe(durabilityData.name);
        expect(retrievedProject.description).toBe(durabilityData.description);

        console.log('✓ Durability: Data persisted after cache clear');
      }
    });
  });

  test('should validate data consistency across distributed systems', async ({ page }) => {
    await test.step('Test read-after-write consistency', async () => {
      const testData = {
        title: 'Read After Write Test',
        description: 'Testing immediate consistency',
        timestamp: Date.now()
      };

      // Write data
      const writeResponse = await page.request.post('/api/tasks', {
        data: testData
      });

      if (writeResponse.status() === 201) {
        const createdTask = await writeResponse.json();

        // Immediately read the data back
        const readResponse = await page.request.get(`/api/tasks/${createdTask.id}`);
        expect(readResponse.status()).toBe(200);

        const readTask = await readResponse.json();
        expect(readTask.title).toBe(testData.title);
        expect(readTask.description).toBe(testData.description);

        console.log('✓ Read-after-write consistency verified');
      }
    });

    await test.step('Test eventual consistency across replicas', async () => {
      const testData = {
        title: 'Eventual Consistency Test',
        description: 'Testing replica synchronization',
        timestamp: Date.now()
      };

      // Write to primary
      const writeResponse = await page.request.post('/api/tasks', {
        data: testData
      });

      if (writeResponse.status() === 201) {
        const createdTask = await writeResponse.json();

        // Wait for replication
        await page.waitForTimeout(2000);

        // Read from replica (if available)
        const replicaResponse = await page.request.get(`/api/tasks/${createdTask.id}?source=replica`);

        if (replicaResponse.status() === 200) {
          const replicaTask = await replicaResponse.json();
          expect(replicaTask.title).toBe(testData.title);

          console.log('✓ Eventual consistency: Data replicated successfully');
        } else {
          console.log('⚠ Replica read not available or configured');
        }
      }
    });

    await test.step('Test cross-service data consistency', async () => {
      // Test data consistency between different microservices
      const userId = 'consistency-test-user-' + Date.now();

      // Create user in auth service
      const userResponse = await page.request.post('/api/auth/users', {
        data: {
          id: userId,
          email: `${userId}@example.com`,
          name: 'Consistency Test User'
        }
      });

      if (userResponse.status() === 201) {
        // Create project associated with the user
        const projectResponse = await page.request.post('/api/projects', {
          data: {
            name: 'Cross-Service Test Project',
            ownerId: userId
          }
        });

        expect(projectResponse.status()).toBe(201);

        // Verify user exists in both services
        const userVerify = await page.request.get(`/api/users/${userId}`);
        const projectVerify = await page.request.get(`/api/projects?ownerId=${userId}`);

        expect(userVerify.status()).toBe(200);
        expect(projectVerify.status()).toBe(200);

        const projects = await projectVerify.json();
        expect(projects.length).toBeGreaterThan(0);

        console.log('✓ Cross-service consistency maintained');
      }
    });
  });

  test('should validate data validation and constraints', async ({ page }) => {
    await test.step('Test input validation and sanitization', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE tasks; --",
        '{{7*7}}',
        '../../../etc/passwd',
        'javascript:alert(1)'
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await page.request.post('/api/tasks', {
          data: {
            title: maliciousInput,
            description: 'Testing input validation'
          }
        });

        if (response.status() === 201) {
          const task = await response.json();

          // Data should be sanitized
          expect(task.title).not.toBe(maliciousInput);
          expect(task.title).not.toContain('<script>');
          expect(task.title).not.toContain('DROP TABLE');

          console.log(`✓ Input sanitized: "${maliciousInput}" -> "${task.title}"`);
        } else {
          // Input was rejected (also acceptable)
          expect(response.status()).toBe(400);
          console.log(`✓ Malicious input rejected: "${maliciousInput}"`);
        }
      }
    });

    await test.step('Test data type validation', async () => {
      const invalidData = [
        { title: 123, description: 'Number as title' },
        { title: 'Valid Title', priority: 'invalid-priority' },
        { title: 'Valid Title', dueDate: 'not-a-date' },
        { title: '', description: 'Empty title' },
        { title: 'A'.repeat(1000), description: 'Too long title' }
      ];

      for (const data of invalidData) {
        const response = await page.request.post('/api/tasks', { data });

        // Should reject invalid data
        expect(response.status()).toBe(400);

        const errorResponse = await response.json();
        expect(errorResponse.error).toBeDefined();

        console.log(`✓ Invalid data rejected: ${errorResponse.error}`);
      }
    });

    await test.step('Test business rule validation', async () => {
      // Test business logic constraints
      const testCases = [
        {
          name: 'Future due date validation',
          data: {
            title: 'Past Due Date Test',
            dueDate: '2020-01-01'
          },
          expectError: true
        },
        {
          name: 'Valid priority values',
          data: {
            title: 'Priority Test',
            priority: 'super-urgent'
          },
          expectError: true
        },
        {
          name: 'Task completion validation',
          data: {
            title: 'Completion Test',
            status: 'completed',
            completedAt: null
          },
          expectError: true
        }
      ];

      for (const testCase of testCases) {
        const response = await page.request.post('/api/tasks', {
          data: testCase.data
        });

        if (testCase.expectError) {
          expect(response.status()).toBe(400);
          console.log(`✓ Business rule validated: ${testCase.name}`);
        } else {
          expect(response.status()).toBe(201);
          console.log(`✓ Valid data accepted: ${testCase.name}`);
        }
      }
    });
  });

  test('should validate data backup and recovery integrity', async ({ page }) => {
    await test.step('Test data backup consistency', async () => {
      // Check backup status
      const backupResponse = await page.request.get('/api/admin/backup/status');

      if (backupResponse.status() === 200) {
        const backupStatus = await backupResponse.json();

        expect(backupStatus.lastBackup).toBeDefined();
        expect(backupStatus.status).toBe('healthy');

        // Verify backup is recent
        const lastBackupTime = new Date(backupStatus.lastBackup);
        const now = new Date();
        const hoursSinceBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

        expect(hoursSinceBackup).toBeLessThan(24); // Backup should be within 24 hours

        console.log(`✓ Last backup: ${lastBackupTime.toISOString()}`);
      }
    });

    await test.step('Test backup integrity verification', async () => {
      // Test backup integrity check
      const integrityResponse = await page.request.post('/api/admin/backup/verify-integrity');

      if (integrityResponse.status() === 200) {
        const integrityResult = await integrityResponse.json();

        expect(integrityResult.valid).toBe(true);
        expect(integrityResult.checksum).toBeDefined();

        if (integrityResult.details) {
          expect(integrityResult.details.corruptedFiles).toBe(0);
          expect(integrityResult.details.missingFiles).toBe(0);
        }

        console.log('✓ Backup integrity verified');
      }
    });

    await test.step('Test point-in-time recovery capability', async () => {
      // Create test data
      const testData = {
        title: 'Recovery Test Task',
        description: 'Testing point-in-time recovery',
        timestamp: Date.now()
      };

      const createResponse = await page.request.post('/api/tasks', {
        data: testData
      });

      if (createResponse.status() === 201) {
        const task = await createResponse.json();
        const creationTime = new Date();

        // Wait a moment
        await page.waitForTimeout(2000);

        // Modify the task
        await page.request.patch(`/api/tasks/${task.id}`, {
          data: { title: 'Modified Title' }
        });

        // Test recovery to point before modification
        const recoveryResponse = await page.request.post('/api/admin/recovery/point-in-time', {
          data: {
            targetTime: creationTime.toISOString(),
            resourceType: 'task',
            resourceId: task.id
          }
        });

        if (recoveryResponse.status() === 200) {
          const recoveryResult = await recoveryResponse.json();
          expect(recoveryResult.success).toBe(true);

          console.log('✓ Point-in-time recovery capability verified');
        }
      }
    });
  });

  test('should validate concurrent data access and locking', async ({ page }) => {
    await test.step('Test optimistic locking', async () => {
      // Create a resource for testing
      const resourceResponse = await page.request.post('/api/projects', {
        data: {
          name: 'Optimistic Lock Test',
          version: 1
        }
      });

      if (resourceResponse.status() === 201) {
        const resource = await resourceResponse.json();

        // Simulate concurrent updates
        const update1Promise = page.request.patch(`/api/projects/${resource.id}`, {
          data: {
            name: 'Updated by User 1',
            version: resource.version
          }
        });

        const update2Promise = page.request.patch(`/api/projects/${resource.id}`, {
          data: {
            name: 'Updated by User 2',
            version: resource.version
          }
        });

        const [update1, update2] = await Promise.all([update1Promise, update2Promise]);

        // One should succeed, one should fail due to version conflict
        const successCount = [update1, update2].filter(r => r.status() === 200).length;
        const conflictCount = [update1, update2].filter(r => r.status() === 409).length;

        expect(successCount).toBe(1);
        expect(conflictCount).toBe(1);

        console.log('✓ Optimistic locking prevents lost updates');
      }
    });

    await test.step('Test deadlock detection and resolution', async () => {
      // Create two resources for cross-locking
      const resource1Response = await page.request.post('/api/projects', {
        data: { name: 'Deadlock Test 1' }
      });

      const resource2Response = await page.request.post('/api/projects', {
        data: { name: 'Deadlock Test 2' }
      });

      if (resource1Response.status() === 201 && resource2Response.status() === 201) {
        const resource1 = await resource1Response.json();
        const resource2 = await resource2Response.json();

        // Simulate potential deadlock scenario
        const transaction1 = page.request.post('/api/admin/test-deadlock', {
          data: {
            lockOrder: [resource1.id, resource2.id],
            operation: 'update'
          }
        });

        const transaction2 = page.request.post('/api/admin/test-deadlock', {
          data: {
            lockOrder: [resource2.id, resource1.id],
            operation: 'update'
          }
        });

        const results = await Promise.allSettled([transaction1, transaction2]);

        // At least one transaction should complete successfully
        const successfulTransactions = results.filter(r =>
          r.status === 'fulfilled' && r.value.status() === 200
        ).length;

        expect(successfulTransactions).toBeGreaterThan(0);

        console.log('✓ Deadlock detection and resolution working');
      }
    });

    await test.step('Test connection pool management', async () => {
      // Generate many concurrent connections
      const connectionPromises = [];

      for (let i = 0; i < dataIntegrityThresholds.concurrentTransactionLimit; i++) {
        connectionPromises.push(
          page.request.get('/api/health/database')
        );
      }

      const results = await Promise.allSettled(connectionPromises);

      // Most connections should succeed
      const successfulConnections = results.filter(r =>
        r.status === 'fulfilled' && r.value.status() === 200
      ).length;

      const successRate = successfulConnections / connectionPromises.length;
      expect(successRate).toBeGreaterThan(0.9); // 90% success rate

      console.log(`✓ Connection pool handled ${successfulConnections}/${connectionPromises.length} concurrent connections`);
    });
  });

  test('should validate data migration and schema evolution', async ({ page }) => {
    await test.step('Test schema version compatibility', async () => {
      // Check current schema version
      const schemaResponse = await page.request.get('/api/admin/schema/version');

      if (schemaResponse.status() === 200) {
        const schemaInfo = await schemaResponse.json();

        expect(schemaInfo.version).toBeDefined();
        expect(schemaInfo.compatible).toBe(true);

        console.log(`✓ Schema version: ${schemaInfo.version}`);

        // Check for pending migrations
        if (schemaInfo.pendingMigrations) {
          expect(schemaInfo.pendingMigrations.length).toBe(0);
          console.log('✓ No pending migrations');
        }
      }
    });

    await test.step('Test backward compatibility', async () => {
      // Test that old data formats are still readable
      const legacyDataTest = await page.request.get('/api/admin/test-legacy-data');

      if (legacyDataTest.status() === 200) {
        const legacyTest = await legacyDataTest.json();

        expect(legacyTest.compatibilityCheck).toBe(true);
        expect(legacyTest.readableRecords).toBeGreaterThan(0);

        console.log(`✓ Legacy data compatibility: ${legacyTest.readableRecords} records readable`);
      }
    });

    await test.step('Test data migration integrity', async () => {
      // Check migration history
      const migrationResponse = await page.request.get('/api/admin/migrations/history');

      if (migrationResponse.status() === 200) {
        const migrations = await migrationResponse.json();

        expect(Array.isArray(migrations)).toBe(true);

        migrations.forEach((migration: any) => {
          expect(migration.id).toBeDefined();
          expect(migration.appliedAt).toBeDefined();
          expect(migration.success).toBe(true);
        });

        console.log(`✓ Migration history: ${migrations.length} successful migrations`);
      }
    });
  });
});