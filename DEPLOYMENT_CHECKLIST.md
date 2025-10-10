# Deployment Checklist for Live Testing
# BeProductive v2 - Luna AI Enhanced

## 🎯 Overview

This checklist ensures a successful deployment of the Luna-enhanced BeProductive v2 application to production.

**⚠️ CRITICAL:** Database schema must be updated before deployment. See `LUNA_INTEGRATION_VALIDATION.md` for required migrations.

---

## 🔴 **PRE-DEPLOYMENT (CRITICAL)**

### **1. Database Schema Updates**

**Priority:** 🔴 **CRITICAL - MUST COMPLETE FIRST**

#### **Required SQL Migrations:**

Run these in Supabase SQL Editor in this exact order:

```sql
-- Step 1: Create ai_habit_suggestions table
CREATE TABLE IF NOT EXISTS ai_habit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  suggestion_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  rejected_reason TEXT,
  ai_provider TEXT NOT NULL,
  ai_model TEXT,
  ai_confidence FLOAT DEFAULT 0.0,
  created_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE ai_habit_suggestions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
CREATE POLICY "Users can view their own AI suggestions" ON ai_habit_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI suggestions" ON ai_habit_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI suggestions" ON ai_habit_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own AI suggestions" ON ai_habit_suggestions FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Add habit integration to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES habits(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB;

-- Step 5: Create indexes
CREATE INDEX idx_ai_habit_suggestions_user_id ON ai_habit_suggestions(user_id);
CREATE INDEX idx_ai_habit_suggestions_goal_id ON ai_habit_suggestions(goal_id);
CREATE INDEX idx_tasks_habit_id ON tasks(habit_id) WHERE habit_id IS NOT NULL;

-- Step 6: Create required functions
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role); END; $$;
```

#### **Verification Steps:**

- [ ] **Verify tables exist:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'ai_habit_suggestions';
```

- [ ] **Verify columns added:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name IN ('habit_id', 'auto_generated');
```

- [ ] **Test function:**
```sql
SELECT has_role(auth.uid(), 'user'::user_role);
```

---

## 🟡 **CODE PREPARATION**

### **2. Update TypeScript Types**

**Priority:** 🟡 **HIGH**

- [ ] **Regenerate Supabase types:**
```bash
npx supabase gen types typescript --project-id rymixmuunfjxwryucvxt > src/integrations/supabase/types.ts
```

- [ ] **Verify no TypeScript errors:**
```bash
npm run type-check
```

- [ ] **Test build completion:**
```bash
npm run build
```

### **3. Environment Configuration Validation**

- [ ] **Verify .env.production contains:**
```env
VITE_SUPABASE_PROJECT_ID=rymixmuunfjxwryucvxt
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci... [full key]
VITE_SUPABASE_URL=https://rymixmuunfjxwryucvxt.supabase.co
VITE_ENABLE_AI_FEATURES=true
VITE_LOCAL_MODE=false
NODE_ENV=production
```

- [ ] **Test environment loading:**
```bash
npm run preview
# Visit preview URL and check browser console for Supabase connection
```

---

## 🟢 **DEPLOYMENT PROCESS**

### **4. Lovable Platform Deployment**

**Priority:** 🟢 **READY TO DEPLOY**

#### **Step 1: Upload Files**

Upload these files to Lovable:
- [ ] `LOVABLE_SUPABASE_INTEGRATION.md` (deployment guide)
- [ ] `.env.production` (environment variables)
- [ ] All source code changes

#### **Step 2: Configure Environment**

