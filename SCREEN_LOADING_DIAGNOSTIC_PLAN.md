# Screen Loading Issues - Comprehensive Diagnostic Plan
## BeProductive v2 Spark Bloom Flow

### 🎯 Purpose
This diagnostic plan provides a systematic approach to identify and resolve screen loading issues in your React/Vite application. As a non-developer using AI tools (Lovable.dev, Claude Code, Grok AI), this guide will help you troubleshoot loading problems methodically.

---

## 🔍 **PHASE 1: IMMEDIATE INVESTIGATION**

### 1.1 Browser Console Check (CRITICAL - Start Here)
**What to do:**
1. Open your browser (Chrome/Firefox/Safari)
2. Press `F12` or right-click → "Inspect" → "Console"
3. Refresh the page that's not loading
4. Look for red error messages

**Common Error Patterns to Look For:**
- `Failed to load resource: the server responded with a status of 404`
- `TypeError: Cannot read property 'X' of undefined`
- `ChunkLoadError: Loading chunk X failed`
- `ReferenceError: X is not defined`
- `Uncaught (in promise)` errors

**Your App Specific Checks:**
- Environment validation errors (VITE_SUPABASE_URL/KEY missing)
- Supabase connection failures
- Authentication timeout errors

### 1.2 Network Tab Analysis
**Steps:**
1. In Developer Tools, click "Network" tab
2. Refresh the page
3. Look for failed requests (red entries)
4. Check if JavaScript bundles are loading (files ending in .js)

**Key Files to Verify Are Loading:**
- `main.tsx` (your app entry point)
- Vendor chunk files (react-vendor, supabase-vendor, etc.)
- CSS files

### 1.3 Quick Environment Check
**Command to run in your terminal:**
```bash
npm run env:validate
```

**If this fails, check your `.env` file has:**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

---

## 🎯 **PHASE 2: SYSTEMATIC ROOT CAUSE ANALYSIS**

### 2.1 Authentication Loop Issues (HIGH PROBABILITY)
**File to check:** `src/contexts/AuthContext.tsx:39-163`

**Symptoms:**
- Page loads briefly then goes white
- Console shows repeated auth state changes
- Infinite loading spinner

**Diagnostic Commands:**
```bash
# Check for auth-related errors
npm run dev
# Watch console for repeated "[AuthContext]" messages
```

**Common Causes in Your App:**
- Supabase session timeout (your code has 10s timeout at line 45)
- Profile fetch failures (5s timeout at line 177)
- Auth state listener not cleaning up properly

### 2.2 Environment Configuration Issues (HIGH PROBABILITY)
**File to check:** `src/utils/environment/validation.ts:21-179`

**Your app has comprehensive environment validation that will show an error page if:**
- VITE_SUPABASE_URL is missing or invalid
- VITE_SUPABASE_PUBLISHABLE_KEY is missing or malformed

**To test:**
```bash
# Validate environment
npm run env:validate:all

# Check specific environment
npm run env:validate:production
```

### 2.3 Build/Deployment Issues (MEDIUM PROBABILITY)
**File to check:** `vite.config.ts:103-213`

**Symptoms:**
- Works in development (`npm run dev`) but not in production
- White screen after deployment
- Console shows 404 errors for JavaScript files

**Your Vite config has specific settings that could cause issues:**
- `build.target: 'es2020'` (line 104) - might not work on older browsers
- Complex chunk splitting (lines 117-177)
- Base path configuration

**Diagnostic Commands:**
```bash
# Test production build locally
npm run build
npm run preview

# Analyze bundle issues
npm run bundle:analyze
```

### 2.4 Lazy Loading Component Issues (MEDIUM PROBABILITY)
**File to check:** `src/App.tsx:32-64`

**Your app uses lazy loading for many components:**
```typescript
const Signup = lazy(() => import("@/pages/Signup"));
const Profile = lazy(() => import("@/pages/Profile"));
// ... many more
```

**Symptoms:**
- Specific routes show white screen
- Loading works for some pages but not others
- Console shows "ChunkLoadError"

**To test:**
```bash
# Check if specific routes are failing
# Navigate to different routes and monitor console
```

### 2.5 React Query/Context Provider Issues (LOW-MEDIUM PROBABILITY)
**File to check:** `src/App.tsx:352-364`

**Your app has multiple context providers:**
- QueryClientProvider
- AuthProvider
- ModulesProvider
- AccessibilityProvider

**If any provider fails to initialize, the entire app won't render.**

---

## 🔧 **PHASE 3: TARGETED DIAGNOSTICS BY CODE SECTION**

### 3.1 Main Entry Point Analysis
**File:** `src/main.tsx:15-209`

**Your app has extensive diagnostic logging. Check for these console messages:**
- `[Main] Starting application initialization...`
- `[Main] Environment validated - rendering React app...`
- `[Main] React app render initiated successfully`

**If you don't see these messages, the issue is in environment validation or React mounting.**

### 3.2 Authentication System Deep Dive
**Files to examine:**
- `src/contexts/AuthContext.tsx` (main auth logic)
- `src/components/auth/ProtectedRoute.tsx` (route protection)

