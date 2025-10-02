import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressEntry } from "@/hooks/useGoalProgress";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Edit, Target, Zap } from "lucide-react";

interface ProgressHistoryProps {
  progressHistory: (ProgressEntry & {
    created_by_profile: { full_name: string; avatar_url: string };
  })[];
}

export function ProgressHistory({ progressHistory }: ProgressHistoryProps) {
  const getChangeIcon = (type: ProgressEntry['change_type']) => {
    switch (type) {
      case 'manual': return <Edit className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'automatic': return <Zap className="h-4 w-4" />;
      case 'sub_goal': return <Target className="h-4 w-4" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getTypeColor = (type: ProgressEntry['change_type']) => {
    switch (type) {
      case 'manual': return "default";
      case 'milestone': return "secondary";
      case 'automatic': return "outline";
      case 'sub_goal': return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress History</CardTitle>
        <CardDescription>
          Complete timeline of all progress updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {progressHistory.length > 0 ? (
          <div className="space-y-4">
            {progressHistory.map((entry) => {
              const change = entry.new_progress - entry.previous_progress;
              return (
                <div key={entry.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {entry.created_by_profile.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {entry.created_by_profile.full_name}
                        </span>
                        <Badge variant={getTypeColor(entry.change_type)}>
                          {getChangeIcon(entry.change_type)}
                          <span className="ml-1 capitalize">{entry.change_type.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">
                        {entry.previous_progress}%
                      </span>
                      <span>→</span>
                      <span className="font-medium">
                        {entry.new_progress}%
                      </span>
                      {change !== 0 && (
                        <span className={`flex items-center ${getChangeColor(change)}`}>
                          {change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-muted-foreground">No progress history yet</p>
            <p className="text-sm text-muted-foreground">
              Progress updates will appear here as you track your goal
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
