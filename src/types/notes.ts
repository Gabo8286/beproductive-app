import type { Json } from "@/integrations/supabase/types";

export type NoteType = "fleeting" | "literature" | "permanent";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  note_type: NoteType;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface NoteLink {
  id: string;
  source_note_id: string;
  target_note_id: string;
  link_type: string;
  created_at: string;
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag: string;
  created_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  note_type: NoteType;
  metadata?: Json;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  note_type?: NoteType;
  metadata?: Json;
}

export interface NoteWithBacklinks extends Note {
  backlinks?: Note[];
  linked_notes?: Note[];
  tags?: string[];
}

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
}
