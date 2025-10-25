/**
 * Pareto Analysis Agent (80-20 Rule Implementation)
 *
 * Implements the Pareto Principle to identify the 20% of issues that cause 80% of problems
 * Provides actionable insights for maximum impact with minimum effort
 */

export interface IssueMetrics {
  id: string;
  description: string;
  category: string;
  frequency: number;
  impact: number;
  userAffected: number;
  resolutionTime: number; // in hours
  costOfDowntime: number; // in dollars
  preventionCost: number; // estimated cost to prevent
  detectionDifficulty: number; // 1-10 scale
  automationPotential: number; // 1-10 scale
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  firstOccurrence: string;
  lastOccurrence: string;
  trends: 'increasing' | 'decreasing' | 'stable';
}

export interface ParetoAnalysisResult {
  timestamp: string;
  totalIssues: number;
  top20PercentIssues: IssueMetrics[];
  cumulativeImpact: number[];
  impactPercentages: number[];
  priorityMatrix: PriorityMatrix[];
  recommendations: ActionableRecommendation[];
  quickWins: QuickWin[];
  preventionStrategies: PreventionStrategy[];
  monitoringAlerts: MonitoringAlert[];
  costBenefitAnalysis: CostBenefitAnalysis;
}

export interface PriorityMatrix {
  issue: IssueMetrics;
  impactScore: number;
  effortScore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  quadrant: 'quick-win' | 'major-project' | 'fill-in' | 'thankless-task';
  roi: number; // Return on Investment
}

export interface ActionableRecommendation {
  issueId: string;
  priority: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  action: string;
  expectedImpact: number; // percentage reduction in issues
  estimatedEffort: number; // person-hours
  costEstimate: number; // dollars
  timeline: string;
  dependencies: string[];
  successMetrics: string[];
  riskFactors: string[];
}

export interface QuickWin {
  issueId: string;
  description: string;
  implementationTime: number; // hours
  expectedImpact: number; // percentage
  requiredResources: string[];
  immediateActions: string[];
}

export interface PreventionStrategy {
  category: string;
  strategy: string;
  coveragePercentage: number; // how much of issues this prevents
  implementationCost: number;
  maintenanceCost: number;
  paybackPeriod: number; // months
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
}

export interface MonitoringAlert {
  metric: string;
  threshold: number;
  alertLevel: 'info' | 'warning' | 'critical';
  responseTime: number; // minutes
  escalationPath: string[];
  automatedResponse: string[];
}

export interface CostBenefitAnalysis {
  currentCostOfIssues: number; // monthly
  proposedInvestment: number;
  projectedSavings: number; // monthly
  breakEvenPeriod: number; // months
  roi12Months: number; // percentage
  riskAdjustedROI: number; // percentage
}

/**
 * Pareto Analysis Agent for 80-20 Rule Implementation
 */
