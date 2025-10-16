import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { safeStorage } from "@/utils/storage/safeStorage";

/**
 * Environment variable validation
 */
function validateEnvironment(): {
  url: string;
  key: string;
  isValid: boolean;
  errors: string[];
} {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const errors: string[] = [];

  if (!url) {
    errors.push("VITE_SUPABASE_URL is not defined");
  } else if (!url.startsWith("http")) {
    errors.push("VITE_SUPABASE_URL must be a valid URL");
  }

  if (!key) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is not defined");
  } else if (key.length < 20) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY appears to be invalid");
  }

  return {
    url: url || "",
    key: key || "",
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
  private initializationPromise: Promise<SupabaseClient<Database> | null> | null =
    null;
  private initializationTimeout = 15000; // 15 seconds for Docker environments
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
      // Set timeout for initialization - reduced to 5 seconds
      const timeoutId = setTimeout(() => {
        console.warn(
          "[SafeSupabase] Initialization timed out after 5s - continuing in offline mode"
        );
        this.initializationError = "Backend connection timed out";
        this.isInitialized = true;
        resolve(null);
      }, 5000);

      try {
        // Validate environment variables first
        const env = validateEnvironment();
        if (!env.isValid) {
          console.error(
            "[SafeSupabase] Environment validation failed:",
            env.errors,
          );
          this.initializationError = `Environment validation failed: ${env.errors.join(", ")}`;
          clearTimeout(timeoutId);
          this.isInitialized = true;
          resolve(null);
          return;
        }

        console.log("[SafeSupabase] Creating Supabase client...");

        // Create client with safe storage
        const client = createClient<Database>(env.url, env.key, {
          auth: {
            storage: new SafeStorageAdapter() as any,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
          // Add connection timeout
          global: {
            headers: {
              "x-client-timeout": "5000",
            },
          },
        });

        // Set client immediately and mark as initialized
        this.client = client;
        this.isInitialized = true;
        clearTimeout(timeoutId);

        console.log("[SafeSupabase] Client created successfully");

        // Set up auth state listener (but don't wait for it)
        try {
          client.auth.onAuthStateChange((event, session) => {
            console.log(
              "[SafeSupabase] Auth state changed:",
              event,
              session ? "session exists" : "no session",
            );
          });
        } catch (error) {
          console.warn("[SafeSupabase] Failed to set up auth listener:", error);
        }

        // Test connectivity in background (don't block initialization)
        client.auth
          .getSession()
          .then(({ data, error }) => {
            if (error) {
              console.warn(
                "[SafeSupabase] Initial session check warning:",
                error.message,
              );
            } else {
              console.log("[SafeSupabase] Session check completed successfully");
            }
          })
          .catch((error) => {
            console.warn(
              "[SafeSupabase] Background session check failed:",
              error,
            );
          });

        resolve(client);
      } catch (error) {
        console.error("[SafeSupabase] Failed to create client:", error);
        this.initializationError = `Failed to create Supabase client: ${error instanceof Error ? error.message : "Unknown error"}`;
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
      // For auth property, return a proxy that handles auth methods
      if (prop === 'auth') {
        return new Proxy(
          {},
          {
            get: (nestedTarget, nestedProp) => {
              // For onAuthStateChange specifically, return a function that does nothing
              if (nestedProp === 'onAuthStateChange') {
                return () => {
                  console.warn('[SafeSupabase] onAuthStateChange called but client not ready');
                  return { data: { subscription: { unsubscribe: () => {} } } };
                };
              }
              // For other auth methods, return a function that throws a meaningful error
              return (...args: any[]) => {
                const error =
                  safeSupabaseClient.getInitializationError() ||
                  "Supabase client not ready";
                throw new Error(
                  `[SafeSupabase] Cannot access auth.${String(nestedProp)}: ${error}`,
                );
              };
            },
            // Handle property existence checks (like 'in' operator)
            has: () => false,
          },
        );
      }

      console.warn(
        `[SafeSupabase] Client not ready, accessed property: ${String(prop)}`,
      );
      // Return a function that throws a meaningful error for other properties
      return (...args: any[]) => {
        const error =
          safeSupabaseClient.getInitializationError() ||
          "Supabase client not ready";
        throw new Error(
          `[SafeSupabase] Cannot access ${String(prop)}: ${error}`,
        );
      };
    }

    const value = (client as any)[prop];
    // If it's a function, bind it to the client to preserve context
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  // Handle property existence checks
  has: (target, prop) => {
    const client = safeSupabaseClient.getClientSync();
    return client ? prop in client : false;
  },
});

// Export status checker
export const getSupabaseStatus = () => safeSupabaseClient.getStatus();
