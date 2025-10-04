import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface BurnoutIndicator {
  category: 'workload' | 'emotional' | 'behavioral' | 'physical' | 'cognitive';
  metric: string;
  current_value: number;
  baseline_value: number;
  trend: 'improving' | 'stable' | 'concerning' | 'critical';
  weight: number; // 0-1, importance in overall burnout score
  threshold_warning: number;
  threshold_critical: number;
  last_measured: string;
}

export interface UserWellbeingData {
  userId: string;
  dateRange: {
    start: string;
    end: string;
  };
  workloadMetrics: {
    hoursWorked: number[];
    tasksCompleted: number[];
    overdueTasks: number[];
    meetingsPerDay: number[];
    overtimeHours: number[];
  };
  emotionalMetrics: {
    moodRatings: number[]; // 1-10 scale
    stressLevels: number[]; // 1-10 scale
    satisfactionRatings: number[]; // 1-10 scale
    energyLevels: number[]; // 1-10 scale
  };
  behavioralMetrics: {
    productivityScores: number[]; // calculated scores
    focusTime: number[]; // minutes of deep work per day
    breaksTaken: number[];
    sleepHours: number[];
    exerciseMinutes: number[];
  };
  physiologicalMetrics?: {
    heartRateVariability?: number[];
    sleepQuality?: number[];
    restingHeartRate?: number[];
  };
  contextualFactors: {
    workEnvironment: 'office' | 'remote' | 'hybrid';
    teamSize: number;
    projectDeadlines: string[];
    personalCommitments: number;
    seasonalFactors: any[];
  };
}

export interface BurnoutRiskAssessment {
  userId: string;
  assessmentDate: string;
  overallRiskScore: number; // 0-100, higher is more risk
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number; // 0-1
  timeToIntervention: string; // e.g., "2-3 weeks", "immediate"
  primaryFactors: BurnoutIndicator[];
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
    trend: 'improving' | 'stable' | 'worsening';
  }>;
  protectiveFactors: Array<{
    factor: string;
    strength: 'weak' | 'moderate' | 'strong';
    description: string;
    recommendation: string;
  }>;
  predictions: {
    probabilityBurnoutIn2Weeks: number;
    probabilityBurnoutIn1Month: number;
    probabilityBurnoutIn3Months: number;
  };
}

export interface BurnoutPrevention {
  interventionType: 'immediate' | 'short_term' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'workload' | 'recovery' | 'support' | 'mindset' | 'lifestyle';
  title: string;
  description: string;
  actionPlan: string[];
  expectedImpact: string;
  timeToEffect: string;
  effort: 'low' | 'medium' | 'high';
  success_metrics: string[];
  followUp: {
    checkInDays: number;
    monitoring_metrics: string[];
  };
}

export interface BurnoutAnalysisRequest {
  userId: string;
  wellbeingData: UserWellbeingData;
  lookbackDays?: number;
  includeExternalFactors?: boolean;
  preferredProvider?: AIProvider;
  sensitivityLevel: 'conservative' | 'balanced' | 'aggressive';
}

export class BurnoutPredictor {
  private static instance: BurnoutPredictor;

  public static getInstance(): BurnoutPredictor {
    if (!BurnoutPredictor.instance) {
      BurnoutPredictor.instance = new BurnoutPredictor();
    }
    return BurnoutPredictor.instance;
  }

  public async assessBurnoutRisk(request: BurnoutAnalysisRequest): Promise<{
    assessment: BurnoutRiskAssessment;
    interventions: BurnoutPrevention[];
    insights: any[];
  }> {
    const { wellbeingData, userId, preferredProvider = 'lovable' } = request;

    // Calculate burnout indicators
    const indicators = this.calculateBurnoutIndicators(wellbeingData);

    // Generate AI-powered risk assessment
    const aiAssessment = await this.generateAIRiskAssessment(request, indicators);

    // Calculate overall risk score and predictions
    const assessment = this.synthesizeRiskAssessment(aiAssessment, indicators, userId);

    // Generate targeted interventions
    const interventions = await this.generateInterventions(assessment, request);

    // Generate insights and patterns
    const insights = await this.generateBurnoutInsights(wellbeingData, assessment, preferredProvider, userId);

    return {
      assessment,
      interventions,
      insights
    };
  }

