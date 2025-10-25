import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ErrorBar,
  ComposedChart,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Eye,
  Lightbulb,
  Gauge,
  Calendar,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import {
  PredictiveAnalytics as PredictiveAnalyticsType,
  PredictionResult,
  AnalyticsInsight,
  AnalyticsTimeframe,
} from "@/types/analytics";
import {
  usePredictiveAnalytics,
  useAnalyticsInsights,
} from "@/hooks/useAnalytics";

interface ModelCard {
  id: string;
  name: string;
  description: string;
  type:
    | "productivity_forecast"
    | "goal_prediction"
    | "team_performance"
    | "churn_risk"
    | "efficiency_optimization";
  accuracy: number;
  confidence: number;
  lastTrained: string;
  predictions: number;
  status: "active" | "training" | "inactive";
}

const mockModels: ModelCard[] = [
  {
    id: "model_1",
    name: "Productivity Forecast Model",
    description:
      "Predicts individual and team productivity trends over the next 30 days",
    type: "productivity_forecast",
    accuracy: 89.2,
    confidence: 87.5,
    lastTrained: "2024-10-01T12:00:00Z",
    predictions: 1247,
    status: "active",
  },
  {
    id: "model_2",
    name: "Goal Achievement Predictor",
    description:
      "Forecasts goal completion likelihood based on current progress patterns",
    type: "goal_prediction",
    accuracy: 92.1,
    confidence: 90.3,
    lastTrained: "2024-09-28T15:30:00Z",
    predictions: 856,
    status: "active",
  },
  {
    id: "model_3",
    name: "Team Performance Analyzer",
    description:
      "Analyzes team dynamics and predicts collaboration effectiveness",
    type: "team_performance",
    accuracy: 85.7,
    confidence: 83.2,
    lastTrained: "2024-09-30T09:45:00Z",
    predictions: 432,
    status: "training",
  },
  {
    id: "model_4",
    name: "Employee Churn Risk Assessment",
    description:
      "Identifies employees at risk of leaving based on engagement patterns",
    type: "churn_risk",
    accuracy: 94.5,
    confidence: 91.8,
    lastTrained: "2024-10-02T11:20:00Z",
    predictions: 298,
    status: "active",
  },
];

const mockPredictionScenarios = [
  {
    name: "Optimistic",
    probability: 25,
    description: "Best-case scenario with all favorable conditions",
    color: "#10B981",
    value: 95.2,
  },
  {
    name: "Realistic",
    probability: 50,
    description: "Most likely outcome based on current trends",
    color: "#3B82F6",
    value: 87.6,
  },
  {
    name: "Conservative",
    probability: 75,
    description: "Lower-bound estimate accounting for potential setbacks",
    color: "#F59E0B",
    value: 78.9,
  },
  {
    name: "Pessimistic",
    probability: 90,
    description: "Worst-case scenario with multiple risk factors",
    color: "#EF4444",
    value: 65.3,
  },
];

const mockInsightTypes = [
  {
    type: "trend",
    icon: TrendingUp,
    color: "blue",
    title: "Trend Analysis",
    count: 12,
  },
  {
    type: "anomaly",
    icon: AlertTriangle,
    color: "yellow",
    title: "Anomaly Detection",
    count: 3,
  },
  {
    type: "correlation",
    icon: Brain,
    color: "purple",
    title: "Correlation Insights",
    count: 8,
  },
  {
    type: "recommendation",
    icon: Lightbulb,
    color: "green",
    title: "AI Recommendations",
    count: 15,
  },
];

