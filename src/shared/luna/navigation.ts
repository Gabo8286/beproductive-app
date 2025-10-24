/**
 * Luna AI Framework - Navigation Module
 * Smart navigation assistance and suggestions powered by Luna AI
 * Cross-platform navigation intelligence
 */

import {
  LunaNavigationSuggestion,
  LunaUserBehaviorPattern,
  LunaContext,
  LunaResult
} from './types';
import { UUID, Score, ConfidenceLevel } from '../types/core';

// MARK: - Navigation Intelligence Engine

export class LunaNavigationEngine {
  private static instance: LunaNavigationEngine;
  private behaviorPatterns: Map<string, LunaUserBehaviorPattern> = new Map();
  private navigationHistory: Array<{ path: string; timestamp: Date; duration?: number }> = [];
  private suggestionRules: NavigationRule[] = [];

  static getInstance(): LunaNavigationEngine {
    if (!LunaNavigationEngine.instance) {
      LunaNavigationEngine.instance = new LunaNavigationEngine();
      LunaNavigationEngine.instance.initializeRules();
    }
    return LunaNavigationEngine.instance;
  }

  private initializeRules(): void {
    this.suggestionRules = [
      new TimeBasedNavigationRule(),
      new WorkflowNavigationRule(),
      new BehavioralNavigationRule(),
      new ContextualNavigationRule(),
      new ProductivityNavigationRule()
    ];
  }

  // MARK: - Public Methods

  async generateNavigationSuggestions(context: LunaContext): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];

    // Apply each rule to generate suggestions
    for (const rule of this.suggestionRules) {
      if (rule.enabled && rule.condition(context, this.getBehaviorPatterns())) {
        const ruleSuggestions = await rule.generate(context, this.getBehaviorPatterns());
        suggestions.push(...ruleSuggestions);
      }
    }

    // Sort by confidence and priority, limit to top 5
    return suggestions
      .sort((a, b) => {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 5);
  }

  recordNavigation(path: string, duration?: number): void {
    const timestamp = new Date();

    this.navigationHistory.push({ path, timestamp, duration });

    // Keep only last 100 navigation records
    if (this.navigationHistory.length > 100) {
      this.navigationHistory.shift();
    }

    // Update behavior patterns
    this.updateBehaviorPatterns(path, timestamp, duration);
  }

  getNavigationInsights(): {
    mostVisited: string[];
    optimalTimes: Record<string, string>;
    recommendations: string[];
  } {
    const pathCounts = new Map<string, number>();
    const timePatterns = new Map<string, number[]>();

    // Analyze navigation history
    for (const record of this.navigationHistory) {
      const path = record.path;
      const hour = record.timestamp.getHours();

      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);

      if (!timePatterns.has(path)) {
        timePatterns.set(path, []);
      }
      timePatterns.get(path)!.push(hour);
    }

    // Get most visited paths
    const mostVisited = Array.from(pathCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path]) => path);

    // Calculate optimal times
    const optimalTimes: Record<string, string> = {};
    for (const [path, hours] of timePatterns) {
      const averageHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
      optimalTimes[path] = this.formatOptimalTime(averageHour);
    }

    // Generate recommendations
    const recommendations = this.generateNavigationRecommendations(pathCounts, timePatterns);

    return { mostVisited, optimalTimes, recommendations };
  }

  // MARK: - Behavior Pattern Management

  private updateBehaviorPatterns(path: string, timestamp: Date, duration?: number): void {
    const patternKey = `${path}-${timestamp.getHours()}-${timestamp.getDay()}`;

    let pattern = this.behaviorPatterns.get(patternKey);
    if (!pattern) {
      pattern = {
        pattern_id: this.generateUUID(),
        user_id: 'current-user', // Would be actual user ID
        context_type: path,
        time_of_day: timestamp.getHours(),
        day_of_week: timestamp.getDay(),
        workflow_state: 'unknown',
        frequency: 0,
        last_accessed: timestamp.toISOString(),
        average_duration: duration || 0,
        success_rate: 1.0
      };
    }

    pattern.frequency++;
    pattern.last_accessed = timestamp.toISOString();

    if (duration) {
      pattern.average_duration = (pattern.average_duration * (pattern.frequency - 1) + duration) / pattern.frequency;
    }

    this.behaviorPatterns.set(patternKey, pattern);
  }

  private getBehaviorPatterns(): LunaUserBehaviorPattern[] {
    return Array.from(this.behaviorPatterns.values());
  }

  private generateNavigationRecommendations(
    pathCounts: Map<string, number>,
    timePatterns: Map<string, number[]>
  ): string[] {
    const recommendations: string[] = [];

    // Suggest bookmarking frequently visited pages
    const topPaths = Array.from(pathCounts.entries())
      .filter(([, count]) => count >= 5)
      .map(([path]) => path);

    if (topPaths.length > 0) {
      recommendations.push(`Consider bookmarking these frequently visited pages: ${topPaths.slice(0, 3).join(', ')}`);
    }

    // Suggest optimal timing
    for (const [path, hours] of timePatterns) {
      if (hours.length >= 3) {
        const variance = this.calculateVariance(hours);
        if (variance < 2) { // Low variance indicates consistent timing
          const avgHour = Math.round(hours.reduce((sum, hour) => sum + hour, 0) / hours.length);
          recommendations.push(`You typically visit ${path} around ${this.formatHour(avgHour)} - consider scheduling related tasks then`);
        }
      }
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  private formatOptimalTime(hour: number): string {
    const roundedHour = Math.round(hour);
    return this.formatHour(roundedHour);
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() ||
           'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
             const r = Math.random() * 16 | 0;
             const v = c === 'x' ? r : (r & 0x3 | 0x8);
             return v.toString(16);
           });
  }
}

