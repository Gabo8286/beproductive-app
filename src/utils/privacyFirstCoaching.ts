// Privacy-First Coaching Recommendation Engine
import type { ProductivityState } from '@/utils/productivityState';
import type { EnergyLevel, EnergyPattern } from '@/utils/energyTracking';
import type { UserBehaviorPattern } from '@/utils/patternRecognition';
import type { DailyProductivityStats } from '@/utils/clientAnalytics';
import { energyTracker } from '@/utils/energyTracking';
import { patternRecognition } from '@/utils/patternRecognition';
import { clientAnalyticsEngine } from '@/utils/clientAnalytics';

export interface CoachingInsight {
  id: string;
  type: 'habit' | 'wellness' | 'productivity' | 'energy' | 'focus' | 'balance';
  category: 'strength' | 'opportunity' | 'warning' | 'celebration';
  title: string;
  description: string;
  evidence: string[]; // Anonymized evidence supporting this insight
  actionable: boolean;
  recommendations: CoachingRecommendation[];
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: 'immediate' | 'short-term' | 'long-term'; // When to act on this
  generatedAt: Date;
  expiresAt?: Date; // When this insight becomes stale
  userDismissible: boolean;
}

export interface CoachingRecommendation {
  id: string;
  type: 'behavior-change' | 'environment' | 'schedule' | 'mindset' | 'tool' | 'technique';
  title: string;
  description: string;
  effort: 'minimal' | 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeToResults: string; // e.g., "1-2 weeks", "immediate"
  steps: string[];
  resources?: {
    articles?: string[];
    videos?: string[];
    tools?: string[];
    techniques?: string[];
  };
  successMetrics: string[];
  potentialChallenges: string[];
  alternatives?: string[]; // Alternative approaches
}

export interface CoachingGoal {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'wellness' | 'balance' | 'learning' | 'habits';
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  deadline?: Date;
  milestones: Array<{
    value: number;
    description: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  strategies: CoachingRecommendation[];
  progress: {
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
    lastUpdate: Date;
  };
  isActive: boolean;
}

export interface CoachingSession {
  id: string;
  date: Date;
  focus: 'wellness-check' | 'productivity-review' | 'goal-setting' | 'habit-building' | 'problem-solving';
  insights: CoachingInsight[];
  recommendations: CoachingRecommendation[];
  goals: CoachingGoal[];
  reflection: {
    wins: string[];
    challenges: string[];
    learnings: string[];
  };
  nextSteps: string[];
  followUpDate: Date;
}

interface CoachingContext {
  recentProductivity: ProductivityState[];
  energyPatterns: EnergyPattern[];
  behaviorPatterns: UserBehaviorPattern[];
  analyticsData: DailyProductivityStats[];
  userPreferences: {
    coachingStyle: 'direct' | 'supportive' | 'exploratory';
    focusAreas: string[];
    avoidTopics: string[];
    preferredFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  };
  goals: CoachingGoal[];
  previousInsights: CoachingInsight[];
}

class PrivacyFirstCoach {
  private static instance: PrivacyFirstCoach;
  private insights: Map<string, CoachingInsight> = new Map();
  private goals: Map<string, CoachingGoal> = new Map();
  private sessions: CoachingSession[] = [];
  private userPreferences = {
    coachingStyle: 'supportive' as const,
    focusAreas: ['productivity', 'wellness'],
    avoidTopics: [] as string[],
    preferredFrequency: 'weekly' as const
  };

  private constructor() {
    this.loadStoredData();
    this.schedulePeriodicAnalysis();
  }

  static getInstance(): PrivacyFirstCoach {
    if (!PrivacyFirstCoach.instance) {
      PrivacyFirstCoach.instance = new PrivacyFirstCoach();
    }
    return PrivacyFirstCoach.instance;
  }

