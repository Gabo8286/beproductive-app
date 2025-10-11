// Advanced Energy Level Detection and Tracking System
import type { ProductivityState } from '@/utils/productivityState';
import type { UserBehaviorPattern } from '@/utils/patternRecognition';

export interface EnergyLevel {
  physical: number; // 0-100, body energy
  mental: number; // 0-100, cognitive capacity
  emotional: number; // 0-100, mood and motivation
  overall: number; // 0-100, weighted average
  timestamp: Date;
  confidence: number; // 0-1, how confident we are in this reading
}

export interface EnergyPattern {
  id: string;
  type: 'circadian' | 'ultradian' | 'weekly' | 'recovery' | 'depletion';
  peakTimes: Array<{ start: string; end: string; level: number }>;
  lowTimes: Array<{ start: string; end: string; level: number }>;
  averageLevel: number;
  variability: number; // How much energy fluctuates
  recoveryRate: number; // How quickly energy recovers after depletion
  depletionRate: number; // How quickly energy depletes during work
  triggers: {
    energyBoosts: string[]; // What increases energy
    energyDrains: string[]; // What decreases energy
  };
  recommendations: string[];
  lastAnalyzed: Date;
}

export interface EnergyInsight {
  id: string;
  type: 'optimization' | 'warning' | 'achievement' | 'pattern';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestions: string[];
  relevantData: {
    timeframe: string;
    energyChange: number;
    context: string[];
  };
  generatedAt: Date;
}

export interface EnergyForecast {
  timeframe: 'next-hour' | 'next-3-hours' | 'tomorrow' | 'this-week';
  predictedLevel: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  optimalTaskTypes: string[];
}

interface EnergyDataPoint {
  timestamp: Date;
  levels: EnergyLevel;
  context: {
    activityType: string;
    workDuration: number; // minutes
    breaksSince: number;
    tasksCompleted: number;
    timeOfDay: string;
    dayOfWeek: number;
    sleepQuality?: number; // 1-10
    caffeineIntake?: number; // cups
    exerciseMinutes?: number;
    stressLevel?: number; // 1-10
  };
  derivedFrom: 'behavioral' | 'self-reported' | 'inferred' | 'predicted';
}

class EnergyTracker {
  private static instance: EnergyTracker;
  private energyHistory: EnergyDataPoint[] = [];
  private patterns: Map<string, EnergyPattern> = new Map();
  private insights: EnergyInsight[] = [];
  private readonly maxHistoryDays = 90; // Keep 90 days of data
  private lastAnalysis: Date | null = null;

  private constructor() {
    this.loadStoredData();
    this.startPeriodicAnalysis();
  }

  static getInstance(): EnergyTracker {
    if (!EnergyTracker.instance) {
      EnergyTracker.instance = new EnergyTracker();
    }
    return EnergyTracker.instance;
  }

  // Record energy level from various sources
  recordEnergyLevel(
    levels: Partial<EnergyLevel>,
    context: Partial<EnergyDataPoint['context']>,
    source: EnergyDataPoint['derivedFrom'] = 'behavioral'
  ): void {
    const now = new Date();

    // Calculate overall energy if not provided
    const physical = levels.physical ?? this.inferPhysicalEnergy(context);
    const mental = levels.mental ?? this.inferMentalEnergy(context);
    const emotional = levels.emotional ?? this.inferEmotionalEnergy(context);
    const overall = levels.overall ?? this.calculateOverallEnergy(physical, mental, emotional);

    const energyLevel: EnergyLevel = {
      physical,
      mental,
      emotional,
      overall,
      timestamp: now,
      confidence: levels.confidence ?? this.calculateConfidence(source, context)
    };

    const dataPoint: EnergyDataPoint = {
      timestamp: now,
      levels: energyLevel,
      context: {
        activityType: context.activityType ?? 'unknown',
        workDuration: context.workDuration ?? 0,
        breaksSince: context.breaksSince ?? 0,
        tasksCompleted: context.tasksCompleted ?? 0,
        timeOfDay: this.getTimeOfDay(now),
        dayOfWeek: now.getDay(),
        ...context
      },
      derivedFrom: source
    };

    this.energyHistory.push(dataPoint);
    this.cleanupOldData();

    // Trigger analysis if significant change or enough new data
    if (this.shouldTriggerAnalysis()) {
      this.analyzeEnergyPatterns();
    }

    this.saveData();
  }

