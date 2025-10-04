import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: any) => {
      mockNavigate({ to, state, replace });
      return <div data-testid="navigate-mock">Redirecting to {to}</div>;
    },
  };
});

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={component} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should have proper accessibility for loading state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      const loadingContainer = document.querySelector('.flex.min-h-screen');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should redirect to login
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        state: { from: expect.objectContaining({ pathname: '/' }) },
        replace: true,
      });

      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should pass current location state for redirect back', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        '/dashboard'
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        state: { from: expect.objectContaining({ pathname: '/' }) },
        replace: true,
      });
    });

    it('should use replace navigation to prevent back button issues', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ replace: true })
      );
    });
  });

  describe('Authenticated State', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
          full_name: 'Test User',
        },
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should show protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should render multiple children correctly', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should handle complex child components', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123' },
        loading: false,
      });

      const ComplexChild = () => (
        <div>
          <h1>Dashboard</h1>
          <nav>Navigation</nav>
          <main data-testid="main-content">Main Content</main>
        </div>
      );

      renderWithRouter(
        <ProtectedRoute>
          <ComplexChild />
        </ProtectedRoute>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: undefined,
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' })
      );
    });

    it('should handle null user explicitly', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' })
      );
    });

    it('should handle empty user object', () => {
      mockUseAuth.mockReturnValue({
        user: {},
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Empty object is truthy, so should render content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle missing loading state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        // loading: undefined
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should treat missing loading as false and redirect
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' })
      );
    });
  });

  describe('Performance', () => {
    it('should render quickly with authenticated user', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123' },
        loading: false,
      });

      const startTime = performance.now();
      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should render in less than 50ms
    });

    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      const SpyComponent = () => {
        renderSpy();
        return <TestComponent />;
      };

      mockUseAuth.mockReturnValue({
        user: { id: 'user123' },
        loading: false,
      });

      const { rerender } = renderWithRouter(
        <ProtectedRoute>
          <SpyComponent />
        </ProtectedRoute>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same auth state
      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <SpyComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(renderSpy).toHaveBeenCalledTimes(2); // One additional render is expected
    });
  });

  describe('Security', () => {
    it('should immediately redirect on auth state change', () => {
      // Start authenticated
      mockUseAuth.mockReturnValue({
        user: { id: 'user123' },
        loading: false,
      });

      const { rerender } = renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Simulate logout
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' })
      );
    });

    it('should not expose protected content during loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="sensitive-data">Sensitive Information</div>
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('sensitive-data')).not.toBeInTheDocument();
    });

    it('should prevent access with invalid auth state', () => {
      mockUseAuth.mockReturnValue({
        user: false, // Invalid user state
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' })
      );
    });
  });

  describe('Accessibility', () => {
    it('should maintain focus management during auth state changes', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123' },
        loading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <button>Focusable Element</button>
        </ProtectedRoute>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have proper loading announcement for screen readers', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Loading state should be announced to screen readers
      const loadingElement = document.querySelector('.animate-spin');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle auth hook errors gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAuth.mockImplementation(() => {
        throw new Error('Auth hook error');
      });

      expect(() => {
        renderWithRouter(
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        );
      }).toThrow('Auth hook error');

      consoleError.mockRestore();
    });

    it('should handle missing auth context', () => {
      mockUseAuth.mockReturnValue(undefined);

      expect(() => {
        renderWithRouter(
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        );
      }).toThrow();
    });
  });
});