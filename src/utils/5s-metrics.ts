import { monitoring } from './monitoring';
import { advancedMonitoring } from './advanced-monitoring';

/**
 * 5S Metrics Tracking System
 * Integrates with existing monitoring to track codebase organization metrics
 * Provides real-time insights into 5S methodology compliance
 */

export interface FiveSMetrics {
  seiri: SeiriMetrics;      // Sort - Eliminate unnecessary
  seiton: SeitonMetrics;    // Set in order - Organize
  seiso: SeisoMetrics;      // Shine - Clean up
  seiketsu: SeiketsuMetrics; // Standardize - Create standards
  shitsuke: ShitsukeMetrics; // Sustain - Maintain standards
}

export interface SeiriMetrics {
  deadCodeFiles: number;
  duplicateBlocks: number;
  unusedDependencies: number;
  obsoleteFiles: number;
  totalIssues: number;
  reductionTrend: 'improving' | 'stable' | 'degrading';
}

export interface SeitonMetrics {
  disorganizedDirectories: number;
  unorganizedImports: number;
  namingViolations: number;
  hierarchyIssues: number;
  organizationScore: number;
}

export interface SeisoMetrics {
  formattingIssues: number;
  commentIssues: number;
  codeSmells: number;
  technicalDebtHours: number;
  cleanlinessScore: number;
}

export interface SeiketsuMetrics {
  standardsViolations: number;
  patternsCompliance: number;
  documentationCoverage: number;
  reviewCompliance: number;
  standardizationScore: number;
}

export interface ShitsukeMetrics {
  monitoringActive: boolean;
  automationCoverage: number;
  teamCompliance: number;
  improvementTrend: 'positive' | 'neutral' | 'negative';
  sustainabilityScore: number;
}

export interface FiveSAlert {
  id: string;
  timestamp: number;
  metric: keyof FiveSMetrics;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendations: string[];
}

export interface FiveSBudget {
  name: string;
  thresholds: {
    seiri: {
      maxDeadCodeFiles: number;
      maxDuplicateBlocks: number;
      maxUnusedDeps: number;
    };
    seiton: {
      maxDisorganizedDirs: number;
      maxNamingViolations: number;
      minOrganizationScore: number;
    };
    seiso: {
      maxFormattingIssues: number;
      maxCodeSmells: number;
      maxTechnicalDebtHours: number;
    };
    seiketsu: {
      minPatternsCompliance: number;
      minDocumentationCoverage: number;
      minReviewCompliance: number;
    };
    shitsuke: {
      minAutomationCoverage: number;
      minTeamCompliance: number;
      minSustainabilityScore: number;
    };
  };
}