  // Infer energy from productivity state
  recordFromProductivityState(state: ProductivityState): void {
    const energyMapping = {
      'energized': { physical: 85, mental: 80, emotional: 90 },
      'focused': { physical: 70, mental: 95, emotional: 75 },
      'deep-work': { physical: 65, mental: 98, emotional: 70 },
      'planning': { physical: 60, mental: 85, emotional: 65 },
      'tired': { physical: 25, mental: 40, emotional: 35 },
      'overwhelmed': { physical: 45, mental: 30, emotional: 25 },
      'distracted': { physical: 55, mental: 35, emotional: 45 }
    };

    const baseEnergy = energyMapping[state.currentState] ?? { physical: 50, mental: 50, emotional: 50 };

    // Adjust based on focus and energy levels from productivity state
    const adjustedEnergy = {
      physical: Math.min(100, baseEnergy.physical + (state.energyLevel - 50) * 0.3),
      mental: Math.min(100, baseEnergy.mental + (state.focusLevel - 50) * 0.4),
      emotional: Math.min(100, baseEnergy.emotional + (state.energyLevel - 50) * 0.2),
      confidence: state.confidence
    };

    this.recordEnergyLevel(adjustedEnergy, {
      activityType: 'productivity-work',
      workDuration: 60 // Assume 1 hour sessions
    }, 'inferred');
  }

  // Generate energy forecasts
  generateForecast(timeframe: EnergyForecast['timeframe']): EnergyForecast {
    const recentData = this.getRecentData(7); // Last 7 days
    const patterns = Array.from(this.patterns.values());
    const now = new Date();

    let predictedLevel = 50; // Default baseline
    let confidence = 0.3; // Low confidence by default
    const factors: string[] = [];
    const recommendations: string[] = [];
    const optimalTaskTypes: string[] = [];

    // Analyze circadian patterns
    const circadianPattern = patterns.find(p => p.type === 'circadian');
    if (circadianPattern) {
      const currentHour = now.getHours();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

      // Find if current time is in peak or low period
      const peakPeriod = circadianPattern.peakTimes.find(p =>
        this.isTimeInRange(currentTime, p.start, p.end)
      );
      const lowPeriod = circadianPattern.lowTimes.find(p =>
        this.isTimeInRange(currentTime, p.start, p.end)
      );

      if (peakPeriod) {
        predictedLevel = peakPeriod.level;
        confidence += 0.3;
        factors.push('Natural peak energy period');
        optimalTaskTypes.push('challenging tasks', 'creative work', 'important decisions');
      } else if (lowPeriod) {
        predictedLevel = lowPeriod.level;
        confidence += 0.3;
        factors.push('Natural low energy period');
        optimalTaskTypes.push('routine tasks', 'easy admin work', 'breaks');
        recommendations.push('Consider taking a break or doing light tasks');
      }
    }

    // Analyze recent trends
    if (recentData.length >= 5) {
      const recentTrend = this.calculateEnergyTrend(recentData.slice(-5));
      predictedLevel = Math.max(10, Math.min(90, predictedLevel + recentTrend * 10));
      confidence += 0.2;

      if (recentTrend > 0.1) {
        factors.push('Increasing energy trend');
      } else if (recentTrend < -0.1) {
        factors.push('Decreasing energy trend');
        recommendations.push('Monitor for signs of fatigue');
      }
    }

    // Time-specific adjustments
    switch (timeframe) {
      case 'next-hour':
        // Check for ultradian rhythms
        const ultraddianPattern = patterns.find(p => p.type === 'ultradian');
        if (ultraddianPattern && confidence < 0.7) {
          confidence += 0.2;
          factors.push('90-minute ultradian cycle considered');
        }
        break;

      case 'tomorrow':
        // Check weekly patterns
        const weeklyPattern = patterns.find(p => p.type === 'weekly');
        if (weeklyPattern) {
          const tomorrowDay = (now.getDay() + 1) % 7;
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tomorrowDay];
          factors.push(`${dayName} energy pattern`);

          // Weekend vs weekday adjustment
          if (tomorrowDay === 0 || tomorrowDay === 6) {
            predictedLevel += 10; // Weekends typically higher energy
            recommendations.push('Good day for personal projects or rest');
          }
        }
        break;
    }

