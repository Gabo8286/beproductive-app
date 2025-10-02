import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateReminder, useUpdateReminder } from "@/hooks/useHabitReminders";
import { HabitReminder, ReminderType } from "@/types/habits";

const reminderSchema = z.object({
  reminder_type: z.enum(['time_based', 'location_based', 'trigger_based']),
  time: z.string().optional(),
  days_of_week: z.array(z.number()).optional(),
  message: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  habitId: string;
  habitTitle: string;
  reminder?: HabitReminder;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const QUICK_TIMES = [
  { label: 'Morning (8:00 AM)', value: '08:00' },
  { label: 'Noon (12:00 PM)', value: '12:00' },
  { label: 'Afternoon (3:00 PM)', value: '15:00' },
  { label: 'Evening (6:00 PM)', value: '18:00' },
  { label: 'Night (9:00 PM)', value: '21:00' },
];

export function ReminderForm({ habitId, habitTitle, reminder, onSuccess, onCancel }: ReminderFormProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(reminder?.days_of_week || []);
  
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      reminder_type: reminder?.reminder_type || 'time_based',
      time: reminder?.time || '09:00',
      days_of_week: reminder?.days_of_week || [],
      message: reminder?.message || '',
    },
  });

  const reminderType = form.watch('reminder_type');

  const onSubmit = (data: ReminderFormValues) => {
    const reminderData = {
      habit_id: habitId,
      reminder_type: data.reminder_type as ReminderType,
      time: data.reminder_type === 'time_based' ? data.time : undefined,
      days_of_week: data.reminder_type === 'time_based' ? selectedDays : undefined,
      message: data.message,
      is_active: true,
    };

    if (reminder) {
      updateReminder.mutate(
        { id: reminder.id, ...reminderData },
        { onSuccess }
      );
    } else {
      createReminder.mutate(reminderData, { onSuccess });
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reminder_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="time_based">Time-Based</SelectItem>
                  <SelectItem value="location_based" disabled>
                    Location-Based (Coming Soon)
                  </SelectItem>
                  <SelectItem value="trigger_based" disabled>
                    Trigger-Based (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {reminderType === 'time_based' && (
          <>
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TIMES.map((quickTime) => (
                        <Button
                          key={quickTime.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange(quickTime.value)}
                        >
                          {quickTime.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Days of Week</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {selectedDays.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Select at least one day, or leave empty for daily reminders
                </p>
              )}
            </FormItem>
          </>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Time to work on ${habitTitle}!`}
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Customize the notification message for this reminder
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createReminder.isPending || updateReminder.isPending}
          >
            {reminder ? 'Update' : 'Create'} Reminder
          </Button>
        </div>
      </form>
    </Form>
  );
}
