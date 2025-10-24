/**
 * user Domain Types
 * Business logic types separate from database schema
 */

// Import shared types
import type { TaskEntity } from '../../../shared/types/task.types'
import type { UserEntity } from '../../../shared/types/user.types'

// Re-export shared types for convenience
export type { TaskEntity, UserEntity }

// Domain-specific types can be added here
