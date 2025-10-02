import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNotes } from "@/hooks/useNotes";
import { Note, CreateNoteData, UpdateNoteData } from "@/types/notes";
import { useToast } from "@/hooks/use-toast";

const Notes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    getNote
  } = useNotes();

  const { toast } = useToast();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const noteId = searchParams.get('note');
    const edit = searchParams.get('edit') === 'true';

    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setSelectedNote(note);
        setIsEditing(edit);
      } else {
        // Try to fetch the note if not in current list
        getNote(noteId).then(note => {
          if (note) {
            setSelectedNote(note);
            setIsEditing(edit);
          }
        }).catch(() => {
          toast({
            title: "Note not found",
            description: "The requested note could not be found.",
            variant: "destructive"
          });
          setSearchParams({});
        });
      }
    } else {
      // No noteId in params - creating a new note if edit=true
      setSelectedNote(null);
      setIsEditing(edit);
    }
  }, [searchParams, notes, getNote, toast, setSearchParams]);

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
    setSearchParams({ edit: 'true' });
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setSearchParams({ note: note.id, edit: 'true' });
  };

  const handleSaveNote = async (noteData: CreateNoteData | UpdateNoteData) => {
    try {
      let savedNote: Note;

      if (selectedNote) {
        // Update existing note
        savedNote = await updateNote(selectedNote.id, noteData as UpdateNoteData);
        setSelectedNote(savedNote);
      } else {
        // Create new note
        savedNote = await createNote(noteData as CreateNoteData);
        setSelectedNote(savedNote);
        setSearchParams({ note: savedNote.id, edit: 'true' });
      }
    } catch (error) {
      throw error; // Let NoteEditor handle the error display
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setSelectedNote(null);
      setIsEditing(false);
      setSearchParams({});
    } catch (error) {
      throw error; // Let NoteEditor handle the error display
    }
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setSearchParams({});
  };

  // Render the appropriate view
  if (isEditing) {
    return (
      <div className="h-full">
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={handleCloseEditor}
          onDelete={selectedNote ? handleDeleteNote : undefined}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <NotesGrid
        notes={notes}
        onNoteClick={handleNoteClick}
        onNewNote={handleNewNote}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Notes;