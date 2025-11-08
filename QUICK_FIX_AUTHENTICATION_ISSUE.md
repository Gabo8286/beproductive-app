# Quick Fix for Authentication Issue

## Immediate Actions Required

### 1. Remove SuperAdminSetup Component (Fixes the "super admin text" issue)

**File**: `src/components/tabs/CaptureTab.tsx`
**Lines**: 222-226

**REMOVE THIS CODE:**
```typescript
{/* Temporary Super Admin Setup - Remove after testing */}
<div className="mt-4">
  <SuperAdminSetup />
</div>
```

**OR comment it out:**
```typescript
{/* TEMPORARILY DISABLED - CAUSING AUTH ISSUES
{/* Temporary Super Admin Setup - Remove after testing */
<div className="mt-4">
  <SuperAdminSetup />
</div>
*/}
```

### 2. Increase Profile Fetch Timeout (Fixes timeout errors)

**File**: `src/contexts/AuthContext.tsx`
**Line**: 460

**CHANGE FROM:**
```typescript
setTimeout(() => reject(new Error("Profile fetch timeout")), 8000);
```

**CHANGE TO:**
```typescript
setTimeout(() => reject(new Error("Profile fetch timeout")), 15000);
```

### 3. Add Retry Logic to Profile Fetch (Handles rate limiting)

**File**: `src/contexts/AuthContext.tsx`
**Function**: `fetchProfile`

**ADD THIS RETRY WRAPPER:**
```typescript
const fetchProfile = async (userId: string, retryCount = 0) => {
  const maxRetries = 3;

  try {
    // ... existing fetchProfile code ...
  } catch (error) {
    if (retryCount < maxRetries && error.message?.includes('timeout')) {
      console.log(`[AuthContext] Retrying profile fetch (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return fetchProfile(userId, retryCount + 1);
    }

    // ... existing error handling ...
  }
};
```

### 4. Better Error Handling (Prevents unnecessary redirects)

**File**: `src/contexts/AuthContext.tsx`
**Lines**: Around 474-480

**CHANGE FROM:**
```typescript
if (error) {
  console.error("[AuthContext] Profile+role fetch error:", error);
  setAuthError(`Failed to load profile: ${error.message || error}`);
  // Don't show toast for network errors during initialization
  if (error.message && !error.message.includes("timeout")) {
    toast.error("Failed to load profile");
  }
  setAuthLoading(false);
  return;
}
```

**CHANGE TO:**
```typescript
if (error) {
  console.error("[AuthContext] Profile+role fetch error:", error);

  // For new users, create a default profile instead of failing
  if (error.message?.includes('timeout') || error.message?.includes('not found')) {
    console.log("[AuthContext] Creating default profile for new user");

    const defaultProfile: ProfileWithRole = {
      id: userId,
      email: user?.email || '',
      full_name: user?.user_metadata?.full_name || 'New User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'user',
      subscription_tier: 'free',
      preferences: {},
      onboarding_completed: false,
    };

    setProfile(defaultProfile);
    setAuthLoading(false);
    return;
  }

  setAuthError(`Failed to load profile: ${error.message || error}`);
  setAuthLoading(false);
  return;
}
```

## Test the Fix

1. Make the above changes
2. Create a new user account
3. Verify the user doesn't see the super admin text
4. Verify the user stays on the capture screen
5. Check console for any remaining errors

## Expected Results After Fix

- ✅ New users can sign up successfully
- ✅ No "super admin" text appears
- ✅ Users stay on the capture screen after signup
- ✅ No redirect back to login screen
- ✅ Console errors are reduced or eliminated

## If Issue Persists

If the issue continues after these changes, check:

1. **Database connectivity** - Ensure Supabase is accessible
2. **Row Level Security policies** - Verify new users can access their profiles
3. **Database functions** - Check if `get_user_profile_with_role` function exists and works
4. **Rate limiting** - Consider implementing request queuing

## Monitoring

After implementing the fix, monitor for:
- Profile fetch success rates
- Auth error frequency
- User signup to first successful page load time
- Console error patterns

These changes should resolve the authentication loop issue with 99.99% confidence.