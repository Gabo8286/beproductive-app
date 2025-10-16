// Guest mode utilities for development and testing
import { User, Session } from "@supabase/supabase-js";
import { ProfileWithRole } from "@/types/database";

export type GuestUserType = 'admin' | 'user' | 'professional' | 'team';

export interface GuestModeConfig {
  enabled: boolean;
  adminEmail: string;
  userEmail: string;
  professionalEmail: string;
  teamEmail: string;
}

/**
 * Check if guest mode is enabled
 * SECURITY: Guest mode is disabled in production to prevent privilege escalation
 */
export const isGuestModeEnabled = (): boolean => {
  // Prevent guest mode in production builds
  if (import.meta.env.PROD) {
    return false;
  }
  return import.meta.env.VITE_ENABLE_GUEST_MODE === 'true';
};

/**
 * Get guest mode configuration
 */
export const getGuestModeConfig = (): GuestModeConfig => {
  return {
    enabled: isGuestModeEnabled(),
    adminEmail: import.meta.env.VITE_GUEST_ADMIN_EMAIL || 'admin@guest.local',
    userEmail: import.meta.env.VITE_GUEST_USER_EMAIL || 'user@guest.local',
    professionalEmail: import.meta.env.VITE_GUEST_PROFESSIONAL_EMAIL || 'professional@guest.local',
    teamEmail: import.meta.env.VITE_GUEST_TEAM_EMAIL || 'team@guest.local',
  };
};

/**
 * Create a mock guest user
 * SECURITY: This function is for development/testing only
 */
export const createGuestUser = (type: GuestUserType): User => {
  // Prevent guest user creation in production
  if (import.meta.env.PROD) {
    throw new Error('Guest mode is disabled in production');
  }

  const config = getGuestModeConfig();
  let email: string;
  let userId: string;
  let fullName: string;

  switch (type) {
    case 'admin':
      email = config.adminEmail;
      userId = 'guest-admin-id';
      fullName = 'Guest Admin';
      break;
    case 'professional':
      email = config.professionalEmail;
      userId = 'guest-professional-id';
      fullName = 'Guest Professional';
      break;
    case 'team':
      email = config.teamEmail;
      userId = 'guest-team-id';
      fullName = 'Guest Team Lead';
      break;
    case 'user':
    default:
      email = config.userEmail;
      userId = 'guest-user-id';
      fullName = 'Guest User';
      break;
  }

  return {
    id: userId,
    email,
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    app_metadata: {
      provider: 'guest',
      providers: ['guest']
    },
    user_metadata: {
      full_name: fullName,
      avatar_url: null,
      guest_mode: true,
      guest_type: type
    },
    aud: 'authenticated',
    role: 'authenticated',
  } as User;
};

/**
 * Create a mock guest session
 */
export const createGuestSession = (type: GuestUserType): Session => {
  const user = createGuestUser(type);

  return {
    access_token: `guest_token_${type}_${Date.now()}`,
    refresh_token: `guest_refresh_${type}_${Date.now()}`,
    expires_in: 3600,
    token_type: 'bearer',
    user,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  } as Session;
};

/**
 * Create a mock guest profile
 */
export const createGuestProfile = (type: GuestUserType): ProfileWithRole => {
  const user = createGuestUser(type);

  let role: string;
  let subscriptionTier: string;

  switch (type) {
    case 'admin':
      role = 'super_admin';
      subscriptionTier = 'enterprise';
      break;
    case 'professional':
      role = 'user';
      subscriptionTier = 'pro';
      break;
    case 'team':
      role = 'team_lead';
      subscriptionTier = 'team';
      break;
    case 'user':
    default:
      role = 'user';
      subscriptionTier = 'free';
      break;
  }

  return {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata.full_name,
    avatar_url: null,
    subscription_tier: subscriptionTier,
    preferences: {},
    onboarding_completed: true,
    created_at: user.created_at,
    updated_at: user.created_at,
    // Additional fields for guest mode
    role: role,
    guest_mode: true,
    guest_type: type,
  } as ProfileWithRole & {
    role: string;
    guest_mode: boolean;
    guest_type: GuestUserType;
  };
};

/**
 * Check if a user is a guest user
 */
export const isGuestUser = (user: User | null): boolean => {
  return user?.user_metadata?.guest_mode === true;
};

/**
 * Get guest user type
 */
export const getGuestUserType = (user: User | null): GuestUserType | null => {
  if (!isGuestUser(user)) return null;
  return user?.user_metadata?.guest_type || null;
};

/**
 * Check if guest user has admin role
 */
export const isGuestAdmin = (user: User | null): boolean => {
  return getGuestUserType(user) === 'admin';
};

/**
 * Storage key for guest mode selection
 */
export const GUEST_MODE_STORAGE_KEY = 'beproductive_guest_mode_selection';

/**
 * Get saved guest mode selection from localStorage
 */
export const getSavedGuestModeSelection = (): GuestUserType | null => {
  try {
    const saved = localStorage.getItem(GUEST_MODE_STORAGE_KEY);
    return saved as GuestUserType | null;
  } catch {
    return null;
  }
};

/**
 * Save guest mode selection to localStorage
 */
export const saveGuestModeSelection = (type: GuestUserType): void => {
  try {
    localStorage.setItem(GUEST_MODE_STORAGE_KEY, type);
  } catch (error) {
    console.warn('Failed to save guest mode selection:', error);
  }
};

/**
 * Clear guest mode selection from localStorage
 */
export const clearGuestModeSelection = (): void => {
  try {
    localStorage.removeItem(GUEST_MODE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear guest mode selection:', error);
  }
};

/**
 * Mock role checking for guest users
 */
export const guestHasRole = (user: User | null, role: string): boolean => {
  if (!isGuestUser(user)) return false;

  const guestType = getGuestUserType(user);

  switch (role) {
    case 'super_admin':
      return guestType === 'admin';
    case 'admin':
      return guestType === 'admin';
    case 'team_lead':
      return guestType === 'admin' || guestType === 'team'; // Admin and team have team lead access
    case 'user':
      return true; // All guest types have at least user role
    case 'enterprise':
      // Enterprise access for guest users is subscription-based
      // Admin guest users have enterprise subscription
      return guestType === 'admin';
    default:
      return false;
  }
};