/**
 * Cross-Platform Protocol Definitions
 * Shared interfaces that can be implemented across web, iOS, and other platforms
 */

// MARK: - Core Data Protocols

/**
 * Base entity protocol that all data models should implement
 */
export interface EntityProtocol {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version?: number;
}

/**
 * Synchronizable entity that can be synced across platforms
 */
export interface SynchronizableProtocol extends EntityProtocol {
  readonly syncStatus: 'pending' | 'synced' | 'error' | 'conflict';
  readonly lastSyncAt?: Date;
  readonly conflictData?: any;
}

/**
 * Searchable entity with full-text search capabilities
 */
export interface SearchableProtocol {
  readonly searchableText: string;
  readonly searchTags: string[];
  readonly searchPriority: number;
}

/**
 * Cacheable entity for offline support
 */
export interface CacheableProtocol {
  readonly cacheKey: string;
  readonly cacheExpiry?: Date;
  readonly cachePriority: 'low' | 'medium' | 'high';
}

// MARK: - Task Management Protocols

/**
 * Base task protocol shared across platforms
 */
export interface TaskProtocol extends EntityProtocol, SynchronizableProtocol, SearchableProtocol {
  readonly title: string;
  readonly description?: string;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly dueDate?: Date;
  readonly completedAt?: Date;
  readonly estimatedDuration?: number; // minutes
  readonly actualDuration?: number; // minutes
  readonly tags: string[];
  readonly parentTaskId?: string;
  readonly subtaskIds: string[];
  readonly projectId?: string;
  readonly assignedUserId?: string;
}

/**
 * Recurring task pattern protocol
 */
export interface RecurrenceProtocol {
  readonly pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  readonly interval: number;
  readonly daysOfWeek?: number[]; // 0-6, Sunday = 0
  readonly endDate?: Date;
  readonly maxOccurrences?: number;
  readonly skipWeekends?: boolean;
}

/**
 * Task template protocol for creating standardized tasks
 */
export interface TaskTemplateProtocol extends EntityProtocol {
  readonly name: string;
  readonly description?: string;
  readonly estimatedDuration?: number;
  readonly priority: TaskProtocol['priority'];
  readonly tags: string[];
  readonly subtaskTemplates: Omit<TaskTemplateProtocol, 'subtaskTemplates'>[];
  readonly category: string;
}

// MARK: - Goal Management Protocols

/**
 * Goal protocol with milestone tracking
 */
export interface GoalProtocol extends EntityProtocol, SynchronizableProtocol, SearchableProtocol {
  readonly title: string;
  readonly description?: string;
  readonly category: 'personal' | 'professional' | 'health' | 'learning' | 'financial' | 'other';
  readonly targetDate: Date;
  readonly currentProgress: number; // 0-100
  readonly milestones: MilestoneProtocol[];
  readonly linkedTaskIds: string[];
  readonly linkedReflectionIds: string[];
  readonly status: 'active' | 'completed' | 'paused' | 'cancelled';
  readonly visibility: 'private' | 'shared' | 'public';
}

/**
 * Milestone protocol for goal tracking
 */
export interface MilestoneProtocol extends EntityProtocol {
  readonly title: string;
  readonly description?: string;
  readonly targetDate: Date;
  readonly completedAt?: Date;
  readonly progressValue: number;
  readonly isCompleted: boolean;
  readonly dependsOnMilestoneIds: string[];
}

// MARK: - Reflection Protocols

/**
 * Reflection entry protocol
 */
export interface ReflectionProtocol extends EntityProtocol, SynchronizableProtocol, SearchableProtocol {
  readonly content: string;
  readonly mood: number; // 1-10
  readonly energy: number; // 1-10
  readonly stress: number; // 1-10
  readonly gratitude?: string[];
  readonly challenges?: string[];
  readonly achievements?: string[];
  readonly learnings?: string[];
  readonly tomorrowFocus?: string[];
  readonly linkedGoalIds: string[];
  readonly linkedTaskIds: string[];
  readonly type: 'daily' | 'weekly' | 'monthly' | 'project' | 'milestone';
}

/**
 * Mood tracking protocol
 */
