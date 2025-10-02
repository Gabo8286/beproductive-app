import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, Clock, TrendingUp, Calendar, Target, Zap } from "lucide-react";
import { SYSTEM_TEMPLATES, getTemplatesByCategory } from "@/utils/systemTemplates";
import type { SystemTemplate } from "@/utils/systemTemplates";
import type { TemplateCategory } from "@/types/reflections";
import TemplateCard from "./TemplateCard";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SystemTemplate) => void;
}

export default function TemplateSelector({ open, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");

  const filteredTemplates = SYSTEM_TEMPLATES.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: SystemTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const categories = [
    { value: "all" as const, label: "All Templates", icon: Sparkles },
    { value: "daily" as const, label: "Daily", icon: Clock },
    { value: "weekly" as const, label: "Weekly", icon: Calendar },
    { value: "monthly" as const, label: "Monthly", icon: TrendingUp },
    { value: "goal_review" as const, label: "Goal Review", icon: Target },
    { value: "habit_review" as const, label: "Habit Review", icon: Zap },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose a Reflection Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[500px] pr-4">
              <div className="grid gap-4 md:grid-cols-2 pt-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.name}
                    template={template}
                    onSelect={() => handleSelectTemplate(template)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No templates found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
