import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIRecommendation, AIRecommendationStatus } from "@/types/ai-insights";
import { useToast } from "@/hooks/use-toast";

export const useAIRecommendations = (status?: AIRecommendationStatus) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ai-recommendations', status],
    queryFn: async () => {
      let query = supabase
        .from('ai_recommendations')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIRecommendation[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AIRecommendationStatus }) => {
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else if (status === 'dismissed') {
        updates.dismissed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ai_recommendations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: "Success",
        description: "Recommendation status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recommendation",
        variant: "destructive",
      });
    },
  });

  return {
    recommendations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateStatus,
  };
};
