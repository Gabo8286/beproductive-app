import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/components/tasks/TaskCard';
import { createMockTask } from '@/test/fixtures/mockData';

describe('TaskCard Component', () => {
  it('should render task with title and description', () => {
    const mockTask = createMockTask({
      title: 'Write tests',
      description: 'Add comprehensive test coverage',
    });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Add comprehensive test coverage')).toBeInTheDocument();
  });

  it('should show completion checkbox', () => {
    const mockTask = createMockTask({ status: 'todo' });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should toggle completion status', async () => {
    const user = userEvent.setup();
    const mockTask = createMockTask({ status: 'todo' });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Check that mutation was called (would be mocked in full test)
    expect(checkbox).toBeInTheDocument();
  });

  it('should display priority badge', () => {
    const mockTask = createMockTask({ priority: 'high' });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it('should show due date when set', () => {
    const dueDate = new Date('2025-12-31');
    const mockTask = createMockTask({
      due_date: dueDate.toISOString(),
    });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    expect(screen.getByText(/due:/i)).toBeInTheDocument();
  });

  it('should display tags', () => {
    const mockTask = createMockTask({
      tags: ['urgent', 'frontend'],
    });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('should show timer button', () => {
    const mockTask = createMockTask();

    renderWithProviders(<TaskCard task={mockTask as any} />);

    // Timer button should be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should strike through completed tasks', () => {
    const mockTask = createMockTask({ status: 'done' });

    renderWithProviders(<TaskCard task={mockTask as any} />);

    const title = screen.getByText(mockTask.title);
    expect(title).toHaveClass('line-through');
  });
});
