# BeProductive v2 - Supabase Database Setup Guide

This guide provides comprehensive instructions for setting up the Supabase database for the BeProductive v2 application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Environment Variables](#environment-variables)
4. [Database Schema Migration](#database-schema-migration)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Required Functions](#required-functions)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Node.js 18+ installed
- Git repository access

## Supabase Project Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New project"
3. Choose your organization
4. Fill in project details:
   - **Name**: BeProductive v2
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 2. Get Project Credentials

Once your project is ready, go to **Settings > API** and copy:

- **Project URL**: `https://[project-id].supabase.co`
- **Project ID**: The project identifier
- **Anon public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key_here

# Optional - for advanced features
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Environment Variable Validation

The application includes automatic environment validation. If variables are missing or invalid, you'll see detailed error messages in the browser console.

## Database Schema Migration

The application includes comprehensive migration files. Apply them in this order:

### 1. Core Schema Setup

```sql
-- Execute in Supabase SQL Editor

-- Core tables migration (profiles, workspaces, workspace_members)
-- Copy and execute: supabase/migrations/20251001232456_b3ac211b-72a6-42a4-9a7c-984870df8da6.sql
```

### 2. Main Entity Tables

Execute these migrations in the Supabase SQL Editor:

#### Tasks Schema
```sql
-- Create tasks table with all required fields
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  estimated_duration integer, -- in minutes
  actual_duration integer, -- in minutes
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  parent_task_id uuid REFERENCES public.tasks(id),
  tags text[] DEFAULT '{}',
  position integer DEFAULT 0,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
```

#### Goals Schema
```sql
-- Create goals table
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  target_date timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create milestones table
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  target_date timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
```

#### Projects Schema
```sql
-- Copy and execute: supabase/migrations/20241002_create_projects_schema.sql
```

#### Habits Schema
```sql
-- Create habits table
CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  frequency_type text DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly')),
  frequency_value integer DEFAULT 1,
  target_days text[] DEFAULT '{}', -- days of week for weekly habits
  streak_count integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create habit_entries table for tracking
CREATE TABLE public.habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  notes text,
  value numeric, -- for quantifiable habits
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;
```

#### Notes Schema
```sql
-- Copy and execute: supabase/migrations/20241002_create_notes_schema.sql
```

#### Gamification Schema
```sql
-- Copy and execute: supabase/migrations/20241002_create_gamification_schema.sql
```

### 3. Advanced Features

#### Time Tracking
```sql
-- Create time entries table
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer, -- in seconds
  is_billable boolean DEFAULT false,
  hourly_rate numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create active timers table
CREATE TABLE public.active_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  time_entry_id uuid REFERENCES public.time_entries(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  is_paused boolean DEFAULT false,
  paused_at timestamptz,
  paused_duration integer DEFAULT 0,
  UNIQUE(user_id) -- Only one active timer per user
);

ALTER TABLE public.active_timers ENABLE ROW LEVEL SECURITY;
```

#### Tags System
```sql
-- Create tags table
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  description text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
```

#### Quick Todos
```sql
-- Create quick_todos table
CREATE TABLE public.quick_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.quick_todos ENABLE ROW LEVEL SECURITY;
```

## Row Level Security (RLS) Policies

Apply these RLS policies to ensure data security:

### Tasks Policies
```sql
-- Tasks policies
CREATE POLICY "Users can view workspace tasks" ON public.tasks
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their workspaces" ON public.tasks
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their workspaces" ON public.tasks
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks they created" ON public.tasks
  FOR DELETE USING (created_by = auth.uid());
```

### Goals Policies
```sql
-- Goals policies
CREATE POLICY "Users can view workspace goals" ON public.goals
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage goals in their workspaces" ON public.goals
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage milestones for accessible goals" ON public.milestones
  FOR ALL USING (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.workspace_members wm ON g.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
```

### Habits Policies
```sql
-- Habits policies
CREATE POLICY "Users can view workspace habits" ON public.habits
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage habits in their workspaces" ON public.habits
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their habit entries" ON public.habit_entries
  FOR ALL USING (
    habit_id IN (
      SELECT h.id FROM public.habits h
      JOIN public.workspace_members wm ON h.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
```

### Time Tracking Policies
```sql
-- Time entries policies
CREATE POLICY "Users can view their time entries" ON public.time_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their time entries" ON public.time_entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their active timers" ON public.active_timers
  FOR ALL USING (user_id = auth.uid());
```

### Tags Policies
```sql
-- Tags policies
CREATE POLICY "Users can view workspace tags" ON public.tags
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tags in their workspaces" ON public.tags
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );
```

### Quick Todos Policies
```sql
-- Quick todos policies
CREATE POLICY "Users can view workspace quick todos" ON public.quick_todos
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage quick todos in their workspaces" ON public.quick_todos
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );
```

## Required Functions

### 1. Automatic Profile Creation
```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Create a default personal workspace
  INSERT INTO public.workspaces (name, description, owner_id)
  VALUES ('Personal Workspace', 'Default workspace for ' || new.email, new.id);

  -- Add user as workspace owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (
    (SELECT id FROM public.workspaces WHERE owner_id = new.id LIMIT 1),
    new.id,
    'owner'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Updated Timestamp Function
```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quick_todos_updated_at
  BEFORE UPDATE ON public.quick_todos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3. Task Status Management
```sql
-- Function to handle task completion
CREATE OR REPLACE FUNCTION public.complete_task(task_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET
    status = 'done',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update habit streaks
CREATE OR REPLACE FUNCTION public.update_habit_streak(habit_id uuid)
RETURNS void AS $$
DECLARE
  last_entry_date date;
  today_date date := CURRENT_DATE;
  current_streak integer;
BEGIN
  -- Get the last entry date
  SELECT DATE(completed_at) INTO last_entry_date
  FROM public.habit_entries
  WHERE habit_id = update_habit_streak.habit_id
  ORDER BY completed_at DESC
  LIMIT 1;

  -- Get current streak
  SELECT streak_count INTO current_streak
  FROM public.habits
  WHERE id = update_habit_streak.habit_id;

  -- Update streak based on entry date
  IF last_entry_date = today_date THEN
    -- Already logged today, no change
    RETURN;
  ELSIF last_entry_date = today_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE public.habits
    SET
      streak_count = current_streak + 1,
      best_streak = GREATEST(best_streak, current_streak + 1),
      updated_at = NOW()
    WHERE id = update_habit_streak.habit_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.habits
    SET
      streak_count = 1,
      updated_at = NOW()
    WHERE id = update_habit_streak.habit_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing the Setup

### 1. Verify Database Connection

In your application, the environment validation will automatically check if:
- Supabase URL is valid
- API key is properly formatted
- Database connection is working

### 2. Test User Authentication

1. Try signing up a new user
2. Verify that:
   - Profile is created automatically
   - Default workspace is created
   - User is added as workspace owner

### 3. Test CRUD Operations

Try creating, reading, updating, and deleting:
- Tasks
- Goals with milestones
- Habits and habit entries
- Time entries
- Quick todos

### 4. Verify RLS Policies

1. Create multiple users
2. Ensure users can only see their own workspace data
3. Test workspace sharing functionality

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in project root
   - Restart development server after changes
   - Check console for validation errors

2. **RLS Policy Errors**
   - Verify policies are created for all tables
   - Check that workspace membership is properly set up
   - Use Supabase dashboard to test policies

3. **Function Execution Errors**
   - Check function syntax in SQL editor
   - Verify trigger creation
   - Test functions manually with sample data

4. **Migration Errors**
   - Apply migrations in correct order
   - Check for foreign key constraint errors
   - Verify table creation before adding relationships

### Useful Supabase SQL Queries

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check user profile creation
SELECT * FROM public.profiles;

-- Check workspace setup
SELECT w.name, wm.role, p.email
FROM public.workspaces w
JOIN public.workspace_members wm ON w.id = wm.workspace_id
JOIN public.profiles p ON wm.user_id = p.id;
```

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Function Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

## Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Run core schema migration
- [ ] Create main entity tables (tasks, goals, habits, etc.)
- [ ] Apply RLS policies
- [ ] Create required functions and triggers
- [ ] Test user authentication flow
- [ ] Verify CRUD operations
- [ ] Test RLS policies with multiple users

Once all items are checked, your BeProductive v2 application should be fully functional with Supabase!