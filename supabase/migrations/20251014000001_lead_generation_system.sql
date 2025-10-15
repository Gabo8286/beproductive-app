-- Lead Generation System Migration
-- Creates tables for lead capture, scoring, and content management

-- Create leads table for lead generation assessment
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  role VARCHAR(100),
  team_size VARCHAR(50),
  main_challenge TEXT,
  urgency VARCHAR(50),
  lead_score INTEGER DEFAULT 0,
  dominant_profile VARCHAR(50),
  secondary_profile VARCHAR(50),
  profile_scores JSONB,
  assessment_responses JSONB,
  qualification_responses JSONB,
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(100) DEFAULT 'assessment',
  converted_to_trial BOOLEAN DEFAULT FALSE,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_dominant_profile ON leads(dominant_profile);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Create landing page content table for admin-editable content
CREATE TABLE IF NOT EXISTS landing_page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200),
  subtitle VARCHAR(500),
  content TEXT,
  image_url VARCHAR(500),
  cta_text VARCHAR(100),
  cta_url VARCHAR(200),
  column_layout VARCHAR(20) DEFAULT 'single', -- 'single', 'two-column'
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default team content section
INSERT INTO landing_page_content (section_key, title, subtitle, content, column_layout, sort_order) VALUES
('team-section', 'Meet Our Team', 'The minds behind BeProductive',
'{"left_column": {"title": "Our Mission", "content": "We believe productivity should feel natural, not forced. Our team combines expertise in psychology, technology, and design to create tools that work with your brain, not against it."}, "right_column": {"title": "Our Approach", "content": "Every feature is built on research-backed productivity science. We test with real users to ensure our solutions actually solve the challenges you face every day."}}',
'two-column', 1);

-- Create lead scoring rules table
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name VARCHAR(100) NOT NULL,
  field_value VARCHAR(200) NOT NULL,
  score_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default lead scoring rules
INSERT INTO lead_scoring_rules (field_name, field_value, score_points) VALUES
('role', 'executive', 10),
('role', 'manager', 8),
('role', 'entrepreneur', 9),
('role', 'consultant', 7),
('role', 'individual', 6),
('role', 'student', 3),
('role', 'other', 5),
('team_size', 'large', 10),
('team_size', 'medium', 9),
('team_size', 'small', 7),
('team_size', 'solo', 5),
('urgency', 'critical', 10),
('urgency', 'important', 8),
('urgency', 'moderate', 6),
('urgency', 'exploring', 4);

-- Create email sequences table for automated follow-up
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  personality_type VARCHAR(50),
  sequence_step INTEGER NOT NULL,
  subject_line VARCHAR(200) NOT NULL,
  email_content TEXT NOT NULL,
  delay_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample email sequences for each personality type
INSERT INTO email_sequences (name, personality_type, sequence_step, subject_line, email_content, delay_hours) VALUES
('Strategist Welcome', 'strategist', 1, 'Your Strategic Productivity Plan', 'Welcome to your personalized productivity journey! As a Strategist, you excel at seeing the big picture. Here''s how to turn your vision into action...', 1),
('Strategist Follow-up', 'strategist', 2, 'Are you ready to execute your strategy?', 'Many strategists get stuck in planning mode. BeProductive''s time-boxed planning features help you balance thorough planning with timely execution...', 72),

('Executor Welcome', 'executor', 1, 'Fuel Your Execution Power', 'Ready to amplify your natural execution abilities? As an Executor, you get things done - but BeProductive helps you do it smarter...', 1),
('Executor Follow-up', 'executor', 2, 'Maintain your speed, improve your quality', 'Your execution speed is impressive. Now let''s add quality systems that don''t slow you down...', 72);

-- Create lead activity tracking table
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- 'email_opened', 'link_clicked', 'page_visited', etc.
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for lead activities
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage all leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users can manage leads
CREATE POLICY "Admin users can manage leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create policies for landing page content (public read, admin write)
CREATE POLICY "Anyone can view active landing page content" ON landing_page_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin users can manage landing page content" ON landing_page_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create policies for lead scoring rules (admin only)
CREATE POLICY "Admin users can manage lead scoring rules" ON lead_scoring_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create policies for email sequences (admin only)
CREATE POLICY "Admin users can manage email sequences" ON email_sequences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create policies for lead activities (admin and service role)
CREATE POLICY "Admin users can view lead activities" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage lead activities" ON lead_activities
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_content_updated_at BEFORE UPDATE ON landing_page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_scoring_rules_updated_at BEFORE UPDATE ON lead_scoring_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for lead analytics
CREATE OR REPLACE VIEW lead_analytics AS
SELECT
  dominant_profile,
  COUNT(*) as total_leads,
  AVG(lead_score) as avg_lead_score,
  COUNT(CASE WHEN converted_to_trial THEN 1 END) as trial_conversions,
  COUNT(CASE WHEN converted_to_paid THEN 1 END) as paid_conversions,
  ROUND(
    (COUNT(CASE WHEN converted_to_trial THEN 1 END)::FLOAT / COUNT(*)) * 100,
    2
  ) as trial_conversion_rate,
  ROUND(
    (COUNT(CASE WHEN converted_to_paid THEN 1 END)::FLOAT / COUNT(*)) * 100,
    2
  ) as paid_conversion_rate
FROM leads
WHERE dominant_profile IS NOT NULL
GROUP BY dominant_profile
ORDER BY total_leads DESC;

-- Grant permissions on the view
GRANT SELECT ON lead_analytics TO authenticated;