// MARK: - Navigation Rule Interface

interface NavigationRule {
  id: string;
  name: string;
  enabled: boolean;
  weight: number;
  condition: (context: LunaContext, patterns: LunaUserBehaviorPattern[]) => boolean;
  generate: (context: LunaContext, patterns: LunaUserBehaviorPattern[]) => Promise<LunaNavigationSuggestion[]>;
}

// MARK: - Navigation Rule Implementations

class TimeBasedNavigationRule implements NavigationRule {
  id = 'time-based-navigation';
  name = 'Time-Based Navigation';
  enabled = true;
  weight = 8;

  condition(context: LunaContext): boolean {
    return !!context.timeOfDay;
  }

  async generate(context: LunaContext): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];
    const timeOfDay = context.timeOfDay || 'morning';

    const timeBasedSuggestions = {
      morning: [
        {
          path: '/tasks',
          title: 'Review Today\'s Tasks',
          description: 'Morning is perfect for planning your day',
          priority: 'high' as const,
          reasoning: 'Studies show morning planning increases productivity by 25%'
        },
        {
          path: '/goals',
          title: 'Check Weekly Goals',
          description: 'Align your daily tasks with bigger objectives',
          priority: 'medium' as const,
          reasoning: 'Morning goal review helps maintain focus on priorities'
        }
      ],
      afternoon: [
        {
          path: '/analytics',
          title: 'Check Progress',
          description: 'Review your productivity metrics',
          priority: 'medium' as const,
          reasoning: 'Afternoon is ideal for progress assessment'
        }
      ],
      evening: [
        {
          path: '/reflections',
          title: 'Daily Reflection',
          description: 'Reflect on today\'s accomplishments',
          priority: 'high' as const,
          reasoning: 'Evening reflection improves next-day performance'
        },
        {
          path: '/planning',
          title: 'Plan Tomorrow',
          description: 'Set up tomorrow for success',
          priority: 'high' as const,
          reasoning: 'Evening planning reduces morning decision fatigue'
        }
      ],
      night: [
        {
          path: '/settings',
          title: 'Adjust Settings',
          description: 'Customize your workspace for tomorrow',
          priority: 'low' as const,
          reasoning: 'Light administrative tasks are suitable for night'
        }
      ]
    };

    const timeSuggestions = timeBasedSuggestions[timeOfDay] || [];

    for (const suggestion of timeSuggestions) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'hub',
        title: suggestion.title,
        description: suggestion.description,
        path: suggestion.path,
        confidence: 0.8,
        reasoning: suggestion.reasoning,
        priority: suggestion.priority,
        category: 'temporal',
        timestamp: new Date().toISOString()
      });
    }

    return suggestions;
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}

