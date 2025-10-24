/**
 * Analytics Recommendation Engine Module
 * Generates personalized productivity recommendations based on behavioral patterns
 */

import type {
  DailyProductivityStats,
  BehaviorPattern,
  PersonalRecommendation,
  RecommendationContext
} from './types';

export class RecommendationEngineService {
  private recommendations: PersonalRecommendation[] = [];

  /**
   * Generate comprehensive recommendations
   */
  generateRecommendations(context: RecommendationContext): PersonalRecommendation[] {
    const { recentData, patterns, currentChallenges = [], userGoals = [] } = context;
    const newRecommendations: PersonalRecommendation[] = [];

    // Schedule-based recommendations
    const scheduleRecs = this.generateScheduleRecommendations(recentData, patterns);
    newRecommendations.push(...scheduleRecs);

    // Habit-based recommendations
    const habitRecs = this.generateHabitRecommendations(recentData);
    newRecommendations.push(...habitRecs);

    // Tool recommendations
    const toolRecs = this.generateToolRecommendations(recentData);
    newRecommendations.push(...toolRecs);

    // Environment recommendations
    const environmentRecs = this.generateEnvironmentRecommendations(patterns);
    newRecommendations.push(...environmentRecs);

    // Health and wellness recommendations
    const healthRecs = this.generateHealthRecommendations(recentData);
    newRecommendations.push(...healthRecs);

    // Update recommendations
    this.recommendations = [
      ...newRecommendations,
      ...this.recommendations.filter(r =>
        Date.now() - r.createdAt.getTime() < 14 * 24 * 60 * 60 * 1000 // Keep for 14 days
      )
    ].slice(0, 10);

    console.log('🎯 Recommendation Engine: Generated', newRecommendations.length, 'new recommendations');

    return newRecommendations;
  }

