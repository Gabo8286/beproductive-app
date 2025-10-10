// Local authentication adapter for development
// Provides Supabase-compatible auth interface for local backend

export interface LocalAuthUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  user_metadata: Record<string, any>;
}

export interface LocalAuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: LocalAuthUser;
}

export interface LocalAuthResponse {
  data?: {
    user?: LocalAuthUser;
    session?: LocalAuthSession;
  };
  error?: {
    message: string;
    status?: number;
  };
}

class LocalAuthAdapter {
  private baseUrl: string;
  private currentSession: LocalAuthSession | null = null;
  private listeners: Array<(event: string, session: LocalAuthSession | null) => void> = [];

  constructor() {
    // Use local auth service URL - support Docker environment
    const dockerLocalMode = window.location.hostname === 'localhost' && window.location.port === '8080';
    this.baseUrl = dockerLocalMode ? 'http://localhost:9999' : (import.meta.env.VITE_LOCAL_AUTH_URL || 'http://localhost:9999');
    console.log('[LocalAuth] Initializing with baseUrl:', this.baseUrl, 'dockerLocalMode:', dockerLocalMode);

    // Try to restore session from localStorage
    this.restoreSession();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header if we have a session
    if (this.currentSession && !endpoint.includes('/token')) {
      headers['Authorization'] = `Bearer ${this.currentSession.access_token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error_description || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[LocalAuth] Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private saveSession(session: LocalAuthSession) {
    this.currentSession = session;
    try {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } catch (error) {
      console.warn('[LocalAuth] Failed to save session to localStorage:', error);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener('SIGNED_IN', session);
      } catch (error) {
        console.error('[LocalAuth] Listener error:', error);
      }
    });
  }

  private clearSession() {
    this.currentSession = null;
    try {
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.warn('[LocalAuth] Failed to clear session from localStorage:', error);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener('SIGNED_OUT', null);
      } catch (error) {
        console.error('[LocalAuth] Listener error:', error);
      }
    });
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem('supabase.auth.token');
      console.log('[LocalAuth] Attempting to restore session, found stored data:', !!stored);
      if (stored) {
        const session = JSON.parse(stored) as LocalAuthSession;
        // TODO: Check if token is expired
        this.currentSession = session;
        console.log('[LocalAuth] Session restored from localStorage:', session.user.email);
      } else {
        console.log('[LocalAuth] No stored session found');
      }
    } catch (error) {
      console.warn('[LocalAuth] Failed to restore session:', error);
      this.clearSession();
    }
  }

  // Supabase-compatible auth methods
  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<LocalAuthResponse> {
    try {
      const response = await this.makeRequest('/auth/v1/token', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          grant_type: 'password',
        }),
      });

      const session: LocalAuthSession = {
        access_token: response.access_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
        refresh_token: response.refresh_token,
        user: response.user,
      };

      this.saveSession(session);

      return {
        data: {
          user: response.user,
          session,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Sign in failed',
        },
      };
    }
  }

  async signUp({ email, password, options = {} }: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> }
  }): Promise<LocalAuthResponse> {
    try {
      const response = await this.makeRequest('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          options,
        }),
      });

      const session: LocalAuthSession = {
        access_token: response.access_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
        refresh_token: response.refresh_token,
        user: response.user,
      };

      this.saveSession(session);

      return {
        data: {
          user: response.user,
          session,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Sign up failed',
        },
      };
    }
  }

  async signOut(): Promise<LocalAuthResponse> {
    try {
      if (this.currentSession) {
        await this.makeRequest('/auth/v1/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.warn('[LocalAuth] Sign out request failed:', error);
      // Continue with local sign out even if request fails
    }

    this.clearSession();
    return { data: {} };
  }

  async getSession(): Promise<LocalAuthResponse> {
    console.log('[LocalAuth] getSession called, current session exists:', !!this.currentSession);

    if (!this.currentSession) {
      console.log('[LocalAuth] No current session, returning null');
      return { data: { session: null, user: null } };
    }

    try {
      // Verify session is still valid
      console.log('[LocalAuth] Verifying session with auth service...');
      const user = await this.makeRequest('/auth/v1/user');
      console.log('[LocalAuth] Session verification successful for user:', user.email);
      return {
        data: {
          session: this.currentSession,
          user: user,
        },
      };
    } catch (error) {
      console.warn('[LocalAuth] Session verification failed:', error);
      this.clearSession();
      return { data: { session: null, user: null } };
    }
  }

  async getUser(): Promise<LocalAuthResponse> {
    if (!this.currentSession) {
      return {
        error: {
          message: 'No active session',
        },
      };
    }

    try {
      const user = await this.makeRequest('/auth/v1/user');
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to get user',
        },
      };
    }
  }

  // Auth state change listener (simplified)
  onAuthStateChange(callback: (event: string, session: LocalAuthSession | null) => void) {
    console.log('[LocalAuth] onAuthStateChange called, current session exists:', !!this.currentSession);
    this.listeners.push(callback);

    // Immediately call with current state
    setTimeout(() => {
      const event = this.currentSession ? 'SIGNED_IN' : 'SIGNED_OUT';
      console.log('[LocalAuth] Triggering initial auth state:', event);
      callback(event, this.currentSession);
    }, 0);

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  // Additional methods for compatibility
  async resetPasswordForEmail(email: string, options?: any): Promise<LocalAuthResponse> {
    // For local development, just return success
    console.log('[LocalAuth] Password reset requested for:', email);
    return { data: {} };
  }

  async signInWithOAuth(options: any): Promise<LocalAuthResponse> {
    // OAuth not supported in local mode
    return {
      error: {
        message: 'OAuth not supported in local development mode',
      },
    };
  }
}

// Create singleton instance
export const localAuth = new LocalAuthAdapter();

// Check if we're in local mode
export const isLocalMode = () => {
  const localModeFlag = import.meta.env.VITE_LOCAL_MODE === 'true';
  const localhostUrl = import.meta.env.VITE_SUPABASE_URL?.includes('localhost');
  // Only force local mode if explicitly enabled via VITE_LOCAL_MODE flag
  // Docker mode (localhost:8080) should use Supabase when VITE_LOCAL_MODE=false
  const dockerLocalMode = localModeFlag && window.location.hostname === 'localhost' && window.location.port === '8080';
  const result = localModeFlag || localhostUrl;

  console.log('[LocalAuth] Local mode detection:', {
    VITE_LOCAL_MODE: import.meta.env.VITE_LOCAL_MODE,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    hostname: window.location.hostname,
    port: window.location.port,
    localModeFlag,
    localhostUrl,
    dockerLocalMode,
    result
  });

  return result;
};