export function PredictiveAnalytics() {
  const [selectedModel, setSelectedModel] = useState<string>("model_1");
  const [selectedMetric, setSelectedMetric] = useState<string>("metric_1");
  const [predictionHorizon, setPredictionHorizon] = useState<number>(30);
  const [isTraining, setIsTraining] = useState(false);

  const { data: predictiveData, isLoading: predictiveLoading } =
    usePredictiveAnalytics(selectedMetric);
  const { data: insights, isLoading: insightsLoading } = useAnalyticsInsights();

  // Generate enhanced prediction data with confidence intervals
  const generatePredictionData = () => {
    if (!predictiveData) return [];

    return predictiveData.predictions.map((prediction, index) => ({
      ...prediction,
      date: new Date(prediction.date).toLocaleDateString(),
      actualValue: prediction.actual_value || null,
      confidenceRange:
        prediction.confidence_upper - prediction.confidence_lower,
      dayIndex: index + 1,
    }));
  };

  const predictionData = generatePredictionData();

  const handleRetrainModel = async (modelId: string) => {
    setIsTraining(true);
    // Simulate model retraining
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsTraining(false);
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "training":
        return "text-blue-600 bg-blue-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-blue-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predictive Analytics & AI Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered forecasting, trend analysis, and intelligent
            recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={predictionHorizon.toString()}
            onValueChange={(value) => setPredictionHorizon(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Model Settings
          </Button>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockModels.map((model) => (
          <Card
            key={model.id}
            className={`cursor-pointer transition-all duration-200 ${selectedModel === model.id ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"}`}
          >
            <CardHeader onClick={() => setSelectedModel(model.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">
                    {model.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 line-clamp-2">
                    {model.description}
                  </CardDescription>
                </div>
                <Badge className={getModelStatusColor(model.status)}>
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Accuracy</span>
                  <span
                    className={`font-semibold ${getAccuracyColor(model.accuracy)}`}
                  >
                    {model.accuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress value={model.accuracy} className="h-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Predictions: {model.predictions}</span>
                  <span>Confidence: {model.confidence.toFixed(1)}%</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last trained:{" "}
                  {new Date(model.lastTrained).toLocaleDateString()}
                </div>

                {model.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetrainModel(model.id);
                    }}
                    disabled={isTraining}
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-2 ${isTraining ? "animate-spin" : ""}`}
                    />
                    {isTraining ? "Retraining..." : "Retrain"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Predictive Forecast</CardTitle>
                  <CardDescription>
                    {predictionHorizon}-day prediction with confidence intervals
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Model Accuracy:{" "}
                    {predictiveData?.model_accuracy
                      ? (predictiveData.model_accuracy * 100).toFixed(1)
                      : "N/A"}
                    %
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {predictiveLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : predictionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    {/* Confidence interval area */}
                    <Area
                      type="monotone"
                      dataKey="confidence_upper"
                      stroke="none"
                      fill="#8B5CF6"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence_lower"
                      stroke="none"
                      fill="#FFFFFF"
                      fillOpacity={1}
                    />

                    {/* Predicted values */}
                    <Line
                      type="monotone"
                      dataKey="predicted_value"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Predicted"
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                    />

                    {/* Actual values (if available) */}
                    <Line
                      type="monotone"
                      dataKey="actualValue"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Actual"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                      connectNulls={false}
                    />

                    {/* Current date reference line */}
                    <ReferenceLine
                      x={new Date().toLocaleDateString()}
                      stroke="#EF4444"
                      strokeDasharray="2 2"
                      label="Today"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No prediction data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prediction Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy</span>
                    <span className="font-semibold text-green-600">
                      {predictiveData
                        ? (predictiveData.model_accuracy * 100).toFixed(1)
                        : "N/A"}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence</span>
                    <span className="font-semibold text-blue-600">
                      {predictiveData
                        ? (predictiveData.confidence_interval * 100).toFixed(1)
                        : "N/A"}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training Data</span>
                    <span className="font-semibold">
                      {predictiveData?.training_data_points.toLocaleString() ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prediction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Forecast Period</span>
                    <span className="font-semibold">
                      {predictionHorizon} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Points</span>
                    <span className="font-semibold">
                      {predictionData.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="font-semibold text-xs">
                      {predictiveData
                        ? new Date(
                            predictiveData.last_trained_at,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volatility</span>
                    <Badge variant="outline" className="text-yellow-600">
                      Medium
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trend Direction</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-green-600">Positive</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reliability</span>
                    <Badge variant="outline" className="text-green-600">
                      High
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
              <CardDescription>
                Multiple prediction scenarios with different probability
                outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockPredictionScenarios.map((scenario) => (
                  <div key={scenario.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scenario.color }}
                        />
                        <h4 className="font-medium">
                          {scenario.name} Scenario
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {scenario.probability}% confidence
                        </Badge>
                        <span className="font-semibold">
                          {scenario.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                    <Progress value={scenario.value} className="mt-2 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insight Types Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {mockInsightTypes.map((insightType) => (
              <Card key={insightType.type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {insightType.title}
                  </CardTitle>
                  <insightType.icon
                    className={`h-4 w-4 text-${insightType.color}-600`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insightType.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Active insights
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights List */}
          <div className="space-y-4">
            {insightsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : insights && insights.length > 0 ? (
              insights.map((insight) => (
                <Card
                  key={insight.id}
                  className={`border-l-4 ${getSeverityColor(insight.severity)} hover:shadow-md transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {insight.type === "trend" && (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          )}
                          {insight.type === "anomaly" && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          {insight.type === "correlation" && (
                            <Brain className="h-4 w-4 text-purple-600" />
                          )}
                          {insight.type === "recommendation" && (
                            <Lightbulb className="h-4 w-4 text-green-600" />
                          )}
                          {insight.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {insight.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`capitalize ${getSeverityColor(insight.severity).split(" ")[1]}`}
                        >
                          {insight.severity}
                        </Badge>
                        <Badge variant="secondary">
                          {Math.round(insight.confidence_score * 100)}%
                          confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Insight Data */}
                      {insight.insight_data && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {insight.insight_data.trend_direction && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Trend:
                              </span>
                              <div className="flex items-center gap-1">
                                {insight.insight_data.trend_direction ===
                                "up" ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                )}
                                <span className="capitalize">
                                  {insight.insight_data.trend_direction}
                                </span>
                              </div>
                            </div>
                          )}
                          {insight.insight_data.percentage_change && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Change:
                              </span>
                              <span
                                className={
                                  insight.insight_data.percentage_change > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {insight.insight_data.percentage_change > 0
                                  ? "+"
                                  : ""}
                                {insight.insight_data.percentage_change.toFixed(
                                  1,
                                )}
                                %
                              </span>
                            </div>
                          )}
                          {insight.insight_data.correlation_coefficient && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Correlation:
                              </span>
                              <span>
                                {insight.insight_data.correlation_coefficient.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Related Metrics */}
                      {insight.related_metrics.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Related metrics:{" "}
                          </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {insight.related_metrics.map((metric) => (
                              <Badge
                                key={metric}
                                variant="outline"
                                className="text-xs"
                              >
                                {metric.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actionable Recommendations */}
                      {insight.is_actionable &&
                        insight.insight_data.recommendation_actions && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              Recommended Actions
                            </h5>
                            <ul className="space-y-1">
                              {insight.insight_data.recommendation_actions.map(
                                (action, index) => (
                                  <li
                                    key={index}
                                    className="text-sm flex items-start gap-2"
                                  >
                                    <ArrowRight className="h-3 w-3 text-blue-600 mt-0.5" />
                                    {action}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      <div className="text-xs text-muted-foreground">
                        Generated{" "}
                        {new Date(insight.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No insights available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    AI insights will appear here as we analyze your data
                    patterns and identify opportunities
                  </p>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                AI Recommendations Engine
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Personalized recommendations based on your productivity patterns
                and goals
              </p>
              <Button variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