export interface MoodTrackingProtocol {
  readonly timestamp: Date;
  readonly mood: number; // 1-10
  readonly energy: number; // 1-10
  readonly stress: number; // 1-10
  readonly context?: string;
  readonly triggers?: string[];
  readonly location?: { lat: number; lng: number; name: string };
}

// MARK: - Analytics Protocols

/**
 * Analytics event protocol
 */
export interface AnalyticsEventProtocol {
  readonly eventName: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly sessionId: string;
  readonly properties: Record<string, any>;
  readonly platform: 'web' | 'ios' | 'android' | 'desktop';
  readonly version: string;
}

/**
 * Performance metrics protocol
 */
export interface PerformanceMetricsProtocol {
  readonly timestamp: Date;
  readonly metric: 'app_launch' | 'screen_load' | 'action_response' | 'sync_duration';
  readonly value: number; // milliseconds
  readonly context: Record<string, any>;
  readonly platform: 'web' | 'ios' | 'android' | 'desktop';
}

/**
 * User behavior tracking protocol
 */
export interface BehaviorTrackingProtocol {
  readonly userId: string;
  readonly sessionId: string;
  readonly action: string;
  readonly timestamp: Date;
  readonly context: Record<string, any>;
  readonly duration?: number; // milliseconds
  readonly success: boolean;
  readonly errorDetails?: string;
}

// MARK: - AI Integration Protocols

/**
 * AI provider protocol for multi-provider support
 */
export interface AIProviderProtocol {
  readonly name: string;
  readonly version: string;
  readonly capabilities: ('completion' | 'chat' | 'embedding' | 'analysis')[];
  readonly maxTokens: number;
  readonly supportedModels: string[];
  readonly rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

/**
 * AI conversation protocol
 */
export interface AIConversationProtocol extends EntityProtocol {
  readonly messages: AIMessageProtocol[];
  readonly context: Record<string, any>;
  readonly model: string;
  readonly provider: string;
  readonly totalTokens: number;
  readonly cost?: number;
  readonly tags: string[];
}

/**
 * AI message protocol
 */
export interface AIMessageProtocol {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly tokens: number;
  readonly metadata?: Record<string, any>;
}

/**
 * AI insight protocol
 */
export interface AIInsightProtocol extends EntityProtocol {
  readonly title: string;
  readonly description: string;
  readonly type: 'pattern' | 'recommendation' | 'prediction' | 'analysis';
  readonly confidence: number; // 0-1
  readonly dataSource: string[];
  readonly actionable: boolean;
  readonly implementation?: string[];
  readonly expiresAt?: Date;
}

// MARK: - Synchronization Protocols

/**
 * Sync manager protocol for cross-platform data sync
 */
export interface SyncManagerProtocol {
  readonly isOnline: boolean;
  readonly lastSyncAt?: Date;
  readonly pendingOperations: SyncOperationProtocol[];
  readonly conflictResolutionStrategy: 'client_wins' | 'server_wins' | 'latest_wins' | 'manual';

  sync(): Promise<SyncResultProtocol>;
  queueOperation(operation: SyncOperationProtocol): void;
  resolveConflict(conflictId: string, resolution: any): Promise<void>;
}

/**
 * Sync operation protocol
 */
export interface SyncOperationProtocol {
  readonly id: string;
  readonly type: 'create' | 'update' | 'delete';
  readonly entityType: string;
  readonly entityId: string;
  readonly data: any;
  readonly timestamp: Date;
  readonly retryCount: number;
  readonly maxRetries: number;
}

/**
 * Sync result protocol
 */
export interface SyncResultProtocol {
  readonly success: boolean;
  readonly syncedOperations: string[];
  readonly failedOperations: string[];
  readonly conflicts: SyncConflictProtocol[];
  readonly duration: number; // milliseconds
  readonly timestamp: Date;
}

/**
 * Sync conflict protocol
 */
export interface SyncConflictProtocol {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly clientData: any;
  readonly serverData: any;
  readonly conflictType: 'update_conflict' | 'delete_conflict' | 'create_conflict';
  readonly timestamp: Date;
}

// MARK: - Notification Protocols

/**
 * Notification protocol for cross-platform notifications
 */
export interface NotificationProtocol extends EntityProtocol {
  readonly title: string;
  readonly body: string;
  readonly type: 'reminder' | 'achievement' | 'sync' | 'insight' | 'social' | 'system';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly scheduledFor?: Date;
  readonly deliveredAt?: Date;
  readonly readAt?: Date;
  readonly actionUrl?: string;
  readonly actionData?: Record<string, any>;
  readonly category: string;
  readonly sound?: string;
  readonly badge?: number;
}

/**
 * Push notification service protocol
 */
export interface PushNotificationServiceProtocol {
  readonly isSupported: boolean;
  readonly permission: 'granted' | 'denied' | 'default';
  readonly deviceToken?: string;