  private calculateBurnoutIndicators(wellbeingData: UserWellbeingData): BurnoutIndicator[] {
    const indicators: BurnoutIndicator[] = [];
    const { workloadMetrics, emotionalMetrics, behavioralMetrics } = wellbeingData;

    // Workload indicators
    const avgHoursWorked = this.calculateAverage(workloadMetrics.hoursWorked);
    const overtimeHours = this.calculateAverage(workloadMetrics.overtimeHours);

    indicators.push({
      category: 'workload',
      metric: 'average_hours_worked',
      current_value: avgHoursWorked,
      baseline_value: 8, // Standard 8-hour workday
      trend: this.calculateTrend(workloadMetrics.hoursWorked),
      weight: 0.25,
      threshold_warning: 9,
      threshold_critical: 11,
      last_measured: new Date().toISOString()
    });

    indicators.push({
      category: 'workload',
      metric: 'overtime_hours',
      current_value: overtimeHours,
      baseline_value: 0,
      trend: this.calculateTrend(workloadMetrics.overtimeHours),
      weight: 0.2,
      threshold_warning: 5,
      threshold_critical: 10,
      last_measured: new Date().toISOString()
    });

    // Emotional indicators
    const avgMood = this.calculateAverage(emotionalMetrics.moodRatings);
    const avgStress = this.calculateAverage(emotionalMetrics.stressLevels);
    const avgEnergy = this.calculateAverage(emotionalMetrics.energyLevels);

    indicators.push({
      category: 'emotional',
      metric: 'mood_rating',
      current_value: avgMood,
      baseline_value: 7, // Good mood baseline
      trend: this.calculateTrend(emotionalMetrics.moodRatings),
      weight: 0.3,
      threshold_warning: 5,
      threshold_critical: 3,
      last_measured: new Date().toISOString()
    });

    indicators.push({
      category: 'emotional',
      metric: 'stress_level',
      current_value: avgStress,
      baseline_value: 4, // Moderate stress baseline
      trend: this.calculateTrend(emotionalMetrics.stressLevels),
      weight: 0.25,
      threshold_warning: 7,
      threshold_critical: 9,
      last_measured: new Date().toISOString()
    });

    indicators.push({
      category: 'emotional',
      metric: 'energy_level',
      current_value: avgEnergy,
      baseline_value: 7, // Good energy baseline
      trend: this.calculateTrend(emotionalMetrics.energyLevels),
      weight: 0.2,
      threshold_warning: 4,
      threshold_critical: 2,
      last_measured: new Date().toISOString()
    });

    // Behavioral indicators
    const avgProductivity = this.calculateAverage(behavioralMetrics.productivityScores);
    const avgFocusTime = this.calculateAverage(behavioralMetrics.focusTime);
    const avgSleep = this.calculateAverage(behavioralMetrics.sleepHours);

    indicators.push({
      category: 'behavioral',
      metric: 'productivity_score',
      current_value: avgProductivity,
      baseline_value: 75, // Good productivity baseline
      trend: this.calculateTrend(behavioralMetrics.productivityScores),
      weight: 0.2,
      threshold_warning: 60,
      threshold_critical: 40,
      last_measured: new Date().toISOString()
    });

    indicators.push({
      category: 'behavioral',
      metric: 'focus_time_minutes',
      current_value: avgFocusTime,
      baseline_value: 180, // 3 hours baseline
      trend: this.calculateTrend(behavioralMetrics.focusTime),
      weight: 0.15,
      threshold_warning: 120,
      threshold_critical: 60,
      last_measured: new Date().toISOString()
    });

    indicators.push({
      category: 'physical',
      metric: 'sleep_hours',
      current_value: avgSleep,
      baseline_value: 7.5, // Optimal sleep baseline
      trend: this.calculateTrend(behavioralMetrics.sleepHours),
      weight: 0.2,
      threshold_warning: 6,
      threshold_critical: 5,
      last_measured: new Date().toISOString()
    });

    return indicators;
  }

