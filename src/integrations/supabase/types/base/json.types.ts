/**
 * Base JSON type definitions for Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: AllTables
    Views: AllViews
    Functions: AllFunctions
    Enums: AllEnums
    CompositeTypes: AllCompositeTypes
  }
}

// Re-export from domain-specific modules
export type { AllTables } from './tables.types'
export type { AllViews } from './views.types'
export type { AllFunctions } from './functions.types'
export type { AllEnums } from './enums.types'
export type { AllCompositeTypes } from './composite.types'
