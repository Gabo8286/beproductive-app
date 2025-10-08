import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { supabase } from "@/integrations/supabase/client";
import {
  createMockUser,
  createMockSession,
  createMockProfile,
} from "@/test/fixtures/mockData";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock router navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = "/" }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Helper component to test auth state
const AuthStateTestComponent = () => {
  const { user, session, profile, authLoading } = useAuth();
  return (
    <div data-testid="auth-state">
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <div data-testid="session">{session ? "has-session" : "no-session"}</div>
      <div data-testid="profile">
        {profile ? profile.full_name : "no-profile"}
      </div>
      <div data-testid="loading">{authLoading ? "loading" : "loaded"}</div>
    </div>
  );
};

describe("Authentication Integration Tests", () => {
  let mockSupabaseChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock Supabase chain
    mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    };

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

    // Default to no existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Login Flow Integration", () => {
    it("should handle complete login flow with navigation", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ email: "test@example.com" });
      const mockSession = createMockSession({ user: mockUser });
      const mockProfile = createMockProfile({
        id: mockUser.id,
        full_name: "Test User",
        email: "test@example.com",
      });

      // Mock successful login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile fetch
      mockSupabaseChain.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      render(
        <TestWrapper initialRoute="/login">
          <Login />
        </TestWrapper>,
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(loginButton);

      // Verify API call
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should handle login errors with user feedback", async () => {
      const user = userEvent.setup();
      const mockError = {
        message: "Invalid login credentials",
        status: 400,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      render(
        <TestWrapper initialRoute="/login">
          <Login />
        </TestWrapper>,
      );

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(loginButton);

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });

    it("should handle Google OAuth login flow", async () => {
      const user = userEvent.setup();

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: "google", url: "https://oauth.google.com" },
        error: null,
      });

      render(
        <TestWrapper initialRoute="/login">
          <Login />
        </TestWrapper>,
      );

      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining(window.location.origin),
        },
      });
    });

    it("should redirect authenticated users away from login page", async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      // Mock existing session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock profile fetch
      mockSupabaseChain.single.mockResolvedValue({
        data: createMockProfile({ id: mockUser.id }),
        error: null,
      });

      render(
        <TestWrapper initialRoute="/login">
          <AuthStateTestComponent />
          <Login />
        </TestWrapper>,
      );

      // Should navigate to dashboard
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 2000 },
      );
    });
  });

  describe("Signup Flow Integration", () => {
    it("should handle complete signup flow", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ email: "newuser@example.com" });
      const mockSession = createMockSession({ user: mockUser });

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper initialRoute="/signup">
          <Signup />
        </TestWrapper>,
      );

      // Fill in signup form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const fullNameInput = screen.getByLabelText(/full name/i);
      const signupButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(fullNameInput, "New User");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(signupButton);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "newpassword123",
        options: {
          emailRedirectTo: expect.stringContaining(window.location.origin),
          data: {
            full_name: "New User",
          },
        },
      });
    });

    it("should validate password confirmation match", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialRoute="/signup">
          <Signup />
        </TestWrapper>,
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const signupButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "differentpassword");
      await user.click(signupButton);

      // Should not call signup API with mismatched passwords
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should handle signup errors", async () => {
      const user = userEvent.setup();
      const mockError = {
        message: "User already registered",
        status: 422,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      render(
        <TestWrapper initialRoute="/signup">
          <Signup />
        </TestWrapper>,
      );

      // Fill form with existing email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const fullNameInput = screen.getByLabelText(/full name/i);
      const signupButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(fullNameInput, "Existing User");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(signupButton);

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Authentication State Management", () => {
    it("should handle auth state changes correctly", async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });
      const mockProfile = createMockProfile({ id: mockUser.id });

      // Mock profile fetch
      mockSupabaseChain.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      // Setup auth state change listener
      let authStateCallback: (event: string, session: any) => void;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          } as any;
        },
      );

      render(
        <TestWrapper>
          <AuthStateTestComponent />
        </TestWrapper>,
      );

      // Initially should be loading
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      // Simulate user sign in
      await act(async () => {
        authStateCallback!("SIGNED_IN", mockSession);
        await new Promise((resolve) => setTimeout(resolve, 10)); // Allow profile fetch
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(mockUser.email);
        expect(screen.getByTestId("session")).toHaveTextContent("has-session");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      // Simulate user sign out
      await act(async () => {
        authStateCallback!("SIGNED_OUT", null);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session")).toHaveTextContent("no-session");
        expect(screen.getByTestId("profile")).toHaveTextContent("no-profile");
      });
    });

    it("should handle profile fetch errors gracefully", async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      // Mock profile fetch error
      mockSupabaseChain.single.mockRejectedValue(
        new Error("Profile not found"),
      );

      // Setup auth state change listener
      let authStateCallback: (event: string, session: any) => void;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          } as any;
        },
      );

      render(
        <TestWrapper>
          <AuthStateTestComponent />
        </TestWrapper>,
      );

      // Simulate user sign in with profile error
      await act(async () => {
        authStateCallback!("SIGNED_IN", mockSession);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Allow profile fetch to fail
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(mockUser.email);
        expect(screen.getByTestId("profile")).toHaveTextContent("no-profile");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle concurrent auth operations", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      // Mock successful operations
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      mockSupabaseChain.single.mockResolvedValue({
        data: createMockProfile({ id: mockUser.id }),
        error: null,
      });

      render(
        <TestWrapper initialRoute="/login">
          <AuthStateTestComponent />
          <Login />
        </TestWrapper>,
      );

      // Start login process
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Start multiple concurrent operations (shouldn't break)
      const loginPromise = user.click(loginButton);
      const anotherLoginPromise = user.click(loginButton);

      await Promise.all([loginPromise, anotherLoginPromise]);

      // Should handle gracefully without errors
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe("Password Reset Flow", () => {
    it("should handle password reset request", async () => {
      const user = userEvent.setup();

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      // Create a test component with reset password functionality
      const PasswordResetComponent = () => {
        const { resetPassword } = useAuth();
        const [email, setEmail] = React.useState("");

        const handleReset = async () => {
          await resetPassword(email);
        };

        return (
          <div>
            <input
              data-testid="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <button onClick={handleReset} data-testid="reset-button">
              Reset Password
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <PasswordResetComponent />
        </TestWrapper>,
      );

      const emailInput = screen.getByTestId("reset-email");
      const resetButton = screen.getByTestId("reset-button");

      await user.type(emailInput, "user@example.com");
      await user.click(resetButton);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password"),
        }),
      );
    });
  });

  describe("Profile Management Integration", () => {
    it("should handle profile updates", async () => {
      const mockUser = createMockUser();
      const mockProfile = createMockProfile({
        id: mockUser.id,
        full_name: "Original Name",
      });

      // Mock successful update
      mockSupabaseChain.single
        .mockResolvedValueOnce({
          data: mockProfile,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockProfile, full_name: "Updated Name" },
          error: null,
        });

      // Create test component for profile updates
      const ProfileUpdateComponent = () => {
        const { updateProfile, profile, user } = useAuth();
        const [name, setName] = React.useState(profile?.full_name || "");

        const handleUpdate = async () => {
          await updateProfile({ full_name: name });
        };

        React.useEffect(() => {
          setName(profile?.full_name || "");
        }, [profile]);

        return (
          <div>
            <div data-testid="current-name">
              {profile?.full_name || "No name"}
            </div>
            <input
              data-testid="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleUpdate} data-testid="update-button">
              Update Profile
            </button>
          </div>
        );
      };

      // Setup auth state with existing user
      let authStateCallback: (event: string, session: any) => void;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          } as any;
        },
      );

      render(
        <TestWrapper>
          <ProfileUpdateComponent />
        </TestWrapper>,
      );

      // Simulate user already signed in
      await act(async () => {
        authStateCallback!("SIGNED_IN", createMockSession({ user: mockUser }));
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByTestId("current-name")).toHaveTextContent(
          "Original Name",
        );
      });

      // Update profile
      const nameInput = screen.getByTestId("name-input");
      const updateButton = screen.getByTestId("update-button");

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "Updated Name");
      await userEvent.click(updateButton);

      // Verify update call
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({
        full_name: "Updated Name",
      });
    });

    it("should handle profile update errors", async () => {
      const mockUser = createMockUser();

      // Mock profile update error
      mockSupabaseChain.single.mockRejectedValue(new Error("Update failed"));

      const ProfileUpdateComponent = () => {
        const { updateProfile } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        const handleUpdate = async () => {
          const result = await updateProfile({ full_name: "New Name" });
          if (result.error) {
            setError(result.error.message);
          }
        };

        return (
          <div>
            <button onClick={handleUpdate} data-testid="update-button">
              Update Profile
            </button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        );
      };

      // Setup with signed in user
      let authStateCallback: (event: string, session: any) => void;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          } as any;
        },
      );

      render(
        <TestWrapper>
          <ProfileUpdateComponent />
        </TestWrapper>,
      );

      await act(async () => {
        authStateCallback!("SIGNED_IN", createMockSession({ user: mockUser }));
      });

      const updateButton = screen.getByTestId("update-button");
      await userEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Update failed");
      });
    });
  });

  describe("Session Persistence and Recovery", () => {
    it("should restore session on app initialization", async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });
      const mockProfile = createMockProfile({ id: mockUser.id });

      // Mock existing session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseChain.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      render(
        <TestWrapper>
          <AuthStateTestComponent />
        </TestWrapper>,
      );

      // Should restore session and user state
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(mockUser.email);
        expect(screen.getByTestId("session")).toHaveTextContent("has-session");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle session recovery errors", async () => {
      // Mock session recovery error
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error("Session recovery failed"),
      );

      render(
        <TestWrapper>
          <AuthStateTestComponent />
        </TestWrapper>,
      );

      // Should handle error gracefully and set loading to false
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });
});
