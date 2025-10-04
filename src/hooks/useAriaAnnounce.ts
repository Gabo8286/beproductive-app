import { useCallback } from "react";
import {
  announce,
  announceSuccess,
  announceError,
  announceLoading,
  announceComplete,
} from "@/utils/accessibility/ariaAnnouncer";

/**
 * Hook for announcing messages to screen readers
 */
export const useAriaAnnounce = () => {
  const announceMessage = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      announce(message, priority);
    },
    [],
  );

  const success = useCallback((message: string) => {
    announceSuccess(message);
  }, []);

  const error = useCallback((message: string) => {
    announceError(message);
  }, []);

  const loading = useCallback((message?: string) => {
    announceLoading(message);
  }, []);

  const complete = useCallback((message: string) => {
    announceComplete(message);
  }, []);

  return {
    announce: announceMessage,
    success,
    error,
    loading,
    complete,
  };
};
