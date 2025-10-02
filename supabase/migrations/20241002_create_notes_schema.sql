-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Note',
  content text DEFAULT '',
  note_type text CHECK (note_type IN ('fleeting', 'literature', 'permanent')) DEFAULT 'fleeting',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create note_links table for bidirectional connections
CREATE TABLE IF NOT EXISTS note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  target_note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  link_type text DEFAULT 'reference',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(source_note_id, target_note_id)
);

-- Create note_tags table for organization
CREATE TABLE IF NOT EXISTS note_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(note_id, tag)
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for note_links
CREATE POLICY "Users can view links for their notes" ON note_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM notes WHERE id = source_note_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM notes WHERE id = target_note_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create links for their notes" ON note_links
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM notes WHERE id = source_note_id AND user_id = auth.uid())
    AND
    EXISTS (SELECT 1 FROM notes WHERE id = target_note_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete links for their notes" ON note_links
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM notes WHERE id = source_note_id AND user_id = auth.uid())
  );

-- Create RLS policies for note_tags
CREATE POLICY "Users can view tags for their notes" ON note_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create tags for their notes" ON note_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete tags for their notes" ON note_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_note_type ON notes(note_type);
CREATE INDEX IF NOT EXISTS idx_notes_content_search ON notes USING gin(to_tsvector('english', title || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_note_links_source ON note_links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_target ON note_links(target_note_id);

CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get note backlinks
CREATE OR REPLACE FUNCTION get_note_backlinks(note_uuid uuid)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  note_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.content, n.note_type, n.created_at
  FROM notes n
  INNER JOIN note_links nl ON n.id = nl.source_note_id
  WHERE nl.target_note_id = note_uuid
  AND n.user_id = auth.uid()
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;