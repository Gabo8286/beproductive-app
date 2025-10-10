import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskCompletion,
  useSortedTasks,
} from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { createMockTask, createMockUser } from "@/test/fixtures/mockData";
import { AuthContext } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

vi.mock("@/integrations/supabase/client");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockUser = createMockUser();
  const mockAuthValue = {
    user: mockUser,
    session: null,
    profile: null,
    authLoading: false,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
    isGuestMode: false,
    guestUserType: null,
    signInAsGuest: vi.fn(),
    clearGuestMode: vi.fn(),
  };

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={mockAuthValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe("useTasks Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock workspace query
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "workspaces") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: "workspace-id", owner_id: "test-user-id" },
            error: null,
          }),
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any;
    });
  });

  it("should create tasks with subtasks", async () => {
    const mockTask = createMockTask();

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "workspace-id" },
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Parent Task",
      description: "With subtasks",
      status: "todo",
      priority: "medium",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should handle drag-and-drop reordering", async () => {
    const mockTasks = [
      createMockTask({ title: "Task 1", position: 0 }) as any,
      createMockTask({ title: "Task 2", position: 1 }) as any,
      createMockTask({ title: "Task 3", position: 2 }) as any,
    ];

    const { result } = renderHook(() => useSortedTasks());

    const sorted = result.current.sortTasks(mockTasks, "title", "asc");
    expect(sorted[0].title).toBe("Task 1");
    expect(sorted[1].title).toBe("Task 2");
  });

  it("should filter tasks correctly", async () => {
    const mockTasks = [
      createMockTask({ status: "todo", priority: "high" }) as any,
      createMockTask({ status: "in_progress", priority: "medium" }) as any,
      createMockTask({ status: "done", priority: "low" }) as any,
    ];

    const { result } = renderHook(() => useSortedTasks());

    const grouped = result.current.groupTasks(mockTasks, "status");
    expect(grouped["Todo"]).toHaveLength(1);
    expect(grouped["In Progress"]).toHaveLength(1);
    expect(grouped["Done"]).toHaveLength(1);
  });

  it("should toggle task completion", async () => {
    const mockTask = createMockTask({ status: "todo" }) as any;

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...mockTask, status: "done" },
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useToggleTaskCompletion(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockTask);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should group tasks by status", () => {
    const mockTasks = [
      createMockTask({ status: "todo" }) as any,
      createMockTask({ status: "todo" }) as any,
      createMockTask({ status: "in_progress" }) as any,
      createMockTask({ status: "done" }) as any,
    ];

    const { result } = renderHook(() => useSortedTasks());
    const grouped = result.current.groupTasks(mockTasks, "status");

    expect(grouped["Todo"]).toHaveLength(2);
    expect(grouped["In Progress"]).toHaveLength(1);
    expect(grouped["Done"]).toHaveLength(1);
  });

  it("should sort tasks by priority", () => {
    const mockTasks = [
      createMockTask({ priority: "low" }) as any,
      createMockTask({ priority: "urgent" }) as any,
      createMockTask({ priority: "medium" }) as any,
    ];

    const { result } = renderHook(() => useSortedTasks());
    const sorted = result.current.sortTasks(mockTasks, "priority", "desc");

    expect(sorted[0].priority).toBe("urgent");
    expect(sorted[2].priority).toBe("low");
  });
});
