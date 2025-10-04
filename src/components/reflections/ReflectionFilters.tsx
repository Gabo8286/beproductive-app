import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type {
  ReflectionFilters as Filters,
  ReflectionType,
  MoodLevel,
} from "@/types/reflections";
import { cn } from "@/lib/utils";

interface ReflectionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function ReflectionFilters({
  filters,
  onFiltersChange,
}: ReflectionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined,
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined,
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      reflection_type: type === "all" ? undefined : (type as ReflectionType),
    });
  };

  const handleMoodChange = (mood: string) => {
    onFiltersChange({
      ...filters,
      mood: mood === "all" ? undefined : (mood as MoodLevel),
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({
      ...filters,
      date_from: date ? format(date, "yyyy-MM-dd") : undefined,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({
      ...filters,
      date_to: date ? format(date, "yyyy-MM-dd") : undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.reflection_type ||
    filters.mood ||
    filters.date_from ||
    filters.date_to ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reflections..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.reflection_type || "all"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="goal">Goal</SelectItem>
            <SelectItem value="habit">Habit</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Mood Filter */}
        <Select value={filters.mood || "all"} onValueChange={handleMoodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            <SelectItem value="amazing">🤩 Amazing</SelectItem>
            <SelectItem value="great">😊 Great</SelectItem>
            <SelectItem value="good">🙂 Good</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="bad">😔 Bad</SelectItem>
            <SelectItem value="terrible">😢 Terrible</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  className={cn("pointer-events-auto")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  className={cn("pointer-events-auto")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.reflection_type && (
            <Badge variant="secondary">
              Type: {filters.reflection_type}
              <button className="ml-2" onClick={() => handleTypeChange("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.mood && (
            <Badge variant="secondary">
              Mood: {filters.mood}
              <button className="ml-2" onClick={() => handleMoodChange("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.date_from && (
            <Badge variant="secondary">
              From: {format(new Date(filters.date_from), "MMM d, yyyy")}
              <button
                className="ml-2"
                onClick={() => handleDateFromChange(undefined)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.date_to && (
            <Badge variant="secondary">
              To: {format(new Date(filters.date_to), "MMM d, yyyy")}
              <button
                className="ml-2"
                onClick={() => handleDateToChange(undefined)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
