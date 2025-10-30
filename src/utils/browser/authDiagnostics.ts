// Browser compatibility and authentication diagnostics
// Helps debug authentication issues across different browsers

export interface AuthDiagnostics {
  browser: string;
  userAgent: string;
  isPrivateMode: boolean | null;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
  environmentVariables: {
    localMode: string;
    supabaseUrl: string;
    supabaseKey: string;
  };
  networkConnectivity: {
    canReachSupabase: boolean | null;
    error?: string;
  };
  securityFeatures: {
    isHttps: boolean;
    hasContentSecurityPolicy: boolean;
    hasCors: boolean;
  };
}

/**
 * Detect browser type
 */
function detectBrowser(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Brave')) return 'Brave';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';

  return 'Unknown';
}

/**
 * Check if browser is in private/incognito mode
 */
async function isPrivateMode(): Promise<boolean | null> {
  try {
    // Test various methods to detect private mode

    // Method 1: Request persistent storage (fails in private mode)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota && estimate.quota < 120000000; // Less than ~120MB suggests private mode
    }

    // Method 2: IndexedDB test (Brave specific)
    if (window.indexedDB) {
      const db = indexedDB.open('test');
      return new Promise((resolve) => {
        db.onerror = () => resolve(true); // Private mode
        db.onsuccess = () => {
          indexedDB.deleteDatabase('test');
          resolve(false); // Normal mode
        };
      });
    }

    return null; // Cannot determine
  } catch (error) {
    console.warn('[AuthDiagnostics] Private mode detection failed:', error);
    return null;
  }
}

/**
 * Test local and session storage
 */
function testStorage() {
  const testKey = 'test_storage_' + Date.now();
  const testValue = 'test';

  const localStorage = (() => {
    try {
      window.localStorage.setItem(testKey, testValue);
      const value = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      return value === testValue;
    } catch {
      return false;
    }
  })();

  const sessionStorage = (() => {
    try {
      window.sessionStorage.setItem(testKey, testValue);
      const value = window.sessionStorage.getItem(testKey);
      window.sessionStorage.removeItem(testKey);
      return value === testValue;
    } catch {
      return false;
    }
  })();

  return { localStorage, sessionStorage };
}

/**
 * Test network connectivity to Supabase
 */
async function testSupabaseConnectivity(): Promise<{ canReachSupabase: boolean; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return { canReachSupabase: false, error: 'VITE_SUPABASE_URL not configured' };
    }

    // Test basic connectivity
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey || '',
      },
    });

    return { canReachSupabase: response.ok };
  } catch (error) {
    return {
      canReachSupabase: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check security features
 */
function checkSecurityFeatures() {
  const isHttps = window.location.protocol === 'https:';

  // Check for Content Security Policy
  const hasContentSecurityPolicy = (() => {
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  })();

  // Basic CORS check (simplified)
  const hasCors = 'fetch' in window;

  return {
    isHttps,
    hasContentSecurityPolicy,
    hasCors,
  };
}

/**
 * Run comprehensive authentication diagnostics
 */
export async function runAuthDiagnostics(): Promise<AuthDiagnostics> {
  console.log('[AuthDiagnostics] Running browser compatibility diagnostics...');

  const browser = detectBrowser();
  const privateMode = await isPrivateMode();
  const storage = testStorage();
  const connectivity = await testSupabaseConnectivity();
  const security = checkSecurityFeatures();

  const diagnostics: AuthDiagnostics = {
    browser,
    userAgent: navigator.userAgent,
    isPrivateMode: privateMode,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageEnabled: storage.localStorage,
    sessionStorageEnabled: storage.sessionStorage,
    environmentVariables: {
      localMode: import.meta.env.VITE_LOCAL_MODE || 'undefined',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'undefined',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[CONFIGURED]' : 'undefined',
    },
    networkConnectivity: connectivity,
    securityFeatures: security,
  };

  console.log('[AuthDiagnostics] Diagnostics complete:', diagnostics);
  return diagnostics;
}

/**
 * Display user-friendly diagnostic information
 */
export function displayDiagnostics(diagnostics: AuthDiagnostics): string {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for known issues
  if (diagnostics.browser === 'Brave') {
    if (diagnostics.isPrivateMode) {
      issues.push('Brave private window detected');
      recommendations.push('Try using a normal (non-private) Brave window');
    }
    if (!diagnostics.localStorageEnabled) {
      issues.push('Local storage disabled');
      recommendations.push('Check Brave privacy settings and allow local storage for this site');
    }
    recommendations.push('Consider allowing this site in Brave Shields settings');
  }

  if (!diagnostics.cookiesEnabled) {
    issues.push('Cookies disabled');
    recommendations.push('Enable cookies for authentication to work');
  }

  if (!diagnostics.networkConnectivity.canReachSupabase) {
    issues.push(`Cannot reach Supabase: ${diagnostics.networkConnectivity.error}`);
    recommendations.push('Check your internet connection and firewall settings');
  }

  if (diagnostics.environmentVariables.localMode === 'true') {
    issues.push('Local mode enabled but no local auth service');
    recommendations.push('This appears to be a configuration issue - please contact support');
  }

  // Generate user-friendly message
  let message = `🔍 **Browser Diagnostics**\n`;
  message += `Browser: ${diagnostics.browser}\n`;
  message += `Private Mode: ${diagnostics.isPrivateMode ? 'Yes' : diagnostics.isPrivateMode === null ? 'Unknown' : 'No'}\n`;
  message += `Local Storage: ${diagnostics.localStorageEnabled ? 'Enabled' : 'Disabled'}\n`;
  message += `Supabase Connection: ${diagnostics.networkConnectivity.canReachSupabase ? 'Working' : 'Failed'}\n\n`;

  if (issues.length > 0) {
    message += `⚠️ **Issues Found:**\n${issues.map(issue => `• ${issue}`).join('\n')}\n\n`;
  }

  if (recommendations.length > 0) {
    message += `💡 **Recommendations:**\n${recommendations.map(rec => `• ${rec}`).join('\n')}\n`;
  }

  return message;
}