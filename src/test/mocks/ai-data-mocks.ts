import { faker } from '@faker-js/faker';

// Time Tracking Mocks
export interface MockTimeEntry {
  id: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  tags: string[];
  category: 'deep_work' | 'meetings' | 'admin' | 'break' | 'planning' | 'communication';
  productivity_score: number;
  focus_rating: number;
  energy_level: number;
  interruptions: number;
  mood: 'energetic' | 'focused' | 'neutral' | 'tired' | 'stressed';
  notes?: string;
  ai_insights?: string[];
}

export interface MockTimeEstimate {
  id: string;
  taskId: string;
  estimated_duration: number;
  confidence_level: number;
  factors: MockEstimationFactor[];
  historical_accuracy: number;
  created_at: Date;
  updated_at: Date;
  ai_reasoning: string;
}

export interface MockEstimationFactor {
  name: string;
  impact: 'increase' | 'decrease' | 'neutral';
  weight: number;
  description: string;
}

export interface MockSmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'productivity' | 'wellness' | 'learning' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  timeToImplement: number;
  potentialImpact: string;
  reasoning: string;
  actionText: string;
  actionUrl?: string;
}

export interface MockProductivityPattern {
  time_of_day: string;
  avg_productivity: number;
  avg_focus: number;
  avg_energy: number;
  optimal_task_types: string[];
  suggested_duration: number;
}

export interface MockAIInsight {
  id: string;
  type: 'productivity' | 'pattern' | 'warning' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  category: string;
  timestamp: Date;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  metadata: Record<string, any>;
}

// Factory Functions
export class AIDataFactory {
  static createTimeEntry(overrides: Partial<MockTimeEntry> = {}): MockTimeEntry {
    const startTime = faker.date.recent({ days: 7 });
    const duration = faker.number.int({ min: 300000, max: 7200000 }); // 5 minutes to 2 hours
    const endTime = new Date(startTime.getTime() + duration);

    return {
      id: faker.string.uuid(),
      taskId: faker.string.uuid(),
      projectId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      startTime,
      endTime,
      duration,
      tags: faker.helpers.arrayElements(['coding', 'design', 'meeting', 'research', 'documentation'], 3),
      category: faker.helpers.arrayElement(['deep_work', 'meetings', 'admin', 'break', 'planning', 'communication']),
      productivity_score: faker.number.int({ min: 1, max: 10 }),
      focus_rating: faker.number.int({ min: 1, max: 10 }),
      energy_level: faker.number.int({ min: 1, max: 10 }),
      interruptions: faker.number.int({ min: 0, max: 5 }),
      mood: faker.helpers.arrayElement(['energetic', 'focused', 'neutral', 'tired', 'stressed']),
      notes: faker.lorem.paragraph(),
      ai_insights: [
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ],
      ...overrides
    };
  }

  static createTimeEntries(count: number): MockTimeEntry[] {
    return Array.from({ length: count }, () => this.createTimeEntry());
  }

  static createTimeEstimate(overrides: Partial<MockTimeEstimate> = {}): MockTimeEstimate {
    return {
      id: faker.string.uuid(),
      taskId: faker.string.uuid(),
      estimated_duration: faker.number.int({ min: 900000, max: 14400000 }), // 15 minutes to 4 hours
      confidence_level: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
      factors: this.createEstimationFactors(3),
      historical_accuracy: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      ai_reasoning: faker.lorem.sentence(),
      ...overrides
    };
  }

