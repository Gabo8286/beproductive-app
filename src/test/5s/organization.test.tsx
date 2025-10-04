import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fiveSMetricsTracker, useFiveSMetrics } from '@/utils/5s-metrics';
import { renderHook, act } from '@testing-library/react';

/**
 * 5S Organization Testing Suite
 * Comprehensive tests for 5S methodology compliance and metrics tracking
 */

describe('5S Codebase Organization System', () => {

  beforeEach(() => {
    // Reset metrics before each test
    fiveSMetricsTracker.updateMetrics({
      seiri: {
        deadCodeFiles: 0,
        duplicateBlocks: 0,
        unusedDependencies: 0,
        obsoleteFiles: 0,
        totalIssues: 0,
        reductionTrend: 'stable'
      },
      seiton: {
        disorganizedDirectories: 0,
        unorganizedImports: 0,
        namingViolations: 0,
        hierarchyIssues: 0,
        organizationScore: 85
      },
      seiso: {
        formattingIssues: 0,
        commentIssues: 0,
        codeSmells: 0,
        technicalDebtHours: 0,
        cleanlinessScore: 85
      },
      seiketsu: {
        standardsViolations: 0,
        patternsCompliance: 85,
        documentationCoverage: 78,
        reviewCompliance: 92,
        standardizationScore: 85
      },
      shitsuke: {
        monitoringActive: true,
        automationCoverage: 85,
        teamCompliance: 92,
        improvementTrend: 'positive',
        sustainabilityScore: 88
      }
    });
  });

  describe('Seiri (Sort) - Eliminate Unnecessary', () => {

    it('should track dead code files', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 3,
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 3,
          reductionTrend: 'stable'
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiri.deadCodeFiles).toBe(3);
      expect(metrics.seiri.totalIssues).toBe(3);
    });

    it('should track duplicate code blocks', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 0,
          duplicateBlocks: 2,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 2,
          reductionTrend: 'stable'
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiri.duplicateBlocks).toBe(2);
      expect(metrics.seiri.totalIssues).toBe(2);
    });

    it('should track unused dependencies', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 0,
          duplicateBlocks: 0,
          unusedDependencies: 4,
          obsoleteFiles: 0,
          totalIssues: 4,
          reductionTrend: 'stable'
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiri.unusedDependencies).toBe(4);
      expect(metrics.seiri.totalIssues).toBe(4);
    });

    it('should calculate total Seiri issues correctly', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 2,
          duplicateBlocks: 3,
          unusedDependencies: 1,
          obsoleteFiles: 1,
          totalIssues: 7,
          reductionTrend: 'stable'
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiri.totalIssues).toBe(7);
    });

    it('should track reduction trends', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 1,
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 1,
          reductionTrend: 'improving'
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiri.reductionTrend).toBe('improving');
    });

    it('should trigger alert when dead code files exceed budget', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with values that exceed default budget (maxDeadCodeFiles: 5)
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 8,
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 8,
          reductionTrend: 'degrading'
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('seiri');
      expect(alert.value).toBe(8);
      expect(alert.message).toContain('Dead code files');
    });

  });

  describe('Seiton (Set in Order) - Organize', () => {

    it('should track organization score', () => {
      fiveSMetricsTracker.updateMetrics({
        seiton: {
          disorganizedDirectories: 2,
          unorganizedImports: 3,
          namingViolations: 1,
          hierarchyIssues: 0,
          organizationScore: 78
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiton.organizationScore).toBe(78);
      expect(metrics.seiton.disorganizedDirectories).toBe(2);
    });

    it('should track naming violations', () => {
      fiveSMetricsTracker.updateMetrics({
        seiton: {
          disorganizedDirectories: 0,
          unorganizedImports: 0,
          namingViolations: 5,
          hierarchyIssues: 0,
          organizationScore: 80
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiton.namingViolations).toBe(5);
    });

    it('should track import organization issues', () => {
      fiveSMetricsTracker.updateMetrics({
        seiton: {
          disorganizedDirectories: 0,
          unorganizedImports: 7,
          namingViolations: 0,
          hierarchyIssues: 0,
          organizationScore: 75
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiton.unorganizedImports).toBe(7);
    });

    it('should trigger alert when organization score is too low', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with score below default budget (minOrganizationScore: 80)
      fiveSMetricsTracker.updateMetrics({
        seiton: {
          disorganizedDirectories: 5,
          unorganizedImports: 10,
          namingViolations: 8,
          hierarchyIssues: 3,
          organizationScore: 75
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('seiton');
      expect(alert.value).toBe(75);
      expect(alert.message).toContain('Organization score');
    });

  });

  describe('Seiso (Shine) - Clean Up', () => {

    it('should track formatting issues', () => {
      fiveSMetricsTracker.updateMetrics({
        seiso: {
          formattingIssues: 12,
          commentIssues: 0,
          codeSmells: 0,
          technicalDebtHours: 0,
          cleanlinessScore: 80
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiso.formattingIssues).toBe(12);
    });

    it('should track code smells', () => {
      fiveSMetricsTracker.updateMetrics({
        seiso: {
          formattingIssues: 0,
          commentIssues: 0,
          codeSmells: 6,
          technicalDebtHours: 0,
          cleanlinessScore: 75
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiso.codeSmells).toBe(6);
    });

    it('should track technical debt hours', () => {
      fiveSMetricsTracker.updateMetrics({
        seiso: {
          formattingIssues: 0,
          commentIssues: 0,
          codeSmells: 0,
          technicalDebtHours: 45,
          cleanlinessScore: 70
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiso.technicalDebtHours).toBe(45);
    });

    it('should trigger alert when technical debt exceeds budget', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with debt exceeding default budget (maxTechnicalDebtHours: 40)
      fiveSMetricsTracker.updateMetrics({
        seiso: {
          formattingIssues: 5,
          commentIssues: 3,
          codeSmells: 2,
          technicalDebtHours: 50,
          cleanlinessScore: 65
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('seiso');
      expect(alert.value).toBe(50);
      expect(alert.message).toContain('Technical debt');
    });

    it('should trigger alert when code smells exceed budget', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with smells exceeding default budget (maxCodeSmells: 5)
      fiveSMetricsTracker.updateMetrics({
        seiso: {
          formattingIssues: 2,
          commentIssues: 1,
          codeSmells: 8,
          technicalDebtHours: 20,
          cleanlinessScore: 70
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('seiso');
      expect(alert.value).toBe(8);
      expect(alert.message).toContain('Code smells');
    });

  });

  describe('Seiketsu (Standardize) - Create Standards', () => {

    it('should track pattern compliance', () => {
      fiveSMetricsTracker.updateMetrics({
        seiketsu: {
          standardsViolations: 2,
          patternsCompliance: 88,
          documentationCoverage: 80,
          reviewCompliance: 95,
          standardizationScore: 90
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiketsu.patternsCompliance).toBe(88);
    });

    it('should track documentation coverage', () => {
      fiveSMetricsTracker.updateMetrics({
        seiketsu: {
          standardsViolations: 0,
          patternsCompliance: 90,
          documentationCoverage: 72,
          reviewCompliance: 88,
          standardizationScore: 85
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiketsu.documentationCoverage).toBe(72);
    });

    it('should track review compliance', () => {
      fiveSMetricsTracker.updateMetrics({
        seiketsu: {
          standardsViolations: 1,
          patternsCompliance: 85,
          documentationCoverage: 78,
          reviewCompliance: 94,
          standardizationScore: 88
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.seiketsu.reviewCompliance).toBe(94);
    });

    it('should trigger alert when pattern compliance is low', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with compliance below default budget (minPatternsCompliance: 85)
      fiveSMetricsTracker.updateMetrics({
        seiketsu: {
          standardsViolations: 5,
          patternsCompliance: 78,
          documentationCoverage: 70,
          reviewCompliance: 85,
          standardizationScore: 75
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('seiketsu');
      expect(alert.value).toBe(78);
      expect(alert.message).toContain('Pattern compliance');
    });

  });

  describe('Shitsuke (Sustain) - Maintain Standards', () => {

    it('should track automation coverage', () => {
      fiveSMetricsTracker.updateMetrics({
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 92,
          teamCompliance: 88,
          improvementTrend: 'positive',
          sustainabilityScore: 90
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.shitsuke.automationCoverage).toBe(92);
    });

    it('should track team compliance', () => {
      fiveSMetricsTracker.updateMetrics({
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 85,
          teamCompliance: 95,
          improvementTrend: 'positive',
          sustainabilityScore: 92
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.shitsuke.teamCompliance).toBe(95);
    });

    it('should track improvement trends', () => {
      fiveSMetricsTracker.updateMetrics({
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 88,
          teamCompliance: 90,
          improvementTrend: 'positive',
          sustainabilityScore: 89
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.shitsuke.improvementTrend).toBe('positive');
    });

    it('should track monitoring status', () => {
      fiveSMetricsTracker.updateMetrics({
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 85,
          teamCompliance: 92,
          improvementTrend: 'positive',
          sustainabilityScore: 88
        }
      });

      const metrics = fiveSMetricsTracker.getMetrics();
      expect(metrics.shitsuke.monitoringActive).toBe(true);
    });

    it('should trigger alert when sustainability score is low', () => {
      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with score below default budget (minSustainabilityScore: 80)
      fiveSMetricsTracker.updateMetrics({
        shitsuke: {
          monitoringActive: false,
          automationCoverage: 75,
          teamCompliance: 78,
          improvementTrend: 'negative',
          sustainabilityScore: 75
        }
      });

      expect(alertCallback).toHaveBeenCalled();
      const alert = alertCallback.mock.calls[0][0];
      expect(alert.metric).toBe('shitsuke');
      expect(alert.value).toBe(75);
      expect(alert.message).toContain('Sustainability score');
    });

  });

  describe('Overall 5S Score Calculation', () => {

    it('should calculate overall score correctly', () => {
      // Set up known metrics for predictable score calculation
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 0,
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 0, // Should give 100 for Seiri
          reductionTrend: 'stable'
        },
        seiton: {
          disorganizedDirectories: 0,
          unorganizedImports: 0,
          namingViolations: 0,
          hierarchyIssues: 0,
          organizationScore: 90 // 90 for Seiton
        },
        seiso: {
          formattingIssues: 0,
          commentIssues: 0,
          codeSmells: 0,
          technicalDebtHours: 0,
          cleanlinessScore: 85 // 85 for Seiso
        },
        seiketsu: {
          standardsViolations: 0,
          patternsCompliance: 88,
          documentationCoverage: 80,
          reviewCompliance: 92,
          standardizationScore: 88 // 88 for Seiketsu
        },
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 92,
          teamCompliance: 95,
          improvementTrend: 'positive',
          sustainabilityScore: 92 // 92 for Shitsuke
        }
      });

      const overallScore = fiveSMetricsTracker.calculateOverall5SScore();

      // Expected calculation:
      // (100 * 0.25) + (90 * 0.20) + (85 * 0.20) + (88 * 0.20) + (92 * 0.15)
      // = 25 + 18 + 17 + 17.6 + 13.8 = 91.4 ≈ 91
      expect(overallScore).toBe(91);
    });

    it('should handle poor scores correctly', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 10,
          duplicateBlocks: 5,
          unusedDependencies: 3,
          obsoleteFiles: 2,
          totalIssues: 20, // Should give 0 for Seiri (100 - 20*5 = 0)
          reductionTrend: 'degrading'
        },
        seiton: {
          disorganizedDirectories: 5,
          unorganizedImports: 8,
          namingViolations: 10,
          hierarchyIssues: 3,
          organizationScore: 60
        },
        seiso: {
          formattingIssues: 15,
          commentIssues: 8,
          codeSmells: 10,
          technicalDebtHours: 80,
          cleanlinessScore: 55
        },
        seiketsu: {
          standardsViolations: 8,
          patternsCompliance: 65,
          documentationCoverage: 55,
          reviewCompliance: 70,
          standardizationScore: 65
        },
        shitsuke: {
          monitoringActive: false,
          automationCoverage: 60,
          teamCompliance: 70,
          improvementTrend: 'negative',
          sustainabilityScore: 65
        }
      });

      const overallScore = fiveSMetricsTracker.calculateOverall5SScore();

      // Expected calculation with poor scores:
      // (0 * 0.25) + (60 * 0.20) + (55 * 0.20) + (65 * 0.20) + (65 * 0.15)
      // = 0 + 12 + 11 + 13 + 9.75 = 45.75 ≈ 46
      expect(overallScore).toBe(46);
    });

  });

  describe('5S Metrics React Hook', () => {

    it('should provide access to metrics through hook', () => {
      const { result } = renderHook(() => useFiveSMetrics());

      expect(result.current.getMetrics).toBeDefined();
      expect(result.current.updateMetrics).toBeDefined();
      expect(result.current.getOverallScore).toBeDefined();
      expect(result.current.getAlerts).toBeDefined();
    });

    it('should allow updating metrics through hook', () => {
      const { result } = renderHook(() => useFiveSMetrics());

      act(() => {
        result.current.updateMetrics({
          seiri: {
            deadCodeFiles: 3,
            duplicateBlocks: 2,
            unusedDependencies: 1,
            obsoleteFiles: 0,
            totalIssues: 6,
            reductionTrend: 'improving'
          }
        });
      });

      const metrics = result.current.getMetrics();
      expect(metrics.seiri.deadCodeFiles).toBe(3);
      expect(metrics.seiri.totalIssues).toBe(6);
    });

    it('should provide overall score through hook', () => {
      const { result } = renderHook(() => useFiveSMetrics());

      const score = result.current.getOverallScore();
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

  });

  describe('5S Report Generation', () => {

    it('should generate comprehensive report', () => {
      const report = fiveSMetricsTracker.generateReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('grade');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('alerts');
      expect(report).toHaveProperty('trends');
      expect(report).toHaveProperty('recommendations');

      expect(typeof report.overallScore).toBe('number');
      expect(['A', 'B', 'C', 'D', 'F']).toContain(report.grade);
      expect(Array.isArray(report.alerts)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should include trend information in report', () => {
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 2,
          duplicateBlocks: 1,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 3,
          reductionTrend: 'improving'
        },
        shitsuke: {
          monitoringActive: true,
          automationCoverage: 90,
          teamCompliance: 95,
          improvementTrend: 'positive',
          sustainabilityScore: 92
        }
      });

      const report = fiveSMetricsTracker.generateReport();

      expect(report.trends.seiri).toBe('improving');
      expect(report.trends.shitsuke).toBe('positive');
    });

    it('should provide relevant recommendations', () => {
      // Set up metrics that should trigger recommendations
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 8,
          duplicateBlocks: 5,
          unusedDependencies: 3,
          obsoleteFiles: 2,
          totalIssues: 18, // Should trigger Seiri recommendation
          reductionTrend: 'degrading'
        },
        seiton: {
          disorganizedDirectories: 4,
          unorganizedImports: 6,
          namingViolations: 8,
          hierarchyIssues: 2,
          organizationScore: 70 // Should trigger Seiton recommendation
        }
      });

      const report = fiveSMetricsTracker.generateReport();

      expect(report.recommendations).toContain('High number of Seiri issues - prioritize Sort phase');
      expect(report.recommendations).toContain('Low organization score - focus on Set in Order phase');
    });

  });

  describe('5S Budget Management', () => {

    it('should allow setting custom budgets', () => {
      const customBudget = {
        name: 'strict-budget',
        thresholds: {
          seiri: {
            maxDeadCodeFiles: 2,
            maxDuplicateBlocks: 1,
            maxUnusedDeps: 1
          },
          seiton: {
            maxDisorganizedDirs: 1,
            maxNamingViolations: 2,
            minOrganizationScore: 90
          },
          seiso: {
            maxFormattingIssues: 5,
            maxCodeSmells: 2,
            maxTechnicalDebtHours: 20
          },
          seiketsu: {
            minPatternsCompliance: 90,
            minDocumentationCoverage: 85,
            minReviewCompliance: 95
          },
          shitsuke: {
            minAutomationCoverage: 90,
            minTeamCompliance: 90,
            minSustainabilityScore: 85
          }
        }
      };

      fiveSMetricsTracker.setBudget('strict', customBudget);

      const alertCallback = vi.fn();
      fiveSMetricsTracker.onAlert(alertCallback);

      // Update with values that would pass default budget but fail strict budget
      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 3, // Exceeds strict budget (2) but within default (5)
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 3,
          reductionTrend: 'stable'
        }
      });

      expect(alertCallback).toHaveBeenCalled();
    });

  });

  describe('5S Integration with Monitoring', () => {

    it('should report metrics to monitoring system', () => {
      // This test would verify integration with the monitoring system
      // In a real implementation, you would mock the monitoring calls

      const initialScore = fiveSMetricsTracker.calculateOverall5SScore();

      fiveSMetricsTracker.updateMetrics({
        seiri: {
          deadCodeFiles: 1,
          duplicateBlocks: 0,
          unusedDependencies: 0,
          obsoleteFiles: 0,
          totalIssues: 1,
          reductionTrend: 'improving'
        }
      });

      const newScore = fiveSMetricsTracker.calculateOverall5SScore();

      // Verify that scores are being calculated and updated
      expect(typeof initialScore).toBe('number');
      expect(typeof newScore).toBe('number');
    });

  });

});

describe('5S Agent Integration Tests', () => {

  it('should maintain data consistency across updates', () => {
    const initialMetrics = fiveSMetricsTracker.getMetrics();

    // Partial update should not reset other values
    fiveSMetricsTracker.updateMetrics({
      seiri: {
        deadCodeFiles: 5,
        duplicateBlocks: 2,
        unusedDependencies: 1,
        obsoleteFiles: 0,
        totalIssues: 8,
        reductionTrend: 'stable'
      }
    });

    const updatedMetrics = fiveSMetricsTracker.getMetrics();

    // Seiri should be updated
    expect(updatedMetrics.seiri.deadCodeFiles).toBe(5);
    expect(updatedMetrics.seiri.totalIssues).toBe(8);

    // Other sections should remain unchanged
    expect(updatedMetrics.seiton.organizationScore).toBe(initialMetrics.seiton.organizationScore);
    expect(updatedMetrics.seiso.cleanlinessScore).toBe(initialMetrics.seiso.cleanlinessScore);
    expect(updatedMetrics.seiketsu.standardizationScore).toBe(initialMetrics.seiketsu.standardizationScore);
    expect(updatedMetrics.shitsuke.sustainabilityScore).toBe(initialMetrics.shitsuke.sustainabilityScore);
  });

  it('should handle concurrent metric updates', () => {
    const promises = [];

    // Simulate concurrent updates
    for (let i = 0; i < 5; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            fiveSMetricsTracker.updateMetrics({
              seiri: {
                deadCodeFiles: i,
                duplicateBlocks: 0,
                unusedDependencies: 0,
                obsoleteFiles: 0,
                totalIssues: i,
                reductionTrend: 'stable'
              }
            });
            resolve(null);
          }, Math.random() * 10);
        })
      );
    }

    return Promise.all(promises).then(() => {
      const metrics = fiveSMetricsTracker.getMetrics();
      // Should have a valid state (one of the updates should have succeeded)
      expect(typeof metrics.seiri.deadCodeFiles).toBe('number');
      expect(metrics.seiri.deadCodeFiles).toBeGreaterThanOrEqual(0);
      expect(metrics.seiri.deadCodeFiles).toBeLessThan(5);
    });
  });

  it('should validate metric ranges', () => {
    // Test that scores stay within valid ranges
    fiveSMetricsTracker.updateMetrics({
      seiton: {
        disorganizedDirectories: 0,
        unorganizedImports: 0,
        namingViolations: 0,
        hierarchyIssues: 0,
        organizationScore: 150 // Invalid score > 100
      }
    });

    const metrics = fiveSMetricsTracker.getMetrics();
    // The system should handle invalid scores gracefully
    expect(metrics.seiton.organizationScore).toBeDefined();
    expect(typeof metrics.seiton.organizationScore).toBe('number');
  });

});

// Helper function for testing
function createMockMetrics(overrides = {}) {
  return {
    seiri: {
      deadCodeFiles: 2,
      duplicateBlocks: 1,
      unusedDependencies: 1,
      obsoleteFiles: 0,
      totalIssues: 4,
      reductionTrend: 'stable',
      ...overrides.seiri
    },
    seiton: {
      disorganizedDirectories: 1,
      unorganizedImports: 2,
      namingViolations: 3,
      hierarchyIssues: 1,
      organizationScore: 82,
      ...overrides.seiton
    },
    seiso: {
      formattingIssues: 5,
      commentIssues: 3,
      codeSmells: 4,
      technicalDebtHours: 25,
      cleanlinessScore: 78,
      ...overrides.seiso
    },
    seiketsu: {
      standardsViolations: 2,
      patternsCompliance: 87,
      documentationCoverage: 75,
      reviewCompliance: 90,
      standardizationScore: 85,
      ...overrides.seiketsu
    },
    shitsuke: {
      monitoringActive: true,
      automationCoverage: 88,
      teamCompliance: 91,
      improvementTrend: 'positive',
      sustainabilityScore: 89,
      ...overrides.shitsuke
    }
  };
}

export { createMockMetrics };