  private async generateAIRiskAssessment(
    request: BurnoutAnalysisRequest,
    indicators: BurnoutIndicator[]
  ): Promise<any> {
    const prompt = this.buildBurnoutAssessmentPrompt(request, indicators);

    const aiRequest: AIServiceRequest = {
      provider: request.preferredProvider || 'lovable',
      prompt,
      userId: request.userId,
      requestType: 'burnout_assessment',
      maxTokens: 600,
      temperature: 0.3, // Lower temperature for consistent medical-like assessments
      metadata: { assessmentDate: new Date().toISOString() }
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      try {
        return JSON.parse(response.content);
      } catch (error) {
        console.error('Failed to parse AI burnout assessment:', error);
        return this.generateFallbackAssessment(indicators);
      }
    }

    return this.generateFallbackAssessment(indicators);
  }

  private buildBurnoutAssessmentPrompt(
    request: BurnoutAnalysisRequest,
    indicators: BurnoutIndicator[]
  ): string {
    const { wellbeingData, sensitivityLevel } = request;

    return `You are an expert occupational psychologist analyzing burnout risk factors. Provide a comprehensive assessment based on the following data.

BURNOUT INDICATORS:
${indicators.map(ind => `- ${ind.metric}: ${ind.current_value} (baseline: ${ind.baseline_value}, trend: ${ind.trend}, weight: ${ind.weight})`).join('\n')}

USER CONTEXT:
- Assessment Period: ${wellbeingData.dateRange.start} to ${wellbeingData.dateRange.end}
- Work Environment: ${wellbeingData.contextualFactors.workEnvironment}
- Team Size: ${wellbeingData.contextualFactors.teamSize}
- Upcoming Deadlines: ${wellbeingData.contextualFactors.projectDeadlines.length}
- Personal Commitments: ${wellbeingData.contextualFactors.personalCommitments}

RECENT PATTERNS:
- Average Work Hours: ${this.calculateAverage(wellbeingData.workloadMetrics.hoursWorked)} hours/day
- Average Mood: ${this.calculateAverage(wellbeingData.emotionalMetrics.moodRatings)}/10
- Average Stress: ${this.calculateAverage(wellbeingData.emotionalMetrics.stressLevels)}/10
- Average Sleep: ${this.calculateAverage(wellbeingData.behavioralMetrics.sleepHours)} hours/night
- Productivity Trend: ${this.calculateTrend(wellbeingData.behavioralMetrics.productivityScores)}

SENSITIVITY LEVEL: ${sensitivityLevel}

Analyze this data and provide:
1. Overall burnout risk score (0-100)
2. Risk level classification (low/moderate/high/critical)
3. Primary contributing factors
4. Protective factors present
5. Time to intervention estimate
6. Probability predictions for 2 weeks, 1 month, 3 months

Consider:
- Clinical burnout indicators (exhaustion, cynicism, reduced efficacy)
- Early warning signs vs acute symptoms
- Individual resilience factors
- Environmental stressors
- Recovery capacity

Format response as JSON:
{
  "riskScore": number,
  "riskLevel": "low|moderate|high|critical",
  "confidence": number,
  "timeToIntervention": "string",
  "primaryFactors": ["factor1", "factor2"],
  "protectiveFactors": ["factor1", "factor2"],
  "predictions": {
    "twoWeeks": number,
    "oneMonth": number,
    "threeMonths": number
  },
  "riskFactors": [
    {
      "factor": "string",
      "impact": "low|medium|high",
      "trend": "improving|stable|worsening",
      "description": "string"
    }
  ],
  "reasoning": "string"
}`;
  }

