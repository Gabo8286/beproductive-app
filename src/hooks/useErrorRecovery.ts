import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRecoverySuccess?: () => void;
  onRecoveryFailure?: (error: Error) => void;
}

interface RecoveryStrategy {
  type: 'reload' | 'refetch' | 'reset' | 'retry' | 'custom';
  action?: () => Promise<void> | void;
  condition?: (error: Error) => boolean;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const queryClient = useQueryClient();
  const retryCount = useRef(0);
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRecoverySuccess,
    onRecoveryFailure,
  } = options;

  const recoverFromError = useCallback(async (
    error: Error,
    strategy: RecoveryStrategy = { type: 'retry' }
  ): Promise<boolean> => {
    console.log(`[ErrorRecovery] Attempting recovery for error: ${error.message}`);
    console.log(`[ErrorRecovery] Strategy: ${strategy.type}, Retry count: ${retryCount.current}`);

    // Check if we've exceeded max retries
    if (retryCount.current >= maxRetries) {
      console.error('[ErrorRecovery] Max retries exceeded');
      onRecoveryFailure?.(error);
      return false;
    }

    // Check if strategy condition is met
    if (strategy.condition && !strategy.condition(error)) {
      console.log('[ErrorRecovery] Strategy condition not met');
      return false;
    }

    try {
      retryCount.current += 1;

      // Add delay before retry (exponential backoff)
      const delay = retryDelay * Math.pow(2, retryCount.current - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      let recoverySuccess = false;

      switch (strategy.type) {
        case 'reload':
          console.log('[ErrorRecovery] Performing page reload');
          window.location.reload();
          recoverySuccess = true;
          break;

        case 'refetch':
          console.log('[ErrorRecovery] Refetching all queries');
          await queryClient.refetchQueries();
          recoverySuccess = true;
          break;

        case 'reset':
          console.log('[ErrorRecovery] Resetting query cache');
          queryClient.clear();
          recoverySuccess = true;
          break;

        case 'retry':
          console.log('[ErrorRecovery] Performing generic retry');
          // For generic retry, we just return true to allow the operation to be retried
          recoverySuccess = true;
          break;

        case 'custom':
          if (strategy.action) {
            console.log('[ErrorRecovery] Executing custom recovery action');
            await strategy.action();
            recoverySuccess = true;
          } else {
            console.error('[ErrorRecovery] Custom strategy requires an action');
            recoverySuccess = false;
          }
          break;

        default:
          console.error(`[ErrorRecovery] Unknown strategy type: ${strategy.type}`);
          recoverySuccess = false;
      }

      if (recoverySuccess) {
        console.log('[ErrorRecovery] Recovery successful');
        retryCount.current = 0; // Reset retry count on success
        onRecoverySuccess?.();
        return true;
      }

      return false;
    } catch (recoveryError) {
      console.error('[ErrorRecovery] Recovery attempt failed:', recoveryError);
      onRecoveryFailure?.(recoveryError as Error);
      return false;
    }
  }, [queryClient, maxRetries, retryDelay, onRecoverySuccess, onRecoveryFailure]);

  const getRecoveryStrategy = useCallback((error: Error): RecoveryStrategy => {
    const errorMessage = error.message.toLowerCase();

    // Network-related errors
    if (errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('networkerror')) {
      return {
        type: 'refetch',
        condition: (err) => err.message.toLowerCase().includes('fetch'),
      };
    }

    // Chunk loading errors (common in SPAs with code splitting)
    if (errorMessage.includes('chunk') ||
        errorMessage.includes('loading chunk') ||
        errorMessage.includes('failed to import')) {
      return {
        type: 'reload',
        condition: (err) => err.message.toLowerCase().includes('chunk'),
      };
    }

    // Authentication/authorization errors
    if (errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      return {
        type: 'custom',
        action: async () => {
          // Clear auth state and redirect to login
          localStorage.removeItem('auth');
          sessionStorage.clear();
          window.location.href = '/login';
        },
        condition: (err) => {
          const msg = err.message.toLowerCase();
          return msg.includes('unauthorized') || msg.includes('forbidden');
        },
      };
    }

    // Memory or performance related errors
    if (errorMessage.includes('memory') ||
        errorMessage.includes('heap') ||
        errorMessage.includes('out of memory')) {
      return {
        type: 'reset',
        condition: (err) => err.message.toLowerCase().includes('memory'),
      };
    }

    // Database or backend errors
    if (errorMessage.includes('database') ||
        errorMessage.includes('server error') ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503')) {
      return {
        type: 'refetch',
        condition: (err) => {
          const msg = err.message.toLowerCase();
          return msg.includes('database') || msg.includes('server') || msg.includes('50');
        },
      };
    }

    // Default strategy for unknown errors
    return {
      type: 'retry',
    };
  }, []);

  const recoverFromNetworkError = useCallback(async () => {
    const networkError = new Error('Network connection failed');
    return recoverFromError(networkError, getRecoveryStrategy(networkError));
  }, [recoverFromError, getRecoveryStrategy]);

  const recoverFromAuthError = useCallback(async () => {
    const authError = new Error('Authentication failed');
    return recoverFromError(authError, getRecoveryStrategy(authError));
  }, [recoverFromError, getRecoveryStrategy]);

  const recoverFromChunkError = useCallback(async () => {
    const chunkError = new Error('Chunk loading failed');
    return recoverFromError(chunkError, getRecoveryStrategy(chunkError));
  }, [recoverFromError, getRecoveryStrategy]);

  const resetRetryCount = useCallback(() => {
    retryCount.current = 0;
  }, []);

  const showRecoveryToast = useCallback((error: Error, strategy: RecoveryStrategy) => {
    const strategyMessages = {
      reload: 'Refreshing the page...',
      refetch: 'Reloading data...',
      reset: 'Clearing cache and restarting...',
      retry: 'Retrying operation...',
      custom: 'Attempting recovery...',
    };

    const message = strategyMessages[strategy.type] || 'Attempting recovery...';

    toast.loading(message, {
      id: 'error-recovery',
      description: `Recovery attempt ${retryCount.current} of ${maxRetries}`,
    });
  }, [maxRetries]);

  const dismissRecoveryToast = useCallback((success: boolean) => {
    toast.dismiss('error-recovery');

    if (success) {
      toast.success('Recovery successful', {
        description: 'The error has been resolved.',
      });
    } else {
      toast.error('Recovery failed', {
        description: 'Please try refreshing the page or contact support.',
      });
    }
  }, []);

  return {
    recoverFromError,
    getRecoveryStrategy,
    recoverFromNetworkError,
    recoverFromAuthError,
    recoverFromChunkError,
    resetRetryCount,
    showRecoveryToast,
    dismissRecoveryToast,
    currentRetryCount: retryCount.current,
    maxRetries,
  };
}