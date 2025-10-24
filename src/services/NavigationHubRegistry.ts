/**
 * Navigation Hub Registry
 * Central management system for navigation hubs, context awareness, and intelligent navigation
 */

import {
  NavigationHub,
  NavigationHubId,
  EnhancedNavigationContext,
  NavigationState,
  ContextRule,
  SubNavigationItem,
  QuickAction,
  UserRole,
  SuggestedAction,
  ProgressiveDisclosureConfig,
  DisclosureLevel,
} from '@/types/navigation';
import { getNavigationHubDefinitions } from '@/config/navigationHubs';

class NavigationHubRegistry {
  private hubs: Map<NavigationHubId, NavigationHub> = new Map();
  private context: EnhancedNavigationContext | null = null;
  private state: NavigationState;
  private observers: ((state: NavigationState) => void)[] = [];

  constructor() {
    this.state = {
      activeHubs: [],
      expandedHub: null,
      lastInteraction: new Date(),
      sessionStartTime: new Date(),
      navigationHistory: [],
    };
    this.initializeHubs();
  }

  /**
   * Initialize all navigation hubs from configuration
   */
  private initializeHubs(): void {
    const hubDefinitions = getNavigationHubDefinitions();
    hubDefinitions.forEach(hub => {
      this.hubs.set(hub.id, hub);
    });
  }

  /**
   * Register a new navigation hub
   */
  registerHub(hub: NavigationHub): void {
    this.hubs.set(hub.id, hub);
    this.notifyObservers();
  }

  /**
   * Update the current navigation context
   */
  updateContext(context: EnhancedNavigationContext): void {
    this.context = context;
    this.updateActiveHubs();
    this.notifyObservers();
  }

