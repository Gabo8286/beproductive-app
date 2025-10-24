/**
 * Analytics Data Collection Module
 * Handles productivity data collection and daily statistics management
 */

import type {
  DailyProductivityStats,
  ProductivityStateData,
  ProductivityState
} from './types';

export class DataCollectionService {
  private dailyData: Map<string, DailyProductivityStats> = new Map();
  private collectionInterval?: NodeJS.Timeout;

  constructor(private onDataUpdate?: (stats: DailyProductivityStats) => void) {}

  /**
   * Start automatic data collection
   */
  startCollection(intervalMinutes: number = 5) {
    this.collectionInterval = setInterval(async () => {
      await this.collectCurrentData();
    }, intervalMinutes * 60 * 1000);

    console.log(`📊 Data collection started (${intervalMinutes}min intervals)`);
  }

  /**
   * Stop automatic data collection
   */
  stopCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
      console.log('📊 Data collection stopped');
    }
  }

  /**
   * Collect current productivity data
   */
  async collectCurrentData(): Promise<void> {
    try {
      // In a real implementation, this would get data from productivity state detector
      const state = await this.getCurrentProductivityState();
      const today = new Date().toISOString().split('T')[0];

      let dailyStats = this.dailyData.get(today);
      if (!dailyStats) {
        dailyStats = this.createEmptyDailyStats(today);
        this.dailyData.set(today, dailyStats);
      }

      this.updateDailyStats(dailyStats, state);

      if (this.onDataUpdate) {
        this.onDataUpdate(dailyStats);
      }

    } catch (error) {
      console.warn('Failed to collect analytics data:', error);
    }
  }

  /**
   * Create empty daily statistics structure
   */
  createEmptyDailyStats(date: string): DailyProductivityStats {
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

  /**
   * Update daily statistics with new productivity state data
   */
  private updateDailyStats(stats: DailyProductivityStats, state: ProductivityStateData): void {
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

  /**
   * Calculate overall productivity score for the day
   */
  private calculateProductivityScore(stats: DailyProductivityStats): number {
    if (stats.totalActiveTime === 0) return 0;

    const focusRatio = stats.focusTime / stats.totalActiveTime;
    const distractionPenalty = Math.min(0.3, stats.distractionEvents * 0.02);
    const baseScore = focusRatio * 100;

    return Math.max(0, Math.min(100, baseScore - (distractionPenalty * 100)));
  }

  /**
   * Mock productivity state detector (replace with real implementation)
   */
  private async getCurrentProductivityState(): Promise<ProductivityStateData> {
    // This would be replaced with actual productivity state detection
    const states: ProductivityState[] = ['focused', 'distracted', 'energized', 'planning', 'deep-work'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const energyLevel = Math.floor(Math.random() * 100);

    return {
      currentState: randomState,
      energyLevel
    };
  }

  /**
   * Track task completion
   */
  trackTaskCompletion(): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.dailyData.get(today) || this.createEmptyDailyStats(today);
    stats.tasksCompleted += 1;
    this.dailyData.set(today, stats);

    if (this.onDataUpdate) {
      this.onDataUpdate(stats);
    }
  }

  /**
   * Track break taken
   */
  trackBreakTaken(): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.dailyData.get(today) || this.createEmptyDailyStats(today);
    stats.breaksTaken += 1;
    this.dailyData.set(today, stats);

    if (this.onDataUpdate) {
      this.onDataUpdate(stats);
    }
  }

  /**
   * Get recent daily data
   */
  getRecentDailyData(days: number): DailyProductivityStats[] {
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

  /**
   * Get today's statistics
   */
  getTodayStats(): DailyProductivityStats {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyData.get(today) || this.createEmptyDailyStats(today);
  }

  /**
   * Get all daily data
   */
  getAllDailyData(): Map<string, DailyProductivityStats> {
    return new Map(this.dailyData);
  }

  /**
   * Set daily data (for loading from storage)
   */
  setDailyData(data: Map<string, DailyProductivityStats>): void {
    this.dailyData = new Map(data);
  }

  /**
   * Clear all collected data
   */
  clearData(): void {
    this.dailyData.clear();
  }

  /**
   * Get collection statistics
   */
  getCollectionStats() {
    return {
      daysTracked: this.dailyData.size,
      totalDataPoints: Array.from(this.dailyData.values()).reduce(
        (sum, stats) => sum + stats.totalActiveTime / 5, // 5-minute intervals
        0
      ),
      latestDate: Array.from(this.dailyData.keys()).sort().pop(),
      isCollecting: !!this.collectionInterval
    };
  }
}