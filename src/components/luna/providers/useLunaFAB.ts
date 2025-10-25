import { useContext } from 'react';
import { LunaFABContext } from '@/components/luna/providers/LunaFABProvider';

/**
 * Hook to access Luna FAB functionality from any component
 * This allows components to control the Luna overlay without direct prop drilling
 */
export const useLunaFAB = () => {
  const context = useContext(LunaFABContext);
  if (context === undefined) {
    throw new Error('useLunaFAB must be used within a LunaFABProvider');
  }
  return context;
};