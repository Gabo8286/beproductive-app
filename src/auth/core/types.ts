/**
 * Core Authentication Types
 *
 * Clean, well-defined types for the new authentication system.
 * Replaces the complex types scattered across the old system.
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  lastSignInAt?: Date;
  signInCount: number;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export type UserRole = 'user' | 'admin' | 'super_admin' | 'team_lead';

export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy?: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
}

// Authentication Methods
export type AuthMethod = 'email' | 'magic-link' | 'google' | 'apple' | 'github';

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

export interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

export interface SocialAuthProvider {
  id: AuthMethod;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

// Password Requirements
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// Authentication Errors
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'WEAK_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_TOKEN'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidation {
  email: ValidationResult;
  password: ValidationResult;
  fullName?: ValidationResult;
  confirmPassword?: ValidationResult;
}

// Security
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: SecurityEventType;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type SecurityEventType =
  | 'SIGN_IN_SUCCESS'
  | 'SIGN_IN_FAILURE'
  | 'SIGN_UP_SUCCESS'
  | 'SIGN_UP_FAILURE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'EMAIL_VERIFICATION'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED';

// Device Trust
export interface TrustedDevice {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  trustedAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
}

// Rate Limiting
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: Date;
  blocked: boolean;
}

// API Response Types
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

export interface SignInResponse extends AuthResponse<AuthSession> {}
export interface SignUpResponse extends AuthResponse<{ emailSent: boolean }> {}
export interface MagicLinkResponse extends AuthResponse<{ emailSent: boolean }> />

// Configuration
export interface AuthConfig {
  passwordRequirements: PasswordRequirements;
  rateLimits: {
    signIn: RateLimitConfig;
    signUp: RateLimitConfig;
    magicLink: RateLimitConfig;
  };
  socialProviders: SocialAuthProvider[];
  features: {
    magicLink: boolean;
    socialAuth: boolean;
    twoFactor: boolean;
    deviceTrust: boolean;
  };
  redirectUrls: {
    afterSignIn: string;
    afterSignUp: string;
    afterSignOut: string;
    emailVerification: string;
    passwordReset: string;
  };
}

// Hooks and Context
export interface AuthContextValue {
  state: AuthState;
  signIn: (credentials: SignInCredentials) => Promise<SignInResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  sendMagicLink: (request: MagicLinkRequest) => Promise<MagicLinkResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthResponse>;
  refreshSession: () => Promise<AuthResponse<AuthSession>>;
  clearError: () => void;
}

// Events
export type AuthEventType =
  | 'SIGN_IN_START'
  | 'SIGN_IN_SUCCESS'
  | 'SIGN_IN_ERROR'
  | 'SIGN_UP_START'
  | 'SIGN_UP_SUCCESS'
  | 'SIGN_UP_ERROR'
  | 'SIGN_OUT_START'
  | 'SIGN_OUT_SUCCESS'
  | 'SESSION_REFRESH'
  | 'SESSION_EXPIRED'
  | 'AUTH_STATE_CHANGE';

export interface AuthEvent {
  type: AuthEventType;
  payload?: any;
  timestamp: Date;
}

export type AuthEventHandler = (event: AuthEvent) => void;