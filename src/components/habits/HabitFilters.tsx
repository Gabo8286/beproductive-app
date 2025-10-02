import { Search, Grid, List, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HabitCategory, HabitType, HabitFrequency, HabitDifficulty, HabitSortBy } from "@/types/habits";

interface HabitFiltersProps {
  filters: {
    category?: HabitCategory;
    type?: HabitType;
    frequency?: HabitFrequency;
    difficulty?: HabitDifficulty;
    search: string;
    archived: boolean;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: HabitSortBy;
  onSortChange: (sort: HabitSortBy) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function HabitFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: HabitFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and View Mode */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.category}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value as HabitCategory })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, type: value as HabitType })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="build">Build</SelectItem>
            <SelectItem value="break">Break</SelectItem>
            <SelectItem value="maintain">Maintain</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.frequency}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, frequency: value as HabitFrequency })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, difficulty: value as HabitDifficulty })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="extreme">Extreme</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as HabitSortBy)}>
          <SelectTrigger className="w-[150px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="position">Position</SelectItem>
            <SelectItem value="streak">Streak</SelectItem>
            <SelectItem value="completion_rate">Completion Rate</SelectItem>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Switch
            id="archived"
            checked={filters.archived}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, archived: checked })
            }
          />
          <Label htmlFor="archived">Show Archived</Label>
        </div>
      </div>
    </div>
  );
}
