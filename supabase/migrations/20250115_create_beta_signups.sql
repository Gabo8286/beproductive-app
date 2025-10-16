-- Create beta_signups table
CREATE TABLE IF NOT EXISTS public.beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone
CREATE POLICY "Anyone can create beta signups" ON public.beta_signups
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to view beta signups (for admin)
CREATE POLICY "Authenticated users can view beta signups" ON public.beta_signups
    FOR SELECT
    TO authenticated
    USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_beta_signups_email ON public.beta_signups(email);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beta_signups_updated_at
    BEFORE UPDATE ON public.beta_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();