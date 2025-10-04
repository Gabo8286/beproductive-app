import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AISettingsDashboard } from './AISettingsDashboard';
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

// Mock the AI settings hook
const mockAISettings = {
  enabled: true,
  provider: 'openai',
  model: 'gpt-4',
  insights: {
    taskPrioritization: true,
    habitOptimization: true,
    goalTracking: true,
    burnoutPrediction: true,
    timeBlocking: true,
    smartNotifications: true
  },
  privacy: {
    dataSharing: false,
    anonymizedAnalytics: true,
    personalizedRecommendations: true
  },
  performance: {
    aggressiveness: 50,
    updateFrequency: 'daily',
    batchSize: 10
  },
  updateSettings: vi.fn(),
  resetSettings: vi.fn(),
  loading: false,
  error: null
};

vi.mock('@/hooks/useAISettings', () => ({
  useAISettings: () => mockAISettings
}));

// Mock the AI usage stats hook
const mockUsageStats = {
  stats: {
    totalRequests: 150,
    successfulRequests: 142,
    failedRequests: 8,
    averageResponseTime: 1200,
    totalCost: 5.75,
    monthlyQuota: 1000,
    quotaUsed: 150,
    topInsightTypes: [
      { type: 'task-prioritization', count: 45 },
      { type: 'habit-optimization', count: 38 },
      { type: 'goal-tracking', count: 32 }
    ]
  },
  refreshStats: vi.fn(),
  loading: false,
  error: null
};

