import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface NotificationSettings {
  id: string;
  user_id: string;
  due_date_reminder_hours: number[];
  overdue_escalation_hours: number[];
  weekly_summary_day: number;
  weekly_summary_time: string;
  in_app_notifications: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  webhook_url: string | null;
  due_date_reminders: boolean;
  overdue_alerts: boolean;
  completion_celebrations: boolean;
  time_tracking_reminders: boolean;
  weekly_summaries: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rule_type: string;
  trigger_conditions: Record<string, any>;
  actions: Record<string, any>;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  task_id: string | null;
  type: string;
  title: string;
  message: string;
  channels: string[];
  delivered_at: string | null;
  read_at: string | null;
  clicked_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  tasks?: {
    title: string;
  };
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  task_id: string | null;
  executed_at: string;
  success: boolean;
  error_message: string | null;
  changes_made: Record<string, any>;
  execution_time_ms: number | null;
}

// Fetch notification settings for current user
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .single();

      if (error) {
        // If no settings exist, return default values
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      return data as NotificationSettings;
    },
  });
};

// Update notification settings
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("notification_settings")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (existing) {
        // Update existing settings
        const { data, error } = await supabase
          .from("notification_settings")
          .update(settings)
          .eq("user_id", userData.user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from("notification_settings")
          .insert({
            ...settings,
            user_id: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      toast.success("Notification settings updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
};

// Fetch automation rules
export const useAutomationRules = () => {
  return useQuery({
    queryKey: ["automation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AutomationRule[];
    },
  });
};

// Create automation rule
export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<AutomationRule>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("automation_rules")
        .insert({
          name: rule.name!,
          description: rule.description || null,
          rule_type: rule.rule_type!,
          workspace_id: rule.workspace_id!,
          trigger_conditions: rule.trigger_conditions || {},
          actions: rule.actions || {},
          is_enabled: rule.is_enabled !== undefined ? rule.is_enabled : true,
          user_id: userData.user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success("Automation rule created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create rule: ${error.message}`);
    },
  });
};

// Update automation rule
export const useUpdateAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AutomationRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success("Automation rule updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update rule: ${error.message}`);
    },
  });
};

// Delete automation rule
export const useDeleteAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automation_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success("Automation rule deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete rule: ${error.message}`);
    },
  });
};

// Fetch notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          tasks (
            title
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Fetch automation logs
export const useAutomationLogs = (ruleId?: string) => {
  return useQuery({
    queryKey: ["automation-logs", ruleId],
    queryFn: async () => {
      let query = supabase
        .from("automation_logs")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (ruleId) {
        query = query.eq("rule_id", ruleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationLog[];
    },
  });
};

// Process automation rules manually
export const useProcessAutomationRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("process_automation_rules");
      if (error) throw error;
      return data;
    },
    onSuccess: (rulesExecuted) => {
      queryClient.invalidateQueries({ queryKey: ["automation-logs"] });
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success(`Processed ${rulesExecuted} automation rules`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to process rules: ${error.message}`);
    },
  });
};