class WorkflowNavigationRule implements NavigationRule {
  id = 'workflow-navigation';
  name = 'Workflow-Based Navigation';
  enabled = true;
  weight = 9;

  condition(context: LunaContext): boolean {
    return !!context.workflowState;
  }

  async generate(context: LunaContext): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];
    const workflowState = context.workflowState || 'idle';

    const workflowSuggestions = {
      planning: [
        {
          path: '/projects',
          title: 'Open Project Workspace',
          description: 'Break down your project into actionable tasks',
          priority: 'high' as const
        },
        {
          path: '/calendar',
          title: 'Time Block Tasks',
          description: 'Schedule your planned tasks',
          priority: 'medium' as const
        }
      ],
      executing: [
        {
          path: '/focus',
          title: 'Enter Focus Mode',
          description: 'Minimize distractions for deep work',
          priority: 'high' as const
        },
        {
          path: '/timer',
          title: 'Start Pomodoro Timer',
          description: 'Use time-boxing for better focus',
          priority: 'medium' as const
        }
      ],
      reviewing: [
        {
          path: '/analytics',
          title: 'Review Performance',
          description: 'Analyze your productivity patterns',
          priority: 'high' as const
        },
        {
          path: '/completed',
          title: 'Review Completed Tasks',
          description: 'Celebrate your accomplishments',
          priority: 'medium' as const
        }
      ],
      collaborating: [
        {
          path: '/team',
          title: 'Team Dashboard',
          description: 'Check team progress and updates',
          priority: 'high' as const
        },
        {
          path: '/messages',
          title: 'Team Messages',
          description: 'Respond to team communications',
          priority: 'medium' as const
        }
      ]
    };

    const stateSuggestions = workflowSuggestions[workflowState as keyof typeof workflowSuggestions] || [];

    for (const suggestion of stateSuggestions) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'hub',
        title: suggestion.title,
        description: suggestion.description,
        path: suggestion.path,
        confidence: 0.85,
        reasoning: `Optimized for ${workflowState} workflow state`,
        priority: suggestion.priority,
        category: 'workflow',
        timestamp: new Date().toISOString()
      });
    }

    return suggestions;
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}

class BehavioralNavigationRule implements NavigationRule {
  id = 'behavioral-navigation';
  name = 'Behavioral Pattern Navigation';
  enabled = true;
  weight = 7;

  condition(context: LunaContext, patterns: LunaUserBehaviorPattern[]): boolean {
    return patterns.length > 0;
  }

  async generate(context: LunaContext, patterns: LunaUserBehaviorPattern[]): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Find patterns that match current time
    const relevantPatterns = patterns.filter(pattern =>
      Math.abs(pattern.time_of_day - currentHour) <= 1 &&
      pattern.day_of_week === currentDay &&
      pattern.frequency >= 3
    );

    // Sort by frequency and success rate
    relevantPatterns.sort((a, b) => (b.frequency * b.success_rate) - (a.frequency * a.success_rate));

    for (const pattern of relevantPatterns.slice(0, 2)) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'hub',
        title: `Visit ${this.formatContextType(pattern.context_type)}`,
        description: `You typically access this around this time`,
        path: pattern.context_type,
        confidence: Math.min(0.9, pattern.success_rate + (pattern.frequency * 0.1)),
        reasoning: `Based on ${pattern.frequency} previous visits with ${Math.round(pattern.success_rate * 100)}% success rate`,
        priority: pattern.frequency >= 10 ? 'high' : 'medium',
        category: 'behavioral',
        timestamp: new Date().toISOString()
      });
    }

    return suggestions;
  }

  private formatContextType(contextType: string): string {
    return contextType.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}

