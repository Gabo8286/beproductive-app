import { Database } from "@/integrations/supabase/types";

export type QuickTodo = Database["public"]["Tables"]["quick_todos"]["Row"];
export type QuickTodoInsert =
  Database["public"]["Tables"]["quick_todos"]["Insert"];
export type QuickTodoUpdate =
  Database["public"]["Tables"]["quick_todos"]["Update"];

export interface CreateQuickTodoRequest {
  content: string;
  position?: number;
}

export interface UpdateQuickTodoRequest {
  id: string;
  content?: string;
  position?: number;
  completed_at?: string | null;
}

export interface QuickTodosFilters {
  includeCompleted?: boolean;
  workspaceId?: string;
}
