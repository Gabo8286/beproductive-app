import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
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
    updates: Partial<Profile>,
  ) => Promise<{ error: Error | null }>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Track initialization state to prevent overlapping attempts
  const isInitializing = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    console.log("[AuthContext] Initializing auth state...");
    let isComponentMounted = true;
    let authSubscription: any = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    // Add timeout to prevent infinite loading (critical for Safari/Brave)
    const loadingTimeout = setTimeout(() => {
      if (isComponentMounted && loading) {
        console.warn(
          "[AuthContext] Auth initialization timed out after 10 seconds",
        );
        setAuthError(
          "Authentication initialization timed out. Please refresh the page.",
        );
        setLoading(false);
        isInitializing.current = false;
      }
    }, 10000); // 10 seconds timeout

    // Add additional fallback timeout
    const emergencyTimeout = setTimeout(() => {
      if (isComponentMounted && loading) {
        console.error(
          "[AuthContext] Emergency timeout - forcing auth to complete",
        );
        setLoading(false);
        isInitializing.current = false;
      }
    }, 15000); // 15 seconds emergency timeout

    const initializeAuth = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (isInitializing.current) {
        console.log("[AuthContext] Already initializing, skipping duplicate attempt");
        return;
      }

      isInitializing.current = true;

      try {
        console.log("[AuthContext] Setting up auth state listener...");

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
            setAuthError(
              "Authentication service failed to initialize. Please refresh the page.",
            );
            setLoading(false);
            isInitializing.current = false;
            return;
          }

          setAuthError(
            "Authentication service is initializing. Please wait a moment...",
          );

          // Increment retry count and retry after 1 second
          retryCount.current++;
          isInitializing.current = false; // Reset flag before retry

          retryTimeout = setTimeout(() => {
            if (isComponentMounted) {
              console.log(`[AuthContext] Retrying auth initialization (attempt ${retryCount.current}/${maxRetries})...`);
              initializeAuth();
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
            setLoading(false);
            isInitializing.current = false;
          }
        });

        authSubscription = data.subscription;

        console.log("[AuthContext] Checking for existing session...");

        // Check for existing session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Session check timeout")), 8000);
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
            setLoading(false);
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
            setLoading(false);
            isInitializing.current = false;
          }
        } catch (error) {
          if (!isComponentMounted) {
            isInitializing.current = false;
            return;
          }

          console.error("[AuthContext] Session check failed:", error);
          setAuthError(
            "Failed to check authentication status. Please refresh the page.",
          );
          setLoading(false);
          isInitializing.current = false;
        }
      } catch (error) {
        if (!isComponentMounted) {
          isInitializing.current = false;
          return;
        }

        console.error("[AuthContext] Auth initialization failed:", error);
        setAuthError(
          `Authentication initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setLoading(false);
        isInitializing.current = false;
      }
    };

    // Start initialization
    initializeAuth();

    // Cleanup function
    return () => {
      console.log("[AuthContext] Cleaning up auth context...");
      isComponentMounted = false;
      isInitializing.current = false;
      clearTimeout(loadingTimeout);
      clearTimeout(emergencyTimeout);

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
      console.log("[AuthContext] Fetching profile for user:", userId);

      // Add timeout for profile fetch
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000);
      });

      const { data, error } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.error("[AuthContext] Profile fetch error:", error);
        setAuthError(`Failed to load profile: ${error.message}`);
        // Don't show toast for network errors during initialization
        if (error.message && !error.message.includes("timeout")) {
          toast.error("Failed to load profile");
        }
        setLoading(false);
        return;
      }

      console.log("[AuthContext] Profile loaded successfully");
      setProfile(data as Profile);
      setLoading(false);
      isInitializing.current = false;
    } catch (error) {
      console.error("[AuthContext] Profile fetch failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setAuthError(`Failed to load profile: ${errorMessage}`);

      // Only show toast for unexpected errors, not timeouts during init
      if (!errorMessage.includes("timeout")) {
        toast.error("Failed to load profile");
      }

      setLoading(false);
      isInitializing.current = false;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
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

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

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
        loading,
        authError,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        updateProfile,
        clearAuthError,
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
