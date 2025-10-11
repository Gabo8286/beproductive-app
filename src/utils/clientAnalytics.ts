// Client-Side Analytics Engine - Privacy-First Behavioral Insights
import { productivityStateDetector } from './productivityState';
import { performanceMonitor } from './performanceMonitor';
import type { ProductivityState, UserBehaviorPattern } from './productivityState';

export interface AnalyticsData {
  dailyStats: DailyProductivityStats;
  weeklyTrends: WeeklyTrend[];
  behaviorPatterns: BehaviorPattern[];
  insights: ProductivityInsight[];
  recommendations: PersonalRecommendation[];
  achievements: Achievement[];
}

export interface DailyProductivityStats {
  date: string;
  totalActiveTime: number; // minutes
  focusTime: number; // minutes
  distractionEvents: number;
  tasksCompleted: number;
  energyLevels: { hour: number; energy: number }[];
  productivityScore: number; // 0-100
  topProductiveHours: number[];
  stateDistribution: Record<ProductivityState['currentState'], number>;
  breaksTaken: number;
  peakFlowDuration: number; // longest continuous focus session
}

export interface WeeklyTrend {
  week: string; // ISO week
  averageProductivity: number;
  totalFocusTime: number;
  consistency: number; // How consistent productivity was across days
  improvement: number; // Change from previous week
  bestDay: string;
  challengingAreas: string[];
}

export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // How often this pattern occurs
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  examples: string[];
  suggestions: string[];
  discoveredAt: Date;
}

import type { ProductivityInsight } from '@/types/ai';

export interface PersonalRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'schedule' | 'habits' | 'tools' | 'environment' | 'health';
  priority: number; // 1-10
  effort: 'low' | 'medium' | 'high'; // Implementation effort
  expectedImpact: 'low' | 'medium' | 'high';
  timeframe: string; // When to implement
  steps: string[];
  basedOn: string[]; // What data/patterns this is based on
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'improvement' | 'milestone' | 'discovery';
  unlockedAt: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  progress?: number; // For progressive achievements
  criteria: string;
}

class ClientAnalyticsEngine {
  private dailyData: Map<string, DailyProductivityStats> = new Map();
  private patterns: BehaviorPattern[] = [];
  private insights: ProductivityInsight[] = [];
  private recommendations: PersonalRecommendation[] = [];
  private achievements: Achievement[] = [];
  private lastAnalysisTime: Date = new Date(0);
  private static instance: ClientAnalyticsEngine;

  static getInstance(): ClientAnalyticsEngine {
    if (!ClientAnalyticsEngine.instance) {
      ClientAnalyticsEngine.instance = new ClientAnalyticsEngine();
      ClientAnalyticsEngine.instance.initialize();
    }
    return ClientAnalyticsEngine.instance;
  }

  private initialize() {
    this.loadStoredData();
    this.startPeriodicAnalysis();
    this.setupDataCollection();
  }

  // Start collecting behavioral data
  private setupDataCollection() {
    // Listen for productivity state changes
    setInterval(async () => {
      await this.collectCurrentData();
    }, 300000); // Every 5 minutes

    // End of day analysis
    this.scheduleEndOfDayAnalysis();
  }

  private async collectCurrentData() {
    try {
      const state = await productivityStateDetector.getCurrentState();
      const today = new Date().toISOString().split('T')[0];

      let dailyStats = this.dailyData.get(today);
      if (!dailyStats) {
        dailyStats = this.createEmptyDailyStats(today);
        this.dailyData.set(today, dailyStats);
      }

      this.updateDailyStats(dailyStats, state);

    } catch (error) {
      console.warn('Failed to collect analytics data:', error);
    }
  }

  private createEmptyDailyStats(date: string): DailyProductivityStats {
    return {
      date,
      totalActiveTime: 0,
      focusTime: 0,
      distractionEvents: 0,
      tasksCompleted: 0,
      energyLevels: [],
      productivityScore: 0,
      topProductiveHours: [],
      stateDistribution: {
        'focused': 0,
        'distracted': 0,
        'overwhelmed': 0,
        'energized': 0,
        'tired': 0,
        'planning': 0,
        'deep-work': 0
      },
      breaksTaken: 0,
      peakFlowDuration: 0
    };
  }

