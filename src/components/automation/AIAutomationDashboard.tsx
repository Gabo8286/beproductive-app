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
  Brain,
  Zap,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAutomationSuggestions,
  useImplementSuggestion,
  useRejectSuggestion,
  useAIInsights,
  useLearningData,
  useGenerateAutomationSuggestions,
  useOptimizeWorkflow,
} from "@/hooks/useAIAutomation";
import { AutomationSuggestion } from "@/types/ai-automation";

const impactColors = {
  low: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  high: "text-orange-600 bg-orange-100",
  critical: "text-red-600 bg-red-100",
};

const complexityColors = {
  simple: "text-green-600 bg-green-100",
  moderate: "text-yellow-600 bg-yellow-100",
  complex: "text-orange-600 bg-orange-100",
};

export function AIAutomationDashboard() {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AutomationSuggestion | null>(null);
  const [implementDialogOpen, setImplementDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useAutomationSuggestions();
  const { data: insights = [], isLoading: insightsLoading } = useAIInsights();
  const { data: learningData, isLoading: learningLoading } = useLearningData();
  const implementSuggestion = useImplementSuggestion();
  const rejectSuggestion = useRejectSuggestion();
  const generateSuggestions = useGenerateAutomationSuggestions();
  const optimizeWorkflow = useOptimizeWorkflow();

  const handleImplement = async () => {
    if (!selectedSuggestion) return;

    try {
      await implementSuggestion.mutateAsync({
        suggestionId: selectedSuggestion.id,
      });
      setImplementDialogOpen(false);
      setSelectedSuggestion(null);
    } catch (error) {
      console.error("Failed to implement suggestion:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedSuggestion) return;

    try {
      await rejectSuggestion.mutateAsync({
        suggestionId: selectedSuggestion.id,
        reason: rejectionReason,
      });
      setRejectDialogOpen(false);
      setSelectedSuggestion(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
    }
  };

  const SuggestionCard = ({
    suggestion,
  }: {
    suggestion: AutomationSuggestion;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
              <CardDescription className="mt-1">
                {suggestion.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={impactColors[suggestion.potential_impact]}
            >
              {suggestion.potential_impact} impact
            </Badge>
            <Badge
              variant="outline"
              className={complexityColors[suggestion.implementation_complexity]}
            >
              {suggestion.implementation_complexity}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Confidence and Time Savings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Confidence</span>
                <span>{Math.round(suggestion.confidence * 100)}%</span>
              </div>
              <Progress value={suggestion.confidence * 100} className="h-2" />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Save ~{suggestion.estimated_time_saved_minutes} min/week
              </span>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-muted p-3 rounded-lg">
            <h5 className="font-medium text-sm mb-1">AI Reasoning</h5>
            <p className="text-sm text-muted-foreground">
              {suggestion.reasoning}
            </p>
          </div>

          {/* Evidence */}
          <div>
            <h5 className="font-medium text-sm mb-2">Supporting Evidence</h5>
            <ul className="space-y-1">
              {suggestion.evidence.map((evidence, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                  {evidence}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setImplementDialogOpen(true);
              }}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Implement
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setRejectDialogOpen(true);
              }}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Automation Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent automation suggestions and workflow optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generateSuggestions.mutate({})}
            disabled={generateSuggestions.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${generateSuggestions.isPending ? "animate-spin" : ""}`}
            />
            Analyze Patterns
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Suggestions
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                suggestions.filter(
                  (s) =>
                    s.potential_impact === "high" ||
                    s.potential_impact === "critical",
                ).length
              }{" "}
              high impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Potential Time Saved
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suggestions.reduce(
                (sum, s) => sum + s.estimated_time_saved_minutes,
                0,
              )}
              m
            </div>
            <p className="text-xs text-muted-foreground">Per week estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (suggestions.reduce((sum, s) => sum + s.confidence, 0) /
                  suggestions.length) *
                  100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {learningData
                ? Math.round(
                    learningData.feedback_history.suggestion_acceptance_rate *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Suggestion acceptance
            </p>
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
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="learning">Learning Data</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          {suggestionsLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid gap-6">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No suggestions available
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                  Let AI analyze your patterns to generate personalized
                  automation suggestions
                </p>
                <Button onClick={() => generateSuggestions.mutate({})}>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze My Patterns
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insightsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {insight.title}
                      </CardTitle>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Data Points</h5>
                        <pre className="text-sm bg-muted p-2 rounded">
                          {JSON.stringify(insight.data, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Related Modules</h5>
                        <div className="flex flex-wrap gap-1">
                          {insight.related_modules.map((module) => (
                            <Badge key={module} variant="secondary">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          {learningLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : learningData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Peak Hours</h5>
                      <div className="flex flex-wrap gap-1">
                        {learningData.patterns.work_hours.map((hour) => (
                          <Badge key={hour} variant="secondary">
                            {hour}:00
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Completion Rate</h5>
                      <Progress
                        value={
                          learningData.patterns.completion_patterns
                            .completion_rate * 100
                        }
                        className="h-3"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round(
                          learningData.patterns.completion_patterns
                            .completion_rate * 100,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Productivity Score</h5>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            learningData.performance_trends.productivity_score[
                              learningData.performance_trends.productivity_score
                                .length - 1
                            ] * 100
                          }
                          className="h-3 flex-1"
                        />
                        <span className="text-sm">
                          {Math.round(
                            learningData.performance_trends.productivity_score[
                              learningData.performance_trends.productivity_score
                                .length - 1
                            ] * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Goal Achievement</h5>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            learningData.performance_trends
                              .goal_achievement_rate[
                              learningData.performance_trends
                                .goal_achievement_rate.length - 1
                            ] * 100
                          }
                          className="h-3 flex-1"
                        />
                        <span className="text-sm">
                          {Math.round(
                            learningData.performance_trends
                              .goal_achievement_rate[
                              learningData.performance_trends
                                .goal_achievement_rate.length - 1
                            ] * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Optimization</CardTitle>
              <CardDescription>
                AI-powered optimization of your existing workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Workflow Optimization
                </h3>
                <p className="text-muted-foreground mb-4">
                  Analyze and optimize your workflows for better efficiency
                </p>
                <Button
                  onClick={() => optimizeWorkflow.mutate("default-workflow")}
                  disabled={optimizeWorkflow.isPending}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {optimizeWorkflow.isPending
                    ? "Optimizing..."
                    : "Optimize Workflows"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Dialog */}
      <Dialog open={implementDialogOpen} onOpenChange={setImplementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Implement Automation</DialogTitle>
            <DialogDescription>
              This will create a new automation rule based on the AI suggestion.
            </DialogDescription>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedSuggestion.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSuggestion.description}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h5 className="font-medium text-sm mb-1">This will:</h5>
                <ul className="text-sm space-y-1">
                  <li>• Create a new automation rule</li>
                  <li>• Enable automatic execution</li>
                  <li>• Start learning from your usage patterns</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImplementDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImplement}
              disabled={implementSuggestion.isPending}
            >
              {implementSuggestion.isPending ? "Implementing..." : "Implement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Suggestion</DialogTitle>
            <DialogDescription>
              Help us improve by sharing why this suggestion isn't helpful.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Reason (optional)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Why isn't this suggestion helpful?"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectSuggestion.isPending}
            >
              {rejectSuggestion.isPending ? "Dismissing..." : "Dismiss"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
