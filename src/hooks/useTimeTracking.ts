import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  is_manual: boolean;
  description: string | null;
  tags: string[];
  billable: boolean;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveTimer {
  id: string;
  user_id: string;
  task_id: string;
  time_entry_id: string;
  started_at: string;
  paused_duration: number;
  is_paused: boolean;
  paused_at: string | null;
  tasks?: {
    title: string;
  };
}

// Fetch active timer for current user
export const useActiveTimer = () => {
  return useQuery({
    queryKey: ["active-timer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_timers")
        .select(
          `
          *,
          tasks (
            title
          )
        `,
        )
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No active timer, return null
          return null;
        }
        throw error;
      }
      return data as ActiveTimer;
    },
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
};

// Start timer for a task
export const useStartTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase.rpc("start_timer", {
        p_task_id: taskId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer started");
    },
    onError: (error: Error) => {
      toast.error(`Failed to start timer: ${error.message}`);
    },
  });
};

// Stop active timer
export const useStopTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("stop_active_timer");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer stopped");
    },
    onError: (error: Error) => {
      toast.error(`Failed to stop timer: ${error.message}`);
    },
  });
};

// Toggle pause state of active timer
export const useTogglePause = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("toggle_timer_pause");
      if (error) throw error;
      return data; // Returns true if paused, false if resumed
    },
    onSuccess: (isPaused) => {
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      toast.success(isPaused ? "Timer paused" : "Timer resumed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle pause: ${error.message}`);
    },
  });
};

// Fetch time entries for a task or all tasks
export const useTimeEntries = (taskId?: string) => {
  return useQuery({
    queryKey: ["time-entries", taskId],
    queryFn: async () => {
      let query = supabase
        .from("time_entries")
        .select("*")
        .order("start_time", { ascending: false });

      if (taskId) {
        query = query.eq("task_id", taskId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimeEntry[];
    },
  });
};

// Create manual time entry
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      task_id: string;
      start_time: string;
      end_time: string;
      description?: string;
      tags?: string[];
      billable?: boolean;
      hourly_rate?: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Calculate duration in seconds
      const startDate = new Date(entry.start_time);
      const endDate = new Date(entry.end_time);
      const duration = Math.floor(
        (endDate.getTime() - startDate.getTime()) / 1000,
      );

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          ...entry,
          user_id: userData.user.id,
          duration,
          is_manual: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Time entry created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create time entry: ${error.message}`);
    },
  });
};

// Update time entry
export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<TimeEntry> & { id: string }) => {
      // Recalculate duration if start_time or end_time changed
      if (updates.start_time || updates.end_time) {
        const { data: existing } = await supabase
          .from("time_entries")
          .select("start_time, end_time")
          .eq("id", id)
          .single();

        if (existing) {
          const startTime = updates.start_time || existing.start_time;
          const endTime = updates.end_time || existing.end_time;
          if (startTime && endTime) {
            const duration = Math.floor(
              (new Date(endTime).getTime() - new Date(startTime).getTime()) /
                1000,
            );
            updates.duration = duration;
          }
        }
      }

      const { data, error } = await supabase
        .from("time_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Time entry updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update time entry: ${error.message}`);
    },
  });
};

// Delete time entry
export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Time entry deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete time entry: ${error.message}`);
    },
  });
};