export class ParetoAnalysisAgent {
  private issues: IssueMetrics[] = [];
  private analysisHistory: ParetoAnalysisResult[] = [];

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize with sample issue data based on common development problems
   */
  private initializeSampleData(): void {
    this.issues = [
      {
        id: 'ISSUE_001',
        description: 'React Hook dependency missing in useEffect',
        category: 'Hook Dependencies',
        frequency: 145,
        impact: 8,
        userAffected: 1200,
        resolutionTime: 2,
        costOfDowntime: 5000,
        preventionCost: 500,
        detectionDifficulty: 3,
        automationPotential: 9,
        riskLevel: 'high',
        firstOccurrence: '2024-01-15',
        lastOccurrence: '2024-10-24',
        trends: 'increasing'
      },
      {
        id: 'ISSUE_002',
        description: 'Context Provider missing in component tree',
        category: 'Context Configuration',
        frequency: 98,
        impact: 9,
        userAffected: 2500,
        resolutionTime: 4,
        costOfDowntime: 12000,
        preventionCost: 800,
        detectionDifficulty: 4,
        automationPotential: 8,
        riskLevel: 'critical',
        firstOccurrence: '2024-02-01',
        lastOccurrence: '2024-10-20',
        trends: 'stable'
      },
      {
        id: 'ISSUE_003',
        description: 'API timeout causing component failures',
        category: 'Network Errors',
        frequency: 89,
        impact: 7,
        userAffected: 1800,
        resolutionTime: 3,
        costOfDowntime: 8000,
        preventionCost: 1200,
        detectionDifficulty: 5,
        automationPotential: 7,
        riskLevel: 'high',
        firstOccurrence: '2024-01-20',
        lastOccurrence: '2024-10-22',
        trends: 'decreasing'
      },
      {
        id: 'ISSUE_004',
        description: 'TypeScript type mismatch in API responses',
        category: 'Type Safety',
        frequency: 76,
        impact: 6,
        userAffected: 800,
        resolutionTime: 1.5,
        costOfDowntime: 2000,
        preventionCost: 600,
        detectionDifficulty: 2,
        automationPotential: 10,
        riskLevel: 'medium',
        firstOccurrence: '2024-03-01',
        lastOccurrence: '2024-10-18',
        trends: 'stable'
      },
      {
        id: 'ISSUE_005',
        description: 'Component render infinite loop',
        category: 'Render Performance',
        frequency: 67,
        impact: 9,
        userAffected: 1500,
        resolutionTime: 6,
        costOfDowntime: 15000,
        preventionCost: 1000,
        detectionDifficulty: 7,
        automationPotential: 6,
        riskLevel: 'critical',
        firstOccurrence: '2024-02-15',
        lastOccurrence: '2024-10-19',
        trends: 'increasing'
      },
      {
        id: 'ISSUE_006',
        description: 'Memory leak in component cleanup',
        category: 'Memory Management',
        frequency: 45,
        impact: 7,
        userAffected: 1000,
        resolutionTime: 4,
        costOfDowntime: 6000,
        preventionCost: 800,
        detectionDifficulty: 8,
        automationPotential: 5,
        riskLevel: 'medium',
        firstOccurrence: '2024-04-01',
        lastOccurrence: '2024-10-15',
        trends: 'stable'
      },
      {
        id: 'ISSUE_007',
        description: 'Route navigation failures',
        category: 'Routing',
        frequency: 34,
        impact: 5,
        userAffected: 600,
        resolutionTime: 2,
        costOfDowntime: 1500,
        preventionCost: 400,
        detectionDifficulty: 3,
        automationPotential: 8,
        riskLevel: 'low',
        firstOccurrence: '2024-05-01',
        lastOccurrence: '2024-10-10',
        trends: 'decreasing'
      },
      {
        id: 'ISSUE_008',
        description: 'CSS styling conflicts',
        category: 'Styling',
        frequency: 28,
        impact: 3,
        userAffected: 400,
        resolutionTime: 1,
        costOfDowntime: 500,
        preventionCost: 200,
        detectionDifficulty: 2,
        automationPotential: 9,
        riskLevel: 'low',
        firstOccurrence: '2024-06-01',
        lastOccurrence: '2024-10-05',
        trends: 'stable'
      },
      {
        id: 'ISSUE_009',
        description: 'Form validation edge cases',
        category: 'Form Handling',
        frequency: 23,
        impact: 4,
        userAffected: 300,
        resolutionTime: 2,
        costOfDowntime: 800,
        preventionCost: 300,
        detectionDifficulty: 4,
        automationPotential: 7,
        riskLevel: 'low',
        firstOccurrence: '2024-07-01',
        lastOccurrence: '2024-09-30',
        trends: 'stable'
      },
      {
        id: 'ISSUE_010',
        description: 'Image loading optimization',
        category: 'Performance',
        frequency: 19,
        impact: 2,
        userAffected: 200,
        resolutionTime: 3,
        costOfDowntime: 300,
        preventionCost: 500,
        detectionDifficulty: 3,
        automationPotential: 8,
        riskLevel: 'low',
        firstOccurrence: '2024-08-01',
        lastOccurrence: '2024-09-25',
        trends: 'decreasing'
      }
    ];
  }

