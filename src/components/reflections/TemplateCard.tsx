import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import type { SystemTemplate } from "@/utils/systemTemplates";

interface TemplateCardProps {
  template: SystemTemplate;
  onSelect: () => void;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const categoryIcons: Record<string, string> = {
  daily: "📅",
  weekly: "📊",
  monthly: "📈",
  goal_review: "🎯",
  habit_review: "⚡",
  personal: "👤",
  professional: "💼",
};

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{categoryIcons[template.category] || "📝"}</span>
            <h3 className="font-semibold text-lg">{template.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className={difficultyColors[template.difficulty]}>
          {template.difficulty}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {template.estimatedMinutes} min
        </Badge>
        <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {template.prompts.length} prompts
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {template.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{template.tags.length - 3}
          </Badge>
        )}
      </div>

      <Button onClick={onSelect} className="w-full" size="sm">
        Use Template
      </Button>
    </Card>
  );
}
