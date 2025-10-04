import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AISystemValidator } from './AISystemValidator';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// Mock the auth context
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User'
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn()
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock the AI system validator service
const mockValidationReport = {
  overall: {
    status: 'healthy',
    score: 85,
    timestamp: new Date().toISOString()
  },
  components: [
    {
      component: 'AI Service Manager',
      status: 'passed',
      score: 90,
      details: {
        functionality: true,
        performance: true,
        accuracy: true,
        reliability: true
      },
      errors: [],
      warnings: [],
      metrics: { responseTime: 250 },
      recommendations: []
    },
    {
      component: 'Smart Task Prioritizer',
      status: 'warning',
      score: 75,
      details: {
        functionality: true,
        performance: false,
        accuracy: true,
        reliability: true
      },
      errors: [],
      warnings: ['High response time'],
      metrics: { responseTime: 450 },
      recommendations: ['Optimize response time']
    }
  ],
  integration: {
    dataFlow: true,
    apiConnectivity: true,
    crossComponentCommunication: true,
    errorHandling: true
  },
  performance: {
    averageResponseTime: 335,
    successRate: 95,
    errorRate: 5,
    throughput: 120
  },
  recommendations: {
    immediate: ['Fix critical issues'],
    shortTerm: ['Optimize performance'],
    longTerm: ['Implement monitoring']
  },
  nextValidationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  services: {
    insightsGenerator: {
      status: 'healthy',
      score: 90,
      responseTime: 250,
      errorRate: 0.02,
      issues: [],
      lastCheck: new Date().toISOString()
    },
    taskPrioritizer: {
      status: 'warning',
      score: 75,
      responseTime: 450,
      errorRate: 0.05,
      issues: ['High response time'],
      lastCheck: new Date().toISOString()
    },
    goalTracker: {
      status: 'healthy',
      score: 92,
      responseTime: 180,
      errorRate: 0.01,
      issues: [],
      lastCheck: new Date().toISOString()
    },
    habitOptimizer: {
      status: 'healthy',
      score: 88,
      responseTime: 320,
      errorRate: 0.03,
      issues: [],
      lastCheck: new Date().toISOString()
    },
    timeBlocker: {
      status: 'error',
      score: 45,
      responseTime: 800,
      errorRate: 0.15,
      issues: ['Service unavailable', 'High error rate'],
      lastCheck: new Date().toISOString()
    },
    burnoutPredictor: {
      status: 'healthy',
      score: 85,
      responseTime: 400,
      errorRate: 0.04,
      issues: [],
      lastCheck: new Date().toISOString()
    },
    smartNotifications: {
      status: 'healthy',
      score: 80,
      responseTime: 150,
      errorRate: 0.02,
      issues: [],
      lastCheck: new Date().toISOString()
    }
  },
  performance: {
    averageResponseTime: 335,
    peakResponseTime: 800,
    throughput: 120,
    cpuUsage: 65,
    memoryUsage: 70,
    diskUsage: 45
  },
  security: {
    score: 95,
    vulnerabilities: [],
    dataEncryption: true,
    accessControls: true,
    auditLogs: true
  },
  compliance: {
    gdprCompliant: true,
    dataRetentionPolicies: true,
    privacyControls: true,
    consentManagement: true
  },
  recommendations: [
    {
      type: 'performance',
      priority: 'high',
      message: 'Optimize time blocking service response time',
      actionRequired: true
    },
    {
      type: 'monitoring',
      priority: 'medium',
      message: 'Set up alerts for service availability',
      actionRequired: false
    }
  ],
  timestamp: new Date().toISOString()
};

// Mock the AI system validator service
vi.mock('@/services/ai/aiSystemValidator', () => ({
  aiSystemValidator: {
    validateCompleteSystem: vi.fn()
  },
  AISystemValidator: vi.fn(),
  ValidationResult: {},
  SystemValidationReport: {}
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date) => '2024-01-01 12:00:00')
}));

