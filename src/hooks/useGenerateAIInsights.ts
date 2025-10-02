import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductivityAnalyzer } from "@/services/ai/productivityAnalyzer";
import { AIInsightType } from "@/types/ai-insights";
import { useAuth } from "@/contexts/AuthContext";

export const useGenerateAIInsights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const generateInsights = useMutation({
    mutationFn: async (types?: AIInsightType[]) => {
      if (!user) throw new Error("User not authenticated");

      const analyzer = new ProductivityAnalyzer();
      const results = await analyzer.generateInsights(user.id, types);

      // Save insights to database
      const insightsToInsert = results.map(result => ({
        user_id: user.id,
        type: result.type,
        title: result.title,
        content: result.content,
        summary: result.summary,
        provider: 'lovable' as const,
        confidence_score: result.confidence_score,
        data_sources: result.data_sources,
        metadata: {},
      }));

      const { data: insertedInsights, error: insightsError } = await supabase
        .from('ai_insights')
        .insert(insightsToInsert)
        .select();

      if (insightsError) throw insightsError;

      // Save recommendations
      const recommendationsToInsert = results.flatMap((result, idx) => 
        result.recommendations.map(rec => ({
          insight_id: insertedInsights[idx]?.id,
          user_id: user.id,
          title: rec.title,
          description: rec.description,
          implementation_steps: rec.implementation_steps,
          expected_impact: rec.expected_impact,
          effort_level: rec.effort_level,
          priority: rec.priority,
          metadata: {},
        }))
      );

      if (recommendationsToInsert.length > 0) {
        const { error: recsError } = await supabase
          .from('ai_recommendations')
          .insert(recommendationsToInsert);

        if (recsError) throw recsError;
      }

      return insertedInsights;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: "Success",
        description: "AI insights generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  return {
    generateInsights: generateInsights.mutate,
    isGenerating: generateInsights.isPending,
  };
};
