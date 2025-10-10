import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type LunaInsight = Database['public']['Tables']['luna_proactive_insights']['Row'];

export function useLunaInsights(profileId?: string) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<LunaInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!user || !profileId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('luna_proactive_insights')
        .select('*')
        .eq('profile_id', profileId)
        .eq('dismissed', false)
        .gt('expires_at', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profileId]);

  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('luna_proactive_insights')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', insightId);

      if (error) throw error;
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  }, []);

  const markInsightActedUpon = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('luna_proactive_insights')
        .update({
          acted_upon: true,
          acted_at: new Date().toISOString(),
        })
        .eq('id', insightId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking insight as acted upon:', error);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user || !profileId) return;

    const channel = supabase
      .channel('luna-insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'luna_proactive_insights',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          fetchInsights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profileId, fetchInsights]);

  return { insights, loading, dismissInsight, markInsightActedUpon, refetch: fetchInsights };
}
