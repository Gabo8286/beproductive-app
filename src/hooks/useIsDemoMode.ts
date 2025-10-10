import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to detect if the current user is in demo mode
 * Demo mode is active when logged in as demo@beproductive.com
 */
export const useIsDemoMode = (): boolean => {
  const { user } = useAuth();

  // Check if user is the demo user
  return user?.email === 'demo@beproductive.com';
};

/**
 * Hook to get demo user information
 */
export const useDemoUser = () => {
  const isDemoMode = useIsDemoMode();
  const { user } = useAuth();

  return {
    isDemoMode,
    demoEmail: 'demo@beproductive.com',
    isCurrentUserDemo: isDemoMode && user?.email === 'demo@beproductive.com'
  };
};