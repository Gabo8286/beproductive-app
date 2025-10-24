/**
 * Core Shared Types for Cross-Platform Consistency
 * These types are designed to be mirrored in Swift for iOS consistency
 * All types use JSON-serializable primitives for seamless cross-platform communication
 */

// MARK: - Base Identifiers
export type UUID = string;
export type Timestamp = string; // ISO 8601 string format
export type UserId = UUID;
export type WorkspaceId = UUID;
export type TaskId = UUID;

// MARK: - User & Authentication Types
export type UserRole =
  | 'guest'        // Unauthenticated or demo users
  | 'user'         // Basic authenticated users
  | 'premium'      // Premium subscription users
  | 'team_lead'    // Team leaders with management features
  | 'admin'        // System administrators
  | 'super_admin'  // Super administrators with full access
  | 'enterprise';  // Enterprise users with custom features

export type GuestUserType =
  | 'executive'
  | 'developer'
  | 'pm'
  | 'freelancer'
  | 'student';

export type SubscriptionTier =
  | 'free'
  | 'professional'
  | 'teams'
  | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

// MARK: - Task & Productivity Types
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'cancelled';

export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical';

export type WorkflowState =
  | 'planning'
  | 'executing'
  | 'reviewing'
  | 'collaborating'
  | 'learning'
  | 'idle';

// MARK: - Connection & Device Types
export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'failed'
  | 'unavailable'
  | 'timeout';

export type DeviceType =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'tv'
  | 'watch'
  | 'browser'
  | 'api';

// MARK: - Display & UI Types
export type ThemeMode =
  | 'light'
  | 'dark'
  | 'auto'
  | 'high_contrast';

export type DisplayResolution =
  | 'hd720'    // 1280x720
  | 'hd1080'   // 1920x1080
  | 'uhd4k'    // 3840x2160
  | 'uhd8k';   // 7680x4320

export type NavigationContext =
  | 'capture'
  | 'plan'
  | 'engage'
  | 'profile'
  | 'insights'
  | 'admin'
  | 'general';

// MARK: - Time & Temporal Types
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type DayType = 'weekday' | 'weekend';
export type ScheduleState = 'free' | 'busy' | 'focused' | 'unavailable';

// MARK: - Performance & Analytics Types
export type PerformanceGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'needs_improvement';
export type ConfidenceLevel = number; // 0.0 to 1.0
export type Score = number; // 0.0 to 1.0

// MARK: - Feature & Permission Types
export type FeaturePermission =
  | 'none'         // No access
  | 'read'         // Read-only access
  | 'write'        // Read and write access
  | 'admin'        // Administrative access
  | 'super_admin'; // Super administrative access

export type FeatureCategory =
  | 'core'
  | 'ai'
  | 'analytics'
  | 'collaboration'
  | 'automation'
  | 'integration'
  | 'admin'
  | 'customization'
  | 'api'
  | 'export'
  | 'white_label';

// MARK: - Base Interfaces
export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface BaseProfile extends BaseEntity {
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
}

export interface BaseTask extends BaseEntity {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Timestamp | null;
  estimated_duration: number | null; // in minutes
  actual_duration: number | null; // in minutes
  assigned_to: UserId | null;
  created_by: UserId;
  tags: string[];
  position: number;
  completed_at: Timestamp | null;
}

export interface BaseWorkspace extends BaseEntity {
  name: string;
  description: string | null;
  owner_id: UserId;
  type: 'personal' | 'team' | 'organization';
  is_active: boolean;
}

// MARK: - Temporal Context Interface
export interface TemporalContext {
  timeOfDay: TimeOfDay;
  dayOfWeek: DayType;
  workingHours: boolean;
  upcomingDeadlines: string[];
  scheduleOverview: ScheduleState;
  timezone: string;
}

// MARK: - Device Capabilities Interface
export interface DeviceCapabilities {
  supportsTouch: boolean;
  supportsKeyboard: boolean;
  supportsMouse: boolean;
  supportsVoice: boolean;
  supportsCamera: boolean;
  supportsBiometric: boolean;
  supportsNotifications: boolean;
  maxResolution: DisplayResolution;
  isOnline: boolean;
}

// MARK: - Performance Metrics Interface
export interface PerformanceMetrics {
  score: Score;
  grade: PerformanceGrade;
  confidence: ConfidenceLevel;
  timestamp: Timestamp;
  category: string;
  details?: Record<string, any>;
}

// MARK: - API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Timestamp;
  request_id?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// MARK: - Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
  user_id?: UserId;
  request_id?: string;
}

// MARK: - Utility Types
export type Optional<T> = T | null | undefined;
export type NonNull<T> = T extends null | undefined ? never : T;
export type Partial<T> = { [P in keyof T]?: T[P] };
export type Required<T> = { [P in keyof T]-?: T[P] };

// MARK: - Color & Theme Types
export type ColorScheme = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'indigo';

export interface ThemeConfig {
  colorScheme: ColorScheme;
  accentColor: AccentColor;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
}

// MARK: - Validation & Schema Types
export interface ValidationRule {
  type: 'required' | 'email' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  isValid: boolean;
  errors: string[];
}

// MARK: - Export all types for easy importing
export type * from './core';