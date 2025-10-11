import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for tracking Luna Local Intelligence usage
 * Logs whether requests are handled locally vs via API
 * Calculates API reduction percentage
 * 
 * Usage:
 * const { trackLunaRequest } = useLunaLocalTracking();
 * trackLunaRequest('chat', true, 150, 0.95);
 * 
 * Performance: Measures 60% API reduction goal
 * Impact: Enables cost optimization tracking
 */
export function useLunaLocalTracking() {
  const { user } = useAuth();

  const trackLunaRequest = useCallback(
    async (
      requestType: string,
      handledLocally: boolean,
      executionTimeMs: number,
      confidenceScore?: number
    ) => {
      if (!user) return;

      try {
        // Use the optimized database function
        const { error } = await supabase.rpc('log_luna_local_usage', {
          user_id_param: user.id,
          request_type_param: requestType,
          handled_locally_param: handledLocally,
          execution_time_param: executionTimeMs,
          confidence_param: confidenceScore || null,
        });

        if (error) {
          console.error('Error tracking Luna request:', error);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `🤖 Luna ${handledLocally ? 'Local' : 'API'}: ${requestType} in ${executionTimeMs.toFixed(2)}ms`,
            confidenceScore ? `(confidence: ${(confidenceScore * 100).toFixed(1)}%)` : ''
          );
        }
      } catch (err) {
        console.error('Failed to track Luna request:', err);
      }
    },
    [user]
  );

  const getApiReductionStats = useCallback(async () => {
    if (!user) return null;

    try {
      // Get performance insights including API reduction
      const { data, error } = await supabase.rpc('get_performance_insights', {
        user_id_param: user.id,
      });

      if (error) throw error;

      const stats = data as any;
      return {
        apiReductionPercent: stats?.api_reduction_percent || 0,
        avgLocalResponseTime: stats?.avg_local_response_time_ms || 0,
        totalRequests7d: stats?.total_requests_7d || 0,
        localRequests7d: stats?.local_requests_7d || 0,
      };
    } catch (err) {
      console.error('Error fetching API reduction stats:', err);
      return null;
    }
  }, [user]);

  return {
    trackLunaRequest,
    getApiReductionStats,
  };
}
