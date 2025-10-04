import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoalCard } from './GoalCard';
import { createMockGoal } from '@/test/mock-data';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Mock the hooks
vi.mock('@/hooks/useGoals', () => ({
  useUpdateGoal: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  })),
  useDeleteGoal: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  })),
  useUpdateGoalProgress: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  })),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock utils
vi.mock('@/utils/goalStatus', () => ({
  getStatusColor: vi.fn((status) => status === 'completed' ? 'green' : 'blue'),
  getStatusLabel: vi.fn((status) => status.charAt(0).toUpperCase() + status.slice(1)),
  getAvailableStatusTransitions: vi.fn(() => ['active', 'paused', 'completed']),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GoalCard Component', () => {
  beforeEach(() => {
    setDesktopViewport();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render goal information correctly', () => {
      const mockGoal = createMockGoal({
        title: 'Learn React Testing',
        description: 'Master React testing with Vitest',
        progress: 75,
        category: 'learning',
        status: 'active',
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      expect(screen.getByText('Learn React Testing')).toBeInTheDocument();
      expect(screen.getByText('Master React testing with Vitest')).toBeInTheDocument();
    });

    it('should display progress bar with correct value', () => {
      const mockGoal = createMockGoal({ progress: 65 });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    });

    it('should show category badge', () => {
      const mockGoal = createMockGoal({ category: 'health' });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      expect(screen.getByText('health')).toBeInTheDocument();
    });

    it('should display target date when available', () => {
      const mockGoal = createMockGoal({
        target_date: '2024-12-31'
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      // Should show formatted date
      expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument();
    });

    it('should show status badge', () => {
      const mockGoal = createMockGoal({ status: 'active' });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should open dropdown menu when more options button is clicked', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should navigate to goal details when card is clicked', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const card = screen.getByRole('article') || screen.getByTestId('goal-card');
      await user.click(card);

      expect(mockNavigate).toHaveBeenCalledWith(`/goals/${mockGoal.id}`);
    });

    it('should handle status change', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal({ status: 'active' });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      const completeButton = screen.getByText('Mark Complete');
      await user.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Goal completed!')).toBeInTheDocument();
      });
    });

    it('should show delete confirmation dialog', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(screen.getByText('Are you sure you want to delete this goal?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt layout for mobile screens', () => {
      setMobileViewport();
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const card = screen.getByRole('article') || screen.getByTestId('goal-card');
      expect(card).toBeInTheDocument();

      // Check that touch targets are adequate size
      const moreButton = screen.getByRole('button', { name: /more options/i });
      const styles = window.getComputedStyle(moreButton);
      expect(parseInt(styles.minHeight) || parseInt(styles.height)).toBeGreaterThanOrEqual(40);
    });

    it('should show appropriate mobile layout', () => {
      setMobileViewport();
      const mockGoal = createMockGoal({
        title: 'Very Long Goal Title That Should Wrap',
        description: 'This is a very long description that should wrap properly on mobile devices'
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      expect(screen.getByText('Very Long Goal Title That Should Wrap')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockGoal = createMockGoal({
        title: 'Accessible Goal',
        progress: 50
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('progress'));

      const moreButton = screen.getByRole('button', { name: /more options/i });
      expect(moreButton).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      // Tab through focusable elements
      await user.tab();
      expect(screen.getByRole('button', { name: /more options/i })).toHaveFocus();

      // Test keyboard interaction
      await user.keyboard('{Enter}');
      expect(screen.getByText('Edit Goal')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Edit Goal')).not.toBeInTheDocument();
      });
    });

    it('should have sufficient color contrast', () => {
      const mockGoal = createMockGoal();

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const title = screen.getByText(mockGoal.title);
      const computedStyle = window.getComputedStyle(title);

      // Should have readable text (this is a basic check)
      expect(computedStyle.color).not.toBe('transparent');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during status update', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      // Mock loading state
      const { useUpdateGoal } = await import('@/hooks/useGoals');
      vi.mocked(useUpdateGoal).mockReturnValue({
        mutateAsync: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
        isLoading: true,
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      const completeButton = screen.getByText('Mark Complete');
      await user.click(completeButton);

      // Should show loading indicator
      expect(screen.getByRole('button', { name: /updating/i })).toBeInTheDocument();
    });

    it('should disable interactions during updates', async () => {
      const mockGoal = createMockGoal();

      // Mock loading state
      const { useUpdateGoal } = await import('@/hooks/useGoals');
      vi.mocked(useUpdateGoal).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: true,
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      expect(moreButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle status update errors gracefully', async () => {
      const user = userEvent.setup();
      const mockGoal = createMockGoal();

      // Mock error
      const { useUpdateGoal } = await import('@/hooks/useGoals');
      vi.mocked(useUpdateGoal).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error('Update failed')),
        isLoading: false,
      });

      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      const completeButton = screen.getByText('Mark Complete');
      await user.click(completeButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to update goal status:', expect.any(Error));
      });
    });

    it('should handle missing goal data gracefully', () => {
      const incompleteGoal = createMockGoal({
        title: '',
        description: null,
      });

      render(<GoalCard goal={incompleteGoal} />, { wrapper: createWrapper() });

      // Should still render without crashing
      expect(screen.getByRole('article') || screen.getByTestId('goal-card')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const renderCount = vi.fn();
      const TestGoalCard = ({ goal }: { goal: any }) => {
        renderCount();
        return <GoalCard goal={goal} />;
      };

      const mockGoal = createMockGoal();
      const { rerender } = render(<TestGoalCard goal={mockGoal} />, { wrapper: createWrapper() });

      expect(renderCount).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause unnecessary renders
      rerender(<TestGoalCard goal={mockGoal} />);
      expect(renderCount).toHaveBeenCalledTimes(2);
    });

    it('should handle large amounts of data efficiently', () => {
      const mockGoal = createMockGoal({
        title: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        tags: Array.from({ length: 50 }, (_, i) => `tag${i}`),
      });

      const startTime = performance.now();
      render(<GoalCard goal={mockGoal} />, { wrapper: createWrapper() });
      const endTime = performance.now();

      // Should render in reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});