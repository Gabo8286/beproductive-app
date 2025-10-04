import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, X } from "lucide-react";
import {
  useTaskTemplates,
  useTemplateCategories,
  useDeleteTemplate,
} from "@/hooks/useTaskTemplates";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  "Project Management",
  "Development",
  "Marketing",
  "Sales",
  "Operations",
  "Personal",
  "Meeting Prep",
  "Review Process",
];

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [showSelector, setShowSelector] = useState(false);

  const { data: templates, isLoading } = useTaskTemplates(selectedCategory);
  const { data: existingCategories } = useTemplateCategories();
  const deleteTemplate = useDeleteTemplate();

  const allCategories = [
    ...new Set([...DEFAULT_CATEGORIES, ...(existingCategories || [])]),
  ];

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate.mutate(id);
    }
  };

  const handleTaskCreated = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable task templates for common workflows
          </p>
        </div>
        <Button onClick={() => setShowSelector(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create from Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {allCategories && allCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Categories</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={!selectedCategory ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  All
                </Badge>
                {allCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                    {selectedCategory === category && (
                      <X
                        className="ml-1 h-3 w-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(undefined);
                        }}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => navigate(`/templates/${template.id}`)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No templates yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {search
                    ? "No templates match your search. Try different keywords or clear filters."
                    : "Create your first template to quickly generate tasks with predefined settings."}
                </p>
              </div>
              {search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : (
                <Button onClick={() => navigate("/tasks")}>Go to Tasks</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <TemplateSelector
        open={showSelector}
        onOpenChange={setShowSelector}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
}
