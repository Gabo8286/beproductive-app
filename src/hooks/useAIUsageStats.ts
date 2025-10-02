import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { APIProviderType } from "@/types/api-management";

export interface AIUsageStats {
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
  by_provider: Record<APIProviderType, {
    cost: number;
    tokens: number;
    requests: number;
    avg_response_time: number;
  }>;
  daily_breakdown: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
}

export const useAIUsageStats = (days: number = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-usage-stats', user?.id, days],
    queryFn: async (): Promise<AIUsageStats> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_ai_usage_summary', {
        p_user_id: user.id,
        p_days: days,
      });

      if (error) throw error;

      return data || {
        total_cost: 0,
        total_tokens: 0,
        total_requests: 0,
        success_rate: 0,
        avg_response_time: 0,
        by_provider: {},
        daily_breakdown: [],
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });
};

export const useSystemAIUsageStats = (days: number = 30) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['system-ai-usage-stats', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_system_api_usage_stats', {
        days_back: days,
      });

      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'super_admin',
    refetchInterval: 60000, // Refresh every minute for admins
  });
};

export const useCostProjections = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cost-projections', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_cost_projections', {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useAIUsageLimits = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['ai-usage-limits'],
    queryFn: async () => {
      if (!user || profile?.role !== 'super_admin') {
        throw new Error('Super admin access required');
      }

      // Get all active API keys and their limit status
      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const limitChecks = await Promise.all(
        apiKeys.map(async (key) => {
          const { data, error } = await supabase.rpc('check_api_key_limits', {
            key_id: key.id,
          });

          if (error) {
            console.error(`Error checking limits for key ${key.id}:`, error);
            return null;
          }

          return {
            ...data,
            key_name: key.key_name,
            provider: key.provider,
          };
        })
      );

      return limitChecks.filter(Boolean);
    },
    enabled: !!user && profile?.role === 'super_admin',
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};

export const useRecentAIActivity = (limit: number = 10) => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['recent-ai-activity', limit],
    queryFn: async () => {
      if (!user || profile?.role !== 'super_admin') {
        throw new Error('Super admin access required');
      }

      const { data, error } = await supabase
        .from('api_usage_analytics')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('requested_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === 'super_admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};