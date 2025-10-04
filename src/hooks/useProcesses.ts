import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Process, CreateProcessInput, UpdateProcessInput, ProcessStatus, ProcessAnalytics } from "@/types/processes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useProcesses = (status?: ProcessStatus) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ['processes', user?.id, status],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useProcesses: No authenticated user found');
        throw new Error('Authentication required');
      }

      console.log('useProcesses: Fetching processes for user:', user.id);

      let query = supabase
        .from('processes')
        .select(`
          *,
          owner:profiles!processes_owner_id_fkey(id, full_name, email),
          created_by_profile:profiles!processes_created_by_fkey(id, full_name, email)
        `)
        .eq('workspace_id', user.id) // Using user_id as workspace_id for now
        .eq('is_current_version', true) // Only get current versions
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useProcesses: Query error:', error);
        throw error;
      }

      console.log('useProcesses: Successfully fetched', data?.length || 0, 'processes');
      return data as Process[];
    },
    enabled: !!user?.id && !authLoading,
  });

  const createProcess = useMutation({
    mutationFn: async (input: CreateProcessInput) => {
      if (!user?.id) throw new Error('Authentication required');

      const processData = {
        workspace_id: input.workspace_id,
        title: input.title,
        description: input.description,
        category: input.category || 'operational',
        status: 'draft' as ProcessStatus,
        complexity: input.complexity || 'moderate',
        priority: input.priority || 'medium',
        version: 1,
        is_current_version: true,
        owner_id: user.id,
        stakeholders: input.stakeholders || [],
        tags: input.tags || [],
        steps: input.steps || [],
        triggers: input.triggers || [],
        inputs: input.inputs || [],
        outputs: input.outputs || [],
        risks: input.risks || [],
        controls: input.controls || [],
        metrics: {},
        attachments: [],
        metadata: {},
        created_by: user.id,
        last_modified_by: user.id,
      };

      const { data, error } = await supabase
        .from('processes')
        .insert(processData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Success",
        description: "Process created successfully",
      });
    },
    onError: (error) => {
      console.error('Create process error:', error);
      toast({
        title: "Error",
        description: "Failed to create process",
        variant: "destructive",
      });
    },
  });

  const updateProcess = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProcessInput }) => {
      const updateData = {
        ...updates,
        last_modified_by: user?.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('processes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Success",
        description: "Process updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update process",
        variant: "destructive",
      });
    },
  });

  const updateProcessStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProcessStatus }) => {
      const updates: any = {
        status,
        last_modified_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
      }

      const { error } = await supabase
        .from('processes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Success",
        description: "Process status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update process status",
        variant: "destructive",
      });
    },
  });

  const deleteProcess = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Success",
        description: "Process deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete process",
        variant: "destructive",
      });
    },
  });

  const createProcessVersion = useMutation({
    mutationFn: async ({ processId, updates }: { processId: string; updates: UpdateProcessInput }) => {
      if (!user?.id) throw new Error('Authentication required');

      // First, get the current process
      const { data: currentProcess, error: fetchError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', processId)
        .single();

      if (fetchError) throw fetchError;

      // Mark current version as not current
      const { error: updateError } = await supabase
        .from('processes')
        .update({ is_current_version: false })
        .eq('id', processId);

      if (updateError) throw updateError;

      // Create new version
      const newVersionData = {
        ...currentProcess,
        ...updates,
        id: undefined, // Let Supabase generate new ID
        version: currentProcess.version + 1,
        is_current_version: true,
        parent_process_id: processId,
        status: 'draft' as ProcessStatus,
        last_modified_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('processes')
        .insert(newVersionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Success",
        description: "New process version created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create process version",
        variant: "destructive",
      });
    },
  });

  return {
    processes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createProcess,
    updateProcess,
    updateProcessStatus,
    deleteProcess,
    createProcessVersion,
  };
};

export const useProcessAnalytics = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['process-analytics', user?.id],
    queryFn: async (): Promise<ProcessAnalytics> => {
      if (!user?.id) throw new Error('Authentication required');

      const { data: processes, error } = await supabase
        .from('processes')
        .select('*')
        .eq('workspace_id', user.id)
        .eq('is_current_version', true);

      if (error) throw error;

      // Calculate analytics
      const analytics: ProcessAnalytics = {
        total_processes: processes.length,
        by_status: processes.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<ProcessStatus, number>),
        by_category: processes.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {} as any),
        by_complexity: processes.reduce((acc, p) => {
          acc[p.complexity] = (acc[p.complexity] || 0) + 1;
          return acc;
        }, {} as any),
        avg_completion_time: processes.reduce((sum, p) => sum + (p.metrics?.avg_completion_time || 0), 0) / processes.length || 0,
        most_executed: processes
          .sort((a, b) => (b.metrics?.total_executions || 0) - (a.metrics?.total_executions || 0))
          .slice(0, 5),
        recently_updated: processes
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5),
        pending_approvals: processes.filter(p => p.status === 'review').length,
        compliance_score: Math.round((processes.filter(p => p.status === 'approved' || p.status === 'active').length / processes.length) * 100) || 0,
      };

      return analytics;
    },
    enabled: !!user?.id && !authLoading,
  });
};