  private updateDailyStats(stats: DailyProductivityStats, state: ProductivityState) {
    const hour = new Date().getHours();

    // Update active time (5-minute intervals)
    stats.totalActiveTime += 5;

    // Update focus time if in focused states
    if (['focused', 'deep-work'].includes(state.currentState)) {
      stats.focusTime += 5;
    }

    // Track distraction events
    if (state.currentState === 'distracted') {
      stats.distractionEvents += 1;
    }

    // Update energy levels
    const existingEnergyData = stats.energyLevels.find(e => e.hour === hour);
    if (existingEnergyData) {
      existingEnergyData.energy = (existingEnergyData.energy + state.energyLevel) / 2;
    } else {
      stats.energyLevels.push({ hour, energy: state.energyLevel });
    }

    // Update state distribution
    stats.stateDistribution[state.currentState] += 1;

    // Calculate productivity score
    stats.productivityScore = this.calculateProductivityScore(stats);
  }

  private calculateProductivityScore(stats: DailyProductivityStats): number {
    if (stats.totalActiveTime === 0) return 0;

    const focusRatio = stats.focusTime / stats.totalActiveTime;
    const distractionPenalty = Math.min(0.3, stats.distractionEvents * 0.02);
    const baseScore = focusRatio * 100;

    return Math.max(0, Math.min(100, baseScore - (distractionPenalty * 100)));
  }

  // Pattern Recognition
  private async analyzePatterns() {
    const recentData = this.getRecentDailyData(14); // Last 14 days
    const newPatterns: BehaviorPattern[] = [];

    // Energy pattern analysis
    const energyPattern = this.analyzeEnergyPatterns(recentData);
    if (energyPattern) newPatterns.push(energyPattern);

    // Focus pattern analysis
    const focusPattern = this.analyzeFocusPatterns(recentData);
    if (focusPattern) newPatterns.push(focusPattern);

    // Consistency pattern analysis
    const consistencyPattern = this.analyzeConsistencyPatterns(recentData);
    if (consistencyPattern) newPatterns.push(consistencyPattern);

    // Time-of-day patterns
    const timingPatterns = this.analyzeTimingPatterns(recentData);
    newPatterns.push(...timingPatterns);

    // Update patterns list (keep only recent and relevant ones)
    this.patterns = [
      ...newPatterns,
      ...this.patterns.filter(p =>
        Date.now() - p.discoveredAt.getTime() < 30 * 24 * 60 * 60 * 1000 // Keep for 30 days
      )
    ].slice(0, 20); // Keep only top 20 patterns

    console.log('🔍 Analytics: Discovered', newPatterns.length, 'new patterns');
  }

  private analyzeEnergyPatterns(data: DailyProductivityStats[]): BehaviorPattern | null {
    const allEnergyData = data.flatMap(d => d.energyLevels);
    if (allEnergyData.length < 20) return null;

    // Group by hour and calculate averages
    const hourlyAverages: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      const hourData = allEnergyData.filter(e => e.hour === hour);
      if (hourData.length > 0) {
        hourlyAverages[hour] = hourData.reduce((sum, e) => sum + e.energy, 0) / hourData.length;
      }
    }

    // Find peak hours
    const peakHours = Object.entries(hourlyAverages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Find low energy hours
    const lowHours = Object.entries(hourlyAverages)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)
      .map(([hour]) => parseInt(hour));

