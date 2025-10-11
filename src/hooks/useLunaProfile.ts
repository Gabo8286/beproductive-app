import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { monitorLunaQuery } from '@/utils/supabaseMonitor';
import type { Database } from '@/integrations/supabase/types';

type LunaProfile = Database['public']['Tables']['luna_productivity_profiles']['Row'];

export function useLunaProfile(workspaceId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<LunaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user || !workspaceId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await monitorLunaQuery(
        'select-profile',
        'luna_productivity_profiles',
        async () => {
          return await supabase
            .from('luna_productivity_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('workspace_id', workspaceId)
            .single();
        }
      );

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists yet - create one
          const { data: newProfile, error: insertError } = await supabase
            .from('luna_productivity_profiles')
            .insert({
              user_id: user.id,
              workspace_id: workspaceId,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching Luna profile:', error);
      toast({
        title: 'Error loading Luna profile',
        description: 'Using local settings for now',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, workspaceId, toast]);

  const updateProfile = useCallback(async (updates: Database['public']['Tables']['luna_productivity_profiles']['Update']) => {
    if (!profile || !user) return;

    try {
      const { data, error } = await supabase
        .from('luna_productivity_profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error updating Luna profile:', error);
      toast({
        title: 'Error saving changes',
        description: 'Your changes may not be saved',
        variant: 'destructive',
      });
    }
  }, [profile, user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user || !workspaceId) return;

    const channel = supabase
      .channel('luna-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'luna_productivity_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.workspace_id === workspaceId) {
            setProfile(payload.new as LunaProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, workspaceId]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