  private synthesizeRiskAssessment(
    aiAssessment: any,
    indicators: BurnoutIndicator[],
    userId: string
  ): BurnoutRiskAssessment {
    const criticalIndicators = indicators.filter(ind =>
      ind.current_value >= ind.threshold_critical ||
      (ind.category === 'emotional' && ind.current_value <= ind.threshold_critical)
    );

    const warningIndicators = indicators.filter(ind =>
      (ind.current_value >= ind.threshold_warning && ind.current_value < ind.threshold_critical) ||
      (ind.category === 'emotional' && ind.current_value <= ind.threshold_warning && ind.current_value > ind.threshold_critical)
    );

    // Calculate weighted risk score
    let weightedRiskScore = 0;
    let totalWeight = 0;

    indicators.forEach(ind => {
      let riskContribution = 0;

      if (ind.category === 'emotional' || ind.category === 'physical') {
        // For emotional and physical metrics, lower values indicate higher risk
        const deviation = (ind.baseline_value - ind.current_value) / ind.baseline_value;
        riskContribution = Math.max(0, deviation) * 100;
      } else {
        // For workload and behavioral metrics, higher values indicate higher risk
        const deviation = (ind.current_value - ind.baseline_value) / ind.baseline_value;
        riskContribution = Math.max(0, deviation) * 100;
      }

      weightedRiskScore += riskContribution * ind.weight;
      totalWeight += ind.weight;
    });

    const calculatedRiskScore = Math.min(100, weightedRiskScore / totalWeight);

    // Use AI assessment if available, otherwise use calculated score
    const finalRiskScore = aiAssessment?.riskScore || calculatedRiskScore;

    let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    if (finalRiskScore >= 80 || criticalIndicators.length >= 3) {
      riskLevel = 'critical';
    } else if (finalRiskScore >= 60 || criticalIndicators.length >= 1) {
      riskLevel = 'high';
    } else if (finalRiskScore >= 35 || warningIndicators.length >= 2) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    return {
      userId,
      assessmentDate: new Date().toISOString(),
      overallRiskScore: finalRiskScore,
      riskLevel,
      confidence: aiAssessment?.confidence || 0.7,
      timeToIntervention: aiAssessment?.timeToIntervention || this.estimateTimeToIntervention(riskLevel),
      primaryFactors: [...criticalIndicators, ...warningIndicators].slice(0, 5),
      riskFactors: aiAssessment?.riskFactors || this.generateRiskFactors(indicators),
      protectiveFactors: this.identifyProtectiveFactors(indicators),
      predictions: aiAssessment?.predictions || {
        probabilityBurnoutIn2Weeks: this.calculateBurnoutProbability(finalRiskScore, 14),
        probabilityBurnoutIn1Month: this.calculateBurnoutProbability(finalRiskScore, 30),
        probabilityBurnoutIn3Months: this.calculateBurnoutProbability(finalRiskScore, 90)
      }
    };
  }

  private async generateInterventions(
    assessment: BurnoutRiskAssessment,
    request: BurnoutAnalysisRequest
  ): Promise<BurnoutPrevention[]> {
    const interventions: BurnoutPrevention[] = [];

    // Generate immediate interventions for critical/high risk
    if (assessment.riskLevel === 'critical' || assessment.riskLevel === 'high') {
      interventions.push(...await this.generateImmediateInterventions(assessment, request));
    }

    // Generate targeted interventions based on primary factors
    for (const factor of assessment.primaryFactors.slice(0, 3)) {
      const intervention = await this.generateFactorSpecificIntervention(factor, assessment, request);
      if (intervention) {
        interventions.push(intervention);
      }
    }

    // Generate long-term resilience interventions
    interventions.push(...await this.generateResilienceInterventions(assessment, request));

    return interventions;
  }

  private async generateImmediateInterventions(
    assessment: BurnoutRiskAssessment,
    request: BurnoutAnalysisRequest
  ): Promise<BurnoutPrevention[]> {
    const interventions: BurnoutPrevention[] = [];

    if (assessment.riskLevel === 'critical') {
      interventions.push({
        interventionType: 'immediate',
        priority: 'urgent',
        category: 'recovery',
        title: 'Emergency Recovery Protocol',
        description: 'Immediate action needed to prevent burnout escalation',
        actionPlan: [
          'Take immediate time off (minimum 2-3 days)',
          'Contact healthcare provider or counselor',
          'Delegate or postpone non-essential tasks',
          'Inform manager/team about need for temporary reduced workload',
          'Implement daily stress reduction activities'
        ],
        expectedImpact: 'Prevent immediate burnout and begin recovery process',
        timeToEffect: '24-48 hours',
        effort: 'high',
        success_metrics: ['stress_level_reduction', 'mood_improvement', 'sleep_quality_improvement'],
        followUp: {
          checkInDays: 3,
          monitoring_metrics: ['mood_rating', 'stress_level', 'energy_level']
        }
      });
    }

    if (assessment.riskLevel === 'high') {
      interventions.push({
        interventionType: 'immediate',
        priority: 'high',
        category: 'workload',
        title: 'Workload Adjustment',
        description: 'Reduce current workload and optimize task distribution',
        actionPlan: [
          'Review and reprioritize current tasks',
          'Delegate 20-30% of current responsibilities',
          'Cancel or reschedule non-essential meetings',
          'Set clearer boundaries on work hours',
          'Communicate workload concerns with supervisor'
        ],
        expectedImpact: 'Reduced stress and improved work-life balance',
        timeToEffect: '1-2 weeks',
        effort: 'medium',
        success_metrics: ['hours_worked_reduction', 'overtime_reduction', 'stress_level_improvement'],
        followUp: {
          checkInDays: 7,
          monitoring_metrics: ['hours_worked', 'stress_level', 'productivity_score']
        }
      });
    }

    return interventions;
  }