  /**
   * Perform comprehensive Pareto analysis
   */
  public performParetoAnalysis(): ParetoAnalysisResult {
    // Calculate total impact score for each issue
    const issuesWithTotalImpact = this.issues.map(issue => ({
      ...issue,
      totalImpact: this.calculateTotalImpact(issue)
    }));

    // Sort by total impact (descending)
    issuesWithTotalImpact.sort((a, b) => b.totalImpact - a.totalImpact);

    // Calculate cumulative impact
    const totalImpactSum = issuesWithTotalImpact.reduce((sum, issue) => sum + issue.totalImpact, 0);
    let cumulativeSum = 0;
    const cumulativeImpact: number[] = [];
    const impactPercentages: number[] = [];

    issuesWithTotalImpact.forEach(issue => {
      cumulativeSum += issue.totalImpact;
      cumulativeImpact.push(cumulativeSum);
      impactPercentages.push((issue.totalImpact / totalImpactSum) * 100);
    });

    // Identify top 20% of issues
    const top20Count = Math.ceil(this.issues.length * 0.2);
    const top20PercentIssues = issuesWithTotalImpact.slice(0, top20Count);

    // Create priority matrix
    const priorityMatrix = this.createPriorityMatrix(issuesWithTotalImpact);

    // Generate recommendations
    const recommendations = this.generateRecommendations(top20PercentIssues);

    // Identify quick wins
    const quickWins = this.identifyQuickWins(priorityMatrix);

    // Generate prevention strategies
    const preventionStrategies = this.generatePreventionStrategies(top20PercentIssues);

    // Create monitoring alerts
    const monitoringAlerts = this.createMonitoringAlerts(top20PercentIssues);

    // Perform cost-benefit analysis
    const costBenefitAnalysis = this.performCostBenefitAnalysis(top20PercentIssues);

    const result: ParetoAnalysisResult = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      top20PercentIssues,
      cumulativeImpact,
      impactPercentages,
      priorityMatrix,
      recommendations,
      quickWins,
      preventionStrategies,
      monitoringAlerts,
      costBenefitAnalysis
    };

