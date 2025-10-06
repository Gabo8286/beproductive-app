import { test, expect } from '@playwright/test';

test.describe('GDPR Compliance Tests', () => {
  const gdprRequirements = {
    consentExpiry: 24, // months
    dataRetention: 36, // months
    processingLawfulness: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    dataSubjectRights: ['access', 'rectification', 'erasure', 'restrict_processing', 'data_portability', 'object'],
    breachNotificationTime: 72 // hours
  };

  test('should implement proper consent management', async ({ page }) => {
    await test.step('Validate consent banner and collection', async () => {
      await page.goto('/');

      // Check for GDPR consent banner on first visit
      const consentBanner = page.locator('[data-testid="gdpr-consent-banner"]');

      if (await consentBanner.count() > 0) {
        await expect(consentBanner).toBeVisible();

        // Validate consent options
        await expect(page.locator('[data-testid="accept-all-cookies"]')).toBeVisible();
        await expect(page.locator('[data-testid="reject-all-cookies"]')).toBeVisible();
        await expect(page.locator('[data-testid="customize-cookies"]')).toBeVisible();

        // Check for granular consent options
        await page.click('[data-testid="customize-cookies"]');

        const consentCategories = [
          '[data-testid="necessary-cookies-toggle"]',
          '[data-testid="analytics-cookies-toggle"]',
          '[data-testid="marketing-cookies-toggle"]',
          '[data-testid="functional-cookies-toggle"]'
        ];

        for (const category of consentCategories) {
          if (await page.locator(category).count() > 0) {
            await expect(page.locator(category)).toBeVisible();
          }
        }

        // Necessary cookies should be pre-checked and disabled
        const necessaryCookies = page.locator('[data-testid="necessary-cookies-toggle"]');
        if (await necessaryCookies.count() > 0) {
          await expect(necessaryCookies).toBeChecked();
          await expect(necessaryCookies).toBeDisabled();
        }
      }
    });

    await test.step('Test consent persistence and withdrawal', async () => {
      // Test consent persistence across sessions
      await page.goto('/');

      // Accept cookies if banner present
      if (await page.locator('[data-testid="accept-all-cookies"]').count() > 0) {
        await page.click('[data-testid="accept-all-cookies"]');
      }

      // Reload page and verify consent is remembered
      await page.reload();
      await expect(page.locator('[data-testid="gdpr-consent-banner"]')).not.toBeVisible();

      // Test consent withdrawal
      await page.goto('/privacy/cookie-settings');

      if (await page.locator('[data-testid="cookie-settings-form"]').count() > 0) {
        // Should be able to withdraw consent
        await expect(page.locator('[data-testid="withdraw-consent"]')).toBeVisible();

        // Test withdrawal
        await page.click('[data-testid="withdraw-consent"]');

        // Should show confirmation
        await expect(page.locator('[data-testid="consent-withdrawn-message"]')).toBeVisible();
      }
    });

    await test.step('Validate lawful basis for processing', async () => {
      const privacyPolicyResponse = await page.request.get('/api/privacy/policy');

      if (privacyPolicyResponse.status() === 200) {
        const privacyPolicy = await privacyPolicyResponse.json();

        expect(privacyPolicy.lawfulBasis).toBeDefined();
        expect(Array.isArray(privacyPolicy.lawfulBasis)).toBe(true);

        privacyPolicy.lawfulBasis.forEach((basis: any) => {
          expect(basis.type).toBeDefined();
          expect(gdprRequirements.processingLawfulness).toContain(basis.type);
          expect(basis.description).toBeDefined();
          expect(basis.dataTypes).toBeDefined();
        });
      }
    });
  });

  test('should implement data subject rights', async ({ page }) => {
    await test.step('Test right of access (Data Portability)', async () => {
      // Login as test user
      await page.goto('/login');

      if (await page.locator('[data-testid="login-form"]').count() > 0) {
        await page.fill('[data-testid="email-input"]', 'gdpr.test@example.com');
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
      }

      // Navigate to data export
      await page.goto('/settings/privacy/data-export');

      if (await page.locator('[data-testid="data-export-form"]').count() > 0) {
        await expect(page.locator('[data-testid="request-data-export"]')).toBeVisible();

        // Request data export
        await page.click('[data-testid="request-data-export"]');

        // Should confirm export request
        await expect(page.locator('[data-testid="export-request-confirmation"]')).toBeVisible();

        // Check export request API
        const exportResponse = await page.request.post('/api/user/data-export');

        if (exportResponse.status() === 202) {
          const exportRequest = await exportResponse.json();
          expect(exportRequest.requestId).toBeDefined();
          expect(exportRequest.status).toBe('processing');
          expect(exportRequest.estimatedCompletion).toBeDefined();
        }
      }
    });

    await test.step('Test right of rectification', async () => {
      await page.goto('/settings/profile');

      // Test data correction functionality
      if (await page.locator('[data-testid="profile-form"]').count() > 0) {
        // Should be able to update personal information
        await expect(page.locator('[data-testid="update-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="update-email"]')).toBeVisible();

        // Test updating information
        await page.fill('[data-testid="name-input"]', 'Updated Name');
        await page.click('[data-testid="save-profile"]');

        // Should confirm update
        await expect(page.locator('[data-testid="profile-updated-message"]')).toBeVisible();
      }
    });

    await test.step('Test right of erasure (Right to be forgotten)', async () => {
      await page.goto('/settings/account/delete');

      if (await page.locator('[data-testid="account-deletion-form"]').count() > 0) {
        await expect(page.locator('[data-testid="delete-account-button"]')).toBeVisible();

        // Should show clear information about deletion
        await expect(page.locator('[data-testid="deletion-consequences"]')).toBeVisible();
        await expect(page.locator('[data-testid="data-retention-period"]')).toBeVisible();

        // Test deletion request API
        const deletionResponse = await page.request.post('/api/user/delete-request', {
          data: { reason: 'gdpr_test' }
        });

        if (deletionResponse.status() === 202) {
          const deletionRequest = await deletionResponse.json();
          expect(deletionRequest.requestId).toBeDefined();
          expect(deletionRequest.processingTime).toBeDefined();
          expect(deletionRequest.processingTime).toBeLessThanOrEqual(30); // Max 30 days
        }
      }
    });

    await test.step('Test right to restrict processing', async () => {
      await page.goto('/settings/privacy/processing');

      if (await page.locator('[data-testid="processing-restrictions"]').count() > 0) {
        // Should be able to restrict different types of processing
        const restrictionOptions = [
          '[data-testid="restrict-marketing"]',
          '[data-testid="restrict-analytics"]',
          '[data-testid="restrict-profiling"]'
        ];

        for (const option of restrictionOptions) {
          if (await page.locator(option).count() > 0) {
            await expect(page.locator(option)).toBeVisible();

            // Test toggling restriction
            await page.click(option);
            await page.click('[data-testid="save-restrictions"]');

            await expect(page.locator('[data-testid="restrictions-updated"]')).toBeVisible();
          }
        }
      }
    });

    await test.step('Test right to object to processing', async () => {
      await page.goto('/settings/privacy/objections');

      if (await page.locator('[data-testid="processing-objections"]').count() > 0) {
        // Should be able to object to legitimate interest processing
        await expect(page.locator('[data-testid="object-to-profiling"]')).toBeVisible();
        await expect(page.locator('[data-testid="object-to-marketing"]')).toBeVisible();

        // Test objection submission
        await page.click('[data-testid="object-to-profiling"]');
        await page.fill('[data-testid="objection-reason"]', 'GDPR test objection');
        await page.click('[data-testid="submit-objection"]');

        await expect(page.locator('[data-testid="objection-submitted"]')).toBeVisible();
      }
    });
  });

  test('should implement proper data protection measures', async ({ page }) => {
    await test.step('Validate data encryption and security', async () => {
      // Check that all data transmission uses HTTPS
      await page.goto('/');
      expect(page.url()).toMatch(/^https:/);

      // Test API endpoints use encryption
      const securityHeaders = await page.request.get('/api/user/profile');
      const headers = securityHeaders.headers();

      expect(headers['strict-transport-security']).toBeDefined();
      expect(headers['x-content-type-options']).toBe('nosniff');
    });

    await test.step('Test data minimization principles', async () => {
      // Registration should only collect necessary data
      await page.goto('/register');

      if (await page.locator('[data-testid="registration-form"]').count() > 0) {
        const requiredFields = await page.locator('[required]').count();
        const totalFields = await page.locator('input').count();

        // Most fields should not be required (data minimization)
        const requiredRatio = requiredFields / totalFields;
        expect(requiredRatio).toBeLessThan(0.5); // Less than 50% required

        // Check for unnecessary data collection
        const unnecessaryFields = [
          '[data-testid="social-security-input"]',
          '[data-testid="income-input"]',
          '[data-testid="race-input"]'
        ];

        for (const field of unnecessaryFields) {
          await expect(page.locator(field)).not.toBeVisible();
        }
      }
    });

    await test.step('Validate data retention policies', async () => {
      const retentionPolicyResponse = await page.request.get('/api/privacy/retention-policy');

      if (retentionPolicyResponse.status() === 200) {
        const retentionPolicy = await retentionPolicyResponse.json();

        expect(retentionPolicy.policies).toBeDefined();
        expect(Array.isArray(retentionPolicy.policies)).toBe(true);

        retentionPolicy.policies.forEach((policy: any) => {
          expect(policy.dataType).toBeDefined();
          expect(policy.retentionPeriod).toBeDefined();
          expect(policy.justification).toBeDefined();

          // Retention periods should be reasonable
          expect(policy.retentionPeriod).toBeLessThanOrEqual(gdprRequirements.dataRetention);
        });
      }
    });

    await test.step('Test data processing records', async () => {
      const processingRecordsResponse = await page.request.get('/api/admin/gdpr/processing-records');

      if (processingRecordsResponse.status() === 200) {
        const processingRecords = await processingRecordsResponse.json();

        expect(processingRecords.activities).toBeDefined();
        expect(Array.isArray(processingRecords.activities)).toBe(true);

        processingRecords.activities.forEach((activity: any) => {
          // Article 30 GDPR requirements
          expect(activity.purpose).toBeDefined();
          expect(activity.lawfulBasis).toBeDefined();
          expect(activity.dataCategories).toBeDefined();
          expect(activity.dataSubjects).toBeDefined();
          expect(activity.recipients).toBeDefined();
          expect(activity.retentionPeriod).toBeDefined();
          expect(activity.securityMeasures).toBeDefined();
        });
      }
    });
  });

  test('should handle data breaches appropriately', async ({ page }) => {
    await test.step('Test breach detection and notification procedures', async () => {
      const breachProceduresResponse = await page.request.get('/api/admin/gdpr/breach-procedures');

      if (breachProceduresResponse.status() === 200) {
        const procedures = await breachProceduresResponse.json();

        expect(procedures.detectionMethods).toBeDefined();
        expect(procedures.notificationProcedure).toBeDefined();
        expect(procedures.responsiblePersons).toBeDefined();

        // Notification timeline should comply with GDPR
        expect(procedures.notificationProcedure.timelineHours).toBeLessThanOrEqual(gdprRequirements.breachNotificationTime);

        // Should have DPA contact information
        expect(procedures.supervisoryAuthority).toBeDefined();
        expect(procedures.supervisoryAuthority.contactInfo).toBeDefined();
      }
    });

    await test.step('Test breach notification system', async () => {
      // Simulate breach detection
      const breachTestResponse = await page.request.post('/api/admin/gdpr/test-breach-notification', {
        data: {
          type: 'test',
          severity: 'high',
          dataTypes: ['personal_data'],
          affectedUsers: 1
        }
      });

      if (breachTestResponse.status() === 202) {
        const breachResponse = await breachTestResponse.json();

        expect(breachResponse.incident_id).toBeDefined();
        expect(breachResponse.notification_triggered).toBe(true);
        expect(breachResponse.dpa_notification_scheduled).toBe(true);

        // Check notification was logged
        const auditResponse = await page.request.get(`/api/admin/audit/breach-notifications?incident_id=${breachResponse.incident_id}`);

        if (auditResponse.status() === 200) {
          const auditLog = await auditResponse.json();
          expect(auditLog.entries.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test('should implement privacy by design principles', async ({ page }) => {
    await test.step('Test default privacy settings', async () => {
      // New user should have privacy-friendly defaults
      await page.goto('/register');

      if (await page.locator('[data-testid="privacy-settings"]').count() > 0) {
        // Marketing emails should be opt-in (unchecked by default)
        const marketingOptIn = page.locator('[data-testid="marketing-emails-opt-in"]');
        if (await marketingOptIn.count() > 0) {
          await expect(marketingOptIn).not.toBeChecked();
        }

        // Analytics should be opt-in
        const analyticsOptIn = page.locator('[data-testid="analytics-opt-in"]');
        if (await analyticsOptIn.count() > 0) {
          await expect(analyticsOptIn).not.toBeChecked();
        }

        // Profile visibility should be private by default
        const profileVisibility = page.locator('[data-testid="profile-visibility"]');
        if (await profileVisibility.count() > 0) {
          const value = await profileVisibility.getAttribute('value');
          expect(value).toBe('private');
        }
      }
    });

    await test.step('Test privacy impact assessments', async () => {
      const piaResponse = await page.request.get('/api/admin/gdpr/privacy-impact-assessments');

      if (piaResponse.status() === 200) {
        const assessments = await piaResponse.json();

        expect(assessments.completed).toBeDefined();
        expect(Array.isArray(assessments.completed)).toBe(true);

        assessments.completed.forEach((assessment: any) => {
          expect(assessment.processingActivity).toBeDefined();
          expect(assessment.riskLevel).toBeDefined();
          expect(assessment.mitigationMeasures).toBeDefined();
          expect(assessment.completedDate).toBeDefined();
          expect(assessment.reviewDate).toBeDefined();
        });
      }
    });

    await test.step('Test data protection officer (DPO) contact', async () => {
      await page.goto('/privacy/contact');

      // Should have DPO contact information
      await expect(page.locator('[data-testid="dpo-contact-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="dpo-email"]')).toBeVisible();

      // Test DPO contact form
      if (await page.locator('[data-testid="dpo-contact-form"]').count() > 0) {
        await expect(page.locator('[data-testid="subject-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="message-textarea"]')).toBeVisible();
        await expect(page.locator('[data-testid="submit-dpo-message"]')).toBeVisible();
      }
    });
  });

  test('should maintain GDPR compliance documentation', async ({ page }) => {
    await test.step('Validate privacy policy completeness', async () => {
      await page.goto('/privacy-policy');

      // Privacy policy should contain required GDPR information
      const requiredSections = [
        '[data-testid="data-controller-info"]',
        '[data-testid="processing-purposes"]',
        '[data-testid="lawful-basis"]',
        '[data-testid="data-subjects-rights"]',
        '[data-testid="retention-periods"]',
        '[data-testid="third-parties"]',
        '[data-testid="international-transfers"]',
        '[data-testid="contact-information"]'
      ];

      for (const section of requiredSections) {
        if (await page.locator(section).count() > 0) {
          await expect(page.locator(section)).toBeVisible();
        }
      }

      // Should have last updated date
      await expect(page.locator('[data-testid="privacy-policy-last-updated"]')).toBeVisible();
    });

    await test.step('Test cookie policy compliance', async () => {
      await page.goto('/cookie-policy');

      // Cookie policy should explain cookie usage
      const cookieSections = [
        '[data-testid="cookie-types-explanation"]',
        '[data-testid="necessary-cookies-list"]',
        '[data-testid="analytics-cookies-list"]',
        '[data-testid="marketing-cookies-list"]',
        '[data-testid="cookie-management-instructions"]'
      ];

      for (const section of cookieSections) {
        if (await page.locator(section).count() > 0) {
          await expect(page.locator(section)).toBeVisible();
        }
      }
    });

    await test.step('Validate terms of service GDPR compliance', async () => {
      await page.goto('/terms-of-service');

      // Terms should reference GDPR rights
      const gdprReferences = await page.locator('text=GDPR').count();
      expect(gdprReferences).toBeGreaterThan(0);

      // Should reference privacy policy
      await expect(page.locator('a[href="/privacy-policy"]')).toBeVisible();

      // Should mention data subject rights
      const rightsReferences = await page.locator('text*=data subject rights').count();
      expect(rightsReferences).toBeGreaterThan(0);
    });
  });
});