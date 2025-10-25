import { useNavigate } from "react-router-dom";
import { MoreVertical, Archive, Copy, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteHabit,
  useArchiveHabit,
  useDuplicateHabit,
} from "@/hooks/useHabits";
import { useCreateEntry } from "@/hooks/useHabitEntries";
import { HabitWithStats, CreateHabitEntryInput } from "@/types/habits";
import { ProgressRing } from "@/components/habits/ProgressRing";
import { format } from "date-fns";
import { toast } from "sonner";

interface HabitCardProps {
  habit: HabitWithStats;
  viewMode: "grid" | "list";
}

export function HabitCard({ habit, viewMode }: HabitCardProps) {
  const navigate = useNavigate();
  const deleteHabit = useDeleteHabit();
  const archiveHabit = useArchiveHabit();
  const duplicateHabit = useDuplicateHabit();
  const createEntry = useCreateEntry();

  const todayEntry = habit.today_entry;
  const completionRate = habit.completion_rate || 0;

  const handleQuickComplete = (
    e: React.MouseEvent,
    status: "completed" | "skipped",
  ) => {
    e.stopPropagation();

    const input: CreateHabitEntryInput = {
      habit_id: habit.id,
      date: format(new Date(), "yyyy-MM-dd"),
      status,
    };

    createEntry.mutate(input);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveHabit.mutate({ habitId: habit.id, archive: !habit.archived_at });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateHabit.mutate(habit.id, {
      onSuccess: () => toast.success("Habit duplicated successfully"),
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit.mutate(habit.id);
    }
  };

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {habit.icon && <span className="text-2xl">{habit.icon}</span>}
          <div>
            <h3 className="font-semibold">{habit.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {habit.description}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {habit.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {habit.frequency}
          </Badge>
        </div>

        {/* Progress Ring and Stats */}
        <div className="flex items-center justify-between">
          <ProgressRing value={completionRate} size={60} />
          <div className="text-right">
            <div className="text-2xl font-bold">{habit.current_streak} 🔥</div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
        </div>

        {/* Today's Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Today</p>
          {todayEntry ? (
            <Badge variant="default" className="w-full justify-center">
              {todayEntry.status === "completed" && "✓ Completed"}
              {todayEntry.status === "skipped" && "Skipped"}
              {todayEntry.status === "missed" && "Missed"}
            </Badge>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => handleQuickComplete(e, "completed")}
              >
                ✓ Done
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => handleQuickComplete(e, "skipped")}
              >
                Skip
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );

  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/habits/${habit.id}`)}
      >
        <div className="flex items-center p-4">
          {habit.icon && <span className="text-2xl mr-4">{habit.icon}</span>}
          <div className="flex-1">
            <h3 className="font-semibold">{habit.title}</h3>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </div>
          <div className="flex items-center gap-4 mr-4">
            <ProgressRing value={completionRate} size={40} />
            <div className="text-center">
              <div className="font-bold">{habit.current_streak} 🔥</div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/habits/${habit.id}`)}
    >
      {cardContent}
    </Card>
  );
}