    this.analysisHistory.push(result);
    return result;
  }

  /**
   * Calculate total impact score for an issue
   */
  private calculateTotalImpact(issue: IssueMetrics): number {
    // Weighted formula considering multiple factors
    const frequencyWeight = 0.3;
    const impactWeight = 0.25;
    const usersWeight = 0.2;
    const costWeight = 0.15;
    const riskWeight = 0.1;

    const normalizedFrequency = Math.min(issue.frequency / 100, 1);
    const normalizedImpact = issue.impact / 10;
    const normalizedUsers = Math.min(issue.userAffected / 3000, 1);
    const normalizedCost = Math.min(issue.costOfDowntime / 20000, 1);
    const normalizedRisk = this.getRiskValue(issue.riskLevel) / 4;

    return (
      normalizedFrequency * frequencyWeight +
      normalizedImpact * impactWeight +
      normalizedUsers * usersWeight +
      normalizedCost * costWeight +
      normalizedRisk * riskWeight
    ) * 100;
  }

  /**
   * Create priority matrix based on impact vs effort
   */
  private createPriorityMatrix(issues: (IssueMetrics & { totalImpact: number })[]): PriorityMatrix[] {
    return issues.map(issue => {
      const impactScore = issue.totalImpact;
      const effortScore = this.calculateEffortScore(issue);
      const roi = this.calculateROI(issue);

      let priority: PriorityMatrix['priority'];
      let quadrant: PriorityMatrix['quadrant'];

      if (impactScore > 70 && effortScore < 30) {
        priority = 'critical';
        quadrant = 'quick-win';
      } else if (impactScore > 70 && effortScore >= 30) {
        priority = 'high';
        quadrant = 'major-project';
      } else if (impactScore <= 70 && effortScore < 30) {
        priority = 'medium';
        quadrant = 'fill-in';
      } else {
        priority = 'low';
        quadrant = 'thankless-task';
      }

      return {
        issue,
        impactScore,
        effortScore,
        priority,
        quadrant,
        roi
      };
    });
  }

  /**
   * Calculate effort score for an issue
   */
  private calculateEffortScore(issue: IssueMetrics): number {
    // Higher resolution time and detection difficulty = higher effort
    const timeWeight = 0.4;
    const difficultyWeight = 0.3;
    const automationWeight = 0.3;

    const normalizedTime = Math.min(issue.resolutionTime / 10, 1);
    const normalizedDifficulty = issue.detectionDifficulty / 10;
    const normalizedAutomation = (10 - issue.automationPotential) / 10; // Lower automation = higher effort

    return (
      normalizedTime * timeWeight +
      normalizedDifficulty * difficultyWeight +
      normalizedAutomation * automationWeight
    ) * 100;
  }

  /**
   * Calculate ROI for an issue
   */
  private calculateROI(issue: IssueMetrics): number {
    const monthlyDowntimeCost = (issue.costOfDowntime * issue.frequency) / 12;
    const preventionCost = issue.preventionCost;

    if (preventionCost === 0) return 1000; // Infinite ROI
    return (monthlyDowntimeCost * 12) / preventionCost;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(top20Issues: IssueMetrics[]): ActionableRecommendation[] {
    return top20Issues.map(issue => {
      const priority = this.getRecommendationPriority(issue);
      const action = this.getRecommendedAction(issue);
      const expectedImpact = this.calculateExpectedImpact(issue);

      return {
        issueId: issue.id,
        priority,
        action,
        expectedImpact,
        estimatedEffort: issue.resolutionTime * 8, // Convert to person-hours
        costEstimate: issue.preventionCost,
        timeline: this.getRecommendedTimeline(priority),
        dependencies: this.getActionDependencies(issue),
        successMetrics: this.getSuccessMetrics(issue),
        riskFactors: this.getRiskFactors(issue)
      };
    });
  }

  /**
   * Identify quick wins (high impact, low effort)
   */
  private identifyQuickWins(priorityMatrix: PriorityMatrix[]): QuickWin[] {
    return priorityMatrix
      .filter(item => item.quadrant === 'quick-win')
      .slice(0, 5) // Top 5 quick wins
      .map(item => ({
        issueId: item.issue.id,
        description: item.issue.description,
        implementationTime: item.issue.resolutionTime,
        expectedImpact: item.impactScore,
        requiredResources: this.getRequiredResources(item.issue),
        immediateActions: this.getImmediateActions(item.issue)
      }));
  }

  /**
   * Generate prevention strategies
   */
  private generatePreventionStrategies(top20Issues: IssueMetrics[]): PreventionStrategy[] {
    const categoryStrategies = new Map<string, PreventionStrategy>();

    top20Issues.forEach(issue => {
      if (!categoryStrategies.has(issue.category)) {
        categoryStrategies.set(issue.category, {
          category: issue.category,
          strategy: this.getCategoryStrategy(issue.category),
          coveragePercentage: 0,
          implementationCost: 0,
          maintenanceCost: 0,
          paybackPeriod: 0,
          automationLevel: this.getAutomationLevel(issue.category)
        });
      }

      const strategy = categoryStrategies.get(issue.category)!;
      strategy.coveragePercentage += (issue.frequency / top20Issues.reduce((sum, i) => sum + i.frequency, 0)) * 100;
      strategy.implementationCost += issue.preventionCost;
      strategy.maintenanceCost += issue.preventionCost * 0.2; // 20% annual maintenance
    });

    return Array.from(categoryStrategies.values()).map(strategy => ({
      ...strategy,
      paybackPeriod: this.calculatePaybackPeriod(strategy)
    }));
  }

  /**
   * Create monitoring alerts
   */
  private createMonitoringAlerts(top20Issues: IssueMetrics[]): MonitoringAlert[] {
    return top20Issues.map(issue => ({
      metric: `${issue.category} Error Rate`,
      threshold: issue.frequency * 1.2, // 20% above current frequency
      alertLevel: this.getAlertLevel(issue.riskLevel),
      responseTime: this.getResponseTime(issue.riskLevel),
      escalationPath: this.getEscalationPath(issue.riskLevel),
      automatedResponse: this.getAutomatedResponse(issue)
    }));
  }

  /**
   * Perform cost-benefit analysis
   */
  private performCostBenefitAnalysis(top20Issues: IssueMetrics[]): CostBenefitAnalysis {
    const currentMonthlyCost = top20Issues.reduce((sum, issue) =>
      sum + (issue.costOfDowntime * issue.frequency) / 12, 0
    );

    const totalInvestment = top20Issues.reduce((sum, issue) =>
      sum + issue.preventionCost, 0
    );

    const projectedMonthlySavings = currentMonthlyCost * 0.8; // 80% reduction expected
    const breakEvenPeriod = totalInvestment / projectedMonthlySavings;
    const roi12Months = ((projectedMonthlySavings * 12 - totalInvestment) / totalInvestment) * 100;
    const riskAdjustedROI = roi12Months * 0.7; // Apply 30% risk adjustment

    return {
      currentCostOfIssues: currentMonthlyCost,
      proposedInvestment: totalInvestment,
      projectedSavings: projectedMonthlySavings,
      breakEvenPeriod,
      roi12Months,
      riskAdjustedROI
    };
  }

  // Helper methods
  private getRiskValue(riskLevel: string): number {
    const riskMap = { low: 1, medium: 2, high: 3, critical: 4 };
    return riskMap[riskLevel as keyof typeof riskMap] || 1;
  }

  private getRecommendationPriority(issue: IssueMetrics): ActionableRecommendation['priority'] {
    if (issue.riskLevel === 'critical') return 'immediate';
    if (issue.riskLevel === 'high') return 'short-term';
    if (issue.riskLevel === 'medium') return 'medium-term';
    return 'long-term';
  }

  private getRecommendedAction(issue: IssueMetrics): string {
    const actionMap: Record<string, string> = {
      'Hook Dependencies': 'Implement automated hook dependency validation and ESLint rules',
      'Context Configuration': 'Create context provider validation utilities and debugging tools',
      'Network Errors': 'Implement retry mechanisms, circuit breakers, and timeout handling',
      'Type Safety': 'Add runtime type validation and automated API schema checking',
      'Render Performance': 'Implement performance monitoring and render optimization',
      'Memory Management': 'Add memory leak detection and cleanup validation',
      'Routing': 'Implement route validation and navigation error handling',
      'Styling': 'Add CSS conflict detection and style isolation',
      'Form Handling': 'Implement comprehensive form validation framework',
      'Performance': 'Add performance monitoring and optimization automation'
    };

    return actionMap[issue.category] || 'Investigate and implement appropriate solution';
  }

  private calculateExpectedImpact(issue: IssueMetrics): number {
    // Expected reduction in issue frequency
    const automationFactor = issue.automationPotential / 10;
    const baslineReduction = 50; // 50% baseline reduction
    return Math.min(baslineReduction + (automationFactor * 30), 90);
  }

  private getRecommendedTimeline(priority: ActionableRecommendation['priority']): string {
    const timelineMap = {
      immediate: '1-2 weeks',
      'short-term': '1-2 months',
      'medium-term': '3-6 months',
      'long-term': '6-12 months'
    };
    return timelineMap[priority];
  }

  private getActionDependencies(issue: IssueMetrics): string[] {
    return [
      'Development team availability',
      'Code review and testing',
      'Deployment pipeline access',
      'Monitoring infrastructure'
    ];
  }

  private getSuccessMetrics(issue: IssueMetrics): string[] {
    return [
      `Reduce ${issue.category} errors by 70%`,
      'Decrease resolution time by 50%',
      'Improve user satisfaction scores',
      'Reduce operational overhead'
    ];
  }

  private getRiskFactors(issue: IssueMetrics): string[] {
    return [
      'Implementation complexity',
      'Team learning curve',
      'Potential new edge cases',
      'Integration challenges'
    ];
  }

  private getRequiredResources(issue: IssueMetrics): string[] {
    return [
      'Senior developer (lead)',
      'QA engineer (testing)',
      'DevOps engineer (deployment)',
      'Documentation update'
    ];
  }

  private getImmediateActions(issue: IssueMetrics): string[] {
    const actionMap: Record<string, string[]> = {
      'Hook Dependencies': [
        'Run ESLint exhaustive-deps on all components',
        'Review useEffect dependencies in critical components',
        'Add hook dependency validation utility'
      ],
      'Context Configuration': [
        'Audit all context providers in app tree',
        'Add context validation checks',
        'Create provider debugging tools'
      ]
    };

    return actionMap[issue.category] || [
      'Investigate immediate causes',
      'Implement temporary workarounds',
      'Plan permanent solution'
    ];
  }

  private getCategoryStrategy(category: string): string {
    const strategyMap: Record<string, string> = {
      'Hook Dependencies': 'Automated dependency validation and developer education',
      'Context Configuration': 'Provider validation utilities and architectural guidelines',
      'Network Errors': 'Resilient network layer with retry and fallback mechanisms',
      'Type Safety': 'Comprehensive type checking and runtime validation',
      'Render Performance': 'Performance monitoring and optimization automation'
    };

    return strategyMap[category] || 'Category-specific prevention framework';
  }

  private getAutomationLevel(category: string): PreventionStrategy['automationLevel'] {
    const automationMap: Record<string, PreventionStrategy['automationLevel']> = {
      'Hook Dependencies': 'fully-automated',
      'Type Safety': 'fully-automated',
      'Context Configuration': 'semi-automated',
      'Network Errors': 'semi-automated',
      'Render Performance': 'manual'
    };

    return automationMap[category] || 'manual';
  }

  private calculatePaybackPeriod(strategy: PreventionStrategy): number {
    // Simple payback calculation in months
    const monthlySavings = strategy.implementationCost * 0.1; // 10% monthly savings
    return strategy.implementationCost / monthlySavings;
  }

  private getAlertLevel(riskLevel: string): MonitoringAlert['alertLevel'] {
    const alertMap: Record<string, MonitoringAlert['alertLevel']> = {
      critical: 'critical',
      high: 'critical',
      medium: 'warning',
      low: 'info'
    };
    return alertMap[riskLevel] || 'info';
  }

  private getResponseTime(riskLevel: string): number {
    const responseMap: Record<string, number> = {
      critical: 5,
      high: 15,
      medium: 60,
      low: 240
    };
    return responseMap[riskLevel] || 240;
  }

  private getEscalationPath(riskLevel: string): string[] {
    if (riskLevel === 'critical') return ['On-call Engineer', 'Tech Lead', 'Engineering Manager'];
    if (riskLevel === 'high') return ['Tech Lead', 'Engineering Manager'];
    return ['Development Team'];
  }

  private getAutomatedResponse(issue: IssueMetrics): string[] {
    return [
      'Log error details to monitoring system',
      'Create incident ticket',
      'Notify relevant team members',
      'Execute automated diagnostic checks'
    ];
  }

  /**
   * Get Pareto analysis summary
   */
  public getParetoSummary(): {
    top20PercentImpact: number;
    quickWinsAvailable: number;
    totalInvestmentNeeded: number;
    projectedROI: number;
  } {
    const latestAnalysis = this.analysisHistory[this.analysisHistory.length - 1];
    if (!latestAnalysis) {
      return {
        top20PercentImpact: 0,
        quickWinsAvailable: 0,
        totalInvestmentNeeded: 0,
        projectedROI: 0
      };
    }

    const totalImpact = latestAnalysis.top20PercentIssues.reduce((sum, issue) =>
      sum + this.calculateTotalImpact(issue), 0
    );

    return {
      top20PercentImpact: Math.round(totalImpact),
      quickWinsAvailable: latestAnalysis.quickWins.length,
      totalInvestmentNeeded: latestAnalysis.costBenefitAnalysis.proposedInvestment,
      projectedROI: Math.round(latestAnalysis.costBenefitAnalysis.roi12Months)
    };
  }

  /**
   * Export analysis results
   */
  public exportAnalysis(format: 'json' | 'csv' | 'markdown'): string {
    const analysis = this.analysisHistory[this.analysisHistory.length - 1];

    switch (format) {
      case 'json':
        return JSON.stringify(analysis, null, 2);
      case 'csv':
        return this.generateCSVReport(analysis);
      case 'markdown':
        return this.generateMarkdownReport(analysis);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateCSVReport(analysis: ParetoAnalysisResult): string {
    const headers = 'Issue ID,Category,Frequency,Impact,Users Affected,Cost of Downtime,Priority,ROI';
    const rows = analysis.priorityMatrix.map(item =>
      `${item.issue.id},${item.issue.category},${item.issue.frequency},${item.issue.impact},${item.issue.userAffected},${item.issue.costOfDowntime},${item.priority},${item.roi.toFixed(2)}`
    );

    return [headers, ...rows].join('\n');
  }

  private generateMarkdownReport(analysis: ParetoAnalysisResult): string {
    return `# Pareto Analysis Report (80-20 Rule)

## Executive Summary
- **Total Issues Analyzed:** ${analysis.totalIssues}
- **Top 20% Issues:** ${analysis.top20PercentIssues.length}
- **Quick Wins Available:** ${analysis.quickWins.length}
- **Total Investment Needed:** $${analysis.costBenefitAnalysis.proposedInvestment.toLocaleString()}
- **Projected 12-Month ROI:** ${analysis.costBenefitAnalysis.roi12Months.toFixed(1)}%

## Top 20% Issues (80% of Impact)

${analysis.top20PercentIssues.map((issue, index) => `
### ${index + 1}. ${issue.description}
- **Category:** ${issue.category}
- **Frequency:** ${issue.frequency} occurrences
- **Users Affected:** ${issue.userAffected.toLocaleString()}
- **Cost of Downtime:** $${issue.costOfDowntime.toLocaleString()}
- **Risk Level:** ${issue.riskLevel.toUpperCase()}
- **Trend:** ${issue.trends}
`).join('')}

## Quick Wins (High Impact, Low Effort)

${analysis.quickWins.map((win, index) => `
### ${index + 1}. ${win.description}
- **Implementation Time:** ${win.implementationTime} hours
- **Expected Impact:** ${win.expectedImpact.toFixed(1)}% improvement
- **Immediate Actions:**
${win.immediateActions.map(action => `  - ${action}`).join('\n')}
`).join('')}

## Cost-Benefit Analysis

- **Current Monthly Cost of Issues:** $${analysis.costBenefitAnalysis.currentCostOfIssues.toLocaleString()}
- **Proposed Investment:** $${analysis.costBenefitAnalysis.proposedInvestment.toLocaleString()}
- **Projected Monthly Savings:** $${analysis.costBenefitAnalysis.projectedSavings.toLocaleString()}
- **Break-Even Period:** ${analysis.costBenefitAnalysis.breakEvenPeriod.toFixed(1)} months
- **Risk-Adjusted ROI:** ${analysis.costBenefitAnalysis.riskAdjustedROI.toFixed(1)}%

## Recommended Action Plan

${analysis.recommendations.slice(0, 5).map((rec, index) => `
### ${index + 1}. ${rec.action}
- **Priority:** ${rec.priority.toUpperCase()}
- **Expected Impact:** ${rec.expectedImpact}% reduction
- **Timeline:** ${rec.timeline}
- **Cost Estimate:** $${rec.costEstimate.toLocaleString()}
`).join('')}
`;
  }
}

// Export singleton instance
export const paretoAnalysisAgent = new ParetoAnalysisAgent();