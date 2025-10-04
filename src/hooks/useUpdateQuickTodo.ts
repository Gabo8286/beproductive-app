import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UpdateQuickTodoRequest, QuickTodo } from "@/types/quickTodos";
import { toast } from "sonner";

export function useUpdateQuickTodo() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateQuickTodoRequest) => {
      const { id, ...updates } = request;

      const { data, error } = await supabase
        .from("quick_todos")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
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

      queryClient.setQueryData(
        ["quick-todos", profile?.id],
        (old: QuickTodo[] | undefined) =>
          old?.map((todo) =>
            todo.id === request.id
              ? { ...todo, ...request, updated_at: new Date().toISOString() }
              : todo,
          ) || [],
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
      toast.error("Failed to update travel note");
      console.error("Update quick todo error:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-todos"] });
    },
  });
}
