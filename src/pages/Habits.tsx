import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHabits } from "@/hooks/useHabits";
import { useTodayEntries } from "@/hooks/useHabitEntries";
import { useAuth } from "@/contexts/AuthContext";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitFilters } from "@/components/habits/HabitFilters";
import { HabitEmpty } from "@/components/habits/HabitEmpty";
import { TodayTracker } from "@/components/habits/TodayTracker";
import { StreakLeaderboard } from "@/components/habits/StreakLeaderboard";
import { HabitCreateForm } from "@/components/habits/HabitCreateForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HabitCategory,
  HabitType,
  HabitFrequency,
  HabitDifficulty,
  HabitSortBy,
} from "@/types/habits";
import { Skeleton } from "@/components/ui/skeleton";

export default function Habits() {
  const { user } = useAuth();
  const workspaceId = user?.id || "";

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: undefined as HabitCategory | undefined,
    type: undefined as HabitType | undefined,
    frequency: undefined as HabitFrequency | undefined,
    difficulty: undefined as HabitDifficulty | undefined,
    search: "",
    archived: false,
  });
  const [sortBy, setSortBy] = useState<HabitSortBy>("position");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: habits, isLoading } = useHabits(workspaceId, filters, sortBy);
  const { data: todayEntries } = useTodayEntries(workspaceId);

  const activeHabits = habits?.filter((h) => !h.archived_at) || [];
  const totalStreakDays = activeHabits.reduce(
    (sum, h) => sum + h.current_streak,
    0,
  );
  const todayCompletionRate = todayEntries?.length
    ? (todayEntries.filter((e) => e.status === "completed").length /
        todayEntries.length) *
      100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground">
            Build better habits, one day at a time
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Habit
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeHabits.length}</div>
            <p className="text-sm text-muted-foreground">Active Habits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalStreakDays} 🔥</div>
            <p className="text-sm text-muted-foreground">Total Streak Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {todayCompletionRate.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground">Today's Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {activeHabits.filter((h) => h.current_streak >= 7).length}
            </div>
            <p className="text-sm text-muted-foreground">Week+ Streaks</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tracker */}
      <TodayTracker workspaceId={workspaceId} />

      {/* Streak Leaderboard */}
      {activeHabits.length > 0 && (
        <StreakLeaderboard workspaceId={workspaceId} />
      )}

      {/* Filters */}
      <HabitFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Habits List/Grid */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeHabits.length === 0 ? (
        <HabitEmpty onCreateClick={() => setShowCreateDialog(true)} />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {activeHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <HabitCreateForm
            workspaceId={workspaceId}
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
