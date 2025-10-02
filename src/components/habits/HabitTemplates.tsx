import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabitTemplates } from "@/hooks/useHabitTemplates";
import { HabitTemplate } from "@/types/habits";
import { Sparkles } from "lucide-react";

interface HabitTemplatesProps {
  onSelect: (template: HabitTemplate) => void;
}

export function HabitTemplates({ onSelect }: HabitTemplatesProps) {
  const { data: templates, isLoading } = useHabitTemplates();

  const categories = [
    'health',
    'productivity',
    'learning',
    'mindfulness',
    'social',
    'financial',
    'creative',
    'other',
  ] as const;

  const getTemplatesByCategory = (category: string) => {
    return templates?.filter(t => t.category === category) || [];
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const categoryTemplates = getTemplatesByCategory(category);
        if (categoryTemplates.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {template.icon && <span className="text-2xl">{template.icon}</span>}
                        <CardTitle className="text-base">{template.title}</CardTitle>
                      </div>
                      {template.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{template.frequency}</Badge>
                      <Badge variant="outline" className="text-xs">{template.difficulty}</Badge>
                      {template.duration_minutes && (
                        <Badge variant="outline" className="text-xs">
                          {template.duration_minutes} min
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onSelect(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
