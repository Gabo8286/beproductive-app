/**
 * Simple Integration Test to Verify Setup
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Simple test component
const TestComponent = () => {
  return (
    <div data-testid="test-component">
      <h1>Integration Test</h1>
      <p>This is a simple integration test</p>
    </div>
  );
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Simple Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render test component', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Integration Test')).toBeInTheDocument();
    expect(screen.getByText('This is a simple integration test')).toBeInTheDocument();
  });

  it('should handle basic interactions', () => {
    render(
      <TestWrapper>
        <div>
          <button data-testid="test-button">Click me</button>
          <input data-testid="test-input" placeholder="Type here" />
        </div>
      </TestWrapper>
    );

    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });
});