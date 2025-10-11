// Local Pattern Recognition Engine - Privacy-first behavioral analysis
import type { ProductivityState } from '@/utils/productivityState';
import type { DailyProductivityStats, BehaviorPattern } from '@/utils/clientAnalytics';

export interface UserBehaviorPattern {
  id: string;
  type: 'temporal' | 'contextual' | 'performance' | 'energy' | 'focus';
  pattern: string;
  description: string;
  confidence: number; // 0-1
  strength: 'weak' | 'moderate' | 'strong';
  frequency: number; // occurrences per week
  lastObserved: Date;
  metadata: {
    timeRange?: { start: string; end: string };
    conditions?: string[];
    triggers?: string[];
    outcomes?: string[];
    dayOfWeek?: number[];
    seasonality?: 'daily' | 'weekly' | 'monthly';
  };
  actionableInsights: string[];
  predictivePower: number; // 0-1, how well this pattern predicts future behavior
}

export interface PatternPrediction {
  patternId: string;
  predictedState: ProductivityState['currentState'];
  confidence: number;
  timeframe: 'next-hour' | 'next-2-hours' | 'tomorrow-morning' | 'this-evening';
  reasoning: string;
  suggestedActions: string[];
}

export interface BehaviorContext {
  timeOfDay: string;
  dayOfWeek: number;
  isWeekend: boolean;
  recentStates: ProductivityState[];
  tasksCompleted: number;
  breaksTaken: number;
  workSessionLength: number;
  environmentFactors?: {
    noiseLevel?: 'quiet' | 'moderate' | 'noisy';
    lightLevel?: 'dim' | 'normal' | 'bright';
    temperature?: 'cool' | 'comfortable' | 'warm';
  };
}

class LocalPatternRecognition {
  private static instance: LocalPatternRecognition;
  private patterns: Map<string, UserBehaviorPattern> = new Map();
  private rawData: Array<{
    timestamp: Date;
    state: ProductivityState;
    context: BehaviorContext;
  }> = [];
  private readonly maxDataPoints = 10000; // Keep last 10k data points for privacy
  private readonly minConfidenceThreshold = 0.6;

  private constructor() {
    this.loadStoredPatterns();
    this.startPeriodicAnalysis();
  }

  static getInstance(): LocalPatternRecognition {
    if (!LocalPatternRecognition.instance) {
      LocalPatternRecognition.instance = new LocalPatternRecognition();
    }
    return LocalPatternRecognition.instance;
  }

  // Record new behavioral data point
  recordBehavior(state: ProductivityState, context: BehaviorContext): void {
    const dataPoint = {
      timestamp: new Date(),
      state,
      context
    };

    this.rawData.push(dataPoint);

    // Maintain privacy by limiting data retention
    if (this.rawData.length > this.maxDataPoints) {
      this.rawData = this.rawData.slice(-this.maxDataPoints);
    }

    // Trigger pattern analysis if we have enough new data
    if (this.rawData.length % 50 === 0) {
      this.analyzePatterns();
    }

    this.savePatterns();
  }

  // Main pattern analysis engine
  private analyzePatterns(): void {
    try {
      // Analyze different types of patterns
      this.detectTemporalPatterns();
      this.detectPerformancePatterns();
      this.detectEnergyPatterns();
      this.detectFocusPatterns();
      this.detectContextualPatterns();

      // Clean up weak patterns
      this.pruneWeakPatterns();

      console.log('🧠 Pattern analysis complete:', this.patterns.size, 'patterns discovered');
    } catch (error) {
      console.warn('Pattern analysis failed:', error);
    }
  }

