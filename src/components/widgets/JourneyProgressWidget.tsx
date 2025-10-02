import { TrendingUp, Award, Calendar } from "lucide-react";
import { BaseWidget } from "./BaseWidget";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePersonalization } from "@/hooks/usePersonalization";

export function JourneyProgressWidget() {
  const { personalizedContent } = usePersonalization();

  // Calculate overall journey progress
  const totalModules = 5; // Goals, Tasks, Quick-todos, Habits, Reflections
  const activeModules = [
    personalizedContent.priorityTasks.length > 0,
    personalizedContent.todayHabits.length > 0,
    personalizedContent.insights.length > 0
  ].filter(Boolean).length;

  const journeyProgress = Math.min((activeModules / totalModules) * 100, 100);

  return (
    <BaseWidget
      title="Journey Progress"
      subtitle="Your productivity evolution"
      icon={<TrendingUp className="h-4 w-4" />}
      size="medium"
      variant="elevated"
    >
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Journey</span>
            <span className="font-bold text-primary">{Math.round(journeyProgress)}%</span>
          </div>
          <Progress value={journeyProgress} className="h-3" />
        </div>

        {/* Celebration Badges */}
        {personalizedContent.streakCelebrations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Celebrations
            </h4>
            <div className="flex flex-wrap gap-2">
              {personalizedContent.streakCelebrations.slice(0, 2).map((celebration, index) => (
                <Badge key={index} variant="default" className="text-xs bg-gradient-primary">
                  <Award className="h-3 w-3 mr-1" />
                  {celebration}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {personalizedContent.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Suggestions
            </h4>
            <div className="space-y-1">
              {personalizedContent.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="text-xs p-2 rounded bg-primary/5 text-primary">
                  💡 {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Check-in */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Continue your journey today</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
