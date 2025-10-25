/**
 * FMEA Dashboard Component
 *
 * Comprehensive dashboard for Failure Mode and Effects Analysis
 * Integrates all FMEA agents and provides actionable insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Shield,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity,
  FileText,
  Download
} from 'lucide-react';

import { fmeaAnalysisAgent, type FMEAAnalysisResult } from '@/agents/fmea/fmea-analysis-agent';
import { intelligentErrorAnalyzer, type IntelligentErrorAnalysis } from '@/agents/fmea/intelligent-error-analyzer';
import { paretoAnalysisAgent, type ParetoAnalysisResult } from '@/agents/fmea/pareto-analysis-agent';

interface DashboardMetrics {
  totalFailureModes: number;
  criticalIssues: number;
  quickWins: number;
  projectedROI: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  preventionCoverage: number;
}

/**
 * FMEA Dashboard for Error Prevention and Analysis
 */
export default function FMEADashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFailureModes: 0,
    criticalIssues: 0,
    quickWins: 0,
    projectedROI: 0,
    riskLevel: 'low',
    preventionCoverage: 0
  });

  const [fmeaResults, setFmeaResults] = useState<FMEAAnalysisResult | null>(null);
  const [paretoResults, setParetoResults] = useState<ParetoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Load initial dashboard data
   */
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Perform FMEA analysis
      const fmeaAnalysis = fmeaAnalysisAgent.performAnalysis();
      setFmeaResults(fmeaAnalysis);

      // Perform Pareto analysis
      const paretoAnalysis = paretoAnalysisAgent.performParetoAnalysis();
      setParetoResults(paretoAnalysis);

      // Calculate dashboard metrics
      const dashboardMetrics = calculateDashboardMetrics(fmeaAnalysis, paretoAnalysis);
      setMetrics(dashboardMetrics);

    } catch (error) {
      console.error('Error loading FMEA dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate dashboard metrics from analysis results
   */
  const calculateDashboardMetrics = (
    fmea: FMEAAnalysisResult,
    pareto: ParetoAnalysisResult
  ): DashboardMetrics => {
    return {
      totalFailureModes: fmea.totalFailureModes,
      criticalIssues: fmea.criticalFailureModes.length,
      quickWins: pareto.quickWins.length,
      projectedROI: Math.round(pareto.costBenefitAnalysis.roi12Months),
      riskLevel: fmea.riskLevel,
      preventionCoverage: Math.round(
        pareto.preventionStrategies.reduce((sum, strategy) => sum + strategy.coveragePercentage, 0)
      )
    };
  };

  /**
   * Export analysis results
   */
  const handleExportAnalysis = (format: 'json' | 'csv' | 'markdown') => {
    if (!fmeaResults || !paretoResults) return;

    try {
      const fmeaExport = fmeaAnalysisAgent.exportAnalysis(format);
      const paretoExport = paretoAnalysisAgent.exportAnalysis(format);

      const combinedExport = format === 'markdown'
        ? `${fmeaExport}\n\n---\n\n${paretoExport}`
        : format === 'json'
        ? JSON.stringify({ fmea: JSON.parse(fmeaExport), pareto: JSON.parse(paretoExport) }, null, 2)
        : `${fmeaExport}\n\n${paretoExport}`;

      const blob = new Blob([combinedExport], {
        type: format === 'json' ? 'application/json' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fmea-analysis-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analysis:', error);
    }
  };

  /**
   * Render risk level badge
   */
  const renderRiskBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[level as keyof typeof colors] || colors.medium}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  /**
   * Prepare chart data for failure modes
   */
  const getFailureModeChartData = () => {
    if (!fmeaResults) return [];

    return fmeaResults.criticalFailureModes.map(fm => ({
      name: fm.component,
      rpn: fm.rpn,
      severity: fm.severity,
      occurrence: fm.occurrence,
      detection: fm.detection
    }));
  };

  /**
   * Prepare chart data for Pareto analysis
   */
  const getParetoChartData = () => {
    if (!paretoResults) return [];

    return paretoResults.top20PercentIssues.map((issue, index) => ({
      name: issue.category,
      frequency: issue.frequency,
      impact: issue.impact,
      cumulative: paretoResults.cumulativeImpact[index] || 0
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading FMEA Analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FMEA Dashboard</h1>
          <p className="text-muted-foreground">
            Failure Mode and Effects Analysis with 80-20 Rule Implementation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportAnalysis('markdown')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button onClick={loadInitialData} disabled={isLoading}>
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Failure Modes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFailureModes}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalIssues} critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Wins Available</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.quickWins}</div>
            <p className="text-xs text-muted-foreground">
              High impact, low effort
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.projectedROI}%</div>
            <p className="text-xs text-muted-foreground">
              12-month return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {renderRiskBadge(metrics.riskLevel)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.preventionCoverage}% coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Alert */}
      {metrics.riskLevel === 'critical' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Risk Level Detected</AlertTitle>
          <AlertDescription className="text-red-600">
            Multiple high-priority failure modes require immediate attention.
            Review critical issues and implement recommended actions.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fmea">FMEA Analysis</TabsTrigger>
          <TabsTrigger value="pareto">Pareto Analysis</TabsTrigger>
          <TabsTrigger value="actions">Action Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Failure Mode RPN Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Critical Failure Modes (RPN)</CardTitle>
                <CardDescription>
                  Risk Priority Number (Severity × Occurrence × Detection)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getFailureModeChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rpn" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pareto Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Pareto Analysis (80-20 Rule)</CardTitle>
                <CardDescription>
                  Issue frequency and cumulative impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getParetoChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Issues Summary */}
          {paretoResults && (
            <Card>
              <CardHeader>
                <CardTitle>Top 20% Issues (80% Impact)</CardTitle>
                <CardDescription>
                  Focus areas for maximum impact reduction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paretoResults.top20PercentIssues.slice(0, 5).map((issue, index) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{issue.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {issue.category} • {issue.frequency} occurrences
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderRiskBadge(issue.riskLevel)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {issue.userAffected.toLocaleString()} users affected
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FMEA Analysis Tab */}
        <TabsContent value="fmea" className="space-y-6">
          {fmeaResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Critical Failure Modes (RPN ≥ 200)</CardTitle>
                  <CardDescription>
                    Detailed analysis of high-risk failure modes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {fmeaResults.criticalFailureModes.map((fm) => (
                      <div key={fm.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{fm.component}</h3>
                            <p className="text-muted-foreground">{fm.failureMode}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">RPN: {fm.rpn}</div>
                            <div className="text-sm text-muted-foreground">
                              S:{fm.severity} × O:{fm.occurrence} × D:{fm.detection}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="font-medium mb-2">Potential Effects</h4>
                            <ul className="text-sm space-y-1">
                              {fm.potentialEffects.map((effect, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  {effect}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Potential Causes</h4>
                            <ul className="text-sm space-y-1">
                              {fm.potentialCauses.map((cause, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {cause}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Recommended Actions</h4>
                            <ul className="text-sm space-y-1">
                              {fm.recommendedActions.map((action, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          {renderRiskBadge(fm.criticality)}
                          <Badge variant="outline">{fm.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Target: {new Date(fm.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Pareto Analysis Tab */}
        <TabsContent value="pareto" className="space-y-6">
          {paretoResults && (
            <>
              {/* Quick Wins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Wins (High Impact, Low Effort)
                  </CardTitle>
                  <CardDescription>
                    Immediate actions for maximum return on investment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {paretoResults.quickWins.map((win) => (
                      <div key={win.issueId} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{win.description}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Implementation Time:</span>
                            <span className="font-medium">{win.implementationTime} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected Impact:</span>
                            <span className="font-medium text-green-600">
                              {win.expectedImpact.toFixed(1)}% improvement
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Immediate Actions:</h5>
                          <ul className="text-sm space-y-1">
                            {win.immediateActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost-Benefit Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Cost-Benefit Analysis
                  </CardTitle>
                  <CardDescription>
                    Financial impact of prevention strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Current Monthly Cost:</span>
                        <span className="text-lg font-bold text-red-600">
                          ${paretoResults.costBenefitAnalysis.currentCostOfIssues.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Proposed Investment:</span>
                        <span className="text-lg font-bold">
                          ${paretoResults.costBenefitAnalysis.proposedInvestment.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Projected Monthly Savings:</span>
                        <span className="text-lg font-bold text-green-600">
                          ${paretoResults.costBenefitAnalysis.projectedSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Break-Even Period:</span>
                        <span className="text-lg font-bold">
                          {paretoResults.costBenefitAnalysis.breakEvenPeriod.toFixed(1)} months
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>12-Month ROI:</span>
                        <span className="text-lg font-bold text-green-600">
                          {paretoResults.costBenefitAnalysis.roi12Months.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk-Adjusted ROI:</span>
                        <span className="text-lg font-bold">
                          {paretoResults.costBenefitAnalysis.riskAdjustedROI.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="actions" className="space-y-6">
          {fmeaResults && paretoResults && (
            <>
              {/* Immediate Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Immediate Actions Required
                  </CardTitle>
                  <CardDescription>
                    Critical actions to implement within 1-2 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fmeaResults.recommendedImmediateActions.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prevention Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Prevention Strategies
                  </CardTitle>
                  <CardDescription>
                    Long-term strategies to prevent similar issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paretoResults.preventionStrategies.map((strategy, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{strategy.category}</h4>
                          <Badge variant="outline">{strategy.automationLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{strategy.strategy}</p>
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Coverage:</span>
                            <span className="ml-2 font-medium">
                              {strategy.coveragePercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Implementation:</span>
                            <span className="ml-2 font-medium">
                              ${strategy.implementationCost.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payback:</span>
                            <span className="ml-2 font-medium">
                              {strategy.paybackPeriod.toFixed(1)} months
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Monitoring & Alerting
                  </CardTitle>
                  <CardDescription>
                    Recommended monitoring setup for early detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fmeaResults.monitoringRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Activity className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}