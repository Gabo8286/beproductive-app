import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useToggleQuickTodoCompletion() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("toggle_quick_todo_completion", {
        quick_todo_id: id,
      });

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
    },
    onError: (error) => {
      toast.error("Failed to toggle completion");
      console.error("Toggle completion error:", error);
    },
  });
}

export function useClearCompletedQuickTodos() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { error } = await supabase.rpc("clear_completed_quick_todos", {
        workspace_uuid: workspaceId,
      });

      if (error) throw error;
      return workspaceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
      toast.success("Completed travel notes cleared");
    },
    onError: (error) => {
      toast.error("Failed to clear completed notes");
      console.error("Clear completed error:", error);
    },
  });
}
