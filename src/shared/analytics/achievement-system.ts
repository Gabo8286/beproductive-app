/**
 * Analytics Achievement System Module
 * Detects and manages productivity achievements and milestones
 */

import type {
  DailyProductivityStats,
  Achievement,
  BehaviorPattern
} from './types';

export class AchievementSystemService {
  private achievements: Achievement[] = [];

  /**
   * Check for new achievements based on current data
   */
  checkForAchievements(
    todayData: DailyProductivityStats,
    recentData: DailyProductivityStats[],
    patterns: BehaviorPattern[]
  ): Achievement[] {
    const newAchievements: Achievement[] = [];

    // Focus achievements
    const focusAchievements = this.checkFocusAchievements(todayData, recentData);
    newAchievements.push(...focusAchievements);

    // Consistency achievements
    const consistencyAchievements = this.checkConsistencyAchievements(recentData);
    newAchievements.push(...consistencyAchievements);

    // Pattern discovery achievements
    const patternAchievements = this.checkPatternAchievements(patterns);
    newAchievements.push(...patternAchievements);

    // Productivity achievements
    const productivityAchievements = this.checkProductivityAchievements(todayData, recentData);
    newAchievements.push(...productivityAchievements);

    // Milestone achievements
    const milestoneAchievements = this.checkMilestoneAchievements(recentData);
    newAchievements.push(...milestoneAchievements);

    // Add new achievements
    this.achievements.push(...newAchievements);

    if (newAchievements.length > 0) {
      console.log('🏆 Achievement System: Unlocked', newAchievements.length, 'new achievements');
    }

    return newAchievements;
  }

  /**
   * Check for focus-related achievements
   */
  private checkFocusAchievements(
    todayData: DailyProductivityStats,
    recentData: DailyProductivityStats[]
  ): Achievement[] {
    const achievements: Achievement[] = [];

    // Daily focus master
    if (todayData.focusTime >= 240 && !this.hasAchievement('focus-master-daily')) { // 4 hours
      achievements.push({
        id: 'focus-master-daily',
        title: 'Focus Master',
        description: 'Maintained focus for 4+ hours in a single day',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Focus time >= 4 hours in one day'
      });
    }

    // Deep focus champion
    if (todayData.focusTime >= 360 && !this.hasAchievement('deep-focus-champion')) { // 6 hours
      achievements.push({
        id: 'deep-focus-champion',
        title: 'Deep Focus Champion',
        description: 'Achieved 6+ hours of focused work in one day',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'rare',
        criteria: 'Focus time >= 6 hours in one day'
      });
    }

    // Flow state achiever
    if (todayData.peakFlowDuration >= 120 && !this.hasAchievement('flow-state-achiever')) { // 2 hours continuous
      achievements.push({
        id: 'flow-state-achiever',
        title: 'Flow State Achiever',
        description: 'Maintained continuous focus for 2+ hours',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Continuous focus >= 2 hours'
      });
    }

    // Weekly focus consistency
    if (recentData.length >= 7) {
      const weeklyFocusHours = recentData.slice(0, 7).reduce((sum, d) => sum + d.focusTime, 0) / 60;
      if (weeklyFocusHours >= 20 && !this.hasAchievement('weekly-focus-consistency')) {
        achievements.push({
          id: 'weekly-focus-consistency',
          title: 'Weekly Focus Champion',
          description: 'Accumulated 20+ focus hours in a single week',
          category: 'consistency',
          unlockedAt: new Date(),
          rarity: 'uncommon',
          criteria: 'Focus time >= 20 hours per week'
        });
      }
    }

    return achievements;
  }

