import { Button } from "@/components/ui/button";
import { useTaskTemplates, QuickTaskDefaults } from "@/hooks/useQuickTask";
import { Sparkles } from "lucide-react";

interface TaskTemplateSelectorProps {
  onTemplateSelect: (defaults: QuickTaskDefaults) => void;
}

export function TaskTemplateSelector({
  onTemplateSelect,
}: TaskTemplateSelectorProps) {
  const { data: templates } = useTaskTemplates();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Quick Templates</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.name}
            variant="outline"
            size="sm"
            onClick={() =>
              onTemplateSelect({
                priority: template.priority,
                tags: template.tags,
              })
            }
            className="text-xs"
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