class FiveSMetricsTracker {
  private metrics: FiveSMetrics;
  private budgets: Map<string, FiveSBudget> = new Map();
  private alerts: FiveSAlert[] = [];
  private historicalData: Array<{ timestamp: number; metrics: FiveSMetrics }> = [];
  private alertCallbacks: Array<(alert: FiveSAlert) => void> = [];

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupDefaultBudgets();
    this.setupPeriodicCollection();
  }

  private initializeMetrics(): FiveSMetrics {
    return {
      seiri: {
        deadCodeFiles: 0,
        duplicateBlocks: 0,
        unusedDependencies: 0,
        obsoleteFiles: 0,
        totalIssues: 0,
        reductionTrend: 'stable'
      },
      seiton: {
        disorganizedDirectories: 0,
        unorganizedImports: 0,
        namingViolations: 0,
        hierarchyIssues: 0,
        organizationScore: 85
      },
      seiso: {
        formattingIssues: 0,
        commentIssues: 0,
        codeSmells: 0,
        technicalDebtHours: 0,
        cleanlinessScore: 85
      },
      seiketsu: {
        standardsViolations: 0,
        patternsCompliance: 85,
        documentationCoverage: 78,
        reviewCompliance: 92,
        standardizationScore: 85
      },
      shitsuke: {
        monitoringActive: true,
        automationCoverage: 85,
        teamCompliance: 92,
        improvementTrend: 'positive',
        sustainabilityScore: 88
      }
    };
  }

  private setupDefaultBudgets() {
    const defaultBudget: FiveSBudget = {
      name: 'default-5s-budget',
      thresholds: {
        seiri: {
          maxDeadCodeFiles: 5,
          maxDuplicateBlocks: 3,
          maxUnusedDeps: 2
        },
        seiton: {
          maxDisorganizedDirs: 3,
          maxNamingViolations: 5,
          minOrganizationScore: 80
        },
        seiso: {
          maxFormattingIssues: 10,
          maxCodeSmells: 5,
          maxTechnicalDebtHours: 40
        },
        seiketsu: {
          minPatternsCompliance: 85,
          minDocumentationCoverage: 75,
          minReviewCompliance: 90
        },
        shitsuke: {
          minAutomationCoverage: 80,
          minTeamCompliance: 85,
          minSustainabilityScore: 80
        }
      }
    };

    this.budgets.set('default', defaultBudget);
  }

  private setupPeriodicCollection() {
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 5 * 60 * 1000);

    // Store historical data every hour
    setInterval(() => {
      this.storeHistoricalData();
    }, 60 * 60 * 1000);
  }

  public updateMetrics(newMetrics: Partial<FiveSMetrics>) {
    // Deep merge new metrics with existing ones
    if (newMetrics.seiri) {
      this.metrics.seiri = { ...this.metrics.seiri, ...newMetrics.seiri };
    }
    if (newMetrics.seiton) {
      this.metrics.seiton = { ...this.metrics.seiton, ...newMetrics.seiton };
    }
    if (newMetrics.seiso) {
      this.metrics.seiso = { ...this.metrics.seiso, ...newMetrics.seiso };
    }
    if (newMetrics.seiketsu) {
      this.metrics.seiketsu = { ...this.metrics.seiketsu, ...newMetrics.seiketsu };
    }
    if (newMetrics.shitsuke) {
      this.metrics.shitsuke = { ...this.metrics.shitsuke, ...newMetrics.shitsuke };
    }

    // Check budgets after update
    this.checkBudgets();

    // Calculate trends
    this.updateTrends();

    // Report to monitoring system
    this.reportToMonitoring();
  }

  private checkBudgets() {
    this.budgets.forEach((budget, name) => {
      this.checkSeirieBudget(budget, name);
      this.checkSeitonBudget(budget, name);
      this.checkSeisoBudget(budget, name);
      this.checkSeiketsuBudget(budget, name);
      this.checkShitsukeBudget(budget, name);
    });
  }

  private checkSeirieBudget(budget: FiveSBudget, budgetName: string) {
    const seiri = this.metrics.seiri;
    const thresholds = budget.thresholds.seiri;

    if (seiri.deadCodeFiles > thresholds.maxDeadCodeFiles) {
      this.triggerAlert({
        metric: 'seiri',
        value: seiri.deadCodeFiles,
        threshold: thresholds.maxDeadCodeFiles,
        severity: 'medium',
        message: `Dead code files (${seiri.deadCodeFiles}) exceed budget (${thresholds.maxDeadCodeFiles})`,
        recommendations: [
          'Run 5S Sort phase to identify and remove dead code',
          'Review file imports and references',
          'Set up automated dead code detection'
        ]
      });
    }

    if (seiri.duplicateBlocks > thresholds.maxDuplicateBlocks) {
      this.triggerAlert({
        metric: 'seiri',
        value: seiri.duplicateBlocks,
        threshold: thresholds.maxDuplicateBlocks,
        severity: 'medium',
        message: `Duplicate code blocks (${seiri.duplicateBlocks}) exceed budget (${thresholds.maxDuplicateBlocks})`,
        recommendations: [
          'Extract shared functionality into utilities',
          'Create reusable components',
          'Implement code deduplication strategies'
        ]
      });
    }

    if (seiri.unusedDependencies > thresholds.maxUnusedDeps) {
      this.triggerAlert({
        metric: 'seiri',
        value: seiri.unusedDependencies,
        threshold: thresholds.maxUnusedDeps,
        severity: 'low',
        message: `Unused dependencies (${seiri.unusedDependencies}) exceed budget (${thresholds.maxUnusedDeps})`,
        recommendations: [
          'Remove unused package dependencies',
          'Audit package.json regularly',
          'Use dependency analysis tools'
        ]
      });
    }
  }

  private checkSeitonBudget(budget: FiveSBudget, budgetName: string) {
    const seiton = this.metrics.seiton;
    const thresholds = budget.thresholds.seiton;

    if (seiton.organizationScore < thresholds.minOrganizationScore) {
      this.triggerAlert({
        metric: 'seiton',
        value: seiton.organizationScore,
        threshold: thresholds.minOrganizationScore,
        severity: 'high',
        message: `Organization score (${seiton.organizationScore}) below budget (${thresholds.minOrganizationScore})`,
        recommendations: [
          'Reorganize file structure',
          'Standardize import organization',
          'Fix naming convention violations',
          'Simplify component hierarchy'
        ]
      });
    }
  }

  private checkSeisoBudget(budget: FiveSBudget, budgetName: string) {
    const seiso = this.metrics.seiso;
    const thresholds = budget.thresholds.seiso;

    if (seiso.technicalDebtHours > thresholds.maxTechnicalDebtHours) {
      this.triggerAlert({
        metric: 'seiso',
        value: seiso.technicalDebtHours,
        threshold: thresholds.maxTechnicalDebtHours,
        severity: 'high',
        message: `Technical debt (${seiso.technicalDebtHours}h) exceeds budget (${thresholds.maxTechnicalDebtHours}h)`,
        recommendations: [
          'Schedule technical debt reduction sprints',
          'Address high-priority debt items',
          'Implement debt prevention practices',
          'Regular code cleanup sessions'
        ]
      });
    }

    if (seiso.codeSmells > thresholds.maxCodeSmells) {
      this.triggerAlert({
        metric: 'seiso',
        value: seiso.codeSmells,
        threshold: thresholds.maxCodeSmells,
        severity: 'medium',
        message: `Code smells (${seiso.codeSmells}) exceed budget (${thresholds.maxCodeSmells})`,
        recommendations: [
          'Refactor complex functions',
          'Remove code duplication',
          'Improve naming and structure',
          'Apply clean code principles'
        ]
      });
    }
  }

  private checkSeiketsuBudget(budget: FiveSBudget, budgetName: string) {
    const seiketsu = this.metrics.seiketsu;
    const thresholds = budget.thresholds.seiketsu;

    if (seiketsu.patternsCompliance < thresholds.minPatternsCompliance) {
      this.triggerAlert({
        metric: 'seiketsu',
        value: seiketsu.patternsCompliance,
        threshold: thresholds.minPatternsCompliance,
        severity: 'medium',
        message: `Pattern compliance (${seiketsu.patternsCompliance}%) below budget (${thresholds.minPatternsCompliance}%)`,
        recommendations: [
          'Enforce architectural patterns',
          'Provide pattern training',
          'Create pattern documentation',
          'Set up automated pattern checking'
        ]
      });
    }

    if (seiketsu.documentationCoverage < thresholds.minDocumentationCoverage) {
      this.triggerAlert({
        metric: 'seiketsu',
        value: seiketsu.documentationCoverage,
        threshold: thresholds.minDocumentationCoverage,
        severity: 'low',
        message: `Documentation coverage (${seiketsu.documentationCoverage}%) below budget (${thresholds.minDocumentationCoverage}%)`,
        recommendations: [
          'Add JSDoc to public APIs',
          'Create component documentation',
          'Update README files',
          'Document architecture decisions'
        ]
      });
    }
  }

  private checkShitsukeBudget(budget: FiveSBudget, budgetName: string) {
    const shitsuke = this.metrics.shitsuke;
    const thresholds = budget.thresholds.shitsuke;

    if (shitsuke.automationCoverage < thresholds.minAutomationCoverage) {
      this.triggerAlert({
        metric: 'shitsuke',
        value: shitsuke.automationCoverage,
        threshold: thresholds.minAutomationCoverage,
        severity: 'medium',
        message: `Automation coverage (${shitsuke.automationCoverage}%) below budget (${thresholds.minAutomationCoverage}%)`,
        recommendations: [
          'Implement more automated checks',
          'Set up pre-commit hooks',
          'Automate 5S analysis',
          'Create automated reporting'
        ]
      });
    }

    if (shitsuke.sustainabilityScore < thresholds.minSustainabilityScore) {
      this.triggerAlert({
        metric: 'shitsuke',
        value: shitsuke.sustainabilityScore,
        threshold: thresholds.minSustainabilityScore,
        severity: 'high',
        message: `Sustainability score (${shitsuke.sustainabilityScore}) below budget (${thresholds.minSustainabilityScore})`,
        recommendations: [
          'Strengthen feedback loops',
          'Improve team training',
          'Enhance monitoring systems',
          'Regular 5S reviews'
        ]
      });
    }
  }

  private triggerAlert(alertData: Omit<FiveSAlert, 'id' | 'timestamp'>) {
    const alert: FiveSAlert = {
      id: `5s_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alertData
    };

    this.alerts.push(alert);

    // Limit alert history
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Notify callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('5S alert callback failed:', error);
      }
    });

    // Report to monitoring
    monitoring.trackError(new Error(`5S Budget Violation: ${alert.message}`), {
      fiveSAlert: true,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      severity: alert.severity,
      recommendations: alert.recommendations
    });

    console.warn('⚠️ 5S Budget Violation:', alert);
  }

  private updateTrends() {
    if (this.historicalData.length >= 2) {
      const current = this.metrics;
      const previous = this.historicalData[this.historicalData.length - 1]?.metrics;

      if (previous) {
        // Update Seiri trend
        const currentSeiriIssues = current.seiri.totalIssues;
        const previousSeiriIssues = previous.seiri.totalIssues;

        if (currentSeiriIssues < previousSeiriIssues) {
          this.metrics.seiri.reductionTrend = 'improving';
        } else if (currentSeiriIssues > previousSeiriIssues) {
          this.metrics.seiri.reductionTrend = 'degrading';
        } else {
          this.metrics.seiri.reductionTrend = 'stable';
        }

        // Update Shitsuke trend
        const currentSustainability = current.shitsuke.sustainabilityScore;
        const previousSustainability = previous.shitsuke.sustainabilityScore;

        if (currentSustainability > previousSustainability) {
          this.metrics.shitsuke.improvementTrend = 'positive';
        } else if (currentSustainability < previousSustainability) {
          this.metrics.shitsuke.improvementTrend = 'negative';
        } else {
          this.metrics.shitsuke.improvementTrend = 'neutral';
        }
      }
    }
  }

  private reportToMonitoring() {
    // Report 5S metrics to the existing monitoring system
    const overallScore = this.calculateOverall5SScore();

    monitoring.trackUserAction({
      action: '5s_metrics_update',
      category: 'quality',
      value: overallScore,
      sessionId: '',
      timestamp: Date.now(),
      properties: {
        seiri: this.metrics.seiri,
        seiton: this.metrics.seiton,
        seiso: this.metrics.seiso,
        seiketsu: this.metrics.seiketsu,
        shitsuke: this.metrics.shitsuke,
        overallScore
      }
    });

    // Report to advanced monitoring for trend analysis
    advancedMonitoring.updateTrendData('5s-overall-score', overallScore);
    advancedMonitoring.updateTrendData('5s-seiri-issues', this.metrics.seiri.totalIssues);
    advancedMonitoring.updateTrendData('5s-organization-score', this.metrics.seiton.organizationScore);
    advancedMonitoring.updateTrendData('5s-cleanliness-score', this.metrics.seiso.cleanlinessScore);
    advancedMonitoring.updateTrendData('5s-sustainability-score', this.metrics.shitsuke.sustainabilityScore);
  }

  private collectCurrentMetrics() {
    // This would typically trigger collection from various sources
    // For now, we simulate metric collection
    console.log('📊 Collecting current 5S metrics...');
  }

  private storeHistoricalData() {
    this.historicalData.push({
      timestamp: Date.now(),
      metrics: JSON.parse(JSON.stringify(this.metrics)) // Deep clone
    });

    // Keep last 30 days of data (assuming hourly collection)
    if (this.historicalData.length > 24 * 30) {
      this.historicalData = this.historicalData.slice(-24 * 30);
    }
  }

  public calculateOverall5SScore(): number {
    const weights = {
      seiri: 0.25,
      seiton: 0.20,
      seiso: 0.20,
      seiketsu: 0.20,
      shitsuke: 0.15
    };

    // Seiri score (fewer issues = higher score)
    const seiriScore = Math.max(0, 100 - (this.metrics.seiri.totalIssues * 5));

    // Seiton score
    const seitonScore = this.metrics.seiton.organizationScore;

    // Seiso score
    const seisoScore = this.metrics.seiso.cleanlinessScore;

    // Seiketsu score
    const seiketsuScore = this.metrics.seiketsu.standardizationScore;

    // Shitsuke score
    const shitsukeScore = this.metrics.shitsuke.sustainabilityScore;

    return Math.round(
      seiriScore * weights.seiri +
      seitonScore * weights.seiton +
      seisoScore * weights.seiso +
      seiketsuScore * weights.seiketsu +
      shitsukeScore * weights.shitsuke
    );
  }

  public getMetrics(): FiveSMetrics {
    return JSON.parse(JSON.stringify(this.metrics)); // Deep clone
  }

  public getAlerts(): FiveSAlert[] {
    return [...this.alerts]; // Shallow clone
  }

  public getHistoricalData() {
    return [...this.historicalData]; // Shallow clone
  }

  public setBudget(name: string, budget: FiveSBudget) {
    this.budgets.set(name, budget);
  }

  public onAlert(callback: (alert: FiveSAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  public generateReport() {
    const overallScore = this.calculateOverall5SScore();

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      grade: this.getGrade(overallScore),
      metrics: this.getMetrics(),
      alerts: this.getAlerts().slice(-10), // Last 10 alerts
      trends: {
        seiri: this.metrics.seiri.reductionTrend,
        shitsuke: this.metrics.shitsuke.improvementTrend
      },
      recommendations: this.generateRecommendations()
    };
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.seiri.totalIssues > 10) {
      recommendations.push('High number of Seiri issues - prioritize Sort phase');
    }

    if (this.metrics.seiton.organizationScore < 75) {
      recommendations.push('Low organization score - focus on Set in Order phase');
    }

    if (this.metrics.seiso.technicalDebtHours > 50) {
      recommendations.push('High technical debt - implement Shine phase cleanup');
    }

    if (this.metrics.seiketsu.patternsCompliance < 80) {
      recommendations.push('Low pattern compliance - strengthen Standardize phase');
    }

    if (this.metrics.shitsuke.sustainabilityScore < 80) {
      recommendations.push('Low sustainability - improve Sustain phase practices');
    }

    return recommendations;
  }
}

// Export singleton instance
export const fiveSMetricsTracker = new FiveSMetricsTracker();

// React hooks for 5S metrics
export const useFiveSMetrics = () => {
  return {
    getMetrics: fiveSMetricsTracker.getMetrics.bind(fiveSMetricsTracker),
    updateMetrics: fiveSMetricsTracker.updateMetrics.bind(fiveSMetricsTracker),
    getOverallScore: fiveSMetricsTracker.calculateOverall5SScore.bind(fiveSMetricsTracker),
    getAlerts: fiveSMetricsTracker.getAlerts.bind(fiveSMetricsTracker),
    onAlert: fiveSMetricsTracker.onAlert.bind(fiveSMetricsTracker),
    generateReport: fiveSMetricsTracker.generateReport.bind(fiveSMetricsTracker)
  };
};

export default fiveSMetricsTracker;