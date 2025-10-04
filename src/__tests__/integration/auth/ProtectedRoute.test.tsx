import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/utils/test-utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { createMockUser } from "@/test/fixtures/mockData";

describe("ProtectedRoute Integration", () => {
  it("should show loading spinner when auth is loading", () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authValue: {
          user: null,
          session: null,
          profile: null,
          loading: true,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
          signInWithGoogle: vi.fn(),
          resetPassword: vi.fn(),
          updateProfile: vi.fn(),
        },
      },
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        initialRoute: "/dashboard",
        authValue: {
          user: null,
          session: null,
          profile: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
          signInWithGoogle: vi.fn(),
          resetPassword: vi.fn(),
          updateProfile: vi.fn(),
        },
      },
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when user is authenticated", () => {
    const mockUser = createMockUser();

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authValue: {
          user: mockUser,
          session: { user: mockUser },
          profile: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
          signInWithGoogle: vi.fn(),
          resetPassword: vi.fn(),
          updateProfile: vi.fn(),
        },
      },
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
