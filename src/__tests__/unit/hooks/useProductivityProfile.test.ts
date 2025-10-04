import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "1",
                user_id: "user1",
                dominant_profile: "strategist",
                secondary_profile: "executor",
                question_responses: {},
                profile_scores: { strategist: 15, executor: 12 },
                recommended_strategies: ["Set implementation deadlines"],
                strengths: ["Excellent at strategic planning"],
                growth_areas: ["May over-plan and under-execute"],
                completed_at: "2024-01-01T00:00:00Z",
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            id: "1",
            user_id: "user1",
            dominant_profile: "strategist",
            secondary_profile: "executor",
          },
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock auth context
const mockUser = {
  id: "user1",
  email: "test@example.com",
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    session: null,
    profile: null,
    loading: false,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock gamification hook
vi.mock("@/hooks/useGamification", () => ({
  useGamification: () => ({
    awardPoints: vi.fn(),
  }),
}));

describe("useProductivityProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useProductivityProfile());

    expect(result.current.isLoading).toBe(true);
  });

  it("should provide assessment questions", () => {
    const { result } = renderHook(() => useProductivityProfile());

    expect(result.current.questions).toBeDefined();
    expect(result.current.questions.length).toBeGreaterThan(0);
    expect(result.current.questions[0]).toHaveProperty("id");
    expect(result.current.questions[0]).toHaveProperty("question");
    expect(result.current.questions[0]).toHaveProperty("options");
  });

  it("should provide productivity profiles", () => {
    const { result } = renderHook(() => useProductivityProfile());

    expect(result.current.profiles).toBeDefined();
    expect(result.current.profiles.strategist).toBeDefined();
    expect(result.current.profiles.strategist.name).toBe("The Strategist");
    expect(result.current.profiles.executor).toBeDefined();
    expect(result.current.profiles.collaborator).toBeDefined();
  });

  it("should calculate profile scores correctly", () => {
    const { result } = renderHook(() => useProductivityProfile());

    const responses = {
      planning_style: "detailed_plan",
      work_style: "minimal_distractions",
    };

    const scores = result.current.calculateProfileScores(responses);
    expect(scores).toBeDefined();
    expect(scores.strategist).toBeGreaterThan(0);
    expect(scores.minimalist).toBeGreaterThan(0);
  });

  it("should determine dominant profiles correctly", () => {
    const { result } = renderHook(() => useProductivityProfile());

    const scores = {
      strategist: 15,
      executor: 12,
      collaborator: 8,
      optimizer: 5,
    };

    const { dominant, secondary } = result.current.getDominantProfiles(scores);
    expect(dominant).toBe("strategist");
    expect(secondary).toBe("executor");
  });

  it("should submit assessment successfully", async () => {
    const { result } = renderHook(() => useProductivityProfile());

    const responses = {
      planning_style: "detailed_plan",
      work_style: "minimal_distractions",
      decision_making: "thorough_analysis",
    };

    await waitFor(async () => {
      const assessment = await result.current.submitAssessment(responses);
      expect(assessment).toBeDefined();
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("productivity_assessments");
  });

  it("should handle submission errors", async () => {
    // Mock no user
    vi.mocked(require("@/contexts/AuthContext").useAuth).mockReturnValue({
      user: null,
      session: null,
      profile: null,
      loading: false,
      authError: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      clearAuthError: vi.fn(),
    });

    const { result } = renderHook(() => useProductivityProfile());

    await waitFor(async () => {
      await expect(result.current.submitAssessment({})).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  it("should get recommendations for a profile", () => {
    const { result } = renderHook(() => useProductivityProfile());

    const recommendations =
      result.current.getRecommendationsForProfile("strategist");
    expect(recommendations.strategies).toBeDefined();
    expect(recommendations.strengths).toBeDefined();
    expect(recommendations.growthAreas).toBeDefined();
    expect(recommendations.strategies.length).toBeGreaterThan(0);
  });
});