**Debug Commands:**
```javascript
// Run in browser console to check auth state
localStorage.getItem('supabase.auth.token')
```

### 3.3 Routing System Analysis
**File:** `src/App.tsx:106-337`

**Your app uses React Router with protected routes. Issues could be:**
- Infinite redirects between login and protected routes
- Route guard logic failing
- BrowserRouter base path issues

### 3.4 Performance and Loading Analysis
**Files to check:**
- `src/utils/performance/webVitals.ts` (performance monitoring)
- `src/utils/diagnostics/logger.ts` (diagnostic system)

**Commands to run:**
```bash
# Check performance issues
npm run test:performance

# Run diagnostic report
npm run dev
# Check console for diagnostic report
```

---

## 🎯 **PHASE 4: SPECIFIC FILE INVESTIGATION**

### 4.1 Critical Files That Could Cause White Screen

| File | Line Range | Issue Type | Severity |
|------|------------|------------|----------|
| `src/main.tsx` | 27-70 | Environment validation failure | CRITICAL |
| `src/contexts/AuthContext.tsx` | 39-163 | Auth initialization timeout | HIGH |
| `src/components/auth/ProtectedRoute.tsx` | 8-17 | Auth loading state loop | HIGH |
| `src/App.tsx` | 32-64 | Lazy loading chunk errors | MEDIUM |
| `vite.config.ts` | 104, 119-177 | Build target/chunking issues | MEDIUM |

### 4.2 Error Patterns in Your Codebase

**Environment Errors (lines to check):**
- `src/main.tsx:27-70` - Environment validation
- `src/utils/environment/validation.ts:21-69` - Validation logic

**Authentication Errors (lines to check):**
- `src/contexts/AuthContext.tsx:45-65` - Timeout handling
- `src/contexts/AuthContext.tsx:165-212` - Profile fetch
- `src/components/auth/ProtectedRoute.tsx:8-14` - Loading state

**Build/Deployment Errors (lines to check):**
- `vite.config.ts:104` - Build target compatibility
- `vite.config.ts:117-177` - Manual chunk configuration

---

## 🛠️ **PHASE 5: STEP-BY-STEP DEBUGGING PROTOCOL**

### Step 1: Environment Verification (5 minutes)
```bash
# Run these commands in order
npm run env:validate
npm run db:validate
echo "Environment check complete"
```

### Step 2: Development Server Test (3 minutes)
```bash
# Start dev server and check console
npm run dev
# Open http://localhost:8080
# Check browser console for errors
```

### Step 3: Production Build Test (5 minutes)
```bash
# Test production build
npm run build
npm run preview
# Open preview URL and test
```

### Step 4: Authentication Flow Test (3 minutes)
1. Open browser dev tools
2. Go to Application/Storage → Local Storage
3. Clear all Supabase-related entries
4. Refresh page and watch auth flow

### Step 5: Component-Specific Testing (10 minutes)
Test each major route:
- `/` (Index)
- `/login`
- `/dashboard` (requires auth)
- `/goals` (lazy loaded)

### Step 6: Network Analysis (5 minutes)
1. Network tab open
2. Disable cache (important!)
3. Refresh page
4. Look for failed requests

---

## ⚠️ **COMMON ISSUES IN YOUR SPECIFIC CODEBASE**

### Issue #1: Supabase Configuration
**Location:** Environment variables
**Fix:** Ensure `.env` file exists with correct Supabase credentials

### Issue #2: Authentication Timeouts
**Location:** `src/contexts/AuthContext.tsx:45-65`
**Your code has 10s and 15s timeouts - if Supabase is slow, auth fails**

### Issue #3: Safari/Brave Browser Compatibility
**Location:** `vite.config.ts:104`
**Your build target is 'es2020' - might not work on older browsers**

### Issue #4: Lazy Loading Chunk Errors
**Location:** `src/App.tsx:32-64`
**CDN or network issues can prevent lazy-loaded components from loading**

### Issue #5: Complex Provider Chain
**Location:** `src/App.tsx:352-364`
**If any context provider fails, the entire app breaks**

---

## 🎯 **NEXT STEPS FOR NON-DEVELOPERS**

1. **Start with Phase 1** - Check browser console first
2. **Use the diagnostic commands** provided in your package.json
3. **Follow the step-by-step protocol** in Phase 5
4. **Document what you find** using the error patterns guide
5. **Use your AI tools** (Claude Code, Grok) to analyze specific error messages

Your application has excellent diagnostic capabilities built-in. Use them!

---

## 📋 **QUICK CHECKLIST FOR IMMEDIATE ACTION**

- [ ] Open browser dev tools (F12)
- [ ] Check console for red errors
- [ ] Run `npm run env:validate`
- [ ] Verify `.env` file exists and has Supabase credentials
- [ ] Test with `npm run dev`
- [ ] Check network tab for failed requests
- [ ] Clear browser cache and cookies
- [ ] Try different browser (Chrome vs Safari vs Firefox)

**Remember:** Your app has comprehensive error handling and diagnostic logging. When something fails, it will usually tell you exactly what's wrong in the console or on the error page.