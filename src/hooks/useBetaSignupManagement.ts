import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { emailService } from "@/services/emailService";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface BetaSignup {
  id: string;
  email: string;
  name: string;
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
  invitation_token?: string;
  invitation_sent_at?: string;
  token_expires_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BetaSignupStats {
  totalSignups: number;
  pendingSignups: number;
  approvedSignups: number;
  rejectedSignups: number;
  recentSignups24h: number;
  recentSignups7d: number;
  invitationsSent: number;
  lastUpdated: string;
}

// Custom hook for beta signup management
export const useBetaSignupManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch beta signups
  const {
    data: betaSignups = [],
    isLoading: isLoadingSignups,
    error: signupsError
  } = useQuery({
    queryKey: ['betaSignups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beta_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BetaSignup[];
    },
    enabled: !!user
  });

  // Fetch beta signup stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['betaSignupStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_beta_signup_stats');
      if (error) throw error;
      return data as BetaSignupStats;
    },
    enabled: !!user
  });

  // Approve beta signup mutation
  const approveBetaSignup = useMutation({
    mutationFn: async ({
      signupId,
      language = 'en'
    }: {
      signupId: string;
      language?: 'en' | 'es'
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Call the approval function
      const { data, error } = await supabase.rpc('approve_beta_signup', {
        signup_id: signupId,
        admin_id: user.id
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Get the signup details for email
      const { data: signup, error: signupError } = await supabase
        .from('beta_signups')
        .select('*')
        .eq('id', signupId)
        .single();

      if (signupError) throw signupError;

      // Send invitation email
      const emailResult = await emailService.sendInvitationEmail(
        signup.email,
        signup.name,
        data.invitation_token,
        language,
        signupId
      );

      return {
        approval: data,
        emailSent: emailResult.success,
        emailError: emailResult.error
      };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['betaSignups'] });
      queryClient.invalidateQueries({ queryKey: ['betaSignupStats'] });
    }
  });

  // Reject beta signup mutation
  const rejectBetaSignup = useMutation({
    mutationFn: async ({
      signupId,
      reason
    }: {
      signupId: string;
      reason?: string
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('reject_beta_signup', {
        signup_id: signupId,
        admin_id: user.id,
        reason: reason || null
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betaSignups'] });
      queryClient.invalidateQueries({ queryKey: ['betaSignupStats'] });
    }
  });

  // Bulk approve mutation
  const bulkApproveBetaSignups = useMutation({
    mutationFn: async ({
      signupIds,
      language = 'en'
    }: {
      signupIds: string[];
      language?: 'en' | 'es'
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const results = [];

      for (const signupId of signupIds) {
        try {
          // Approve each signup
          const { data, error } = await supabase.rpc('approve_beta_signup', {
            signup_id: signupId,
            admin_id: user.id
          });

          if (error) throw error;
          if (!data.success) throw new Error(data.error);

          // Get signup details
          const { data: signup, error: signupError } = await supabase
            .from('beta_signups')
            .select('*')
            .eq('id', signupId)
            .single();

          if (signupError) throw signupError;

          // Send email
          const emailResult = await emailService.sendInvitationEmail(
            signup.email,
            signup.name,
            data.invitation_token,
            language,
            signupId
          );

          results.push({
            signupId,
            success: true,
            emailSent: emailResult.success,
            emailError: emailResult.error
          });

        } catch (error) {
          results.push({
            signupId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betaSignups'] });
      queryClient.invalidateQueries({ queryKey: ['betaSignupStats'] });
    }
  });

  // Resend invitation mutation
  const resendInvitation = useMutation({
    mutationFn: async ({
      signupId,
      language = 'en'
    }: {
      signupId: string;
      language?: 'en' | 'es'
    }) => {
      // Get signup details
      const { data: signup, error } = await supabase
        .from('beta_signups')
        .select('*')
        .eq('id', signupId)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      if (!signup.invitation_token) throw new Error('No invitation token found');

      // Send email
      const emailResult = await emailService.sendInvitationEmail(
        signup.email,
        signup.name,
        signup.invitation_token,
        language,
        signupId
      );

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send email');
      }

      return emailResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betaSignups'] });
    }
  });

  // Helper functions
  const getPendingSignups = useCallback(() => {
    return betaSignups.filter(signup => signup.status === 'pending');
  }, [betaSignups]);

  const getApprovedSignups = useCallback(() => {
    return betaSignups.filter(signup => signup.status === 'approved');
  }, [betaSignups]);

  const getRejectedSignups = useCallback(() => {
    return betaSignups.filter(signup => signup.status === 'rejected');
  }, [betaSignups]);

  return {
    // Data
    betaSignups,
    stats,
    pendingSignups: getPendingSignups(),
    approvedSignups: getApprovedSignups(),
    rejectedSignups: getRejectedSignups(),

    // Loading states
    isLoadingSignups,
    isLoadingStats,
    isApprovingSignup: approveBetaSignup.isPending,
    isRejectingSignup: rejectBetaSignup.isPending,
    isBulkApproving: bulkApproveBetaSignups.isPending,
    isResendingInvitation: resendInvitation.isPending,

    // Errors
    signupsError,
    statsError,
    approvalError: approveBetaSignup.error,
    rejectionError: rejectBetaSignup.error,
    bulkApprovalError: bulkApproveBetaSignups.error,
    resendError: resendInvitation.error,

    // Actions
    approveBetaSignup: approveBetaSignup.mutate,
    rejectBetaSignup: rejectBetaSignup.mutate,
    bulkApproveBetaSignups: bulkApproveBetaSignups.mutate,
    resendInvitation: resendInvitation.mutate,

    // Utilities
    refetchSignups: () => queryClient.invalidateQueries({ queryKey: ['betaSignups'] }),
    refetchStats: () => queryClient.invalidateQueries({ queryKey: ['betaSignupStats'] })
  };
};

// Hook for validating invitation tokens
export const useInvitationValidation = () => {
  const validateToken = useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        token
      });

      if (error) throw error;
      if (!data.valid) throw new Error(data.error || 'Invalid token');

      return data;
    }
  });

  return {
    validateToken: validateToken.mutate,
    validateTokenAsync: validateToken.mutateAsync,
    isValidating: validateToken.isPending,
    validationError: validateToken.error,
    validationData: validateToken.data
  };
};