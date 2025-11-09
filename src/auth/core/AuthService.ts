/**
 * AuthService - Clean Business Logic Layer
 *
 * Handles all authentication operations with proper error handling,
 * validation, and security measures. Replaces the complex logic
 * scattered throughout the old AuthContext.
 */

import { supabase } from '@/integrations/supabase/client';
import { localAuth, isLocalMode } from '@/integrations/auth/localAuthAdapter';
import type {
  AuthUser,
  AuthSession,
  AuthError,
  AuthErrorCode,
  SignInCredentials,
  SignUpCredentials,
  SignInResponse,
  SignUpResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  AuthResponse,
  SecurityEvent,
  SecurityEventType,
  RateLimitStatus,
  AuthConfig,
  AuthEventHandler,
  AuthEvent,
  AuthEventType
} from './types';
import { validateEmail, validatePassword, createAuthError } from '../utils/validation';
import { RateLimiter } from '../utils/security';
import { SessionManager } from '../utils/storage';

export class AuthService {
  private static instance: AuthService;
  private eventHandlers: Map<AuthEventType, AuthEventHandler[]> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private sessionManager: SessionManager;
  private config: AuthConfig;

  private constructor() {
    this.sessionManager = new SessionManager();
    this.config = this.getDefaultConfig();
    this.initializeRateLimiters();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ==================== Event Management ====================

  public on(eventType: AuthEventType, handler: AuthEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  public off(eventType: AuthEventType, handler: AuthEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: AuthEventType, payload?: any): void {
    const event: AuthEvent = {
      type: eventType,
      payload,
      timestamp: new Date()
    };

    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in auth event handler for ${eventType}:`, error);
      }
    });
  }

  // ==================== Authentication Methods ====================

  public async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    this.emit('SIGN_IN_START', credentials);

    try {
      // Rate limiting check
      const rateLimitStatus = await this.checkRateLimit('signIn', credentials.email);
      if (rateLimitStatus.blocked) {
        const error = createAuthError('RATE_LIMITED', 'Too many sign-in attempts. Please try again later.');
        this.emit('SIGN_IN_ERROR', error);
        return { success: false, error };
      }

      // Validate credentials
      const emailValidation = validateEmail(credentials.email);
      if (!emailValidation.isValid) {
        const error = createAuthError('INVALID_CREDENTIALS', emailValidation.errors[0]);
        await this.recordSecurityEvent(null, 'SIGN_IN_FAILURE', false, { reason: 'invalid_email' });
        this.emit('SIGN_IN_ERROR', error);
        return { success: false, error };
      }

      // Attempt authentication
      let authResult;
      if (isLocalMode()) {
        authResult = await localAuth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
      } else {
        authResult = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
      }

      if (authResult.error) {
        const error = this.mapSupabaseError(authResult.error);
        await this.recordSecurityEvent(null, 'SIGN_IN_FAILURE', false, { reason: error.code });
        this.emit('SIGN_IN_ERROR', error);
        return { success: false, error };
      }

      // Success - create session
      const session = await this.createSessionFromSupabaseAuth(authResult.data);
      await this.recordSecurityEvent(session.user.id, 'SIGN_IN_SUCCESS', true);

      // Handle remember me
      if (credentials.rememberMe) {
        this.sessionManager.setRememberMe(credentials.email);
      }

      this.emit('SIGN_IN_SUCCESS', session);
      return { success: true, data: session };

    } catch (error) {
      const authError = createAuthError('UNKNOWN_ERROR', 'An unexpected error occurred during sign-in.');
      this.emit('SIGN_IN_ERROR', authError);
      return { success: false, error: authError };
    }
  }

  public async signUp(credentials: SignUpCredentials): Promise<SignUpResponse> {
    this.emit('SIGN_UP_START', credentials);

    try {
      // Rate limiting check
      const rateLimitStatus = await this.checkRateLimit('signUp', credentials.email);
      if (rateLimitStatus.blocked) {
        const error = createAuthError('RATE_LIMITED', 'Too many sign-up attempts. Please try again later.');
        this.emit('SIGN_UP_ERROR', error);
        return { success: false, error };
      }

      // Validate credentials
      const validationResult = this.validateSignUpCredentials(credentials);
      if (!validationResult.success) {
        this.emit('SIGN_UP_ERROR', validationResult.error);
        return validationResult;
      }

      // Check if email already exists
      const emailExists = await this.checkEmailExists(credentials.email);
      if (emailExists) {
        const error = createAuthError('EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
        await this.recordSecurityEvent(null, 'SIGN_UP_FAILURE', false, { reason: 'email_exists' });
        this.emit('SIGN_UP_ERROR', error);
        return { success: false, error };
      }

      // Attempt registration
      let authResult;
      if (isLocalMode()) {
        authResult = await localAuth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: credentials.fullName,
              accept_terms: credentials.acceptTerms,
              subscribe_newsletter: credentials.subscribeNewsletter || false
            }
          }
        });
      } else {
        const redirectUrl = `${window.location.origin}/verify-email`;
        authResult = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: credentials.fullName,
              accept_terms: credentials.acceptTerms,
              subscribe_newsletter: credentials.subscribeNewsletter || false
            }
          }
        });
      }

      if (authResult.error) {
        const error = this.mapSupabaseError(authResult.error);
        await this.recordSecurityEvent(null, 'SIGN_UP_FAILURE', false, { reason: error.code });
        this.emit('SIGN_UP_ERROR', error);
        return { success: false, error };
      }

      // Success
      if (authResult.data.user) {
        await this.recordSecurityEvent(authResult.data.user.id, 'SIGN_UP_SUCCESS', true);
      }

      this.emit('SIGN_UP_SUCCESS', { emailSent: !authResult.data.session });
      return {
        success: true,
        data: { emailSent: !authResult.data.session }
      };

    } catch (error) {
      const authError = createAuthError('UNKNOWN_ERROR', 'An unexpected error occurred during sign-up.');
      this.emit('SIGN_UP_ERROR', authError);
      return { success: false, error: authError };
    }
  }

  public async sendMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    try {
      // Rate limiting check
      const rateLimitStatus = await this.checkRateLimit('magicLink', request.email);
      if (rateLimitStatus.blocked) {
        const error = createAuthError('RATE_LIMITED', 'Too many magic link requests. Please try again later.');
        return { success: false, error };
      }

      // Validate email
      const emailValidation = validateEmail(request.email);
      if (!emailValidation.isValid) {
        const error = createAuthError('INVALID_CREDENTIALS', emailValidation.errors[0]);
        return { success: false, error };
      }

      // Send magic link
      let result;
      if (isLocalMode()) {
        result = await localAuth.signInWithOtp({
          email: request.email,
          options: {
            emailRedirectTo: request.redirectUrl || `${window.location.origin}/auth/callback`
          }
        });
      } else {
        result = await supabase.auth.signInWithOtp({
          email: request.email,
          options: {
            emailRedirectTo: request.redirectUrl || `${window.location.origin}/auth/callback`
          }
        });
      }

      if (result.error) {
        const error = this.mapSupabaseError(result.error);
        return { success: false, error };
      }

      return { success: true, data: { emailSent: true } };

    } catch (error) {
      const authError = createAuthError('UNKNOWN_ERROR', 'An unexpected error occurred while sending magic link.');
      return { success: false, error: authError };
    }
  }

  public async signOut(): Promise<void> {
    this.emit('SIGN_OUT_START');

    try {
      // Clear session storage
      this.sessionManager.clearSession();

      // Sign out from auth provider
      if (isLocalMode()) {
        await localAuth.signOut();
      } else {
        await supabase.auth.signOut();
      }

      this.emit('SIGN_OUT_SUCCESS');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Don't throw - we want to clear local state regardless
      this.emit('SIGN_OUT_SUCCESS');
    }
  }

  public async resetPassword(email: string): Promise<AuthResponse> {
    try {
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        const error = createAuthError('INVALID_CREDENTIALS', emailValidation.errors[0]);
        return { success: false, error };
      }

      // Send password reset email
      let result;
      if (isLocalMode()) {
        result = await localAuth.resetPasswordForEmail(email);
      } else {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      }

      if (result.error) {
        const error = this.mapSupabaseError(result.error);
        return { success: false, error };
      }

      await this.recordSecurityEvent(null, 'PASSWORD_RESET_REQUEST', true, { email });
      return { success: true };

    } catch (error) {
      const authError = createAuthError('UNKNOWN_ERROR', 'An unexpected error occurred while resetting password.');
      return { success: false, error: authError };
    }
  }

  public async getCurrentSession(): Promise<AuthSession | null> {
    try {
      let sessionData;

      if (isLocalMode()) {
        const { data } = await localAuth.getSession();
        sessionData = data;
      } else {
        const { data } = await supabase.auth.getSession();
        sessionData = data;
      }

      if (sessionData?.session) {
        return await this.createSessionFromSupabaseAuth(sessionData);
      }

      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  public async refreshSession(): Promise<AuthResponse<AuthSession>> {
    try {
      let result;

      if (isLocalMode()) {
        result = await localAuth.refreshSession();
      } else {
        result = await supabase.auth.refreshSession();
      }

      if (result.error) {
        const error = this.mapSupabaseError(result.error);
        this.emit('SESSION_EXPIRED');
        return { success: false, error };
      }

      if (result.data?.session) {
        const session = await this.createSessionFromSupabaseAuth(result.data);
        this.emit('SESSION_REFRESH', session);
        return { success: true, data: session };
      }

      return { success: false, error: createAuthError('SESSION_EXPIRED', 'Session could not be refreshed.') };
    } catch (error) {
      const authError = createAuthError('UNKNOWN_ERROR', 'An unexpected error occurred while refreshing session.');
      return { success: false, error: authError };
    }
  }

  // ==================== Helper Methods ====================

  private validateSignUpCredentials(credentials: SignUpCredentials): SignUpResponse {
    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        error: createAuthError('INVALID_CREDENTIALS', emailValidation.errors[0])
      };
    }

    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: createAuthError('WEAK_PASSWORD', passwordValidation.errors[0])
      };
    }

    if (!credentials.fullName || credentials.fullName.trim().length < 2) {
      return {
        success: false,
        error: createAuthError('INVALID_CREDENTIALS', 'Full name must be at least 2 characters long.')
      };
    }

    if (!credentials.acceptTerms) {
      return {
        success: false,
        error: createAuthError('INVALID_CREDENTIALS', 'You must accept the terms of service.')
      };
    }

    return { success: true, data: { emailSent: false } };
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This would typically check against your user database
      // For now, we'll let the auth provider handle duplicate detection
      return false;
    } catch (error) {
      return false;
    }
  }

  private async createSessionFromSupabaseAuth(authData: any): Promise<AuthSession> {
    const supabaseUser = authData.session?.user || authData.user;
    const supabaseSession = authData.session;

    // Transform Supabase user to our AuthUser format
    const user: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      fullName: supabaseUser.user_metadata?.full_name || '',
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      emailVerified: !!supabaseUser.email_confirmed_at,
      twoFactorEnabled: false, // Will be implemented later
      role: 'user', // Default role, will be fetched from profile
      subscriptionTier: 'free',
      lastSignInAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
      signInCount: 0,
      preferences: {},
      onboardingCompleted: false,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at)
    };

    const session: AuthSession = {
      accessToken: supabaseSession?.access_token || '',
      refreshToken: supabaseSession?.refresh_token || '',
      expiresAt: new Date((supabaseSession?.expires_at || 0) * 1000),
      user
    };

    // Store session
    this.sessionManager.setSession(session);

    return session;
  }

  private mapSupabaseError(error: any): AuthError {
    const message = error.message || 'An error occurred';

    if (message.includes('Invalid login credentials')) {
      return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }
    if (message.includes('Email not confirmed')) {
      return createAuthError('EMAIL_NOT_VERIFIED', 'Please verify your email address before signing in.');
    }
    if (message.includes('User already registered')) {
      return createAuthError('EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
    }
    if (message.includes('Password should be at least')) {
      return createAuthError('WEAK_PASSWORD', 'Password must be at least 6 characters long.');
    }

    return createAuthError('UNKNOWN_ERROR', message);
  }

  private async checkRateLimit(operation: string, identifier: string): Promise<RateLimitStatus> {
    const key = `${operation}:${identifier}`;

    if (!this.rateLimiters.has(key)) {
      const config = this.config.rateLimits[operation as keyof typeof this.config.rateLimits];
      this.rateLimiters.set(key, new RateLimiter(config));
    }

    const rateLimiter = this.rateLimiters.get(key)!;
    return rateLimiter.checkLimit();
  }

  private async recordSecurityEvent(
    userId: string | null,
    eventType: SecurityEventType,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event: Omit<SecurityEvent, 'id'> = {
        userId: userId || '',
        eventType,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        success,
        metadata,
        timestamp: new Date()
      };

      // Store security event (implementation depends on your backend)
      console.log('Security event:', event);
    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  private async getClientIP(): Promise<string> {
    // In a real implementation, you'd get this from a service
    return '0.0.0.0';
  }

  private initializeRateLimiters(): void {
    // Rate limiters are created on-demand
  }

  private getDefaultConfig(): AuthConfig {
    return {
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      rateLimits: {
        signIn: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
        signUp: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
        magicLink: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }
      },
      socialProviders: [
        { id: 'google', name: 'Google', icon: 'google', color: '#4285F4', enabled: true },
        { id: 'apple', name: 'Apple', icon: 'apple', color: '#000000', enabled: true }
      ],
      features: {
        magicLink: true,
        socialAuth: true,
        twoFactor: false,
        deviceTrust: false
      },
      redirectUrls: {
        afterSignIn: '/app/capture',
        afterSignUp: '/onboarding',
        afterSignOut: '/login',
        emailVerification: '/verify-email',
        passwordReset: '/reset-password'
      }
    };
  }
}