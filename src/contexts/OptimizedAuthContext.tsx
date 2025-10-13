import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import { toast } from "sonner";
import { localAuth, isLocalMode, LocalAuthUser, LocalAuthSession } from "@/integrations/auth/localAuthAdapter";
import { runAuthDiagnostics, displayDiagnostics } from "@/utils/browser/authDiagnostics";

// Split contexts for better performance - separate state from actions
interface AuthStateContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  authLoading: boolean;
  authError: string | null;
}

interface AuthActionsContextType {
  signIn: (email: string, password: string, bypassTimeout?: boolean) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  setAdminRole: (userId?: string) => Promise<{ error: Error | null }>;
  clearAuthError: () => void;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined);

export const OptimizedAuthProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Track initialization state to prevent overlapping attempts
  const isInitializing = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 2;

  // Memoized state object - only changes when actual values change
  const authState = useMemo(() => ({
    user,
    session,
    profile,
    authLoading,
    authError,
  }), [user, session, profile, authLoading, authError]);

  // Memoized actions object - stable references
  const authActions = useMemo(() => {
    const fetchProfile = async (userId: string) => {
      try {
        console.log("[OptimizedAuthContext] Fetching profile for user:", userId);
        const localMode = isLocalMode();

        let data, error;

        if (localMode) {
          try {
            const headers: Record<string, string> = {
              'Accept': 'application/vnd.pgrst.object+json',
              'Content-Type': 'application/json',
            };

            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const dockerLocalMode = window.location.hostname === 'localhost' && window.location.port === '8080';
            const postgrestUrl = dockerLocalMode ? 'http://localhost:8000' : 'http://localhost:8000';

            const response = await fetch(`${postgrestUrl}/profiles?id=eq.${userId}&select=*`, {
              headers,
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            data = await response.json();
            error = null;
          } catch (fetchError) {
            console.error("[OptimizedAuthContext] Direct profile fetch failed:", fetchError);
            error = fetchError;
            data = null;
          }
        } else {
          const profilePromise = supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Profile fetch timeout")), 5000);
          });

          const result = (await Promise.race([profilePromise, timeoutPromise])) as any;
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error("[OptimizedAuthContext] Profile fetch error:", error);
          setAuthError(`Failed to load profile: ${error.message || error}`);
          if (error.message && !error.message.includes("timeout")) {
            toast.error("Failed to load profile");
          }
          setAuthLoading(false);
          return;
        }

        console.log("[OptimizedAuthContext] Profile loaded successfully");
        setProfile(data as Profile);
        setAuthLoading(false);
        isInitializing.current = false;
      } catch (error) {
        console.error("[OptimizedAuthContext] Profile fetch failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setAuthError(`Failed to load profile: ${errorMessage}`);

        if (!errorMessage.includes("timeout")) {
          toast.error("Failed to load profile");
        }

        setAuthLoading(false);
        isInitializing.current = false;
      }
    };

    const clearAuthError = () => {
      setAuthError(null);
    };

    const signIn = async (email: string, password: string, bypassTimeout = false) => {
      try {
        console.log(`[OptimizedAuthContext] Signing in user: ${email}${bypassTimeout ? ' (dev mode)' : ''}`);
        setAuthError(null);

        if (bypassTimeout) {
          setAuthLoading(false);
        }

        if (isLocalMode()) {
          console.log("[OptimizedAuthContext] Using local auth for sign in");
          const { error } = await localAuth.signInWithPassword({ email, password });
          if (error) {
            console.error("[OptimizedAuthContext] Local auth sign in error:", error.message);
            throw new Error(error.message);
          }
          console.log("[OptimizedAuthContext] Local auth sign in successful");
          return { error: null };
        } else {
          console.log("[OptimizedAuthContext] Using Supabase auth for sign in");
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            console.error("[OptimizedAuthContext] Supabase auth sign in error:", error.message, error);
            throw error;
          }
          console.log("[OptimizedAuthContext] Supabase auth sign in successful");
          return { error: null };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("[OptimizedAuthContext] Sign in failed:", errorMessage, error);

        if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          try {
            console.log("[OptimizedAuthContext] Running diagnostics for network error...");
            const diagnostics = await runAuthDiagnostics();
            const diagnosticMessage = displayDiagnostics(diagnostics);
            console.error("[OptimizedAuthContext] Sign in failed - Diagnostics:", diagnosticMessage);

            if (diagnostics.browser === 'Brave') {
              toast.error("Sign in failed. Try disabling Brave Shields for this site or use a normal window.");
            } else if (!diagnostics.networkConnectivity.canReachSupabase) {
              toast.error("Cannot connect to authentication service. Check your connection.");
            } else {
              toast.error("Network error during sign in. Please try again.");
            }
          } catch (diagError) {
            console.error("[OptimizedAuthContext] Diagnostics failed:", diagError);
            toast.error("Network error during sign in. Please check your connection and try again.");
          }
        } else if (errorMessage.includes('Invalid login credentials')) {
          if (import.meta.env.MODE !== 'development') {
            toast.error("Invalid email or password. Please try again.");
          }
        } else {
          if (!bypassTimeout) {
            toast.error(`Sign in failed: ${errorMessage}`);
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
        if (isLocalMode()) {
          await localAuth.signOut();
        } else {
          await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
        setProfile(null);
      } catch (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out");
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
        if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
        if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
        if (updates.onboarding_completed !== undefined) updateData.onboarding_completed = updates.onboarding_completed;
        if (updates.role !== undefined) updateData.role = updates.role;

        const localMode = isLocalMode();

        if (localMode) {
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
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id);

          if (error) throw error;
        }

        await fetchProfile(user.id);
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    };

    const setAdminRole = async (userId?: string) => {
      if (!user && !userId) return { error: new Error("No user logged in") };

      const targetUserId = userId || user!.id;

      try {
        console.log(`[OptimizedAuthContext] Setting admin role for user: ${targetUserId}`);

        const updateData = {
          role: 'admin' as const,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        };

        const localMode = isLocalMode();

        if (localMode) {
          const dockerLocalMode = window.location.hostname === 'localhost' && window.location.port === '8080';
          const postgrestUrl = dockerLocalMode ? 'http://localhost:8000' : 'http://localhost:8000';

          const response = await fetch(`${postgrestUrl}/profiles?id=eq.${targetUserId}`, {
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
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", targetUserId);

          if (error) throw error;
        }

        if (targetUserId === user?.id) {
          await fetchProfile(targetUserId);
        }

        console.log(`[OptimizedAuthContext] Successfully set admin role for user: ${targetUserId}`);
        return { error: null };
      } catch (error) {
        console.error(`[OptimizedAuthContext] Failed to set admin role:`, error);
        return { error: error as Error };
      }
    };

    return {
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      resetPassword,
      updateProfile,
      setAdminRole,
      clearAuthError,
    };
  }, [user, session]); // Only recreate when user or session changes

  useEffect(() => {
    console.log("[OptimizedAuthContext] Initializing auth state...");
    const localMode = isLocalMode();
    console.log(`[OptimizedAuthContext] Local mode detected: ${localMode}`);

    let isComponentMounted = true;
    let authSubscription: any = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const loadingTimeout = setTimeout(async () => {
      if (isComponentMounted && authLoading) {
        console.warn("[OptimizedAuthContext] Auth initialization timed out after 5 seconds");

        try {
          const diagnostics = await runAuthDiagnostics();
          const diagnosticMessage = displayDiagnostics(diagnostics);
          console.error("[OptimizedAuthContext] Authentication timeout - Diagnostics:", diagnosticMessage);

          if (diagnostics.browser === 'Brave' && diagnostics.isPrivateMode) {
            toast.error("Brave private mode detected. Try using a normal window or adjust privacy settings.");
          } else if (!diagnostics.networkConnectivity.canReachSupabase) {
            toast.error("Cannot connect to authentication service. Check your connection.");
          } else if (!localMode) {
            if (import.meta.env.MODE === 'production') {
              toast.error("Authentication timed out. You can continue in guest mode.");
            }
          }
        } catch (error) {
          console.error("[OptimizedAuthContext] Diagnostics failed:", error);
          if (!localMode && import.meta.env.MODE === 'production') {
            toast.error("Authentication timed out. You can continue in guest mode.");
          }
        }

        setAuthError("Authentication timed out.");
        setAuthLoading(false);
        isInitializing.current = false;
      }
    }, 5000);

    const initializeLocalAuth = async () => {
      console.log("[OptimizedAuthContext] Initializing local auth...");
      isInitializing.current = true;

      try {
        const { data } = localAuth.onAuthStateChange((event, localSession) => {
          if (!isComponentMounted) return;

          console.log("[OptimizedAuthContext] Local auth state changed:", event, localSession ? "has session" : "no session");

          if (localSession) {
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
            authActions.fetchProfile?.(user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthLoading(false);
            isInitializing.current = false;
          }
        });

        authSubscription = data.subscription;

        const { data: sessionData, error: sessionError } = await localAuth.getSession();

        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        if (sessionError) {
          console.error("[OptimizedAuthContext] Local session check error:", sessionError);
          setAuthError(sessionError.message);
          setAuthLoading(false);
          isInitializing.current = false;
          return;
        }

        if (sessionData?.session) {
          console.log("[OptimizedAuthContext] Found existing local session");
        } else {
          console.log("[OptimizedAuthContext] No existing local session");
          setAuthLoading(false);
          isInitializing.current = false;
        }

      } catch (error) {
        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        console.error("[OptimizedAuthContext] Local auth initialization failed:", error);
        setAuthError(`Local auth failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setAuthLoading(false);
        isInitializing.current = false;
      }
    };

    const initializeSupabaseAuth = async () => {
      if (isInitializing.current) {
        console.log("[OptimizedAuthContext] Already initializing, skipping duplicate attempt");
        return;
      }

      isInitializing.current = true;

      try {
        console.log("[OptimizedAuthContext] Setting up Supabase auth state listener...");

        if (!supabase || !supabase.auth || typeof supabase.auth.onAuthStateChange !== "function") {
          console.error("[OptimizedAuthContext] Supabase client not ready - auth methods unavailable");

          if (retryCount.current >= maxRetries) {
            console.error("[OptimizedAuthContext] Max retries exceeded, giving up");
            setAuthError("Authentication service unavailable.");
            setAuthLoading(false);
            isInitializing.current = false;
            return;
          }

          setAuthError("Connecting to authentication service...");
          retryCount.current++;
          isInitializing.current = false;

          retryTimeout = setTimeout(() => {
            if (isComponentMounted) {
              console.log(`[OptimizedAuthContext] Retrying auth initialization (attempt ${retryCount.current}/${maxRetries})...`);
              initializeSupabaseAuth();
            }
          }, 1000);
          return;
        }

        retryCount.current = 0;

        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isComponentMounted) return;

          console.log("[OptimizedAuthContext] Auth state changed:", event, session ? "has session" : "no session");
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            authActions.fetchProfile?.(session.user.id);
          } else {
            setProfile(null);
            setAuthLoading(false);
            isInitializing.current = false;
          }
        });

        authSubscription = data.subscription;

        console.log("[OptimizedAuthContext] Checking for existing session...");

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Session check timeout")), 8000);
        });

        try {
          const { data: sessionData, error: sessionError } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

          if (!isComponentMounted) {
            isInitializing.current = false;
            return;
          }

          if (sessionError) {
            console.error("[OptimizedAuthContext] Session check error:", sessionError);
            setAuthError(`Failed to check session: ${sessionError.message}`);
            isInitializing.current = false;
            return;
          }

          const { session } = sessionData;
          console.log("[OptimizedAuthContext] Initial session check:", session ? "found session" : "no session");

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await authActions.fetchProfile?.(session.user.id);
          } else {
            setAuthLoading(false);
            isInitializing.current = false;
          }
        } catch (error) {
          if (!isComponentMounted) {
            isInitializing.current = false;
            return;
          }

          console.error("[OptimizedAuthContext] Session check failed:", error);
          setAuthError("Failed to check authentication status.");
          setAuthLoading(false);
          isInitializing.current = false;
        }
      } catch (error) {
        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        console.error("[OptimizedAuthContext] Auth initialization failed:", error);
        setAuthError(`Auth failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setAuthLoading(false);
        isInitializing.current = false;
      }
    };

    if (localMode) {
      initializeLocalAuth();
    } else {
      initializeSupabaseAuth();
    }

    return () => {
      console.log("[OptimizedAuthContext] Cleaning up auth context...");
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
  }, [authActions]);

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
});

OptimizedAuthProvider.displayName = 'OptimizedAuthProvider';

// Separate hooks for state and actions
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used within OptimizedAuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error("useAuthActions must be used within OptimizedAuthProvider");
  }
  return context;
}

// Backward compatibility hook
export function useOptimizedAuth() {
  const state = useAuthState();
  const actions = useAuthActions();

  return {
    ...state,
    ...actions,
  };
}