Copy from `.env.production` to Lovable environment settings:
- [ ] `VITE_SUPABASE_PROJECT_ID`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_ENABLE_AI_FEATURES=true`
- [ ] `VITE_LOCAL_MODE=false`
- [ ] `NODE_ENV=production`

#### **Step 3: Deploy and Test**

- [ ] **Deploy to Lovable**
- [ ] **Wait for build completion**
- [ ] **Access deployed URL**

---

## 🧪 **POST-DEPLOYMENT TESTING**

### **5. Critical Function Tests**

**Priority:** 🔴 **MUST VERIFY BEFORE GO-LIVE**

#### **Authentication Test**
- [ ] **User Registration:** Create new account
- [ ] **User Login:** Login with existing account
- [ ] **Profile Creation:** Verify profile data saves
- [ ] **Session Persistence:** Refresh page, verify still logged in

#### **Database Connection Test**
- [ ] **Open browser console** on deployed app
- [ ] **Run test query:**
```javascript
// Should return data without errors
await window.supabase.from('profiles').select('*').limit(1)
```
- [ ] **Verify no RLS errors**

#### **Luna AI Integration Test**
- [ ] **Open Luna Chat:** Click FAB → Ask Luna
- [ ] **Test Basic Chat:** Send "Hello Luna" → Verify response
- [ ] **Test AI Features:**
  - Create a goal
  - Ask Luna for habit suggestions
  - Verify suggestions save to database
- [ ] **Check Database:** Verify ai_habit_suggestions table has data

#### **Core App Functions Test**
- [ ] **Create Workspace:** Verify workspace creation
- [ ] **Create Goal:** Verify goals save and display
- [ ] **Create Task:** Verify tasks save and display
- [ ] **Create Habit:** Verify habits save and display
- [ ] **Navigation:** Test all tabs (Plan, Capture, Engage)

---

## 🚨 **ROLLBACK PLAN**

### **If Critical Issues Found:**

#### **Immediate Actions:**
1. **Take deployed app offline** (if possible)
2. **Document specific errors** with screenshots
3. **Check browser console** for error messages
4. **Check Supabase logs** for database errors

#### **Common Issues & Fixes:**

**"ai_habit_suggestions table not found"**
- **Solution:** Run database migrations in Supabase SQL Editor
- **Verify:** Check table exists in Supabase dashboard

**"has_role function not found"**
- **Solution:** Create function in Supabase SQL Editor
- **Verify:** Test function call in SQL editor

**"Authentication failed"**
- **Solution:** Check environment variables match exactly
- **Verify:** Test connection in browser console

**"Build failed"**
- **Solution:** Check TypeScript types are updated
- **Verify:** Run `npm run type-check` locally

---

## ✅ **SUCCESS CRITERIA**

### **Deployment is successful when:**

#### **🔴 Critical Requirements (Must Work)**
- [ ] App loads without errors
- [ ] User can register/login
- [ ] Database queries work
- [ ] Luna chat opens and responds
- [ ] AI suggestions can be generated

#### **🟡 Important Features (Should Work)**
- [ ] All navigation tabs functional
- [ ] Goal/task/habit creation works
- [ ] Time tracking functional
- [ ] Mobile responsive design
- [ ] Performance acceptable (<3s load time)

#### **🟢 Nice-to-Have Features (Can Fail)**
- [ ] Advanced AI features
- [ ] Analytics/monitoring
- [ ] Third-party integrations
- [ ] Advanced gamification

---

## 📋 **TESTING SCRIPTS**

### **Quick Browser Console Tests:**

```javascript
// Test 1: Supabase Connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// Test 2: Database Query
try {
  const { data, error } = await window.supabase.from('profiles').select('*').limit(1);
  console.log('Database test:', error ? 'FAILED: ' + error.message : 'SUCCESS');
} catch (e) {
  console.log('Database test: FAILED -', e.message);
}

// Test 3: AI Features Table
try {
  const { data, error } = await window.supabase.from('ai_habit_suggestions').select('*').limit(1);
  console.log('AI table test:', error ? 'FAILED: ' + error.message : 'SUCCESS');
} catch (e) {
  console.log('AI table test: FAILED -', e.message);
}

// Test 4: Authentication
try {
  const { data: { user } } = await window.supabase.auth.getUser();
  console.log('Auth test:', user ? 'LOGGED IN' : 'NOT LOGGED IN');
} catch (e) {
  console.log('Auth test: FAILED -', e.message);
}
```

---

## 📞 **SUPPORT CONTACTS**

### **If Issues Occur:**

**Database Issues:**
- Check Supabase dashboard: https://supabase.com/dashboard/project/rymixmuunfjxwryucvxt
- Review `database-schema-validation.md`

**Deployment Issues:**
- Check Lovable build logs
- Review `LOVABLE_SUPABASE_INTEGRATION.md`

**Environment Issues:**
- Verify all environment variables from `.env.production`
- Review `ENVIRONMENT_SETUP.md`

**Code Issues:**
- Run TypeScript check: `npm run type-check`
- Review `LUNA_INTEGRATION_VALIDATION.md`

---

## 🎯 **FINAL CHECKLIST**

### **Before Going Live:**

- [ ] ✅ Database schema updated and verified
- [ ] ✅ TypeScript types regenerated without errors
- [ ] ✅ Environment variables configured correctly
- [ ] ✅ Code builds without errors
- [ ] ✅ Luna integration tested locally
- [ ] ✅ All critical tests pass in production
- [ ] ✅ Performance acceptable
- [ ] ✅ Mobile responsiveness verified
- [ ] ✅ Authentication flow working
- [ ] ✅ Core features functional

### **Post-Launch Monitoring:**

- [ ] Monitor application logs for errors
- [ ] Check user registration/login success rates
- [ ] Monitor Luna AI usage and errors
- [ ] Track performance metrics
- [ ] Gather user feedback

---

**🚀 When all items are checked, the application is ready for live user testing!**

**📝 Document any issues found and solutions applied for future deployments.**