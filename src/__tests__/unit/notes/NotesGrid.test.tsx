import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { Note } from "@/types/notes";

const mockNotes: Note[] = [
  {
    id: "1",
    user_id: "user1",
    title: "Test Note 1",
    content: "This is a test note content",
    note_type: "fleeting",
    metadata: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user1",
    title: "Test Note 2",
    content: "Another test note with [[linked content]]",
    note_type: "permanent",
    metadata: {},
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
];

describe("NotesGrid", () => {
  const mockOnNoteClick = vi.fn();
  const mockOnNewNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no notes", () => {
    render(
      <NotesGrid
        notes={[]}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    expect(
      screen.getByText("Start Your Knowledge Journey"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create Your First Note")).toBeInTheDocument();
  });

  it("renders notes grid with notes", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    expect(screen.getByText("Knowledge Notes")).toBeInTheDocument();
    expect(screen.getByText("Test Note 1")).toBeInTheDocument();
    expect(screen.getByText("Test Note 2")).toBeInTheDocument();
  });

  it("displays note types correctly", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    expect(screen.getByText("fleeting")).toBeInTheDocument();
    expect(screen.getByText("permanent")).toBeInTheDocument();
  });

  it("shows linked indicator for notes with links", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    // Should show "Linked" for the note with [[linked content]]
    expect(screen.getByText("Linked")).toBeInTheDocument();
  });

  it("calls onNoteClick when note is clicked", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    const noteCard = screen
      .getByText("Test Note 1")
      .closest(
        '[role="button"], [tabindex], button, [onclick], .cursor-pointer',
      );
    expect(noteCard).toBeInTheDocument();

    if (noteCard) {
      fireEvent.click(noteCard);
      expect(mockOnNoteClick).toHaveBeenCalledWith(mockNotes[0]);
    }
  });

  it("calls onNewNote when new note button is clicked", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    const newNoteButton = screen.getByText("New Note");
    fireEvent.click(newNoteButton);
    expect(mockOnNewNote).toHaveBeenCalled();
  });

  it("filters notes by search query", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Search notes...");
    fireEvent.change(searchInput, { target: { value: "Test Note 1" } });

    expect(screen.getByText("Test Note 1")).toBeInTheDocument();
    expect(screen.queryByText("Test Note 2")).not.toBeInTheDocument();
  });

  it("filters notes by type", () => {
    render(
      <NotesGrid
        notes={mockNotes}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
      />,
    );

    const filterSelect = screen.getByRole("combobox");
    fireEvent.click(filterSelect);

    const permanentOption = screen.getByText("Permanent");
    fireEvent.click(permanentOption);

    expect(screen.queryByText("Test Note 1")).not.toBeInTheDocument();
    expect(screen.getByText("Test Note 2")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <NotesGrid
        notes={[]}
        onNoteClick={mockOnNoteClick}
        onNewNote={mockOnNewNote}
        isLoading={true}
      />,
    );

    // Should show loading skeleton
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