describe('AISystemValidator Component', () => {
  beforeEach(async () => {
    setDesktopViewport();
    vi.clearAllMocks();
    // Set up mock return values
    const { aiSystemValidator } = await import('@/services/ai/aiSystemValidator');
    vi.mocked(aiSystemValidator.validateCompleteSystem).mockResolvedValue(mockValidationReport);
  });

  afterEach(() => {
    setDesktopViewport();
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      render(<AISystemValidator />);
      expect(screen.getByText('AI System Validator')).toBeInTheDocument();
    });

    it('should render main sections', () => {
      render(<AISystemValidator />);

      // Check for main validation button
      expect(screen.getByRole('button', { name: /run validation/i })).toBeInTheDocument();

      // Check for tabs
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });

    it('should show initial state when no validation has run', () => {
      render(<AISystemValidator />);

      // Should show empty state or instructions
      expect(screen.getByText(/run validation to see results/i)).toBeInTheDocument();
    });
  });

  describe('Validation Process', () => {
    it('should run validation when button is clicked', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      expect(mockAISystemValidator.validateCompleteSystem).toHaveBeenCalledWith(mockUser.id);
    });

    it('should show loading state during validation', async () => {
      const user = userEvent.setup();

      // Mock delayed response
      mockAISystemValidator.validateCompleteSystem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockValidationReport), 100))
      );

      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      // Should show loading state
      expect(screen.getByText(/validating/i)).toBeInTheDocument();
      expect(runButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/score.*85/i)).toBeInTheDocument();
      });
    });

    it('should display validation results after completion', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        // Should show overall score
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText(/healthy/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const user = userEvent.setup();
      const mockToast = require('sonner').toast;

      mockAISystemValidator.validateCompleteSystem.mockRejectedValue(new Error('Validation failed'));

      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('System validation failed');
      });
    });
  });

  describe('Overview Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });
    });

    it('should display overall system health', () => {
      expect(screen.getByText('85')).toBeInTheDocument(); // Overall score
      expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    });

    it('should show system status indicators', () => {
      // Should show status badges or indicators
      const healthyStatuses = screen.getAllByText(/healthy/i);
      expect(healthyStatuses.length).toBeGreaterThan(0);

      const warningStatuses = screen.getAllByText(/warning/i);
      expect(warningStatuses.length).toBeGreaterThan(0);

      const errorStatuses = screen.getAllByText(/error/i);
      expect(errorStatuses.length).toBeGreaterThan(0);
    });

    it('should display system recommendations', () => {
      expect(screen.getByText(/optimize cache settings/i)).toBeInTheDocument();
      expect(screen.getByText(/update ai model version/i)).toBeInTheDocument();
    });

    it('should show last validation timestamp', () => {
      expect(screen.getByText(/last validation/i)).toBeInTheDocument();
      expect(screen.getByText('2024-01-01 12:00:00')).toBeInTheDocument();
    });
  });

  describe('Services Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      const servicesTab = screen.getByRole('tab', { name: /services/i });
      await user.click(servicesTab);
    });

    it('should display all AI services', () => {
      expect(screen.getByText(/insights generator/i)).toBeInTheDocument();
      expect(screen.getByText(/task prioritizer/i)).toBeInTheDocument();
      expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/habit optimizer/i)).toBeInTheDocument();
      expect(screen.getByText(/time blocker/i)).toBeInTheDocument();
      expect(screen.getByText(/burnout predictor/i)).toBeInTheDocument();
      expect(screen.getByText(/smart notifications/i)).toBeInTheDocument();
    });

    it('should show service health status', () => {
      // Should show different status badges for different services
      const healthyBadges = screen.getAllByText(/healthy/i);
      const warningBadges = screen.getAllByText(/warning/i);
      const errorBadges = screen.getAllByText(/error/i);

      expect(healthyBadges.length).toBeGreaterThan(0);
      expect(warningBadges.length).toBeGreaterThan(0);
      expect(errorBadges.length).toBeGreaterThan(0);
    });

    it('should display service metrics', () => {
      // Should show response times
      expect(screen.getByText('250ms')).toBeInTheDocument(); // Insights generator
      expect(screen.getByText('450ms')).toBeInTheDocument(); // Task prioritizer
      expect(screen.getByText('800ms')).toBeInTheDocument(); // Time blocker

      // Should show error rates
      expect(screen.getByText('2%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should show service issues', () => {
      expect(screen.getByText(/high response time/i)).toBeInTheDocument();
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/high error rate/i)).toBeInTheDocument();
    });
  });

  describe('Performance Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      const performanceTab = screen.getByRole('tab', { name: /performance/i });
      await user.click(performanceTab);
    });

    it('should display performance metrics', () => {
      expect(screen.getByText('335ms')).toBeInTheDocument(); // Average response time
      expect(screen.getByText('800ms')).toBeInTheDocument(); // Peak response time
      expect(screen.getByText('120')).toBeInTheDocument(); // Throughput
    });

    it('should show resource usage', () => {
      expect(screen.getByText('65%')).toBeInTheDocument(); // CPU usage
      expect(screen.getByText('70%')).toBeInTheDocument(); // Memory usage
      expect(screen.getByText('45%')).toBeInTheDocument(); // Disk usage
    });

    it('should display usage progress bars', () => {
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(3); // CPU, Memory, Disk
    });
  });

  describe('Security Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);
    });

    it('should display security score', () => {
      expect(screen.getByText('95')).toBeInTheDocument(); // Security score
    });

    it('should show security features status', () => {
      expect(screen.getByText(/data encryption/i)).toBeInTheDocument();
      expect(screen.getByText(/access controls/i)).toBeInTheDocument();
      expect(screen.getByText(/audit logs/i)).toBeInTheDocument();
    });

    it('should display compliance status', () => {
      expect(screen.getByText(/gdpr compliant/i)).toBeInTheDocument();
      expect(screen.getByText(/data retention policies/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy controls/i)).toBeInTheDocument();
      expect(screen.getByText(/consent management/i)).toBeInTheDocument();
    });

    it('should show security recommendations', () => {
      // Should display any security-related recommendations
      const recommendations = screen.getAllByText(/recommendation|optimize|improve/i);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendations', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });
    });

    it('should display system recommendations', () => {
      expect(screen.getByText(/optimize time blocking service response time/i)).toBeInTheDocument();
      expect(screen.getByText(/set up alerts for service availability/i)).toBeInTheDocument();
    });

    it('should show recommendation priorities', () => {
      // Should show high priority items prominently
      const highPriorityItems = screen.getAllByText(/high/i);
      const mediumPriorityItems = screen.getAllByText(/medium/i);

      expect(highPriorityItems.length).toBeGreaterThan(0);
      expect(mediumPriorityItems.length).toBeGreaterThan(0);
    });

    it('should indicate action required status', () => {
      // Should show which recommendations require immediate action
      const actionRequired = screen.getAllByText(/action required|urgent|critical/i);
      expect(actionRequired.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should allow refreshing validation', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      // Run initial validation
      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      // Run validation again
      await user.click(runButton);

      expect(mockAISystemValidator.validateCompleteSystem).toHaveBeenCalledTimes(2);
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      // Run validation first
      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      // Navigate through tabs
      const servicesTab = screen.getByRole('tab', { name: /services/i });
      await user.click(servicesTab);
      expect(servicesTab).toHaveAttribute('aria-selected', 'true');

      const performanceTab = screen.getByRole('tab', { name: /performance/i });
      await user.click(performanceTab);
      expect(performanceTab).toHaveAttribute('aria-selected', 'true');

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);
      expect(securityTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthenticated user', () => {
      const mockUnauthenticatedContext = {
        ...mockAuthContext,
        user: null
      };

      vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue(mockUnauthenticatedContext);

      render(<AISystemValidator />);

      // Should show authentication required message
      expect(screen.getByText(/sign in|authenticate|login/i)).toBeInTheDocument();
    });

    it('should handle validation service errors', async () => {
      const user = userEvent.setup();
      const mockToast = require('sonner').toast;

      mockAISystemValidator.validateCompleteSystem.mockRejectedValue(new Error('Service unavailable'));

      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('System validation failed');
      });

      // Button should be re-enabled
      expect(runButton).not.toBeDisabled();
    });

    it('should handle partial validation failures', async () => {
      const user = userEvent.setup();

      const partialReport = {
        ...mockValidationReport,
        services: {
          ...mockValidationReport.services,
          insightsGenerator: {
            status: 'error',
            score: 0,
            responseTime: 0,
            errorRate: 1,
            issues: ['Service unavailable'],
            lastCheck: new Date().toISOString()
          }
        }
      };

      mockAISystemValidator.validateCompleteSystem.mockResolvedValue(partialReport);

      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt layout for mobile', async () => {
      setMobileViewport();
      const user = userEvent.setup();
      render(<AISystemValidator />);

      // Run validation
      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      // Tabs should be rendered but may stack or scroll on mobile
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toBeInTheDocument();
    });

    it('should handle touch interactions', async () => {
      setMobileViewport();
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });

      // Simulate touch events
      fireEvent.touchStart(runButton);
      fireEvent.touchEnd(runButton);
      await user.click(runButton);

      expect(mockAISystemValidator.validateCompleteSystem).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AISystemValidator />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      // Should be able to tab to validation button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /run validation/i }));

      // Should be able to activate with keyboard
      await user.keyboard('{Enter}');
      expect(mockAISystemValidator.validateCompleteSystem).toHaveBeenCalled();
    });

    it('should have proper ARIA labels', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      // Run validation to show results
      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      // Tabs should have proper ARIA attributes
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
      });

      // Progress bars should have labels
      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(progressBar => {
        expect(progressBar).toHaveAttribute('aria-valuemin');
        expect(progressBar).toHaveAttribute('aria-valuemax');
      });
    });

    it('should announce validation status to screen readers', async () => {
      const user = userEvent.setup();
      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });
      await user.click(runButton);

      await waitFor(() => {
        // Important status should be in an accessible region
        const statusRegion = screen.getByText(/system health.*85/i) || screen.getByText('85');
        expect(statusRegion).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();

      render(<AISystemValidator />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
    });

    it('should handle large validation reports efficiently', async () => {
      const user = userEvent.setup();

      // Create a large report with many services
      const largeReport = {
        ...mockValidationReport,
        services: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [
            `service-${i}`,
            {
              status: 'healthy',
              score: 85,
              responseTime: 200,
              errorRate: 0.01,
              issues: [],
              lastCheck: new Date().toISOString()
            }
          ])
        )
      };

      mockAISystemValidator.validateCompleteSystem.mockResolvedValue(largeReport);

      render(<AISystemValidator />);

      const runButton = screen.getByRole('button', { name: /run validation/i });

      const startTime = performance.now();
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should handle large data efficiently
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(<AISystemValidator />);

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});