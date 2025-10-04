import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  skills: string[];
  currentWorkload: number; // 0-100%
  recentProductivity: {
    tasksCompleted: number;
    goalsProgress: number;
    collaborationScore: number;
    communicationFrequency: number;
  };
  wellbeingMetrics: {
    mood: number; // 1-10
    stress: number; // 1-10
    energy: number; // 1-10
    burnoutRisk: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface TeamProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  progress: number; // 0-100%
  teamMembers: string[]; // Member IDs
  tasks: Array<{
    id: string;
    title: string;
    assignedTo?: string;
    status: string;
    estimatedHours: number;
    actualHours?: number;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }>;
  blockers: Array<{
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    assignedTo?: string;
  }>;
}

export interface TeamAnalytics {
  teamId: string;
  analysisDate: string;
  members: TeamMember[];
  projects: TeamProject[];
  performance: {
    overallProductivity: number; // 0-100
    collaborationEffectiveness: number; // 0-100
    communicationQuality: number; // 0-100
    goalAlignment: number; // 0-100
    workloadBalance: number; // 0-100
  };
  trends: {
    productivityTrend: 'improving' | 'stable' | 'declining';
    burnoutRisk: 'low' | 'medium' | 'high';
    collaborationTrend: 'improving' | 'stable' | 'declining';
    goalProgressTrend: 'on_track' | 'behind' | 'ahead';
  };
  insights: Array<{
    type: 'strength' | 'opportunity' | 'risk' | 'bottleneck';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    affectedMembers: string[];
    affectedProjects: string[];
    recommendations: string[];
    confidence: number;
  }>;
}

export interface TeamRecommendation {
  id: string;
  teamId: string;
  type: 'workload_rebalancing' | 'skill_development' | 'communication_improvement' | 'process_optimization' | 'wellbeing_intervention' | 'goal_realignment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  targetMembers: string[];
  targetProjects: string[];
  actionPlan: Array<{
    step: string;
    owner: string;
    timeline: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  expectedOutcomes: string[];
  successMetrics: string[];
  implementation: {
    timeframe: string;
    dependencies: string[];
    resources: string[];
  };
  confidence: number;
  reasoning: string;
}

export interface TeamAIRequest {
  teamId: string;
  members: TeamMember[];
  projects: TeamProject[];
  analysisDepth: 'basic' | 'comprehensive' | 'detailed';
  focusAreas?: string[];
  preferredProvider?: AIProvider;
  includeIndividualInsights?: boolean;
  lookbackDays?: number;
}

export class TeamAIIntegration {
  private static instance: TeamAIIntegration;

  public static getInstance(): TeamAIIntegration {
    if (!TeamAIIntegration.instance) {
      TeamAIIntegration.instance = new TeamAIIntegration();
    }
    return TeamAIIntegration.instance;
  }

  public async analyzeTeamPerformance(request: TeamAIRequest): Promise<{
    analytics: TeamAnalytics;
    recommendations: TeamRecommendation[];
    individualInsights: Record<string, any>;
  }> {
    const { teamId, members, projects, preferredProvider = 'lovable' } = request;

    // Calculate team performance metrics
    const performance = this.calculateTeamPerformance(members, projects);

    // Identify trends and patterns
    const trends = await this.analyzeTrends(members, projects, request.lookbackDays || 30);

    // Generate AI-powered insights
    const insights = await this.generateTeamInsights(request, performance, trends);

    // Create team analytics object
    const analytics: TeamAnalytics = {
      teamId,
      analysisDate: new Date().toISOString(),
      members,
      projects,
      performance,
      trends,
      insights
    };

    // Generate team recommendations
    const recommendations = await this.generateTeamRecommendations(analytics, request);

    // Generate individual insights if requested
    const individualInsights: Record<string, any> = {};
    if (request.includeIndividualInsights) {
      for (const member of members) {
        individualInsights[member.id] = await this.generateIndividualInsights(member, analytics, request);
      }
    }

    return {
      analytics,
      recommendations,
      individualInsights
    };
  }

