# Database Schema Validation Checklist

## 🎯 Purpose
This checklist ensures that your local Luna integration changes are compatible with the production Supabase database structure.

## ✅ Pre-Deployment Validation

### **1. Core Tables Validation**

#### **Required Tables Must Exist:**
```sql
-- Run these queries in Supabase SQL Editor to verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles', 'user_roles', 'workspaces', 'workspace_members',
  'tasks', 'goals', 'habits', 'ai_habit_suggestions',
  'habit_goal_links', 'habit_entries', 'api_keys'
)
ORDER BY table_name;
```

**Expected Result:** All 11+ tables should be present

#### **AI-Enhanced Features Tables:**
```sql
-- Verify AI-specific tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%ai%' OR table_name LIKE '%suggestion%'
ORDER BY table_name;
```

**Expected Tables:**
- `ai_habit_suggestions` ✅
- `ai_insights` (if exists)
- `ai_recommendations` (if exists)

### **2. Enhanced Task Columns**

```sql
-- Verify new task columns for habit automation
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('habit_id', 'auto_generated', 'scheduled_date', 'recurrence_pattern')
ORDER BY column_name;
```

**Expected Columns:**
- `habit_id` (UUID, nullable) ✅
- `auto_generated` (BOOLEAN, default false) ✅
- `scheduled_date` (TIMESTAMPTZ, nullable) ✅
- `recurrence_pattern` (JSONB, nullable) ✅

### **3. Enum Types Validation**

```sql
-- Check all required enums exist
SELECT typname FROM pg_type
WHERE typtype = 'e'
AND typnamespace = 'public'::regnamespace
AND typname IN (
  'user_role', 'task_status', 'habit_frequency',
  'ai_provider', 'ai_recommendation_status'
)
ORDER BY typname;
```

**Required Enums:**
- `user_role`: 'user', 'team_lead', 'admin', 'super_admin' ✅
- `task_status`: 'todo', 'in_progress', 'blocked', 'done' ✅
- `habit_frequency`: 'daily', 'weekly', 'monthly', 'custom' ✅
- `ai_provider`: 'openai', 'claude', 'gemini', 'lovable' ✅

### **4. Security Functions**

```sql
-- Verify critical security functions exist
SELECT proname, prorettype::regtype
FROM pg_proc
WHERE proname IN (
  'has_role',
  'generate_recurring_tasks_from_habit',
  'award_habit_points'
)
ORDER BY proname;
```

**Required Functions:**
- `has_role(_user_id UUID, _role user_role) RETURNS BOOLEAN` ✅
- `generate_recurring_tasks_from_habit(...)` ✅
- `award_habit_points(...)` ✅

## 🔒 Row-Level Security (RLS) Validation

### **5. RLS Policies Check**

```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

**Expected Result:** Should be EMPTY (all tables should have RLS enabled)

### **6. AI Habit Suggestions Policies**

```sql
-- Check ai_habit_suggestions has proper policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'ai_habit_suggestions'
ORDER BY policyname;
```

**Required Policies:**
- SELECT policy: Users can view their own suggestions ✅
- INSERT policy: Users can create suggestions ✅
- UPDATE policy: Users can update their own suggestions ✅
- DELETE policy: Users can delete their own suggestions ✅

### **7. Super Admin Policies**

```sql
-- Verify super admin policies on sensitive tables
SELECT tablename, policyname
FROM pg_policies
WHERE qual LIKE '%super_admin%'
ORDER BY tablename;
```

**Expected Tables with Super Admin Policies:**
- `api_keys` ✅
- `api_usage_analytics` ✅
- `user_roles` (for role assignment) ✅

## 🔧 Database Functions Testing

### **8. Test Habit Task Generation**

```sql
-- Test function exists and executes (use a test habit ID)
SELECT generate_recurring_tasks_from_habit(
  'test-habit-uuid'::UUID,
  CURRENT_DATE,
  7
);
```

**Expected:** Function should execute without error

### **9. Test Role Checking**

```sql
-- Test role function (use actual user ID)
SELECT has_role(auth.uid(), 'user'::user_role);
```

**Expected:** Should return boolean result

## 📊 Data Integrity Checks

### **10. Foreign Key Relationships**

```sql
-- Verify key relationships exist
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('tasks', 'ai_habit_suggestions', 'habit_goal_links')
ORDER BY tc.table_name;
```

**Expected Relationships:**
- `tasks.habit_id` → `habits.id` ✅
- `ai_habit_suggestions.goal_id` → `goals.id` ✅
- `ai_habit_suggestions.user_id` → `auth.users.id` ✅

### **11. Indexes for Performance**

```sql
-- Check critical indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('tasks', 'ai_habit_suggestions')
AND indexname LIKE '%habit%' OR indexname LIKE '%ai%'
ORDER BY tablename;
```

## 🧪 Luna Integration Testing

### **12. Test AI Habit Suggestions Query**

```typescript
// Test the exact query from useAIHabitSuggestions
const { data, error } = await supabase
  .from('ai_habit_suggestions')
  .select('*')
  .eq('user_id', 'test-user-id')
  .order('created_at', { ascending: false });
