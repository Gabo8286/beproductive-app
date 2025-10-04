import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
  Server,
  Network,
  Clock,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiSystemValidator, SystemValidationReport, ValidationResult } from '@/services/ai/aiSystemValidator';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AISystemValidator() {
  const { user } = useAuth();
  const [validationReport, setValidationReport] = useState<SystemValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<string | null>(null);

  const runValidation = async () => {
    if (!user?.id) return;

    setIsValidating(true);
    try {
      const report = await aiSystemValidator.validateCompleteSystem(user.id);
      setValidationReport(report);
      setLastValidation(new Date().toISOString());
      toast.success(`System validation completed with ${report.overall.score}/100 score`);
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('System validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ComponentValidationCard = ({ result }: { result: ValidationResult }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon(result.status)}
            {result.component}
          </span>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(result.status)}>
              {result.status}
            </Badge>
            <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
              {result.score}/100
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          Component validation results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-lg ${result.details.functionality ? 'text-green-600' : 'text-red-600'}`}>
              {result.details.functionality ? '✓' : '✗'}
            </div>
            <div className="text-xs text-muted-foreground">Functionality</div>
          </div>
          <div className="text-center">
            <div className={`text-lg ${result.details.performance ? 'text-green-600' : 'text-red-600'}`}>
              {result.details.performance ? '✓' : '✗'}
            </div>
            <div className="text-xs text-muted-foreground">Performance</div>
          </div>
          <div className="text-center">
            <div className={`text-lg ${result.details.accuracy ? 'text-green-600' : 'text-red-600'}`}>
              {result.details.accuracy ? '✓' : '✗'}
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className={`text-lg ${result.details.reliability ? 'text-green-600' : 'text-red-600'}`}>
              {result.details.reliability ? '✓' : '✗'}
            </div>
            <div className="text-xs text-muted-foreground">Reliability</div>
          </div>
        </div>

        <Progress value={result.score} className="h-2" />

        {result.metrics && Object.keys(result.metrics).length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(result.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.errors.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Errors
            </h4>
            <ul className="space-y-1">
              {result.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.warnings.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {result.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-600">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI System Validator</h2>
          <p className="text-muted-foreground">
            Comprehensive validation and health monitoring of the AI integration system
          </p>
        </div>
        <Button onClick={runValidation} disabled={isValidating}>
          {isValidating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Run Validation
        </Button>
      </div>

      {lastValidation && (
        <div className="text-sm text-muted-foreground">
          Last validation: {format(new Date(lastValidation), 'PPpp')}
        </div>
      )}

      {validationReport ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
                  {getStatusIcon(validationReport.overall.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge className={getStatusColor(validationReport.overall.status)}>
                      {validationReport.overall.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System health status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(validationReport.overall.score)}`}>
                    {validationReport.overall.score}/100
                  </div>
                  <Progress value={validationReport.overall.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Components</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{validationReport.components.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {validationReport.components.filter(c => c.status === 'passed').length} passing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {validationReport.performance.successRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Component Status Summary</CardTitle>
                  <CardDescription>Health status of all AI components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationReport.components.map((component) => (
                      <div key={component.component} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.status)}
                          <span className="text-sm">{component.component}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getScoreColor(component.score)}`}>
                            {component.score}
                          </span>
                          <Badge variant="outline" className={getStatusColor(component.status)}>
                            {component.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Health</CardTitle>
                  <CardDescription>System integration status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Flow</span>
                      <div className={`text-sm ${validationReport.integration.dataFlow ? 'text-green-600' : 'text-red-600'}`}>
                        {validationReport.integration.dataFlow ? '✓' : '✗'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Connectivity</span>
                      <div className={`text-sm ${validationReport.integration.apiConnectivity ? 'text-green-600' : 'text-red-600'}`}>
                        {validationReport.integration.apiConnectivity ? '✓' : '✗'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cross-Component Communication</span>
                      <div className={`text-sm ${validationReport.integration.crossComponentCommunication ? 'text-green-600' : 'text-red-600'}`}>
                        {validationReport.integration.crossComponentCommunication ? '✓' : '✗'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Handling</span>
                      <div className={`text-sm ${validationReport.integration.errorHandling ? 'text-green-600' : 'text-red-600'}`}>
                        {validationReport.integration.errorHandling ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {validationReport.components.map((component) => (
                  <ComponentValidationCard key={component.component} result={component} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>System integration health checks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Data Flow</div>
                        <div className="text-sm text-muted-foreground">
                          Components can access shared data sources
                        </div>
                      </div>
                      {validationReport.integration.dataFlow ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">API Connectivity</div>
                        <div className="text-sm text-muted-foreground">
                          Database and external APIs are accessible
                        </div>
                      </div>
                      {validationReport.integration.apiConnectivity ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Cross-Component Communication</div>
                        <div className="text-sm text-muted-foreground">
                          Components can trigger and interact with each other
                        </div>
                      </div>
                      {validationReport.integration.crossComponentCommunication ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Error Handling</div>
                        <div className="text-sm text-muted-foreground">
                          System gracefully handles errors and failures
                        </div>
                      </div>
                      {validationReport.integration.errorHandling ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Architecture
                  </CardTitle>
                  <CardDescription>AI system component relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <strong>Core Services:</strong> AI Service Manager, Productivity Insights Generator
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <strong>Intelligence Engines:</strong> Smart Task Prioritizer, Goal Tracker, Habit Optimizer
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <strong>Optimization Systems:</strong> Time Blocker, Burnout Predictor
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <strong>User Interaction:</strong> Notification System, Team Integration
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {validationReport.performance.averageResponseTime.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI service responses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {validationReport.performance.successRate.toFixed(1)}%
                  </div>
                  <Progress value={validationReport.performance.successRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${validationReport.performance.errorRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {validationReport.performance.errorRate.toFixed(1)}%
                  </div>
                  <Progress value={validationReport.performance.errorRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {validationReport.performance.throughput}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requests/24h
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Detailed performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Response Time Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Average</div>
                        <div className="font-bold">{validationReport.performance.averageResponseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-bold text-green-600">&lt; 5000ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className={`font-bold ${validationReport.performance.averageResponseTime < 5000 ? 'text-green-600' : 'text-red-600'}`}>
                          {validationReport.performance.averageResponseTime < 5000 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Reliability Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-bold text-green-600">{validationReport.performance.successRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Error Rate</div>
                        <div className={`font-bold ${validationReport.performance.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {validationReport.performance.errorRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Immediate Actions Required
                  </CardTitle>
                  <CardDescription>Critical issues that need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {validationReport.recommendations.immediate.length > 0 ? (
                    <ul className="space-y-2">
                      {validationReport.recommendations.immediate.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No immediate actions required</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Clock className="h-5 w-5" />
                    Short-term Improvements
                  </CardTitle>
                  <CardDescription>Recommendations for the next 1-2 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  {validationReport.recommendations.shortTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {validationReport.recommendations.shortTerm.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No short-term improvements needed</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <TrendingUp className="h-5 w-5" />
                    Long-term Enhancements
                  </CardTitle>
                  <CardDescription>Strategic improvements for long-term stability</CardDescription>
                </CardHeader>
                <CardContent>
                  {validationReport.recommendations.longTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {validationReport.recommendations.longTerm.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No long-term enhancements identified</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Validation Data</h3>
            <p className="text-muted-foreground text-center mb-4">
              Run a system validation to check the health and performance of your AI integration.
            </p>
            <Button onClick={runValidation} disabled={isValidating}>
              {isValidating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Start Validation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}