# BeProductive v2 - Database Setup Instructions for Lovable

## Overview
This document contains all necessary SQL commands and configuration to set up the complete database schema for BeProductive v2 productivity platform.

## Required Tables

### 1. User Profiles Extension
```sql
-- Extend the default auth.users with profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Productivity preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',

  -- User type for persona-based features
  user_type TEXT DEFAULT 'general' CHECK (user_type IN ('executive', 'developer', 'manager', 'freelancer', 'student', 'general')),

  -- Onboarding and assessment
  onboarding_completed BOOLEAN DEFAULT FALSE,
  assessment_completed BOOLEAN DEFAULT FALSE,
  productivity_score INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Goals Management
```sql
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'professional', 'health', 'financial', 'learning', 'relationship')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- e.g., 'kg', 'hours', 'books', '$'

  -- Timeline
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),

  -- Metadata
  tags TEXT[],
  color TEXT DEFAULT '#3b82f6',
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_category ON public.goals(category);
```

### 3. Tasks Management
```sql
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Status and completion
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Scheduling
  due_date TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ,
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes

  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {type: 'daily', interval: 1, days: [1,2,3,4,5]}

  -- Metadata
  tags TEXT[],
  subtasks JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_goal_id ON public.tasks(goal_id);
```

### 4. Habits Tracking
```sql
CREATE TABLE public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'health' CHECK (category IN ('health', 'productivity', 'learning', 'social', 'spiritual', 'creative')),

  -- Tracking configuration
  frequency_type TEXT DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly')),
  target_frequency INTEGER DEFAULT 1, -- times per frequency_type

  -- Current status
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,

  -- Schedule
  reminder_time TIME,
  active_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- days of week (1=Monday)

  -- Metadata
  color TEXT DEFAULT '#10b981',
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit completions tracking
CREATE TABLE public.habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  completed_date DATE NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit completions" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);
```

### 5. Time Tracking
```sql
CREATE TABLE public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,

  description TEXT,
  category TEXT DEFAULT 'work',

  -- Time tracking
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- minutes (calculated)

  -- Project/Client (for freelancers)
  project_name TEXT,
  client_name TEXT,
  hourly_rate NUMERIC(10,2),

  -- Status
  is_billable BOOLEAN DEFAULT FALSE,
  is_billed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own time entries" ON public.time_entries
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);
```

### 6. Notes and Reflections
```sql
CREATE TABLE public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,

  title TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'note' CHECK (type IN ('note', 'reflection', 'journal', 'idea')),

  -- Organization
  category TEXT,
  tags TEXT[],

  -- Metadata
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  word_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);
```

### 7. AI Insights and Analytics
```sql
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL CHECK (type IN ('productivity', 'habits', 'goals', 'time_management', 'wellness')),
  title TEXT NOT NULL,
  description TEXT,
  recommendation TEXT,

  -- Data context
  data_period_start DATE,
  data_period_end DATE,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- User interaction
  is_read BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI insights" ON public.ai_insights
  FOR ALL USING (auth.uid() = user_id);
```

### 8. Widget Configuration
```sql
CREATE TABLE public.user_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  widget_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  configuration JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, widget_type)
);

-- Enable RLS
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own widgets" ON public.user_widgets
  FOR ALL USING (auth.uid() = user_id);
```

## Required Functions

### 1. Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_widgets_updated_at BEFORE UPDATE ON public.user_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto-create profile on user signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Calculate habit streaks
```sql
CREATE OR REPLACE FUNCTION calculate_habit_streak(habit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  completion_date DATE;
  expected_date DATE;
BEGIN
  -- Get the most recent completion date
  SELECT completed_date INTO completion_date
  FROM habit_completions
  WHERE habit_id = habit_uuid
  ORDER BY completed_date DESC
  LIMIT 1;

  IF completion_date IS NULL THEN
    RETURN 0;
  END IF;

  expected_date := CURRENT_DATE;

  -- Count backward from today until we find a gap
  WHILE expected_date >= completion_date LOOP
    IF EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = habit_uuid AND completed_date = expected_date
    ) THEN
      current_streak := current_streak + 1;
      expected_date := expected_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;
```

## Sample Data for Testing

```sql
-- Insert sample user (after auth user is created)
INSERT INTO public.profiles (id, email, name, user_type, theme)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@beproductive.com',
  'Demo User',
  'general',
  'light'
) ON CONFLICT (id) DO NOTHING;

-- Sample goals
INSERT INTO public.goals (user_id, title, description, category, priority, progress, target_date) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Launch BeProductive v2', 'Complete development and launch the productivity platform', 'professional', 'high', 75, '2025-12-31'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Read 24 books this year', 'Improve knowledge through consistent reading', 'learning', 'medium', 50, '2025-12-31'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Exercise 3x per week', 'Maintain physical fitness and health', 'health', 'high', 60, '2025-12-31');

-- Sample habits
INSERT INTO public.habits (user_id, name, description, category, frequency_type, target_frequency) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Daily meditation', '10 minutes of mindfulness practice', 'health', 'daily', 1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Read for 30 minutes', 'Consistent reading habit', 'learning', 'daily', 1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Exercise', 'Physical fitness routine', 'health', 'weekly', 3);

-- Sample tasks
INSERT INTO public.tasks (user_id, title, description, category, priority, status, due_date) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Complete user interface design', 'Finalize the UI components and layouts', 'work', 'high', 'in_progress', NOW() + INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Write API documentation', 'Document all endpoints and data models', 'work', 'medium', 'todo', NOW() + INTERVAL '1 week'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Set up deployment pipeline', 'Configure CI/CD for automated deployment', 'work', 'high', 'todo', NOW() + INTERVAL '5 days');
```

## Environment Variables for Lovable

Make sure these environment variables are configured in Lovable:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. Run all SQL commands in your Supabase dashboard SQL editor
2. Verify all tables are created with proper RLS policies
3. Test authentication flow with the sample data
4. Configure the environment variables in Lovable
5. Deploy and test the complete application

This setup provides a robust foundation for the BeProductive v2 productivity platform with proper data relationships, security policies, and sample data for testing.