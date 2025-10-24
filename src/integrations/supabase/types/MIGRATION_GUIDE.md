# Types File Migration Guide

## What Changed

The large `types.ts` file (4,351 lines) has been split into domain-specific modules:

```
src/integrations/supabase/types/
├── index.ts                 # Main export file
├── base/                    # Core Supabase types
│   ├── json.types.ts
│   └── tables.types.ts
├── user/                    # User-related types
├── task/                    # Task-related types
├── goal/                    # Goal-related types
├── habit/                   # Habit-related types
├── project/                 # Project-related types
├── analytics/               # Analytics-related types
└── admin/                   # Admin-related types
```

## Migration Steps

### 1. Update Imports (Automatic)

**Before:**
```typescript
import { Database } from '@/integrations/supabase/types'
```

**After:**
```typescript
import { Database } from '@/integrations/supabase/types'
// Same import path - backward compatibility maintained
```

### 2. Use Domain-Specific Types (Recommended)

```typescript
// Instead of deep imports from Database type
import { UserTables, TaskTables } from '@/integrations/supabase/types'

// Or import specific domains
import { UserEntity } from '@/integrations/supabase/types/user'
import { TaskEntity } from '@/integrations/supabase/types/task'
```

### 3. Manual Extraction Required

The actual table definitions need to be manually extracted from the original file due to the complex nested structure. This involves:

1. Identifying table groups by domain
2. Copying the relevant Row/Insert/Update types
3. Placing them in the appropriate domain files
4. Updating references

### 4. Benefits After Migration

- **Faster IDE Performance**: Smaller files load faster
- **Better Organization**: Types grouped by business domain
- **Easier Maintenance**: Changes isolated to specific domains
- **Reduced Conflicts**: Multiple developers can work on different domains
- **Better Tree Shaking**: Only import types you need

## Rollback Plan

If issues arise, restore from backup:
```bash
cp src/integrations/supabase/types.ts.backup src/integrations/supabase/types.ts
```
