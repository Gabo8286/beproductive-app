// Productivity State Detection System - Privacy-First Local Analysis
import { performanceMonitor } from './performanceMonitor';
import { energyTracker } from './energyTracking';

export interface ProductivityState {
  currentState: 'focused' | 'distracted' | 'overwhelmed' | 'energized' | 'tired' | 'planning' | 'deep-work';
  energyLevel: number; // 0-100
  focusLevel: number; // 0-100
  workloadLevel: number; // 0-100
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  suggestedActions: string[];
  contextualTips: string[];
  confidence: number; // 0-1
  detectedAt: Date;
}

export interface UserBehaviorPattern {
  timestamp: Date;
  action: string;
  duration: number;
  context: string;
  productivity: number; // 0-100 estimated productivity during this action
}

export interface ProductivityMetrics {
  dailyFocusTime: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  peakProductivityHours: number[];
  energyPattern: { hour: number; energy: number }[];
  distractionEvents: number;
}

class ProductivityStateDetector {
  private behaviorHistory: UserBehaviorPattern[] = [];
  private currentMetrics: ProductivityMetrics;
  private focusStartTime: Date | null = null;
  private lastInteraction: Date = new Date();
  private static instance: ProductivityStateDetector;

  static getInstance(): ProductivityStateDetector {
    if (!ProductivityStateDetector.instance) {
      ProductivityStateDetector.instance = new ProductivityStateDetector();
    }
    return ProductivityStateDetector.instance;
  }

  constructor() {
    this.currentMetrics = this.initializeMetrics();
    this.startPassiveDetection();
  }

  private initializeMetrics(): ProductivityMetrics {
    return {
      dailyFocusTime: 0,
      taskCompletionRate: 0,
      averageTaskDuration: 0,
      peakProductivityHours: [9, 10, 14, 15], // Default peak hours
      energyPattern: [],
      distractionEvents: 0
    };
  }

  // Main productivity state detection method
  async detectCurrentState(): Promise<ProductivityState> {
    const tracker = performanceMonitor.trackComponentRender('productivity-state-detection');
    tracker.onStart();

    try {
      const timeOfDay = this.getTimeOfDay();
      const recentBehavior = this.getRecentBehavior(30); // Last 30 minutes
      const workloadLevel = this.calculateWorkloadLevel();
      const energyLevel = this.estimateEnergyLevel(timeOfDay, recentBehavior);
      const focusLevel = this.calculateFocusLevel(recentBehavior);

      const currentState = this.determineProductivityState(energyLevel, focusLevel, workloadLevel);
      const suggestions = this.generateSuggestions(currentState, energyLevel, focusLevel, timeOfDay);
      const contextualTips = this.getContextualTips(currentState, timeOfDay);

      tracker.onEnd();

      const state: ProductivityState = {
        currentState,
        energyLevel,
        focusLevel,
        workloadLevel,
        timeOfDay,
        suggestedActions: suggestions,
        contextualTips,
        confidence: this.calculateConfidence(recentBehavior.length),
        detectedAt: new Date()
      };

      // Integrate with energy tracking system
      energyTracker.recordFromProductivityState(state);

      console.log('🧠 Productivity State Detected:', state);
      return state;

    } catch (error) {
      tracker.onEnd();
      return this.getFallbackState();
    }
  }

  // Track user behavior patterns (privacy-safe)
  trackBehavior(action: string, context: string, duration?: number) {
    const now = new Date();
    const estimatedProductivity = this.estimateActionProductivity(action, context);

    const pattern: UserBehaviorPattern = {
      timestamp: now,
      action: this.anonymizeAction(action), // Remove PII
      duration: duration || this.calculateDurationSinceLastInteraction(),
      context: this.anonymizeContext(context), // Remove PII
      productivity: estimatedProductivity
    };

    this.behaviorHistory.push(pattern);
    this.lastInteraction = now;

    // Keep only last 24 hours of data
    this.cleanupOldBehavior();
    this.updateMetrics(pattern);
  }

