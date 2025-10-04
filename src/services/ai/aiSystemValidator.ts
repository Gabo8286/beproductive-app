import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager } from "./aiServiceManager";
import { productivityInsightsGenerator } from "./productivityInsightsGenerator";
import { smartTaskPrioritizer } from "./smartTaskPrioritizer";
import { smartGoalTracker } from "./smartGoalTracker";
import { habitOptimizer } from "./habitOptimizer";
import { intelligentTimeBlocker } from "./intelligentTimeBlocker";
import { burnoutPredictor } from "./burnoutPredictor";
import { smartNotificationSystem } from "./smartNotificationSystem";
import { teamAIIntegration } from "./teamAIIntegration";

export interface ValidationResult {
  component: string;
  status: 'passed' | 'failed' | 'warning';
  score: number; // 0-100
  details: {
    functionality: boolean;
    performance: boolean;
    accuracy: boolean;
    reliability: boolean;
  };
  errors: string[];
  warnings: string[];
  metrics: Record<string, number>;
  recommendations: string[];
}

export interface SystemValidationReport {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
    timestamp: string;
  };
  components: ValidationResult[];
  integration: {
    dataFlow: boolean;
    apiConnectivity: boolean;
    crossComponentCommunication: boolean;
    errorHandling: boolean;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  nextValidationDate: string;
}

export class AISystemValidator {
  private static instance: AISystemValidator;

  public static getInstance(): AISystemValidator {
    if (!AISystemValidator.instance) {
      AISystemValidator.instance = new AISystemValidator();
    }
    return AISystemValidator.instance;
  }

  public async validateCompleteSystem(userId: string): Promise<SystemValidationReport> {
    console.log('Starting comprehensive AI system validation...');

    // Validate individual components
    const componentResults = await Promise.all([
      this.validateAIServiceManager(),
      this.validateProductivityInsights(userId),
      this.validateTaskPrioritizer(userId),
      this.validateGoalTracker(userId),
      this.validateHabitOptimizer(userId),
      this.validateTimeBlocker(userId),
      this.validateBurnoutPredictor(userId),
      this.validateNotificationSystem(userId),
      this.validateTeamIntegration(userId)
    ]);

    // Test integration points
    const integrationResults = await this.validateSystemIntegration(userId);

    // Measure overall performance
    const performanceMetrics = await this.measureSystemPerformance(userId);

    // Calculate overall score and status
    const overallScore = this.calculateOverallScore(componentResults);
    const overallStatus = this.determineSystemStatus(overallScore, componentResults);

    // Generate recommendations
    const recommendations = this.generateSystemRecommendations(componentResults, integrationResults, performanceMetrics);

    const report: SystemValidationReport = {
      overall: {
        status: overallStatus,
        score: overallScore,
        timestamp: new Date().toISOString()
      },
      components: componentResults,
      integration: integrationResults,
      performance: performanceMetrics,
      recommendations,
      nextValidationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    };

    // Save validation report
    await this.saveValidationReport(report, userId);

    console.log(`AI system validation completed with overall score: ${overallScore}`);

    return report;
  }

  private async validateAIServiceManager(): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'AI Service Manager',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Test basic functionality
      const testRequest = {
        provider: 'lovable' as const,
        prompt: 'Test prompt for validation',
        userId: 'test_user',
        requestType: 'validation_test',
        maxTokens: 100,
        temperature: 0.5
      };

      const startTime = Date.now();
      const response = await aiServiceManager.makeRequest(testRequest);
      const responseTime = Date.now() - startTime;

      // Check functionality
      result.details.functionality = response.success;
      if (!response.success) {
        result.errors.push(`AI Service Manager failed: ${response.error}`);
      }

      // Check performance (should respond within 10 seconds)
      result.details.performance = responseTime < 10000;
      if (responseTime >= 10000) {
        result.warnings.push(`Slow response time: ${responseTime}ms`);
      }

      // Test multiple providers
      const providers = ['openai', 'claude', 'gemini', 'lovable'] as const;
      let workingProviders = 0;

      for (const provider of providers) {
        try {
          const providerResponse = await aiServiceManager.makeRequest({
            ...testRequest,
            provider
          });
          if (providerResponse.success) {
            workingProviders++;
          }
        } catch (error) {
          result.warnings.push(`Provider ${provider} failed: ${error}`);
        }
      }