    // Recovery pattern analysis
    const recoveryPattern = patterns.find(p => p.type === 'recovery');
    if (recoveryPattern && predictedLevel < 40) {
      const recoveryTime = this.estimateRecoveryTime(predictedLevel, recoveryPattern.recoveryRate);
      recommendations.push(`Energy recovery expected in ${recoveryTime}`);
      factors.push('Recovery pattern applied');
    }

    // Generate task recommendations based on predicted level
    if (predictedLevel >= 70) {
      optimalTaskTypes.push('high-focus tasks', 'problem solving', 'learning new skills');
      recommendations.push('Great time for your most important work');
    } else if (predictedLevel >= 40) {
      optimalTaskTypes.push('moderate tasks', 'communication', 'planning');
      recommendations.push('Good for routine work and collaboration');
    } else {
      optimalTaskTypes.push('light tasks', 'organization', 'breaks');
      recommendations.push('Focus on rest and light activities');
    }

    return {
      timeframe,
      predictedLevel: Math.round(predictedLevel),
      confidence: Math.min(0.95, confidence),
      factors,
      recommendations,
      optimalTaskTypes
    };
  }

  // Analyze patterns in energy data
  private analyzeEnergyPatterns(): void {
    if (this.energyHistory.length < 10) return; // Need minimum data

    try {
      this.detectCircadianPatterns();
      this.detectUltradianPatterns();
      this.detectWeeklyPatterns();
      this.detectRecoveryPatterns();
      this.detectDepletionPatterns();
      this.generateInsights();

      this.lastAnalysis = new Date();
      console.log('🔋 Energy pattern analysis complete:', this.patterns.size, 'patterns found');
    } catch (error) {
      console.warn('Energy pattern analysis failed:', error);
    }
  }

  // Detect daily circadian rhythm patterns
  private detectCircadianPatterns(): void {
    const hourlyData = new Map<number, number[]>();

    this.energyHistory.forEach(point => {
      const hour = point.timestamp.getHours();
      if (!hourlyData.has(hour)) hourlyData.set(hour, []);
      hourlyData.get(hour)!.push(point.levels.overall);
    });

    const hourlyAverages = new Map<number, number>();
    hourlyData.forEach((levels, hour) => {
      const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      hourlyAverages.set(hour, avg);
    });

    if (hourlyAverages.size >= 8) { // Need data for most hours
      const peakTimes: EnergyPattern['peakTimes'] = [];
      const lowTimes: EnergyPattern['lowTimes'] = [];

      // Find peaks (above 70% energy)
      hourlyAverages.forEach((avg, hour) => {
        if (avg >= 70) {
          peakTimes.push({
            start: `${hour.toString().padStart(2, '0')}:00`,
            end: `${(hour + 1).toString().padStart(2, '0')}:00`,
            level: avg
          });
        } else if (avg <= 40) {
          lowTimes.push({
            start: `${hour.toString().padStart(2, '0')}:00`,
            end: `${(hour + 1).toString().padStart(2, '0')}:00`,
            level: avg
          });
        }
      });

      const overallAvg = Array.from(hourlyAverages.values()).reduce((sum, avg) => sum + avg, 0) / hourlyAverages.size;
      const variability = this.calculateVariability(Array.from(hourlyAverages.values()));

      const pattern: EnergyPattern = {
        id: 'circadian-rhythm',
        type: 'circadian',
        peakTimes,
        lowTimes,
        averageLevel: overallAvg,
        variability,
        recoveryRate: 0, // Not applicable for circadian
        depletionRate: 0, // Not applicable for circadian
        triggers: {
          energyBoosts: this.identifyEnergyBoosts(),
          energyDrains: this.identifyEnergyDrains()
        },
        recommendations: this.generateCircadianRecommendations(peakTimes, lowTimes),
        lastAnalyzed: new Date()
      };

      this.patterns.set(pattern.id, pattern);
    }
  }

  // Detect 90-minute ultradian cycles
  private detectUltradianPatterns(): void {
    if (this.energyHistory.length < 20) return;

    const recentData = this.getRecentData(3); // Last 3 days
    const energyWindows: number[] = [];

    // Create 90-minute windows
    for (let i = 0; i < recentData.length - 6; i += 6) { // 6 data points = ~90 minutes
      const window = recentData.slice(i, i + 6);
      const avgEnergy = window.reduce((sum, point) => sum + point.levels.overall, 0) / window.length;
      energyWindows.push(avgEnergy);
    }

    if (energyWindows.length >= 4) {
      // Look for cyclical patterns
      const peaks = energyWindows.filter((_, index) => {
        const prev = energyWindows[index - 1] ?? 0;
        const next = energyWindows[index + 1] ?? 0;
        return energyWindows[index] > prev && energyWindows[index] > next && energyWindows[index] > 60;
      });

      if (peaks.length >= 2) {
        const pattern: EnergyPattern = {
          id: 'ultradian-cycle',
          type: 'ultradian',
          peakTimes: [], // Would need more sophisticated time mapping
          lowTimes: [],
          averageLevel: energyWindows.reduce((sum, level) => sum + level, 0) / energyWindows.length,
          variability: this.calculateVariability(energyWindows),
          recoveryRate: 0,
          depletionRate: 0,
          triggers: {
            energyBoosts: ['natural cycle peak'],
            energyDrains: ['natural cycle low']
          },
          recommendations: [
            'Plan focused work during 90-minute energy peaks',
            'Take breaks during natural energy lows',
            'Align important tasks with your ultradian rhythm'
          ],
          lastAnalyzed: new Date()
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  // Helper methods
  private inferPhysicalEnergy(context: Partial<EnergyDataPoint['context']>): number {
    let energy = 50; // Baseline

    if (context.exerciseMinutes && context.exerciseMinutes > 0) energy += 20;
    if (context.workDuration && context.workDuration > 240) energy -= 15; // Long work sessions
    if (context.sleepQuality && context.sleepQuality < 5) energy -= 25;
    if (context.breaksSince !== undefined && context.breaksSince === 0) energy -= 10;

    return Math.max(10, Math.min(90, energy));
  }

  private inferMentalEnergy(context: Partial<EnergyDataPoint['context']>): number {
    let energy = 50;

    if (context.tasksCompleted && context.tasksCompleted > 3) energy += 15;
    if (context.workDuration && context.workDuration > 180) energy -= 20;
    if (context.stressLevel && context.stressLevel > 7) energy -= 30;
    if (context.caffeineIntake && context.caffeineIntake > 2) energy += 10;

    return Math.max(10, Math.min(90, energy));
  }

  private inferEmotionalEnergy(context: Partial<EnergyDataPoint['context']>): number {
    let energy = 50;

    if (context.tasksCompleted && context.tasksCompleted > 0) energy += 10;
    if (context.stressLevel && context.stressLevel > 8) energy -= 35;
    if (context.workDuration && context.workDuration > 300) energy -= 15;

    return Math.max(10, Math.min(90, energy));
  }

  private calculateOverallEnergy(physical: number, mental: number, emotional: number): number {
    return Math.round(physical * 0.3 + mental * 0.4 + emotional * 0.3);
  }

  private calculateConfidence(source: EnergyDataPoint['derivedFrom'], context: Partial<EnergyDataPoint['context']>): number {
    switch (source) {
      case 'self-reported': return 0.9;
      case 'behavioral': return 0.7;
      case 'inferred': return 0.6;
      case 'predicted': return 0.4;
      default: return 0.5;
    }
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private shouldTriggerAnalysis(): boolean {
    if (!this.lastAnalysis) return true;
    const hoursSinceLastAnalysis = (Date.now() - this.lastAnalysis.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAnalysis >= 6 || this.energyHistory.length % 20 === 0;
  }

  private getRecentData(days: number): EnergyDataPoint[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.energyHistory.filter(point => point.timestamp >= cutoff);
  }

  private calculateEnergyTrend(data: EnergyDataPoint[]): number {
    if (data.length < 2) return 0;

    const first = data[0].levels.overall;
    const last = data[data.length - 1].levels.overall;
    return (last - first) / 100; // Normalized trend
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (endMinutes > startMinutes) {
      return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    } else {
      // Crosses midnight
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  private estimateRecoveryTime(currentLevel: number, recoveryRate: number): string {
    const targetLevel = 70;
    const recoveryNeeded = targetLevel - currentLevel;
    const hoursNeeded = recoveryNeeded / (recoveryRate * 10); // Simplified calculation

    if (hoursNeeded < 1) return `${Math.round(hoursNeeded * 60)} minutes`;
    if (hoursNeeded < 24) return `${Math.round(hoursNeeded)} hours`;
    return `${Math.round(hoursNeeded / 24)} days`;
  }

  private identifyEnergyBoosts(): string[] {
    // Simplified - in real implementation would analyze context correlation
    return ['morning routine', 'exercise', 'breaks', 'task completion', 'good sleep'];
  }

  private identifyEnergyDrains(): string[] {
    return ['long work sessions', 'stress', 'poor sleep', 'skipped breaks', 'multitasking'];
  }

  private generateCircadianRecommendations(peaks: EnergyPattern['peakTimes'], lows: EnergyPattern['lowTimes']): string[] {
    const recommendations = [];

    if (peaks.length > 0) {
      const peakTime = peaks[0].start;
      recommendations.push(`Schedule your most important work around ${peakTime}`);
      recommendations.push('Protect your peak energy hours from interruptions');
    }

    if (lows.length > 0) {
      const lowTime = lows[0].start;
      recommendations.push(`Plan breaks or light tasks around ${lowTime}`);
      recommendations.push('Avoid important decisions during low energy periods');
    }

    return recommendations;
  }

  private detectWeeklyPatterns(): void {
    // Implement weekly pattern detection
    // Similar to circadian but grouped by day of week
  }

  private detectRecoveryPatterns(): void {
    // Analyze how quickly energy recovers after low periods
  }

  private detectDepletionPatterns(): void {
    // Analyze how quickly energy depletes during work
  }

  private generateInsights(): void {
    // Generate actionable insights based on patterns
  }

  private cleanupOldData(): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.maxHistoryDays);
    this.energyHistory = this.energyHistory.filter(point => point.timestamp >= cutoff);
  }

  private startPeriodicAnalysis(): void {
    setInterval(() => {
      if (this.energyHistory.length >= 10) {
        this.analyzeEnergyPatterns();
      }
    }, 2 * 60 * 60 * 1000); // Every 2 hours
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('beproductive-energy');
      if (stored) {
        const data = JSON.parse(stored);
        this.energyHistory = (data.history || []).map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp)
        }));
        this.patterns = new Map(data.patterns || []);
        this.insights = (data.insights || []).map((insight: any) => ({
          ...insight,
          generatedAt: new Date(insight.generatedAt)
        }));
      }
    } catch (error) {
      console.warn('Failed to load energy data:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        history: this.energyHistory,
        patterns: Array.from(this.patterns.entries()),
        insights: this.insights,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('beproductive-energy', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save energy data:', error);
    }
  }

  // Public API
  getCurrentEnergyLevel(): EnergyLevel | null {
    if (this.energyHistory.length === 0) return null;
    return this.energyHistory[this.energyHistory.length - 1].levels;
  }

  getEnergyHistory(days: number = 7): EnergyDataPoint[] {
    return this.getRecentData(days);
  }

  getPatterns(): EnergyPattern[] {
    return Array.from(this.patterns.values());
  }

  getInsights(): EnergyInsight[] {
    return this.insights.slice(-10); // Last 10 insights
  }

  clearAllData(): void {
    this.energyHistory = [];
    this.patterns.clear();
    this.insights = [];
    localStorage.removeItem('beproductive-energy');
  }
}

// Export singleton and React hook
export const energyTracker = EnergyTracker.getInstance();

export function useEnergyTracking() {
  const recordEnergy = (levels: Partial<EnergyLevel>, context?: Partial<EnergyDataPoint['context']>) => {
    energyTracker.recordEnergyLevel(levels, context, 'self-reported');
  };

  const recordFromProductivity = (state: ProductivityState) => {
    energyTracker.recordFromProductivityState(state);
  };

  const getCurrentLevel = () => {
    return energyTracker.getCurrentEnergyLevel();
  };

  const getForecast = (timeframe: EnergyForecast['timeframe']) => {
    return energyTracker.generateForecast(timeframe);
  };

  const getHistory = (days?: number) => {
    return energyTracker.getEnergyHistory(days);
  };

  const getPatterns = () => {
    return energyTracker.getPatterns();
  };

  const getInsights = () => {
    return energyTracker.getInsights();
  };

  return {
    recordEnergy,
    recordFromProductivity,
    getCurrentLevel,
    getForecast,
    getHistory,
    getPatterns,
    getInsights,
    clearData: energyTracker.clearAllData.bind(energyTracker)
  };
}