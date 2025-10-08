/**
 * Supabase client initialization with timeout and error handling
 */

import { diagnostic, diagnostics } from "@/utils/diagnostics/logger";

/**
 * Initialize Supabase client with timeout
 * Continues in degraded mode if initialization fails
 */
export async function initializeSupabase(): Promise<void> {
  await diagnostic.measure("Supabase Initialization", async () => {
    const { supabasePromise } = await import(
      "@/integrations/supabase/client"
    );
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase init timeout")), 10000),
    );

    try {
      await Promise.race([supabasePromise, timeoutPromise]);
      console.log("[Main] Supabase client ready - proceeding with render");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn("[Main] Supabase initialization warning:", errorMessage);
      diagnostics.logEvent("Supabase Initialization Failed", {
        error: errorMessage,
      });
      // Continue anyway - app may work in degraded mode
      // TODO: Consider showing non-blocking warning to user
    }
  });
}