  private async generateFactorSpecificIntervention(
    factor: BurnoutIndicator,
    assessment: BurnoutRiskAssessment,
    request: BurnoutAnalysisRequest
  ): Promise<BurnoutPrevention | null> {
    const interventionMap: Record<string, Partial<BurnoutPrevention>> = {
      'average_hours_worked': {
        category: 'workload',
        title: 'Work Hours Optimization',
        description: 'Reduce excessive working hours to sustainable levels',
        actionPlan: [
          'Set strict start and end times for work',
          'Use time blocking to increase efficiency',
          'Eliminate low-value activities',
          'Practice saying no to non-essential requests'
        ],
        expectedImpact: 'Improved work-life balance and reduced fatigue'
      },
      'mood_rating': {
        category: 'support',
        title: 'Emotional Support Enhancement',
        description: 'Address declining mood and emotional wellbeing',
        actionPlan: [
          'Schedule regular check-ins with trusted colleagues',
          'Consider professional counseling or therapy',
          'Practice daily mindfulness or meditation',
          'Engage in mood-boosting activities regularly'
        ],
        expectedImpact: 'Improved emotional resilience and mood stability'
      },
      'sleep_hours': {
        category: 'lifestyle',
        title: 'Sleep Hygiene Improvement',
        description: 'Optimize sleep quality and duration for better recovery',
        actionPlan: [
          'Establish consistent sleep and wake times',
          'Create a relaxing bedtime routine',
          'Limit screen time 1 hour before bed',
          'Optimize bedroom environment for sleep'
        ],
        expectedImpact: 'Better physical and mental recovery'
      }
    };

    const baseIntervention = interventionMap[factor.metric];
    if (!baseIntervention) return null;

    return {
      interventionType: 'short_term',
      priority: factor.trend === 'critical' ? 'urgent' : 'high',
      effort: 'medium',
      timeToEffect: '1-2 weeks',
      success_metrics: [factor.metric, 'overall_wellbeing'],
      followUp: {
        checkInDays: 7,
        monitoring_metrics: [factor.metric]
      },
      ...baseIntervention
    } as BurnoutPrevention;
  }

  private async generateResilienceInterventions(
    assessment: BurnoutRiskAssessment,
    request: BurnoutAnalysisRequest
  ): Promise<BurnoutPrevention[]> {
    return [
      {
        interventionType: 'long_term',
        priority: 'medium',
        category: 'mindset',
        title: 'Resilience Building Program',
        description: 'Develop long-term strategies for stress management and resilience',
        actionPlan: [
          'Learn and practice stress management techniques',
          'Develop a personal wellness routine',
          'Build stronger social support networks',
          'Set realistic goals and expectations',
          'Practice regular self-reflection and self-care'
        ],
        expectedImpact: 'Increased resilience and sustainable work practices',
        timeToEffect: '4-6 weeks',
        effort: 'medium',
        success_metrics: ['stress_management_skills', 'work_satisfaction', 'energy_levels'],
        followUp: {
          checkInDays: 21,
          monitoring_metrics: ['mood_rating', 'stress_level', 'energy_level', 'productivity_score']
        }
      }
    ];
  }

