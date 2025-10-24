/**
 * Supabase Types Index
 *
 * Centralized export for all Supabase type definitions
 * Split into domain-specific modules for better maintainability
 */

// Base types
export type { Json, Database } from './base/json.types'

// Domain-specific types
export * from './user'
export * from './task'
export * from './goal'
export * from './habit'
export * from './project'
export * from './analytics'
export * from './admin'

// Legacy export for backward compatibility
export type { Database as DatabaseLegacy } from './base/json.types'
