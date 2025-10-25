import { useState } from "react";
import {
  Plus,
  Bell,
  BellOff,
  Trash2,
  Edit,
  Clock,
  MapPin,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useHabitReminders,
  useDeleteReminder,
  useToggleReminder,
} from "@/hooks/useHabitReminders";
import { ReminderForm } from "@/components/habits/ReminderForm";
import { format } from "date-fns";
import { toast } from "sonner";
import { HabitReminder } from "@/types/habits";

interface ReminderManagerProps {
  habitId: string;
  habitTitle: string;
}

export function ReminderManager({ habitId, habitTitle }: ReminderManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HabitReminder | null>(
    null,
  );
  const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);

  const { data: reminders, isLoading } = useHabitReminders(habitId);
  const deleteReminder = useDeleteReminder();
  const toggleReminder = useToggleReminder();

  const handleDelete = () => {
    if (deleteReminderId) {
      deleteReminder.mutate(deleteReminderId, {
        onSuccess: () => {
          setDeleteReminderId(null);
        },
      });
    }
  };

  const handleToggle = (reminderId: string, isActive: boolean) => {
    toggleReminder.mutate({ reminderId, isActive });
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "time_based":
        return <Clock className="h-4 w-4" />;
      case "location_based":
        return <MapPin className="h-4 w-4" />;
      case "trigger_based":
        return <Link2 className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatReminderDetails = (reminder: HabitReminder) => {
    if (reminder.reminder_type === "time_based" && reminder.time) {
      const days = reminder.days_of_week;
      const daysText =
        days && days.length > 0
          ? ` on ${days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}`
          : " daily";
      return `${reminder.time}${daysText}`;
    }

    if (reminder.reminder_type === "location_based" && reminder.location) {
      return reminder.location.name || "Location-based";
    }

    if (
      reminder.reminder_type === "trigger_based" &&
      reminder.trigger_habit_id
    ) {
      return "After another habit";
    }

    return reminder.reminder_type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reminders</h3>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading reminders...
          </CardContent>
        </Card>
      ) : reminders && reminders.length > 0 ? (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getReminderIcon(reminder.reminder_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {reminder.reminder_type.replace("_", " ")}
                        </Badge>
                        {!reminder.is_active && (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {formatReminderDetails(reminder)}
                      </p>
                      {reminder.message && (
                        <p className="text-sm text-muted-foreground">
                          "{reminder.message}"
                        </p>
                      )}
                      {reminder.last_sent_at && (
                        <p className="text-xs text-muted-foreground">
                          Last sent:{" "}
                          {format(
                            new Date(reminder.last_sent_at),
                            "MMM d, h:mm a",
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.is_active}
                      onCheckedChange={(checked) =>
                        handleToggle(reminder.id, checked)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingReminder(reminder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteReminderId(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No reminders set for this habit
            </p>
            <Button onClick={() => setShowCreateDialog(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Reminder
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <ReminderForm
            habitId={habitId}
            habitTitle={habitTitle}
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingReminder}
        onOpenChange={() => setEditingReminder(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <ReminderForm
              habitId={habitId}
              habitTitle={habitTitle}
              reminder={editingReminder}
              onSuccess={() => setEditingReminder(null)}
              onCancel={() => setEditingReminder(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteReminderId}
        onOpenChange={() => setDeleteReminderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reminder. You can always create
              a new one later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
