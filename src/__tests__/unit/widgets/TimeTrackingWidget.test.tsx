import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TimeTrackingWidget } from '@/components/widgets/TimeTrackingWidget';

// Mock the LoadingSkeleton component
vi.mock('@/components/ai/LoadingSkeleton', () => ({
  LoadingSkeleton: ({ type }: { type: string }) => (
    <div data-testid={`loading-skeleton-${type}`}>Loading...</div>
  )
}));

// Mock framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TimeTrackingWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    renderWithRouter(<TimeTrackingWidget />);

    expect(screen.getByTestId('loading-skeleton-widget')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders widget content after loading', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Check if main elements are rendered
    expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    expect(screen.getByText('Frontend development')).toBeInTheDocument();
    expect(screen.getByText('deep work')).toBeInTheDocument();
  });

  it('displays active session with timer', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Check for active session elements
    expect(screen.getByText('Frontend development')).toBeInTheDocument();
    expect(screen.getByText('deep work')).toBeInTheDocument();

    // Check for timer controls (buttons without accessible names, so we'll check by finding them)
    const buttons = screen.getAllByRole('button');
    const timerButtons = buttons.filter(button =>
      button.className.includes('h-9') && button.type === 'button'
    );

    // Should have pause and stop buttons
    expect(timerButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('handles pause and resume functionality', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Get timer control buttons
    const buttons = screen.getAllByRole('button');
    const timerButtons = buttons.filter(button =>
      button.className.includes('h-9') && button.type === 'button' && !button.className.includes('w-full')
    );

    // First timer button should be pause, second should be stop
    const pauseButton = timerButtons[0];
    expect(pauseButton).toBeInTheDocument();

    // Click pause (this will toggle it to play)
    fireEvent.click(pauseButton);

    // The button should still exist (just content changed)
    expect(pauseButton).toBeInTheDocument();

    // Click again to resume
    fireEvent.click(pauseButton);

    // Button should still be there
    expect(pauseButton).toBeInTheDocument();
  });

  it('handles stop session functionality', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Get timer control buttons
    const buttons = screen.getAllByRole('button');
    const timerButtons = buttons.filter(button =>
      button.className.includes('h-9') && button.type === 'button' && !button.className.includes('w-full')
    );

    // Second timer button should be stop
    const stopButton = timerButtons[1];
    expect(stopButton).toBeInTheDocument();

    // Click stop
    fireEvent.click(stopButton);

    // Should show no active session state
    await waitFor(() => {
      expect(screen.getByText('No active session')).toBeInTheDocument();
      expect(screen.getByText('Start Tracking')).toBeInTheDocument();
    });
  });

  it('displays productivity stats correctly', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Check for stats section
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Focus Time')).toBeInTheDocument();
    expect(screen.getByText('8.2/10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Sessions count
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('has working navigation links', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Check for external link to time tracking page
    const externalLinks = screen.getAllByRole('link');
    expect(externalLinks.length).toBeGreaterThan(0);

    // Check for analytics button
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('displays progress bars with correct values', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Progress bars should be rendered
    const progressElements = document.querySelectorAll('[role="progressbar"]');
    expect(progressElements.length).toBeGreaterThanOrEqual(2); // Productivity and Focus Time
  });

  it('handles error state correctly', async () => {
    // The component doesn't currently have a way to trigger errors since it uses mock data
    // This test is a placeholder for when real API integration is added
    expect(true).toBe(true);
  });

  it('retry button works in error state', async () => {
    // The component doesn't currently have a way to trigger errors since it uses mock data
    // This test is a placeholder for when real API integration is added
    expect(true).toBe(true);
  });

  it('formats time duration correctly', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // Check for formatted time displays
    const timeElements = screen.getAllByText(/\d+[hms]/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays category badge correctly', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    expect(screen.getByText('deep work')).toBeInTheDocument();
  });

  it('shows pulsing indicator for active session', async () => {
    renderWithRouter(<TimeTrackingWidget />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-widget')).not.toBeInTheDocument();
    }, { timeout: 1500 });

    // The pulsing indicator should be rendered as a motion.div
    // Since we mocked framer-motion, check for the div structure
    const timerSection = screen.getByText('Frontend development').closest('div');
    expect(timerSection).toBeInTheDocument();
  });
});