  private calculateTeamPerformance(members: TeamMember[], projects: TeamProject[]) {
    // Calculate overall productivity
    const overallProductivity = members.reduce((sum, member) => {
      return sum + (
        member.recentProductivity.tasksCompleted * 0.3 +
        member.recentProductivity.goalsProgress * 0.3 +
        member.recentProductivity.collaborationScore * 0.2 +
        member.recentProductivity.communicationFrequency * 0.2
      );
    }, 0) / members.length;

    // Calculate collaboration effectiveness
    const collaborationEffectiveness = members.reduce((sum, member) =>
      sum + member.recentProductivity.collaborationScore, 0
    ) / members.length;

    // Calculate communication quality
    const communicationQuality = members.reduce((sum, member) =>
      sum + member.recentProductivity.communicationFrequency, 0
    ) / members.length;

    // Calculate goal alignment (project progress vs timeline)
    const goalAlignment = projects.reduce((sum, project) => {
      const timeElapsed = this.calculateProjectTimeElapsed(project);
      const expectedProgress = Math.min(100, timeElapsed * 100);
      const actualProgress = project.progress;
      const alignment = Math.max(0, 100 - Math.abs(expectedProgress - actualProgress));
      return sum + alignment;
    }, 0) / Math.max(projects.length, 1);

    // Calculate workload balance
    const workloads = members.map(m => m.currentWorkload);
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const workloadVariance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
    const workloadBalance = Math.max(0, 100 - Math.sqrt(workloadVariance));

    return {
      overallProductivity,
      collaborationEffectiveness,
      communicationQuality,
      goalAlignment,
      workloadBalance
    };
  }

  private async analyzeTrends(members: TeamMember[], projects: TeamProject[], lookbackDays: number) {
    // This would typically analyze historical data
    // For now, providing simplified trend analysis

    const avgProductivity = members.reduce((sum, m) => sum + m.recentProductivity.tasksCompleted, 0) / members.length;
    const highBurnoutMembers = members.filter(m => m.wellbeingMetrics.burnoutRisk === 'high' || m.wellbeingMetrics.burnoutRisk === 'critical').length;

    return {
      productivityTrend: avgProductivity >= 80 ? 'improving' : avgProductivity >= 60 ? 'stable' : 'declining' as const,
      burnoutRisk: highBurnoutMembers >= members.length * 0.3 ? 'high' : highBurnoutMembers > 0 ? 'medium' : 'low' as const,
      collaborationTrend: 'stable' as const, // Would analyze historical collaboration data
      goalProgressTrend: projects.every(p => p.progress >= 70) ? 'on_track' : 'behind' as const
    };
  }

  private async generateTeamInsights(
    request: TeamAIRequest,
    performance: TeamAnalytics['performance'],
    trends: TeamAnalytics['trends']
  ): Promise<TeamAnalytics['insights']> {
    const prompt = this.buildTeamInsightsPrompt(request, performance, trends);

    const aiRequest: AIServiceRequest = {
      provider: request.preferredProvider || 'lovable',
      prompt,
      userId: 'team_' + request.teamId,
      requestType: 'team_analysis',
      maxTokens: 700,
      temperature: 0.4,
      metadata: { teamId: request.teamId, analysisType: 'team_insights' }
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      try {
        const aiInsights = JSON.parse(response.content);
        return aiInsights.insights || [];
      } catch (error) {
        console.error('Failed to parse AI team insights:', error);
      }
    }

    // Fallback insights
    return this.generateFallbackInsights(request.members, performance, trends);
  }

