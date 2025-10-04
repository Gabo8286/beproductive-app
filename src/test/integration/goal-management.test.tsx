import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoalCard } from '@/components/goals/GoalCard';
import { createMockGoal, createMockUser } from '@/test/mock-data';

// Mock API calls
const mockCreateGoal = vi.fn();
const mockUpdateGoal = vi.fn();
const mockDeleteGoal = vi.fn();
const mockGetGoals = vi.fn();

// Mock hooks
vi.mock('@/hooks/useGoals', () => ({
  useCreateGoal: () => ({
    mutateAsync: mockCreateGoal,
    isLoading: false,
  }),
  useUpdateGoal: () => ({
    mutateAsync: mockUpdateGoal,
    isLoading: false,
  }),
  useDeleteGoal: () => ({
    mutateAsync: mockDeleteGoal,
    isLoading: false,
  }),
  useGoals: () => ({
    data: mockGetGoals(),
    isLoading: false,
    error: null,
  }),
  useUpdateGoalProgress: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  }),
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: createMockUser(),
    loading: false,
  }),
}));

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
        <Routes>
          <Route path="/" element={<div>{children}</div>} />
          <Route path="/goals/:id" element={<div>Goal Detail Page</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Goal Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Goal Creation Workflow', () => {
    it('should complete full goal creation flow', async () => {
      const user = userEvent.setup();
      const mockGoals = [
        createMockGoal({ id: '1', title: 'Existing Goal 1' }),
        createMockGoal({ id: '2', title: 'Existing Goal 2' }),
      ];

      mockGetGoals.mockReturnValue(mockGoals);

      // Mock successful goal creation
      const newGoal = createMockGoal({
        id: '3',
        title: 'New Test Goal',
        description: 'Test goal description',
        status: 'active',
      });
      mockCreateGoal.mockResolvedValue(newGoal);

      // Simulate a goal creation form component
      const GoalCreationFlow = () => {
        const [goals, setGoals] = React.useState(mockGoals);
        const [isCreating, setIsCreating] = React.useState(false);

        const handleCreateGoal = async () => {
          setIsCreating(true);
          try {
            const created = await mockCreateGoal({
              title: 'New Test Goal',
              description: 'Test goal description',
              status: 'active',
            });
            setGoals([...goals, created]);
            setIsCreating(false);
          } catch (error) {
            setIsCreating(false);
          }
        };

        return (
          <div>
            <h1>Goal Management</h1>
            <button
              onClick={handleCreateGoal}
              disabled={isCreating}
              data-testid="create-goal-btn"
            >
              {isCreating ? 'Creating...' : 'Create Goal'}
            </button>
            <div data-testid="goals-list">
              {goals.map(goal => (
                <div key={goal.id} data-testid={`goal-${goal.id}`}>
                  {goal.title}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<GoalCreationFlow />, { wrapper: createWrapper() });

      // Step 1: Verify initial state
      expect(screen.getByText('Goal Management')).toBeInTheDocument();
      expect(screen.getByTestId('goal-1')).toHaveTextContent('Existing Goal 1');
      expect(screen.getByTestId('goal-2')).toHaveTextContent('Existing Goal 2');

      // Step 2: Initiate goal creation
      const createButton = screen.getByTestId('create-goal-btn');
      await user.click(createButton);

      // Step 3: Verify loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(createButton).toBeDisabled();

      // Step 4: Wait for completion
      await waitFor(() => {
        expect(mockCreateGoal).toHaveBeenCalledWith({
          title: 'New Test Goal',
          description: 'Test goal description',
          status: 'active',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('goal-3')).toBeInTheDocument();
      });

      // Step 5: Verify final state
      expect(screen.getByTestId('goal-3')).toHaveTextContent('New Test Goal');
      expect(screen.getByText('Create Goal')).toBeInTheDocument(); // Button should be enabled again
    });

    it('should handle goal creation errors gracefully', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to create goal');
      mockCreateGoal.mockRejectedValue(error);

      const GoalCreationWithError = () => {
        const [error, setError] = React.useState<string | null>(null);
        const [isCreating, setIsCreating] = React.useState(false);

        const handleCreateGoal = async () => {
          setIsCreating(true);
          setError(null);
          try {
            await mockCreateGoal({ title: 'Test Goal' });
            setIsCreating(false);
          } catch (err) {
            setError('Failed to create goal');
            setIsCreating(false);
          }
        };

        return (
          <div>
            <button onClick={handleCreateGoal} disabled={isCreating}>
              Create Goal
            </button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        );
      };

      render(<GoalCreationWithError />, { wrapper: createWrapper() });

      const createButton = screen.getByRole('button', { name: 'Create Goal' });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to create goal');
      });

      // Button should be enabled again after error
      expect(createButton).not.toBeDisabled();
    });
  });

  describe('Goal Status Management Workflow', () => {
    it('should complete goal status transition flow', async () => {
      const user = userEvent.setup();
      const testGoal = createMockGoal({
        id: 'status-test',
        title: 'Status Test Goal',
        status: 'active',
      });

      mockUpdateGoal.mockResolvedValue({
        ...testGoal,
        status: 'completed',
      });

      render(<GoalCard goal={testGoal} />, { wrapper: createWrapper() });

      // Step 1: Verify initial state
      expect(screen.getByText('Status Test Goal')).toBeInTheDocument();

      // Step 2: Open actions menu
      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      // Step 3: Select status change
      const completeButton = screen.getByText('Mark Complete');
      await user.click(completeButton);

      // Step 4: Verify API call
      await waitFor(() => {
        expect(mockUpdateGoal).toHaveBeenCalledWith({ status: 'completed' });
      });

      // Step 5: Verify success feedback
      await waitFor(() => {
        expect(screen.getByText('Goal completed!')).toBeInTheDocument();
      });
    });

    it('should handle multiple rapid status changes', async () => {
      const user = userEvent.setup();
      const testGoal = createMockGoal({
        id: 'rapid-test',
        title: 'Rapid Changes Goal',
        status: 'active',
      });

      let callCount = 0;
      mockUpdateGoal.mockImplementation(async (data) => {
        callCount++;
        return { ...testGoal, ...data };
      });

      render(<GoalCard goal={testGoal} />, { wrapper: createWrapper() });

      // Rapid clicks
      const moreButton = screen.getByRole('button', { name: /more options/i });

      await user.click(moreButton);
      const pauseButton = screen.getByText('Pause Goal');
      await user.click(pauseButton);

      await user.click(moreButton);
      const resumeButton = screen.getByText('Resume Goal');
      await user.click(resumeButton);

      // Should handle rapid changes gracefully
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Goal Deletion Workflow', () => {
    it('should complete goal deletion with confirmation', async () => {
      const user = userEvent.setup();
      const testGoal = createMockGoal({
        id: 'delete-test',
        title: 'Goal to Delete',
      });

      mockDeleteGoal.mockResolvedValue({ success: true });

      render(<GoalCard goal={testGoal} />, { wrapper: createWrapper() });

      // Step 1: Open actions menu
      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      // Step 2: Click delete
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Step 3: Verify confirmation dialog
      expect(screen.getByText('Are you sure you want to delete this goal?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      // Step 4: Confirm deletion
      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmDeleteButton);

      // Step 5: Verify API call
      await waitFor(() => {
        expect(mockDeleteGoal).toHaveBeenCalledWith(testGoal.id);
      });
    });

    it('should cancel deletion when user cancels', async () => {
      const user = userEvent.setup();
      const testGoal = createMockGoal({
        id: 'cancel-delete-test',
        title: 'Goal Not to Delete',
      });

      render(<GoalCard goal={testGoal} />, { wrapper: createWrapper() });

      // Open delete dialog
      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify deletion was not called
      expect(mockDeleteGoal).not.toHaveBeenCalled();

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Are you sure you want to delete this goal?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Goal Progress Update Workflow', () => {
    it('should update goal progress through various methods', async () => {
      const user = userEvent.setup();
      const testGoal = createMockGoal({
        id: 'progress-test',
        title: 'Progress Test Goal',
        progress: 25,
      });

      const mockUpdateProgress = vi.fn().mockResolvedValue({
        ...testGoal,
        progress: 50,
      });

      // Mock the progress update hook
      vi.mocked(require('@/hooks/useGoals').useUpdateGoalProgress).mockReturnValue({
        mutateAsync: mockUpdateProgress,
        isLoading: false,
      });

      const ProgressTestComponent = () => {
        const [progress, setProgress] = React.useState(testGoal.progress);

        const updateProgress = async (newProgress: number) => {
          await mockUpdateProgress({ goalId: testGoal.id, progress: newProgress });
          setProgress(newProgress);
        };

        return (
          <div>
            <div data-testid="progress-value">Progress: {progress}%</div>
            <button onClick={() => updateProgress(50)} data-testid="update-50">
              Set to 50%
            </button>
            <button onClick={() => updateProgress(100)} data-testid="update-100">
              Complete (100%)
            </button>
          </div>
        );
      };

      render(<ProgressTestComponent />, { wrapper: createWrapper() });

      // Step 1: Verify initial progress
      expect(screen.getByTestId('progress-value')).toHaveTextContent('Progress: 25%');

      // Step 2: Update to 50%
      await user.click(screen.getByTestId('update-50'));

      await waitFor(() => {
        expect(mockUpdateProgress).toHaveBeenCalledWith({
          goalId: testGoal.id,
          progress: 50,
        });
      });

      expect(screen.getByTestId('progress-value')).toHaveTextContent('Progress: 50%');

      // Step 3: Complete the goal
      await user.click(screen.getByTestId('update-100'));

      await waitFor(() => {
        expect(mockUpdateProgress).toHaveBeenCalledWith({
          goalId: testGoal.id,
          progress: 100,
        });
      });

      expect(screen.getByTestId('progress-value')).toHaveTextContent('Progress: 100%');
    });
  });

  describe('Goal List Management Integration', () => {
    it('should handle goal list operations comprehensively', async () => {
      const user = userEvent.setup();
      const initialGoals = [
        createMockGoal({ id: '1', title: 'Goal 1', progress: 30 }),
        createMockGoal({ id: '2', title: 'Goal 2', progress: 70 }),
        createMockGoal({ id: '3', title: 'Goal 3', progress: 100, status: 'completed' }),
      ];

      const GoalListManager = () => {
        const [goals, setGoals] = React.useState(initialGoals);
        const [filter, setFilter] = React.useState<'all' | 'active' | 'completed'>('all');

        const filteredGoals = goals.filter(goal => {
          if (filter === 'all') return true;
          if (filter === 'active') return goal.status === 'active';
          if (filter === 'completed') return goal.status === 'completed';
          return true;
        });

        const deleteGoal = async (goalId: string) => {
          await mockDeleteGoal(goalId);
          setGoals(goals.filter(g => g.id !== goalId));
        };

        return (
          <div>
            <div>
              <button
                onClick={() => setFilter('all')}
                data-testid="filter-all"
                className={filter === 'all' ? 'active' : ''}
              >
                All ({goals.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                data-testid="filter-active"
                className={filter === 'active' ? 'active' : ''}
              >
                Active ({goals.filter(g => g.status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                data-testid="filter-completed"
                className={filter === 'completed' ? 'active' : ''}
              >
                Completed ({goals.filter(g => g.status === 'completed').length})
              </button>
            </div>
            <div data-testid="goals-container">
              {filteredGoals.map(goal => (
                <div key={goal.id} data-testid={`goal-item-${goal.id}`}>
                  <span>{goal.title}</span>
                  <span>Progress: {goal.progress}%</span>
                  <span>Status: {goal.status}</span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    data-testid={`delete-${goal.id}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<GoalListManager />, { wrapper: createWrapper() });

      // Step 1: Verify initial state
      expect(screen.getByTestId('filter-all')).toHaveTextContent('All (3)');
      expect(screen.getByTestId('filter-active')).toHaveTextContent('Active (2)');
      expect(screen.getByTestId('filter-completed')).toHaveTextContent('Completed (1)');

      // Step 2: Test filtering
      await user.click(screen.getByTestId('filter-active'));
      expect(screen.getByTestId('goal-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('goal-item-2')).toBeInTheDocument();
      expect(screen.queryByTestId('goal-item-3')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('filter-completed'));
      expect(screen.queryByTestId('goal-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('goal-item-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('goal-item-3')).toBeInTheDocument();

      // Step 3: Test deletion
      await user.click(screen.getByTestId('filter-all'));
      await user.click(screen.getByTestId('delete-1'));

      await waitFor(() => {
        expect(mockDeleteGoal).toHaveBeenCalledWith('1');
      });

      // Goal should be removed from list
      expect(screen.queryByTestId('goal-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('goal-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('goal-item-3')).toBeInTheDocument();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should recover from network failures gracefully', async () => {
      const user = userEvent.setup();

      // Simulate network failure followed by recovery
      mockUpdateGoal
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      const testGoal = createMockGoal({
        id: 'network-test',
        title: 'Network Test Goal',
      });

      const NetworkTestComponent = () => {
        const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
        const [retryCount, setRetryCount] = React.useState(0);

        const updateGoal = async () => {
          setStatus('loading');
          try {
            await mockUpdateGoal({ status: 'completed' });
            setStatus('success');
          } catch (error) {
            setStatus('error');
          }
        };

        const retry = () => {
          setRetryCount(prev => prev + 1);
          updateGoal();
        };

        return (
          <div>
            <button onClick={updateGoal} disabled={status === 'loading'}>
              Update Goal
            </button>
            {status === 'loading' && <div data-testid="loading">Updating...</div>}
            {status === 'error' && (
              <div data-testid="error">
                <span>Update failed</span>
                <button onClick={retry} data-testid="retry-btn">Retry</button>
              </div>
            )}
            {status === 'success' && <div data-testid="success">Updated successfully!</div>}
            <div data-testid="retry-count">Retries: {retryCount}</div>
          </div>
        );
      };

      render(<NetworkTestComponent />, { wrapper: createWrapper() });

      // Step 1: Trigger initial failure
      await user.click(screen.getByRole('button', { name: 'Update Goal' }));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      // Step 2: Retry and succeed
      await user.click(screen.getByTestId('retry-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });

      expect(screen.getByTestId('retry-count')).toHaveTextContent('Retries: 1');
    });

    it('should handle concurrent operations safely', async () => {
      const user = userEvent.setup();

      let operationCount = 0;
      mockUpdateGoal.mockImplementation(async () => {
        operationCount++;
        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, operationId: operationCount };
      });

      const ConcurrentTestComponent = () => {
        const [operations, setOperations] = React.useState<number[]>([]);
        const [activeOps, setActiveOps] = React.useState(0);

        const startOperation = async () => {
          setActiveOps(prev => prev + 1);
          try {
            const result = await mockUpdateGoal({});
            setOperations(prev => [...prev, result.operationId]);
          } finally {
            setActiveOps(prev => prev - 1);
          }
        };

        return (
          <div>
            <button onClick={startOperation} data-testid="start-op">
              Start Operation
            </button>
            <div data-testid="active-ops">Active: {activeOps}</div>
            <div data-testid="completed-ops">Completed: {operations.length}</div>
          </div>
        );
      };

      render(<ConcurrentTestComponent />, { wrapper: createWrapper() });

      // Start multiple operations rapidly
      const startButton = screen.getByTestId('start-op');
      await user.click(startButton);
      await user.click(startButton);
      await user.click(startButton);

      // Should handle concurrent operations
      await waitFor(() => {
        expect(screen.getByTestId('completed-ops')).toHaveTextContent('Completed: 3');
      });

      expect(screen.getByTestId('active-ops')).toHaveTextContent('Active: 0');
    });
  });
});