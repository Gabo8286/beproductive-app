/**
 * Modern AuthProvider - Clean and Focused
 *
 * Replaces the complex 924-line AuthContext with a clean,
 * maintainable implementation focused on single responsibility.
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { toast } from 'sonner';

import { AuthService } from './AuthService';
import type {
  AuthState,
  AuthContextValue,
  SignInCredentials,
  SignUpCredentials,
  MagicLinkRequest,
  AuthEvent,
  AuthEventType
} from './types';

// ==================== Initial State ====================

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start with loading to check existing session
  user: null,
  session: null,
  error: null
};

// ==================== Action Types ====================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { session: any; user: any } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: any }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: any };

// ==================== Reducer ====================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        session: action.payload.session,
        error: null
      };

    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        session: null,
        error: null
      };

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    default:
      return state;
  }
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== Provider Component ====================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authService = AuthService.getInstance();

  // ==================== Event Handlers ====================

  const handleAuthEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'SIGN_IN_START':
      case 'SIGN_UP_START':
        dispatch({ type: 'SET_LOADING', payload: true });
        break;

      case 'SIGN_IN_SUCCESS':
        if (event.payload) {
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: {
              session: event.payload,
              user: event.payload.user
            }
          });
        }
        break;

      case 'SIGN_IN_ERROR':
      case 'SIGN_UP_ERROR':
        dispatch({ type: 'SET_ERROR', payload: event.payload });
        break;

      case 'SIGN_OUT_SUCCESS':
        dispatch({ type: 'SET_UNAUTHENTICATED' });
        break;

      case 'SESSION_EXPIRED':
        dispatch({ type: 'SET_UNAUTHENTICATED' });
        toast.error('Your session has expired. Please sign in again.');
        break;

      case 'SESSION_REFRESH':
        if (event.payload) {
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: {
              session: event.payload,
              user: event.payload.user
            }
          });
        }
        break;

      case 'AUTH_STATE_CHANGE':
        // Handle external auth state changes
        break;
    }
  }, []);

  // ==================== Initialization ====================

  useEffect(() => {
    let isMounted = true;

    // Set up event listeners
    const events: AuthEventType[] = [
      'SIGN_IN_START',
      'SIGN_IN_SUCCESS',
      'SIGN_IN_ERROR',
      'SIGN_UP_START',
      'SIGN_UP_SUCCESS',
      'SIGN_UP_ERROR',
      'SIGN_OUT_SUCCESS',
      'SESSION_EXPIRED',
      'SESSION_REFRESH',
      'AUTH_STATE_CHANGE'
    ];

    events.forEach(eventType => {
      authService.on(eventType, handleAuthEvent);
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const existingSession = await authService.getCurrentSession();

        if (isMounted) {
          if (existingSession) {
            dispatch({
              type: 'SET_AUTHENTICATED',
              payload: {
                session: existingSession,
                user: existingSession.user
              }
            });
          } else {
            dispatch({ type: 'SET_UNAUTHENTICATED' });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      events.forEach(eventType => {
        authService.off(eventType, handleAuthEvent);
      });
    };
  }, [authService, handleAuthEvent]);

  // ==================== Activity Tracking ====================

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleActivity = () => {
      authService.getCurrentSession().then(session => {
        if (session) {
          // Update last activity in storage
          const sessionManager = new (authService as any).sessionManager();
          sessionManager?.updateLastActivity();
        }
      });
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let throttleTimer: NodeJS.Timeout | null = null;

    const throttledHandler = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          handleActivity();
          throttleTimer = null;
        }, 60000); // Update activity every minute at most
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledHandler, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandler, true);
      });
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [state.isAuthenticated, authService]);

  // ==================== Context Methods ====================

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return await authService.signIn(credentials);
  }, [authService]);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return await authService.signUp(credentials);
  }, [authService]);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signOut();
      // The event handler will update the state
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if signOut fails
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    }
  }, [authService]);

  const sendMagicLink = useCallback(async (request: MagicLinkRequest) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return await authService.sendMagicLink(request);
  }, [authService]);

  const resetPassword = useCallback(async (email: string) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return await authService.resetPassword(email);
  }, [authService]);

  const updateProfile = useCallback(async (updates: Partial<any>) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Update the user in the session
      dispatch({ type: 'UPDATE_USER', payload: updates });

      // Here you would typically call an API to update the profile
      // For now, we'll just update the local state
      return { success: true };
    } catch (error) {
      const authError = {
        code: 'UNKNOWN_ERROR' as const,
        message: 'Failed to update profile',
        timestamp: new Date()
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
      return { success: false, error: authError };
    }
  }, []);

  const refreshSession = useCallback(async () => {
    dispatch({ type: 'CLEAR_ERROR' });
    return await authService.refreshSession();
  }, [authService]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ==================== Context Value ====================

  const contextValue: AuthContextValue = {
    state,
    signIn,
    signUp,
    signOut,
    sendMagicLink,
    resetPassword,
    updateProfile,
    refreshSession,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Hook ====================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ==================== Export Context for Testing ====================

export { AuthContext };