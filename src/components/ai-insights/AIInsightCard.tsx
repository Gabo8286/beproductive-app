import { AIInsight, INSIGHT_TYPE_LABELS } from "@/types/ai-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Archive, Trash2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AIInsightCardProps {
  insight: AIInsight;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AIInsightCard({ insight, onMarkAsRead, onArchive, onDelete }: AIInsightCardProps) {
  return (
    <Card className={insight.is_read ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">{INSIGHT_TYPE_LABELS[insight.type]}</Badge>
                {insight.confidence_score && (
                  <span className="text-xs">
                    {(insight.confidence_score * 100).toFixed(0)}% confidence
                  </span>
                )}
                <span className="text-xs">
                  {formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!insight.is_read && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMarkAsRead(insight.id)}
                title="Mark as read"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onArchive(insight.id)}
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(insight.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{insight.content}</p>
        {insight.summary && (
          <div className="mt-4 p-3 bg-accent rounded-lg">
            <p className="text-sm font-medium">Summary: {insight.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
