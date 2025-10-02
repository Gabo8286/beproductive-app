import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

// Get default workspace for current user
const useDefaultWorkspace = () => {
  return useQuery({
    queryKey: ["defaultWorkspace"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .eq("type", "personal")
        .single();

      if (error) throw error;
      return data;
    },
  });
};

// Get all tags for current workspace
export const useTags = () => {
  const { data: workspace } = useDefaultWorkspace();

  return useQuery({
    queryKey: ["tags", workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!workspace,
  });
};

// Get tag suggestions based on query
export const useTagSuggestions = (query: string) => {
  const { data: workspace } = useDefaultWorkspace();

  return useQuery({
    queryKey: ["tagSuggestions", workspace?.id, query],
    queryFn: async () => {
      if (!workspace || !query) return [];

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("workspace_id", workspace.id)
        .ilike("name", `%${query}%`)
        .order("usage_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!workspace && query.length > 0,
  });
};

// Create a new tag
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: workspace } = useDefaultWorkspace();

  return useMutation({
    mutationFn: async (tag: Omit<TagInsert, "workspace_id" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      if (!workspace) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("tags")
        .insert({
          ...tag,
          workspace_id: workspace.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Tag created",
        description: "Your tag has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update an existing tag
export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TagUpdate }) => {
      const { data, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Tag updated",
        description: "Your tag has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete a tag
export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Tag deleted",
        description: "Your tag has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