  /**
   * Check for consistency-related achievements
   */
  private checkConsistencyAchievements(recentData: DailyProductivityStats[]): Achievement[] {
    const achievements: Achievement[] = [];

    // 7-day consistency
    if (recentData.length >= 7 && recentData.slice(0, 7).every(d => d.productivityScore > 70)) {
      if (!this.hasAchievement('consistency-champion-7')) {
        achievements.push({
          id: 'consistency-champion-7',
          title: 'Consistency Champion',
          description: 'Maintained 70+ productivity score for 7 consecutive days',
          category: 'consistency',
          unlockedAt: new Date(),
          rarity: 'rare',
          criteria: 'Productivity score > 70 for 7 consecutive days'
        });
      }
    }

    // 30-day streak
    if (recentData.length >= 30 && recentData.slice(0, 30).every(d => d.productivityScore > 60)) {
      if (!this.hasAchievement('consistency-legend-30')) {
        achievements.push({
          id: 'consistency-legend-30',
          title: 'Consistency Legend',
          description: 'Maintained 60+ productivity score for 30 consecutive days',
          category: 'consistency',
          unlockedAt: new Date(),
          rarity: 'legendary',
          criteria: 'Productivity score > 60 for 30 consecutive days'
        });
      }
    }

    // Daily routine master
    if (recentData.length >= 14) {
      const recentTwoWeeks = recentData.slice(0, 14);
      const hasConsistentActiveTime = recentTwoWeeks.every(d => d.totalActiveTime >= 240); // 4+ hours
      if (hasConsistentActiveTime && !this.hasAchievement('routine-master')) {
        achievements.push({
          id: 'routine-master',
          title: 'Routine Master',
          description: 'Maintained consistent daily active time for 2 weeks',
          category: 'consistency',
          unlockedAt: new Date(),
          rarity: 'uncommon',
          criteria: 'Active time >= 4 hours for 14 consecutive days'
        });
      }
    }

    return achievements;
  }

  /**
   * Check for pattern discovery achievements
   */
  private checkPatternAchievements(patterns: BehaviorPattern[]): Achievement[] {
    const achievements: Achievement[] = [];

    // Pattern discoverer
    if (patterns.length >= 5 && !this.hasAchievement('pattern-discoverer')) {
      achievements.push({
        id: 'pattern-discoverer',
        title: 'Pattern Discoverer',
        description: 'Discovered 5 unique behavioral patterns',
        category: 'discovery',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Discovered 5 behavioral patterns'
      });
    }

    // Pattern expert
    if (patterns.length >= 15 && !this.hasAchievement('pattern-expert')) {
      achievements.push({
        id: 'pattern-expert',
        title: 'Pattern Expert',
        description: 'Discovered 15 unique behavioral patterns',
        category: 'discovery',
        unlockedAt: new Date(),
        rarity: 'rare',
        criteria: 'Discovered 15 behavioral patterns'
      });
    }

    // Insight master
    const positivePatterns = patterns.filter(p => p.impact === 'positive');
    if (positivePatterns.length >= 10 && !this.hasAchievement('insight-master')) {
      achievements.push({
        id: 'insight-master',
        title: 'Insight Master',
        description: 'Discovered 10 positive behavioral patterns',
        category: 'discovery',
        unlockedAt: new Date(),
        rarity: 'rare',
        criteria: 'Discovered 10 positive behavioral patterns'
      });
    }

    return achievements;
  }

  /**
   * Check for productivity achievements
   */
  private checkProductivityAchievements(
    todayData: DailyProductivityStats,
    recentData: DailyProductivityStats[]
  ): Achievement[] {
    const achievements: Achievement[] = [];

    // Productivity perfectionist
    if (todayData.productivityScore >= 95 && !this.hasAchievement('productivity-perfectionist')) {
      achievements.push({
        id: 'productivity-perfectionist',
        title: 'Productivity Perfectionist',
        description: 'Achieved 95+ productivity score in a single day',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'rare',
        criteria: 'Productivity score >= 95 in one day'
      });
    }

    // Task completion champion
    if (todayData.tasksCompleted >= 10 && !this.hasAchievement('task-champion-daily')) {
      achievements.push({
        id: 'task-champion-daily',
        title: 'Task Champion',
        description: 'Completed 10+ tasks in a single day',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Tasks completed >= 10 in one day'
      });
    }

    // Distraction-free day
    if (todayData.distractionEvents <= 1 && todayData.focusTime >= 120) {
      if (!this.hasAchievement('distraction-free-day')) {
        achievements.push({
          id: 'distraction-free-day',
          title: 'Distraction-Free Day',
          description: 'Maintained focus with minimal distractions for 2+ hours',
          category: 'milestone',
          unlockedAt: new Date(),
          rarity: 'uncommon',
          criteria: 'Distractions <= 1 and focus time >= 2 hours'
        });
      }
    }

    // Energy optimization
    const todayEnergyLevels = todayData.energyLevels;
    if (todayEnergyLevels.length > 0) {
      const averageEnergy = todayEnergyLevels.reduce((sum, e) => sum + e.energy, 0) / todayEnergyLevels.length;
      if (averageEnergy >= 80 && !this.hasAchievement('energy-optimizer')) {
        achievements.push({
          id: 'energy-optimizer',
          title: 'Energy Optimizer',
          description: 'Maintained high energy levels (80+) throughout the day',
          category: 'milestone',
          unlockedAt: new Date(),
          rarity: 'uncommon',
          criteria: 'Average daily energy >= 80'
        });
      }
    }

    return achievements;
  }