  requestPermission(): Promise<'granted' | 'denied' | 'default'>;
  scheduleNotification(notification: NotificationProtocol): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
  getPendingNotifications(): Promise<NotificationProtocol[]>;
}

// MARK: - User Interface Protocols

/**
 * Theme protocol for consistent theming across platforms
 */
export interface ThemeProtocol {
  readonly name: string;
  readonly mode: 'light' | 'dark' | 'auto';
  readonly colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  readonly typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      bold: number;
    };
  };
  readonly spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  readonly borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

/**
 * Accessibility protocol for inclusive design
 */
export interface AccessibilityProtocol {
  readonly isEnabled: boolean;
  readonly voiceOverEnabled: boolean;
  readonly reduceMotionEnabled: boolean;
  readonly highContrastEnabled: boolean;
  readonly largeTextEnabled: boolean;
  readonly preferredFontSize: number;
  readonly preferredLanguage: string;
  readonly screenReaderEnabled: boolean;
}

// MARK: - Storage Protocols

/**
 * Local storage protocol for platform-agnostic storage
 */
export interface LocalStorageProtocol {
  setItem(key: string, value: any): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Secure storage protocol for sensitive data
 */
export interface SecureStorageProtocol {
  setSecureItem(key: string, value: string): Promise<void>;
  getSecureItem(key: string): Promise<string | null>;
  removeSecureItem(key: string): Promise<void>;
  isSupported(): boolean;
}

// MARK: - Export Protocol Information

export const PROTOCOL_CATEGORIES = {
  core: ['EntityProtocol', 'SynchronizableProtocol', 'SearchableProtocol', 'CacheableProtocol'],
  tasks: ['TaskProtocol', 'RecurrenceProtocol', 'TaskTemplateProtocol'],
  goals: ['GoalProtocol', 'MilestoneProtocol'],
  reflections: ['ReflectionProtocol', 'MoodTrackingProtocol'],
  analytics: ['AnalyticsEventProtocol', 'PerformanceMetricsProtocol', 'BehaviorTrackingProtocol'],
  ai: ['AIProviderProtocol', 'AIConversationProtocol', 'AIMessageProtocol', 'AIInsightProtocol'],
  sync: ['SyncManagerProtocol', 'SyncOperationProtocol', 'SyncResultProtocol', 'SyncConflictProtocol'],
  notifications: ['NotificationProtocol', 'PushNotificationServiceProtocol'],
  ui: ['ThemeProtocol', 'AccessibilityProtocol'],
  storage: ['LocalStorageProtocol', 'SecureStorageProtocol']
} as const;

export const PROTOCOL_INFO = {
  version: '1.0.0',
  totalProtocols: Object.values(PROTOCOL_CATEGORIES).flat().length,
  crossPlatformSupport: ['web', 'ios', 'android', 'desktop'],
  compatibilityFeatures: [
    'Type-safe interfaces',
    'Cross-platform data models',
    'Consistent API contracts',
    'Synchronization support',
    'Offline-first design',
    'Accessibility compliance'
  ]
};

/**
 * Get protocol information
 */
export function getProtocolInfo() {
  return {
    categories: PROTOCOL_CATEGORIES,
    info: PROTOCOL_INFO,
    totalProtocols: PROTOCOL_INFO.totalProtocols
  };
}