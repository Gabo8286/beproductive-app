/**
 * Hook to detect if the current user is in demo mode
 * Demo mode has been disabled for production - always returns false
 */
export const useIsDemoMode = (): boolean => {
  return false;
};

/**
 * Hook to get demo user information
 * Demo mode has been disabled for production
 */
export const useDemoUser = () => {
  return {
    isDemoMode: false,
    demoEmail: '',
    isCurrentUserDemo: false
  };
};