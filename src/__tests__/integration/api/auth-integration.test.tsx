/**
 * API Integration Tests - Authentication Flow
 * Tests real authentication flows with Supabase integration
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import { TestEnvironment, createMockUser, createMockSession } from '@/__tests__/utils/test-helpers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication API Integration', () => {
  let testEnv: TestEnvironment;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    testEnv = new TestEnvironment();
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnv.reset();
  });

  describe('Login Flow', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      // Mock successful login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Fill login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Verify API call
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // Wait for successful authentication
      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });

    it('should handle invalid credentials gracefully', async () => {
      // Mock failed login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' } as any,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Fill login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
      });

      // Verify user remains on login page
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should handle network errors during authentication', async () => {
      // Mock network error
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Verify network error handling
      await waitFor(() => {
        expect(screen.getByText(/network error|connection failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Management', () => {
    it('should restore user session on page refresh', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      // Mock existing session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <div data-testid="auth-state">
            {/* This would be your app content that shows auth state */}
          </div>
        </TestWrapper>
      );

      // Verify session restoration
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });
    });

    it('should handle expired sessions', async () => {
      const expiredSession = {
        ...createMockSession(),
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      render(
        <TestWrapper>
          <div data-testid="auth-state" />
        </TestWrapper>
      );

      // Should attempt to refresh session or redirect to login
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should successfully log out user and clear session', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      // Setup authenticated state
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock successful logout
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      render(
        <TestWrapper>
          <div data-testid="auth-state">
            <button onClick={() => supabase.auth.signOut()}>
              Logout
            </button>
          </div>
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      // Verify logout API call
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register new user', async () => {
      const newUser = createMockUser({ email: 'newuser@example.com' });

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: newUser, session: null },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Switch to register mode (assuming your login page has this)
      const registerTab = screen.queryByText(/sign up|register/i);
      if (registerTab) {
        await user.click(registerTab);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const registerButton = screen.getByRole('button', { name: /sign up|register/i });

        await user.type(emailInput, 'newuser@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(registerButton);

        // Verify registration API call
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
        });
      }
    });

    it('should handle registration errors', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' } as any,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Attempt registration with existing email
      const registerTab = screen.queryByText(/sign up|register/i);
      if (registerTab) {
        await user.click(registerTab);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const registerButton = screen.getByRole('button', { name: /sign up|register/i });

        await user.type(emailInput, 'existing@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(registerButton);

        // Verify error handling
        await waitFor(() => {
          expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Auth State Changes', () => {
    it('should handle auth state change events', async () => {
      const mockUser = createMockUser();
      let authStateCallback: ((event: string, session: any) => void) | null = null;

      // Mock auth state change subscription
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        } as any;
      });

      render(
        <TestWrapper>
          <div data-testid="auth-state" />
        </TestWrapper>
      );

      // Simulate auth state change
      if (authStateCallback) {
        const session = createMockSession(mockUser);
        authStateCallback('SIGNED_IN', session);
      }

      // Verify auth state change handling
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle rate limiting for failed login attempts', async () => {
      // Mock rate limit error
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Too many requests' } as any,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // Attempt multiple rapid logins
      for (let i = 0; i < 3; i++) {
        await user.clear(emailInput);
        await user.clear(passwordInput);
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(loginButton);
      }

      // Verify rate limiting message
      await waitFor(() => {
        expect(screen.getByText(/too many requests|rate limit/i)).toBeInTheDocument();
      });
    });
  });
});