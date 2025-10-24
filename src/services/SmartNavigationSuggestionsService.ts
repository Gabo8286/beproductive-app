/**
 * Smart Navigation Suggestions Service
 * Provides AI-powered navigation recommendations based on context, workflow state,
 * temporal patterns, and user behavior analytics
 */

import {
  EnhancedNavigationContext,
  NavigationHub,
  NavigationHubId,
  WorkflowState,
  TemporalContext,
  SubNavigationItem,
  QuickAction,
} from '@/types/navigation';

interface NavigationSuggestion {
  id: string;
  type: 'hub' | 'sub-navigation' | 'quick-action' | 'custom';
  title: string;
  description: string;
  hubId?: NavigationHubId;
  path?: string;
  action?: () => void;
  confidence: number; // 0-1 confidence score
  reasoning: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'workflow' | 'temporal' | 'behavioral' | 'contextual' | 'predictive';
}

interface UserBehaviorPattern {
  hubId: NavigationHubId;
  timeOfDay: number; // Hour 0-23
  dayOfWeek: number; // 0-6
  workflowState: WorkflowState;
  frequency: number;
  lastAccessed: Date;
  duration: number; // Average time spent
}

interface SuggestionRule {
  id: string;
  name: string;
  condition: (context: EnhancedNavigationContext, patterns: UserBehaviorPattern[]) => boolean;
  generator: (context: EnhancedNavigationContext, patterns: UserBehaviorPattern[]) => NavigationSuggestion[];
  weight: number;
  enabled: boolean;
}

class SmartNavigationSuggestionsService {
  private behaviorPatterns: UserBehaviorPattern[] = [];
  private suggestionRules: SuggestionRule[] = [];
  private recentSuggestions: NavigationSuggestion[] = [];
  private localStorage_key = 'luna-navigation-behavior-patterns';

  constructor() {
    this.initializeSuggestionRules();
    this.loadBehaviorPatterns();
  }