class ContextualNavigationRule implements NavigationRule {
  id = 'contextual-navigation';
  name = 'Contextual Navigation';
  enabled = true;
  weight = 6;

  condition(context: LunaContext): boolean {
    return !!context.currentPage;
  }

  async generate(context: LunaContext): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];
    const currentPage = context.currentPage || '';

    // Define related pages for common contexts
    const contextualMappings: Record<string, Array<{ path: string; title: string; description: string; priority: 'high' | 'medium' | 'low' }>> = {
      '/tasks': [
        { path: '/projects', title: 'View Projects', description: 'Organize tasks by project', priority: 'medium' },
        { path: '/calendar', title: 'Schedule Tasks', description: 'Time-block your tasks', priority: 'high' }
      ],
      '/projects': [
        { path: '/tasks', title: 'View All Tasks', description: 'See tasks across projects', priority: 'high' },
        { path: '/team', title: 'Team Collaboration', description: 'Work with your team', priority: 'medium' }
      ],
      '/analytics': [
        { path: '/goals', title: 'Review Goals', description: 'Check goal progress', priority: 'high' },
        { path: '/insights', title: 'AI Insights', description: 'Get productivity recommendations', priority: 'medium' }
      ]
    };

    const contextSuggestions = contextualMappings[currentPage] || [];

    for (const suggestion of contextSuggestions) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'sub-navigation',
        title: suggestion.title,
        description: suggestion.description,
        path: suggestion.path,
        confidence: 0.75,
        reasoning: `Commonly accessed from ${currentPage}`,
        priority: suggestion.priority,
        category: 'contextual',
        timestamp: new Date().toISOString()
      });
    }

    return suggestions;
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}

class ProductivityNavigationRule implements NavigationRule {
  id = 'productivity-navigation';
  name = 'Productivity-Optimized Navigation';
  enabled = true;
  weight = 5;

  condition(): boolean {
    return true; // Always applicable
  }

  async generate(context: LunaContext): Promise<LunaNavigationSuggestion[]> {
    const suggestions: LunaNavigationSuggestion[] = [];
    const currentHour = new Date().getHours();

    // Peak productivity hours (9-11 AM, 2-4 PM)
    const isPeakHour = (currentHour >= 9 && currentHour <= 11) || (currentHour >= 14 && currentHour <= 16);

    if (isPeakHour) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'quick-action',
        title: 'Start Deep Work Session',
        description: 'Your brain is at peak performance right now',
        action: 'start-focus-mode',
        confidence: 0.9,
        reasoning: 'Current time aligns with natural productivity peaks',
        priority: 'high',
        category: 'productivity',
        timestamp: new Date().toISOString()
      });
    }

    // Energy dip hours (1-3 PM)
    if (currentHour >= 13 && currentHour <= 15) {
      suggestions.push({
        id: this.generateUUID(),
        type: 'quick-action',
        title: 'Take an Active Break',
        description: 'Combat the afternoon energy dip',
        action: 'suggest-break',
        confidence: 0.8,
        reasoning: 'Afternoon energy dip is common between 1-3 PM',
        priority: 'medium',
        category: 'productivity',
        timestamp: new Date().toISOString()
      });
    }

    return suggestions;
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}

// MARK: - Export Functions

export const lunaNavigation = LunaNavigationEngine.getInstance();

export async function generateNavigationSuggestions(
  context: LunaContext
): Promise<LunaNavigationSuggestion[]> {
  return lunaNavigation.generateNavigationSuggestions(context);
}

export function recordUserNavigation(path: string, duration?: number): void {
  lunaNavigation.recordNavigation(path, duration);
}

export function getNavigationInsights() {
  return lunaNavigation.getNavigationInsights();
}