    return {
      id: `energy-pattern-${Date.now()}`,
      name: 'Personal Energy Rhythm',
      description: `Your energy peaks around ${peakHours.join(', ')} and dips around ${lowHours.join(', ')}`,
      frequency: 1.0, // This pattern occurs daily
      impact: 'positive',
      confidence: 0.8,
      examples: [
        `Highest energy at ${peakHours[0]}:00`,
        `Consistent low energy at ${lowHours[0]}:00`
      ],
      suggestions: [
        `Schedule important tasks during ${peakHours[0]}-${peakHours[1]} when your energy is highest`,
        `Take breaks or do lighter work around ${lowHours[0]}:00`,
        'Align your hardest work with your natural energy peaks'
      ],
      discoveredAt: new Date()
    };
  }

  private analyzeFocusPatterns(data: DailyProductivityStats[]): BehaviorPattern | null {
    const focusRatios = data.map(d => d.totalActiveTime > 0 ? d.focusTime / d.totalActiveTime : 0);
    if (focusRatios.length < 5) return null;

    const averageFocusRatio = focusRatios.reduce((sum, r) => sum + r, 0) / focusRatios.length;
    const consistency = 1 - (this.calculateStandardDeviation(focusRatios) / averageFocusRatio);

    const impact = averageFocusRatio > 0.6 ? 'positive' : averageFocusRatio < 0.3 ? 'negative' : 'neutral';

    return {
      id: `focus-pattern-${Date.now()}`,
      name: 'Focus Consistency',
      description: `Your focus time averages ${(averageFocusRatio * 100).toFixed(1)}% with ${(consistency * 100).toFixed(1)}% consistency`,
      frequency: consistency,
      impact,
      confidence: 0.7,
      examples: [
        `Average focus sessions: ${Math.round(averageFocusRatio * 480)} minutes per day`,
        `Focus consistency: ${(consistency * 100).toFixed(1)}%`
      ],
      suggestions: this.getFocusSuggestions(averageFocusRatio, consistency),
      discoveredAt: new Date()
    };
  }

  private analyzeConsistencyPatterns(data: DailyProductivityStats[]): BehaviorPattern | null {
    if (data.length < 7) return null;

    const scores = data.map(d => d.productivityScore);
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const consistency = 1 - (this.calculateStandardDeviation(scores) / 100);

    return {
      id: `consistency-pattern-${Date.now()}`,
      name: 'Productivity Consistency',
      description: `Your productivity varies by ${((1 - consistency) * 100).toFixed(1)}% day-to-day`,
      frequency: consistency,
      impact: consistency > 0.7 ? 'positive' : 'neutral',
      confidence: 0.8,
      examples: [
        `Average daily score: ${average.toFixed(1)}`,
        `Consistency rating: ${(consistency * 100).toFixed(1)}%`
      ],
      suggestions: this.getConsistencySuggestions(consistency),
      discoveredAt: new Date()
    };
  }

  private analyzeTimingPatterns(data: DailyProductivityStats[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];

    // Analyze most productive hours across all days
    const hourlyProductivity: Record<number, number[]> = {};

    data.forEach(day => {
      // For each hour, estimate productivity based on focus time and energy
      for (let hour = 0; hour < 24; hour++) {
        const energyData = day.energyLevels.find(e => e.hour === hour);
        if (energyData) {
          if (!hourlyProductivity[hour]) hourlyProductivity[hour] = [];

          // Estimate hourly productivity based on energy and overall day performance
          const hourProductivity = (energyData.energy / 100) * day.productivityScore;
          hourlyProductivity[hour].push(hourProductivity);
        }
      }
    });

    // Find top productive hours
    const hourAverages = Object.entries(hourlyProductivity)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avg: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        consistency: 1 - this.calculateStandardDeviation(scores) / 100
      }))
      .filter(h => h.avg > 0)
      .sort((a, b) => b.avg - a.avg);

    if (hourAverages.length >= 3) {
      const topHours = hourAverages.slice(0, 3);

      patterns.push({
        id: `timing-pattern-${Date.now()}`,
        name: 'Optimal Productivity Hours',
        description: `You're most productive between ${topHours[0].hour}:00-${topHours[2].hour}:00`,
        frequency: 0.8,
        impact: 'positive',
        confidence: 0.75,
        examples: [
          `Peak productivity at ${topHours[0].hour}:00 (${topHours[0].avg.toFixed(1)} avg score)`,
          `Consistent performance at ${topHours[1].hour}:00`
        ],
        suggestions: [
          `Block ${topHours[0].hour}:00-${topHours[0].hour + 2}:00 for your most important work`,
          'Protect these hours from meetings and distractions',
          'Use these times for creative or analytical tasks'
        ],
        discoveredAt: new Date()
      });
    }

    return patterns;
  }

  // Insight Generation
  private generateInsights() {
    const recentData = this.getRecentDailyData(7);
    const newInsights: ProductivityInsight[] = [];

    // Energy insights
    const energyInsight = this.generateEnergyInsight(recentData);
    if (energyInsight) newInsights.push(energyInsight);

    // Focus insights
    const focusInsight = this.generateFocusInsight(recentData);
    if (focusInsight) newInsights.push(focusInsight);

    // Trend insights
    const trendInsight = this.generateTrendInsight(recentData);
    if (trendInsight) newInsights.push(trendInsight);

    // Pattern-based insights
    const patternInsights = this.generatePatternInsights();
    newInsights.push(...patternInsights);

    // Update insights (keep recent ones)
    this.insights = [
      ...newInsights,
      ...this.insights.filter(i =>
        Date.now() - i.generatedAt.getTime() < 7 * 24 * 60 * 60 * 1000 // Keep for 7 days
      )
    ].slice(0, 15);

    console.log('💡 Analytics: Generated', newInsights.length, 'new insights');
  }

  private generateEnergyInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const allEnergyData = data.flatMap(d => d.energyLevels);
    const averageEnergy = allEnergyData.reduce((sum, e) => sum + e.energy, 0) / allEnergyData.length;

    let impact = '';
    let importance: ProductivityInsight['importance'] = 'medium';

    if (averageEnergy > 75) {
      impact = 'Your high energy levels suggest you could take on more challenging projects';
      importance = 'high';
    } else if (averageEnergy < 40) {
      impact = 'Low energy levels may be affecting your productivity. Consider rest and wellness strategies';
      importance = 'high';
    } else {
      impact = 'Your energy levels are stable. Focus on optimizing energy management techniques';
    }

    return {
      id: `energy-insight-${Date.now()}`,
      title: 'Energy Level Analysis',
      description: `Your average energy level this week is ${averageEnergy.toFixed(1)}/100`,
      type: 'energy',
      importance,
      actionable: true,
      dataSource: `${data.length} days of energy tracking`,
      generatedAt: new Date(),
      confidence: 0.8,
      impact
    };
  }

  private generateFocusInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const totalFocus = data.reduce((sum, d) => sum + d.focusTime, 0);
    const totalActive = data.reduce((sum, d) => sum + d.totalActiveTime, 0);
    const focusRatio = totalActive > 0 ? totalFocus / totalActive : 0;

    const averageDaily = totalFocus / data.length;

    return {
      id: `focus-insight-${Date.now()}`,
      title: 'Focus Time Analysis',
      description: `You maintain focus for ${(focusRatio * 100).toFixed(1)}% of your active time (${averageDaily.toFixed(0)} min/day)`,
      type: 'focus',
      importance: focusRatio < 0.3 ? 'high' : focusRatio > 0.6 ? 'medium' : 'medium',
      actionable: true,
      dataSource: `${data.length} days of focus tracking`,
      generatedAt: new Date(),
      confidence: 0.85,
      impact: focusRatio < 0.3 ?
        'Improving focus could significantly boost your productivity' :
        'Your focus levels are good. Consider techniques to extend focus sessions'
    };
  }

  private generateTrendInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 5) return null;

    const scores = data.map(d => d.productivityScore);
    const trend = this.calculateTrend(scores);
    const change = Math.abs(trend) * scores.length;

    if (Math.abs(change) < 5) return null; // No significant trend

    const direction = trend > 0 ? 'improving' : 'declining';
    const strength = Math.abs(change) > 15 ? 'significantly' : 'gradually';

    return {
      id: `trend-insight-${Date.now()}`,
      title: `Productivity Trend: ${direction}`,
      description: `Your productivity has been ${strength} ${direction} by ${change.toFixed(1)} points`,
      type: 'performance',
      importance: Math.abs(change) > 15 ? 'high' : 'medium',
      actionable: true,
      dataSource: `${data.length} days trend analysis`,
      generatedAt: new Date(),
      confidence: 0.7,
      impact: direction === 'improving' ?
        'Keep up the positive momentum with your current strategies' :
        'Consider identifying what might be affecting your productivity recently'
    };
  }

  private generatePatternInsights(): ProductivityInsight[] {
    return this.patterns.slice(0, 3).map(pattern => ({
      id: `pattern-insight-${pattern.id}`,
      title: `Pattern Discovery: ${pattern.name}`,
      description: pattern.description,
      type: 'habits' as const,
      importance: pattern.impact === 'positive' ? 'medium' : 'high',
      actionable: true,
      dataSource: 'Behavioral pattern analysis',
      generatedAt: new Date(),
      confidence: pattern.confidence,
      impact: pattern.suggestions[0] || 'Consider how this pattern affects your productivity'
    }));
  }

  // Recommendation Generation
  private generateRecommendations() {
    const newRecommendations: PersonalRecommendation[] = [];

    // Schedule-based recommendations
    const scheduleRecs = this.generateScheduleRecommendations();
    newRecommendations.push(...scheduleRecs);

    // Habit-based recommendations
    const habitRecs = this.generateHabitRecommendations();
    newRecommendations.push(...habitRecs);

    // Tool recommendations
    const toolRecs = this.generateToolRecommendations();
    newRecommendations.push(...toolRecs);

    // Update recommendations
    this.recommendations = [
      ...newRecommendations,
      ...this.recommendations.filter(r =>
        Date.now() - r.createdAt.getTime() < 14 * 24 * 60 * 60 * 1000 // Keep for 14 days
      )
    ].slice(0, 10);

    console.log('🎯 Analytics: Generated', newRecommendations.length, 'new recommendations');
  }

  private generateScheduleRecommendations(): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];
    const recentData = this.getRecentDailyData(7);

    // Find energy patterns for scheduling
    const energyPattern = this.patterns.find(p => p.name.includes('Energy'));
    if (energyPattern) {
      recommendations.push({
        id: `schedule-rec-${Date.now()}`,
        title: 'Optimize Your Daily Schedule',
        description: 'Align your most important tasks with your natural energy peaks',
        category: 'schedule',
        priority: 8,
        effort: 'low',
        expectedImpact: 'high',
        timeframe: 'This week',
        steps: [
          'Identify your 3 most important daily tasks',
          'Schedule them during your peak energy hours',
          'Move routine tasks to lower energy periods',
          'Block calendar time for deep work during peak hours'
        ],
        basedOn: ['Energy rhythm analysis', 'Performance data'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private generateHabitRecommendations(): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];
    const recentData = this.getRecentDailyData(7);

    const averageFocusTime = recentData.reduce((sum, d) => sum + d.focusTime, 0) / recentData.length;

    if (averageFocusTime < 120) { // Less than 2 hours of focus per day
      recommendations.push({
        id: `habit-rec-${Date.now()}`,
        title: 'Build Stronger Focus Habits',
        description: 'Gradually increase your daily focus time through consistent practice',
        category: 'habits',
        priority: 9,
        effort: 'medium',
        expectedImpact: 'high',
        timeframe: 'Next 2 weeks',
        steps: [
          'Start with 25-minute focus sessions (Pomodoro)',
          'Take 5-minute breaks between sessions',
          'Gradually increase session length to 45 minutes',
          'Track your progress daily',
          'Eliminate distractions during focus time'
        ],
        basedOn: ['Focus time analysis', 'Behavioral patterns'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private generateToolRecommendations(): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];
    const recentData = this.getRecentDailyData(7);

    const averageDistractions = recentData.reduce((sum, d) => sum + d.distractionEvents, 0) / recentData.length;

    if (averageDistractions > 5) {
      recommendations.push({
        id: `tool-rec-${Date.now()}`,
        title: 'Use Focus Enhancement Tools',
        description: 'Leverage built-in features to reduce distractions and maintain concentration',
        category: 'tools',
        priority: 7,
        effort: 'low',
        expectedImpact: 'medium',
        timeframe: 'Today',
        steps: [
          'Enable Focus Mode during work sessions',
          'Use the Pomodoro timer for structured work blocks',
          'Set up smart notifications to reduce interruptions',
          'Try the distraction-free dashboard layout'
        ],
        basedOn: ['Distraction event analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  // Achievement Detection
  private checkForAchievements() {
    const newAchievements: Achievement[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todayData = this.dailyData.get(today);

    if (!todayData) return;

    // Focus achievements
    if (todayData.focusTime >= 240 && !this.hasAchievement('focus-master-daily')) { // 4 hours
      newAchievements.push({
        id: 'focus-master-daily',
        title: 'Focus Master',
        description: 'Maintained focus for 4+ hours in a single day',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Focus time >= 4 hours in one day'
      });
    }

    // Consistency achievements
    const recentDays = this.getRecentDailyData(7);
    if (recentDays.length === 7 && recentDays.every(d => d.productivityScore > 70)) {
      if (!this.hasAchievement('consistency-champion')) {
        newAchievements.push({
          id: 'consistency-champion',
          title: 'Consistency Champion',
          description: 'Maintained 70+ productivity score for 7 consecutive days',
          category: 'consistency',
          unlockedAt: new Date(),
          rarity: 'rare',
          criteria: 'Productivity score > 70 for 7 consecutive days'
        });
      }
    }

    // Pattern discovery achievements
    if (this.patterns.length >= 5 && !this.hasAchievement('pattern-discoverer')) {
      newAchievements.push({
        id: 'pattern-discoverer',
        title: 'Pattern Discoverer',
        description: 'Discovered 5 unique behavioral patterns',
        category: 'discovery',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Discovered 5 behavioral patterns'
      });
    }

    this.achievements.push(...newAchievements);

    if (newAchievements.length > 0) {
      console.log('🏆 Analytics: Unlocked', newAchievements.length, 'new achievements');
    }
  }

  private hasAchievement(id: string): boolean {
    return this.achievements.some(a => a.id === id);
  }

  // Helper methods
  private getRecentDailyData(days: number): DailyProductivityStats[] {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates
      .map(date => this.dailyData.get(date))
      .filter(data => data !== undefined) as DailyProductivityStats[];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = values.reduce((sum, _, index) => sum + (index * index), 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private getFocusSuggestions(ratio: number, consistency: number): string[] {
    const suggestions = [];

    if (ratio < 0.3) {
      suggestions.push('Try the Pomodoro Technique to build focus habits');
      suggestions.push('Identify and eliminate your main distractions');
    } else if (ratio > 0.6) {
      suggestions.push('Consider extending your focus sessions gradually');
      suggestions.push('Share your focus techniques with others');
    }

    if (consistency < 0.5) {
      suggestions.push('Work on maintaining consistent daily routines');
      suggestions.push('Track what affects your focus day-to-day');
    }

    return suggestions;
  }

  private getConsistencySuggestions(consistency: number): string[] {
    if (consistency > 0.7) {
      return [
        'Your consistency is excellent - maintain your current routines',
        'Consider mentoring others on productivity consistency'
      ];
    } else if (consistency > 0.5) {
      return [
        'Work on stabilizing your daily routines',
        'Identify factors that cause productivity swings'
      ];
    } else {
      return [
        'Focus on building consistent daily habits',
        'Start with small, achievable daily goals',
        'Track what works best for you each day'
      ];
    }
  }

  // Periodic analysis
  private startPeriodicAnalysis() {
    // Run analysis every hour
    setInterval(() => {
      this.runAnalysis();
    }, 3600000);

    // Run end-of-day analysis
    this.scheduleEndOfDayAnalysis();
  }

  private scheduleEndOfDayAnalysis() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Midnight

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.runEndOfDayAnalysis();
      // Schedule next day
      setInterval(() => {
        this.runEndOfDayAnalysis();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntilMidnight);
  }

  private async runAnalysis() {
    const now = Date.now();
    if (now - this.lastAnalysisTime.getTime() < 1800000) return; // Don't run more than every 30 minutes

    console.log('🔬 Running periodic analytics analysis...');

    try {
      await this.analyzePatterns();
      this.generateInsights();
      this.generateRecommendations();
      this.checkForAchievements();

      this.lastAnalysisTime = new Date();
      this.saveData();

    } catch (error) {
      console.error('Analytics analysis failed:', error);
    }
  }

  private runEndOfDayAnalysis() {
    console.log('🌙 Running end-of-day analytics analysis...');
    this.runAnalysis();
  }

  // Data persistence
  private saveData() {
    try {
      const data = {
        dailyData: Array.from(this.dailyData.entries()),
        patterns: this.patterns,
        insights: this.insights,
        recommendations: this.recommendations,
        achievements: this.achievements
      };

      localStorage.setItem('beproductive-analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  private loadStoredData() {
    try {
      const stored = localStorage.getItem('beproductive-analytics');
      if (stored) {
        const data = JSON.parse(stored);

        this.dailyData = new Map(data.dailyData || []);
        this.patterns = data.patterns || [];
        this.insights = data.insights || [];
        this.recommendations = data.recommendations || [];
        this.achievements = data.achievements || [];

        console.log('📈 Analytics: Loaded stored data');
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }

  // Public API
  getAnalyticsData(): AnalyticsData {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.dailyData.get(today) || this.createEmptyDailyStats(today);

    return {
      dailyStats: todayStats,
      weeklyTrends: this.calculateWeeklyTrends(),
      behaviorPatterns: [...this.patterns],
      insights: [...this.insights],
      recommendations: [...this.recommendations],
      achievements: [...this.achievements]
    };
  }

  private calculateWeeklyTrends(): WeeklyTrend[] {
    // Implementation for weekly trend calculation
    // This would analyze data week by week
    return [];
  }

  trackTaskCompletion() {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.dailyData.get(today) || this.createEmptyDailyStats(today);
    stats.tasksCompleted += 1;
    this.dailyData.set(today, stats);
  }

  trackBreakTaken() {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.dailyData.get(today) || this.createEmptyDailyStats(today);
    stats.breaksTaken += 1;
    this.dailyData.set(today, stats);
  }

  forceAnalysis() {
    this.runAnalysis();
  }

  clearData() {
    this.dailyData.clear();
    this.patterns = [];
    this.insights = [];
    this.recommendations = [];
    this.achievements = [];
    localStorage.removeItem('beproductive-analytics');
  }

  getStats() {
    return {
      daysTracked: this.dailyData.size,
      patternsDiscovered: this.patterns.length,
      insightsGenerated: this.insights.length,
      recommendationsActive: this.recommendations.length,
      achievementsUnlocked: this.achievements.length
    };
  }
}

// Export singleton and hook
export const clientAnalyticsEngine = ClientAnalyticsEngine.getInstance();

export const useClientAnalytics = () => {
  const getRecentInsights = async (limit: number = 5): Promise<ProductivityInsight[]> => {
    try {
      const data = clientAnalyticsEngine.getAnalyticsData();
      return data.insights.slice(-limit).reverse();
    } catch (error) {
      console.warn('Failed to get recent insights:', error);
      return [];
    }
  };

  const getTodayStats = async (): Promise<DailyProductivityStats | null> => {
    try {
      const data = clientAnalyticsEngine.getAnalyticsData();
      return data.dailyStats;
    } catch (error) {
      console.warn('Failed to get today stats:', error);
      return null;
    }
  };

  const generateInsight = async (type: string, context?: any): Promise<ProductivityInsight | null> => {
    try {
      // Mock insight generation - in real app this would use AI
      const insights = {
        focus: {
          id: Date.now().toString(),
          title: 'Focus Pattern Detected',
          description: 'You tend to be most focused in the morning hours',
          type: 'focus' as const,
          importance: 'medium' as const,
          actionable: true,
          dataSource: 'client-analytics',
          generatedAt: new Date(),
          confidence: 0.8,
          impact: 'Improved focus during peak hours',
          category: 'focus',
          relevantTimeframe: 'week'
        }
      };
      return insights[type as keyof typeof insights] || null;
    } catch (error) {
      console.warn('Failed to generate insight:', error);
      return null;
    }
  };

  return {
    getAnalyticsData: clientAnalyticsEngine.getAnalyticsData.bind(clientAnalyticsEngine),
    trackTaskCompletion: clientAnalyticsEngine.trackTaskCompletion.bind(clientAnalyticsEngine),
    trackBreakTaken: clientAnalyticsEngine.trackBreakTaken.bind(clientAnalyticsEngine),
    forceAnalysis: clientAnalyticsEngine.forceAnalysis.bind(clientAnalyticsEngine),
    getStats: clientAnalyticsEngine.getStats.bind(clientAnalyticsEngine),
    getRecentInsights,
    getTodayStats,
    generateInsight
  };
};