  // Energy level estimation based on time and behavior
  private estimateEnergyLevel(timeOfDay: string, recentBehavior: UserBehaviorPattern[]): number {
    let baseEnergy = this.getBaseEnergyForTime(timeOfDay);

    // Adjust based on recent activity
    const recentProductivity = recentBehavior.reduce((sum, b) => sum + b.productivity, 0) / Math.max(recentBehavior.length, 1);
    const activityBonus = Math.min(20, recentProductivity / 5);

    // Check for signs of fatigue (rapid task switching, low completion)
    const taskSwitching = this.detectTaskSwitching(recentBehavior);
    const fatigueReduction = taskSwitching * 5;

    return Math.max(0, Math.min(100, baseEnergy + activityBonus - fatigueReduction));
  }

  private getBaseEnergyForTime(timeOfDay: string): number {
    const energyMap = {
      morning: 85,
      afternoon: 65,
      evening: 45,
      night: 25
    };
    return energyMap[timeOfDay as keyof typeof energyMap] || 50;
  }

  // Focus level calculation based on behavior patterns
  private calculateFocusLevel(recentBehavior: UserBehaviorPattern[]): number {
    if (recentBehavior.length === 0) return 50;

    // Analyze task switching frequency
    const taskChanges = this.countTaskChanges(recentBehavior);
    const averageDuration = recentBehavior.reduce((sum, b) => sum + b.duration, 0) / recentBehavior.length;

    // Higher focus = longer durations, fewer task switches
    const durationScore = Math.min(50, averageDuration / 60); // Max 50 points for 60+ min focus
    const switchingPenalty = Math.min(30, taskChanges * 5); // Penalty for frequent switching

    const baseFocus = 50;
    return Math.max(0, Math.min(100, baseFocus + durationScore - switchingPenalty));
  }

  // Workload level estimation
  private calculateWorkloadLevel(): number {
    const recent24h = this.getRecentBehavior(1440); // Last 24 hours
    const activeHours = this.calculateActiveHours(recent24h);
    const taskVolume = recent24h.length;

    // High workload = many hours active + high task volume
    const hoursScore = Math.min(40, activeHours * 5);
    const volumeScore = Math.min(40, taskVolume / 2);
    const stressIndicators = this.detectStressIndicators(recent24h);

    return Math.min(100, hoursScore + volumeScore + stressIndicators);
  }

  // Determine overall productivity state
  private determineProductivityState(energy: number, focus: number, workload: number): ProductivityState['currentState'] {
    if (workload > 80) return 'overwhelmed';
    if (energy > 80 && focus > 70) return 'deep-work';
    if (energy > 70 && focus > 60) return 'focused';
    if (energy > 60 && focus < 40) return 'distracted';
    if (energy < 40) return 'tired';
    if (focus > 60 && workload < 40) return 'planning';

    return 'energized';
  }

  // Generate contextual suggestions
  private generateSuggestions(state: string, energy: number, focus: number, timeOfDay: string): string[] {
    const suggestions: Record<string, string[]> = {
      'focused': [
        'Continue your current flow - you\'re in the zone!',
        'Set a timer to maintain awareness of time',
        'Prepare your next task to maintain momentum'
      ],
      'deep-work': [
        'Perfect time for your most challenging tasks',
        'Turn off notifications to protect this state',
        'Work in 90-minute blocks with short breaks'
      ],
      'distracted': [
        'Try a 5-minute meditation to reset focus',
        'Clear your workspace and close unnecessary tabs',
        'Switch to lighter tasks until focus returns'
      ],
      'overwhelmed': [
        'Take a 10-minute break to reset',
        'Review and prioritize your task list',
        'Consider postponing non-urgent items'
      ],
      'tired': [
        'Take a proper break or light walk',
        'Switch to administrative or planning tasks',
        'Consider ending work if it\'s late in the day'
      ],
      'planning': [
        'Great time to organize tasks for tomorrow',
        'Review your goals and priorities',
        'Prepare your workspace for focused work'
      ],
      'energized': [
        'Channel this energy into important tasks',
        'Start with your most challenging work',
        'Set clear goals to make the most of this state'
      ]
    };

    return suggestions[state] || ['Take a moment to assess your current priorities'];
  }

