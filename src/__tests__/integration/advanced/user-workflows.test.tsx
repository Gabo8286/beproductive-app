/**
 * Advanced Integration Tests - User Workflows
 * Tests complete user journeys and complex interactions between components
 */
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { OptimizedProviders } from '@/components/providers/OptimizedProviders';
import App from '@/App';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <BrowserRouter>
      <OptimizedProviders>
        {children}
      </OptimizedProviders>
    </BrowserRouter>
  </QueryClientProvider>
);

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProviders });
};

describe('Advanced User Workflows', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Clear any existing mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete Onboarding Flow', () => {
    it('should guide new user through complete onboarding process', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      };

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      renderWithProviders(<App />);

      // Step 1: User should see onboarding screen
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Step 2: Set productivity goals
      const goalInput = screen.getByLabelText(/primary goal/i);
      await user.type(goalInput, 'Complete my thesis project');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Step 3: Configure preferences
      await waitFor(() => {
        expect(screen.getByText(/preferences/i)).toBeInTheDocument();
      });

      const workingHoursSelect = screen.getByLabelText(/working hours/i);
      await user.selectOptions(workingHoursSelect, '9am-5pm');

      const notificationsToggle = screen.getByRole('switch', { name: /notifications/i });
      await user.click(notificationsToggle);

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4: Widget selection
      await waitFor(() => {
        expect(screen.getByText(/customize dashboard/i)).toBeInTheDocument();
      });

      // Select default widgets
      const tasksWidget = screen.getByLabelText(/tasks widget/i);
      const goalsWidget = screen.getByLabelText(/goals widget/i);
      const calendarWidget = screen.getByLabelText(/calendar widget/i);

      await user.click(tasksWidget);
      await user.click(goalsWidget);
      await user.click(calendarWidget);

      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      await user.click(completeButton);

      // Step 5: Verify redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Verify widgets are present
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/goals/i)).toBeInTheDocument();
      expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    });
  });

  describe('Task Management Workflow', () => {
    it('should allow complete task lifecycle management', async () => {
      renderWithProviders(<App />);

      // Navigate to tasks
      const tasksLink = screen.getByRole('link', { name: /tasks/i });
      await user.click(tasksLink);

      // Create new task
      const addTaskButton = screen.getByRole('button', { name: /add task/i });
      await user.click(addTaskButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill task details
      const taskTitleInput = screen.getByLabelText(/task title/i);
      await user.type(taskTitleInput, 'Review research papers');

      const taskDescriptionInput = screen.getByLabelText(/description/i);
      await user.type(taskDescriptionInput, 'Review papers for literature review section');

      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.selectOptions(prioritySelect, 'high');

      const dueDateInput = screen.getByLabelText(/due date/i);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await user.type(dueDateInput, tomorrow.toISOString().split('T')[0]);

      // Add tags
      const tagsInput = screen.getByLabelText(/tags/i);
      await user.type(tagsInput, 'research,academic{enter}');

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      // Verify task appears in list
      await waitFor(() => {
        expect(screen.getByText(/review research papers/i)).toBeInTheDocument();
      });

      // Edit task
      const taskCard = screen.getByText(/review research papers/i).closest('[data-testid="task-card"]');
      expect(taskCard).toBeInTheDocument();

      const editButton = within(taskCard!).getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Update task status
      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'in-progress');

      const updateButton = screen.getByRole('button', { name: /update task/i });
      await user.click(updateButton);

      // Verify status change
      await waitFor(() => {
        expect(screen.getByText(/in progress/i)).toBeInTheDocument();
      });

      // Complete task
      const completeButton = within(taskCard!).getByRole('button', { name: /complete/i });
      await user.click(completeButton);

      // Verify task is marked as completed
      await waitFor(() => {
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Widget Management Workflow', () => {
    it('should handle dynamic widget addition, configuration, and removal', async () => {
      renderWithProviders(<App />);

      // Navigate to dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      // Add widget
      const addWidgetButton = screen.getByRole('button', { name: /add widget/i });
      await user.click(addWidgetButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Select time tracking widget
      const timeTrackingWidget = screen.getByRole('button', { name: /time tracking/i });
      await user.click(timeTrackingWidget);

      // Verify widget appears on dashboard
      await waitFor(() => {
        expect(screen.getByText(/time tracking/i)).toBeInTheDocument();
      });

      // Configure widget
      const widgetMenu = screen.getByRole('button', { name: /widget options/i });
      await user.click(widgetMenu);

      const configureOption = screen.getByRole('menuitem', { name: /configure/i });
      await user.click(configureOption);

      // Update widget settings
      const autoStartToggle = screen.getByRole('switch', { name: /auto start/i });
      await user.click(autoStartToggle);

      const saveConfigButton = screen.getByRole('button', { name: /save configuration/i });
      await user.click(saveConfigButton);

      // Drag and drop widget (simulate)
      const widget = screen.getByTestId('draggable-widget-time-tracking');
      const targetPosition = screen.getByTestId('widget-drop-zone-2');

      // Simulate drag and drop
      fireEvent.dragStart(widget);
      fireEvent.dragOver(targetPosition);
      fireEvent.drop(targetPosition);

      // Verify widget position changed
      await waitFor(() => {
        const reorderedWidget = screen.getByTestId('widget-position-2');
        expect(within(reorderedWidget).getByText(/time tracking/i)).toBeInTheDocument();
      });

      // Remove widget
      await user.click(widgetMenu);
      const removeOption = screen.getByRole('menuitem', { name: /remove/i });
      await user.click(removeOption);

      // Confirm removal
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify widget is removed
      await waitFor(() => {
        expect(screen.queryByText(/time tracking/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle and recover from various error scenarios', async () => {
      // Mock network error
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Network error');
      });

      renderWithProviders(<App />);

      // Try to load data that will fail
      const tasksLink = screen.getByRole('link', { name: /tasks/i });
      await user.click(tasksLink);

      // Verify error boundary catches the error
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Try recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Verify recovery attempt
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      // Mock successful recovery
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      // Click retry again
      await user.click(retryButton);

      // Verify successful recovery
      await waitFor(() => {
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
        expect(screen.getByText(/tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Accessibility', () => {
    it('should maintain performance standards during complex interactions', async () => {
      const performanceEntries: PerformanceEntry[] = [];

      // Mock performance observer
      const originalPerformanceObserver = global.PerformanceObserver;
      global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }));

      renderWithProviders(<App />);

      // Perform multiple rapid interactions
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      // Measure interaction time
      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        await user.click(dashboardLink);
        await waitFor(() => screen.getByText(/dashboard/i));

        const tasksLink = screen.getByRole('link', { name: /tasks/i });
        await user.click(tasksLink);
        await waitFor(() => screen.getByText(/tasks/i));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Verify performance is within acceptable limits (< 5 seconds for 10 interactions)
      expect(totalTime).toBeLessThan(5000);

      // Restore original PerformanceObserver
      global.PerformanceObserver = originalPerformanceObserver;
    });

    it('should maintain keyboard navigation throughout complex workflows', async () => {
      renderWithProviders(<App />);

      // Test keyboard navigation
      await user.tab(); // Focus first interactive element
      await user.keyboard('{Enter}'); // Activate element

      // Navigate through multiple sections using keyboard
      for (let i = 0; i < 10; i++) {
        await user.tab();
      }

      // Verify focus is still within the application
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
      expect(focusedElement?.tagName).toMatch(/BUTTON|INPUT|A|SELECT/);

      // Test escape key for modals
      const addTaskButton = screen.getByRole('button', { name: /add task/i });
      await user.click(addTaskButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence and Sync', () => {
    it('should handle data consistency across multiple operations', async () => {
      renderWithProviders(<App />);

      // Create multiple tasks
      const tasksToCreate = [
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium' },
        { title: 'Task 3', priority: 'low' },
      ];

      for (const task of tasksToCreate) {
        // Add task
        const addTaskButton = screen.getByRole('button', { name: /add task/i });
        await user.click(addTaskButton);

        const titleInput = screen.getByLabelText(/task title/i);
        await user.type(titleInput, task.title);

        const prioritySelect = screen.getByLabelText(/priority/i);
        await user.selectOptions(prioritySelect, task.priority);

        const saveButton = screen.getByRole('button', { name: /save task/i });
        await user.click(saveButton);

        // Verify task appears
        await waitFor(() => {
          expect(screen.getByText(task.title)).toBeInTheDocument();
        });
      }

      // Verify all tasks are present
      tasksToCreate.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });

      // Test bulk operations
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      await user.click(selectAllCheckbox);

      const bulkCompleteButton = screen.getByRole('button', { name: /complete selected/i });
      await user.click(bulkCompleteButton);

      // Verify all tasks are marked as completed
      await waitFor(() => {
        const completedTasks = screen.getAllByText(/completed/i);
        expect(completedTasks).toHaveLength(tasksToCreate.length);
      });
    });
  });
});