-- Create note_type enum
CREATE TYPE note_type AS ENUM ('fleeting', 'literature', 'permanent');

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type note_type NOT NULL DEFAULT 'fleeting',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create note_links table
CREATE TABLE public.note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'reference',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);

-- Create note_tags table
CREATE TABLE public.note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(note_id, tag)
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for note_links
CREATE POLICY "Users can view links for their notes"
  ON public.note_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_links.source_note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create links for their notes"
  ON public.note_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_links.source_note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links for their notes"
  ON public.note_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_links.source_note_id
      AND notes.user_id = auth.uid()
    )
  );

-- RLS Policies for note_tags
CREATE POLICY "Users can view tags for their notes"
  ON public.note_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for their notes"
  ON public.note_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags for their notes"
  ON public.note_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Function to get note backlinks
CREATE OR REPLACE FUNCTION public.get_note_backlinks(note_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  note_type note_type,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT n.*
  FROM public.notes n
  INNER JOIN public.note_links nl ON n.id = nl.source_note_id
  WHERE nl.target_note_id = note_uuid
  AND n.user_id = auth.uid()
  ORDER BY n.updated_at DESC;
$$;

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_note_type ON public.notes(note_type);
CREATE INDEX idx_note_links_source ON public.note_links(source_note_id);
CREATE INDEX idx_note_links_target ON public.note_links(target_note_id);
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag ON public.note_tags(tag);

-- Trigger for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;