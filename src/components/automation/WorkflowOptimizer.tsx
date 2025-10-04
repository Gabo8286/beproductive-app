import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Brain,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Lightbulb,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { OptimizationResult } from "@/types/ai-automation";

interface OptimizationSuggestion {
  id: string;
  type: "efficiency" | "time" | "accuracy" | "user_experience";
  title: string;
  description: string;
  current_metric: number;
  projected_improvement: number;
  confidence: number;
  complexity: "low" | "medium" | "high";
  estimated_implementation_time: number;
  affected_modules: string[];
  actions: string[];
}

export function WorkflowOptimizer() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  // Mock optimization data
  const currentMetrics = {
    overall_efficiency: 0.78,
    task_completion_rate: 0.82,
    average_response_time: 2.3,
    user_satisfaction: 4.2,
    automation_success_rate: 0.91,
    cross_module_sync: 0.85,
  };

  const optimizationHistory = [
    {
      date: "2024-01-01",
      efficiency: 0.72,
      completion_rate: 0.75,
      satisfaction: 3.8,
    },
    {
      date: "2024-01-08",
      efficiency: 0.74,
      completion_rate: 0.77,
      satisfaction: 3.9,
    },
    {
      date: "2024-01-15",
      efficiency: 0.76,
      completion_rate: 0.79,
      satisfaction: 4.0,
    },
    {
      date: "2024-01-22",
      efficiency: 0.78,
      completion_rate: 0.82,
      satisfaction: 4.2,
    },
  ];

  const suggestions: OptimizationSuggestion[] = [
    {
      id: "1",
      type: "efficiency",
      title: "Optimize Task Batching",
      description:
        "Group similar tasks together to reduce context switching and improve focus time",
      current_metric: 0.68,
      projected_improvement: 0.23,
      confidence: 0.89,
      complexity: "medium",
      estimated_implementation_time: 45,
      affected_modules: ["tasks", "habits", "goals"],
      actions: [
        "Implement intelligent task grouping algorithm",
        "Add context-aware scheduling",
        "Create focus time blocks",
        "Enable smart notifications batching",
      ],
    },
    {
      id: "2",
      type: "time",
      title: "Predictive Deadline Adjustment",
      description:
        "Use AI to predict realistic completion times and automatically adjust deadlines",
      current_metric: 0.73,
      projected_improvement: 0.18,
      confidence: 0.82,
      complexity: "high",
      estimated_implementation_time: 90,
      affected_modules: ["tasks", "projects", "team"],
      actions: [
        "Implement ML-based time estimation",
        "Add historical performance analysis",
        "Create dynamic deadline adjustment",
        "Enable stakeholder notifications",
      ],
    },
    {
      id: "3",
      type: "user_experience",
      title: "Smart Interface Adaptation",
      description:
        "Adapt the interface based on user behavior patterns and preferences",
      current_metric: 0.75,
      projected_improvement: 0.15,
      confidence: 0.76,
      complexity: "low",
      estimated_implementation_time: 30,
      affected_modules: ["all"],
      actions: [
        "Implement adaptive UI layouts",
        "Add personalized quick actions",
        "Create smart widget arrangement",
        "Enable context-sensitive shortcuts",
      ],
    },
  ];

  const recentOptimizations: OptimizationResult[] = [
    {
      id: "1",
      optimization_type: "Task Priority Algorithm",
      before_metrics: { efficiency: 0.72, completion_rate: 0.75 },
      after_metrics: { efficiency: 0.78, completion_rate: 0.82 },
      improvement_percentage: 8.3,
      actions_taken: [
        "Implemented smart priority scoring",
        "Added urgency-importance matrix",
        "Enhanced deadline awareness",
        "Improved context switching detection",
      ],
      time_period: {
        start: "2024-01-01",
        end: "2024-01-22",
      },
      affected_workflows: [
        "Daily Planning",
        "Goal Tracking",
        "Project Management",
      ],
      user_feedback: {
        rating: 4.3,
        comments: "Much better at identifying what needs attention first",
      },
    },
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Simulate optimization process
    const steps = [
      "Analyzing current workflow patterns...",
      "Identifying optimization opportunities...",
      "Running performance simulations...",
      "Applying optimizations...",
      "Validating improvements...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOptimizationProgress((i + 1) * 20);
    }

    setIsOptimizing(false);
    setOptimizationProgress(100);

    // Reset after showing completion
    setTimeout(() => setOptimizationProgress(0), 2000);
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0.15)
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (improvement > 0.05)
      return <ArrowUp className="h-4 w-4 text-yellow-600" />;
    return <ArrowDown className="h-4 w-4 text-red-600" />;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: OptimizationSuggestion["type"]) => {
    switch (type) {
      case "efficiency":
        return <Zap className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "accuracy":
        return <Target className="h-4 w-4" />;
      case "user_experience":
        return <Activity className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Intelligent Workflow Optimization
          </h2>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis and optimization of your productivity workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="relative"
          >
            {isOptimizing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Optimization in Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {optimizationProgress}%
                </span>
              </div>
              <Progress value={optimizationProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Analyzing your workflow patterns and identifying optimization
                opportunities...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Efficiency
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(currentMetrics.overall_efficiency * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress
              value={currentMetrics.overall_efficiency * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(currentMetrics.task_completion_rate * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <Progress
              value={currentMetrics.task_completion_rate * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Response Time
                </p>
                <p className="text-2xl font-bold">
                  {currentMetrics.average_response_time}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average system response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Key metrics over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={optimizationHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Efficiency"
                    />
                    <Line
                      type="monotone"
                      dataKey="completion_rate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Completion Rate"
                    />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Satisfaction"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Optimizations</CardTitle>
                <CardDescription>
                  Latest improvements and their impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOptimizations.map((opt) => (
                  <div key={opt.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{opt.optimization_type}</h4>
                      <Badge variant="outline" className="text-green-600">
                        +{opt.improvement_percentage}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Applied {opt.actions_taken.length} optimizations</p>
                      <p>User rating: {opt.user_feedback?.rating}/5</p>
                    </div>
                    <div className="space-y-1">
                      {opt.actions_taken.slice(0, 2).map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="grid gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {suggestion.title}
                          {getImprovementIcon(suggestion.projected_improvement)}
                        </CardTitle>
                        <CardDescription>
                          {suggestion.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getComplexityColor(suggestion.complexity)}
                      >
                        {suggestion.complexity} complexity
                      </Badge>
                      <Badge variant="outline">{suggestion.type}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Projected Improvement</span>
                          <span>
                            +
                            {Math.round(suggestion.projected_improvement * 100)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={suggestion.projected_improvement * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span>
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={suggestion.confidence * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ~{suggestion.estimated_implementation_time} min to
                          implement
                        </span>
                      </div>
                    </div>

                    {/* Affected Modules */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        Affected Modules
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.affected_modules.map((module) => (
                          <Badge
                            key={module}
                            variant="secondary"
                            className="text-xs"
                          >
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        Optimization Actions
                      </h5>
                      <ul className="space-y-1">
                        {suggestion.actions.map((action, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Apply Optimization
                      </Button>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization History</CardTitle>
              <CardDescription>
                Track of all applied optimizations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentOptimizations.map((opt) => (
                  <div
                    key={opt.id}
                    className="border-l-4 border-green-500 pl-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{opt.optimization_type}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          +{opt.improvement_percentage}% improvement
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(opt.time_period.end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Before</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          {Object.entries(opt.before_metrics).map(
                            ([key, value]) => (
                              <li key={key}>
                                {key.replace(/_/g, " ")}:{" "}
                                {typeof value === "number"
                                  ? Math.round(value * 100) + "%"
                                  : value}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">After</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          {Object.entries(opt.after_metrics).map(
                            ([key, value]) => (
                              <li key={key}>
                                {key.replace(/_/g, " ")}:{" "}
                                {typeof value === "number"
                                  ? Math.round(value * 100) + "%"
                                  : value}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {opt.user_feedback && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">User Feedback</p>
                        <p className="text-sm text-muted-foreground">
                          Rating: {opt.user_feedback.rating}/5 - "
                          {opt.user_feedback.comments}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficiency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency by Module</CardTitle>
                <CardDescription>
                  Performance breakdown across different modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { module: "Tasks", efficiency: 0.85 },
                      { module: "Goals", efficiency: 0.78 },
                      { module: "Habits", efficiency: 0.92 },
                      { module: "Projects", efficiency: 0.73 },
                      { module: "Notes", efficiency: 0.81 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Optimization Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Impact</CardTitle>
                <CardDescription>
                  Cumulative effect of applied optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={optimizationHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