  static createEstimationFactors(count: number): MockEstimationFactor[] {
    const factorNames = [
      'Task Complexity',
      'Similar Experience',
      'Current Energy',
      'Time of Day',
      'Historical Performance',
      'Available Resources',
      'External Dependencies'
    ];

    return Array.from({ length: count }, () => ({
      name: faker.helpers.arrayElement(factorNames),
      impact: faker.helpers.arrayElement(['increase', 'decrease', 'neutral']),
      weight: faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 1 }),
      description: faker.lorem.sentence()
    }));
  }

  static createSmartRecommendation(overrides: Partial<MockSmartRecommendation> = {}): MockSmartRecommendation {
    const recommendations = [
      {
        title: 'Schedule deep work blocks',
        description: 'Block 2-3 hour chunks for focused work during your peak productivity hours',
        type: 'productivity' as const,
        actionText: 'Schedule now',
        actionUrl: '/time-tracking'
      },
      {
        title: 'Take regular breaks',
        description: 'Short breaks every 90 minutes help maintain focus and prevent burnout',
        type: 'wellness' as const,
        actionText: 'Set reminder',
        actionUrl: '/automation'
      },
      {
        title: 'Review your goals',
        description: 'Weekly goal reviews increase achievement rates by 40%',
        type: 'optimization' as const,
        actionText: 'Review goals',
        actionUrl: '/goals'
      },
      {
        title: 'Learn time estimation',
        description: 'Improve your planning skills with better time estimation techniques',
        type: 'learning' as const,
        actionText: 'Learn more',
        actionUrl: '/ai-insights'
      }
    ];

    const template = faker.helpers.arrayElement(recommendations);

    return {
      id: faker.string.uuid(),
      title: template.title,
      description: template.description,
      type: template.type,
      priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
      confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      timeToImplement: faker.number.int({ min: 2, max: 30 }),
      potentialImpact: `+${faker.number.int({ min: 10, max: 50 })}% ${faker.helpers.arrayElement(['productivity', 'focus', 'efficiency'])}`,
      reasoning: faker.lorem.sentence(),
      actionText: template.actionText,
      actionUrl: template.actionUrl,
      ...overrides
    };
  }

  static createSmartRecommendations(count: number): MockSmartRecommendation[] {
    return Array.from({ length: count }, () => this.createSmartRecommendation());
  }

  static createProductivityPattern(overrides: Partial<MockProductivityPattern> = {}): MockProductivityPattern {
    const hour = faker.number.int({ min: 6, max: 22 });
    const nextHour = hour + faker.number.int({ min: 1, max: 3 });

    return {
      time_of_day: `${hour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`,
      avg_productivity: faker.number.float({ min: 6.0, max: 9.5, fractionDigits: 1 }),
      avg_focus: faker.number.float({ min: 6.0, max: 9.5, fractionDigits: 1 }),
      avg_energy: faker.number.float({ min: 5.0, max: 9.0, fractionDigits: 1 }),
      optimal_task_types: faker.helpers.arrayElements(['deep_work', 'meetings', 'admin', 'creative'], 2),
      suggested_duration: faker.number.int({ min: 1800000, max: 7200000 }), // 30 minutes to 2 hours
      ...overrides
    };
  }

  static createProductivityPatterns(count: number): MockProductivityPattern[] {
    return Array.from({ length: count }, () => this.createProductivityPattern());
  }

  static createAIInsight(overrides: Partial<MockAIInsight> = {}): MockAIInsight {
    const insights = [
      {
        type: 'productivity' as const,
        title: 'Peak productivity detected',
        description: 'You completed 3x more tasks during 9-11 AM this week',
        category: 'time_patterns'
      },
      {
        type: 'pattern' as const,
        title: 'Consistent break pattern',
        description: 'You take breaks every 90 minutes on average - great for focus!',
        category: 'behavior'
      },
      {
        type: 'warning' as const,
        title: 'Potential burnout risk',
        description: 'Working more than 8 hours daily for 3+ consecutive days',
        category: 'wellness'
      },
      {
        type: 'suggestion' as const,
        title: 'Optimize task scheduling',
        description: 'Schedule complex tasks during your 9-11 AM peak hours',
        category: 'optimization'
      }
    ];

    const template = faker.helpers.arrayElement(insights);

    return {
      id: faker.string.uuid(),
      type: template.type,
      title: template.title,
      description: template.description,
      confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      category: template.category,
      timestamp: faker.date.recent(),
      actionable: faker.datatype.boolean(),
      priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
      metadata: {
        source: 'ai_engine',
        version: '1.0.0',
        correlationScore: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 })
      },
      ...overrides
    };
  }

  static createAIInsights(count: number): MockAIInsight[] {
    return Array.from({ length: count }, () => this.createAIInsight());
  }

  // Context-specific recommendation generators
  static createTaskRecommendations(): MockSmartRecommendation[] {
    return [
      this.createSmartRecommendation({
        title: 'Break down large tasks',
        description: 'Tasks over 2 hours should be split into smaller chunks for better estimation',
        type: 'productivity',
        priority: 'high',
        confidence: 0.85,
        timeToImplement: 2,
        potentialImpact: '+30% accuracy',
        reasoning: 'Large tasks are harder to estimate and complete',
        actionText: 'Learn how',
        actionUrl: '/ai-insights'
      }),
      this.createSmartRecommendation({
        title: 'Schedule during peak hours',
        description: 'Your productivity peaks at 9-11 AM. Schedule important tasks then.',
        type: 'optimization',
        priority: 'medium',
        confidence: 0.91,
        timeToImplement: 5,
        potentialImpact: '+25% efficiency',
        reasoning: 'Historical data shows highest completion rates during these hours',
        actionText: 'Time tracking',
        actionUrl: '/time-tracking'
      })
    ];
  }

  static createGoalRecommendations(): MockSmartRecommendation[] {
    return [
      this.createSmartRecommendation({
        title: 'Set weekly check-ins',
        description: 'Weekly goal reviews increase achievement rates by 40%',
        type: 'productivity',
        priority: 'medium',
        confidence: 0.78,
        timeToImplement: 10,
        potentialImpact: '+40% achievement',
        reasoning: 'Regular reviews help maintain focus and adjust course',
        actionText: 'Set reminder',
        actionUrl: '/automation'
      })
    ];
  }

  static createHabitRecommendations(): MockSmartRecommendation[] {
    return [
      this.createSmartRecommendation({
        title: 'Stack new habits',
        description: 'Link new habits to existing routines for better adherence',
        type: 'learning',
        priority: 'low',
        confidence: 0.82,
        timeToImplement: 15,
        potentialImpact: '+60% success rate',
        reasoning: 'Habit stacking leverages existing neural pathways',
        actionText: 'Learn more',
        actionUrl: '/ai-insights'
      })
    ];
  }

  static createGeneralRecommendations(): MockSmartRecommendation[] {
    return [
      this.createSmartRecommendation({
        title: 'Take a 5-minute break',
        description: "You've been focused for 45 minutes. A short break will help maintain productivity.",
        type: 'wellness',
        priority: 'medium',
        confidence: 0.89,
        timeToImplement: 5,
        potentialImpact: '+15% focus',
        reasoning: 'Regular breaks prevent fatigue and maintain cognitive performance',
        actionText: 'Start timer',
        actionUrl: '/time-tracking'
      })
    ];
  }
}

