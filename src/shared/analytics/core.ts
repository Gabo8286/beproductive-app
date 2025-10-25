/**
 * Analytics Core Engine Module
 * Main orchestrator for the analytics system
 */

import type {
  AnalyticsData,
  AnalyticsEngineOptions,
  AnalyticsStats,
  DailyProductivityStats,
  WeeklyTrend,
  InsightGenerationContext,
  RecommendationContext
} from './types';

import { DataCollectionService } from '@/shared/analytics/data-collection';
import { PatternRecognitionService } from '@/shared/analytics/pattern-recognition';
import { InsightGenerationService } from '@/shared/analytics/insight-generation';
import { RecommendationEngineService } from '@/shared/analytics/recommendation-engine';
import { AchievementSystemService } from '@/shared/analytics/achievement-system';
import { AnalyticsStorageService } from '@/shared/analytics/storage';

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;

  private dataCollection: DataCollectionService;
  private patternRecognition: PatternRecognitionService;
  private insightGeneration: InsightGenerationService;
  private recommendationEngine: RecommendationEngineService;
  private achievementSystem: AchievementSystemService;
  private storage: AnalyticsStorageService;

  private lastAnalysisTime: Date = new Date(0);
  private analysisInterval?: NodeJS.Timeout;
  private endOfDayTimeout?: NodeJS.Timeout;

  private options: AnalyticsEngineOptions;

  private constructor(options: AnalyticsEngineOptions = {}) {
    this.options = {
      enableAutoSave: true,
      analysisInterval: 60, // minutes
      dataRetentionDays: 90,
      ...options
    };

    // Initialize services
    this.dataCollection = new DataCollectionService(this.onDataUpdate.bind(this));
    this.patternRecognition = new PatternRecognitionService();
    this.insightGeneration = new InsightGenerationService();
    this.recommendationEngine = new RecommendationEngineService();
    this.achievementSystem = new AchievementSystemService();
    this.storage = new AnalyticsStorageService();
  }

  /**
   * Get singleton instance
   */
  static getInstance(options?: AnalyticsEngineOptions): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine(options);
      AnalyticsEngine.instance.initialize();
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Initialize the analytics engine
   */
  private async initialize() {
    console.log('🔬 Analytics Engine: Initializing...');

    // Load stored data
    this.loadStoredData();

    // Start data collection and analysis
    this.startPeriodicAnalysis();
    this.dataCollection.startCollection(5); // Every 5 minutes
    this.scheduleEndOfDayAnalysis();

    console.log('🔬 Analytics Engine: Initialized successfully');
  }

  /**
   * Handle data updates from collection service
   */
  private onDataUpdate(stats: DailyProductivityStats) {
    if (this.options.enableAutoSave) {
      this.saveData();
    }
  }

  /**
   * Load stored data into all services
   */
  private loadStoredData() {
    try {
      const data = this.storage.loadData();
      if (data) {
        this.dataCollection.setDailyData(data.dailyData);
        this.patternRecognition.setPatterns(data.patterns);
        this.insightGeneration.setInsights(data.insights);
        this.recommendationEngine.setRecommendations(data.recommendations);
        this.achievementSystem.setAchievements(data.achievements);

        console.log('🔬 Analytics Engine: Stored data loaded');
      }
    } catch (error) {
      console.warn('🔬 Analytics Engine: Failed to load stored data:', error);
    }
  }

  /**
   * Save all data to storage
   */
  private saveData() {
    try {
      const success = this.storage.saveData({
        dailyData: this.dataCollection.getAllDailyData(),
        patterns: this.patternRecognition.getPatterns(),
        insights: this.insightGeneration.getInsights(),
        recommendations: this.recommendationEngine.getRecommendations(),
        achievements: this.achievementSystem.getAchievements()
      });

      if (!success) {
        console.warn('🔬 Analytics Engine: Data save failed');
      }
    } catch (error) {
      console.error('🔬 Analytics Engine: Save error:', error);
    }
  }

  /**
   * Start periodic analysis
   */
  private startPeriodicAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    // Run analysis every hour by default
    this.analysisInterval = setInterval(() => {
      this.runAnalysis();
    }, (this.options.analysisInterval || 60) * 60 * 1000);

    console.log(`🔬 Analytics Engine: Periodic analysis started (${this.options.analysisInterval}min intervals)`);
  }

  /**
   * Schedule end-of-day analysis
   */
  private scheduleEndOfDayAnalysis() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Midnight

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    this.endOfDayTimeout = setTimeout(() => {
      this.runEndOfDayAnalysis();
      // Schedule next day
      setInterval(() => {
        this.runEndOfDayAnalysis();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntilMidnight);

    console.log('🔬 Analytics Engine: End-of-day analysis scheduled');
  }

  /**
   * Run comprehensive analysis
   */
  private async runAnalysis() {
    const now = Date.now();
    if (now - this.lastAnalysisTime.getTime() < 30 * 60 * 1000) {
      return; // Don't run more than every 30 minutes
    }

    console.log('🔬 Analytics Engine: Running periodic analysis...');

    try {
      const recentData = this.dataCollection.getRecentDailyData(14);
      if (recentData.length === 0) {
        console.log('🔬 Analytics Engine: No data available for analysis');
        return;
      }

      // 1. Pattern Recognition
      const patternResult = await this.patternRecognition.analyzePatterns(recentData);

      // 2. Insight Generation
      const insightContext: InsightGenerationContext = {
        recentData: recentData.slice(0, 7), // Last 7 days for insights
        patterns: this.patternRecognition.getPatterns()
      };
      this.insightGeneration.generateInsights(insightContext);

      // 3. Recommendation Generation
      const recommendationContext: RecommendationContext = {
        ...insightContext,
        currentChallenges: this.identifyCurrentChallenges(recentData),
        userGoals: [] // Could be expanded to include user-defined goals
      };
      this.recommendationEngine.generateRecommendations(recommendationContext);

      // 4. Achievement Detection
      const todayStats = this.dataCollection.getTodayStats();
      const patterns = this.patternRecognition.getPatterns();
      this.achievementSystem.checkForAchievements(todayStats, recentData, patterns);

      this.lastAnalysisTime = new Date();

      if (this.options.enableAutoSave) {
        this.saveData();
      }

      console.log('🔬 Analytics Engine: Analysis completed successfully');

    } catch (error) {
      console.error('🔬 Analytics Engine: Analysis failed:', error);
    }
  }

  /**
   * Run end-of-day analysis
   */
  private runEndOfDayAnalysis() {
    console.log('🌙 Analytics Engine: Running end-of-day analysis...');
    this.runAnalysis();
  }

  /**
   * Identify current challenges from recent data
   */
  private identifyCurrentChallenges(recentData: DailyProductivityStats[]): string[] {
    const challenges: string[] = [];

    if (recentData.length === 0) return challenges;

    const averageFocus = recentData.reduce((sum, d) => sum + d.focusTime, 0) / recentData.length;
    const averageDistractions = recentData.reduce((sum, d) => sum + d.distractionEvents, 0) / recentData.length;
    const averageProductivity = recentData.reduce((sum, d) => sum + d.productivityScore, 0) / recentData.length;
    const averageBreaks = recentData.reduce((sum, d) => sum + d.breaksTaken, 0) / recentData.length;

    // Identify specific challenges
    if (averageFocus < 120) challenges.push('low-focus-time');
    if (averageDistractions > 5) challenges.push('high-distractions');
    if (averageProductivity < 60) challenges.push('low-productivity');
    if (averageBreaks < 2) challenges.push('insufficient-breaks');

    // Check for consistency issues
    const productivityScores = recentData.map(d => d.productivityScore);
    const consistency = this.calculateConsistency(productivityScores);
    if (consistency < 0.7) challenges.push('inconsistent-performance');

    return challenges;
  }

  /**
   * Calculate consistency metric
   */
  private calculateConsistency(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 1 - (standardDeviation / 100));
  }

  /**
   * Calculate weekly trends
   */
  private calculateWeeklyTrends(): WeeklyTrend[] {
    const trends: WeeklyTrend[] = [];
    const allData = this.dataCollection.getAllDailyData();

    // Group data by ISO week
    const weeklyData = new Map<string, DailyProductivityStats[]>();

    for (const [date, stats] of allData) {
      const dateObj = new Date(date);
      const weekNumber = this.getISOWeek(dateObj);
      const year = dateObj.getFullYear();
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, []);
      }
      weeklyData.get(weekKey)!.push(stats);
    }

    // Calculate trends for each week
    const sortedWeeks = Array.from(weeklyData.entries()).sort(([a], [b]) => a.localeCompare(b));

    for (let i = 0; i < sortedWeeks.length; i++) {
      const [week, data] = sortedWeeks[i];
      const averageProductivity = data.reduce((sum, d) => sum + d.productivityScore, 0) / data.length;
      const totalFocusTime = data.reduce((sum, d) => sum + d.focusTime, 0);

      // Calculate consistency
      const scores = data.map(d => d.productivityScore);
      const consistency = this.calculateConsistency(scores);

      // Calculate improvement from previous week
      let improvement = 0;
      if (i > 0) {
        const prevWeekData = sortedWeeks[i - 1][1];
        const prevAverage = prevWeekData.reduce((sum, d) => sum + d.productivityScore, 0) / prevWeekData.length;
        improvement = averageProductivity - prevAverage;
      }

      // Find best day
      const bestDay = data.reduce((best, current) =>
        current.productivityScore > best.productivityScore ? current : best
      );

      trends.push({
        week,
        averageProductivity,
        totalFocusTime,
        consistency,
        improvement,
        bestDay: bestDay.date,
        challengingAreas: this.identifyCurrentChallenges(data)
      });
    }

    return trends.slice(-12); // Last 12 weeks
  }

  /**
   * Get ISO week number
   */
  private getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Public API Methods

  /**
   * Get comprehensive analytics data
   */
  getAnalyticsData(): AnalyticsData {
    const todayStats = this.dataCollection.getTodayStats();

    return {
      dailyStats: todayStats,
      weeklyTrends: this.calculateWeeklyTrends(),
      behaviorPatterns: this.patternRecognition.getPatterns(),
      insights: this.insightGeneration.getInsights(),
      recommendations: this.recommendationEngine.getRecommendations(),
      achievements: this.achievementSystem.getAchievements()
    };
  }

  /**
   * Track task completion
   */
  trackTaskCompletion(): void {
    this.dataCollection.trackTaskCompletion();
  }

  /**
   * Track break taken
   */
  trackBreakTaken(): void {
    this.dataCollection.trackBreakTaken();
  }

  /**
   * Force immediate analysis
   */
  forceAnalysis(): void {
    this.runAnalysis();
  }

  /**
   * Get engine statistics
   */
  getStats(): AnalyticsStats {
    const collectionStats = this.dataCollection.getCollectionStats();
    const patternStats = this.patternRecognition.getPatternStats();
    const insightStats = this.insightGeneration.getInsightStats();
    const recommendationStats = this.recommendationEngine.getRecommendationStats();
    const achievementStats = this.achievementSystem.getAchievementStats();

    return {
      daysTracked: collectionStats.daysTracked,
      patternsDiscovered: patternStats.totalPatterns,
      insightsGenerated: insightStats.totalInsights,
      recommendationsActive: recommendationStats.totalRecommendations,
      achievementsUnlocked: achievementStats.totalAchievements
    };
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.dataCollection.clearData();
    this.patternRecognition.clearPatterns();
    this.insightGeneration.clearInsights();
    this.recommendationEngine.clearRecommendations();
    this.achievementSystem.clearAchievements();
    this.storage.clearData();

    console.log('🔬 Analytics Engine: All data cleared');
  }

  /**
   * Export data
   */
  exportData(): string | null {
    return this.storage.exportData();
  }

  /**
   * Import data
   */
  importData(data: string): boolean {
    const success = this.storage.importData(data);
    if (success) {
      this.loadStoredData();
    }
    return success;
  }

  /**
   * Stop the analytics engine
   */
  stop(): void {
    this.dataCollection.stopCollection();

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = undefined;
    }

    if (this.endOfDayTimeout) {
      clearTimeout(this.endOfDayTimeout);
      this.endOfDayTimeout = undefined;
    }

    if (this.options.enableAutoSave) {
      this.saveData();
    }

    console.log('🔬 Analytics Engine: Stopped');
  }
}