```

**Expected:** Query should execute without RLS errors

### **13. Test Task-Habit Linking**

```typescript
// Test habit_id field in tasks
const { data, error } = await supabase
  .from('tasks')
  .select(`
    *,
    habits (
      id,
      title,
      frequency
    )
  `)
  .eq('auto_generated', true)
  .not('habit_id', 'is', null);
```

**Expected:** Query should execute and return tasks with habit relationships

### **14. Test User Role Access**

```typescript
// Test role-based access
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', 'test-user-id');
```

**Expected:** Should return user's roles or appropriate RLS restriction

## 🚨 Security Validation

### **15. Edge Function Security**

Check `supabase/config.toml`:
```toml
[functions.ai-chat]
verify_jwt = true  # ✅ MUST be true, not false
```

### **16. Environment Variables Security**

Verify in Supabase Dashboard > Settings > API:
- `VITE_SUPABASE_URL` matches project URL ✅
- `VITE_SUPABASE_PUBLISHABLE_KEY` is the anon key (not service role) ✅
- Project ID matches `rymixmuunfjxwryucvxt` ✅

## ✅ Validation Results Template

```markdown
## Database Schema Validation Results

**Date:** [YYYY-MM-DD]
**Validated By:** [Name]
**Environment:** [Production/Staging]

### Core Tables
- [ ] All required tables present
- [ ] AI tables exist and accessible
- [ ] Foreign keys properly configured

### Enhanced Features
- [ ] Task table has new columns (habit_id, auto_generated, etc.)
- [ ] AI habit suggestions table accessible
- [ ] All required enums present

### Security
- [ ] RLS enabled on all tables
- [ ] AI habit suggestions policies working
- [ ] Super admin policies active
- [ ] Edge functions have JWT verification

### Functions
- [ ] has_role() function working
- [ ] generate_recurring_tasks_from_habit() function working
- [ ] All database functions accessible

### Luna Integration
- [ ] useAIHabitSuggestions hook works with real database
- [ ] Task-habit linking functional
- [ ] Role-based access working properly

### Issues Found
[List any issues and resolution steps]

### Ready for Deployment
- [ ] All validations passed
- [ ] Environment variables configured
- [ ] Security policies verified
```

## 🔧 Troubleshooting Common Issues

### **Issue: ai_habit_suggestions table not found**
**Solution:**
1. Check if migration was applied: `supabase db push`
2. Verify table exists in production Supabase dashboard
3. Check RLS policies allow access

### **Issue: New task columns missing**
**Solution:**
1. Run ALTER TABLE commands for missing columns
2. Update auto-generated types: Pull from Supabase dashboard
3. Test queries with new columns

### **Issue: has_role() function not found**
**Solution:**
1. Create function with SECURITY DEFINER
2. Set proper search_path
3. Grant execute permissions

### **Issue: RLS blocking legitimate access**
**Solution:**
1. Check policy syntax matches user context
2. Verify auth.uid() returns correct user ID
3. Test policies with actual user accounts

---

**✅ When all items are validated, Luna integration is ready for production deployment!**