  private buildTeamInsightsPrompt(
    request: TeamAIRequest,
    performance: TeamAnalytics['performance'],
    trends: TeamAnalytics['trends']
  ): string {
    return `You are an expert team productivity analyst. Analyze this team's performance data and identify key insights.

TEAM COMPOSITION:
- Team Size: ${request.members.length} members
- Departments: ${[...new Set(request.members.map(m => m.department))].join(', ')}
- Skill Distribution: ${this.getSkillDistribution(request.members)}

PERFORMANCE METRICS:
- Overall Productivity: ${performance.overallProductivity.toFixed(1)}%
- Collaboration Effectiveness: ${performance.collaborationEffectiveness.toFixed(1)}%
- Communication Quality: ${performance.communicationQuality.toFixed(1)}%
- Goal Alignment: ${performance.goalAlignment.toFixed(1)}%
- Workload Balance: ${performance.workloadBalance.toFixed(1)}%

TRENDS:
- Productivity: ${trends.productivityTrend}
- Burnout Risk: ${trends.burnoutRisk}
- Collaboration: ${trends.collaborationTrend}
- Goal Progress: ${trends.goalProgressTrend}

TEAM WELLBEING:
- Members at High Burnout Risk: ${request.members.filter(m => m.wellbeingMetrics.burnoutRisk === 'high').length}
- Average Stress Level: ${(request.members.reduce((sum, m) => sum + m.wellbeingMetrics.stress, 0) / request.members.length).toFixed(1)}/10
- Average Mood: ${(request.members.reduce((sum, m) => sum + m.wellbeingMetrics.mood, 0) / request.members.length).toFixed(1)}/10

WORKLOAD ANALYSIS:
- Overloaded Members (>90%): ${request.members.filter(m => m.currentWorkload > 90).length}
- Underutilized Members (<60%): ${request.members.filter(m => m.currentWorkload < 60).length}
- Average Workload: ${(request.members.reduce((sum, m) => sum + m.currentWorkload, 0) / request.members.length).toFixed(1)}%

PROJECT STATUS:
- Active Projects: ${request.projects.filter(p => p.status === 'active').length}
- Behind Schedule: ${request.projects.filter(p => p.progress < 70).length}
- High Priority Projects: ${request.projects.filter(p => p.priority === 'high' || p.priority === 'urgent').length}

Generate 3-5 strategic insights focusing on:
1. Team strengths and what's working well
2. Key bottlenecks or risks that need attention
3. Opportunities for improvement and optimization
4. Patterns in collaboration and communication
5. Workload and wellbeing concerns

For each insight, provide:
- Type (strength/opportunity/risk/bottleneck)
- Priority level
- Clear description of the finding
- Which members/projects are affected
- Specific recommendations
- Confidence level (0-1)

Format as JSON:
{
  "insights": [
    {
      "type": "strength|opportunity|risk|bottleneck",
      "priority": "low|medium|high|urgent",
      "title": "Brief insight title",
      "description": "Detailed description",
      "affectedMembers": ["member_id1", "member_id2"],
      "affectedProjects": ["project_id1"],
      "recommendations": ["rec1", "rec2", "rec3"],
      "confidence": 0.8
    }
  ]
}`;
  }

