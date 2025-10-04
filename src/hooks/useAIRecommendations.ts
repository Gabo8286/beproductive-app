import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIRecommendation, AIRecommendationStatus } from "@/types/ai-insights";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAIRecommendations = (status?: AIRecommendationStatus) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["ai-recommendations", user?.id, status],
    queryFn: async () => {
      if (!user?.id) {
        console.log("useAIRecommendations: No authenticated user found");
        throw new Error("Authentication required");
      }

      console.log(
        "useAIRecommendations: Fetching recommendations for user:",
        user.id,
      );

      let query = supabase
        .from("ai_recommendations")
        .select("*")
        .eq("user_id", user.id) // Critical: Filter by user_id for RLS policies
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("useAIRecommendations: Query error:", error);
        throw error;
      }

      console.log(
        "useAIRecommendations: Successfully fetched",
        data?.length || 0,
        "recommendations",
      );
      return data as AIRecommendation[];
    },
    enabled: !!user?.id && !authLoading, // Only run query when user is authenticated
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AIRecommendationStatus;
    }) => {
      const updates: any = { status };

      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      } else if (status === "dismissed") {
        updates.dismissed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("ai_recommendations")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
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
