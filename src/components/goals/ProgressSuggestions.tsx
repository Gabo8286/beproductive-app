import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Goal } from "@/types/goals";
import { ProgressSuggestion } from "@/hooks/useGoalProgress";
import {
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

interface ProgressSuggestionsProps {
  suggestions: ProgressSuggestion[];
  goal: Goal;
}

export function ProgressSuggestions({
  suggestions,
  goal,
}: ProgressSuggestionsProps) {
  const getSuggestionIcon = (type: ProgressSuggestion["type"]) => {
    switch (type) {
      case "milestone_due":
        return <Clock className="h-4 w-4" />;
      case "behind_schedule":
        return <AlertTriangle className="h-4 w-4" />;
      case "ahead_schedule":
        return <TrendingUp className="h-4 w-4" />;
      case "stagnant":
        return <Target className="h-4 w-4" />;
      case "target_adjustment":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (priority: ProgressSuggestion["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
    }
  };

  const getSuggestionVariant = (type: ProgressSuggestion["type"]) => {
    switch (type) {
      case "behind_schedule":
        return "destructive";
      case "ahead_schedule":
        return "default";
      case "stagnant":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Suggestions</CardTitle>
        <CardDescription>
          AI-powered recommendations to optimize your goal progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Alert
                key={index}
                variant={getSuggestionVariant(suggestion.type)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSuggestionColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {suggestion.type.replace("_", " ")}
                      </span>
                    </div>
                    <AlertDescription>{suggestion.message}</AlertDescription>
                    {suggestion.action && (
                      <Button variant="outline" size="sm">
                        {suggestion.action}
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-muted-foreground">No suggestions available</p>
            <p className="text-sm text-muted-foreground">
              Keep updating your progress to get smart recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