  /**
   * Get all registered hubs
   */
  getAllHubs(): NavigationHub[] {
    return Array.from(this.hubs.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get active hubs based on current context with temporal awareness
   */
  getActiveHubs(): NavigationHub[] {
    if (!this.context) {
      return this.getAllHubs().slice(0, 6); // Default to first 6 hubs
    }

    return this.getAllHubs()
      .filter(hub => this.isHubRelevant(hub, this.context!))
      .sort((a, b) => this.compareHubRelevanceWithTemporal(a, b, this.context!))
      .slice(0, this.getMaxVisibleHubs());
  }

  /**
   * Get a specific hub by ID
   */
  getHub(hubId: NavigationHubId): NavigationHub | null {
    return this.hubs.get(hubId) || null;
  }

  /**
   * Get hub by current context/path
   */
  getHubByContext(path: string): NavigationHub | null {
    for (const hub of this.hubs.values()) {
      if (this.pathMatchesHub(path, hub)) {
        return hub;
      }
    }
    return null;
  }

  /**
   * Get relevant sub-navigation items for a hub
   */
  getRelevantSubNavigation(hubId: NavigationHubId): SubNavigationItem[] {
    const hub = this.getHub(hubId);
    if (!hub || !this.context) {
      return hub?.subNavigation || [];
    }

    return hub.subNavigation
      .filter(item => this.isSubNavigationRelevant(item, this.context!))
      .sort((a, b) => (b.contextRelevance || 0) - (a.contextRelevance || 0));
  }

  /**
   * Get contextual quick actions for a hub
   */
  getContextualQuickActions(hubId: NavigationHubId): QuickAction[] {
    const hub = this.getHub(hubId);
    if (!hub || !this.context) {
      return hub?.quickActions || [];
    }

    return hub.quickActions.filter(action =>
      this.evaluateContextRules(action.contextRules, this.context!)
    );
  }

  /**
   * Get AI-powered suggested actions
   */
  getSuggestedActions(): SuggestedAction[] {
    if (!this.context) return [];

    // This would integrate with AI service in real implementation
    // For now, return contextual suggestions based on current state
    return this.generateContextualSuggestions();
  }

  /**
   * Expand a navigation hub
   */
  expandHub(hubId: NavigationHubId): void {
    this.state.expandedHub = hubId;
    this.state.lastInteraction = new Date();
    this.addToHistory(hubId, 'long-press');
    this.notifyObservers();
  }

  /**
   * Collapse expanded hub
   */
  collapseHub(): void {
    this.state.expandedHub = null;
    this.state.lastInteraction = new Date();
    this.notifyObservers();
  }

  /**
   * Get progressive disclosure configuration
   */
  getDisclosureConfig(): ProgressiveDisclosureConfig {
    if (!this.context) {
      return this.getDefaultDisclosureConfig();
    }

    const level = this.determineDisclosureLevel();
    return {
      level,
      maxVisibleItems: this.getMaxItemsForLevel(level),
      showDescriptions: level !== 'minimal',
      showShortcuts: level === 'detailed' || level === 'expert',
      showBadges: true,
      autoExpand: level === 'expert',
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(observer: (state: NavigationState) => void): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  /**
   * Get navigation analytics/metrics
   */
  getNavigationMetrics() {
    return {
      totalInteractions: this.state.navigationHistory.length,
      sessionDuration: Date.now() - this.state.sessionStartTime.getTime(),
      mostUsedHub: this.getMostUsedHub(),
      averageSessionTime: this.getAverageSessionTime(),
      hubEfficiency: this.getHubEfficiency(),
    };
  }

  // Private helper methods

  private updateActiveHubs(): void {
    if (!this.context) return;

    const relevantHubs = this.getAllHubs()
      .filter(hub => this.isHubRelevant(hub, this.context!))
      .map(hub => hub.id);

    this.state.activeHubs = relevantHubs;
  }

  private isHubRelevant(hub: NavigationHub, context: EnhancedNavigationContext): boolean {
    // Check role requirements
    if (hub.requiredRole && !hub.requiredRole.includes(context.userRole)) {
      return false;
    }

    // Check if hub is hidden in user preferences
    if (context.userPreferences.hiddenHubs.includes(hub.id)) {
      return false;
    }

    // Evaluate context rules
    if (hub.contextRules.length > 0) {
      return this.evaluateContextRules(hub.contextRules, context);
    }

    return true;
  }

  private isSubNavigationRelevant(item: SubNavigationItem, context: EnhancedNavigationContext): boolean {
    // Check role requirements
    if (item.requiredRole && !item.requiredRole.some(role => role === context.userRole)) {
      return false;
    }

    // Calculate contextual relevance
    if (item.contextRelevance !== undefined) {
      return item.contextRelevance > 0.3; // Threshold for relevance
    }

    return true;
  }

  private evaluateContextRules(rules: ContextRule[], context: EnhancedNavigationContext): boolean {
    if (rules.length === 0) return true;

    let totalWeight = 0;
    let passedWeight = 0;

    for (const rule of rules) {
      totalWeight += rule.weight;

      if (this.evaluateContextRule(rule, context)) {
        passedWeight += rule.weight;
      }
    }

    // Require at least 60% of weighted rules to pass
    return (passedWeight / totalWeight) >= 0.6;
  }

  private evaluateContextRule(rule: ContextRule, context: EnhancedNavigationContext): boolean {
    switch (rule.type) {
      case 'path':
        return this.evaluatePathRule(rule, context.currentPage);
      case 'time':
        return this.evaluateTimeRule(rule, context.timeContext);
      case 'workflow':
        return this.evaluateWorkflowRule(rule, context.workflowState);
      case 'user-role':
        return this.evaluateUserRoleRule(rule, context.userRole);
      case 'data-state':
        return this.evaluateDataStateRule(rule, context);
      default:
        return false;
    }
  }

  private evaluatePathRule(rule: ContextRule, currentPage: string): boolean {
    const operator = rule.operator || 'contains';
    switch (operator) {
      case 'equals':
        return currentPage === rule.condition;
      case 'contains':
        return currentPage.includes(rule.condition);
      default:
        return false;
    }
  }

  private evaluateTimeRule(rule: ContextRule, timeContext: any): boolean {
    // Implementation for time-based rules
    return true; // Placeholder
  }

  private evaluateWorkflowRule(rule: ContextRule, workflowState: any): boolean {
    // Implementation for workflow-based rules
    return true; // Placeholder
  }

  private evaluateUserRoleRule(rule: ContextRule, userRole: UserRole): boolean {
    return rule.condition === userRole;
  }

  private evaluateDataStateRule(rule: ContextRule, context: EnhancedNavigationContext): boolean {
    // Implementation for data state rules (e.g., unread notifications, pending tasks)
    return true; // Placeholder
  }

  private pathMatchesHub(path: string, hub: NavigationHub): boolean {
    return path.startsWith(hub.path) ||
           hub.subNavigation.some(item => path.startsWith(item.path));
  }

  private getMaxVisibleHubs(): number {
    if (!this.context) return 6;

    // Adjust visible hubs based on time context and working hours
    if (this.context.timeContext.workingHours) {
      return 6; // Show more during work hours
    }
    return 4; // Fewer during off-hours for simplicity
  }

  /**
   * Compare hub relevance for sorting with enhanced temporal awareness
   */
  private compareHubRelevanceWithTemporal(
    hubA: NavigationHub,
    hubB: NavigationHub,
    context: EnhancedNavigationContext
  ): number {
    const scoreA = this.calculateHubRelevanceScore(hubA, context) + this.calculateTemporalScore(hubA, context);
    const scoreB = this.calculateHubRelevanceScore(hubB, context) + this.calculateTemporalScore(hubB, context);

    // Higher scores come first
    return scoreB - scoreA;
  }

  /**
   * Calculate basic hub relevance score
   */
  private calculateHubRelevanceScore(hub: NavigationHub, context: EnhancedNavigationContext): number {
    let score = hub.priority || 5; // Base priority score

    // Current hub gets boost
    if (context.currentHub === hub.id) {
      score += 3;
    }

    // Recent usage boost
    if (context.recentPages.some(page => page.includes(hub.path))) {
      score += 2;
    }

    // Role-based relevance
    if (hub.requiredRole && hub.requiredRole.includes(context.userRole)) {
      score += 1;
    }

    return score;
  }

  /**
   * Calculate temporal relevance score based on time context
   */
  private calculateTemporalScore(hub: NavigationHub, context: EnhancedNavigationContext): number {
    const currentHour = new Date().getHours();
    const dayType = context.timeContext.dayOfWeek;
    const workingHours = context.timeContext.workingHours;
    let temporalScore = 0;

    // Time-based hub prioritization rules
    switch (hub.id) {
      case 'planning-time':
        // Planning is most relevant in mornings (7-11 AM) and Sunday evenings
        if ((currentHour >= 7 && currentHour <= 11) ||
            (dayType === 'weekend' && currentHour >= 18 && currentHour <= 21)) {
          temporalScore += 3;
        }
        // Secondary relevance on Monday mornings
        if (new Date().getDay() === 1 && currentHour >= 8 && currentHour <= 10) {
          temporalScore += 2;
        }
        break;

      case 'capture-productivity':
        // Productivity peaks during work hours with focus periods
        if (workingHours) {
          temporalScore += 2;
          // Extra boost during peak focus hours
          if ((currentHour >= 9 && currentHour <= 11) ||
              (currentHour >= 14 && currentHour <= 16)) {
            temporalScore += 2;
          }
        }
        break;

      case 'engage-collaboration':
        // Collaboration is most relevant during standard business hours
        if (workingHours && currentHour >= 10 && currentHour <= 16) {
          temporalScore += 2;
        }
        // Reduced relevance early morning or late evening
        if (currentHour < 8 || currentHour > 18) {
          temporalScore -= 1;
        }
        break;

      case 'insights-growth':
        // Reflection and analysis work best in evenings and weekends
        if ((currentHour >= 17 && currentHour <= 20) || dayType === 'weekend') {
          temporalScore += 2;
        }
        // Friday afternoon reflection boost
        if (new Date().getDay() === 5 && currentHour >= 15) {
          temporalScore += 1;
        }
        break;

      case 'profile-user':
        // Profile management is time-neutral but slightly favored during off-hours
        if (!workingHours) {
          temporalScore += 0.5;
        }
        break;

      case 'advanced-admin':
        // Admin tasks typically done during quieter hours
        if (currentHour < 9 || currentHour > 17 || dayType === 'weekend') {
          temporalScore += 1;
        }
        break;

      case 'search-assistant':
        // Search is generally time-neutral with slight boost during work hours
        if (workingHours) {
          temporalScore += 0.5;
        }
        break;
    }

    // Weekend adjustments
    if (dayType === 'weekend') {
      switch (hub.id) {
        case 'capture-productivity':
          temporalScore -= 1; // Less relevant on weekends
          break;
        case 'engage-collaboration':
          temporalScore -= 2; // Much less relevant on weekends
          break;
        case 'planning-time':
          temporalScore += 1; // Weekend planning is valuable
          break;
        case 'insights-growth':
          temporalScore += 1; // Weekend reflection time
          break;
      }
    }

    // Time of day energy patterns
    const energyLevel = this.calculateEnergyLevel(currentHour);

    // High-energy tasks get boost during high-energy times
    if (['capture-productivity', 'engage-collaboration'].includes(hub.id) && energyLevel > 0.7) {
      temporalScore += 1;
    }

    // Low-energy tasks get boost during low-energy times
    if (['insights-growth', 'profile-user'].includes(hub.id) && energyLevel < 0.4) {
      temporalScore += 1;
    }

    return temporalScore;
  }

  /**
   * Calculate typical energy level for given hour (0-1 scale)
   */
  private calculateEnergyLevel(hour: number): number {
    // Based on typical circadian rhythm patterns
    if (hour >= 6 && hour <= 9) return 0.8; // Morning peak
    if (hour >= 10 && hour <= 12) return 0.9; // Late morning peak
    if (hour >= 13 && hour <= 15) return 0.7; // Post-lunch recovery
    if (hour >= 16 && hour <= 18) return 0.6; // Afternoon steady
    if (hour >= 19 && hour <= 21) return 0.4; // Evening wind-down
    if (hour >= 22 || hour <= 5) return 0.2; // Night low
    return 0.5; // Default moderate
  }

  private determineDisclosureLevel(): DisclosureLevel {
    if (!this.context) return 'standard';

    // Determine based on user experience, role, preferences
    if (this.context.userRole === 'super_admin' || this.context.userRole === 'admin') {
      return 'expert';
    }

    // Check interaction history for experience level
    const recentInteractions = this.state.navigationHistory.slice(-50);
    if (recentInteractions.length > 30) {
      return 'detailed';
    }

    return 'standard';
  }

  private getMaxItemsForLevel(level: DisclosureLevel): number {
    switch (level) {
      case 'minimal': return 3;
      case 'standard': return 6;
      case 'detailed': return 9;
      case 'expert': return 12;
      default: return 6;
    }
  }

  private getDefaultDisclosureConfig(): ProgressiveDisclosureConfig {
    return {
      level: 'standard',
      maxVisibleItems: 6,
      showDescriptions: true,
      showShortcuts: false,
      showBadges: true,
      autoExpand: false,
    };
  }

  private generateContextualSuggestions(): SuggestedAction[] {
    if (!this.context) return [];

    const suggestions: SuggestedAction[] = [];
    const currentHour = new Date().getHours();
    const workflowState = this.context.workflowState;

    // Time-based suggestions
    if (currentHour >= 8 && currentHour <= 10 && workflowState === 'idle') {
      suggestions.push({
        id: 'morning-planning',
        title: 'Start Daily Planning',
        description: 'Morning planning sets a productive tone for the day',
        action: () => {}, // Placeholder action
        hubId: 'planning-time',
        confidence: 0.85,
        type: 'temporal'
      });
    }

    if (currentHour >= 10 && currentHour <= 12 && workflowState !== 'executing') {
      suggestions.push({
        id: 'focus-session',
        title: 'Start Focus Session',
        description: 'Peak mental energy for tackling important work',
        action: () => {}, // Placeholder action
        hubId: 'capture-productivity',
        confidence: 0.9,
        type: 'temporal'
      });
    }

    if (currentHour >= 17 && currentHour <= 19 && workflowState !== 'reviewing') {
      suggestions.push({
        id: 'daily-review',
        title: 'Review Daily Progress',
        description: 'Evening reflection improves learning and planning',
        action: () => {}, // Placeholder action
        hubId: 'insights-growth',
        confidence: 0.75,
        type: 'temporal'
      });
    }

    return suggestions;
  }

  /**
   * Get time-specific navigation recommendations
   */
  getTemporalRecommendations(): {
    current: string;
    upcoming: string;
    contextual: string;
  } {
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let current = 'Continue with your current workflow';
    let upcoming = 'Upcoming: Maintain focus on your tasks';
    let contextual = 'Context: Regular work period';

    // Time-based recommendations
    if (currentHour >= 7 && currentHour <= 9) {
      current = 'Great time for planning and goal setting';
      upcoming = 'Upcoming: Peak productivity hours ahead';
      contextual = 'Context: Morning energy peak';
    } else if (currentHour >= 9 && currentHour <= 11) {
      current = 'Peak focus time - tackle important tasks';
      upcoming = 'Upcoming: Continue high-energy work';
      contextual = 'Context: Maximum cognitive capacity';
    } else if (currentHour >= 11 && currentHour <= 13) {
      current = 'Good time for collaboration and meetings';
      upcoming = 'Upcoming: Post-lunch productivity dip ahead';
      contextual = 'Context: High social energy';
    } else if (currentHour >= 13 && currentHour <= 15) {
      current = 'Ideal for routine tasks and communication';
      upcoming = 'Upcoming: Afternoon focus window';
      contextual = 'Context: Post-lunch adjustment period';
    } else if (currentHour >= 15 && currentHour <= 17) {
      current = 'Second wind - good for creative work';
      upcoming = 'Upcoming: Evening wind-down approaching';
      contextual = 'Context: Renewed afternoon energy';
    } else if (currentHour >= 17 && currentHour <= 19) {
      current = 'Perfect for reflection and planning tomorrow';
      upcoming = 'Upcoming: Personal time';
      contextual = 'Context: Transition to evening';
    } else {
      current = 'Personal time - consider life balance activities';
      upcoming = 'Upcoming: Rest and recovery';
      contextual = 'Context: Off-hours relaxation';
    }

    // Weekend adjustments
    if (isWeekend) {
      current = current.replace('tasks', 'personal projects').replace('meetings', 'personal connections');
      contextual = 'Context: Weekend freedom and flexibility';
    }

    // Monday morning special case
    if (dayOfWeek === 1 && currentHour >= 8 && currentHour <= 10) {
      current = 'Monday planning - set your week up for success';
      contextual = 'Context: Fresh start energy';
    }

    // Friday afternoon special case
    if (dayOfWeek === 5 && currentHour >= 15) {
      current = 'Week wrap-up time - review accomplishments';
      upcoming = 'Upcoming: Weekend preparation';
      contextual = 'Context: End-of-week reflection';
    }

    return { current, upcoming, contextual };
  }

  /**
   * Get next suggested action based on temporal patterns
   */
  getNextSuggestedAction(): {
    action: string;
    hubId: NavigationHubId;
    reasoning: string;
    confidence: number;
  } | null {
    if (!this.context) return null;

    const currentHour = new Date().getHours();
    const workflowState = this.context.workflowState;

    // Time-based action suggestions
    if (currentHour >= 8 && currentHour <= 10 && workflowState === 'idle') {
      return {
        action: 'Start daily planning',
        hubId: 'planning-time',
        reasoning: 'Morning planning sets a productive tone for the day',
        confidence: 0.85
      };
    }

    if (currentHour >= 10 && currentHour <= 12 && workflowState !== 'executing') {
      return {
        action: 'Focus on high-priority tasks',
        hubId: 'capture-productivity',
        reasoning: 'Peak mental energy for tackling important work',
        confidence: 0.9
      };
    }

    if (currentHour >= 17 && currentHour <= 19 && workflowState !== 'reviewing') {
      return {
        action: 'Review daily progress',
        hubId: 'insights-growth',
        reasoning: 'Evening reflection improves learning and planning',
        confidence: 0.75
      };
    }

    return null;
  }

  /**
   * Get temporal insights for analytics
   */
  getTemporalInsights(): {
    currentOptimalHubs: NavigationHubId[];
    timeBasedRecommendations: ReturnType<typeof this.getTemporalRecommendations>;
    nextSuggestedAction: ReturnType<typeof this.getNextSuggestedAction>;
    energyLevel: number;
  } {
    const currentHour = new Date().getHours();

    return {
      currentOptimalHubs: this.getActiveHubs().map(hub => hub.id),
      timeBasedRecommendations: this.getTemporalRecommendations(),
      nextSuggestedAction: this.getNextSuggestedAction(),
      energyLevel: this.calculateEnergyLevel(currentHour)
    };
  }

  private addToHistory(hubId: NavigationHubId, interactionPattern: any): void {
    this.state.navigationHistory.push({
      hubId,
      path: this.context?.currentPage || '',
      timestamp: new Date(),
      interactionPattern,
    });

    // Keep only last 100 interactions
    if (this.state.navigationHistory.length > 100) {
      this.state.navigationHistory = this.state.navigationHistory.slice(-100);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.state));
  }

  private getMostUsedHub(): NavigationHubId | null {
    const hubCounts = new Map<NavigationHubId, number>();

    this.state.navigationHistory.forEach(item => {
      hubCounts.set(item.hubId, (hubCounts.get(item.hubId) || 0) + 1);
    });

    let mostUsed: NavigationHubId | null = null;
    let maxCount = 0;

    hubCounts.forEach((count, hubId) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = hubId;
      }
    });

    return mostUsed;
  }

  private getAverageSessionTime(): number {
    // Calculate based on navigation history
    return 0; // Placeholder
  }

  private getHubEfficiency(): Record<NavigationHubId, number> {
    // Calculate efficiency metrics for each hub
    return {} as Record<NavigationHubId, number>; // Placeholder
  }
}

// Singleton instance
export const navigationHubRegistry = new NavigationHubRegistry();
export default NavigationHubRegistry;