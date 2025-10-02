import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WifiOff, Wifi } from 'lucide-react';

export const useOfflineDetection = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored.',
        className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "You're Offline",
        description: 'Some features may be limited without an internet connection.',
        variant: 'destructive',
        duration: Infinity, // Keep visible until back online
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return { isOffline };
};
