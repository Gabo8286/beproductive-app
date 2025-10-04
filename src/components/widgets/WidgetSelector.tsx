import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Target,
  Clock,
  FileText,
  BarChart,
  Calendar,
  Brain,
  Plus,
} from "lucide-react";

interface AvailableWidget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  isPopular?: boolean;
}

interface WidgetSelectorProps {
  onSelectWidget: (widget: AvailableWidget) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableWidgets: AvailableWidget[] = [
  {
    id: "tasks",
    type: "tasks",
    title: "Tasks",
    description: "Manage your daily tasks and to-dos",
    icon: CheckSquare,
    category: "Productivity",
    isPopular: true,
  },
  {
    id: "goals",
    type: "goals",
    title: "Goals",
    description: "Track progress on your objectives",
    icon: Target,
    category: "Productivity",
    isPopular: true,
  },
  {
    id: "time-tracking",
    type: "time-tracking",
    title: "Time Tracking",
    description: "Monitor time spent on activities",
    icon: Clock,
    category: "Analytics",
  },
  {
    id: "notes",
    type: "notes",
    title: "Quick Notes",
    description: "Capture thoughts and ideas",
    icon: FileText,
    category: "Productivity",
  },
  {
    id: "analytics",
    type: "analytics",
    title: "Analytics",
    description: "View productivity insights",
    icon: BarChart,
    category: "Analytics",
  },
  {
    id: "calendar",
    type: "calendar",
    title: "Calendar",
    description: "View upcoming events",
    icon: Calendar,
    category: "Planning",
  },
  {
    id: "ai-insights",
    type: "ai-insights",
    title: "AI Insights",
    description: "Personalized productivity tips",
    icon: Brain,
    category: "AI",
    isPopular: true,
  },
];

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  onSelectWidget,
  isOpen,
  onOpenChange,
}) => {
  const categories = [...new Set(availableWidgets.map((w) => w.category))];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Widget to Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryWidgets = availableWidgets.filter(
              (w) => w.category === category,
            );

            return (
              <div key={category}>
                <h3 className="font-semibold mb-3 text-lg">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryWidgets.map((widget) => {
                    const IconComponent = widget.icon;

                    return (
                      <Card
                        key={widget.id}
                        className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
                        onClick={() => {
                          onSelectWidget(widget);
                          onOpenChange(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">
                                  {widget.title}
                                </h4>
                                {widget.isPopular && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {widget.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> You can have up to 6 widgets on your
            dashboard. Drag and drop to rearrange them, and click the expand
            icon to view the full module.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