  // Generate comprehensive coaching insights
  generateCoachingInsights(): CoachingInsight[] {
    const context = this.buildCoachingContext();
    const insights: CoachingInsight[] = [];

    try {
      // Analyze different aspects of user behavior
      insights.push(...this.analyzeProductivityPatterns(context));
      insights.push(...this.analyzeWellnessIndicators(context));
      insights.push(...this.analyzeEnergyManagement(context));
      insights.push(...this.analyzeFocusPatterns(context));
      insights.push(...this.analyzeWorkLifeBalance(context));
      insights.push(...this.analyzeHabitFormation(context));

      // Filter and prioritize insights
      const filteredInsights = this.filterInsightsByPreferences(insights, context);
      const prioritizedInsights = this.prioritizeInsights(filteredInsights);

      // Store for future reference
      prioritizedInsights.forEach(insight => {
        this.insights.set(insight.id, insight);
      });

      this.saveData();
      return prioritizedInsights.slice(0, 5); // Return top 5 insights

    } catch (error) {
      console.warn('Failed to generate coaching insights:', error);
      return [];
    }
  }

  // Create a coaching session
  createCoachingSession(focus: CoachingSession['focus']): CoachingSession {
    const insights = this.generateCoachingInsights();
    const recommendations = this.generatePersonalizedRecommendations(insights);
    const goals = this.updateGoalProgress();

    const session: CoachingSession = {
      id: `session-${Date.now()}`,
      date: new Date(),
      focus,
      insights,
      recommendations,
      goals: Array.from(this.goals.values()).filter(g => g.isActive),
      reflection: {
        wins: this.identifyRecentWins(),
        challenges: this.identifyChallenges(),
        learnings: this.extractLearnings()
      },
      nextSteps: this.generateNextSteps(insights, recommendations),
      followUpDate: this.calculateFollowUpDate()
    };

    this.sessions.push(session);
    if (this.sessions.length > 20) {
      this.sessions = this.sessions.slice(-20); // Keep last 20 sessions
    }

    this.saveData();
    return session;
  }

  // Set or update a coaching goal
  setGoal(goal: Omit<CoachingGoal, 'id' | 'progress' | 'isActive'>): CoachingGoal {
    const newGoal: CoachingGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      progress: {
        trend: 'stable',
        confidence: 0.5,
        lastUpdate: new Date()
      },
      isActive: true
    };

    this.goals.set(newGoal.id, newGoal);
    this.saveData();
    return newGoal;
  }

