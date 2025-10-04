import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useReflections } from "@/hooks/useReflections";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, MessageSquare, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContentAnalyticsProps {
  workspaceId: string;
}

export default function ContentAnalytics({
  workspaceId,
}: ContentAnalyticsProps) {
  const { data: reflections, isLoading } = useReflections(workspaceId, {});

  const analytics = useMemo(() => {
    if (!reflections) return null;

    // Calculate tag frequency
    const tagCount: Record<string, number> = {};
    let totalWords = 0;
    let totalGratitude = 0;
    let totalWins = 0;
    let totalLearnings = 0;

    reflections.forEach((reflection) => {
      // Count tags
      reflection.tags?.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });

      // Count content metrics
      totalWords += reflection.content.split(/\s+/).length;
      totalGratitude += reflection.gratitude_items?.length || 0;
      totalWins += reflection.wins?.length || 0;
      totalLearnings += reflection.learnings?.length || 0;
    });

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalReflections: reflections.length,
      avgWordCount: Math.round(totalWords / reflections.length),
      topTags,
      totalGratitude,
      totalWins,
      totalLearnings,
    };
  }, [reflections]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Content Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Themes and patterns in your reflections
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Avg Words</p>
            </div>
            <p className="text-2xl font-bold">{analytics.avgWordCount}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Wins</p>
            </div>
            <p className="text-2xl font-bold">{analytics.totalWins}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Learnings</p>
            </div>
            <p className="text-2xl font-bold">{analytics.totalLearnings}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <h4 className="font-semibold text-sm">Top Themes</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.map(({ tag, count }) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <span className="text-xs text-muted-foreground">({count})</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