  // Get contextual tips based on state and time
  private getContextualTips(state: string, timeOfDay: string): string[] {
    const timeTips = {
      morning: ['Morning energy is perfect for creative work', 'Tackle your hardest task first'],
      afternoon: ['Great time for meetings and collaboration', 'Use afternoon energy for implementation'],
      evening: ['Perfect for planning and reflection', 'Prepare tomorrow\'s priorities'],
      night: ['Focus on light tasks and wrap-up', 'Avoid stimulating activities before sleep']
    };

    const stateTips = {
      'deep-work': ['Protect this precious state', 'This is when your best work happens'],
      'overwhelmed': ['It\'s okay to feel this way sometimes', 'Small steps lead to big progress'],
      'tired': ['Rest is productive too', 'Your brain needs recovery time']
    };

    return [
      ...(timeTips[timeOfDay as keyof typeof timeTips] || []),
      ...(stateTips[state as keyof typeof stateTips] || [])
    ];
  }

  // Helper methods for calculations

  private getRecentBehavior(minutes: number): UserBehaviorPattern[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.behaviorHistory.filter(b => b.timestamp > cutoff);
  }

  private detectTaskSwitching(behavior: UserBehaviorPattern[]): number {
    let switches = 0;
    for (let i = 1; i < behavior.length; i++) {
      if (behavior[i].context !== behavior[i-1].context) switches++;
    }
    return switches;
  }

  private countTaskChanges(behavior: UserBehaviorPattern[]): number {
    const contexts = new Set(behavior.map(b => b.context));
    return contexts.size;
  }

  private calculateActiveHours(behavior: UserBehaviorPattern[]): number {
    const hours = new Set();
    behavior.forEach(b => hours.add(b.timestamp.getHours()));
    return hours.size;
  }

  private detectStressIndicators(behavior: UserBehaviorPattern[]): number {
    const rapidSwitching = this.detectTaskSwitching(behavior);
    const lowProductivity = behavior.filter(b => b.productivity < 30).length;

    return Math.min(20, rapidSwitching + lowProductivity);
  }

  private estimateActionProductivity(action: string, context: string): number {
    const productiveActions = ['task-completion', 'deep-focus', 'goal-progress', 'planning'];
    const neutralActions = ['navigation', 'reading', 'organizing'];
    const distractiveActions = ['social-media', 'entertainment', 'unrelated-browsing'];

    if (productiveActions.some(a => action.includes(a))) return 80;
    if (neutralActions.some(a => action.includes(a))) return 50;
    if (distractiveActions.some(a => action.includes(a))) return 20;

    return 60; // Default moderate productivity
  }

  // Privacy protection methods
  private anonymizeAction(action: string): string {
    // Remove any potential PII from action strings
    return action.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
                .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[phone]')
                .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[name]');
  }

  private anonymizeContext(context: string): string {
    // Remove any potential PII from context strings
    return context.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
                  .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[phone]')
                  .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[name]');
  }

  private calculateDurationSinceLastInteraction(): number {
    return Math.min(300, (Date.now() - this.lastInteraction.getTime()) / 1000); // Max 5 minutes
  }

  private calculateConfidence(dataPoints: number): number {
    // More data points = higher confidence, up to 0.9
    return Math.min(0.9, 0.3 + (dataPoints * 0.02));
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private cleanupOldBehavior() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.behaviorHistory = this.behaviorHistory.filter(b => b.timestamp > cutoff);
  }

