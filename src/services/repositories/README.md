# Repository Pattern Implementation

This directory implements the Repository Pattern to abstract data access operations and reduce vendor lock-in with Supabase.

## Architecture Overview

```
┌─────────────────────┐
│    React Components │
│      & Hooks        │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Service Hooks     │  ← useTaskService, useGoalService
│  (Business Logic)   │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Repository        │  ← ITaskRepository, IGoalRepository
│   Interfaces        │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Supabase          │  ← SupabaseTaskRepository
│   Implementation    │
└─────────────────────┘
```

## Benefits

1. **Vendor Independence**: Easy to switch from Supabase to other databases
2. **Testability**: Mock repositories for unit testing
3. **Consistency**: Standardized API across all data operations
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Business Logic Separation**: Clear separation between data access and business logic

## Usage Examples

### Before (Direct Supabase)
```typescript
// Old way - directly using Supabase
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active');

if (error) throw error;
```

### After (Repository Pattern)
```typescript
// New way - using repository
import { useTaskService } from '@/services/hooks/useTaskService';

function TaskComponent() {
  const taskService = useTaskService();
  const { data: tasks } = taskService.useUserTasks({ status: 'active' });

  // Clean, type-safe, vendor-agnostic
}
```

## Directory Structure

```
src/services/repositories/
├── interfaces/               # Repository interfaces
│   ├── IBaseRepository.ts    # Common CRUD operations
│   ├── ITaskRepository.ts    # Task-specific operations
│   └── IGoalRepository.ts    # Goal-specific operations
├── supabase/                 # Supabase implementations
│   ├── SupabaseBaseRepository.ts
│   ├── SupabaseTaskRepository.ts
│   └── SupabaseGoalRepository.ts
├── hooks/                    # Service hooks
│   ├── useTaskService.ts     # Task service hook
│   └── useGoalService.ts     # Goal service hook
├── RepositoryFactory.ts      # Factory for creating repositories
└── README.md                 # This file
```

## Creating New Repositories

### 1. Define the Interface
```typescript
// interfaces/IUserRepository.ts
export interface IUserRepository extends IUserScopedRepository<User, UserInsert, UserUpdate> {
  findByEmail(email: string): Promise<User | null>;
  updateProfile(userId: string, profile: ProfileUpdate): Promise<User>;
}
```

### 2. Implement Supabase Version
```typescript
// supabase/SupabaseUserRepository.ts
export class SupabaseUserRepository
  extends SupabaseUserScopedRepository<User, UserInsert, UserUpdate>
  implements IUserRepository {

  async findByEmail(email: string): Promise<User | null> {
    // Implementation
  }
}
```

### 3. Add to Factory
```typescript
// RepositoryFactory.ts
createUserRepository(): IUserRepository {
  return new SupabaseUserRepository(this.client);
}
```

### 4. Create Service Hook
```typescript
// hooks/useUserService.ts
export function useUserService() {
  const repositoryManager = getRepositoryManager(supabase);
  const userRepository = repositoryManager.getUserRepository();

  // Hook implementation
}
```

## Migration Guide

### Step 1: Identify Direct Supabase Usage
```bash
# Find files with direct Supabase calls
grep -r "supabase\.from\|\.select\|\.insert" src/hooks/
```

### Step 2: Create Repository Interface
Define the operations needed for your entity.

### Step 3: Implement Repository
Create Supabase implementation of your interface.

### Step 4: Create Service Hook
Wrap repository with React Query hooks.

### Step 5: Update Components
Replace direct Supabase usage with service hooks.

### Step 6: Add Tests
Create unit tests with mock repositories.

## Testing with Mock Repositories

```typescript
// tests/mocks/MockTaskRepository.ts
export class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  async findByUserId(userId: string): Promise<Task[]> {
    return this.tasks.filter(task => task.user_id === userId);
  }

  async create(data: TaskInsert): Promise<Task> {
    const task = { ...data, id: 'mock-id', created_at: new Date().toISOString() };
    this.tasks.push(task);
    return task;
  }

  // ... other methods
}
```

## Real-time Subscriptions

The repository pattern maintains Supabase's real-time capabilities:

```typescript
// Repositories automatically handle real-time updates
const taskService = useTaskService();
const { data: tasks } = taskService.useUserTasks(); // Automatically updates on changes
```

## Performance Considerations

- **Singleton Pattern**: Repository instances are cached
- **Query Deduplication**: React Query handles duplicate requests
- **Real-time Updates**: Efficient subscriptions with automatic cleanup
- **Type Safety**: No runtime type checking overhead

## Future Database Migrations

To switch from Supabase to another database:

1. Implement new repository classes (e.g., `PostgresTaskRepository`)
2. Update `RepositoryFactory` to use new implementations
3. No changes needed in components or service hooks!

```typescript
// Easy to switch implementations
createTaskRepository(): ITaskRepository {
  // return new SupabaseTaskRepository(this.client);     // Old
  return new PostgresTaskRepository(this.pgClient);      // New
}
```