  private async generateTeamRecommendations(
    analytics: TeamAnalytics,
    request: TeamAIRequest
  ): Promise<TeamRecommendation[]> {
    const recommendations: TeamRecommendation[] = [];

    // Generate recommendations based on insights
    for (const insight of analytics.insights.filter(i => i.priority === 'high' || i.priority === 'urgent')) {
      const recommendation = await this.generateRecommendationFromInsight(insight, analytics, request);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add specific recommendations based on performance metrics
    if (analytics.performance.workloadBalance < 60) {
      recommendations.push(this.createWorkloadRebalancingRecommendation(analytics));
    }

    if (analytics.trends.burnoutRisk === 'high') {
      recommendations.push(this.createWellbeingInterventionRecommendation(analytics));
    }

    if (analytics.performance.collaborationEffectiveness < 70) {
      recommendations.push(this.createCollaborationImprovementRecommendation(analytics));
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private async generateRecommendationFromInsight(
    insight: TeamAnalytics['insights'][0],
    analytics: TeamAnalytics,
    request: TeamAIRequest
  ): Promise<TeamRecommendation | null> {
    const prompt = `Create a specific, actionable recommendation based on this team insight:

INSIGHT: ${insight.title}
DESCRIPTION: ${insight.description}
TYPE: ${insight.type}
PRIORITY: ${insight.priority}
AFFECTED MEMBERS: ${insight.affectedMembers.length}
AFFECTED PROJECTS: ${insight.affectedProjects.length}
RECOMMENDATIONS: ${insight.recommendations.join(', ')}

TEAM CONTEXT:
- Team Size: ${analytics.members.length}
- Current Performance: ${analytics.performance.overallProductivity.toFixed(1)}%
- Key Trends: ${Object.values(analytics.trends).join(', ')}

Create a detailed recommendation with:
1. Clear action plan with specific steps
2. Timeline and ownership assignments
3. Expected outcomes and success metrics
4. Implementation requirements

Format as JSON with the structure matching TeamRecommendation interface.`;

    const aiRequest: AIServiceRequest = {
      provider: request.preferredProvider || 'lovable',
      prompt,
      userId: 'team_' + request.teamId,
      requestType: 'team_recommendation',
      maxTokens: 500,
      temperature: 0.5,
      metadata: { insightId: insight.title }
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      try {
        const aiRec = JSON.parse(response.content);
        return {
          id: crypto.randomUUID(),
          teamId: analytics.teamId,
          ...aiRec,
          targetMembers: insight.affectedMembers,
          targetProjects: insight.affectedProjects,
          confidence: insight.confidence
        };
      } catch (error) {
        console.error('Failed to parse AI recommendation:', error);
      }
    }

    return null;
  }

  private createWorkloadRebalancingRecommendation(analytics: TeamAnalytics): TeamRecommendation {
    const overloadedMembers = analytics.members.filter(m => m.currentWorkload > 90);
    const underutilizedMembers = analytics.members.filter(m => m.currentWorkload < 60);

    return {
      id: crypto.randomUUID(),
      teamId: analytics.teamId,
      type: 'workload_rebalancing',
      priority: 'high',
      title: 'Rebalance Team Workload Distribution',
      description: `Workload imbalance detected: ${overloadedMembers.length} members are overloaded while ${underutilizedMembers.length} have capacity`,
      targetMembers: [...overloadedMembers.map(m => m.id), ...underutilizedMembers.map(m => m.id)],
      targetProjects: analytics.projects.filter(p => p.status === 'active').map(p => p.id),
      actionPlan: [
        {
          step: 'Assess current task assignments and capacity',
          owner: 'team_lead',
          timeline: '3 days',
          effort: 'low'
        },
        {
          step: 'Redistribute tasks from overloaded to underutilized members',
          owner: 'project_managers',
          timeline: '1 week',
          effort: 'medium'
        },
        {
          step: 'Implement workload monitoring system',
          owner: 'team_lead',
          timeline: '2 weeks',
          effort: 'medium'
        }
      ],
      expectedOutcomes: [
        'Reduced stress for overloaded team members',
        'Better utilization of team capacity',
        'Improved overall team productivity'
      ],
      successMetrics: ['workload_variance_reduction', 'stress_level_improvement', 'productivity_increase'],
      implementation: {
        timeframe: '2-3 weeks',
        dependencies: ['management_approval', 'task_reassignment_coordination'],
        resources: ['project_management_tools', 'workload_tracking_system']
      },
      confidence: 0.85,
      reasoning: 'High workload imbalance is a clear indicator that requires immediate attention to prevent burnout and improve team effectiveness'
    };
  }

  private createWellbeingInterventionRecommendation(analytics: TeamAnalytics): TeamRecommendation {
    const atRiskMembers = analytics.members.filter(m =>
      m.wellbeingMetrics.burnoutRisk === 'high' || m.wellbeingMetrics.burnoutRisk === 'critical'
    );

    return {
      id: crypto.randomUUID(),
      teamId: analytics.teamId,
      type: 'wellbeing_intervention',
      priority: 'urgent',
      title: 'Implement Team Wellbeing Support Program',
      description: `${atRiskMembers.length} team members are at high risk of burnout, requiring immediate intervention`,
      targetMembers: atRiskMembers.map(m => m.id),
      targetProjects: [],
      actionPlan: [
        {
          step: 'Conduct individual wellbeing check-ins',
          owner: 'team_lead',
          timeline: '1 week',
          effort: 'medium'
        },
        {
          step: 'Implement stress reduction initiatives',
          owner: 'hr_team',
          timeline: '2 weeks',
          effort: 'medium'
        },
        {
          step: 'Provide mental health resources and support',
          owner: 'hr_team',
          timeline: '1 week',
          effort: 'low'
        }
      ],
      expectedOutcomes: [
        'Reduced burnout risk across the team',
        'Improved team morale and job satisfaction',
        'Better long-term productivity and retention'
      ],
      successMetrics: ['burnout_risk_reduction', 'stress_level_improvement', 'team_satisfaction_scores'],
      implementation: {
        timeframe: '2-4 weeks',
        dependencies: ['hr_support', 'management_buy_in'],
        resources: ['wellbeing_programs', 'mental_health_resources', 'flexible_work_options']
      },
      confidence: 0.9,
      reasoning: 'High burnout risk requires immediate intervention to prevent team performance degradation and member turnover'
    };
  }

  private createCollaborationImprovementRecommendation(analytics: TeamAnalytics): TeamRecommendation {
    return {
      id: crypto.randomUUID(),
      teamId: analytics.teamId,
      type: 'communication_improvement',
      priority: 'medium',
      title: 'Enhance Team Collaboration Practices',
      description: 'Below-average collaboration effectiveness indicates need for improved team communication and coordination',
      targetMembers: analytics.members.map(m => m.id),
      targetProjects: analytics.projects.filter(p => p.status === 'active').map(p => p.id),
      actionPlan: [
        {
          step: 'Implement regular team sync meetings',
          owner: 'team_lead',
          timeline: '1 week',
          effort: 'low'
        },
        {
          step: 'Establish clear communication protocols',
          owner: 'team_lead',
          timeline: '2 weeks',
          effort: 'medium'
        },
        {
          step: 'Provide collaboration tools training',
          owner: 'it_team',
          timeline: '2 weeks',
          effort: 'medium'
        }
      ],
      expectedOutcomes: [
        'Improved team communication frequency and quality',
        'Better project coordination and information sharing',
        'Enhanced team cohesion and collaboration effectiveness'
      ],
      successMetrics: ['collaboration_score_improvement', 'communication_frequency_increase', 'project_coordination_efficiency'],
      implementation: {
        timeframe: '3-4 weeks',
        dependencies: ['team_schedule_coordination', 'tool_access'],
        resources: ['collaboration_platforms', 'training_materials', 'meeting_infrastructure']
      },
      confidence: 0.75,
      reasoning: 'Collaboration effectiveness below 70% indicates systematic communication issues that can be addressed with structured improvements'
    };
  }

  private async generateIndividualInsights(
    member: TeamMember,
    analytics: TeamAnalytics,
    request: TeamAIRequest
  ): Promise<any> {
    // Generate personalized insights for individual team members
    return {
      memberId: member.id,
      productivity: {
        relative_to_team: member.recentProductivity.tasksCompleted > analytics.performance.overallProductivity ? 'above_average' : 'below_average',
        strengths: this.identifyMemberStrengths(member),
        improvementAreas: this.identifyImprovementAreas(member, analytics)
      },
      wellbeing: {
        burnoutRisk: member.wellbeingMetrics.burnoutRisk,
        recommendations: this.getWellbeingRecommendations(member)
      },
      collaboration: {
        teamContribution: member.recentProductivity.collaborationScore,
        sugggestedPartnerships: this.suggestCollaborationOpportunities(member, analytics.members)
      }
    };
  }

  // Helper methods

  private calculateProjectTimeElapsed(project: TeamProject): number {
    // Simplified calculation - would need actual project start date
    return 0.5; // Placeholder: 50% time elapsed
  }

  private getSkillDistribution(members: TeamMember[]): string {
    const skillCounts: Record<string, number> = {};
    members.forEach(member => {
      member.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => `${skill}(${count})`)
      .join(', ');
  }

  private generateFallbackInsights(
    members: TeamMember[],
    performance: TeamAnalytics['performance'],
    trends: TeamAnalytics['trends']
  ): TeamAnalytics['insights'] {
    const insights: TeamAnalytics['insights'] = [];

    // Workload imbalance insight
    const workloadVariance = this.calculateWorkloadVariance(members);
    if (workloadVariance > 25) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'Workload Imbalance Detected',
        description: 'Significant variation in team member workloads may lead to burnout and inefficiency',
        affectedMembers: members.filter(m => m.currentWorkload > 90 || m.currentWorkload < 50).map(m => m.id),
        affectedProjects: [],
        recommendations: ['Redistribute tasks more evenly', 'Monitor workload regularly', 'Implement capacity planning'],
        confidence: 0.8
      });
    }

    // High burnout risk insight
    const highBurnoutMembers = members.filter(m => m.wellbeingMetrics.burnoutRisk === 'high' || m.wellbeingMetrics.burnoutRisk === 'critical');
    if (highBurnoutMembers.length > 0) {
      insights.push({
        type: 'risk',
        priority: 'urgent',
        title: 'Team Burnout Risk',
        description: `${highBurnoutMembers.length} team members showing signs of high burnout risk`,
        affectedMembers: highBurnoutMembers.map(m => m.id),
        affectedProjects: [],
        recommendations: ['Provide immediate support', 'Reduce workload', 'Offer mental health resources'],
        confidence: 0.9
      });
    }

    return insights;
  }

  private calculateWorkloadVariance(members: TeamMember[]): number {
    const workloads = members.map(m => m.currentWorkload);
    const avg = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / workloads.length;
    return Math.sqrt(variance);
  }

  private identifyMemberStrengths(member: TeamMember): string[] {
    const strengths: string[] = [];

    if (member.recentProductivity.tasksCompleted >= 85) {
      strengths.push('High task completion rate');
    }
    if (member.recentProductivity.collaborationScore >= 80) {
      strengths.push('Strong collaboration skills');
    }
    if (member.wellbeingMetrics.mood >= 8) {
      strengths.push('Positive attitude and morale');
    }
    if (member.currentWorkload <= 80 && member.recentProductivity.tasksCompleted >= 70) {
      strengths.push('Efficient work management');
    }

    return strengths;
  }

  private identifyImprovementAreas(member: TeamMember, analytics: TeamAnalytics): string[] {
    const areas: string[] = [];

    if (member.recentProductivity.tasksCompleted < 60) {
      areas.push('Task completion rate');
    }
    if (member.recentProductivity.collaborationScore < 60) {
      areas.push('Team collaboration');
    }
    if (member.wellbeingMetrics.stress >= 7) {
      areas.push('Stress management');
    }
    if (member.currentWorkload >= 95) {
      areas.push('Workload management');
    }

    return areas;
  }

  private getWellbeingRecommendations(member: TeamMember): string[] {
    const recommendations: string[] = [];

    if (member.wellbeingMetrics.burnoutRisk === 'high' || member.wellbeingMetrics.burnoutRisk === 'critical') {
      recommendations.push('Take time off to recover');
      recommendations.push('Reduce current workload');
      recommendations.push('Seek support from manager or HR');
    }

    if (member.wellbeingMetrics.stress >= 7) {
      recommendations.push('Practice stress management techniques');
      recommendations.push('Consider flexible work arrangements');
    }

    if (member.wellbeingMetrics.energy <= 4) {
      recommendations.push('Focus on work-life balance');
      recommendations.push('Prioritize sleep and recovery');
    }

    return recommendations;
  }

  private suggestCollaborationOpportunities(member: TeamMember, allMembers: TeamMember[]): string[] {
    return allMembers
      .filter(m => m.id !== member.id)
      .filter(m => {
        // Find members with complementary skills or similar interests
        const commonSkills = member.skills.filter(skill => m.skills.includes(skill));
        const differentSkills = m.skills.filter(skill => !member.skills.includes(skill));
        return commonSkills.length > 0 || differentSkills.length > 0;
      })
      .slice(0, 3)
      .map(m => m.name);
  }

  public async saveTeamAnalytics(
    analytics: TeamAnalytics,
    recommendations: TeamRecommendation[]
  ): Promise<void> {
    // Save team insights
    for (const insight of analytics.insights) {
      await supabase
        .from('ai_insights')
        .insert({
          user_id: 'team_' + analytics.teamId,
          insight_type: 'team_collaboration',
          title: insight.title,
          content: insight.description,
          confidence: insight.confidence,
          metadata: {
            type: insight.type,
            priority: insight.priority,
            affectedMembers: insight.affectedMembers,
            affectedProjects: insight.affectedProjects,
            recommendations: insight.recommendations,
            teamAnalytics: analytics.performance
          }
        });
    }

    // Save team recommendations
    for (const recommendation of recommendations) {
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: 'team_' + analytics.teamId,
          title: recommendation.title,
          description: recommendation.description,
          implementation_steps: recommendation.actionPlan.map(step => step.step),
          expected_impact: recommendation.expectedOutcomes.join('; '),
          effort_level: 'medium', // Simplified
          priority: this.mapPriorityToNumber(recommendation.priority),
          metadata: {
            type: 'team_collaboration',
            recommendationType: recommendation.type,
            targetMembers: recommendation.targetMembers,
            targetProjects: recommendation.targetProjects,
            actionPlan: recommendation.actionPlan,
            successMetrics: recommendation.successMetrics,
            implementation: recommendation.implementation,
            confidence: recommendation.confidence,
            reasoning: recommendation.reasoning
          }
        });
    }
  }

  private mapPriorityToNumber(priority: string): number {
    switch (priority) {
      case 'urgent': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 3;
    }
  }
}

export const teamAIIntegration = TeamAIIntegration.getInstance();