// Mock API responses
export const mockTimeTrackingAnalytics = {
  total_tracked: 28800000, // 8 hours
  avg_productivity: 7.2,
  peak_hours: ['09:00-11:00', '14:00-16:00'],
  productivity_trends: [
    { date: '2024-01-01', score: 7.5 },
    { date: '2024-01-02', score: 8.2 },
    { date: '2024-01-03', score: 6.8 },
    { date: '2024-01-04', score: 7.9 },
    { date: '2024-01-05', score: 8.5 }
  ],
  category_breakdown: [
    { category: 'deep_work', duration: 18000000, productivity: 8.1 },
    { category: 'meetings', duration: 7200000, productivity: 6.5 },
    { category: 'admin', duration: 3600000, productivity: 5.8 }
  ],
  estimation_accuracy: 0.82,
  improvement_suggestions: [
    'Schedule deep work during peak hours (9-11 AM)',
    'Limit meetings to 30 minutes when possible',
    'Take breaks every 90 minutes for sustained focus'
  ]
};

// Test utilities
export class MockAIEngine {
  static generateRecommendations(context: string, count: number = 4): MockSmartRecommendation[] {
    switch (context) {
      case 'tasks':
        return AIDataFactory.createTaskRecommendations();
      case 'goals':
        return AIDataFactory.createGoalRecommendations();
      case 'habits':
        return AIDataFactory.createHabitRecommendations();
      case 'general':
      default:
        return AIDataFactory.createGeneralRecommendations();
    }
  }

  static generateInsights(userId: string, count: number = 5): MockAIInsight[] {
    return AIDataFactory.createAIInsights(count);
  }

  static generateProductivityPatterns(count: number = 4): MockProductivityPattern[] {
    return AIDataFactory.createProductivityPatterns(count);
  }

  static estimateTaskDuration(taskDescription: string): MockTimeEstimate {
    // Simple mock estimation based on task description length
    const baseTime = 3600000; // 1 hour
    const complexity = taskDescription.length > 100 ? 1.5 : 1.0;
    const confidence = taskDescription.length > 50 ? 0.8 : 0.6;

    return AIDataFactory.createTimeEstimate({
      estimated_duration: baseTime * complexity,
      confidence_level: confidence,
      ai_reasoning: `Estimated based on task complexity and historical data. Description length: ${taskDescription.length} characters.`
    });
  }
}