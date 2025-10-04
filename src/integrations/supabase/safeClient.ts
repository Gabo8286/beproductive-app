import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { safeStorage } from '@/utils/storage/safeStorage';

/**
 * Environment variable validation
 */
function validateEnvironment(): { url: string; key: string; isValid: boolean; errors: string[] } {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const errors: string[] = [];

  if (!url) {
    errors.push('VITE_SUPABASE_URL is not defined');
  } else if (!url.startsWith('http')) {
    errors.push('VITE_SUPABASE_URL must be a valid URL');
  }

  if (!key) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY is not defined');
  } else if (key.length < 20) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY appears to be invalid');
  }

  return {
    url: url || '',
    key: key || '',
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Safe localStorage adapter for Supabase
 */
class SafeStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return safeStorage.getItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to get item "${key}":`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      safeStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to set item "${key}":`, error);
      // Don't throw - just log and continue
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      safeStorage.removeItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to remove item "${key}":`, error);
      // Don't throw - just log and continue
    }
  }
}

/**
 * Safe Supabase client factory
 */
class SafeSupabaseClient {
  private client: SupabaseClient<Database> | null = null;
  private initializationPromise: Promise<SupabaseClient<Database> | null> | null = null;
  private initializationTimeout = 10000; // 10 seconds
  private isInitialized = false;
  private initializationError: string | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient(): Promise<SupabaseClient<Database> | null> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.createClientWithTimeout();
    return this.initializationPromise;
  }

  private async createClientWithTimeout(): Promise<SupabaseClient<Database> | null> {
    return new Promise((resolve) => {
      // Set timeout for initialization
      const timeoutId = setTimeout(() => {
        console.error('[SafeSupabase] Initialization timed out after', this.initializationTimeout, 'ms');
        this.initializationError = 'Supabase initialization timed out';
        this.isInitialized = true;
        resolve(null);
      }, this.initializationTimeout);

      try {
        // Validate environment variables first
        const env = validateEnvironment();
        if (!env.isValid) {
          console.error('[SafeSupabase] Environment validation failed:', env.errors);
          this.initializationError = `Environment validation failed: ${env.errors.join(', ')}`;
          clearTimeout(timeoutId);
          this.isInitialized = true;
          resolve(null);
          return;
        }

        console.log('[SafeSupabase] Creating Supabase client...');

        // Create client with safe storage
        const client = createClient<Database>(env.url, env.key, {
          auth: {
            storage: new SafeStorageAdapter() as any,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
          },
          // Add connection timeout
          global: {
            headers: {
              'x-client-timeout': '10000',
            },
          },
        });

        // Test the client connection
        client.auth.onAuthStateChange((event, session) => {
          console.log('[SafeSupabase] Auth state changed:', event, session ? 'session exists' : 'no session');
        });

        // Try to get initial session to test connectivity
        client.auth.getSession()
          .then(({ data, error }) => {
            if (error) {
              console.warn('[SafeSupabase] Initial session check warning:', error.message);
              // Don't fail initialization for session errors - they might not be logged in
            }
            console.log('[SafeSupabase] Client initialized successfully');
            this.client = client;
            this.isInitialized = true;
            clearTimeout(timeoutId);
            resolve(client);
          })
          .catch((error) => {
            console.error('[SafeSupabase] Failed to get initial session:', error);
            this.initializationError = `Failed to connect to Supabase: ${error.message}`;
            this.isInitialized = true;
            clearTimeout(timeoutId);
            resolve(null);
          });

      } catch (error) {
        console.error('[SafeSupabase] Failed to create client:', error);
        this.initializationError = `Failed to create Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.isInitialized = true;
        clearTimeout(timeoutId);
        resolve(null);
      }
    });
  }

  /**
   * Get the Supabase client (async, with timeout)
   */
  async getClient(): Promise<SupabaseClient<Database> | null> {
    if (this.isInitialized) {
      return this.client;
    }

    return this.initializeClient();
  }

  /**
   * Get the Supabase client synchronously (may return null if not ready)
   */
  getClientSync(): SupabaseClient<Database> | null {
    return this.client;
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Check if there was an initialization error
   */
  getInitializationError(): string | null {
    return this.initializationError;
  }

  /**
   * Get initialization status
   */
  getStatus(): {
    isInitialized: boolean;
    isReady: boolean;
    error: string | null;
    hasClient: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isReady: this.isReady(),
      error: this.initializationError,
      hasClient: this.client !== null,
    };
  }
}

// Create singleton instance
const safeSupabaseClient = new SafeSupabaseClient();

// Export both the safe client and a compatibility wrapper
export { safeSupabaseClient };

// Export a promise that resolves to the client for compatibility
export const supabasePromise = safeSupabaseClient.getClient();

// Export a sync client for immediate use (may be null)
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = safeSupabaseClient.getClientSync();
    if (!client) {
      // Return a placeholder that throws meaningful errors
      if (typeof prop === 'string') {
        return () => {
          const error = safeSupabaseClient.getInitializationError() || 'Supabase client not ready';
          throw new Error(`[SafeSupabase] Cannot access ${prop}: ${error}`);
        };
      }
      return undefined;
    }
    return (client as any)[prop];
  },
});

// Export status checker
export const getSupabaseStatus = () => safeSupabaseClient.getStatus();