import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, MoreVertical, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHabit, useDeleteHabit, useArchiveHabit } from "@/hooks/useHabits";
import { useHabitEntries } from "@/hooks/useHabitEntries";
import { useHabitStreaks } from "@/hooks/useHabitStreaks";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { HabitAnalytics } from "@/components/habits/HabitAnalytics";
import { StreakDisplay } from "@/components/habits/StreakDisplay";
import { StreakManager } from "@/components/habits/StreakManager";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import { HabitAnalyticsDashboard } from "@/components/habits/HabitAnalyticsDashboard";
import { HabitInsightsEngine } from "@/components/habits/HabitInsightsEngine";
import { StreakAchievements } from "@/components/habits/StreakAchievements";
import { CompletionTrends } from "@/components/habits/CompletionTrends";
import { HabitPerformanceMetrics } from "@/components/habits/HabitPerformanceMetrics";
import { StreakChallenges } from "@/components/habits/StreakChallenges";
import { ProgressExport } from "@/components/habits/ProgressExport";
import { HabitEditForm } from "@/components/habits/HabitEditForm";
import { ReminderManager } from "@/components/habits/ReminderManager";
import { NotificationPermission } from "@/components/habits/NotificationPermission";
import { HabitGoalLinker } from "@/components/habits/HabitGoalLinker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { CreateHabitEntryInput } from "@/types/habits";
import { useCreateEntry } from "@/hooks/useHabitEntries";

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: habit, isLoading } = useHabit(id!);
  const { data: entries } = useHabitEntries(id!);
  const { data: streaks } = useHabitStreaks(id!);
  const deleteHabit = useDeleteHabit();
  const archiveHabit = useArchiveHabit();
  const createEntry = useCreateEntry();

  const todayEntry = entries?.find(e => e.date === format(new Date(), 'yyyy-MM-dd'));

  const handleDelete = () => {
    deleteHabit.mutate(id!, {
      onSuccess: () => {
        toast.success("Habit deleted successfully");
        navigate("/habits");
      },
    });
  };

  const handleArchive = () => {
    archiveHabit.mutate(
      { habitId: id!, archive: !habit?.archived_at },
      {
        onSuccess: () => {
          toast.success(habit?.archived_at ? "Habit restored" : "Habit archived");
          navigate("/habits");
        },
      }
    );
  };

  const handleStatusChange = (status: 'completed' | 'skipped' | 'missed') => {
    if (!id) return;
    
    const input: CreateHabitEntryInput = {
      habit_id: id,
      date: format(new Date(), 'yyyy-MM-dd'),
      status,
    };

    createEntry.mutate(input);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="container mx-auto p-6">
        <p>Habit not found</p>
        <Button onClick={() => navigate("/habits")}>Back to Habits</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/habits")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {habit.icon && <span className="text-2xl">{habit.icon}</span>}
              <h1 className="text-3xl font-bold">{habit.title}</h1>
            </div>
            <p className="text-muted-foreground">{habit.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {habit.archived_at ? "Restore" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge>{habit.category}</Badge>
        <Badge variant="outline">{habit.type}</Badge>
        <Badge variant="outline">{habit.frequency}</Badge>
        <Badge variant="outline">{habit.difficulty}</Badge>
        {habit.time_of_day && <Badge variant="outline">{habit.time_of_day}</Badge>}
      </div>

      {/* Today's Status */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={todayEntry?.status === 'completed' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('completed')}
              disabled={!!todayEntry}
            >
              ✓ Complete
            </Button>
            <Button
              variant={todayEntry?.status === 'skipped' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('skipped')}
              disabled={!!todayEntry}
            >
              Skip
            </Button>
            <Button
              variant={todayEntry?.status === 'missed' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('missed')}
              disabled={!!todayEntry}
            >
              Missed
            </Button>
          </div>
          {todayEntry && (
            <p className="text-sm text-muted-foreground mt-2">
              Marked as {todayEntry.status} {todayEntry.completed_at && `at ${format(new Date(todayEntry.completed_at), 'h:mm a')}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <HabitInsightsEngine habitId={id!} />

      {/* Notification Permission */}
      <NotificationPermission />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HabitHeatmap habitId={id!} habitTitle={habit.title} />
            <CompletionTrends habitId={id!} />
          </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <StreakManager habit={habit} streaks={streaks || []} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <HabitAnalyticsDashboard habitId={id!} />
          <HabitPerformanceMetrics habitId={id!} />
          <ProgressExport habitId={id!} habitTitle={habit.title} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <HabitCalendar 
            habitId={id!} 
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <HabitAnalytics habitId={id!} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <StreakAchievements habit={habit} />
          <StreakChallenges habit={habit} />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <ReminderManager habitId={id!} habitTitle={habit.title} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <HabitGoalLinker habitId={id!} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <HabitEditForm
            habit={habit}
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all its tracking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