  /**
   * Check for milestone achievements
   */
  private checkMilestoneAchievements(recentData: DailyProductivityStats[]): Achievement[] {
    const achievements: Achievement[] = [];

    // First week achievement
    if (recentData.length >= 7 && !this.hasAchievement('first-week-complete')) {
      achievements.push({
        id: 'first-week-complete',
        title: 'First Week Complete',
        description: 'Successfully tracked productivity for your first week',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'common',
        criteria: 'Track productivity for 7 days'
      });
    }

    // First month achievement
    if (recentData.length >= 30 && !this.hasAchievement('first-month-complete')) {
      achievements.push({
        id: 'first-month-complete',
        title: 'First Month Complete',
        description: 'Successfully tracked productivity for your first month',
        category: 'milestone',
        unlockedAt: new Date(),
        rarity: 'uncommon',
        criteria: 'Track productivity for 30 days'
      });
    }

    // Improvement tracker
    if (recentData.length >= 14) {
      const firstWeek = recentData.slice(7, 14);
      const secondWeek = recentData.slice(0, 7);
      const firstWeekAvg = firstWeek.reduce((sum, d) => sum + d.productivityScore, 0) / firstWeek.length;
      const secondWeekAvg = secondWeek.reduce((sum, d) => sum + d.productivityScore, 0) / secondWeek.length;
      const improvement = secondWeekAvg - firstWeekAvg;

      if (improvement >= 10 && !this.hasAchievement('improvement-tracker')) {
        achievements.push({
          id: 'improvement-tracker',
          title: 'Improvement Tracker',
          description: 'Improved productivity by 10+ points week-over-week',
          category: 'improvement',
          unlockedAt: new Date(),
          rarity: 'uncommon',
          criteria: 'Week-over-week improvement >= 10 points'
        });
      }
    }

    return achievements;
  }

  /**
   * Check if an achievement exists
   */
  private hasAchievement(id: string): boolean {
    return this.achievements.some(a => a.id === id);
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.achievements.filter(a => a.rarity === rarity);
  }

  /**
   * Get recent achievements
   */
  getRecentAchievements(limit: number = 5): Achievement[] {
    return this.achievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Set achievements (for loading from storage)
   */
  setAchievements(achievements: Achievement[]): void {
    this.achievements = achievements;
  }

  /**
   * Clear all achievements
   */
  clearAchievements(): void {
    this.achievements = [];
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats() {
    const categoryCounts = this.achievements.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rarityCounts = this.achievements.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAchievements: this.achievements.length,
      categoryDistribution: categoryCounts,
      rarityDistribution: rarityCounts,
      latestAchievement: this.achievements
        .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())[0],
      achievementRate: this.calculateAchievementRate()
    };
  }

  /**
   * Calculate achievement rate (achievements per week)
   */
  private calculateAchievementRate(): number {
    if (this.achievements.length === 0) return 0;

    const oldest = this.achievements.reduce((oldest, current) =>
      current.unlockedAt < oldest.unlockedAt ? current : oldest
    );

    const weeksSinceFirst = (Date.now() - oldest.unlockedAt.getTime()) / (7 * 24 * 60 * 60 * 1000);
    return weeksSinceFirst > 0 ? this.achievements.length / weeksSinceFirst : 0;
  }
}