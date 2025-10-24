/**
 * Analytics Types Module
 * Centralized type definitions for the analytics system
 */

import type { ProductivityInsight } from '@/types/ai';

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
  stateDistribution: Record<ProductivityState, number>;
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

export type ProductivityState =
  | 'focused'
  | 'distracted'
  | 'overwhelmed'
  | 'energized'
  | 'tired'
  | 'planning'
  | 'deep-work';

export interface ProductivityStateData {
  currentState: ProductivityState;
  energyLevel: number; // 0-100
}

export interface AnalyticsEngineOptions {
  enableAutoSave?: boolean;
  analysisInterval?: number; // minutes
  dataRetentionDays?: number;
}

export interface AnalyticsStats {
  daysTracked: number;
  patternsDiscovered: number;
  insightsGenerated: number;
  recommendationsActive: number;
  achievementsUnlocked: number;
}

export interface StoredAnalyticsData {
  dailyData: [string, DailyProductivityStats][];
  patterns: BehaviorPattern[];
  insights: ProductivityInsight[];
  recommendations: PersonalRecommendation[];
  achievements: Achievement[];
}

// Analytics calculation helpers
export interface TrendCalculation {
  direction: 'improving' | 'declining' | 'stable';
  strength: 'significantly' | 'gradually' | 'minimally';
  change: number;
  confidence: number;
}

export interface PatternAnalysisResult {
  energyPattern?: BehaviorPattern;
  focusPattern?: BehaviorPattern;
  consistencyPattern?: BehaviorPattern;
  timingPatterns: BehaviorPattern[];
}

export interface InsightGenerationContext {
  recentData: DailyProductivityStats[];
  patterns: BehaviorPattern[];
  userPreferences?: any;
}

export interface RecommendationContext extends InsightGenerationContext {
  currentChallenges: string[];
  userGoals?: string[];
}