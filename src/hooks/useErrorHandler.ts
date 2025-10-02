import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiError, getErrorMessage, getErrorTitle, isRetryable } from '@/utils/errors/apiErrors';
import { logger } from '@/utils/errors/logger';

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error | ApiError, context?: Record<string, any>) => {
    // Log the error
    logger.error('Error occurred', error, context);

    // Show toast notification
    const title = ApiError.isApiError(error) ? getErrorTitle(error) : 'Error';
    const description = getErrorMessage(error);

    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const handleErrorWithRetry = useCallback((
    error: Error | ApiError,
    retryFn: () => void,
    context?: Record<string, any>
  ) => {
    logger.error('Error occurred with retry option', error, context);

    const title = ApiError.isApiError(error) ? getErrorTitle(error) : 'Error';
    const description = getErrorMessage(error);
    const canRetry = isRetryable(error);

    // Show error with retry instruction
    toast({
      title,
      description: canRetry 
        ? `${description} Please try again.`
        : description,
      variant: 'destructive',
    });

    // If retryable, log the retry function for manual use
    if (canRetry && context) {
      logger.info('Retry function available', context);
    }
  }, [toast]);

  const handleSuccess = useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
    });
  }, [toast]);

  return {
    handleError,
    handleErrorWithRetry,
    handleSuccess,
  };
};
