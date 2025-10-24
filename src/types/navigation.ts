/**
 * Enhanced Navigation System Types
 * Defines the type system for the new Luna orbital navigation architecture
 */

import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/types/roles';

// Navigation hub identifiers
export type NavigationHubId =
  | 'capture-productivity'
  | 'planning-time'
  | 'engage-collaboration'
  | 'profile-user'
  | 'insights-growth'
  | 'advanced-admin'
  | 'search-assistant';

// Context types for navigation awareness
export type NavigationContext =
  | 'capture'
  | 'plan'
  | 'engage'
  | 'profile'
  | 'insights'
  | 'admin'
  | 'general';

// Time-based context for temporal awareness
export interface TemporalContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  workingHours: boolean;
  upcomingDeadlines: string[];
  scheduleOverview: 'free' | 'busy' | 'focused';
}

// Workflow states for intelligent navigation
export type WorkflowState =
  | 'planning'
  | 'executing'
  | 'reviewing'
  | 'collaborating'
  | 'learning'
  | 'idle';

// Sub-navigation item definition
export interface SubNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  description?: string;
  badge?: string | number;
  shortcut?: string;
  requiredRole?: UserRole[];
  contextRelevance?: number; // 0-1 score for current context
}

// Quick action definition for contextual actions
export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void | Promise<void>;
  color: string;
  shortcut?: string;
  contextRules: ContextRule[];
}

// Context rules for determining when items should appear
export interface ContextRule {
  type: 'path' | 'time' | 'workflow' | 'user-role' | 'data-state';
  condition: string;
  weight: number; // Importance weight 0-1
  operator?: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
}

// Main navigation hub definition
export interface NavigationHub {
  id: NavigationHubId;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
  subNavigation: SubNavigationItem[];
  quickActions: QuickAction[];
  contextRules: ContextRule[];
  requiredRole?: UserRole[];
  customizable: boolean;
  priority: number; // Display order priority
}

// Enhanced navigation context for intelligent decision making
export interface EnhancedNavigationContext {
  currentHub: NavigationHubId | null;
  currentPage: string;
  userRole: UserRole;
  workflowState: WorkflowState;
  timeContext: TemporalContext;
  userPreferences: NavigationPreferences;
  recentPages: string[];
  activeProjects: string[];
  upcomingTasks: number;
  unreadNotifications: number;
}

// User preferences for navigation customization
export interface NavigationPreferences {
  hubOrder: NavigationHubId[];
  favoriteQuickActions: string[];
  hiddenHubs: NavigationHubId[];
  customShortcuts: Record<string, string>;
  animationLevel: 'none' | 'reduced' | 'full';
  hapticFeedback: boolean;
  voiceCommands: boolean;
  autoContextSwitching: boolean;
}

// Interaction pattern types
export type InteractionPattern =
  | 'tap'
  | 'long-press'
  | 'double-tap'
  | 'rotation'
  | 'pinch-in'
  | 'pinch-out'
  | 'swipe'
  | 'voice';

// Gesture configuration
export interface GestureConfig {
  pattern: InteractionPattern;
  duration?: number;
  sensitivity?: number;
  enabled: boolean;
  action: string;
}

// Animation configuration for hub interactions
export interface AnimationConfig {
  type: 'spring' | 'ease' | 'bounce';
  duration: number;
  staggerDelay?: number;
  entrance: 'fade' | 'scale' | 'slide' | 'bounce';
  exit: 'fade' | 'scale' | 'slide' | 'bounce';
}

// Suggested action from AI system
export interface SuggestedAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  action: () => void | Promise<void>;
  confidence: number; // 0-1 AI confidence score
  relevanceScore: number; // 0-1 relevance to current context
  category: 'productivity' | 'planning' | 'collaboration' | 'learning' | 'maintenance';
}

// Navigation state for the registry
export interface NavigationState {
  activeHubs: NavigationHubId[];
  expandedHub: NavigationHubId | null;
  lastInteraction: Date;
  sessionStartTime: Date;
  navigationHistory: NavigationHistoryItem[];
}

// Navigation history tracking
export interface NavigationHistoryItem {
  hubId: NavigationHubId;
  path: string;
  timestamp: Date;
  duration?: number;
  interactionPattern: InteractionPattern;
}

// Progressive disclosure level
export type DisclosureLevel = 'minimal' | 'standard' | 'detailed' | 'expert';

// Progressive disclosure configuration
export interface ProgressiveDisclosureConfig {
  level: DisclosureLevel;
  maxVisibleItems: number;
  showDescriptions: boolean;
  showShortcuts: boolean;
  showBadges: boolean;
  autoExpand: boolean;
}