// Project Form Component
// Form for creating and editing projects

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ProjectWithRelations,
  CreateProjectInput,
  UpdateProjectInput,
  PROJECT_DEFAULTS,
  PROJECT_STATUS_CONFIG,
  PROJECT_PRIORITY_CONFIG,
} from "@/types/projects";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectWithRelations;
  onSubmit: (
    data: CreateProjectInput | (UpdateProjectInput & { id: string }),
  ) => void;
  isLoading?: boolean;
}

const PROJECT_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#ec4899", // Pink
  "#6b7280", // Gray
];

const PROJECT_ICONS = [
  "folder",
  "briefcase",
  "target",
  "rocket",
  "lightbulb",
  "star",
  "heart",
  "shield",
  "zap",
  "globe",
];

export function ProjectForm({
  open,
  onOpenChange,
  project,
  onSubmit,
  isLoading = false,
}: ProjectFormProps) {
  const { user } = useAuth();
  const isEditing = !!project;

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: any;
    priority: any;
    visibility: any;
    start_date: string;
    target_date: string;
    estimated_hours: string;
    budget_amount: string;
    color: string;
    icon: string;
    tags: string[];
  }>({
    title: "",
    description: "",
    status: PROJECT_DEFAULTS.status,
    priority: PROJECT_DEFAULTS.priority,
    visibility: PROJECT_DEFAULTS.visibility,
    start_date: "",
    target_date: "",
    estimated_hours: "",
    budget_amount: "",
    color: PROJECT_DEFAULTS.color,
    icon: PROJECT_DEFAULTS.icon,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [targetDateOpen, setTargetDateOpen] = useState(false);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        status: project.status,
        priority: project.priority,
        visibility: project.visibility,
        start_date: project.start_date || "",
        target_date: project.target_date || "",
        estimated_hours: project.estimated_hours?.toString() || "",
        budget_amount: project.budget_amount?.toString() || "",
        color: project.color || PROJECT_DEFAULTS.color,
        icon: project.icon || PROJECT_DEFAULTS.icon,
        tags: project.tags || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: PROJECT_DEFAULTS.status,
        priority: PROJECT_DEFAULTS.priority,
        visibility: PROJECT_DEFAULTS.visibility,
        start_date: "",
        target_date: "",
        estimated_hours: "",
        budget_amount: "",
        color: PROJECT_DEFAULTS.color,
        icon: PROJECT_DEFAULTS.icon,
        tags: [],
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      visibility: formData.visibility,
      start_date: formData.start_date || undefined,
      target_date: formData.target_date || undefined,
      estimated_hours: formData.estimated_hours
        ? parseInt(formData.estimated_hours)
        : undefined,
      budget_amount: formData.budget_amount
        ? parseFloat(formData.budget_amount)
        : undefined,
      color: formData.color,
      icon: formData.icon,
      tags: formData.tags,
    };

    if (isEditing && project) {
      onSubmit({ id: project.id, ...submitData });
    } else {
      onSubmit({ workspace_id: "temp-workspace-id", ...submitData });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter project title..."
                required
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter project description..."
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_CONFIG).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_PRIORITY_CONFIG).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(new Date(formData.start_date), "PPP")
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formData.start_date
                        ? new Date(formData.start_date)
                        : undefined
                    }
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        start_date: date ? format(date, "yyyy-MM-dd") : "",
                      });
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Target Date</Label>
              <Popover open={targetDateOpen} onOpenChange={setTargetDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.target_date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_date ? (
                      format(new Date(formData.target_date), "PPP")
                    ) : (
                      <span>Pick a target date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formData.target_date
                        ? new Date(formData.target_date)
                        : undefined
                    }
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        target_date: date ? format(date, "yyyy-MM-dd") : "",
                      });
                      setTargetDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: e.target.value })
                }
                placeholder="0"
                min="0"
                max="10000"
              />
            </div>

            <div>
              <Label htmlFor="budget_amount">Budget Amount</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) =>
                  setFormData({ ...formData, budget_amount: e.target.value })
                }
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <div>
              <Label>Project Color</Label>
              <div className="flex space-x-2 mt-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      formData.color === color
                        ? "border-gray-900"
                        : "border-gray-300",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Project Icon</Label>
              <div className="flex space-x-2 mt-2 flex-wrap">
                {PROJECT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={cn(
                      "w-10 h-10 rounded border-2 flex items-center justify-center",
                      formData.icon === icon
                        ? "border-gray-900 bg-gray-100"
                        : "border-gray-300",
                    )}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Add a tag..."
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Update Project"
                  : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