  private async generateBurnoutInsights(
    wellbeingData: UserWellbeingData,
    assessment: BurnoutRiskAssessment,
    provider: AIProvider,
    userId: string
  ): Promise<any[]> {
    const insights = [];

    // Pattern recognition insights
    if (assessment.riskLevel === 'high' || assessment.riskLevel === 'critical') {
      insights.push({
        type: 'warning',
        title: 'Burnout Risk Detected',
        description: `High burnout risk identified with score of ${assessment.overallRiskScore}/100`,
        recommendations: ['Take immediate action', 'Reduce workload', 'Seek support'],
        priority: 'high'
      });
    }

    // Trend insights
    const decliningMetrics = assessment.primaryFactors.filter(f => f.trend === 'concerning' || f.trend === 'critical');
    if (decliningMetrics.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Declining Wellbeing Metrics',
        description: `${decliningMetrics.length} key metrics showing concerning trends`,
        recommendations: ['Monitor closely', 'Address root causes', 'Implement interventions'],
        priority: 'medium'
      });
    }

    return insights;
  }

  // Helper methods

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'concerning' | 'critical' {
    if (values.length < 3) return 'stable';

    const recent = values.slice(-3);
    const earlier = values.slice(0, -3);

    if (earlier.length === 0) return 'stable';

    const recentAvg = this.calculateAverage(recent);
    const earlierAvg = this.calculateAverage(earlier);

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (Math.abs(change) < 0.1) return 'stable';
    if (change > 0.3) return 'critical';
    if (change > 0.1) return 'concerning';
    if (change < -0.1) return 'improving';

    return 'stable';
  }

  private generateFallbackAssessment(indicators: BurnoutIndicator[]): any {
    const criticalCount = indicators.filter(ind => ind.trend === 'critical').length;
    const concerningCount = indicators.filter(ind => ind.trend === 'concerning').length;

    let riskScore = 30; // Base risk
    riskScore += criticalCount * 20;
    riskScore += concerningCount * 10;

    return {
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'moderate' : 'low',
      confidence: 0.6,
      timeToIntervention: riskScore >= 70 ? 'immediate' : '1-2 weeks',
      reasoning: 'Fallback assessment based on indicator analysis'
    };
  }

  private generateRiskFactors(indicators: BurnoutIndicator[]): any[] {
    return indicators
      .filter(ind => ind.trend === 'concerning' || ind.trend === 'critical')
      .map(ind => ({
        factor: ind.metric,
        impact: ind.weight > 0.2 ? 'high' : 'medium',
        trend: ind.trend === 'critical' ? 'worsening' : 'stable',
        description: `${ind.metric} is showing ${ind.trend} trends`
      }));
  }

  private identifyProtectiveFactors(indicators: BurnoutIndicator[]): any[] {
    return indicators
      .filter(ind => ind.trend === 'improving' || ind.current_value > ind.baseline_value)
      .map(ind => ({
        factor: ind.metric,
        strength: ind.current_value > ind.baseline_value * 1.2 ? 'strong' : 'moderate',
        description: `${ind.metric} is performing well`,
        recommendation: `Continue maintaining good ${ind.metric}`
      }));
  }

  private estimateTimeToIntervention(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical': return 'immediate';
      case 'high': return '1-3 days';
      case 'moderate': return '1-2 weeks';
      case 'low': return '1 month';
      default: return '2 weeks';
    }
  }

  private calculateBurnoutProbability(riskScore: number, days: number): number {
    // Simplified probability calculation
    const baseProb = riskScore / 100;
    const timeMultiplier = Math.log(days + 1) / Math.log(30); // Normalized to 30 days

    return Math.min(1, baseProb * timeMultiplier);
  }

  public async saveBurnoutAssessment(
    assessment: BurnoutRiskAssessment,
    interventions: BurnoutPrevention[],
    userId: string
  ): Promise<void> {
    // Save assessment to insights
    await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'burnout_prevention',
        title: `Burnout Risk Assessment - ${assessment.riskLevel.toUpperCase()}`,
        content: `Risk score: ${assessment.overallRiskScore}/100. Time to intervention: ${assessment.timeToIntervention}`,
        confidence: assessment.confidence,
        metadata: {
          assessment,
          riskLevel: assessment.riskLevel,
          riskScore: assessment.overallRiskScore
        }
      });

    // Save interventions as recommendations
    for (const intervention of interventions) {
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          title: intervention.title,
          description: intervention.description,
          implementation_steps: intervention.actionPlan,
          expected_impact: intervention.expectedImpact,
          effort_level: intervention.effort,
          priority: this.mapInterventionPriorityToNumber(intervention.priority),
          metadata: {
            type: 'burnout_prevention',
            category: intervention.category,
            interventionType: intervention.interventionType,
            timeToEffect: intervention.timeToEffect,
            successMetrics: intervention.success_metrics,
            followUp: intervention.followUp
          }
        });
    }
  }

  private mapInterventionPriorityToNumber(priority: string): number {
    switch (priority) {
      case 'urgent': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 3;
    }
  }
}

export const burnoutPredictor = BurnoutPredictor.getInstance();