  // Detect time-based behavioral patterns
  private detectTemporalPatterns(): void {
    const hourlyStates = new Map<number, ProductivityState['currentState'][]>();
    const dailyStates = new Map<number, ProductivityState['currentState'][]>();

    // Group data by hour and day of week
    this.rawData.forEach(({ timestamp, state }) => {
      const hour = timestamp.getHours();
      const dayOfWeek = timestamp.getDay();

      if (!hourlyStates.has(hour)) hourlyStates.set(hour, []);
      if (!dailyStates.has(dayOfWeek)) dailyStates.set(dayOfWeek, []);

      hourlyStates.get(hour)!.push(state.currentState);
      dailyStates.get(dayOfWeek)!.push(state.currentState);
    });

    // Analyze hourly patterns
    hourlyStates.forEach((states, hour) => {
      const dominantState = this.findDominantState(states);
      const confidence = this.calculateStateConfidence(states, dominantState);

      if (confidence >= this.minConfidenceThreshold && states.length >= 5) {
        const pattern: UserBehaviorPattern = {
          id: `temporal-hour-${hour}`,
          type: 'temporal',
          pattern: `${dominantState}-at-${hour}h`,
          description: `Tends to be ${dominantState.replace('-', ' ')} around ${this.formatHour(hour)}`,
          confidence,
          strength: confidence > 0.8 ? 'strong' : confidence > 0.7 ? 'moderate' : 'weak',
          frequency: Math.floor(states.length / 4), // Approximate weekly frequency
          lastObserved: new Date(),
          metadata: {
            timeRange: { start: `${hour}:00`, end: `${hour + 1}:00` },
            seasonality: 'daily'
          },
          actionableInsights: this.generateTemporalInsights(dominantState, hour),
          predictivePower: confidence * 0.9 // Temporal patterns are quite predictive
        };

        this.patterns.set(pattern.id, pattern);
      }
    });

    // Analyze daily patterns
    dailyStates.forEach((states, dayOfWeek) => {
      const dominantState = this.findDominantState(states);
      const confidence = this.calculateStateConfidence(states, dominantState);

      if (confidence >= this.minConfidenceThreshold && states.length >= 3) {
        const pattern: UserBehaviorPattern = {
          id: `temporal-day-${dayOfWeek}`,
          type: 'temporal',
          pattern: `${dominantState}-on-${this.getDayName(dayOfWeek)}`,
          description: `Usually ${dominantState.replace('-', ' ')} on ${this.getDayName(dayOfWeek)}s`,
          confidence,
          strength: confidence > 0.8 ? 'strong' : confidence > 0.7 ? 'moderate' : 'weak',
          frequency: Math.floor(states.length / 4),
          lastObserved: new Date(),
          metadata: {
            dayOfWeek: [dayOfWeek],
            seasonality: 'weekly'
          },
          actionableInsights: this.generateDailyInsights(dominantState, dayOfWeek),
          predictivePower: confidence * 0.7
        };

        this.patterns.set(pattern.id, pattern);
      }
    });
  }

