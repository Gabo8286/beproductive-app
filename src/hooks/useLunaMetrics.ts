import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { monitorLunaQuery } from '@/utils/supabaseMonitor';
import type { Database } from '@/integrations/supabase/types';

type LunaMetric = Database['public']['Tables']['luna_productivity_metrics']['Row'];

export function useLunaMetrics() {
  const { user } = useAuth();

  const recordMetric = useCallback(async (
    profileId: string,
    metricData: {
      metric_id: string;
      category: string;
      name: string;
      value: number;
      target?: string;
      trend?: 'improving' | 'stable' | 'declining';
      source?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('luna_productivity_metrics')
        .insert({
          user_id: user.id,
          profile_id: profileId,
          ...metricData,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }, [user]);

  const getMetricsHistory = useCallback(async (
    profileId: string,
    category?: string,
    limit: number = 100
  ) => {
    if (!user) return [];

    try {
      // Wrap query with performance monitoring
      const result = await monitorLunaQuery(
        'select-metrics-history',
        'luna_productivity_metrics',
        async () => {
          let query = supabase
            .from('luna_productivity_metrics')
            .select('*')
            .eq('profile_id', profileId)
            .order('recorded_at', { ascending: false })
            .limit(limit);

          if (category) {
            query = query.eq('category', category);
          }

          return await query;
        }
      );

      if (result.error) throw result.error;
      return result.data || [];
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return [];
    }
  }, [user]);

  return { recordMetric, getMetricsHistory };
}
