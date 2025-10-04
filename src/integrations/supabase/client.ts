// Safe Supabase client with timeout and error handling
// Prevents blank screen issues in Safari/Brave due to localStorage failures

import { supabase as safeSupabase, supabasePromise, getSupabaseStatus } from './safeClient';

// Export the safe client as the default export
export const supabase = safeSupabase;

// Export additional utilities for debugging and status checking
export { supabasePromise, getSupabaseStatus };

// Add startup logging
console.log('[SupabaseClient] Safe Supabase client initialized');

// Add initialization status check after a short delay
setTimeout(() => {
  const status = getSupabaseStatus();
  if (status.error) {
    console.error('[SupabaseClient] Initialization failed:', status.error);
  } else if (status.isReady) {
    console.log('[SupabaseClient] Client ready and connected');
  } else {
    console.warn('[SupabaseClient] Client still initializing...');
  }
}, 1000);