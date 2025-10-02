import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HabitReminder, CreateHabitReminderInput, UpdateHabitReminderInput } from "@/types/habits";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitReminderKeys = {
  all: ['habit-reminders'] as const,
  lists: () => [...habitReminderKeys.all, 'list'] as const,
  list: (habitId: string) => [...habitReminderKeys.lists(), habitId] as const,
  upcoming: (workspaceId: string) => [...habitReminderKeys.all, 'upcoming', workspaceId] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get reminders for a habit
 */
export function useHabitReminders(habitId: string) {
  return useQuery({
    queryKey: habitReminderKeys.list(habitId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_reminders')
        .select('*')
        .eq('habit_id', habitId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as HabitReminder[];
    },
    enabled: !!habitId,
  });
}

/**
 * Get upcoming reminders for workspace
 */
export function useUpcomingReminders(workspaceId: string) {
  return useQuery({
    queryKey: habitReminderKeys.upcoming(workspaceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_reminders')
        .select(`
          *,
          habit:habits!inner(*)
        `)
        .eq('habit.workspace_id', workspaceId)
        .eq('is_active', true)
        .order('time', { ascending: true });

      if (error) throw error;
      return data as unknown as (HabitReminder & { habit: any })[];
    },
    enabled: !!workspaceId,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a habit reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHabitReminderInput) => {
      // Validation
      if (input.reminder_type === 'time_based' && !input.time) {
        throw new Error('Time is required for time-based reminders');
      }
      if (input.reminder_type === 'location_based' && !input.location) {
        throw new Error('Location is required for location-based reminders');
      }
      if (input.reminder_type === 'trigger_based' && !input.trigger_habit_id) {
        throw new Error('Trigger habit is required for trigger-based reminders');
      }

      const reminderData = {
        ...input,
        location: input.location as any,
      };

      const { data, error } = await supabase
        .from('habit_reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HabitReminder;
    },
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.list(reminder.habit_id) });
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.upcoming(reminder.habit_id) });
      toast.success("Reminder created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create reminder");
      console.error('Create reminder error:', error);
    },
  });
}

/**
 * Update a habit reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateHabitReminderInput & { id: string }) => {
      const updateData = {
        ...input,
        location: input.location as any,
      };

      const { data, error } = await supabase
        .from('habit_reminders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HabitReminder;
    },
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.list(reminder.habit_id) });
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.upcoming(reminder.habit_id) });
      toast.success("Reminder updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update reminder");
      console.error('Update reminder error:', error);
    },
  });
}

/**
 * Delete a habit reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      // Get reminder first to access habit_id for cache invalidation
      const { data: reminder } = await supabase
        .from('habit_reminders')
        .select('habit_id')
        .eq('id', reminderId)
        .single();

      const { error } = await supabase
        .from('habit_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      return reminder?.habit_id;
    },
    onSuccess: (habitId) => {
      if (habitId) {
        queryClient.invalidateQueries({ queryKey: habitReminderKeys.list(habitId) });
        queryClient.invalidateQueries({ queryKey: habitReminderKeys.upcoming(habitId) });
      }
      toast.success("Reminder deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete reminder");
      console.error('Delete reminder error:', error);
    },
  });
}

/**
 * Snooze a reminder (update last_sent_at to delay next notification)
 */
export function useSnoozeReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reminderId, 
      snoozeMinutes = 30 
    }: { 
      reminderId: string; 
      snoozeMinutes?: number;
    }) => {
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + snoozeMinutes);

      const { data, error } = await supabase
        .from('habit_reminders')
        .update({ last_sent_at: snoozeUntil.toISOString() })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HabitReminder;
    },
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.list(reminder.habit_id) });
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.upcoming(reminder.habit_id) });
      toast.success("Reminder snoozed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to snooze reminder");
      console.error('Snooze reminder error:', error);
    },
  });
}

/**
 * Toggle reminder active state
 */
export function useToggleReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reminderId, 
      isActive 
    }: { 
      reminderId: string; 
      isActive: boolean;
    }) => {
      const { data, error } = await supabase
        .from('habit_reminders')
        .update({ is_active: isActive })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HabitReminder;
    },
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.list(reminder.habit_id) });
      queryClient.invalidateQueries({ queryKey: habitReminderKeys.upcoming(reminder.habit_id) });
      toast.success(reminder.is_active ? "Reminder enabled" : "Reminder disabled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle reminder");
      console.error('Toggle reminder error:', error);
    },
  });
}
