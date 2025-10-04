import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Integration,
  IntegrationProvider,
  IntegrationTemplate,
  SyncLog,
  WebhookEndpoint,
  IntegrationAnalytics,
  IntegrationType,
  IntegrationStatus,
  CustomIntegration,
} from "@/types/integrations";

export const useIntegrations = (status?: IntegrationStatus) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["integrations", user?.id, status],
    queryFn: async (): Promise<Integration[]> => {
      if (!user?.id) throw new Error("Authentication required");

      // Mock integrations data - in production this would be real API calls
      const mockIntegrations: Integration[] = [
        {
          id: "1",
          user_id: user.id,
          workspace_id: user.id,
          provider_id: "slack",
          name: "Slack Workspace",
          description: "Main company Slack for notifications",
          status: "active",
          auth_data: {
            auth_type: "oauth2",
            access_token: "xoxb-...",
            scopes: ["chat:write", "channels:read"],
            user_info: {
              id: "U123456",
              email: "user@company.com",
              name: "John Doe",
            },
          },
          configuration: {
            enabled_features: ["task_notifications", "goal_updates"],
            field_mappings: [
              {
                source_field: "task.title",
                target_field: "message.text",
                required: true,
              },
            ],
            filters: [],
            transformations: [],
            error_handling: {
              retry_attempts: 3,
              retry_delay_seconds: 5,
              ignore_errors: false,
              alert_on_failure: true,
            },
            notification_settings: {
              success_notifications: false,
              error_notifications: true,
              daily_summary: true,
              email_notifications: true,
            },
          },
          sync_settings: {
            frequency: "real_time",
            direction: "outbound",
            auto_sync: true,
            batch_size: 50,
            sync_history_retention_days: 30,
          },
          last_sync_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_stats: {
            total_syncs: 247,
            successful_syncs: 243,
            failed_syncs: 4,
            last_24h_syncs: 15,
            data_transferred_mb: 2.3,
            api_calls_this_month: 1205,
            rate_limit_hits: 0,
            average_sync_time_ms: 150,
          },
        },
        {
          id: "2",
          user_id: user.id,
          workspace_id: user.id,
          provider_id: "google_workspace",
          name: "Google Calendar",
          description: "Sync tasks and goals with calendar events",
          status: "active",
          auth_data: {
            auth_type: "oauth2",
            access_token: "ya29...",
            refresh_token: "1//...",
            scopes: ["calendar.readonly", "calendar.events"],
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            user_info: {
              id: "123456789",
              email: "user@gmail.com",
              name: "John Doe",
            },
          },
          configuration: {
            enabled_features: ["calendar_sync", "deadline_reminders"],
            field_mappings: [
              {
                source_field: "task.title",
                target_field: "event.summary",
                required: true,
              },
              {
                source_field: "task.due_date",
                target_field: "event.start.dateTime",
                required: true,
              },
            ],
            filters: [
              {
                field: "task.priority",
                operator: "in",
                value: ["high", "critical"],
              },
            ],
            transformations: [],
            error_handling: {
              retry_attempts: 3,
              retry_delay_seconds: 10,
              ignore_errors: false,
              alert_on_failure: true,
            },
            notification_settings: {
              success_notifications: false,
              error_notifications: true,
              daily_summary: false,
              email_notifications: true,
            },
          },
          sync_settings: {
            frequency: "every_15_minutes",
            direction: "bi_directional",
            auto_sync: true,
            batch_size: 25,
            sync_history_retention_days: 30,
          },
          last_sync_at: new Date(Date.now() - 900000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_stats: {
            total_syncs: 156,
            successful_syncs: 152,
            failed_syncs: 4,
            last_24h_syncs: 96,
            data_transferred_mb: 5.7,
            api_calls_this_month: 2340,
            rate_limit_hits: 2,
            average_sync_time_ms: 2300,
          },
        },
      ];

      return status
        ? mockIntegrations.filter((i) => i.status === status)
        : mockIntegrations;
    },
    enabled: !!user?.id && !authLoading,
  });
};

