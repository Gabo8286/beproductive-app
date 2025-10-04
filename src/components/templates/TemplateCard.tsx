import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { TemplateConfig } from "@/hooks/useTaskTemplates";

type TaskTemplate = Database["public"]["Tables"]["task_templates"]["Row"];

interface TemplateCardProps {
  template: TaskTemplate;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function TemplateCard({
  template,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateCardProps) {
  const config = template.template_config as unknown as TemplateConfig;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1" onClick={onSelect}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-1">
                {template.name}
              </CardTitle>
              {template.description && (
                <CardDescription className="text-sm line-clamp-2 mt-1">
                  {template.description}
                </CardDescription>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent onClick={onSelect}>
        <div className="flex items-center gap-2 flex-wrap">
          {template.category && (
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          )}
          {config.priority && (
            <Badge variant="secondary" className="text-xs">
              {config.priority}
            </Badge>
          )}
          {config.tags && config.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {config.tags.length} tag{config.tags.length > 1 ? "s" : ""}
            </Badge>
          )}
          {config.subtasks && config.subtasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {config.subtasks.length} subtask
              {config.subtasks.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Used {template.usage_count} times</span>
          {template.is_public && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
