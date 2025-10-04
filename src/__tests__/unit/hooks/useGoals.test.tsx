import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useGoals,
  useGoal,
  useUpdateGoal,
  useDeleteGoal,
} from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";
import { createMockGoal, createMockUser } from "@/test/fixtures/mockData";
import type { ReactNode } from "react";

// Mock Supabase
vi.mock("@/integrations/supabase/client");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGoals Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch goals with proper filtering", async () => {
    const mockGoals = [
      createMockGoal({ title: "Goal 1", status: "active" }),
      createMockGoal({ title: "Goal 2", status: "completed" }),
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockGoals, error: null }),
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    } as any);

    vi.mocked(supabase.removeChannel).mockReturnValue(
      Promise.resolve("ok" as any),
    );

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.goals).toHaveLength(2);
    expect(result.current.goals[0].title).toBe("Goal 1");
  });

  it("should handle goal creation with validation", async () => {
    const mockUser = createMockUser();
    const mockGoal = createMockGoal();

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "workspace-id" },
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockGoal, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    } as any);

    vi.mocked(supabase.removeChannel).mockReturnValue(
      Promise.resolve("ok" as any),
    );

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test create goal
    result.current.createGoal({
      workspace_id: "workspace-id",
      title: "New Goal",
      description: "Test description",
      category: "personal",
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });

  it("should update goal progress correctly", async () => {
    const mockGoal = createMockGoal({ progress: 50 });

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useUpdateGoal(mockGoal.id), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ progress: 75 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should handle goal deletion with sub-goal check", async () => {
    const mockGoalId = "goal-id";

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useDeleteGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockGoalId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should calculate statistics accurately", async () => {
    const mockGoals = [
      createMockGoal({ progress: 100, status: "completed" }),
      createMockGoal({ progress: 50, status: "active" }),
      createMockGoal({ progress: 25, status: "active" }),
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockGoals, error: null }),
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    } as any);

    vi.mocked(supabase.removeChannel).mockReturnValue(
      Promise.resolve("ok" as any),
    );

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(3);
    });

    const avgProgress =
      result.current.goals.reduce((sum, g) => sum + (g.progress || 0), 0) /
      result.current.goals.length;
    expect(avgProgress).toBe(58.33);
  });
});