export const useIntegrationProviders = () => {
  return useQuery({
    queryKey: ["integration-providers"],
    queryFn: async (): Promise<IntegrationProvider[]> => {
      // Mock providers data
      const mockProviders: IntegrationProvider[] = [
        {
          id: "slack",
          name: "Slack",
          description: "Team communication and collaboration platform",
          category: "communication",
          icon_url: "/integrations/slack.svg",
          documentation_url: "https://api.slack.com",
          auth_type: "oauth2",
          supported_features: [
            {
              id: "notifications",
              name: "Notifications",
              description: "Send notifications to Slack channels",
              supported_actions: ["send_message", "create_channel"],
              supported_triggers: ["task_completed", "goal_achieved"],
              data_mapping: {},
              requires_premium: false,
            },
          ],
          rate_limits: {
            requests_per_minute: 50,
            requests_per_hour: 1000,
            requests_per_day: 10000,
          },
          webhooks_supported: true,
          real_time_sync: true,
          bi_directional: false,
          enterprise_features: [
            "SAML SSO",
            "Enterprise Grid",
            "Advanced Security",
          ],
          pricing_tier: "free",
        },
        {
          id: "google_workspace",
          name: "Google Workspace",
          description: "Google's suite of productivity tools",
          category: "productivity",
          icon_url: "/integrations/google.svg",
          documentation_url: "https://developers.google.com/workspace",
          auth_type: "oauth2",
          supported_features: [
            {
              id: "calendar_sync",
              name: "Calendar Sync",
              description: "Sync tasks and goals with Google Calendar",
              supported_actions: [
                "create_event",
                "update_event",
                "delete_event",
              ],
              supported_triggers: ["event_created", "event_updated"],
              data_mapping: {},
              requires_premium: false,
            },
          ],
          rate_limits: {
            requests_per_minute: 100,
            requests_per_hour: 1000,
            requests_per_day: 20000,
          },
          webhooks_supported: true,
          real_time_sync: true,
          bi_directional: true,
          enterprise_features: ["Admin Console", "Vault", "Cloud Identity"],
          pricing_tier: "premium",
        },
        {
          id: "microsoft_teams",
          name: "Microsoft Teams",
          description: "Microsoft's collaboration platform",
          category: "communication",
          icon_url: "/integrations/teams.svg",
          documentation_url: "https://docs.microsoft.com/graph",
          auth_type: "oauth2",
          supported_features: [
            {
              id: "teams_notifications",
              name: "Teams Notifications",
              description: "Send notifications to Microsoft Teams",
              supported_actions: ["send_message", "create_meeting"],
              supported_triggers: ["task_assigned", "deadline_approaching"],
              data_mapping: {},
              requires_premium: false,
            },
          ],
          rate_limits: {
            requests_per_minute: 60,
            requests_per_hour: 2000,
            requests_per_day: 15000,
          },
          webhooks_supported: true,
          real_time_sync: true,
          bi_directional: false,
          enterprise_features: ["Azure AD Integration", "Information Barriers"],
          pricing_tier: "premium",
        },
      ];

      return mockProviders;
    },
  });
};

export const useCreateIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationData: Partial<Integration>) => {
      // Mock API call
      console.log("Creating integration:", integrationData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        id: Date.now().toString(),
        ...integrationData,
        status: "pending" as IntegrationStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Integration>;
    }) => {
      console.log("Updating integration:", id, updates);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting integration:", id);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    },
  });
};

export const useTestIntegration = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      console.log("Testing integration:", integrationId);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock test results
      return {
        success: Math.random() > 0.2, // 80% success rate
        response_time: Math.floor(Math.random() * 1000) + 100,
        error_message: Math.random() > 0.8 ? "Connection timeout" : undefined,
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Test Successful",
          description: `Connection test passed (${result.response_time}ms)`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.error_message || "Connection test failed",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test integration",
        variant: "destructive",
      });
    },
  });
};

export const useSyncIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      console.log("Triggering sync for integration:", integrationId);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        sync_id: Date.now().toString(),
        records_processed: Math.floor(Math.random() * 100) + 10,
        records_successful: Math.floor(Math.random() * 95) + 5,
        duration_ms: Math.floor(Math.random() * 2000) + 500,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Sync Complete",
        description: `Processed ${result.records_processed} records in ${result.duration_ms}ms`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync integration",
        variant: "destructive",
      });
    },
  });
};

