/**
 * Analytics Pattern Recognition Module
 * Advanced algorithms for discovering behavioral and productivity patterns
 */

import type {
  DailyProductivityStats,
  BehaviorPattern,
  PatternAnalysisResult
} from './types';

export class PatternRecognitionService {
  private patterns: BehaviorPattern[] = [];

  /**
   * Analyze all patterns from recent data
   */
  async analyzePatterns(recentData: DailyProductivityStats[]): Promise<PatternAnalysisResult> {
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

    console.log('🔍 Pattern Recognition: Discovered', newPatterns.length, 'new patterns');

    return {
      energyPattern,
      focusPattern,
      consistencyPattern,
      timingPatterns
    };
  }

  /**
   * Analyze personal energy rhythm patterns
   */
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

  /**
   * Analyze focus consistency patterns
   */
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

  /**
   * Analyze productivity consistency patterns
   */
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

  /**
   * Analyze optimal timing patterns
   */
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

  /**
   * Calculate standard deviation for consistency analysis
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Generate focus-specific suggestions
   */
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

  /**
   * Generate consistency-specific suggestions
   */
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

  /**
   * Get all discovered patterns
   */
  getPatterns(): BehaviorPattern[] {
    return [...this.patterns];
  }

  /**
   * Set patterns (for loading from storage)
   */
  setPatterns(patterns: BehaviorPattern[]): void {
    this.patterns = patterns;
  }

  /**
   * Clear all patterns
   */
  clearPatterns(): void {
    this.patterns = [];
  }

  /**
   * Get pattern statistics
   */
  getPatternStats() {
    const impactCounts = this.patterns.reduce((acc, p) => {
      acc[p.impact] = (acc[p.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPatterns: this.patterns.length,
      impactDistribution: impactCounts,
      averageConfidence: this.patterns.reduce((sum, p) => sum + p.confidence, 0) / this.patterns.length,
      mostRecentPattern: this.patterns.sort((a, b) =>
        b.discoveredAt.getTime() - a.discoveredAt.getTime()
      )[0]
    };
  }
}