import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIInsight, InsightFilter } from "@/types/ai-insights";
import { useToast } from "@/hooks/use-toast";

export const useAIInsights = (filter?: InsightFilter) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ai-insights', filter],
    queryFn: async () => {
      let query = supabase
        .from('ai_insights')
        .select('*')
        .order('generated_at', { ascending: false });

      if (filter?.types && filter.types.length > 0) {
        query = query.in('type', filter.types);
      }

      if (filter?.isRead !== undefined) {
        query = query.eq('is_read', filter.isRead);
      }

      if (filter?.isArchived !== undefined) {
        query = query.eq('is_archived', filter.isArchived);
      }

      if (filter?.dateFrom) {
        query = query.gte('generated_at', filter.dateFrom.toISOString());
      }

      if (filter?.dateTo) {
        query = query.lte('generated_at', filter.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AIInsight[];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark insight as read",
        variant: "destructive",
      });
    },
  });

  const archiveInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_archived: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Success",
        description: "Insight archived",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive insight",
        variant: "destructive",
      });
    },
  });

  const deleteInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Success",
        description: "Insight deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete insight",
        variant: "destructive",
      });
    },
  });

  return {
    insights: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    markAsRead,
    archiveInsight,
    deleteInsight,
  };
};