  /**
   * Generate schedule optimization recommendations
   */
  private generateScheduleRecommendations(
    recentData: DailyProductivityStats[],
    patterns: BehaviorPattern[]
  ): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];

    // Find energy patterns for scheduling
    const energyPattern = patterns.find(p => p.name.includes('Energy'));
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

    // Time blocking recommendation
    const averageFocusTime = recentData.reduce((sum, d) => sum + d.focusTime, 0) / recentData.length;
    if (averageFocusTime > 60 && averageFocusTime < 180) {
      recommendations.push({
        id: `timeblock-rec-${Date.now()}`,
        title: 'Implement Strategic Time Blocking',
        description: 'Create protected time blocks for your most important work',
        category: 'schedule',
        priority: 7,
        effort: 'medium',
        expectedImpact: 'high',
        timeframe: 'Next week',
        steps: [
          'Block 2-3 hour chunks for deep work',
          'Schedule buffer time between meetings',
          'Group similar tasks together',
          'Protect your peak productivity hours'
        ],
        basedOn: ['Focus time analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Generate habit-building recommendations
   */
  private generateHabitRecommendations(recentData: DailyProductivityStats[]): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];

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

    // Morning routine recommendation
    const morningProductivity = this.analyzeMorningProductivity(recentData);
    if (morningProductivity.potential) {
      recommendations.push({
        id: `morning-rec-${Date.now()}`,
        title: 'Optimize Your Morning Routine',
        description: 'Leverage your natural morning energy for better productivity',
        category: 'habits',
        priority: 6,
        effort: 'low',
        expectedImpact: 'medium',
        timeframe: 'Starting tomorrow',
        steps: [
          'Wake up 30 minutes earlier',
          'Start with your most important task',
          'Avoid checking emails/social media first thing',
          'Establish a consistent morning ritual'
        ],
        basedOn: ['Morning energy analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Generate tool and technology recommendations
   */
  private generateToolRecommendations(recentData: DailyProductivityStats[]): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];

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

    // Task management recommendation
    const averageTasks = recentData.reduce((sum, d) => sum + d.tasksCompleted, 0) / recentData.length;
    if (averageTasks < 3) {
      recommendations.push({
        id: `taskmanagement-rec-${Date.now()}`,
        title: 'Improve Task Management System',
        description: 'Establish better task tracking and completion workflows',
        category: 'tools',
        priority: 8,
        effort: 'medium',
        expectedImpact: 'high',
        timeframe: 'This week',
        steps: [
          'Set up a daily task list with 3-5 clear items',
          'Use the task priority system',
          'Track time spent on different task types',
          'Review completed tasks at end of day'
        ],
        basedOn: ['Task completion analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Generate environment optimization recommendations
   */
  private generateEnvironmentRecommendations(patterns: BehaviorPattern[]): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];

    // Focus environment recommendation
    const focusPattern = patterns.find(p => p.name.includes('Focus'));
    if (focusPattern && focusPattern.impact !== 'positive') {
      recommendations.push({
        id: `environment-rec-${Date.now()}`,
        title: 'Optimize Your Work Environment',
        description: 'Create an environment that naturally supports sustained focus',
        category: 'environment',
        priority: 6,
        effort: 'medium',
        expectedImpact: 'medium',
        timeframe: 'This weekend',
        steps: [
          'Declutter your workspace',
          'Ensure proper lighting and ergonomics',
          'Remove or silence distracting devices',
          'Create a dedicated focus zone',
          'Use noise-canceling headphones or white noise'
        ],
        basedOn: ['Focus pattern analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Generate health and wellness recommendations
   */
  private generateHealthRecommendations(recentData: DailyProductivityStats[]): PersonalRecommendation[] {
    const recommendations: PersonalRecommendation[] = [];

    // Break frequency analysis
    const averageBreaks = recentData.reduce((sum, d) => sum + d.breaksTaken, 0) / recentData.length;
    const averageFocusTime = recentData.reduce((sum, d) => sum + d.focusTime, 0) / recentData.length;

    if (averageBreaks < 3 && averageFocusTime > 120) {
      recommendations.push({
        id: `health-rec-${Date.now()}`,
        title: 'Increase Break Frequency',
        description: 'Regular breaks can improve focus and prevent mental fatigue',
        category: 'health',
        priority: 5,
        effort: 'low',
        expectedImpact: 'medium',
        timeframe: 'Starting today',
        steps: [
          'Take a 5-minute break every 25-30 minutes',
          'Stand up and stretch during breaks',
          'Look away from screens to rest your eyes',
          'Take a longer break every 2 hours',
          'Use break reminders if needed'
        ],
        basedOn: ['Break frequency analysis'],
        createdAt: new Date()
      });
    }

    // Energy management recommendation
    const energyLevels = recentData.flatMap(d => d.energyLevels);
    const averageEnergy = energyLevels.reduce((sum, e) => sum + e.energy, 0) / energyLevels.length;

    if (averageEnergy < 50) {
      recommendations.push({
        id: `energy-rec-${Date.now()}`,
        title: 'Boost Energy Management',
        description: 'Improve your energy levels for better sustained productivity',
        category: 'health',
        priority: 8,
        effort: 'medium',
        expectedImpact: 'high',
        timeframe: 'Next 2 weeks',
        steps: [
          'Maintain consistent sleep schedule',
          'Take short walks during breaks',
          'Stay hydrated throughout the day',
          'Eat balanced meals at regular intervals',
          'Consider brief meditation or breathing exercises'
        ],
        basedOn: ['Energy level analysis'],
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Analyze morning productivity patterns
   */
  private analyzeMorningProductivity(data: DailyProductivityStats[]): { potential: boolean; score: number } {
    const morningHours = [6, 7, 8, 9, 10]; // 6 AM to 10 AM
    const morningEnergy = data.flatMap(d =>
      d.energyLevels.filter(e => morningHours.includes(e.hour))
    );

    if (morningEnergy.length === 0) return { potential: false, score: 0 };

    const averageMorningEnergy = morningEnergy.reduce((sum, e) => sum + e.energy, 0) / morningEnergy.length;
    const allEnergyLevels = data.flatMap(d => d.energyLevels);
    const overallAverage = allEnergyLevels.reduce((sum, e) => sum + e.energy, 0) / allEnergyLevels.length;

    return {
      potential: averageMorningEnergy > overallAverage * 1.1, // 10% higher than average
      score: averageMorningEnergy
    };
  }

  /**
   * Get all recommendations
   */
  getRecommendations(): PersonalRecommendation[] {
    return [...this.recommendations];
  }

  /**
   * Get recommendations by category
   */
  getRecommendationsByCategory(category: PersonalRecommendation['category']): PersonalRecommendation[] {
    return this.recommendations.filter(r => r.category === category);
  }

  /**
   * Get high-priority recommendations
   */
  getHighPriorityRecommendations(): PersonalRecommendation[] {
    return this.recommendations.filter(r => r.priority >= 7).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Set recommendations (for loading from storage)
   */
  setRecommendations(recommendations: PersonalRecommendation[]): void {
    this.recommendations = recommendations;
  }

  /**
   * Clear all recommendations
   */
  clearRecommendations(): void {
    this.recommendations = [];
  }

  /**
   * Get recommendation statistics
   */
  getRecommendationStats() {
    const categoryCounts = this.recommendations.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const effortCounts = this.recommendations.reduce((acc, r) => {
      acc[r.effort] = (acc[r.effort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const impactCounts = this.recommendations.reduce((acc, r) => {
      acc[r.expectedImpact] = (acc[r.expectedImpact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecommendations: this.recommendations.length,
      categoryDistribution: categoryCounts,
      effortDistribution: effortCounts,
      impactDistribution: impactCounts,
      averagePriority: this.recommendations.reduce((sum, r) => sum + r.priority, 0) / this.recommendations.length,
      highPriorityCount: this.recommendations.filter(r => r.priority >= 7).length
    };
  }
}