export const useIntegrationAnalytics = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["integration-analytics", user?.id],
    queryFn: async (): Promise<IntegrationAnalytics> => {
      if (!user?.id) throw new Error("Authentication required");

      // Mock analytics data
      const mockAnalytics: IntegrationAnalytics = {
        overview: {
          total_integrations: 5,
          active_integrations: 4,
          total_syncs_today: 142,
          success_rate: 0.96,
          data_volume_mb: 12.5,
        },
        by_provider: [
          {
            provider_id: "slack",
            integration_count: 2,
            sync_count: 67,
            success_rate: 0.98,
            avg_response_time_ms: 150,
          },
          {
            provider_id: "google_workspace",
            integration_count: 1,
            sync_count: 48,
            success_rate: 0.94,
            avg_response_time_ms: 850,
          },
          {
            provider_id: "microsoft_teams",
            integration_count: 1,
            sync_count: 27,
            success_rate: 0.92,
            avg_response_time_ms: 420,
          },
        ],
        usage_trends: [
          {
            date: "2024-01-01",
            sync_count: 120,
            success_rate: 0.95,
            data_volume_mb: 8.2,
            api_calls: 450,
          },
          {
            date: "2024-01-02",
            sync_count: 135,
            success_rate: 0.97,
            data_volume_mb: 9.1,
            api_calls: 523,
          },
          {
            date: "2024-01-03",
            sync_count: 142,
            success_rate: 0.96,
            data_volume_mb: 12.5,
            api_calls: 612,
          },
        ],
        error_analysis: [
          {
            error_type: "Rate Limit Exceeded",
            count: 3,
            affected_integrations: ["google_workspace"],
            first_occurrence: "2024-01-02T10:30:00Z",
            last_occurrence: "2024-01-03T14:15:00Z",
          },
          {
            error_type: "Authentication Failed",
            count: 1,
            affected_integrations: ["microsoft_teams"],
            first_occurrence: "2024-01-03T09:20:00Z",
            last_occurrence: "2024-01-03T09:20:00Z",
          },
        ],
      };

      return mockAnalytics;
    },
    enabled: !!user?.id && !authLoading,
  });
};

export const useIntegrationTemplates = () => {
  return useQuery({
    queryKey: ["integration-templates"],
    queryFn: async (): Promise<IntegrationTemplate[]> => {
      // Mock templates
      const mockTemplates: IntegrationTemplate[] = [
        {
          id: "slack-task-notifications",
          name: "Slack Task Notifications",
          description:
            "Get notified in Slack when tasks are completed or overdue",
          provider_id: "slack",
          category: "notifications",
          use_case: "Stay updated on task progress without checking the app",
          popularity_score: 0.92,
          configuration_template: {
            enabled_features: ["task_notifications", "overdue_alerts"],
            notification_settings: {
              success_notifications: false,
              error_notifications: true,
              daily_summary: true,
              email_notifications: false,
            },
          },
          required_features: ["chat:write"],
          setup_instructions: [
            "Connect your Slack workspace",
            "Choose channels for notifications",
            "Configure notification types",
            "Test the integration",
          ],
          estimated_setup_time_minutes: 5,
          created_by: "system",
          is_verified: true,
          tags: ["popular", "notifications", "productivity"],
        },
        {
          id: "google-calendar-sync",
          name: "Google Calendar Sync",
          description:
            "Automatically sync high-priority tasks with your Google Calendar",
          provider_id: "google_workspace",
          category: "calendar",
          use_case: "Block time for important tasks in your calendar",
          popularity_score: 0.88,
          configuration_template: {
            enabled_features: ["calendar_sync"],
            filters: [
              {
                field: "task.priority",
                operator: "in",
                value: ["high", "critical"],
              },
            ],
          },
          required_features: ["calendar.events"],
          setup_instructions: [
            "Authorize Google Calendar access",
            "Select calendar for task events",
            "Configure sync filters",
            "Set sync frequency",
          ],
          estimated_setup_time_minutes: 8,
          created_by: "system",
          is_verified: true,
          tags: ["calendar", "time-management", "automation"],
        },
      ];

      return mockTemplates;
    },
  });
};
