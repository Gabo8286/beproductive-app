import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AIProvider, AIInsightType } from '@/types/ai-insights';

export interface AISettings {
  id?: string;
  user_id: string;
  preferred_provider: AIProvider;
  auto_generate_insights: boolean;
  insight_frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  enabled_insight_types: AIInsightType[];
  notification_preferences: {
    new_insights: boolean;
    weekly_summary: boolean;
    task_recommendations: boolean;
    burnout_alerts: boolean;
  };
  privacy_settings: {
    share_anonymous_data: boolean;
    improve_models: boolean;
    store_conversations: boolean;
    insight_retention: '30d' | '90d' | '1y' | 'forever';
    chat_retention: '7d' | '30d' | '90d' | 'never';
  };
  coaching_style: 'supportive' | 'balanced' | 'direct' | 'analytical';
  response_length: 'brief' | 'medium' | 'detailed';
  proactive_suggestions: boolean;
  spending_limit: number;
  usage_alerts: boolean;
  auto_pause_at_limit: boolean;
  temperature: number;
  max_tokens: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: Partial<AISettings> = {
  preferred_provider: 'lovable',
  auto_generate_insights: true,
  insight_frequency: 'weekly',
  enabled_insight_types: [
    'productivity_pattern',
    'goal_progress',
    'habit_analysis',
    'time_optimization'
  ],
  notification_preferences: {
    new_insights: true,
    weekly_summary: true,
    task_recommendations: true,
    burnout_alerts: true
  },
  privacy_settings: {
    share_anonymous_data: false,
    improve_models: true,
    store_conversations: true,
    insight_retention: '90d',
    chat_retention: '30d'
  },
  coaching_style: 'balanced',
  response_length: 'medium',
  proactive_suggestions: true,
  spending_limit: 10,
  usage_alerts: true,
  auto_pause_at_limit: false,
  temperature: 0.7,
  max_tokens: 500
};

export const useAISettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch AI settings
  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['ai-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // If no settings exist, create default settings
      if (!data) {
        const defaultSettings = {
          ...DEFAULT_SETTINGS,
          user_id: user.id
        };

        const { data: newSettings, error: createError } = await supabase
          .from('ai_user_preferences')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        return newSettings as AISettings;
      }

      return data as AISettings;
    },
    enabled: !!user?.id
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<AISettings>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_user_preferences')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as AISettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-settings', user?.id], data);
      toast.success('AI settings updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update AI settings:', error);
      toast.error('Failed to update AI settings');
    }
  });

  // Reset to defaults
  const resetToDefaults = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const defaultSettings = {
        ...DEFAULT_SETTINGS,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ai_user_preferences')
        .update(defaultSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as AISettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-settings', user?.id], data);
      toast.success('Settings reset to defaults');
    },
    onError: (error) => {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  });

  // Clear all AI data
  const clearAllData = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete insights
      const { error: insightsError } = await supabase
        .from('ai_insights')
        .delete()
        .eq('user_id', user.id);

      if (insightsError) throw insightsError;

      // Delete recommendations
      const { error: recsError } = await supabase
        .from('ai_recommendations')
        .delete()
        .eq('user_id', user.id);

      if (recsError) throw recsError;

      // Delete service usage logs
      const { error: usageError } = await supabase
        .from('ai_service_usage')
        .delete()
        .eq('user_id', user.id);

      if (usageError) throw usageError;

      return true;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-usage-stats'] });
      toast.success('All AI data cleared successfully');
    },
    onError: (error) => {
      console.error('Failed to clear AI data:', error);
      toast.error('Failed to clear AI data');
    }
  });

  // Export settings
  const exportSettings = () => {
    if (!settings) return;

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      settings: {
        ...settings,
        // Remove sensitive data
        id: undefined,
        user_id: undefined,
        created_at: undefined,
        updated_at: undefined
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Settings exported successfully');
  };

  // Import settings
  const importSettings = useMutation({
    mutationFn: async (importData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate import data
      if (!importData.settings) {
        throw new Error('Invalid settings file format');
      }

      const importedSettings = {
        ...importData.settings,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Merge with current settings to preserve any new fields
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...importedSettings
      };

      const { data, error } = await supabase
        .from('ai_user_preferences')
        .update(mergedSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as AISettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-settings', user?.id], data);
      toast.success('Settings imported successfully');
    },
    onError: (error) => {
      console.error('Failed to import settings:', error);
      toast.error('Failed to import settings: ' + error.message);
    }
  });

  // Get setting value with fallback to default
  const getSetting = (key: keyof AISettings) => {
    return settings?.[key] ?? DEFAULT_SETTINGS[key];
  };

  // Check if user has specific feature enabled
  const isFeatureEnabled = (feature: string): boolean => {
    switch (feature) {
      case 'auto_insights':
        return getSetting('auto_generate_insights') as boolean;
      case 'proactive_suggestions':
        return getSetting('proactive_suggestions') as boolean;
      case 'usage_alerts':
        return getSetting('usage_alerts') as boolean;
      default:
        return false;
    }
  };

  // Check if insight type is enabled
  const isInsightTypeEnabled = (type: AIInsightType): boolean => {
    const enabledTypes = getSetting('enabled_insight_types') as AIInsightType[];
    return enabledTypes.includes(type);
  };

  // Check if notification is enabled
  const isNotificationEnabled = (type: string): boolean => {
    const prefs = getSetting('notification_preferences') as AISettings['notification_preferences'];
    return prefs[type as keyof typeof prefs] !== false;
  };

  return {
    settings,
    isLoading,
    error: error?.message,
    updateSettings: updateSettings.mutate,
    resetToDefaults: resetToDefaults.mutate,
    clearAllData: clearAllData.mutate,
    exportSettings,
    importSettings: importSettings.mutate,
    getSetting,
    isFeatureEnabled,
    isInsightTypeEnabled,
    isNotificationEnabled,
    isUpdating: updateSettings.isPending || resetToDefaults.isPending || importSettings.isPending,
    isClearing: clearAllData.isPending
  };
};