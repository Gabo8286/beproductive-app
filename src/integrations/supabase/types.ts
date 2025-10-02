export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_timers: {
        Row: {
          id: string
          is_paused: boolean | null
          paused_at: string | null
          paused_duration: number | null
          started_at: string
          task_id: string
          time_entry_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_duration?: number | null
          started_at?: string
          task_id: string
          time_entry_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_duration?: number | null
          started_at?: string
          task_id?: string
          time_entry_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          changes_made: Json | null
          error_message: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          rule_id: string
          success: boolean
          task_id: string | null
        }
        Insert: {
          changes_made?: Json | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          rule_id: string
          success: boolean
          task_id?: string | null
        }
        Update: {
          changes_made?: Json | null
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          rule_id?: string
          success?: boolean
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_enabled: boolean | null
          last_executed_at: string | null
          name: string
          rule_type: string
          trigger_conditions: Json
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          name: string
          rule_type: string
          trigger_conditions?: Json
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          name?: string
          rule_type?: string
          trigger_conditions?: Json
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          progress_percentage: number | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          progress_percentage?: number | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          progress_percentage?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress_entries: {
        Row: {
          change_type: string
          created_at: string
          created_by: string
          goal_id: string
          id: string
          new_progress: number
          notes: string | null
          previous_progress: number
        }
        Insert: {
          change_type: string
          created_at?: string
          created_by: string
          goal_id: string
          id?: string
          new_progress: number
          notes?: string | null
          previous_progress?: number
        }
        Update: {
          change_type?: string
          created_at?: string
          created_by?: string
          goal_id?: string
          id?: string
          new_progress?: number
          notes?: string | null
          previous_progress?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["goal_category"] | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          current_value: number | null
          description: string | null
          id: string
          metadata: Json | null
          parent_goal_id: string | null
          position: number | null
          priority: number | null
          progress: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["goal_status"] | null
          tags: string[] | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["goal_category"] | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          current_value?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          parent_goal_id?: string | null
          position?: number | null
          priority?: number | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          tags?: string[] | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["goal_category"] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          current_value?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          parent_goal_id?: string | null
          position?: number | null
          priority?: number | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          tags?: string[] | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          completion_celebrations: boolean | null
          created_at: string | null
          due_date_reminder_hours: number[] | null
          due_date_reminders: boolean | null
          email_notifications: boolean | null
          id: string
          in_app_notifications: boolean | null
          overdue_alerts: boolean | null
          overdue_escalation_hours: number[] | null
          push_notifications: boolean | null
          time_tracking_reminders: boolean | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
          weekly_summaries: boolean | null
          weekly_summary_day: number | null
          weekly_summary_time: string | null
        }
        Insert: {
          completion_celebrations?: boolean | null
          created_at?: string | null
          due_date_reminder_hours?: number[] | null
          due_date_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          overdue_alerts?: boolean | null
          overdue_escalation_hours?: number[] | null
          push_notifications?: boolean | null
          time_tracking_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
          weekly_summaries?: boolean | null
          weekly_summary_day?: number | null
          weekly_summary_time?: string | null
        }
        Update: {
          completion_celebrations?: boolean | null
          created_at?: string | null
          due_date_reminder_hours?: number[] | null
          due_date_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          overdue_alerts?: boolean | null
          overdue_escalation_hours?: number[] | null
          push_notifications?: boolean | null
          time_tracking_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
          weekly_summaries?: boolean | null
          weekly_summary_day?: number | null
          weekly_summary_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channels: string[] | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          task_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channels?: string[] | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
          usage_count: number | null
          workspace_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
          usage_count?: number | null
          workspace_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_config: Json
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_config?: Json
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_config?: Json
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          hierarchy_level: number | null
          id: string
          instance_date: string | null
          is_recurring: boolean | null
          metadata: Json | null
          parent_task_id: string | null
          position: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          recurrence_pattern: Json | null
          recurring_template_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          hierarchy_level?: number | null
          id?: string
          instance_date?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_pattern?: Json | null
          recurring_template_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          hierarchy_level?: number | null
          id?: string
          instance_date?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_pattern?: Json | null
          recurring_template_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_recurring_template_id_fkey"
            columns: ["recurring_template_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          description: string | null
          duration: number | null
          end_time: string | null
          hourly_rate: number | null
          id: string
          is_manual: boolean | null
          start_time: string
          tags: string[] | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_manual?: boolean | null
          start_time: string
          tags?: string[] | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_manual?: boolean | null
          start_time?: string
          tags?: string[] | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"] | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"] | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"] | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
          type: Database["public"]["Enums"]["workspace_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["workspace_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["workspace_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_update_goal_progress: {
        Args: { progress_updates: Json }
        Returns: undefined
      }
      calculate_automatic_progress: {
        Args: { goal_id: string }
        Returns: number
      }
      calculate_goal_analytics: {
        Args: { goal_id: string }
        Returns: Json
      }
      calculate_goal_progress_from_milestones: {
        Args: { goal_id: string }
        Returns: number
      }
      calculate_hierarchy_level: {
        Args: { task_id: string }
        Returns: number
      }
      calculate_next_occurrence: {
        Args: { pattern: Json; template_id: string }
        Returns: string
      }
      calculate_next_occurrence_from_date: {
        Args: { from_date: string; pattern: Json }
        Returns: string
      }
      complete_milestone: {
        Args: { milestone_id: string }
        Returns: undefined
      }
      complete_task: {
        Args: { task_id: string }
        Returns: undefined
      }
      create_task_from_template: {
        Args: { template_id: string; variable_values?: Json }
        Returns: string
      }
      execute_automation_actions: {
        Args: { p_actions: Json; p_rule_id: string; p_task_id: string }
        Returns: undefined
      }
      generate_recurring_instances: {
        Args: Record<PropertyKey, never>
        Returns: {
          instances_created: number
          template_id: string
        }[]
      }
      get_progress_suggestions: {
        Args: { goal_id: string }
        Returns: Json
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      move_task_to_status: {
        Args: {
          new_position: number
          new_status: Database["public"]["Enums"]["task_status"]
          task_id_param: string
        }
        Returns: undefined
      }
      process_automation_rules: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      reorder_tasks_in_status: {
        Args: {
          status_param: Database["public"]["Enums"]["task_status"]
          task_ids: string[]
          workspace_id_param: string
        }
        Returns: undefined
      }
      replace_template_variables: {
        Args: { text_with_variables: string; variable_values: Json }
        Returns: string
      }
      send_due_date_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      start_timer: {
        Args: { p_task_id: string }
        Returns: string
      }
      stop_active_timer: {
        Args: { p_user_id?: string }
        Returns: undefined
      }
      toggle_timer_pause: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_goal_progress: {
        Args: { goal_id: string; new_progress: number }
        Returns: undefined
      }
      update_goal_progress_with_history: {
        Args: {
          change_type?: string
          goal_id: string
          new_progress: number
          notes?: string
        }
        Returns: undefined
      }
      update_task_position: {
        Args: { new_position: number; task_id: string }
        Returns: undefined
      }
      update_task_positions: {
        Args: { task_updates: Json[] }
        Returns: undefined
      }
    }
    Enums: {
      goal_category:
        | "personal"
        | "professional"
        | "health"
        | "financial"
        | "learning"
        | "relationship"
        | "other"
      goal_status: "draft" | "active" | "paused" | "completed" | "archived"
      member_role: "member" | "admin" | "owner"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "done"
      user_role: "user" | "team_lead" | "admin" | "super_admin"
      workspace_type: "personal" | "team" | "organization"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      goal_category: [
        "personal",
        "professional",
        "health",
        "financial",
        "learning",
        "relationship",
        "other",
      ],
      goal_status: ["draft", "active", "paused", "completed", "archived"],
      member_role: ["member", "admin", "owner"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "done"],
      user_role: ["user", "team_lead", "admin", "super_admin"],
      workspace_type: ["personal", "team", "organization"],
    },
  },
} as const