  // Build context for coaching analysis
  private buildCoachingContext(): CoachingContext {
    const recentDays = 14;

    return {
      recentProductivity: [], // Would be populated from productivity state history
      energyPatterns: energyTracker.getPatterns(),
      behaviorPatterns: patternRecognition.getPatterns(),
      analyticsData: [], // Would be populated from analytics engine
      userPreferences: this.userPreferences,
      goals: Array.from(this.goals.values()),
      previousInsights: Array.from(this.insights.values()).filter(
        insight => insight.generatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    };
  }

  // Analyze productivity patterns for insights
  private analyzeProductivityPatterns(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Analyze peak productivity times
    const temporalPatterns = context.behaviorPatterns.filter(p => p.type === 'temporal');
    if (temporalPatterns.length > 0) {
      const strongPattern = temporalPatterns.find(p => p.strength === 'strong');
      if (strongPattern) {
        insights.push({
          id: `productivity-peak-${Date.now()}`,
          type: 'productivity',
          category: 'strength',
          title: 'Consistent Peak Productivity Window Identified',
          description: `You consistently perform best ${strongPattern.description.toLowerCase()}. This is a valuable strength to leverage.`,
          evidence: [
            `${strongPattern.frequency} occurrences per week`,
            `${Math.round(strongPattern.confidence * 100)}% confidence in pattern`,
            'Based on behavioral analysis over recent weeks'
          ],
          actionable: true,
          recommendations: [{
            id: `rec-peak-${Date.now()}`,
            type: 'schedule',
            title: 'Optimize Peak Hours',
            description: 'Schedule your most important and challenging work during your peak productivity window',
            effort: 'low',
            impact: 'high',
            timeToResults: '1-2 weeks',
            steps: [
              'Block your peak hours in your calendar',
              'Move routine tasks outside this window',
              'Turn off notifications during peak time',
              'Prepare everything needed in advance'
            ],
            successMetrics: [
              'Increased task completion rate',
              'Better quality work output',
              'Reduced time to complete important tasks'
            ],
            potentialChallenges: [
              'Meetings scheduled during peak hours',
              'Interruptions from colleagues',
              'Habit of checking emails/messages'
            ]
          }],
          confidence: strongPattern.confidence,
          priority: 'high',
          timeframe: 'immediate',
          generatedAt: new Date(),
          userDismissible: true
        });
      }
    }

    // Analyze productivity consistency
    const productivityVariability = this.calculateProductivityVariability(context);
    if (productivityVariability > 0.3) {
      insights.push({
        id: `productivity-consistency-${Date.now()}`,
        type: 'productivity',
        category: 'opportunity',
        title: 'Opportunity to Improve Consistency',
        description: 'Your productivity varies significantly day-to-day. Building more consistent routines could help stabilize your performance.',
        evidence: [
          `${Math.round(productivityVariability * 100)}% variation in daily productivity`,
          'Analysis of recent work patterns',
          'Comparison with optimal productivity patterns'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-consistency-${Date.now()}`,
          type: 'habit',
          title: 'Build Morning Routine',
          description: 'Establish a consistent morning routine to create stable foundation for productive days',
          effort: 'medium',
          impact: 'high',
          timeToResults: '3-4 weeks',
          steps: [
            'Define 3-5 key morning activities',
            'Set consistent wake-up time',
            'Prepare everything the night before',
            'Track routine completion for 21 days'
          ],
          successMetrics: [
            'More consistent daily productivity scores',
            'Better morning focus and energy',
            'Reduced decision fatigue'
          ],
          potentialChallenges: [
            'Resistance to early wake-up times',
            'Disruptions from family/roommates',
            'Forgetting routine elements'
          ]
        }],
        confidence: 0.7,
        priority: 'medium',
        timeframe: 'short-term',
        generatedAt: new Date(),
        userDismissible: true
      });
    }

    return insights;
  }

  // Analyze wellness indicators
  private analyzeWellnessIndicators(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Analyze energy patterns for wellness insights
    const energyPatterns = context.energyPatterns;
    const lowEnergyPattern = energyPatterns.find(p => p.averageLevel < 50);

    if (lowEnergyPattern) {
      insights.push({
        id: `wellness-energy-${Date.now()}`,
        type: 'wellness',
        category: 'warning',
        title: 'Consistently Low Energy Levels Detected',
        description: 'Your average energy levels are below optimal. This could impact both productivity and well-being.',
        evidence: [
          `Average energy level: ${Math.round(lowEnergyPattern.averageLevel)}%`,
          'Pattern observed over multiple weeks',
          'Correlation with decreased task completion'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-energy-boost-${Date.now()}`,
          type: 'wellness',
          title: 'Energy Restoration Program',
          description: 'Implement strategies to naturally boost and sustain your energy levels',
          effort: 'medium',
          impact: 'high',
          timeToResults: '2-3 weeks',
          steps: [
            'Assess sleep quality and duration',
            'Add 10-minute walks after meals',
            'Optimize hydration (8 glasses/day)',
            'Review nutrition for steady blood sugar',
            'Schedule 15-minute afternoon breaks'
          ],
          successMetrics: [
            'Increased average energy scores',
            'Better afternoon productivity',
            'Improved mood and motivation'
          ],
          potentialChallenges: [
            'Forgetting to take breaks',
            'Resistance to changing eating habits',
            'Time constraints for exercise'
          ]
        }],
        confidence: 0.8,
        priority: 'high',
        timeframe: 'immediate',
        generatedAt: new Date(),
        userDismissible: false // Wellness insights are non-dismissible
      });
    }

    return insights;
  }