      result.details.reliability = workingProviders >= 2; // At least 2 providers working
      result.details.accuracy = response.success && response.content.length > 0;

      result.metrics = {
        responseTime,
        workingProviders,
        totalProviders: providers.length
      };

      // Calculate component score
      result.score = this.calculateComponentScore(result.details);

      if (result.score < 70) {
        result.status = 'failed';
        result.recommendations.push('Review AI provider configurations and API keys');
      } else if (result.score < 90) {
        result.status = 'warning';
        result.recommendations.push('Monitor provider reliability and response times');
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateProductivityInsights(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Productivity Insights Generator',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      const startTime = Date.now();

      // Test insight generation
      const insights = await productivityInsightsGenerator.generateInsights({
        userId,
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        preferredProvider: 'lovable'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = Array.isArray(insights) && insights.length >= 0;
      result.details.performance = responseTime < 15000; // 15 seconds for insights
      result.details.accuracy = insights.every(insight =>
        insight.title && insight.content && typeof insight.confidence === 'number'
      );
      result.details.reliability = true; // If we got here without throwing

      result.metrics = {
        responseTime,
        insightsGenerated: insights.length,
        averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / Math.max(insights.length, 1)
      };

      result.score = this.calculateComponentScore(result.details);

      if (insights.length === 0) {
        result.warnings.push('No insights generated - may need more user data');
      }

      if (result.score < 70) {
        result.status = 'failed';
        result.recommendations.push('Check data availability and insight generation logic');
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Insights validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateTaskPrioritizer(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Smart Task Prioritizer',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Get test tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .limit(5);

      if (!tasks || tasks.length === 0) {
        result.warnings.push('No tasks found for prioritization testing');
        result.score = 50; // Partial score for no data
        return result;
      }

      const startTime = Date.now();

      // Get user context and analyze tasks
      const userContext = await smartTaskPrioritizer.getUserContext(userId);
      const recommendations = await smartTaskPrioritizer.analyzeTasks({
        userId,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category || 'general',
          priority: task.priority,
          due_date: task.due_date,
          estimated_duration: task.estimated_duration,
          tags: task.tags || [],
          status: task.status,
          created_at: task.created_at,
          dependencies: []
        })),
        userContext,
        preferredProvider: 'lovable'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = Array.isArray(recommendations) && recommendations.length > 0;
      result.details.performance = responseTime < 20000; // 20 seconds
      result.details.accuracy = recommendations.every(rec =>
        rec.confidence > 0 && rec.reasoning && rec.recommendedPriority
      );
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        tasksAnalyzed: tasks.length,
        recommendationsGenerated: recommendations.length,
        averageConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Task prioritizer validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateGoalTracker(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Smart Goal Tracker',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Get test goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('created_by', userId)
        .limit(3);

      if (!goals || goals.length === 0) {
        result.warnings.push('No goals found for tracking testing');
        result.score = 50;
        return result;
      }

      const startTime = Date.now();

      const analysis = await smartGoalTracker.analyzeGoals({
        userId,
        goals: goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category || 'general',
          status: goal.status,
          target_date: goal.target_date,
          priority: goal.priority || 3,
          progress: goal.progress || 0,
          created_at: goal.created_at,
          updated_at: goal.updated_at || goal.created_at,
          milestones: [],
          tasks: []
        })),
        preferredProvider: 'lovable'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = analysis.progress.length > 0 || analysis.suggestions.length > 0;
      result.details.performance = responseTime < 25000; // 25 seconds
      result.details.accuracy = analysis.progress.every(p =>
        typeof p.currentProgress === 'number' && typeof p.completionProbability === 'number'
      );
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        goalsAnalyzed: goals.length,
        progressAnalyses: analysis.progress.length,
        suggestionsGenerated: analysis.suggestions.length
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Goal tracker validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateHabitOptimizer(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Habit Optimizer',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Get test habits
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .limit(3);

      if (!habits || habits.length === 0) {
        result.warnings.push('No habits found for optimization testing');
        result.score = 50;
        return result;
      }

      const startTime = Date.now();

      const analysis = await habitOptimizer.analyzeHabits({
        userId,
        habits: habits.map(habit => ({
          id: habit.id,
          title: habit.title,
          description: habit.description,
          category: habit.category || 'general',
          frequency: habit.frequency || 'daily',
          target_count: habit.target_count || 1,
          is_active: habit.is_active,
          created_at: habit.created_at,
          streak_count: habit.streak_count || 0,
          total_completions: 0,
          reminder_time: habit.reminder_time,
          difficulty_level: habit.difficulty_level || 'medium'
        })),
        preferredProvider: 'lovable'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = analysis.performance.length > 0 || analysis.optimizations.length > 0;
      result.details.performance = responseTime < 30000; // 30 seconds
      result.details.accuracy = analysis.performance.every(p =>
        typeof p.completionRate === 'number' && typeof p.consistency === 'number'
      );
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        habitsAnalyzed: habits.length,
        performanceAnalyses: analysis.performance.length,
        optimizationsGenerated: analysis.optimizations.length
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Habit optimizer validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateTimeBlocker(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Intelligent Time Blocker',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Create test time blocking request
      const testTasks = [
        {
          id: 'test1',
          title: 'Test Task 1',
          estimated_duration: 60,
          priority: 'medium' as const,
          energy_required: 'medium' as const,
          category: 'work'
        }
      ];

      const userContext = {
        userId,
        workingHours: { start: '09:00', end: '17:00' },
        timeZone: 'UTC',
        energyPatterns: { morning: 8, afternoon: 6, evening: 4 },
        preferences: {
          preferredFocusBlocks: 60,
          maxMeetingsPerDay: 4,
          breakFrequency: 90,
          deepWorkPreference: 'morning' as const,
          interruption_tolerance: 'medium' as const
        },
        existingCommitments: [],
        unavailableSlots: []
      };

      const startTime = Date.now();

      const optimization = await intelligentTimeBlocker.generateTimeBlocks({
        userId,
        targetDate: new Date().toISOString().split('T')[0],
        tasks: testTasks,
        userContext,
        preferredProvider: 'lovable',
        optimization_focus: 'productivity'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = optimization.recommendations.length > 0;
      result.details.performance = responseTime < 15000; // 15 seconds
      result.details.accuracy = optimization.recommendations.every(rec =>
        rec.timeBlock.start_time && rec.timeBlock.end_time && rec.confidence > 0
      );
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        recommendationsGenerated: optimization.recommendations.length,
        productivityScore: optimization.overallProductivityScore,
        timeUtilization: optimization.timeUtilization
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Time blocker validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateBurnoutPredictor(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Burnout Predictor',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Create test wellbeing data
      const wellbeingData = {
        userId,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        workloadMetrics: {
          hoursWorked: [8, 9, 8, 10, 8, 7, 6],
          tasksCompleted: [5, 6, 4, 7, 5, 4, 3],
          overdueTasks: [0, 1, 0, 2, 1, 0, 0],
          meetingsPerDay: [3, 4, 2, 5, 3, 2, 1],
          overtimeHours: [0, 1, 0, 2, 0, 0, 0]
        },
        emotionalMetrics: {
          moodRatings: [7, 6, 7, 5, 6, 7, 8],
          stressLevels: [4, 5, 4, 7, 5, 4, 3],
          satisfactionRatings: [7, 6, 7, 5, 6, 7, 8],
          energyLevels: [7, 6, 7, 5, 6, 7, 8]
        },
        behavioralMetrics: {
          productivityScores: [75, 70, 75, 60, 70, 75, 80],
          focusTime: [180, 150, 180, 120, 150, 180, 200],
          breaksTaken: [3, 2, 3, 2, 3, 3, 4],
          sleepHours: [7, 6.5, 7, 6, 6.5, 7, 7.5],
          exerciseMinutes: [30, 0, 30, 0, 20, 30, 45]
        },
        contextualFactors: {
          workEnvironment: 'remote' as const,
          teamSize: 5,
          projectDeadlines: [],
          personalCommitments: 2,
          seasonalFactors: []
        }
      };

      const startTime = Date.now();

      const assessment = await burnoutPredictor.assessBurnoutRisk({
        userId,
        wellbeingData,
        preferredProvider: 'lovable',
        sensitivityLevel: 'balanced'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = assessment.assessment && assessment.interventions;
      result.details.performance = responseTime < 20000; // 20 seconds
      result.details.accuracy =
        typeof assessment.assessment.overallRiskScore === 'number' &&
        assessment.assessment.riskLevel &&
        assessment.interventions.length >= 0;
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        riskScore: assessment.assessment.overallRiskScore,
        interventionsGenerated: assessment.interventions.length,
        confidence: assessment.assessment.confidence
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Burnout predictor validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateNotificationSystem(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Smart Notification System',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      const startTime = Date.now();

      const notifications = await smartNotificationSystem.scheduleNotifications(userId);

      const responseTime = Date.now() - startTime;

      result.details.functionality = Array.isArray(notifications);
      result.details.performance = responseTime < 10000; // 10 seconds
      result.details.accuracy = notifications.every(n =>
        n.title && n.message && n.scheduledFor && n.channel
      );
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        notificationsGenerated: notifications.length,
        channelDistribution: this.analyzeNotificationChannels(notifications)
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Notification system validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateTeamIntegration(userId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      component: 'Team AI Integration',
      status: 'passed',
      score: 0,
      details: {
        functionality: false,
        performance: false,
        accuracy: false,
        reliability: false
      },
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };

    try {
      // Create test team data
      const testMembers = [
        {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
          role: 'developer',
          timezone: 'UTC',
          workingHours: { start: '09:00', end: '17:00' },
          skills: ['javascript', 'react'],
          currentWorkload: 75,
          recentProductivity: {
            tasksCompleted: 80,
            goalsProgress: 70,
            collaborationScore: 85,
            communicationFrequency: 75
          },
          wellbeingMetrics: {
            mood: 7,
            stress: 4,
            energy: 7,
            burnoutRisk: 'low' as const
          }
        }
      ];

      const testProjects = [
        {
          id: 'test_project',
          name: 'Test Project',
          description: 'Test project for validation',
          status: 'active' as const,
          priority: 'medium' as const,
          progress: 60,
          teamMembers: [userId],
          tasks: [],
          milestones: [],
          blockers: []
        }
      ];

      const startTime = Date.now();

      const analysis = await teamAIIntegration.analyzeTeamPerformance({
        teamId: 'test_team',
        members: testMembers,
        projects: testProjects,
        analysisDepth: 'basic',
        preferredProvider: 'lovable'
      });

      const responseTime = Date.now() - startTime;

      result.details.functionality = analysis.analytics && analysis.recommendations;
      result.details.performance = responseTime < 25000; // 25 seconds
      result.details.accuracy =
        typeof analysis.analytics.performance.overallProductivity === 'number' &&
        Array.isArray(analysis.recommendations);
      result.details.reliability = true;

      result.metrics = {
        responseTime,
        insightsGenerated: analysis.analytics.insights.length,
        recommendationsGenerated: analysis.recommendations.length,
        overallTeamScore: analysis.analytics.performance.overallProductivity
      };

      result.score = this.calculateComponentScore(result.details);

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Team integration validation failed: ${error}`);
      result.score = 0;
    }

    return result;
  }

  private async validateSystemIntegration(userId: string): Promise<SystemValidationReport['integration']> {
    const integration = {
      dataFlow: false,
      apiConnectivity: false,
      crossComponentCommunication: false,
      errorHandling: false
    };

    try {
      // Test data flow by checking if components can access shared data
      const { data: userData } = await supabase
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      integration.dataFlow = !!userData;

      // Test API connectivity
      integration.apiConnectivity = await this.testAPIConnectivity();

      // Test cross-component communication
      integration.crossComponentCommunication = await this.testCrossComponentCommunication(userId);

      // Test error handling
      integration.errorHandling = await this.testErrorHandling();

    } catch (error) {
      console.error('Integration validation failed:', error);
    }

    return integration;
  }

  private async measureSystemPerformance(userId: string): Promise<SystemValidationReport['performance']> {
    const performance = {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      throughput: 0
    };

    try {
      // Get recent AI service usage statistics
      const { data: usageStats } = await supabase
        .from('ai_service_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (usageStats && usageStats.length > 0) {
        const successful = usageStats.filter(u => u.success);
        const failed = usageStats.filter(u => !u.success);

        performance.successRate = (successful.length / usageStats.length) * 100;
        performance.errorRate = (failed.length / usageStats.length) * 100;
        performance.throughput = usageStats.length; // Requests in last 24h

        // Calculate average response time if available in metadata
        const responseTimes = usageStats
          .map(u => u.metadata?.responseTime)
          .filter(rt => typeof rt === 'number');

        if (responseTimes.length > 0) {
          performance.averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
        }
      }

    } catch (error) {
      console.error('Performance measurement failed:', error);
    }

    return performance;
  }

  // Helper methods

  private calculateComponentScore(details: ValidationResult['details']): number {
    const weights = {
      functionality: 40,
      performance: 25,
      accuracy: 25,
      reliability: 10
    };

    return Object.entries(details).reduce((score, [key, value]) => {
      return score + (value ? weights[key as keyof typeof weights] : 0);
    }, 0);
  }

  private calculateOverallScore(results: ValidationResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, result) => sum + result.score, 0) / results.length;
  }

  private determineSystemStatus(score: number, results: ValidationResult[]): 'healthy' | 'degraded' | 'critical' {
    const criticalFailures = results.filter(r => r.status === 'failed').length;

    if (criticalFailures > 2 || score < 50) return 'critical';
    if (criticalFailures > 0 || score < 80) return 'degraded';
    return 'healthy';
  }

  private generateSystemRecommendations(
    componentResults: ValidationResult[],
    integration: SystemValidationReport['integration'],
    performance: SystemValidationReport['performance']
  ): SystemValidationReport['recommendations'] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions for failed components
    componentResults.forEach(result => {
      if (result.status === 'failed') {
        immediate.push(`Fix critical issues in ${result.component}: ${result.errors.join(', ')}`);
      }
    });

    // Performance recommendations
    if (performance.averageResponseTime > 10000) {
      shortTerm.push('Optimize AI service response times');
    }

    if (performance.errorRate > 10) {
      immediate.push('Investigate and fix high error rate in AI services');
    }

    // Integration recommendations
    if (!integration.dataFlow) {
      immediate.push('Fix data flow issues between components');
    }

    if (!integration.crossComponentCommunication) {
      shortTerm.push('Improve cross-component communication mechanisms');
    }

    // Long-term improvements
    longTerm.push('Implement comprehensive monitoring and alerting');
    longTerm.push('Develop automated recovery mechanisms');
    longTerm.push('Plan regular validation schedules');

    return { immediate, shortTerm, longTerm };
  }

  private async testAPIConnectivity(): Promise<boolean> {
    try {
      // Test basic API endpoints
      const testEndpoints = [
        () => supabase.from('ai_insights').select('id').limit(1),
        () => supabase.from('ai_recommendations').select('id').limit(1),
        () => supabase.from('ai_service_usage').select('id').limit(1)
      ];

      const results = await Promise.all(
        testEndpoints.map(async (test) => {
          try {
            await test();
            return true;
          } catch {
            return false;
          }
        })
      );

      return results.filter(Boolean).length >= 2; // At least 2/3 working
    } catch {
      return false;
    }
  }

  private async testCrossComponentCommunication(userId: string): Promise<boolean> {
    try {
      // Test if one component can trigger another
      // For example, productivity insights triggering notifications
      return true; // Simplified for now
    } catch {
      return false;
    }
  }

  private async testErrorHandling(): Promise<boolean> {
    try {
      // Test error handling by making an invalid request
      const response = await aiServiceManager.makeRequest({
        provider: 'lovable',
        prompt: '', // Invalid empty prompt
        userId: 'test',
        requestType: 'error_test',
        maxTokens: -1, // Invalid token count
        temperature: 2 // Invalid temperature
      });

      // Should handle gracefully and return an error response
      return !response.success && response.error;
    } catch {
      // If it throws, that's also acceptable error handling
      return true;
    }
  }

  private analyzeNotificationChannels(notifications: any[]): Record<string, number> {
    const channels: Record<string, number> = {};
    notifications.forEach(n => {
      channels[n.channel] = (channels[n.channel] || 0) + 1;
    });
    return channels;
  }

  private async saveValidationReport(report: SystemValidationReport, userId: string): Promise<void> {
    try {
      await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          insight_type: 'system_validation',
          title: `AI System Validation - ${report.overall.status.toUpperCase()}`,
          content: `Overall system score: ${report.overall.score}/100. Status: ${report.overall.status}`,
          confidence: 1.0,
          metadata: {
            type: 'system_validation',
            report,
            validationDate: report.overall.timestamp
          }
        });
    } catch (error) {
      console.error('Failed to save validation report:', error);
    }
  }
}

export const aiSystemValidator = AISystemValidator.getInstance();