  /**
   * Initialize built-in suggestion rules
   */
  private initializeSuggestionRules(): void {
    this.suggestionRules = [
      // Morning Planning Rule
      {
        id: 'morning-planning',
        name: 'Morning Planning Workflow',
        condition: (context) => {
          const hour = new Date().getHours();
          return hour >= 7 && hour <= 10 && context.timeContext.dayOfWeek === 'weekday';
        },
        generator: (context) => [
          {
            id: 'morning-planning-1',
            type: 'hub',
            title: 'Start Your Day Planning',
            description: 'Review your schedule and set daily priorities',
            hubId: 'planning-time',
            path: '/app/plan',
            confidence: 0.9,
            reasoning: 'Morning planning is highly effective for productivity',
            priority: 'high',
            category: 'temporal'
          },
          {
            id: 'morning-goals-review',
            type: 'sub-navigation',
            title: 'Review Weekly Goals',
            description: 'Check progress on your weekly objectives',
            hubId: 'planning-time',
            path: '/app/plan/goals',
            confidence: 0.7,
            reasoning: 'Monday morning goal review improves week planning',
            priority: 'medium',
            category: 'temporal'
          }
        ],
        weight: 1.0,
        enabled: true
      },

      // Focus Time Rule
      {
        id: 'focus-time',
        name: 'Deep Work Focus Time',
        condition: (context) => {
          const hour = new Date().getHours();
          return (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
        },
        generator: (context) => [
          {
            id: 'focus-session-start',
            type: 'quick-action',
            title: 'Start Focus Session',
            description: 'Begin a distraction-free work session',
            hubId: 'capture-productivity',
            confidence: 0.8,
            reasoning: 'Peak focus hours identified',
            priority: 'high',
            category: 'temporal',
            action: () => {
              // TODO: Integrate with focus timer
              console.log('Starting focus session...');
            }
          }
        ],
        weight: 0.8,
        enabled: true
      },

      // Workflow Transition Rule
      {
        id: 'workflow-transition',
        name: 'Workflow State Transition',
        condition: (context) => {
          return context.workflowState === 'idle' && context.recentPages.length > 0;
        },
        generator: (context) => {
          const lastPage = context.recentPages[0];
          const suggestions: NavigationSuggestion[] = [];

          if (lastPage.includes('/tasks')) {
            suggestions.push({
              id: 'task-followup',
              type: 'hub',
              title: 'Continue Task Management',
              description: 'Return to your task workflow',
              hubId: 'capture-productivity',
              path: '/app/capture',
              confidence: 0.7,
              reasoning: 'Returning to recently used task management',
              priority: 'medium',
              category: 'behavioral'
            });
          }

          return suggestions;
        },
        weight: 0.6,
        enabled: true
      },

      // Evening Review Rule
      {
        id: 'evening-review',
        name: 'Evening Reflection',
        condition: (context) => {
          const hour = new Date().getHours();
          return hour >= 17 && hour <= 20 && context.timeContext.dayOfWeek === 'weekday';
        },
        generator: (context) => [
          {
            id: 'daily-review',
            type: 'hub',
            title: 'Daily Reflection',
            description: 'Review your accomplishments and plan tomorrow',
            hubId: 'insights-growth',
            path: '/analytics',
            confidence: 0.8,
            reasoning: 'Evening reflection improves learning and planning',
            priority: 'medium',
            category: 'temporal'
          },
          {
            id: 'journal-entry',
            type: 'quick-action',
            title: 'Add Journal Entry',
            description: 'Capture thoughts and learnings from today',
            hubId: 'capture-productivity',
            confidence: 0.6,
            reasoning: 'Journaling supports reflection and growth',
            priority: 'low',
            category: 'temporal',
            action: () => {
              // TODO: Open journal/reflection interface
              console.log('Opening journal...');
            }
          }
        ],
        weight: 0.7,
        enabled: true
      },

      // Collaboration Context Rule
      {
        id: 'collaboration-context',
        name: 'Team Collaboration',
        condition: (context) => {
          return context.workflowState === 'collaborating' ||
                 context.unreadNotifications > 0 ||
                 context.currentPage.includes('/team');
        },
        generator: (context) => [
          {
            id: 'team-check-in',
            type: 'hub',
            title: 'Team Collaboration',
            description: 'Connect with your team and check updates',
            hubId: 'engage-collaboration',
            path: '/app/engage',
            confidence: 0.9,
            reasoning: 'Active collaboration context detected',
            priority: 'high',
            category: 'contextual'
          }
        ],
        weight: 0.9,
        enabled: true
      },

      // Behavioral Pattern Rule
      {
        id: 'behavioral-pattern',
        name: 'Personal Usage Patterns',
        condition: (context, patterns) => {
          return patterns.length > 10; // Enough data for pattern recognition
        },
        generator: (context, patterns) => {
          const now = new Date();
          const currentHour = now.getHours();
          const currentDay = now.getDay();

          // Find patterns that match current time context
          const relevantPatterns = patterns.filter(pattern =>
            Math.abs(pattern.timeOfDay - currentHour) <= 1 &&
            pattern.dayOfWeek === currentDay
          );

          if (relevantPatterns.length === 0) return [];

          // Sort by frequency and recency
          const topPattern = relevantPatterns.sort((a, b) =>
            (b.frequency * 0.7) + (new Date(b.lastAccessed).getTime() * 0.3) -
            ((a.frequency * 0.7) + (new Date(a.lastAccessed).getTime() * 0.3))
          )[0];

          return [{
            id: 'behavioral-suggestion',
            type: 'hub',
            title: `Your Usual ${this.getHubName(topPattern.hubId)}`,
            description: `You typically use ${this.getHubName(topPattern.hubId)} at this time`,
            hubId: topPattern.hubId,
            confidence: Math.min(0.9, topPattern.frequency / 10),
            reasoning: `Based on ${topPattern.frequency} previous uses at this time`,
            priority: 'medium',
            category: 'behavioral'
          }];
        },
        weight: 0.8,
        enabled: true
      }
    ];
  }

  /**
   * Generate smart navigation suggestions based on current context
   */
  public generateSuggestions(context: EnhancedNavigationContext): NavigationSuggestion[] {
    const allSuggestions: NavigationSuggestion[] = [];

    // Apply all enabled suggestion rules
    for (const rule of this.suggestionRules.filter(r => r.enabled)) {
      if (rule.condition(context, this.behaviorPatterns)) {
        const suggestions = rule.generator(context, this.behaviorPatterns);
        allSuggestions.push(...suggestions.map(s => ({
          ...s,
          confidence: s.confidence * rule.weight
        })));
      }
    }

    // Remove duplicates and sort by priority and confidence
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
    const sortedSuggestions = this.prioritizeSuggestions(uniqueSuggestions);

    // Limit to top 5 suggestions
    const finalSuggestions = sortedSuggestions.slice(0, 5);

    // Cache recent suggestions
    this.recentSuggestions = finalSuggestions;

    return finalSuggestions;
  }

  /**
   * Record user navigation behavior for pattern learning
   */
  public recordNavigation(hubId: NavigationHubId, context: EnhancedNavigationContext, duration: number = 0): void {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfWeek = now.getDay();

    // Find existing pattern or create new one
    const existingPatternIndex = this.behaviorPatterns.findIndex(p =>
      p.hubId === hubId &&
      p.timeOfDay === timeOfDay &&
      p.dayOfWeek === dayOfWeek &&
      p.workflowState === context.workflowState
    );

    if (existingPatternIndex >= 0) {
      // Update existing pattern
      const pattern = this.behaviorPatterns[existingPatternIndex];
      pattern.frequency += 1;
      pattern.lastAccessed = now;
      pattern.duration = (pattern.duration + duration) / 2; // Moving average
    } else {
      // Create new pattern
      this.behaviorPatterns.push({
        hubId,
        timeOfDay,
        dayOfWeek,
        workflowState: context.workflowState,
        frequency: 1,
        lastAccessed: now,
        duration
      });
    }

    // Limit pattern storage and clean old patterns
    this.cleanOldPatterns();
    this.saveBehaviorPatterns();
  }

  /**
   * Get predictive suggestions for preloading
   */
  public getPredictiveSuggestions(context: EnhancedNavigationContext): NavigationHubId[] {
    const suggestions = this.generateSuggestions(context);
    return suggestions
      .filter(s => s.type === 'hub' && s.hubId)
      .map(s => s.hubId!)
      .slice(0, 3); // Top 3 for preloading
  }

  /**
   * Remove duplicate suggestions
   */
  private deduplicateSuggestions(suggestions: NavigationSuggestion[]): NavigationSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.type}-${suggestion.hubId || suggestion.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Prioritize suggestions by priority level and confidence
   */
  private prioritizeSuggestions(suggestions: NavigationSuggestion[]): NavigationSuggestion[] {
    const priorityWeights = {
      urgent: 1000,
      high: 100,
      medium: 10,
      low: 1
    };

    return suggestions.sort((a, b) => {
      const aScore = priorityWeights[a.priority] + (a.confidence * 10);
      const bScore = priorityWeights[b.priority] + (b.confidence * 10);
      return bScore - aScore;
    });
  }

  /**
   * Clean old behavior patterns to prevent storage bloat
   */
  private cleanOldPatterns(): void {
    const maxPatterns = 200;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (this.behaviorPatterns.length > maxPatterns) {
      // Keep most frequent patterns
      this.behaviorPatterns.sort((a, b) => b.frequency - a.frequency);
      this.behaviorPatterns = this.behaviorPatterns.slice(0, maxPatterns);
    }

    // Remove patterns older than max age
    const cutoff = new Date(Date.now() - maxAge);
    this.behaviorPatterns = this.behaviorPatterns.filter(p =>
      new Date(p.lastAccessed) > cutoff
    );
  }

  /**
   * Load behavior patterns from localStorage
   */
  private loadBehaviorPatterns(): void {
    try {
      const stored = localStorage.getItem(this.localStorage_key);
      if (stored) {
        this.behaviorPatterns = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load behavior patterns:', error);
      this.behaviorPatterns = [];
    }
  }

  /**
   * Save behavior patterns to localStorage
   */
  private saveBehaviorPatterns(): void {
    try {
      localStorage.setItem(this.localStorage_key, JSON.stringify(this.behaviorPatterns));
    } catch (error) {
      console.error('Failed to save behavior patterns:', error);
    }
  }

  /**
   * Get human-readable hub name
   */
  private getHubName(hubId: NavigationHubId): string {
    const hubNames: Record<NavigationHubId, string> = {
      'capture-productivity': 'Capture & Productivity',
      'planning-time': 'Planning & Time',
      'engage-collaboration': 'Collaboration',
      'profile-user': 'Profile',
      'insights-growth': 'Insights & Growth',
      'advanced-admin': 'Admin Tools',
      'search-assistant': 'Search & Assistant'
    };
    return hubNames[hubId] || hubId;
  }

  /**
   * Add custom suggestion rule
   */
  public addSuggestionRule(rule: SuggestionRule): void {
    this.suggestionRules.push(rule);
  }

  /**
   * Get behavior analytics for insights
   */
  public getBehaviorAnalytics(): {
    totalPatterns: number;
    mostUsedHub: NavigationHubId | null;
    peakHours: number[];
    averageSessionDuration: number;
  } {
    if (this.behaviorPatterns.length === 0) {
      return {
        totalPatterns: 0,
        mostUsedHub: null,
        peakHours: [],
        averageSessionDuration: 0
      };
    }

    // Most used hub
    const hubUsage: Record<NavigationHubId, number> = {} as Record<NavigationHubId, number>;
    let totalDuration = 0;

    this.behaviorPatterns.forEach(pattern => {
      hubUsage[pattern.hubId] = (hubUsage[pattern.hubId] || 0) + pattern.frequency;
      totalDuration += pattern.duration * pattern.frequency;
    });

    const mostUsedHub = Object.entries(hubUsage).reduce((a, b) =>
      hubUsage[a[0] as NavigationHubId] > hubUsage[b[0] as NavigationHubId] ? a : b
    )[0] as NavigationHubId;

    // Peak hours
    const hourUsage: Record<number, number> = {};
    this.behaviorPatterns.forEach(pattern => {
      hourUsage[pattern.timeOfDay] = (hourUsage[pattern.timeOfDay] || 0) + pattern.frequency;
    });

    const peakHours = Object.entries(hourUsage)
      .sort((a, b) => parseInt(b[1].toString()) - parseInt(a[1].toString()))
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      totalPatterns: this.behaviorPatterns.length,
      mostUsedHub,
      peakHours,
      averageSessionDuration: totalDuration / this.behaviorPatterns.reduce((sum, p) => sum + p.frequency, 0)
    };
  }
}

// Export singleton instance
export const smartNavigationSuggestionsService = new SmartNavigationSuggestionsService();
export type { NavigationSuggestion, UserBehaviorPattern, SuggestionRule };