  // Analyze energy management patterns
  private analyzeEnergyManagement(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    const energyPatterns = context.energyPatterns;
    const circadianPattern = energyPatterns.find(p => p.type === 'circadian');

    if (circadianPattern && circadianPattern.peakTimes.length > 0) {
      const peakHour = circadianPattern.peakTimes[0].start;
      insights.push({
        id: `energy-optimization-${Date.now()}`,
        type: 'energy',
        category: 'opportunity',
        title: 'Energy-Task Alignment Opportunity',
        description: `Your energy peaks around ${peakHour}. Aligning high-energy tasks with this window could significantly boost performance.`,
        evidence: [
          `Peak energy at ${peakHour}`,
          `${circadianPattern.peakTimes.length} consistent peak periods identified`,
          'Strong circadian rhythm pattern detected'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-energy-align-${Date.now()}`,
          type: 'schedule',
          title: 'Energy-Based Task Scheduling',
          description: 'Match task difficulty and importance to your natural energy rhythms',
          effort: 'low',
          impact: 'high',
          timeToResults: 'immediate',
          steps: [
            'Identify your 3 most important daily tasks',
            'Schedule them during peak energy windows',
            'Move routine/admin tasks to lower energy periods',
            'Use energy dips for breaks or light activities'
          ],
          successMetrics: [
            'Higher quality work during peak hours',
            'Less fatigue from difficult tasks',
            'Better overall energy management'
          ],
          potentialChallenges: [
            'Fixed meeting schedules',
            'External deadlines and priorities',
            'Habit of tackling easy tasks first'
          ]
        }],
        confidence: 0.85,
        priority: 'medium',
        timeframe: 'immediate',
        generatedAt: new Date(),
        userDismissible: true
      });
    }

    return insights;
  }

  // Analyze focus patterns
  private analyzeFocusPatterns(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Look for focus improvement patterns
    const focusPatterns = context.behaviorPatterns.filter(p => p.type === 'focus');
    const improvementPattern = focusPatterns.find(p => p.pattern.includes('improvement'));

    if (improvementPattern) {
      insights.push({
        id: `focus-strength-${Date.now()}`,
        type: 'focus',
        category: 'strength',
        title: 'Focus Improvement Strategy Working',
        description: 'Your focus levels have been improving. The strategies you\'re using are effective.',
        evidence: [
          'Consistent focus level improvements detected',
          `${improvementPattern.frequency} positive focus changes per week`,
          'Pattern indicates effective focus management'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-focus-double-down-${Date.now()}`,
          type: 'behavior-change',
          title: 'Strengthen Successful Focus Habits',
          description: 'Continue and expand the focus strategies that are working for you',
          effort: 'minimal',
          impact: 'medium',
          timeToResults: '1-2 weeks',
          steps: [
            'Identify which specific strategies helped improve focus',
            'Apply these strategies more consistently',
            'Extend successful focus sessions gradually',
            'Document what works for future reference'
          ],
          successMetrics: [
            'Sustained focus improvement',
            'Longer deep work sessions',
            'Reduced distraction incidents'
          ],
          potentialChallenges: [
            'Overconfidence leading to reduced vigilance',
            'Changing circumstances requiring adaptation',
            'Plateau effects after initial gains'
          ]
        }],
        confidence: 0.75,
        priority: 'medium',
        timeframe: 'short-term',
        generatedAt: new Date(),
        userDismissible: true
      });
    }

