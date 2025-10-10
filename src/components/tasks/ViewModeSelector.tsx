import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, List, Columns, Calendar, ArrowUpDown, Folder, CheckSquare } from "lucide-react";
import { useTaskView } from "@/contexts/TaskViewContext";

const viewModeIcons = {
  grid: LayoutGrid,
  list: List,
  board: Columns,
  calendar: Calendar,
  projects: Folder,
  status: CheckSquare,
};

export function ViewModeSelector() {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    groupBy,
    setGroupBy,
  } = useTaskView();

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">View Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as any)}
              className="border rounded-md"
            >
              {Object.entries(viewModeIcons).map(([mode, Icon]) => (
                <ToggleGroupItem key={mode} value={mode} size="sm">
                  <Icon className="w-4 h-4" />
                  <span className="ml-1 capitalize">{mode}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as any)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
          </div>

          {/* Group Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Group:</span>
            <Select
              value={groupBy}
              onValueChange={(value) => setGroupBy(value as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
