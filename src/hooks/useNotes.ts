import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Note, CreateNoteData, UpdateNoteData, NoteLink } from "@/types/notes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = useGamification();

  // Fetch all notes for the current user
  const fetchNotes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch notes";
      setError(errorMessage);
      toast({
        title: "Error loading notes",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific note by ID
  const getNote = async (noteId: string): Promise<Note | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Error fetching note:", err);
      return null;
    }
  };

  // Create a new note
  const createNote = async (noteData: CreateNoteData): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          ...noteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newNote = data as Note;
      setNotes((prev) => [newNote, ...prev]);

      // Process any links in the content
      await processNoteLinks(newNote);

      // Award points for note creation
      try {
        await awardPoints("NOTE_CREATED", newNote.id);
      } catch (error) {
        console.error("Failed to award points for note creation:", error);
      }

      return newNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create note";
      throw new Error(errorMessage);
    }
  };

  // Update an existing note
  const updateNote = async (
    noteId: string,
    updates: UpdateNoteData,
  ): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { data, error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", noteId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedNote = data as Note;
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? updatedNote : note)),
      );

      // Process any links in the updated content
      await processNoteLinks(updatedNote);

      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update note";
      throw new Error(errorMessage);
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== noteId));

      // Note links will be automatically deleted due to CASCADE
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete note";
      throw new Error(errorMessage);
    }
  };

  // Process note links (extract [[Note Title]] patterns and create links)
  const processNoteLinks = async (note: Note) => {
    if (!user) return;

    try {
      // Extract link patterns from content
      const linkRegex = /\[\[(.*?)\]\]/g;
      const matches = [];
      let match;

      while ((match = linkRegex.exec(note.content)) !== null) {
        matches.push(match[1].trim());
      }

      if (matches.length === 0) return;

      // Find existing notes that match the link titles
      const { data: existingNotes, error } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", user.id)
        .in("title", matches);

      if (error) {
        console.error("Error fetching linked notes:", error);
        return;
      }

      // Create links for found notes
      if (existingNotes && existingNotes.length > 0) {
        const linksToCreate = existingNotes
          .filter((linkedNote) => linkedNote.id !== note.id) // Don't link to self
          .map((linkedNote) => ({
            source_note_id: note.id,
            target_note_id: linkedNote.id,
            link_type: "reference",
          }));

        if (linksToCreate.length > 0) {
          // Delete existing links for this note first to avoid duplicates
          await supabase
            .from("note_links")
            .delete()
            .eq("source_note_id", note.id);

          // Insert new links
          const { error: linkError } = await supabase
            .from("note_links")
            .insert(linksToCreate);

          if (linkError) {
            console.error("Error creating note links:", linkError);
          } else {
            // Award points for note linking
            try {
              await awardPoints("NOTE_LINKED", note.id);
            } catch (error) {
              console.error("Failed to award points for note linking:", error);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error processing note links:", err);
    }
  };

  // Get backlinks for a note
  const getNoteBacklinks = async (noteId: string): Promise<Note[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc("get_note_backlinks", {
        note_uuid: noteId,
      });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error fetching backlinks:", err);
      return [];
    }
  };

  // Search notes
  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!user || !query.trim()) return notes;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .textSearch("title,content", query, {
          type: "websearch",
          config: "english",
        })
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error searching notes:", err);
      return notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()),
      );
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchNotes();

    // Subscribe to changes
    const notesSubscription = supabase
      .channel("notes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Notes change received:", payload);

          switch (payload.eventType) {
            case "INSERT":
              setNotes((prev) => {
                const exists = prev.find((note) => note.id === payload.new.id);
                if (exists) return prev;
                return [payload.new as Note, ...prev];
              });
              break;
            case "UPDATE":
              setNotes((prev) =>
                prev.map((note) =>
                  note.id === payload.new.id ? (payload.new as Note) : note,
                ),
              );
              break;
            case "DELETE":
              setNotes((prev) =>
                prev.filter((note) => note.id !== payload.old.id),
              );
              break;
          }
        },
      )
      .subscribe();

    return () => {
      notesSubscription.unsubscribe();
    };
  }, [user]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    getNoteBacklinks,
    searchNotes,
    refetch: fetchNotes,
  };
};