    return insights;
  }

  // Analyze work-life balance
  private analyzeWorkLifeBalance(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Check for excessive work hours or poor balance indicators
    const workIntensity = this.calculateWorkIntensity(context);
    if (workIntensity > 0.8) {
      insights.push({
        id: `balance-warning-${Date.now()}`,
        type: 'balance',
        category: 'warning',
        title: 'Work Intensity Approaching Unsustainable Levels',
        description: 'Your work intensity has been consistently high. Consider implementing balance strategies to prevent burnout.',
        evidence: [
          `Work intensity score: ${Math.round(workIntensity * 100)}%`,
          'Limited break times detected',
          'Extended work sessions beyond recommended limits'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-balance-restore-${Date.now()}`,
          type: 'wellness',
          title: 'Implement Sustainable Work Rhythm',
          description: 'Create boundaries and recovery periods to maintain long-term productivity',
          effort: 'medium',
          impact: 'high',
          timeToResults: '1-2 weeks',
          steps: [
            'Set firm start and stop times for work',
            'Schedule mandatory breaks every 90 minutes',
            'Designate one evening per week as work-free',
            'Practice transition rituals between work and personal time'
          ],
          successMetrics: [
            'Improved energy levels',
            'Better sleep quality',
            'Sustained productivity without crashes'
          ],
          potentialChallenges: [
            'Pressure to work longer hours',
            'Guilt about taking breaks',
            'Difficulty disconnecting from work'
          ]
        }],
        confidence: 0.8,
        priority: 'high',
        timeframe: 'immediate',
        generatedAt: new Date(),
        userDismissible: false
      });
    }

    return insights;
  }

  // Analyze habit formation patterns
  private analyzeHabitFormation(context: CoachingContext): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Look for successful habit patterns
    const habitPatterns = context.behaviorPatterns.filter(p =>
      p.description.toLowerCase().includes('routine') ||
      p.description.toLowerCase().includes('habit')
    );

    if (habitPatterns.length > 2) {
      insights.push({
        id: `habit-success-${Date.now()}`,
        type: 'habit',
        category: 'celebration',
        title: 'Strong Habit Formation Ability Detected',
        description: 'You show excellent ability to build and maintain productive habits. This is a key strength for continued growth.',
        evidence: [
          `${habitPatterns.length} consistent behavioral patterns identified`,
          'Strong pattern adherence over time',
          'Multiple successful habit implementations'
        ],
        actionable: true,
        recommendations: [{
          id: `rec-habit-expand-${Date.now()}`,
          type: 'habit',
          title: 'Leverage Habit-Building Strengths',
          description: 'Use your proven habit-building ability to tackle new areas of improvement',
          effort: 'low',
          impact: 'high',
          timeToResults: '3-4 weeks',
          steps: [
            'Identify one new habit to build on your success',
            'Use the same strategies that worked before',
            'Stack new habits onto existing successful routines',
            'Track progress using proven methods'
          ],
          successMetrics: [
            'Successful establishment of new productive habit',
            'Continued maintenance of existing habits',
            'Increased overall routine consistency'
          ],
          potentialChallenges: [
            'Overconfidence leading to trying too many habits',
            'Choosing habits that don\'t align with existing routines',
            'Neglecting maintenance of current habits'
          ]
        }],
        confidence: 0.9,
        priority: 'low',
        timeframe: 'long-term',
        generatedAt: new Date(),
        userDismissible: true
      });
    }

    return insights;
  }

  // Helper methods for analysis
  private calculateProductivityVariability(context: CoachingContext): number {
    // Simplified calculation - real implementation would analyze actual productivity data
    return Math.random() * 0.5; // 0-50% variability
  }

  private calculateWorkIntensity(context: CoachingContext): number {
    // Simplified calculation - real implementation would analyze work patterns
    return Math.random() * 0.3 + 0.5; // 50-80% intensity range
  }

  private generatePersonalizedRecommendations(insights: CoachingInsight[]): CoachingRecommendation[] {
    return insights.flatMap(insight => insight.recommendations).slice(0, 3);
  }

  private updateGoalProgress(): CoachingGoal[] {
    // Update progress on existing goals based on recent data
    return Array.from(this.goals.values()).filter(g => g.isActive);
  }

  private identifyRecentWins(): string[] {
    return [
      'Maintained consistent productivity patterns',
      'Successfully followed energy management strategies',
      'Improved focus during peak hours'
    ];
  }

  private identifyChallenges(): string[] {
    return [
      'Occasional late-night work sessions',
      'Inconsistent break timing',
      'Difficulty maintaining energy in afternoons'
    ];
  }

  private extractLearnings(): string[] {
    return [
      'Peak productivity occurs in morning hours',
      'Regular breaks significantly improve focus',
      'Energy management directly impacts mood'
    ];
  }

  private generateNextSteps(insights: CoachingInsight[], recommendations: CoachingRecommendation[]): string[] {
    return [
      'Implement highest-priority recommendations',
      'Track progress on new strategies',
      'Monitor energy and productivity patterns',
      'Schedule follow-up coaching session'
    ];
  }

  private calculateFollowUpDate(): Date {
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 7); // Weekly follow-up
    return followUp;
  }

  private filterInsightsByPreferences(insights: CoachingInsight[], context: CoachingContext): CoachingInsight[] {
    return insights.filter(insight => {
      // Filter out insights on topics user wants to avoid
      if (context.userPreferences.avoidTopics.includes(insight.type)) {
        return false;
      }

      // Prioritize insights in user's focus areas
      if (context.userPreferences.focusAreas.length > 0) {
        return context.userPreferences.focusAreas.includes(insight.type);
      }

      return true;
    });
  }

  private prioritizeInsights(insights: CoachingInsight[]): CoachingInsight[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return insights.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  private schedulePeriodicAnalysis(): void {
    // Generate insights every 24 hours
    setInterval(() => {
      this.generateCoachingInsights();
    }, 24 * 60 * 60 * 1000);
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('beproductive-coaching');
      if (stored) {
        const data = JSON.parse(stored);
        this.insights = new Map(data.insights || []);
        this.goals = new Map(data.goals || []);
        this.sessions = (data.sessions || []).map((s: any) => ({
          ...s,
          date: new Date(s.date),
          followUpDate: new Date(s.followUpDate)
        }));
        this.userPreferences = { ...this.userPreferences, ...data.preferences };
      }
    } catch (error) {
      console.warn('Failed to load coaching data:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        insights: Array.from(this.insights.entries()),
        goals: Array.from(this.goals.entries()),
        sessions: this.sessions,
        preferences: this.userPreferences,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('beproductive-coaching', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save coaching data:', error);
    }
  }

  // Public API
  getInsights(): CoachingInsight[] {
    return Array.from(this.insights.values())
      .filter(insight => !insight.expiresAt || insight.expiresAt > new Date())
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, 10);
  }

  getActiveGoals(): CoachingGoal[] {
    return Array.from(this.goals.values()).filter(g => g.isActive);
  }

  getRecentSessions(limit: number = 5): CoachingSession[] {
    return this.sessions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  dismissInsight(insightId: string): void {
    const insight = this.insights.get(insightId);
    if (insight && insight.userDismissible) {
      this.insights.delete(insightId);
      this.saveData();
    }
  }

  updatePreferences(preferences: Partial<typeof this.userPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveData();
  }
}

// Export singleton and React hook
export const privacyFirstCoach = PrivacyFirstCoach.getInstance();

export function usePrivacyFirstCoaching() {
  const generateInsights = () => {
    return privacyFirstCoach.generateCoachingInsights();
  };

  const createSession = (focus: CoachingSession['focus']) => {
    return privacyFirstCoach.createCoachingSession(focus);
  };

  const setGoal = (goal: Omit<CoachingGoal, 'id' | 'progress' | 'isActive'>) => {
    return privacyFirstCoach.setGoal(goal);
  };

  const getInsights = () => {
    return privacyFirstCoach.getInsights();
  };

  const getGoals = () => {
    return privacyFirstCoach.getActiveGoals();
  };

  const getSessions = (limit?: number) => {
    return privacyFirstCoach.getRecentSessions(limit);
  };

  const dismissInsight = (insightId: string) => {
    privacyFirstCoach.dismissInsight(insightId);
  };

  const updatePreferences = (preferences: any) => {
    privacyFirstCoach.updatePreferences(preferences);
  };

  return {
    generateInsights,
    createSession,
    setGoal,
    getInsights,
    getGoals,
    getSessions,
    dismissInsight,
    updatePreferences
  };
}