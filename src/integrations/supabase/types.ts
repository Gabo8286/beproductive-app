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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_hidden: boolean | null
          points_reward: number | null
          rarity: string | null
          requirement_target: string | null
          requirement_type: string
          requirement_value: number
          sort_order: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id: string
          is_hidden?: boolean | null
          points_reward?: number | null
          rarity?: string | null
          requirement_target?: string | null
          requirement_type: string
          requirement_value: number
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_hidden?: boolean | null
          points_reward?: number | null
          rarity?: string | null
          requirement_target?: string | null
          requirement_type?: string
          requirement_value?: number
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
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
      ai_habit_suggestions: {
        Row: {
          ai_confidence: number | null
          ai_model: string | null
          ai_provider: string
          created_at: string
          created_habit_id: string | null
          goal_id: string
          id: string
          rejected_reason: string | null
          status: string
          suggestion_data: Json
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_model?: string | null
          ai_provider: string
          created_at?: string
          created_habit_id?: string | null
          goal_id: string
          id?: string
          rejected_reason?: string | null
          status?: string
          suggestion_data: Json
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_model?: string | null
          ai_provider?: string
          created_at?: string
          created_habit_id?: string | null
          goal_id?: string
          id?: string
          rejected_reason?: string | null
          status?: string
          suggestion_data?: Json
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_habit_suggestions_created_habit_id_fkey"
            columns: ["created_habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_habit_suggestions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_habit_suggestions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string | null
          data_sources: Json | null
          generated_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          metadata: Json | null
          provider: Database["public"]["Enums"]["ai_provider"]
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["ai_insight_type"]
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string | null
          data_sources?: Json | null
          generated_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["ai_provider"]
          summary?: string | null
          title: string
          type: Database["public"]["Enums"]["ai_insight_type"]
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          data_sources?: Json | null
          generated_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["ai_provider"]
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["ai_insight_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string
          dismissed_at: string | null
          effort_level: string | null
          expected_impact: string | null
          id: string
          implementation_steps: Json | null
          insight_id: string | null
          metadata: Json | null
          priority: number | null
          status: Database["public"]["Enums"]["ai_recommendation_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          effort_level?: string | null
          expected_impact?: string | null
          id?: string
          implementation_steps?: Json | null
          insight_id?: string | null
          metadata?: Json | null
          priority?: number | null
          status?:
            | Database["public"]["Enums"]["ai_recommendation_status"]
            | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          effort_level?: string | null
          expected_impact?: string | null
          id?: string
          implementation_steps?: Json | null
          insight_id?: string | null
          metadata?: Json | null
          priority?: number | null
          status?:
            | Database["public"]["Enums"]["ai_recommendation_status"]
            | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_service_usage: {
        Row: {
          created_at: string | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          metadata: Json | null
          model_name: string | null
          provider: Database["public"]["Enums"]["ai_provider"]
          request_type: string | null
          success: boolean | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          metadata?: Json | null
          model_name?: string | null
          provider: Database["public"]["Enums"]["ai_provider"]
          request_type?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          metadata?: Json | null
          model_name?: string | null
          provider?: Database["public"]["Enums"]["ai_provider"]
          request_type?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_service_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_user_preferences: {
        Row: {
          auto_generate_insights: boolean | null
          created_at: string | null
          enabled_insight_types: Json | null
          id: string
          insight_frequency: string | null
          notification_preferences: Json | null
          preferred_provider: Database["public"]["Enums"]["ai_provider"] | null
          privacy_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_generate_insights?: boolean | null
          created_at?: string | null
          enabled_insight_types?: Json | null
          id?: string
          insight_frequency?: string | null
          notification_preferences?: Json | null
          preferred_provider?: Database["public"]["Enums"]["ai_provider"] | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_generate_insights?: boolean | null
          created_at?: string | null
          enabled_insight_types?: Json | null
          id?: string
          insight_frequency?: string | null
          notification_preferences?: Json | null
          preferred_provider?: Database["public"]["Enums"]["ai_provider"] | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_audit_log: {
        Row: {
          action: string
          api_key_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          api_key_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          api_key_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_audit_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_key_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          additional_headers: Json | null
          api_version: string | null
          base_url: string | null
          created_at: string
          created_by: string | null
          current_day_requests: number | null
          current_month_cost: number | null
          current_month_tokens: number | null
          daily_request_limit: number | null
          description: string | null
          encrypted_key: string
          expires_at: string | null
          id: string
          key_hash: string
          key_name: string
          last_rotated_at: string | null
          last_used_at: string | null
          metadata: Json | null
          model_name: string | null
          monthly_limit_usd: number | null
          monthly_token_limit: number | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          provider_config: Json | null
          status: Database["public"]["Enums"]["api_key_status"]
          tags: string[] | null
          total_lifetime_cost: number | null
          updated_at: string
        }
        Insert: {
          additional_headers?: Json | null
          api_version?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          current_day_requests?: number | null
          current_month_cost?: number | null
          current_month_tokens?: number | null
          daily_request_limit?: number | null
          description?: string | null
          encrypted_key: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_name: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          model_name?: string | null
          monthly_limit_usd?: number | null
          monthly_token_limit?: number | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          provider_config?: Json | null
          status?: Database["public"]["Enums"]["api_key_status"]
          tags?: string[] | null
          total_lifetime_cost?: number | null
          updated_at?: string
        }
        Update: {
          additional_headers?: Json | null
          api_version?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          current_day_requests?: number | null
          current_month_cost?: number | null
          current_month_tokens?: number | null
          daily_request_limit?: number | null
          description?: string | null
          encrypted_key?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_name?: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          model_name?: string | null
          monthly_limit_usd?: number | null
          monthly_token_limit?: number | null
          provider?: Database["public"]["Enums"]["api_provider_type"]
          provider_config?: Json | null
          status?: Database["public"]["Enums"]["api_key_status"]
          tags?: string[] | null
          total_lifetime_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_system_config: {
        Row: {
          access_level: string | null
          config_key: string
          config_value: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          updated_at: string
        }
        Insert: {
          access_level?: string | null
          config_key: string
          config_value: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          updated_at?: string
        }
        Update: {
          access_level?: string | null
          config_key?: string
          config_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_system_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_system_limits: {
        Row: {
          cost_multiplier: number | null
          cost_per_1k_tokens: number | null
          created_at: string
          default_user_daily_request_limit: number | null
          default_user_monthly_limit_usd: number | null
          default_user_monthly_token_limit: number | null
          global_daily_request_limit: number | null
          global_monthly_limit_usd: number | null
          global_monthly_token_limit: number | null
          id: string
          is_enabled: boolean | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          metadata: Json | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          requests_per_hour: number | null
          requests_per_minute: number | null
          updated_at: string
        }
        Insert: {
          cost_multiplier?: number | null
          cost_per_1k_tokens?: number | null
          created_at?: string
          default_user_daily_request_limit?: number | null
          default_user_monthly_limit_usd?: number | null
          default_user_monthly_token_limit?: number | null
          global_daily_request_limit?: number | null
          global_monthly_limit_usd?: number | null
          global_monthly_token_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          metadata?: Json | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          updated_at?: string
        }
        Update: {
          cost_multiplier?: number | null
          cost_per_1k_tokens?: number | null
          created_at?: string
          default_user_daily_request_limit?: number | null
          default_user_monthly_limit_usd?: number | null
          default_user_monthly_token_limit?: number | null
          global_daily_request_limit?: number | null
          global_monthly_limit_usd?: number | null
          global_monthly_token_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["api_provider_type"]
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_analytics: {
        Row: {
          api_key_id: string | null
          endpoint: string | null
          error_code: string | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          ip_address: unknown | null
          method: string | null
          model_name: string | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          request_metadata: Json | null
          request_size_bytes: number | null
          requested_at: string
          response_size_bytes: number | null
          response_time_ms: number | null
          success: boolean | null
          tokens_completion: number | null
          tokens_prompt: number | null
          tokens_total: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          endpoint?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          ip_address?: unknown | null
          method?: string | null
          model_name?: string | null
          provider: Database["public"]["Enums"]["api_provider_type"]
          request_metadata?: Json | null
          request_size_bytes?: number | null
          requested_at?: string
          response_size_bytes?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
          tokens_total?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          endpoint?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          ip_address?: unknown | null
          method?: string | null
          model_name?: string | null
          provider?: Database["public"]["Enums"]["api_provider_type"]
          request_metadata?: Json | null
          request_size_bytes?: number | null
          requested_at?: string
          response_size_bytes?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
          tokens_total?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_analytics_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      goal_milestone_dependencies: {
        Row: {
          created_at: string | null
          depends_on_id: string
          id: string
          milestone_id: string
        }
        Insert: {
          created_at?: string | null
          depends_on_id: string
          id?: string
          milestone_id: string
        }
        Update: {
          created_at?: string | null
          depends_on_id?: string
          id?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestone_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "goal_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_milestone_dependencies_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "goal_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          actual_hours: number | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          goal_id: string
          id: string
          metadata: Json | null
          priority: number | null
          progress_percentage: number | null
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          goal_id: string
          id?: string
          metadata?: Json | null
          priority?: number | null
          progress_percentage?: number | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          goal_id?: string
          id?: string
          metadata?: Json | null
          priority?: number | null
          progress_percentage?: number | null
          tags?: string[] | null
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
          project_id: string | null
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
          project_id?: string | null
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
          project_id?: string | null
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
            foreignKeyName: "goals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      habit_analytics: {
        Row: {
          average_difficulty: number | null
          average_energy: number | null
          average_mood: number | null
          calculated_at: string
          completion_rate: number | null
          habit_id: string
          id: string
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["period_enum"]
          total_completions: number
          total_misses: number
          total_skips: number
        }
        Insert: {
          average_difficulty?: number | null
          average_energy?: number | null
          average_mood?: number | null
          calculated_at?: string
          completion_rate?: number | null
          habit_id: string
          id?: string
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["period_enum"]
          total_completions?: number
          total_misses?: number
          total_skips?: number
        }
        Update: {
          average_difficulty?: number | null
          average_energy?: number | null
          average_mood?: number | null
          calculated_at?: string
          completion_rate?: number | null
          habit_id?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["period_enum"]
          total_completions?: number
          total_misses?: number
          total_skips?: number
        }
        Relationships: [
          {
            foreignKeyName: "habit_analytics_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_entries: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string
          difficulty_felt: number | null
          duration_minutes: number | null
          energy_level: number | null
          habit_id: string
          id: string
          mood: Database["public"]["Enums"]["mood_enum"] | null
          notes: string | null
          status: Database["public"]["Enums"]["entry_status"]
          updated_at: string
          value: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date: string
          difficulty_felt?: number | null
          duration_minutes?: number | null
          energy_level?: number | null
          habit_id: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          notes?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
          value?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string
          difficulty_felt?: number | null
          duration_minutes?: number | null
          energy_level?: number | null
          habit_id?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_enum"] | null
          notes?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_entries_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_goal_links: {
        Row: {
          contribution_weight: number
          created_at: string
          goal_id: string
          habit_id: string
          id: string
        }
        Insert: {
          contribution_weight?: number
          created_at?: string
          goal_id: string
          habit_id: string
          id?: string
        }
        Update: {
          contribution_weight?: number
          created_at?: string
          goal_id?: string
          habit_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_goal_links_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_goal_links_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_reminders: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          habit_id: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          location: Json | null
          message: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          time: string | null
          trigger_habit_id: string | null
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          habit_id: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          location?: Json | null
          message?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          time?: string | null
          trigger_habit_id?: string | null
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          habit_id?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          location?: Json | null
          message?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          time?: string | null
          trigger_habit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_reminders_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_reminders_trigger_habit_id_fkey"
            columns: ["trigger_habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_streaks: {
        Row: {
          broken_at: string | null
          created_at: string
          end_date: string | null
          habit_id: string
          id: string
          length: number
          reason: string | null
          start_date: string
        }
        Insert: {
          broken_at?: string | null
          created_at?: string
          end_date?: string | null
          habit_id: string
          id?: string
          length: number
          reason?: string | null
          start_date: string
        }
        Update: {
          broken_at?: string | null
          created_at?: string
          end_date?: string | null
          habit_id?: string
          id?: string
          length?: number
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_streaks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_templates: {
        Row: {
          category: Database["public"]["Enums"]["habit_category"]
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["habit_difficulty"] | null
          duration_minutes: number | null
          frequency: Database["public"]["Enums"]["habit_frequency"] | null
          icon: string | null
          id: string
          is_system: boolean
          metadata: Json
          rating: number | null
          time_of_day: Database["public"]["Enums"]["habit_time"] | null
          title: string
          usage_count: number
        }
        Insert: {
          category: Database["public"]["Enums"]["habit_category"]
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["habit_difficulty"] | null
          duration_minutes?: number | null
          frequency?: Database["public"]["Enums"]["habit_frequency"] | null
          icon?: string | null
          id?: string
          is_system?: boolean
          metadata?: Json
          rating?: number | null
          time_of_day?: Database["public"]["Enums"]["habit_time"] | null
          title: string
          usage_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["habit_category"]
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["habit_difficulty"] | null
          duration_minutes?: number | null
          frequency?: Database["public"]["Enums"]["habit_frequency"] | null
          icon?: string | null
          id?: string
          is_system?: boolean
          metadata?: Json
          rating?: number | null
          time_of_day?: Database["public"]["Enums"]["habit_time"] | null
          title?: string
          usage_count?: number
        }
        Relationships: []
      }
      habits: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["habit_category"]
          color: string | null
          created_at: string
          created_by: string
          current_streak: number
          custom_frequency: Json | null
          description: string | null
          difficulty: Database["public"]["Enums"]["habit_difficulty"]
          duration_minutes: number | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["habit_frequency"]
          icon: string | null
          id: string
          is_public: boolean
          longest_streak: number
          metadata: Json
          position: number
          reminder_enabled: boolean
          reminder_time: string | null
          start_date: string
          tags: string[]
          target_streak: number | null
          time_of_day: Database["public"]["Enums"]["habit_time"] | null
          title: string
          type: Database["public"]["Enums"]["habit_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["habit_category"]
          color?: string | null
          created_at?: string
          created_by: string
          current_streak?: number
          custom_frequency?: Json | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["habit_difficulty"]
          duration_minutes?: number | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          icon?: string | null
          id?: string
          is_public?: boolean
          longest_streak?: number
          metadata?: Json
          position?: number
          reminder_enabled?: boolean
          reminder_time?: string | null
          start_date?: string
          tags?: string[]
          target_streak?: number | null
          time_of_day?: Database["public"]["Enums"]["habit_time"] | null
          title: string
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["habit_category"]
          color?: string | null
          created_at?: string
          created_by?: string
          current_streak?: number
          custom_frequency?: Json | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["habit_difficulty"]
          duration_minutes?: number | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          icon?: string | null
          id?: string
          is_public?: boolean
          longest_streak?: number
          metadata?: Json
          position?: number
          reminder_enabled?: boolean
          reminder_time?: string | null
          start_date?: string
          tags?: string[]
          target_streak?: number | null
          time_of_day?: Database["public"]["Enums"]["habit_time"] | null
          title?: string
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_framework_assessments: {
        Row: {
          completion_percentage: number
          created_at: string | null
          id: string
          improvements: string[] | null
          metrics: Json | null
          next_steps: string[] | null
          profile_id: string
          stage: string
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          completion_percentage: number
          created_at?: string | null
          id?: string
          improvements?: string[] | null
          metrics?: Json | null
          next_steps?: string[] | null
          profile_id: string
          stage: string
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string | null
          id?: string
          improvements?: string[] | null
          metrics?: Json | null
          next_steps?: string[] | null
          profile_id?: string
          stage?: string
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "luna_framework_assessments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "luna_productivity_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_framework_reminders: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string
          profile_id: string
          scheduled_for: string
          snoozed_until: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string
          profile_id: string
          scheduled_for: string
          snoozed_until?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string
          profile_id?: string
          scheduled_for?: string
          snoozed_until?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "luna_framework_reminders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "luna_productivity_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_local_usage: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          execution_time_ms: number
          handled_locally: boolean
          id: string
          request_type: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          execution_time_ms: number
          handled_locally: boolean
          id?: string
          request_type: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          execution_time_ms?: number
          handled_locally?: boolean
          id?: string
          request_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      luna_proactive_insights: {
        Row: {
          acted_at: string | null
          acted_upon: boolean | null
          action_items: string[] | null
          created_at: string | null
          description: string
          dismissed: boolean | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          principle: string
          priority: string
          profile_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          acted_upon?: boolean | null
          action_items?: string[] | null
          created_at?: string | null
          description: string
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          principle: string
          priority?: string
          profile_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          acted_upon?: boolean | null
          action_items?: string[] | null
          created_at?: string | null
          description?: string
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          principle?: string
          priority?: string
          profile_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "luna_proactive_insights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "luna_productivity_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_productivity_metrics: {
        Row: {
          category: string
          id: string
          metadata: Json | null
          metric_id: string
          name: string
          profile_id: string
          recorded_at: string | null
          source: string | null
          target: string | null
          trend: string | null
          user_id: string
          value: number
        }
        Insert: {
          category: string
          id?: string
          metadata?: Json | null
          metric_id: string
          name: string
          profile_id: string
          recorded_at?: string | null
          source?: string | null
          target?: string | null
          trend?: string | null
          user_id: string
          value: number
        }
        Update: {
          category?: string
          id?: string
          metadata?: Json | null
          metric_id?: string
          name?: string
          profile_id?: string
          recorded_at?: string | null
          source?: string | null
          target?: string | null
          trend?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "luna_productivity_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "luna_productivity_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_productivity_profiles: {
        Row: {
          completed_principles: string[] | null
          created_at: string | null
          current_recovery_level: number | null
          current_stage: string
          energy_pattern: Json | null
          id: string
          is_in_recovery_mode: boolean | null
          is_proactive_mode_enabled: boolean | null
          last_proactive_check: string | null
          preferences: Json | null
          recovery_started_at: string | null
          system_health_score: number | null
          updated_at: string | null
          user_id: string
          week_in_stage: number
          well_being_score: number | null
          workspace_id: string
        }
        Insert: {
          completed_principles?: string[] | null
          created_at?: string | null
          current_recovery_level?: number | null
          current_stage?: string
          energy_pattern?: Json | null
          id?: string
          is_in_recovery_mode?: boolean | null
          is_proactive_mode_enabled?: boolean | null
          last_proactive_check?: string | null
          preferences?: Json | null
          recovery_started_at?: string | null
          system_health_score?: number | null
          updated_at?: string | null
          user_id: string
          week_in_stage?: number
          well_being_score?: number | null
          workspace_id: string
        }
        Update: {
          completed_principles?: string[] | null
          created_at?: string | null
          current_recovery_level?: number | null
          current_stage?: string
          energy_pattern?: Json | null
          id?: string
          is_in_recovery_mode?: boolean | null
          is_proactive_mode_enabled?: boolean | null
          last_proactive_check?: string | null
          preferences?: Json | null
          recovery_started_at?: string | null
          system_health_score?: number | null
          updated_at?: string | null
          user_id?: string
          week_in_stage?: number
          well_being_score?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "luna_productivity_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      luna_recovery_sessions: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          current_step: string | null
          effectiveness_rating: number | null
          estimated_duration_minutes: number | null
          id: string
          level: number
          level_name: string
          notes: string | null
          profile_id: string
          remaining_steps: string[] | null
          started_at: string | null
          trigger_reason: string | null
          user_id: string
          was_completed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          current_step?: string | null
          effectiveness_rating?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          level: number
          level_name: string
          notes?: string | null
          profile_id: string
          remaining_steps?: string[] | null
          started_at?: string | null
          trigger_reason?: string | null
          user_id: string
          was_completed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          current_step?: string | null
          effectiveness_rating?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          level?: number
          level_name?: string
          notes?: string | null
          profile_id?: string
          remaining_steps?: string[] | null
          started_at?: string | null
          trigger_reason?: string | null
          user_id?: string
          was_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "luna_recovery_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "luna_productivity_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          milestones: Json
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          milestones?: Json
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          milestones?: Json
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      note_links: {
        Row: {
          created_at: string
          id: string
          link_type: string
          source_note_id: string
          target_note_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_type?: string
          source_note_id: string
          target_note_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: string
          source_note_id?: string
          target_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_links_source_note_id_fkey"
            columns: ["source_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_links_target_note_id_fkey"
            columns: ["target_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          created_at: string
          id: string
          note_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          note_type: Database["public"]["Enums"]["note_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          note_type?: Database["public"]["Enums"]["note_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          note_type?: Database["public"]["Enums"]["note_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      performance_metrics: {
        Row: {
          component_name: string
          duration_ms: number
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string | null
          user_id: string | null
        }
        Insert: {
          component_name: string
          duration_ms: number
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string
          duration_ms?: number
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      productivity_assessments: {
        Row: {
          completed_at: string
          dominant_profile: string
          growth_areas: Json | null
          id: string
          profile_scores: Json
          question_responses: Json
          recommended_strategies: Json | null
          secondary_profile: string | null
          strengths: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          dominant_profile: string
          growth_areas?: Json | null
          id?: string
          profile_scores: Json
          question_responses: Json
          recommended_strategies?: Json | null
          secondary_profile?: string | null
          strengths?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string
          dominant_profile?: string
          growth_areas?: Json | null
          id?: string
          profile_scores?: Json
          question_responses?: Json
          recommended_strategies?: Json | null
          secondary_profile?: string | null
          strengths?: Json | null
          user_id?: string
        }
        Relationships: []
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
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          permissions: Json | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          permissions?: Json | null
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          permissions?: Json | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number | null
          progress_percentage: number | null
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          progress_percentage?: number | null
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          progress_percentage?: number | null
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          default_milestones: Json | null
          default_tasks: Json | null
          description: string | null
          id: string
          is_public: boolean | null
          template_data: Json
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_milestones?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_data?: Json
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_milestones?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_data?: Json
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_hours: number | null
          budget_amount: number | null
          color: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          icon: string | null
          id: string
          is_template: boolean | null
          metadata: Json | null
          position: number | null
          priority: Database["public"]["Enums"]["project_priority"]
          progress_percentage: number | null
          project_manager: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          target_date: string | null
          template_id: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["project_visibility"]
          workspace_id: string
        }
        Insert: {
          actual_hours?: number | null
          budget_amount?: number | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_template?: boolean | null
          metadata?: Json | null
          position?: number | null
          priority?: Database["public"]["Enums"]["project_priority"]
          progress_percentage?: number | null
          project_manager?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          target_date?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          workspace_id: string
        }
        Update: {
          actual_hours?: number | null
          budget_amount?: number | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_template?: boolean | null
          metadata?: Json | null
          position?: number | null
          priority?: Database["public"]["Enums"]["project_priority"]
          progress_percentage?: number | null
          project_manager?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          target_date?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_todos: {
        Row: {
          completed_at: string | null
          content: string
          created_at: string | null
          created_by: string
          id: string
          position: number | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          position?: number | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          position?: number | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_todos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_todos_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_analytics: {
        Row: {
          average_energy: number | null
          average_mood: number | null
          average_satisfaction: number | null
          average_stress: number | null
          calculated_at: string | null
          growth_indicators: Json | null
          id: string
          pattern_insights: Json | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["analytics_period"]
          top_themes: string[] | null
          total_reflections: number | null
          user_id: string
        }
        Insert: {
          average_energy?: number | null
          average_mood?: number | null
          average_satisfaction?: number | null
          average_stress?: number | null
          calculated_at?: string | null
          growth_indicators?: Json | null
          id?: string
          pattern_insights?: Json | null
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["analytics_period"]
          top_themes?: string[] | null
          total_reflections?: number | null
          user_id: string
        }
        Update: {
          average_energy?: number | null
          average_mood?: number | null
          average_satisfaction?: number | null
          average_stress?: number | null
          calculated_at?: string | null
          growth_indicators?: Json | null
          id?: string
          pattern_insights?: Json | null
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["analytics_period"]
          top_themes?: string[] | null
          total_reflections?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflection_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_goal_links: {
        Row: {
          action_items: string[] | null
          created_at: string | null
          goal_id: string
          id: string
          insights: string | null
          reflection_id: string
          reflection_type: Database["public"]["Enums"]["goal_reflection_type"]
        }
        Insert: {
          action_items?: string[] | null
          created_at?: string | null
          goal_id: string
          id?: string
          insights?: string | null
          reflection_id: string
          reflection_type: Database["public"]["Enums"]["goal_reflection_type"]
        }
        Update: {
          action_items?: string[] | null
          created_at?: string | null
          goal_id?: string
          id?: string
          insights?: string | null
          reflection_id?: string
          reflection_type?: Database["public"]["Enums"]["goal_reflection_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reflection_goal_links_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_goal_links_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_habit_links: {
        Row: {
          adjustments: string[] | null
          created_at: string | null
          habit_id: string
          id: string
          observations: string | null
          reflection_id: string
          reflection_type: Database["public"]["Enums"]["habit_reflection_type"]
        }
        Insert: {
          adjustments?: string[] | null
          created_at?: string | null
          habit_id: string
          id?: string
          observations?: string | null
          reflection_id: string
          reflection_type: Database["public"]["Enums"]["habit_reflection_type"]
        }
        Update: {
          adjustments?: string[] | null
          created_at?: string | null
          habit_id?: string
          id?: string
          observations?: string | null
          reflection_id?: string
          reflection_type?: Database["public"]["Enums"]["habit_reflection_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reflection_habit_links_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_habit_links_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_prompts: {
        Row: {
          category: Database["public"]["Enums"]["prompt_category"]
          created_at: string | null
          created_by: string | null
          difficulty_level: number | null
          effectiveness_score: number | null
          frequency: Database["public"]["Enums"]["prompt_frequency"]
          id: string
          is_system: boolean | null
          metadata: Json | null
          prompt_text: string
          usage_count: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["prompt_category"]
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          effectiveness_score?: number | null
          frequency?: Database["public"]["Enums"]["prompt_frequency"]
          id?: string
          is_system?: boolean | null
          metadata?: Json | null
          prompt_text: string
          usage_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["prompt_category"]
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          effectiveness_score?: number | null
          frequency?: Database["public"]["Enums"]["prompt_frequency"]
          id?: string
          is_system?: boolean | null
          metadata?: Json | null
          prompt_text?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_shares: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          reflection_id: string
          share_type: Database["public"]["Enums"]["share_type"]
          shared_by: string
          shared_with_user_id: string | null
          shared_with_workspace: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reflection_id: string
          share_type?: Database["public"]["Enums"]["share_type"]
          shared_by: string
          shared_with_user_id?: string | null
          shared_with_workspace?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reflection_id?: string
          share_type?: Database["public"]["Enums"]["share_type"]
          shared_by?: string
          shared_with_user_id?: string | null
          shared_with_workspace?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_shares_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_shares_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_system: boolean | null
          metadata: Json | null
          name: string
          prompts: Json
          rating: number | null
          structure: Json | null
          usage_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          name: string
          prompts?: Json
          rating?: number | null
          structure?: Json | null
          usage_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          name?: string
          prompts?: Json
          rating?: number | null
          structure?: Json | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          challenges: string[] | null
          content: string
          created_at: string | null
          created_by: string
          energy_level: number | null
          gratitude_items: string[] | null
          id: string
          is_private: boolean | null
          learnings: string[] | null
          metadata: Json | null
          mood: Database["public"]["Enums"]["mood_level"] | null
          reflection_date: string
          reflection_type: Database["public"]["Enums"]["reflection_type"]
          satisfaction_level: number | null
          stress_level: number | null
          tags: string[] | null
          title: string
          tomorrow_focus: string[] | null
          updated_at: string | null
          wins: string[] | null
          workspace_id: string
        }
        Insert: {
          challenges?: string[] | null
          content: string
          created_at?: string | null
          created_by: string
          energy_level?: number | null
          gratitude_items?: string[] | null
          id?: string
          is_private?: boolean | null
          learnings?: string[] | null
          metadata?: Json | null
          mood?: Database["public"]["Enums"]["mood_level"] | null
          reflection_date?: string
          reflection_type?: Database["public"]["Enums"]["reflection_type"]
          satisfaction_level?: number | null
          stress_level?: number | null
          tags?: string[] | null
          title: string
          tomorrow_focus?: string[] | null
          updated_at?: string | null
          wins?: string[] | null
          workspace_id: string
        }
        Update: {
          challenges?: string[] | null
          content?: string
          created_at?: string | null
          created_by?: string
          energy_level?: number | null
          gratitude_items?: string[] | null
          id?: string
          is_private?: boolean | null
          learnings?: string[] | null
          metadata?: Json | null
          mood?: Database["public"]["Enums"]["mood_level"] | null
          reflection_date?: string
          reflection_type?: Database["public"]["Enums"]["reflection_type"]
          satisfaction_level?: number | null
          stress_level?: number | null
          tags?: string[] | null
          title?: string
          tomorrow_focus?: string[] | null
          updated_at?: string | null
          wins?: string[] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
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
          auto_generated: boolean | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          habit_id: string | null
          hierarchy_level: number | null
          id: string
          instance_date: string | null
          is_recurring: boolean | null
          metadata: Json | null
          parent_task_id: string | null
          position: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string | null
          recurrence_pattern: Json | null
          recurring_template_id: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          auto_generated?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          habit_id?: string | null
          hierarchy_level?: number | null
          id?: string
          instance_date?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          recurrence_pattern?: Json | null
          recurring_template_id?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          auto_generated?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          habit_id?: string | null
          hierarchy_level?: number | null
          id?: string
          instance_date?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          parent_task_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          recurrence_pattern?: Json | null
          recurring_template_id?: string | null
          scheduled_date?: string | null
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
            foreignKeyName: "tasks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
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
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          current_progress: number | null
          id: string
          metadata: Json | null
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          current_progress?: number | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          current_progress?: number | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_type: string
          completed_at: string | null
          created_at: string
          current_progress: number | null
          description: string
          expires_at: string | null
          id: string
          metadata: Json | null
          points_reward: number | null
          status: string | null
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_type: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          points_reward?: number | null
          status?: string | null
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          points_reward?: number | null
          status?: string | null
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gamification_profiles: {
        Row: {
          achievement_count: number | null
          assessment_completed_at: string | null
          created_at: string
          id: string
          last_level_up_at: string | null
          level: number | null
          longest_streak_any_habit: number | null
          metadata: Json | null
          monthly_reset_at: string | null
          monthly_xp: number | null
          productivity_profile_type: string | null
          total_xp: number | null
          updated_at: string
          user_id: string
          weekly_reset_at: string | null
          weekly_xp: number | null
        }
        Insert: {
          achievement_count?: number | null
          assessment_completed_at?: string | null
          created_at?: string
          id?: string
          last_level_up_at?: string | null
          level?: number | null
          longest_streak_any_habit?: number | null
          metadata?: Json | null
          monthly_reset_at?: string | null
          monthly_xp?: number | null
          productivity_profile_type?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          weekly_reset_at?: string | null
          weekly_xp?: number | null
        }
        Update: {
          achievement_count?: number | null
          assessment_completed_at?: string | null
          created_at?: string
          id?: string
          last_level_up_at?: string | null
          level?: number | null
          longest_streak_any_habit?: number | null
          metadata?: Json | null
          monthly_reset_at?: string | null
          monthly_xp?: number | null
          productivity_profile_type?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          weekly_reset_at?: string | null
          weekly_xp?: number | null
        }
        Relationships: []
      }
      user_points_log: {
        Row: {
          action_type: string
          description: string | null
          earned_at: string
          id: string
          metadata: Json | null
          multiplier: number | null
          points: number
          source_id: string | null
          source_module: string
          user_id: string
        }
        Insert: {
          action_type: string
          description?: string | null
          earned_at?: string
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          points: number
          source_id?: string | null
          source_module: string
          user_id: string
        }
        Update: {
          action_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          points?: number
          source_id?: string | null
          source_module?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
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
      luna_user_dashboard_summary: {
        Row: {
          active_insights_count: number | null
          avg_productivity_score: number | null
          current_stage: string | null
          system_health_score: number | null
          user_id: string | null
          well_being_score: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "luna_productivity_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      analyze_reflection_patterns: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: Json
      }
      apply_milestone_template: {
        Args: { goal_id: string; start_date?: string; template_id: string }
        Returns: undefined
      }
      assign_initial_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      assign_super_admin_role: {
        Args: { target_user_id: string }
        Returns: Json
      }
      award_habit_points: {
        Args: { entry_id_param: string; habit_id_param: string }
        Returns: boolean
      }
      award_points: {
        Args: {
          action_type_param: string
          description_param?: string
          multiplier_param?: number
          point_amount: number
          source_id_param?: string
          source_module_param: string
          target_user_id: string
        }
        Returns: boolean
      }
      bulk_milestone_operations: {
        Args: {
          milestone_ids: string[]
          operation_data?: Json
          operation_type: string
        }
        Returns: undefined
      }
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
      calculate_habit_analytics: {
        Args: {
          p_end_date: string
          p_habit_id: string
          p_period_type: Database["public"]["Enums"]["period_enum"]
          p_start_date: string
        }
        Returns: undefined
      }
      calculate_hierarchy_level: {
        Args: { task_id: string }
        Returns: number
      }
      calculate_milestone_analytics: {
        Args: { goal_id: string }
        Returns: Json
      }
      calculate_next_occurrence: {
        Args: { pattern: Json; template_id: string }
        Returns: string
      }
      calculate_next_occurrence_from_date: {
        Args: { from_date: string; pattern: Json }
        Returns: string
      }
      calculate_project_progress: {
        Args: { project_id_param: string }
        Returns: number
      }
      calculate_reflection_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_api_key_limits: {
        Args: { key_id: string }
        Returns: Json
      }
      check_habit_achievements: {
        Args: { current_streak: number; target_user_id: string }
        Returns: undefined
      }
      check_habit_completion: {
        Args: { p_date: string; p_habit_id: string }
        Returns: boolean
      }
      clear_completed_quick_todos: {
        Args: { workspace_uuid: string }
        Returns: undefined
      }
      complete_milestone: {
        Args: { milestone_id: string }
        Returns: undefined
      }
      complete_milestone_enhanced: {
        Args: {
          actual_hours?: number
          completion_notes?: string
          milestone_id: string
        }
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
      generate_daily_prompts: {
        Args: { p_reflection_date: string; p_user_id: string }
        Returns: {
          category: Database["public"]["Enums"]["prompt_category"]
          prompt_text: string
        }[]
      }
      generate_recurring_instances: {
        Args: Record<PropertyKey, never>
        Returns: {
          instances_created: number
          template_id: string
        }[]
      }
      generate_recurring_tasks_from_habit: {
        Args: {
          p_days_ahead?: number
          p_habit_id: string
          p_start_date: string
        }
        Returns: number
      }
      get_api_key_monthly_usage: {
        Args: { key_id: string }
        Returns: Json
      }
      get_cost_projections: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_level_from_xp: {
        Args: { total_xp: number }
        Returns: number
      }
      get_luna_dashboard_data: {
        Args: { user_id_param: string; workspace_id_param: string }
        Returns: Json
      }
      get_note_backlinks: {
        Args: { note_uuid: string }
        Returns: {
          content: string
          created_at: string
          id: string
          metadata: Json
          note_type: Database["public"]["Enums"]["note_type"]
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      get_performance_insights: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_progress_suggestions: {
        Args: { goal_id: string }
        Returns: Json
      }
      get_system_api_usage_stats: {
        Args: { days_back?: number }
        Returns: Json
      }
      get_user_ai_usage_stats: {
        Args: { p_days?: number; p_user_id: string }
        Returns: Json
      }
      get_user_profile_with_role: {
        Args: { p_user_id?: string }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          onboarding_completed: boolean
          preferences: Json
          role: string
          subscription_tier: string
          updated_at: string
        }[]
      }
      get_user_roles: {
        Args: { check_user_id?: string }
        Returns: {
          assigned_at: string
          assigned_by: string
          role_name: string
        }[]
      }
      get_xp_required_for_level: {
        Args: { target_level: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_api_key_usage: {
        Args: { cost_amount: number; key_id: string; token_amount: number }
        Returns: undefined
      }
      is_project_manager: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      log_luna_local_usage: {
        Args: {
          confidence_param?: number
          execution_time_param: number
          handled_locally_param: boolean
          request_type_param: string
          user_id_param: string
        }
        Returns: undefined
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
      refresh_luna_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      reset_periodic_xp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      toggle_quick_todo_completion: {
        Args: { quick_todo_id: string }
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
      update_habit_streak: {
        Args: {
          p_date: string
          p_habit_id: string
          p_status: Database["public"]["Enums"]["entry_status"]
        }
        Returns: undefined
      }
      update_quick_todo_position: {
        Args: { new_position: number; quick_todo_id: string }
        Returns: undefined
      }
      update_reflection_analytics: {
        Args: {
          p_period_type: Database["public"]["Enums"]["analytics_period"]
          p_user_id: string
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
      ai_insight_type:
        | "productivity_pattern"
        | "goal_progress"
        | "habit_analysis"
        | "time_optimization"
        | "task_prioritization"
        | "reflection_sentiment"
        | "project_health"
        | "burnout_risk"
        | "achievement_opportunity"
      ai_provider: "openai" | "claude" | "gemini" | "lovable"
      ai_recommendation_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "dismissed"
      analytics_period: "week" | "month" | "quarter" | "year"
      api_key_status: "active" | "inactive" | "revoked" | "expired"
      api_provider_type: "openai" | "claude" | "gemini" | "lovable" | "custom"
      entry_status: "completed" | "skipped" | "missed" | "partial"
      goal_category:
        | "personal"
        | "professional"
        | "health"
        | "financial"
        | "learning"
        | "relationship"
        | "other"
      goal_reflection_type:
        | "progress_review"
        | "milestone_achieved"
        | "challenge_faced"
        | "strategy_adjustment"
        | "completion_celebration"
      goal_status: "draft" | "active" | "paused" | "completed" | "archived"
      habit_category:
        | "health"
        | "productivity"
        | "learning"
        | "mindfulness"
        | "social"
        | "financial"
        | "creative"
        | "other"
      habit_difficulty: "easy" | "medium" | "hard" | "extreme"
      habit_frequency: "daily" | "weekly" | "monthly" | "custom"
      habit_reflection_type:
        | "streak_milestone"
        | "consistency_review"
        | "difficulty_adjustment"
        | "motivation_analysis"
        | "pattern_recognition"
      habit_time: "morning" | "afternoon" | "evening" | "anytime"
      habit_type: "build" | "break" | "maintain"
      member_role: "member" | "admin" | "owner"
      mood_enum: "amazing" | "good" | "neutral" | "bad" | "terrible"
      mood_level: "amazing" | "great" | "good" | "neutral" | "bad" | "terrible"
      note_type: "fleeting" | "literature" | "permanent"
      period_enum: "day" | "week" | "month" | "year" | "all_time"
      project_priority: "low" | "medium" | "high" | "urgent"
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "archived"
      project_visibility: "private" | "workspace" | "public"
      prompt_category:
        | "gratitude"
        | "challenges"
        | "wins"
        | "learning"
        | "planning"
        | "mood"
        | "goals"
        | "habits"
        | "relationships"
        | "growth"
      prompt_frequency: "daily" | "weekly" | "monthly" | "occasional"
      reflection_type:
        | "daily"
        | "weekly"
        | "monthly"
        | "project"
        | "goal"
        | "habit"
        | "custom"
      reminder_type: "time_based" | "location_based" | "trigger_based"
      share_type: "read_only" | "comment_enabled" | "collaborative"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "done"
      template_category:
        | "daily"
        | "weekly"
        | "monthly"
        | "project"
        | "goal_review"
        | "habit_review"
        | "personal"
        | "professional"
        | "custom"
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
      ai_insight_type: [
        "productivity_pattern",
        "goal_progress",
        "habit_analysis",
        "time_optimization",
        "task_prioritization",
        "reflection_sentiment",
        "project_health",
        "burnout_risk",
        "achievement_opportunity",
      ],
      ai_provider: ["openai", "claude", "gemini", "lovable"],
      ai_recommendation_status: [
        "pending",
        "in_progress",
        "completed",
        "dismissed",
      ],
      analytics_period: ["week", "month", "quarter", "year"],
      api_key_status: ["active", "inactive", "revoked", "expired"],
      api_provider_type: ["openai", "claude", "gemini", "lovable", "custom"],
      entry_status: ["completed", "skipped", "missed", "partial"],
      goal_category: [
        "personal",
        "professional",
        "health",
        "financial",
        "learning",
        "relationship",
        "other",
      ],
      goal_reflection_type: [
        "progress_review",
        "milestone_achieved",
        "challenge_faced",
        "strategy_adjustment",
        "completion_celebration",
      ],
      goal_status: ["draft", "active", "paused", "completed", "archived"],
      habit_category: [
        "health",
        "productivity",
        "learning",
        "mindfulness",
        "social",
        "financial",
        "creative",
        "other",
      ],
      habit_difficulty: ["easy", "medium", "hard", "extreme"],
      habit_frequency: ["daily", "weekly", "monthly", "custom"],
      habit_reflection_type: [
        "streak_milestone",
        "consistency_review",
        "difficulty_adjustment",
        "motivation_analysis",
        "pattern_recognition",
      ],
      habit_time: ["morning", "afternoon", "evening", "anytime"],
      habit_type: ["build", "break", "maintain"],
      member_role: ["member", "admin", "owner"],
      mood_enum: ["amazing", "good", "neutral", "bad", "terrible"],
      mood_level: ["amazing", "great", "good", "neutral", "bad", "terrible"],
      note_type: ["fleeting", "literature", "permanent"],
      period_enum: ["day", "week", "month", "year", "all_time"],
      project_priority: ["low", "medium", "high", "urgent"],
      project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
        "archived",
      ],
      project_visibility: ["private", "workspace", "public"],
      prompt_category: [
        "gratitude",
        "challenges",
        "wins",
        "learning",
        "planning",
        "mood",
        "goals",
        "habits",
        "relationships",
        "growth",
      ],
      prompt_frequency: ["daily", "weekly", "monthly", "occasional"],
      reflection_type: [
        "daily",
        "weekly",
        "monthly",
        "project",
        "goal",
        "habit",
        "custom",
      ],
      reminder_type: ["time_based", "location_based", "trigger_based"],
      share_type: ["read_only", "comment_enabled", "collaborative"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "done"],
      template_category: [
        "daily",
        "weekly",
        "monthly",
        "project",
        "goal_review",
        "habit_review",
        "personal",
        "professional",
        "custom",
      ],
      user_role: ["user", "team_lead", "admin", "super_admin"],
      workspace_type: ["personal", "team", "organization"],
    },
  },
} as const
