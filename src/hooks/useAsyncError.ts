import { useState, useCallback } from "react";

/**
 * Hook to handle async errors in components
 * Allows throwing errors in async functions that will be caught by error boundaries
 */
export const useAsyncError = () => {
  const [, setError] = useState();

  return useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError],
  );
};