  // Detect performance-based patterns
  private detectPerformancePatterns(): void {
    // Group by high/low performance periods
    const performanceData = this.rawData.map(({ timestamp, state, context }) => ({
      timestamp,
      performance: state.focusLevel * 0.4 + state.energyLevel * 0.3 + (100 - state.workloadLevel) * 0.3,
      state: state.currentState,
      tasksCompleted: context.tasksCompleted
    }));

    // Find patterns in high-performance periods
    const highPerformancePeriods = performanceData.filter(d => d.performance > 70);
    if (highPerformancePeriods.length >= 5) {
      const commonHours = this.findCommonHours(highPerformancePeriods.map(p => p.timestamp));
      const dominantState = this.findDominantState(highPerformancePeriods.map(p => p.state));

      if (commonHours.length > 0) {
        const pattern: UserBehaviorPattern = {
          id: 'performance-peak-hours',
          type: 'performance',
          pattern: 'high-performance-window',
          description: `Peak performance typically occurs between ${commonHours[0]}:00-${commonHours[commonHours.length - 1]}:00`,
          confidence: 0.8,
          strength: 'strong',
          frequency: 5,
          lastObserved: new Date(),
          metadata: {
            timeRange: { start: `${commonHours[0]}:00`, end: `${commonHours[commonHours.length - 1]}:00` },
            conditions: [`${dominantState} state`, 'high energy and focus'],
            outcomes: ['increased task completion', 'better quality work']
          },
          actionableInsights: [
            'Schedule your most important tasks during these hours',
            'Protect this time from meetings and distractions',
            'Use this window for creative or challenging work'
          ],
          predictivePower: 0.85
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  // Detect energy level patterns
  private detectEnergyPatterns(): void {
    const energyByHour = new Map<number, number[]>();

    this.rawData.forEach(({ timestamp, state }) => {
      const hour = timestamp.getHours();
      if (!energyByHour.has(hour)) energyByHour.set(hour, []);
      energyByHour.get(hour)!.push(state.energyLevel);
    });

    energyByHour.forEach((levels, hour) => {
      if (levels.length >= 3) {
        const avgEnergy = levels.reduce((sum, level) => sum + level, 0) / levels.length;
        const isLowEnergyHour = avgEnergy < 40;
        const isHighEnergyHour = avgEnergy > 70;

        if (isLowEnergyHour || isHighEnergyHour) {
          const pattern: UserBehaviorPattern = {
            id: `energy-${isHighEnergyHour ? 'high' : 'low'}-${hour}h`,
            type: 'energy',
            pattern: `${isHighEnergyHour ? 'high' : 'low'}-energy-at-${hour}h`,
            description: `${isHighEnergyHour ? 'High' : 'Low'} energy period around ${this.formatHour(hour)}`,
            confidence: Math.min(0.9, Math.abs(avgEnergy - 50) / 50),
            strength: avgEnergy > 80 || avgEnergy < 30 ? 'strong' : 'moderate',
            frequency: Math.floor(levels.length / 4),
            lastObserved: new Date(),
            metadata: {
              timeRange: { start: `${hour}:00`, end: `${hour + 1}:00` },
              conditions: [`${Math.round(avgEnergy)}% average energy level`]
            },
            actionableInsights: isHighEnergyHour ? [
              'Schedule demanding tasks during this time',
              'Take on challenging or creative projects',
              'Use this energy for problem-solving'
            ] : [
              'Plan easier, routine tasks for this period',
              'Consider taking a break or doing light exercise',
              'Good time for administrative work'
            ],
            predictivePower: 0.75
          };

          this.patterns.set(pattern.id, pattern);
        }
      }
    });
  }

  // Detect focus patterns
  private detectFocusPatterns(): void {
    // Analyze focus level trends and triggers
    const focusTransitions = [];

    for (let i = 1; i < this.rawData.length; i++) {
      const prev = this.rawData[i - 1];
      const curr = this.rawData[i];

      const focusChange = curr.state.focusLevel - prev.state.focusLevel;

      if (Math.abs(focusChange) > 20) { // Significant focus change
        focusTransitions.push({
          timestamp: curr.timestamp,
          change: focusChange,
          from: prev.state.focusLevel,
          to: curr.state.focusLevel,
          context: curr.context
        });
      }
    }

    // Find patterns in focus improvement
    const focusImprovements = focusTransitions.filter(t => t.change > 20);
    if (focusImprovements.length >= 3) {
      const commonTriggers = this.findCommonTriggers(focusImprovements);

      if (commonTriggers.length > 0) {
        const pattern: UserBehaviorPattern = {
          id: 'focus-improvement-triggers',
          type: 'focus',
          pattern: 'focus-boost-conditions',
          description: 'Specific conditions that improve focus levels',
          confidence: 0.7,
          strength: 'moderate',
          frequency: focusImprovements.length,
          lastObserved: new Date(),
          metadata: {
            triggers: commonTriggers,
            outcomes: ['improved focus', 'better concentration']
          },
          actionableInsights: [
            'Recreate these conditions when you need better focus',
            'Notice these patterns and optimize your environment',
            'Use these triggers before important work sessions'
          ],
          predictivePower: 0.6
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  // Detect contextual patterns
  private detectContextualPatterns(): void {
    // Analyze patterns based on task completion and breaks
    const workSessions = this.groupIntoWorkSessions();

    workSessions.forEach((session, index) => {
      if (session.length >= 3) { // Minimum session length
        const avgProductivity = session.reduce((sum, point) =>
          sum + (point.state.focusLevel + point.state.energyLevel) / 2, 0) / session.length;

        const isHighProductivitySession = avgProductivity > 70;
        const sessionDuration = session[session.length - 1].timestamp.getTime() - session[0].timestamp.getTime();
        const hoursDuration = sessionDuration / (1000 * 60 * 60);

        if (isHighProductivitySession && hoursDuration > 1) {
          const pattern: UserBehaviorPattern = {
            id: `productive-session-pattern-${index}`,
            type: 'contextual',
            pattern: 'extended-productive-session',
            description: `Sustained high productivity for ${hoursDuration.toFixed(1)} hours`,
            confidence: 0.75,
            strength: hoursDuration > 3 ? 'strong' : 'moderate',
            frequency: 1,
            lastObserved: session[session.length - 1].timestamp,
            metadata: {
              conditions: [
                `${Math.round(avgProductivity)}% average productivity`,
                `${hoursDuration.toFixed(1)} hour duration`
              ],
              outcomes: ['sustained focus', 'high task completion']
            },
            actionableInsights: [
              'Try to replicate the conditions of this successful session',
              'Block similar time periods for important work',
              'Note what helped maintain this level of productivity'
            ],
            predictivePower: 0.8
          };

          this.patterns.set(pattern.id, pattern);
        }
      }
    });
  }

  // Generate predictions based on discovered patterns
  generatePredictions(currentContext: BehaviorContext): PatternPrediction[] {
    const predictions: PatternPrediction[] = [];
    const now = new Date();

    this.patterns.forEach(pattern => {
      if (pattern.predictivePower < 0.5) return; // Skip weak predictive patterns

      const prediction = this.createPredictionFromPattern(pattern, currentContext, now);
      if (prediction) {
        predictions.push(prediction);
      }
    });

    return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  // Helper methods
  private findDominantState(states: ProductivityState['currentState'][]): ProductivityState['currentState'] {
    const counts = new Map<ProductivityState['currentState'], number>();
    states.forEach(state => counts.set(state, (counts.get(state) || 0) + 1));

    let maxCount = 0;
    let dominantState: ProductivityState['currentState'] = 'focused';

    counts.forEach((count, state) => {
      if (count > maxCount) {
        maxCount = count;
        dominantState = state;
      }
    });

    return dominantState;
  }

  private calculateStateConfidence(states: ProductivityState['currentState'][], dominantState: ProductivityState['currentState']): number {
    const dominantCount = states.filter(s => s === dominantState).length;
    return dominantCount / states.length;
  }

  private formatHour(hour: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${ampm}`;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private findCommonHours(timestamps: Date[]): number[] {
    const hourCounts = new Map<number, number>();
    timestamps.forEach(ts => {
      const hour = ts.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([hour, _]) => hour)
      .slice(0, 3);
  }

  private findCommonTriggers(events: any[]): string[] {
    // Simplified trigger detection - in real implementation would be more sophisticated
    const triggers = new Set<string>();

    events.forEach(event => {
      if (event.context.breaksTaken === 0) triggers.add('no recent breaks');
      if (event.timestamp.getHours() >= 8 && event.timestamp.getHours() <= 10) triggers.add('morning period');
      if (event.context.tasksCompleted > 0) triggers.add('after task completion');
    });

    return Array.from(triggers);
  }

  private groupIntoWorkSessions(): Array<Array<typeof this.rawData[0]>> {
    const sessions: Array<Array<typeof this.rawData[0]>> = [];
    let currentSession: Array<typeof this.rawData[0]> = [];

    for (let i = 0; i < this.rawData.length; i++) {
      const point = this.rawData[i];

      if (currentSession.length === 0) {
        currentSession.push(point);
      } else {
        const lastPoint = currentSession[currentSession.length - 1];
        const timeDiff = point.timestamp.getTime() - lastPoint.timestamp.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > 2) { // More than 2 hours gap = new session
          if (currentSession.length > 1) sessions.push(currentSession);
          currentSession = [point];
        } else {
          currentSession.push(point);
        }
      }
    }

    if (currentSession.length > 1) sessions.push(currentSession);
    return sessions;
  }

  private generateTemporalInsights(state: ProductivityState['currentState'], hour: number): string[] {
    const timeStr = this.formatHour(hour);
    switch (state) {
      case 'focused':
        return [`Schedule important work around ${timeStr}`, `Protect ${timeStr} from distractions`];
      case 'energized':
        return [`Plan challenging tasks for ${timeStr}`, `Use ${timeStr} for creative work`];
      case 'tired':
        return [`Schedule breaks around ${timeStr}`, `Plan light tasks for ${timeStr}`];
      default:
        return [`Note your ${state.replace('-', ' ')} pattern around ${timeStr}`];
    }
  }

  private generateDailyInsights(state: ProductivityState['currentState'], dayOfWeek: number): string[] {
    const dayName = this.getDayName(dayOfWeek);
    switch (state) {
      case 'focused':
        return [`${dayName}s are great for deep work`, `Schedule important meetings on ${dayName}s`];
      case 'planning':
        return [`Use ${dayName}s for weekly planning`, `${dayName}s are good for organizing tasks`];
      default:
        return [`Expect to be ${state.replace('-', ' ')} on ${dayName}s`];
    }
  }

  private createPredictionFromPattern(
    pattern: UserBehaviorPattern,
    context: BehaviorContext,
    now: Date
  ): PatternPrediction | null {
    // Simplified prediction logic - real implementation would be more sophisticated
    if (pattern.type === 'temporal' && pattern.metadata.timeRange) {
      const startHour = parseInt(pattern.metadata.timeRange.start.split(':')[0]);
      const currentHour = now.getHours();
      const nextHour = (currentHour + 1) % 24;

      if (nextHour === startHour) {
        const stateMatch = pattern.pattern.split('-')[0] as ProductivityState['currentState'];
        return {
          patternId: pattern.id,
          predictedState: stateMatch,
          confidence: pattern.confidence * pattern.predictivePower,
          timeframe: 'next-hour',
          reasoning: `Based on your ${pattern.description.toLowerCase()}`,
          suggestedActions: pattern.actionableInsights.slice(0, 2)
        };
      }
    }

    return null;
  }

  private pruneWeakPatterns(): void {
    const weakPatterns = Array.from(this.patterns.entries())
      .filter(([_, pattern]) => pattern.confidence < this.minConfidenceThreshold)
      .map(([id, _]) => id);

    weakPatterns.forEach(id => this.patterns.delete(id));
  }

  private startPeriodicAnalysis(): void {
    // Run analysis every 30 minutes
    setInterval(() => {
      if (this.rawData.length >= 10) {
        this.analyzePatterns();
      }
    }, 30 * 60 * 1000);
  }

  private loadStoredPatterns(): void {
    try {
      const stored = localStorage.getItem('beproductive-patterns');
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(data.patterns || []);
        // Don't load raw data for privacy
      }
    } catch (error) {
      console.warn('Failed to load stored patterns:', error);
    }
  }

  private savePatterns(): void {
    try {
      const data = {
        patterns: Array.from(this.patterns.entries()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('beproductive-patterns', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save patterns:', error);
    }
  }

  // Public API
  getPatterns(): UserBehaviorPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  getPattern(id: string): UserBehaviorPattern | null {
    return this.patterns.get(id) || null;
  }

  clearAllPatterns(): void {
    this.patterns.clear();
    this.rawData = [];
    localStorage.removeItem('beproductive-patterns');
  }

  getAnalyticsStats() {
    return {
      totalPatterns: this.patterns.size,
      dataPoints: this.rawData.length,
      strongPatterns: Array.from(this.patterns.values()).filter(p => p.strength === 'strong').length,
      temporalPatterns: Array.from(this.patterns.values()).filter(p => p.type === 'temporal').length,
      performancePatterns: Array.from(this.patterns.values()).filter(p => p.type === 'performance').length
    };
  }
}

// Export singleton instance and types
export const patternRecognition = LocalPatternRecognition.getInstance();

// React hook for easy integration
export function usePatternRecognition() {
  const recordBehavior = (state: ProductivityState, context: BehaviorContext) => {
    patternRecognition.recordBehavior(state, context);
  };

  const getPatterns = () => {
    return patternRecognition.getPatterns();
  };

  const getPredictions = (context: BehaviorContext) => {
    return patternRecognition.generatePredictions(context);
  };

  const getStats = () => {
    return patternRecognition.getAnalyticsStats();
  };

  return {
    recordBehavior,
    getPatterns,
    getPredictions,
    getStats,
    getPattern: patternRecognition.getPattern.bind(patternRecognition),
    clearPatterns: patternRecognition.clearAllPatterns.bind(patternRecognition)
  };
}