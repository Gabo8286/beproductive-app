interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    shouldRetry,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      const canRetry = shouldRetry
        ? shouldRetry(lastError, attempt)
        : attempt < maxAttempts;

      if (!canRetry) {
        throw lastError;
      }

      // Notify about retry
      onRetry?.(attempt, lastError);

      // Wait before retrying with exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

interface OptimisticUpdateOptions<T> {
  optimisticData: T;
  update: () => Promise<T>;
  rollback: () => void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Perform optimistic update with automatic rollback on failure
 */
export const optimisticUpdate = async <T>({
  optimisticData,
  update,
  rollback,
  onSuccess,
  onError,
}: OptimisticUpdateOptions<T>): Promise<T> => {
  try {
    // Perform the actual update
    const result = await update();
    onSuccess?.(result);
    return result;
  } catch (error) {
    // Rollback on failure
    rollback();
    onError?.(error as Error);
    throw error;
  }
};

interface CacheOptions<T> {
  key: string;
  ttl?: number; // Time to live in milliseconds
  fallback?: () => Promise<T>;
}

/**
 * Cache API responses with automatic invalidation
 */
export const withCache = <T>(
  fn: () => Promise<T>,
  options: CacheOptions<T>
): Promise<T> => {
  const { key, ttl = 5 * 60 * 1000, fallback } = options; // Default 5 minutes

  return new Promise(async (resolve, reject) => {
    try {
      // Check cache
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < ttl) {
          resolve(data);
          return;
        }
      }

      // Fetch fresh data
      const data = await fn();
      
      // Store in cache
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      resolve(data);
    } catch (error) {
      // Try fallback if available
      if (fallback) {
        try {
          const fallbackData = await fallback();
          resolve(fallbackData);
        } catch (fallbackError) {
          reject(error);
        }
      } else {
        reject(error);
      }
    }
  });
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Queue for managing sequential operations
 */
export class OperationQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
      }
    }

    this.isProcessing = false;
  }
}
