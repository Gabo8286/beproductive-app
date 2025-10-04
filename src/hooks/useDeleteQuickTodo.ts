import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { QuickTodo } from "@/types/quickTodos";
import { toast } from "sonner";

export function useDeleteQuickTodo() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quick_todos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["quick-todos"] });

      const previousQuickTodos = queryClient.getQueryData([
        "quick-todos",
        profile?.id,
      ]);

      queryClient.setQueryData(
        ["quick-todos", profile?.id],
        (old: QuickTodo[] | undefined) =>
          old?.filter((todo) => todo.id !== id) || [],
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
      toast.error("Failed to delete travel note");
      console.error("Delete quick todo error:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
    },
  });
}
