import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { QuickTodo, QuickTodosFilters } from "@/types/quickTodos";
import { useEffect } from "react";

export function useQuickTodos(filters: QuickTodosFilters = {}) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["quick-todos", profile?.id, filters],
    queryFn: async () => {
      if (!profile?.id) throw new Error("No user profile");

      let query = supabase
        .from("quick_todos")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      // Filter by workspace if specified
      if (filters.workspaceId) {
        query = query.eq("workspace_id", filters.workspaceId);
      }

      // Filter completed items unless explicitly included
      if (!filters.includeCompleted) {
        query = query.is("completed_at", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as QuickTodo[];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("quick_todos_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quick_todos",
          filter: `created_by=eq.${profile.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);

  return query;
}
