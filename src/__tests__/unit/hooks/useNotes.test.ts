import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotes } from "@/hooks/useNotes";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            id: "1",
            title: "Test Note",
            content: "Test content",
            note_type: "fleeting",
            user_id: "user1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: "1",
              title: "Updated Note",
              content: "Updated content",
              note_type: "fleeting",
              user_id: "user1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            error: null,
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    })),
  })),
  rpc: vi.fn(() => ({
    data: [],
    error: null,
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

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty notes array", async () => {
    const { result } = renderHook(() => useNotes());

    expect(result.current.notes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("should create a new note", async () => {
    const { result } = renderHook(() => useNotes());

    const noteData = {
      title: "Test Note",
      content: "Test content",
      note_type: "fleeting" as const,
    };

    await waitFor(async () => {
      const createdNote = await result.current.createNote(noteData);
      expect(createdNote.title).toBe("Test Note");
    });
  });

  it("should update an existing note", async () => {
    const { result } = renderHook(() => useNotes());

    const updates = {
      title: "Updated Note",
      content: "Updated content",
    };

    await waitFor(async () => {
      const updatedNote = await result.current.updateNote("1", updates);
      expect(updatedNote.title).toBe("Updated Note");
    });
  });

  it("should delete a note", async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(async () => {
      await expect(result.current.deleteNote("1")).resolves.not.toThrow();
    });
  });

  it("should handle errors when user is not authenticated", async () => {
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

    const { result } = renderHook(() => useNotes());

    await waitFor(async () => {
      await expect(
        result.current.createNote({
          title: "Test",
          content: "Test",
          note_type: "fleeting",
        }),
      ).rejects.toThrow("User not authenticated");
    });
  });

  it("should search notes", async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(async () => {
      const searchResults = await result.current.searchNotes("test query");
      expect(Array.isArray(searchResults)).toBe(true);
    });
  });

  it("should get note backlinks", async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(async () => {
      const backlinks = await result.current.getNoteBacklinks("1");
      expect(Array.isArray(backlinks)).toBe(true);
    });
  });
});
