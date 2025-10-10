# Lovable Supabase Integration Guide
# BeProductive v2 - Luna AI Enhanced

## 🎯 Quick Deploy Instructions

### **1. Environment Configuration**

Copy these exact environment variables to your Lovable deployment:

```env
# Production Supabase Configuration
VITE_SUPABASE_PROJECT_ID=rymixmuunfjxwryucvxt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU
VITE_SUPABASE_URL=https://rymixmuunfjxwryucvxt.supabase.co

# Application Configuration
VITE_APP_NAME="BeProductive v2 - Spark Bloom Flow"
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_MOBILE_OPTIMIZATIONS=true
VITE_LOCAL_MODE=false
NODE_ENV=production
```

### **2. Critical Build Settings**

Ensure your build configuration includes:

```json
{
  "build": {
    "outDir": "dist",
    "sourcemap": false,
    "minify": true
  },
  "define": {
    "global": "globalThis"
  }
}
```

### **3. Required Dependencies**

Verify these are in your package.json:

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-react": "^0.4.2",
  "@tanstack/react-query": "^5.0.0"
}
```

---

## 🔒 Database Compatibility Checklist

### **Pre-Deploy Validation**

Run these SQL queries in your Supabase dashboard to verify compatibility:

#### **1. Verify Core Tables Exist**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles', 'user_roles', 'workspaces', 'workspace_members',
  'tasks', 'goals', 'habits', 'ai_habit_suggestions',
  'habit_goal_links', 'habit_entries', 'api_keys'
)
ORDER BY table_name;
```
**Expected:** All 11+ tables present ✅

#### **2. Check AI Features Tables**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_habit_suggestions'
ORDER BY column_name;
```
**Required Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `goal_id` (UUID, references goals)
- `suggested_habit` (TEXT)
- `reasoning` (TEXT)
- `status` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### **3. Verify Enhanced Task Columns**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('habit_id', 'auto_generated', 'scheduled_date')
ORDER BY column_name;
```
**Required:** habit_id (UUID), auto_generated (BOOLEAN), scheduled_date (TIMESTAMPTZ)

---

## 🚀 Luna Integration Components

### **1. Key Files That Must Work**

These components depend on the database structure:

- `src/hooks/useAIHabitSuggestions.ts` → `ai_habit_suggestions` table
- `src/components/luna/chat/LunaChat.tsx` → All AI features
- `src/hooks/useSupabase.ts` → Authentication and queries
- `src/types/supabase.ts` → Database type definitions

### **2. Critical Queries to Test**

After deployment, test these queries work:

```typescript
// 1. AI Habit Suggestions
const { data: suggestions } = await supabase
  .from('ai_habit_suggestions')
  .select('*')
  .eq('user_id', user.id);

// 2. Habit-Linked Tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select(`
    *,
    habits (
      id,
      title,
      frequency
    )
  `)
  .eq('auto_generated', true);

// 3. User Role Check
const { data: role } = await supabase
  .rpc('has_role', {
    _user_id: user.id,
    _role: 'user'
  });
```

---

## ⚡ Quick Test Commands

### **1. Build Test**
```bash
npm run build
npm run preview
```

### **2. Type Check**
```bash
npm run type-check
```

### **3. Supabase Connection Test**
```bash
# In browser console after deploy:
console.log(window.supabase.supabaseUrl);
console.log(window.supabase.supabaseKey);
```

---

## 🔧 Common Issues & Fixes

### **Issue: "ai_habit_suggestions table not found"**
**Solution:**
1. Run this SQL in Supabase dashboard:
```sql
CREATE TABLE IF NOT EXISTS ai_habit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  suggested_habit TEXT NOT NULL,
  reasoning TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_habit_suggestions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own suggestions"
ON ai_habit_suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
ON ai_habit_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### **Issue: "has_role function not found"**
**Solution:**
```sql
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;
```

### **Issue: RLS blocking legitimate access**
**Solution:**
```sql
-- Test user context
SELECT auth.uid(), auth.role();

-- Check existing policies
SELECT * FROM pg_policies
WHERE tablename = 'ai_habit_suggestions';
```

---

## 🎯 Success Criteria

### **Deployment is ready when:**

1. ✅ All environment variables configured
2. ✅ Build completes without errors
3. ✅ Type checking passes
4. ✅ Database connection works
5. ✅ Luna chat opens and responds
6. ✅ AI habit suggestions load
7. ✅ User authentication works
8. ✅ Task creation/editing functions

### **Test User Flow:**
1. **Register/Login** → Should create profile
2. **Create Goal** → Should save to goals table
3. **Open Luna Chat** → Should connect and respond
4. **Ask for habit suggestions** → Should query AI and save to database
5. **Create habit from suggestion** → Should link habit to goal
6. **Generate tasks from habit** → Should create auto_generated tasks

---

## 📞 Emergency Rollback

If deployment fails:

1. **Revert environment variables** to previous working state
2. **Check Supabase dashboard** for any schema changes needed
3. **Run database validation checklist** again
4. **Contact support** with specific error messages

---

## 🔍 Debug Information

### **Useful Supabase Dashboard Queries:**

```sql
-- Check table structure
\d+ ai_habit_suggestions

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'ai_habit_suggestions';

-- Check functions
SELECT proname FROM pg_proc WHERE proname LIKE '%habit%';

-- Check user roles
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### **Browser Console Debug:**
```javascript
// Test Supabase connection
console.log('Supabase client:', window.supabase);

// Test authentication
console.log('User:', await window.supabase.auth.getUser());

// Test database query
console.log('Tables:', await window.supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
);
```

---

## ✅ Final Checklist Before Go-Live

- [ ] Environment variables match production
- [ ] Database schema validated
- [ ] Luna integration tested
- [ ] User authentication working
- [ ] AI features responding
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Error tracking configured

**🚀 Ready for live testing when all items checked!**