  private updateMetrics(pattern: UserBehaviorPattern) {
    // Update daily metrics based on new behavior
    this.currentMetrics.distractionEvents += pattern.productivity < 30 ? 1 : 0;

    if (pattern.productivity > 70) {
      this.currentMetrics.dailyFocusTime += pattern.duration;
    }
  }

  private getFallbackState(): ProductivityState {
    return {
      currentState: 'energized',
      energyLevel: 60,
      focusLevel: 60,
      workloadLevel: 50,
      timeOfDay: this.getTimeOfDay(),
      suggestedActions: ['Check your current priorities', 'Take a moment to plan your next steps'],
      contextualTips: ['Listen to your energy levels', 'Small progress is still progress'],
      confidence: 0.3,
      detectedAt: new Date()
    };
  }

  // Start passive detection of user interactions
  private startPassiveDetection() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackBehavior('window-blur', 'focus-loss');
      } else {
        this.trackBehavior('window-focus', 'focus-gain');
      }
    });

    // Track general activity (mouse movement, keyboard)
    let lastActivity = Date.now();
    const trackActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 60000) { // 1 minute of inactivity
        this.trackBehavior('activity-return', 'general');
      }
      lastActivity = now;
    };

    document.addEventListener('mousemove', trackActivity, { passive: true });
    document.addEventListener('keydown', trackActivity, { passive: true });
  }

  // Public interface methods
  getCurrentState = () => this.detectCurrentState();

  getMetrics = (): ProductivityMetrics => ({ ...this.currentMetrics });

  trackUserAction = (action: string, context: string, duration?: number) => {
    this.trackBehavior(action, context, duration);
  };

  // Force state refresh
  refreshState = () => this.detectCurrentState();

  // Get historical patterns (anonymized)
  getProductivityPatterns() {
    const patterns = this.getRecentBehavior(1440); // Last 24 hours
    return {
      totalActions: patterns.length,
      averageProductivity: patterns.reduce((sum, p) => sum + p.productivity, 0) / patterns.length,
      peakHours: this.calculatePeakHours(patterns),
      focusBlocks: this.identifyFocusBlocks(patterns)
    };
  }

  private calculatePeakHours(patterns: UserBehaviorPattern[]): number[] {
    const hourlyProductivity: Record<number, number[]> = {};

    patterns.forEach(p => {
      const hour = p.timestamp.getHours();
      if (!hourlyProductivity[hour]) hourlyProductivity[hour] = [];
      hourlyProductivity[hour].push(p.productivity);
    });

    const hourlyAverages = Object.entries(hourlyProductivity)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avg: scores.reduce((sum, s) => sum + s, 0) / scores.length
      }))
      .sort((a, b) => b.avg - a.avg);

    return hourlyAverages.slice(0, 4).map(h => h.hour);
  }

  private identifyFocusBlocks(patterns: UserBehaviorPattern[]): Array<{start: Date, duration: number, productivity: number}> {
    const blocks = [];
    let currentBlock = null;

    for (const pattern of patterns) {
      if (pattern.productivity > 70) {
        if (!currentBlock) {
          currentBlock = {
            start: pattern.timestamp,
            duration: pattern.duration,
            productivity: pattern.productivity
          };
        } else {
          currentBlock.duration += pattern.duration;
          currentBlock.productivity = (currentBlock.productivity + pattern.productivity) / 2;
        }
      } else {
        if (currentBlock && currentBlock.duration > 15 * 60) { // At least 15 minutes
          blocks.push(currentBlock);
        }
        currentBlock = null;
      }
    }

    return blocks;
  }
}

// Export singleton instance
export const productivityStateDetector = ProductivityStateDetector.getInstance();

// Utility functions for components
export const useProductivityState = () => {
  return {
    getCurrentState: productivityStateDetector.getCurrentState,
    trackAction: productivityStateDetector.trackUserAction,
    getMetrics: productivityStateDetector.getMetrics,
    getPatterns: productivityStateDetector.getProductivityPatterns,
    refreshState: productivityStateDetector.refreshState
  };
};