import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import {
  server,
  useErrorHandlers,
  useSlowHandlers,
  useSuccessHandlers,
  overrideHandler,
} from './server';

// Mock components for testing API interactions
const MockGoalsList = () => {
  const [goals, setGoals] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/goals');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setGoals(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGoals();
  }, []);

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Goals List</h1>
      {goals.map((goal: any) => (
        <div key={goal.id} data-testid="goal-item">
          <h3>{goal.title}</h3>
          <p>{goal.description}</p>
        </div>
      ))}
      <button onClick={fetchGoals}>Refresh</button>
    </div>
  );
};

const MockGoalCreator = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal');
      }

      const data = await response.json();
      setResult(`Goal created: ${data.data.title}`);
      setTitle('');
      setDescription('');
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={createGoal}>
      <h1>Create Goal</h1>
      <input
        type="text"
        placeholder="Goal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        data-testid="title-input"
      />
      <textarea
        placeholder="Goal description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        data-testid="description-input"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Goal'}
      </button>
      {result && <div data-testid="result">{result}</div>}
    </form>
  );
};

// Test wrapper with React Query
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Advanced Mock Service Testing', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Success Scenarios', () => {
    it('should fetch goals successfully', async () => {
      useSuccessHandlers();

      render(
        <TestWrapper>
          <MockGoalsList />
        </TestWrapper>
      );

      expect(screen.getByText('Loading goals...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Goals List')).toBeInTheDocument();
      });

      const goalItems = screen.getAllByTestId('goal-item');
      expect(goalItems).toHaveLength(5);
      expect(screen.getByText('Mock Goal 1')).toBeInTheDocument();
    });

    it('should create goals successfully', async () => {
      useSuccessHandlers();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockGoalCreator />
        </TestWrapper>
      );

      await user.type(screen.getByTestId('title-input'), 'Test Goal');
      await user.type(screen.getByTestId('description-input'), 'Test Description');
      await user.click(screen.getByRole('button', { name: /create goal/i }));

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Goal created:');
      });
    });

    it('should handle pagination correctly', async () => {
      // Mock paginated response
      overrideHandler(
        http.get('http://localhost:3000/api/goals', ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');

          return HttpResponse.json({
            data: [
              { id: `goal-page-${page}-1`, title: `Goal ${page}-1`, description: 'Desc' },
              { id: `goal-page-${page}-2`, title: `Goal ${page}-2`, description: 'Desc' },
            ],
            pagination: {
              page,
              limit: 2,
              total: 10,
              totalPages: 5,
              hasNext: page < 5,
              hasPrev: page > 1,
            },
          });
        })
      );

      const PaginatedGoals = () => {
        const [page, setPage] = React.useState(1);
        const [goals, setGoals] = React.useState([]);

        React.useEffect(() => {
          fetch(`http://localhost:3000/api/goals?page=${page}`)
            .then(res => res.json())
            .then(data => setGoals(data.data));
        }, [page]);

        return (
          <div>
            {goals.map((goal: any) => (
              <div key={goal.id}>{goal.title}</div>
            ))}
            <button onClick={() => setPage(p => p + 1)}>Next Page</button>
            <span>Page {page}</span>
          </div>
        );
      };

      render(<PaginatedGoals />);

      await waitFor(() => {
        expect(screen.getByText('Goal 1-1')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByText('Next Page'));

      await waitFor(() => {
        expect(screen.getByText('Goal 2-1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      useErrorHandlers();

      render(
        <TestWrapper>
          <MockGoalsList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      useErrorHandlers();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockGoalCreator />
        </TestWrapper>
      );

      await user.type(screen.getByTestId('title-input'), 'Test');
      await user.click(screen.getByRole('button', { name: /create goal/i }));

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Error: Validation failed');
      });
    });

    it('should handle 404 errors', async () => {
      overrideHandler(
        http.get('http://localhost:3000/api/goals/nonexistent', () => {
          return HttpResponse.json(
            { error: 'Goal not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch('http://localhost:3000/api/goals/nonexistent');
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Goal not found');
    });

    it('should handle authentication errors', async () => {
      overrideHandler(
        http.get('http://localhost:3000/api/users/me', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('http://localhost:3000/api/users/me');
      expect(response.status).toBe(401);
    });
  });

  describe('Performance and Timeout Scenarios', () => {
    it('should handle slow responses', async () => {
      useSlowHandlers();

      const SlowComponent = () => {
        const [status, setStatus] = React.useState('Loading...');

        React.useEffect(() => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            setStatus('Request timed out');
          }, 2000);

          fetch('http://localhost:3000/api/goals', {
            signal: controller.signal,
          })
            .then(res => res.json())
            .then(() => {
              clearTimeout(timeoutId);
              setStatus('Loaded');
            })
            .catch(err => {
              clearTimeout(timeoutId);
              if (err.name === 'AbortError') {
                setStatus('Request timed out');
              } else {
                setStatus('Error');
              }
            });
        }, []);

        return <div>{status}</div>;
      };

      render(<SlowComponent />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByText('Request timed out')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should measure API response times', async () => {
      useSuccessHandlers();

      const startTime = performance.now();

      const response = await fetch('http://localhost:3000/api/goals');
      await response.json();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100); // Should be fast for mocked responses
    });
  });

  describe('Data Consistency and State Management', () => {
    it('should maintain data consistency across operations', async () => {
      useSuccessHandlers();

      // Test create -> read -> update -> delete flow
      const createResponse = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Goal', description: 'Test' }),
      });

      const created = await createResponse.json();
      expect(created.data.title).toBe('Test Goal');

      // Read the created goal
      const readResponse = await fetch(`http://localhost:3000/api/goals/${created.data.id}`);
      const read = await readResponse.json();
      expect(read.data.id).toBe(created.data.id);

      // Update the goal
      const updateResponse = await fetch(`http://localhost:3000/api/goals/${created.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Goal' }),
      });

      const updated = await updateResponse.json();
      expect(updated.data.title).toBe('Updated Goal');

      // Delete the goal
      const deleteResponse = await fetch(`http://localhost:3000/api/goals/${created.data.id}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.ok).toBe(true);
    });

    it('should handle concurrent requests properly', async () => {
      useSuccessHandlers();

      const requests = Array.from({ length: 5 }, (_, i) =>
        fetch('http://localhost:3000/api/goals').then(res => res.json())
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.data).toHaveLength(5);
        expect(response.total).toBe(5);
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should handle search queries correctly', async () => {
      const searchResponse = await fetch(
        'http://localhost:3000/api/goals/search?q=goal%201'
      );

      const searchData = await searchResponse.json();
      expect(Array.isArray(searchData.data)).toBe(true);
      expect(searchData.query.q).toBe('goal 1');
    });

    it('should handle filtering by status', async () => {
      const filterResponse = await fetch(
        'http://localhost:3000/api/goals/search?status=active'
      );

      const filterData = await filterResponse.json();
      expect(filterData.query?.status).toBe('active');
    });
  });

  describe('File Upload Scenarios', () => {
    it('should handle file uploads', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/goals/goal-1/attachments', {
        method: 'POST',
        body: formData,
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data?.filename).toBe('test.txt');
      expect(data.data?.size).toBe(file.size);
    });
  });

  describe('Real-time Data Simulation', () => {
    it('should provide live progress updates', async () => {
      const response = await fetch('http://localhost:3000/api/goals/goal-1/live-progress');
      const data = await response.json();

      expect(data.data?.goalId).toBe('goal-1');
      expect(typeof data.data?.progress).toBe('number');
      expect(data.data?.progress).toBeGreaterThanOrEqual(0);
      expect(data.data?.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Analytics and Dashboard Data', () => {
    it('should provide analytics dashboard data', async () => {
      const response = await fetch('http://localhost:3000/api/analytics/dashboard');
      const data = await response.json();

      expect(data.data.totalGoals).toBe(15);
      expect(data.data.completedGoals).toBe(8);
      expect(data.data.weeklyProgress).toHaveLength(7);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty responses', async () => {
      overrideHandler(
        http.get('http://localhost:3000/api/goals', () => {
          return HttpResponse.json({
            data: [],
            total: 0,
          });
        })
      );

      const response = await fetch('http://localhost:3000/api/goals');
      const data = await response.json();

      expect(data.data).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should handle malformed JSON responses', async () => {
      overrideHandler(
        http.get('http://localhost:3000/api/goals', () => {
          return new HttpResponse('invalid json', {
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const response = await fetch('http://localhost:3000/api/goals');

      await expect(response.json()).rejects.toThrow();
    });

    it('should handle large payloads', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `goal-${i}`,
        title: `Large Goal ${i}`,
        description: 'A'.repeat(1000), // Large description
      }));

      overrideHandler(
        http.get('http://localhost:3000/api/goals', () => {
          return HttpResponse.json({
            data: largeData,
            total: largeData.length,
          });
        })
      );

      const startTime = performance.now();
      const response = await fetch('http://localhost:3000/api/goals');
      const data = await response.json();
      const endTime = performance.now();

      expect(data.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should handle large data efficiently
    });
  });
});