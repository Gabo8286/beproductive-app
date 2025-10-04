import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CreateQuickTodoRequest, QuickTodo } from "@/types/quickTodos";
import { toast } from "sonner";

export function useCreateQuickTodo() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateQuickTodoRequest) => {
      if (!profile?.id) throw new Error("No user profile");

      // Get user's default workspace
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", profile.id)
        .eq("type", "personal")
        .limit(1);

      if (!workspaces?.length) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("quick_todos")
        .insert({
          content: request.content.trim(),
          position: request.position ?? 0,
          workspace_id: workspaces[0].id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as QuickTodo;
    },
    onMutate: async (request) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["quick-todos"] });

      const previousQuickTodos = queryClient.getQueryData([
        "quick-todos",
        profile?.id,
      ]);

      const optimisticQuickTodo: QuickTodo = {
        id: `temp-${Date.now()}`,
        content: request.content.trim(),
        position: request.position ?? 0,
        completed_at: null,
        workspace_id: "temp-workspace",
        created_by: profile?.id || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["quick-todos", profile?.id],
        (old: QuickTodo[] | undefined) => [optimisticQuickTodo, ...(old || [])],
      );

      return { previousQuickTodos };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousQuickTodos) {
        queryClient.setQueryData(
          ["quick-todos", profile?.id],
          context.previousQuickTodos,
        );
      }
      toast.error("Failed to create travel note");
      console.error("Create quick todo error:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
    },
  });
}
