import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
  dayOfMonth?: number;
  endDate?: string;
  maxOccurrences?: number;
  timezone: string;
}

// Fetch all recurring task templates
export const useRecurringTasks = () => {
  return useQuery({
    queryKey: ["recurring-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_recurring", true)
        .is("recurring_template_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });
};

// Fetch instances of a recurring task
export const useRecurringInstances = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ["recurring-instances", templateId],
    queryFn: async () => {
      if (!templateId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
          created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
        `,
        )
        .eq("recurring_template_id", templateId)
        .order("instance_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
};

// Create a recurring task template
export const useCreateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskData,
      pattern,
    }: {
      taskData: Omit<TaskInsert, "created_by" | "workspace_id">;
      pattern: RecurrencePattern;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's default workspace
      const { data: workspace } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!workspace) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          created_by: user.id,
          workspace_id: workspace.workspace_id,
          is_recurring: true,
          recurrence_pattern: pattern as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Recurring task created successfully");
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error creating recurring task:", error);
      toast.error("Failed to create recurring task");
    },
  });
};

// Update recurrence pattern
export const useUpdateRecurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      pattern,
    }: {
      taskId: string;
      pattern: RecurrencePattern;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ recurrence_pattern: pattern as any })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Recurrence pattern updated");
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: (error) => {
      console.error("Error updating recurrence:", error);
      toast.error("Failed to update recurrence pattern");
    },
  });
};

// Convert existing task to recurring
export const useConvertToRecurring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      pattern,
    }: {
      taskId: string;
      pattern: RecurrencePattern;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          is_recurring: true,
          recurrence_pattern: pattern as any,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Task converted to recurring");
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error converting to recurring:", error);
      toast.error("Failed to convert task");
    },
  });
};

// Remove recurrence from task
export const useRemoveRecurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          is_recurring: false,
          recurrence_pattern: null,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Recurrence removed");
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error removing recurrence:", error);
      toast.error("Failed to remove recurrence");
    },
  });
};

// Manually trigger instance generation
export const useGenerateInstances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        "generate_recurring_instances",
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalInstances =
        data?.reduce(
          (sum: number, item: any) => sum + (item.instances_created || 0),
          0,
        ) || 0;
      toast.success(`Generated ${totalInstances} task instances`);
      queryClient.invalidateQueries({ queryKey: ["recurring-instances"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error generating instances:", error);
      toast.error("Failed to generate instances");
    },
  });
};

// Get upcoming instances preview
export const useUpcomingInstances = (
  templateId: string | undefined,
  pattern: RecurrencePattern | undefined,
) => {
  return useQuery({
    queryKey: ["upcoming-instances", templateId, pattern],
    queryFn: async () => {
      if (!templateId || !pattern) return [];

      // Calculate next 5 occurrences locally for preview
      const dates: Date[] = [];
      let currentDate = new Date();

      for (let i = 0; i < 5 && dates.length < 5; i++) {
        const nextDate = calculateNextDate(currentDate, pattern);
        if (!nextDate) break;

        if (pattern.endDate && nextDate > new Date(pattern.endDate)) break;
        if (pattern.maxOccurrences && dates.length >= pattern.maxOccurrences)
          break;

        dates.push(nextDate);
        currentDate = nextDate;
      }

      return dates;
    },
    enabled: !!templateId && !!pattern,
  });
};

// Helper function to calculate next date (client-side preview)
function calculateNextDate(
  fromDate: Date,
  pattern: RecurrencePattern,
): Date | null {
  const next = new Date(fromDate);

  switch (pattern.frequency) {
    case "daily":
      next.setDate(next.getDate() + pattern.interval);
      break;

    case "weekly":
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next matching day of week
        let daysToAdd = 1;
        while (daysToAdd <= 7) {
          const testDate = new Date(fromDate);
          testDate.setDate(testDate.getDate() + daysToAdd);
          if (pattern.daysOfWeek.includes(testDate.getDay())) {
            return testDate;
          }
          daysToAdd++;
        }
      }
      next.setDate(next.getDate() + pattern.interval * 7);
      break;

    case "monthly":
      next.setMonth(next.getMonth() + pattern.interval);
      if (pattern.dayOfMonth) {
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case "yearly":
      next.setFullYear(next.getFullYear() + pattern.interval);
      break;

    default:
      return null;
  }

  return next;
}