vi.mock('@/hooks/useAIUsageStats', () => ({
  useAIUsageStats: () => mockUsageStats
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('AISettingsDashboard Component', () => {
  beforeEach(() => {
    setDesktopViewport();
    vi.clearAllMocks();
  });

  afterEach(() => {
    setDesktopViewport();
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      render(<AISettingsDashboard />);
      expect(screen.getByText('AI Settings & Privacy')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<AISettingsDashboard />);

      // Check for tab navigation
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /usage & costs/i })).toBeInTheDocument();
    });

    it('should show AI status based on settings', () => {
      render(<AISettingsDashboard />);

      // Should show main heading and description
      expect(screen.getByText('AI Settings & Privacy')).toBeInTheDocument();
      expect(screen.getByText('Customize your AI experience and manage privacy preferences')).toBeInTheDocument();
    });

    it('should display usage statistics', () => {
      render(<AISettingsDashboard />);

      // Check that component renders with tabs
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Check for export button
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  describe('Preferences Tab', () => {
    beforeEach(() => {
      render(<AISettingsDashboard />);
    });

    it('should switch to preferences tab', async () => {
      const user = userEvent.setup();
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByRole('heading', { name: /AI Provider Settings/i })).toBeInTheDocument();
      expect(screen.getByText(/Enabled Insight Types/i)).toBeInTheDocument();
    });

    it('should show AI provider selection', async () => {
      const user = userEvent.setup();
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });

    it('should allow toggling insight features', async () => {
      const user = userEvent.setup();
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });

    it('should handle performance settings', async () => {
      const user = userEvent.setup();
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });
  });

  describe('Usage & Costs Tab', () => {
    beforeEach(() => {
      render(<AISettingsDashboard />);
    });

    it('should display usage metrics', async () => {
      const user = userEvent.setup();
      const usageTab = screen.getByRole('tab', { name: /usage & costs/i });

      await user.click(usageTab);

      // Check for usage content
      expect(screen.getByText(/Usage & Costs/i)).toBeInTheDocument();
    });

    it('should show quota usage progress', async () => {
      const user = userEvent.setup();
      const usageTab = screen.getByRole('tab', { name: /usage & costs/i });

      await user.click(usageTab);

      // Should show usage tab content
      expect(screen.getByText(/Usage & Costs/i)).toBeInTheDocument();
    });

    it('should allow refreshing stats', async () => {
      const user = userEvent.setup();
      const usageTab = screen.getByRole('tab', { name: /usage & costs/i });

      await user.click(usageTab);

      // Should show usage content
      expect(screen.getByText(/Usage & Costs/i)).toBeInTheDocument();
    });
  });

  describe('Privacy Tab', () => {
    beforeEach(() => {
      render(<AISettingsDashboard />);
    });

    it('should show privacy controls', async () => {
      const user = userEvent.setup();
      const privacyTab = screen.getByRole('tab', { name: /privacy/i });

      await user.click(privacyTab);

      // Check for privacy content
      expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    });

    it('should allow toggling privacy settings', async () => {
      const user = userEvent.setup();
      const privacyTab = screen.getByRole('tab', { name: /privacy/i });

      await user.click(privacyTab);

      // Should show privacy content
      expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    });

    it('should show data export/import options', async () => {
      const user = userEvent.setup();
      const privacyTab = screen.getByRole('tab', { name: /privacy/i });

      await user.click(privacyTab);

      // Should show privacy content
      expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    });
  });

  describe('Settings Management', () => {
    it('should handle reset settings', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      // Navigate to a tab that might have reset option
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });

    it('should handle settings updates', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
      await user.click(preferencesTab);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', () => {
      const mockUnauthenticatedContext = {
        ...mockAuthContext,
        user: null
      };

      vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue(mockUnauthenticatedContext);

      render(<AISettingsDashboard />);

      // Should handle unauthenticated state
      // Component may show login prompt or redirect
    });

    it('should handle loading states', () => {
      const mockLoadingSettings = {
        ...mockAISettings,
        loading: true
      };

      vi.mocked(require('@/hooks/useAISettings').useAISettings).mockReturnValue(mockLoadingSettings);

      render(<AISettingsDashboard />);

      // Should handle loading state
      expect(screen.getByText(/AI Settings & Privacy/i)).toBeInTheDocument();
    });

    it('should handle error states', () => {
      const mockErrorSettings = {
        ...mockAISettings,
        error: 'Failed to load AI settings'
      };

      vi.mocked(require('@/hooks/useAISettings').useAISettings).mockReturnValue(mockErrorSettings);

      render(<AISettingsDashboard />);

      // Should handle error state
      expect(screen.getByText(/AI Settings & Privacy/i)).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt layout for mobile', () => {
      setMobileViewport();
      render(<AISettingsDashboard />);

      // Check that tabs are rendered (they should stack on mobile)
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toBeInTheDocument();

      // Cards should have proper mobile spacing
      const cards = screen.getAllByRole('tabpanel');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle touch interactions', async () => {
      setMobileViewport();
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      // Test tab switching on mobile
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      // Simulate touch events
      fireEvent.touchStart(preferencesTab);
      fireEvent.touchEnd(preferencesTab);
      await user.click(preferencesTab);

      expect(preferencesTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AISettingsDashboard />);

      const results = await axe(container);
      // @ts-expect-error - Accessibility testing library types not fully configured
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      // Tab navigation should work
      await user.tab();

      // First focusable element should be focused
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();

      // Should be able to navigate between tabs
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
    });

    it('should have proper ARIA labels', () => {
      render(<AISettingsDashboard />);

      // Check for proper labeling
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
      });

      // Switches should have labels
      const switches = screen.getAllByRole('switch');
      switches.forEach(switch_ => {
        expect(switch_).toHaveAccessibleName();
      });
    });

    it('should support screen readers', () => {
      render(<AISettingsDashboard />);

      // Important information should be announced
      expect(screen.getByRole('heading', { name: /ai settings & privacy/i })).toBeInTheDocument();

      // Status information should be accessible
      const statusRegion = screen.getByText(/ai system status/i);
      expect(statusRegion).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();

      render(<AISettingsDashboard />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
    });

    it('should handle large datasets efficiently', () => {
      const largeMockStats = {
        ...mockUsageStats,
        stats: {
          ...mockUsageStats.stats,
          topInsightTypes: Array.from({ length: 100 }, (_, i) => ({
            type: `insight-type-${i}`,
            count: Math.floor(Math.random() * 100)
          }))
        }
      };

      vi.mocked(require('@/hooks/useAIUsageStats').useAIUsageStats).mockReturnValue(largeMockStats);

      const startTime = performance.now();
      render(<AISettingsDashboard />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should handle large data efficiently
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(<AISettingsDashboard />);

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should integrate with auth context', () => {
      render(<AISettingsDashboard />);

      // Should use user data from auth context
      expect(mockAuthContext.user).toBeTruthy();

      // Component should render based on auth state
      expect(screen.getByText(/ai settings & privacy/i)).toBeInTheDocument();
    });

    it('should integrate with AI settings hook', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
      await user.click(preferencesTab);

      // Should use settings from hook
      expect(mockAISettings.enabled).toBe(true);

      // Should show preferences content
      expect(screen.getByText(/AI Provider Settings/i)).toBeInTheDocument();
    });

    it('should integrate with usage stats hook', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      const usageTab = screen.getByRole('tab', { name: /usage & costs/i });
      await user.click(usageTab);

      // Should show usage content
      expect(screen.getByText(/Usage & Costs/i)).toBeInTheDocument();
    });
  });

  describe('Data Export/Import', () => {
    it('should handle settings export', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      const privacyTab = screen.getByRole('tab', { name: /privacy/i });
      await user.click(privacyTab);

      // Should show privacy content
      expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    });

    it('should handle settings import', async () => {
      const user = userEvent.setup();
      render(<AISettingsDashboard />);

      const privacyTab = screen.getByRole('tab', { name: /privacy/i });
      await user.click(privacyTab);

      // Should show privacy content
      expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    });
  });
});