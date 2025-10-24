import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile, ProfileWithRole } from "@/types/database";
import { toast } from "sonner";
import { localAuth, isLocalMode, LocalAuthUser, LocalAuthSession } from "@/integrations/auth/localAuthAdapter";
import { runAuthDiagnostics, displayDiagnostics } from "@/utils/browser/authDiagnostics";
import {
  isGuestModeEnabled,
  createGuestUser,
  createGuestSession,
  createGuestProfile,
  isGuestUser,
  getGuestUserType,
  getSavedGuestModeSelection,
  saveGuestModeSelection,
  clearGuestModeSelection,
  GuestUserType
} from "@/utils/auth/guestMode";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileWithRole | null;
  authLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (
    updates: Partial<ProfileWithRole>,
  ) => Promise<{ error: Error | null }>;
  clearAuthError: () => void;
  // Guest mode functions
  isGuestMode: boolean;
  guestUserType: GuestUserType | null;
  signInAsGuest: (type: GuestUserType) => void;
  clearGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Start true for initial load
  const [authError, setAuthError] = useState<string | null>(null);

  // Guest mode state
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [guestUserType, setGuestUserType] = useState<GuestUserType | null>(null);

  // Track initialization state to prevent overlapping attempts
  const isInitializing = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 2; // Reduced for faster recovery

  useEffect(() => {
    console.log("[AuthContext] Initializing auth state...");
    console.log("[AuthContext] Environment variables:", {
      VITE_LOCAL_MODE: import.meta.env.VITE_LOCAL_MODE,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_LOCAL_AUTH_URL: import.meta.env.VITE_LOCAL_AUTH_URL,
      VITE_ENABLE_GUEST_MODE: import.meta.env.VITE_ENABLE_GUEST_MODE,
      VITE_SKIP_LOGIN: import.meta.env.VITE_SKIP_LOGIN,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
    });

    // Development skip login - auto-authenticate with mock user
    const skipLogin = import.meta.env.VITE_SKIP_LOGIN === 'true' && import.meta.env.DEV;
    if (skipLogin) {
      console.log("[AuthContext] Skip login enabled - auto-authenticating with mock user");
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: 'developer@beproductive.local',
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'Development User',
          avatar_url: null,
        },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      } as User;

      const mockSession: Session = {
        access_token: 'dev-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'dev-refresh-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      } as Session;

      const mockProfile: ProfileWithRole = {
        id: mockUser.id,
        full_name: 'Development User',
        email: mockUser.email || '',
        avatar_url: null,
        created_at: mockUser.created_at,
        updated_at: new Date().toISOString(),
        role: 'user',
        subscription_tier: 'free',
        preferences: {},
        onboarding_completed: false,
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(mockProfile);
      setAuthLoading(false);
      setAuthError(null);
      console.log("[AuthContext] ✅ Auto-authentication complete - ready for development");
      return;
    }

    const guestModeEnabled = isGuestModeEnabled();
    const localMode = isLocalMode();
    console.log(`[AuthContext] Guest mode enabled: ${guestModeEnabled}`);
    console.log(`[AuthContext] Local mode detected: ${localMode}`);

    // Check for saved guest mode selection first
    const savedGuestType = getSavedGuestModeSelection();
    if (guestModeEnabled && savedGuestType) {
      console.log(`[AuthContext] Found saved guest mode selection: ${savedGuestType}`);
      initializeGuestMode(savedGuestType);
      return;
    }

    let isComponentMounted = true;
    let authSubscription: any = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    // Timeout to prevent infinite loading - 20s for improved reliability
    const loadingTimeout = setTimeout(async () => {
      if (isComponentMounted && authLoading) {
        console.warn("[AuthContext] Auth initialization timed out after 20 seconds");

        // Run diagnostics to help debug the issue
        try {
          const diagnostics = await runAuthDiagnostics();
          const diagnosticMessage = displayDiagnostics(diagnostics);
          console.error("[AuthContext] Authentication timeout - Diagnostics:", diagnosticMessage);

          // Show user-friendly error with specific guidance
          if (diagnostics.browser === 'Brave' && diagnostics.isPrivateMode) {
            toast.error("Brave private mode detected. Try using a normal window or adjust privacy settings.");
          } else if (!diagnostics.networkConnectivity.canReachSupabase) {
            toast.error("Cannot connect to authentication service. Check your connection.");
          } else if (!localMode) {
            toast.error("Authentication timed out. You can continue in guest mode.");
          }
        } catch (error) {
          console.error("[AuthContext] Diagnostics failed:", error);
          if (!localMode) {
            toast.error("Authentication timed out. You can continue in guest mode.");
          }
        }

        setAuthError("Authentication timed out.");
        setAuthLoading(false);
        isInitializing.current = false;
      }
    }, 20000); // 20 seconds timeout for better Docker compatibility

    const initializeLocalAuth = async () => {
      console.log("[AuthContext] Initializing local auth...");
      console.log("[AuthContext] Local auth URL:", import.meta.env.VITE_LOCAL_AUTH_URL);
      isInitializing.current = true;

      try {
        // Set up local auth state listener
        const { data } = localAuth.onAuthStateChange((event, localSession) => {
          if (!isComponentMounted) return;

          console.log("[AuthContext] Local auth state changed:", event, localSession ? "has session" : "no session");

          if (localSession) {
            // Convert local session to Supabase-compatible format
            const user: User = {
              id: localSession.user.id,
              email: localSession.user.email,
              created_at: localSession.user.created_at,
              email_confirmed_at: localSession.user.email_confirmed_at,
              app_metadata: {},
              user_metadata: localSession.user.user_metadata || {},
              aud: 'authenticated',
              role: 'authenticated',
            } as User;

            const session: Session = {
              access_token: localSession.access_token,
              refresh_token: localSession.refresh_token,
              expires_in: localSession.expires_in,
              token_type: localSession.token_type,
              user,
              expires_at: Math.floor(Date.now() / 1000) + localSession.expires_in,
            } as Session;

            setSession(session);
            setUser(user);
            fetchProfile(user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthLoading(false);
            isInitializing.current = false;
          }
        });

        authSubscription = data.subscription;

        // Check for existing session
        const { data: sessionData, error: sessionError } = await localAuth.getSession();

        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        if (sessionError) {
          console.error("[AuthContext] Local session check error:", sessionError);
          setAuthError(sessionError.message);
          setAuthLoading(false);
          isInitializing.current = false;
          return;
        }

        if (sessionData?.session) {
          console.log("[AuthContext] Found existing local session");
          // The onAuthStateChange will handle setting the session
        } else {
          console.log("[AuthContext] No existing local session");
          setAuthLoading(false);
          isInitializing.current = false;
        }

      } catch (error) {
        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        console.error("[AuthContext] Local auth initialization failed:", error);
        setAuthError(`Local auth failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setAuthLoading(false);
        isInitializing.current = false;
      }
    };

    const initializeSupabaseAuth = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (isInitializing.current) {
        console.log("[AuthContext] Already initializing, skipping duplicate attempt");
        return;
      }

      isInitializing.current = true;

      try {
        console.log("[AuthContext] Setting up Supabase auth state listener...");

        // CRITICAL: Check if Supabase client is ready before using it
        if (
          !supabase ||
          !supabase.auth ||
          typeof supabase.auth.onAuthStateChange !== "function"
        ) {
          console.error(
            "[AuthContext] Supabase client not ready - auth methods unavailable",
          );

          // Check if we've exceeded max retries
          if (retryCount.current >= maxRetries) {
            console.error("[AuthContext] Max retries exceeded, giving up");
            setAuthError("Authentication service unavailable.");
            setAuthLoading(false);
            isInitializing.current = false;
            return;
          }

          setAuthError("Connecting to authentication service...");

          // Increment retry count and retry after 1 second
          retryCount.current++;
          isInitializing.current = false; // Reset flag before retry

          retryTimeout = setTimeout(() => {
            if (isComponentMounted) {
              console.log(`[AuthContext] Retrying auth initialization (attempt ${retryCount.current}/${maxRetries})...`);
              initializeSupabaseAuth();
            }
          }, 1000);
          return;
        }

        // Reset retry count on successful client check
        retryCount.current = 0;

        // Set up auth state listener with error handling
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isComponentMounted) return;

          console.log(
            "[AuthContext] Auth state changed:",
            event,
            session ? "has session" : "no session",
          );
          setSession(session);
          setUser(session?.user ?? null);

          // Fetch profile when user logs in
          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setAuthLoading(false);
            isInitializing.current = false;
          }
        });

        authSubscription = data.subscription;

        console.log("[AuthContext] Checking for existing session...");

        // Check for existing session with timeout (increased to 18s for better reliability)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Session check timeout")), 18000);
        });

        try {
          const { data: sessionData, error: sessionError } =
            (await Promise.race([sessionPromise, timeoutPromise])) as any;

          if (!isComponentMounted) {
            isInitializing.current = false;
            return;
          }

          if (sessionError) {
            console.error("[AuthContext] Session check error:", sessionError);
            setAuthError(`Failed to check session: ${sessionError.message}`);
            isInitializing.current = false;
            return;
          }

          const { session } = sessionData;
          console.log(
            "[AuthContext] Initial session check:",
            session ? "found session" : "no session",
          );

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setAuthLoading(false);
            isInitializing.current = false;
          }
        } catch (error) {
          if (!isComponentMounted) {
            isInitializing.current = false;
            return;
          }

          console.error("[AuthContext] Session check failed:", error);
          setAuthError("Failed to check authentication status.");
          setAuthLoading(false);
          isInitializing.current = false;
        }
      } catch (error) {
        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        console.error("[AuthContext] Auth initialization failed:", error);
        setAuthError(`Auth failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setAuthLoading(false);
        isInitializing.current = false;
      }
    };

    // Start initialization based on mode
    if (localMode) {
      initializeLocalAuth();
    } else {
      initializeSupabaseAuth();
    }

    // Cleanup function
    return () => {
      console.log("[AuthContext] Cleaning up auth context...");
      isComponentMounted = false;
      isInitializing.current = false;
      clearTimeout(loadingTimeout);

      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[AuthContext] Fetching profile with role for user:", userId);
      const localMode = isLocalMode();

      let data, error;

      if (localMode) {
        // Use direct fetch to PostgREST API for local mode
        try {
          // Get JWT token from session if available
          const headers: Record<string, string> = {
            'Accept': 'application/vnd.pgrst.object+json',
            'Content-Type': 'application/json',
          };

          // Add Authorization header if we have a session
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }

          // Use the correct PostgREST URL for Docker or local environment
          const dockerLocalMode = window.location.hostname === 'localhost' && window.location.port === '8080';
          const postgrestUrl = dockerLocalMode ? 'http://localhost:8000' : 'http://localhost:8000';

          // Call the get_user_profile_with_role function
          const response = await fetch(`${postgrestUrl}/rpc/get_user_profile_with_role`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_user_id: userId }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          // The function returns an array, get the first (and only) result
          data = Array.isArray(result) ? result[0] : result;
          error = null;
          console.log("[AuthContext] Profile with role fetched from PostgREST function:", data);
        } catch (fetchError) {
          console.error("[AuthContext] Profile+role fetch failed:", fetchError);
          error = fetchError;
          data = null;
        }
      } else {
        // Use Supabase client for cloud mode - call the SQL function
        const profilePromise = supabase.rpc('get_user_profile_with_role', {
          p_user_id: userId
        }).single();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Profile fetch timeout")), 8000);
        });

        const result = (await Promise.race([
          profilePromise,
          timeoutPromise,
        ])) as any;

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("[AuthContext] Profile+role fetch error:", error);
        setAuthError(`Failed to load profile: ${error.message || error}`);
        // Don't show toast for network errors during initialization
        if (error.message && !error.message.includes("timeout")) {
          toast.error("Failed to load profile");
        }
        setAuthLoading(false);
        return;
      }

      console.log("[AuthContext] Profile with role loaded successfully");
      setProfile(data as ProfileWithRole);
      setAuthLoading(false);
      isInitializing.current = false;
    } catch (error) {
      console.error("[AuthContext] Profile+role fetch failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setAuthError(`Failed to load profile: ${errorMessage}`);

      // Only show toast for unexpected errors, not timeouts during init
      if (!errorMessage.includes("timeout")) {
        toast.error("Failed to load profile");
      }

      setAuthLoading(false);
      isInitializing.current = false;
    }
  };

  const initializeGuestMode = (type: GuestUserType) => {
    console.log(`[AuthContext] Initializing guest mode as ${type}`);

    try {
      // Create guest user and session
      const guestUser = createGuestUser(type);
      const guestSession = createGuestSession(type);
      const guestProfile = createGuestProfile(type);

      // Set auth state
      setUser(guestUser);
      setSession(guestSession);
      setProfile(guestProfile);
      setIsGuestMode(true);
      setGuestUserType(type);
      setAuthLoading(false);
      setAuthError(null);

      console.log(`[AuthContext] Guest mode initialized successfully as ${type}`);
    } catch (error) {
      console.error("[AuthContext] Failed to initialize guest mode:", error);
      setAuthError("Failed to initialize guest mode");
      setAuthLoading(false);
    }
  };

  const signInAsGuest = (type: GuestUserType) => {
    console.log(`[AuthContext] Signing in as guest: ${type}`);

    // Save selection for future sessions
    saveGuestModeSelection(type);

    // Initialize guest mode
    initializeGuestMode(type);
  };

  const clearGuestMode = () => {
    console.log("[AuthContext] Clearing guest mode");

    // Clear saved selection
    clearGuestModeSelection();

    // Reset auth state
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuestMode(false);
    setGuestUserType(null);
    setAuthLoading(false);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isLocalMode()) {
        const { error } = await localAuth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return { error: null };
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { error: null };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("[AuthContext] Sign in failed:", errorMessage);

      // Run diagnostics for network/fetch errors
      if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        try {
          const diagnostics = await runAuthDiagnostics();
          const diagnosticMessage = displayDiagnostics(diagnostics);
          console.error("[AuthContext] Sign in failed - Diagnostics:", diagnosticMessage);

          // Show specific guidance based on diagnostics
          if (diagnostics.browser === 'Brave') {
            toast.error("Sign in failed. Try disabling Brave Shields for this site or use a normal window.");
          } else if (!diagnostics.networkConnectivity.canReachSupabase) {
            toast.error("Cannot connect to authentication service. Check your connection.");
          }
        } catch (diagError) {
          console.error("[AuthContext] Diagnostics failed:", diagError);
        }
      }

      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (isLocalMode()) {
        const { error } = await localAuth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw new Error(error.message);
        return { error: null };
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        return { error: null };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Handle guest mode signout
      if (isGuestMode) {
        clearGuestMode();
        // Small delay to ensure state is fully cleared
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }

      // Handle normal auth signout
      if (isLocalMode()) {
        await localAuth.signOut();
      } else {
        await supabase.auth.signOut();
      }

      // Clear state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthLoading(false);
      setAuthError(null);

      // Small delay to ensure state is fully cleared
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");

      // Even if signout fails, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthLoading(false);
      setAuthError(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (isLocalMode()) {
        toast.error("Google sign-in not available in local mode");
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isLocalMode()) {
        const { error } = await localAuth.resetPasswordForEmail(email);
        if (error) throw new Error(error.message);
        return { error: null };
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { error: null };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.full_name !== undefined)
        updateData.full_name = updates.full_name;
      if (updates.avatar_url !== undefined)
        updateData.avatar_url = updates.avatar_url;
      if (updates.onboarding_completed !== undefined)
        updateData.onboarding_completed = updates.onboarding_completed;

      const localMode = isLocalMode();

      if (localMode) {
        // Use direct fetch to PostgREST API for local mode
        const dockerLocalMode = window.location.hostname === 'localhost' && window.location.port === '8080';
        const postgrestUrl = dockerLocalMode ? 'http://localhost:8000' : 'http://localhost:8000';

        const response = await fetch(`${postgrestUrl}/profiles?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // Use Supabase client for cloud mode
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (error) throw error;
      }

      // Refresh profile
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        authLoading,
        authError,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        updateProfile,
        clearAuthError,
        // Guest mode values and functions
        isGuestMode,
        guestUserType,
        signInAsGuest,
        clearGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
