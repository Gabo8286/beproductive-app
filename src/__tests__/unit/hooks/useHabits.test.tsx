import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useArchiveHabit,
} from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { createMockHabit } from "@/test/fixtures/mockData";
import type { ReactNode } from "react";

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

describe("useHabits Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should track daily completions", async () => {
    const mockHabit = createMockHabit({ frequency: "daily" });
    const mockEntries = [
      { habit_id: mockHabit.id, status: "completed", date: "2025-01-01" },
    ];

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "habits") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [mockHabit],
            error: null,
          }),
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({
          data: mockEntries,
          error: null,
        }),
      } as any;
    });

    const { result } = renderHook(
      () => useHabits("workspace-id", undefined, "position", "asc"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should calculate streaks correctly", async () => {
    const mockHabit = createMockHabit({ current_streak: 7, best_streak: 10 });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockHabit],
        error: null,
      }),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useHabits("workspace-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const habit = result.current.data?.[0];
    expect(habit?.current_streak).toBe(7);
    expect(habit).toBeDefined();
  });

  it("should handle streak breaks", async () => {
    const mockHabit = createMockHabit({ current_streak: 0, best_streak: 5 });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockHabit],
        error: null,
      }),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useHabits("workspace-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.[0].current_streak).toBe(0);
    });
  });

  it("should generate habit analytics", async () => {
    const mockHabit = createMockHabit();
    const mockEntries = Array.from({ length: 30 }, (_, i) => ({
      habit_id: mockHabit.id,
      status: i % 2 === 0 ? "completed" : "skipped",
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
    }));

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "habits") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [mockHabit],
            error: null,
          }),
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({
          data: mockEntries,
          error: null,
        }),
      } as any;
    });

    const { result } = renderHook(() => useHabits("workspace-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const habit = result.current.data?.[0];
    expect(habit?.completion_rate).toBeGreaterThan(0);
  });

  it("should manage habit reminders", async () => {
    const mockHabit = createMockHabit({
      reminder_enabled: true,
      reminder_time: "09:00",
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockHabit,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useUpdateHabit(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: mockHabit.id,
      reminder_enabled: false,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should archive habit (soft delete)", async () => {
    const mockHabit = createMockHabit();

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...mockHabit, archived_at: new Date().toISOString() },
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useArchiveHabit(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ habitId: mockHabit.id, archive: true });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
