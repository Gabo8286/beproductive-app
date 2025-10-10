// Guest mode utilities for development and testing
import { User, Session } from "@supabase/supabase-js";
import { Profile } from "@/types/database";

export type GuestUserType = 'admin' | 'user';

export interface GuestModeConfig {
  enabled: boolean;
  adminEmail: string;
  userEmail: string;
}

/**
 * Check if guest mode is enabled
 */
export const isGuestModeEnabled = (): boolean => {
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
  };
};

/**
 * Create a mock guest user
 */
export const createGuestUser = (type: GuestUserType): User => {
  const config = getGuestModeConfig();
  const email = type === 'admin' ? config.adminEmail : config.userEmail;
  const userId = type === 'admin' ? 'guest-admin-id' : 'guest-user-id';

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
      full_name: type === 'admin' ? 'Guest Admin' : 'Guest User',
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
export const createGuestProfile = (type: GuestUserType): Profile => {
  const user = createGuestUser(type);

  return {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata.full_name,
    avatar_url: null,
    onboarding_completed: true,
    created_at: user.created_at,
    updated_at: user.created_at,
    // Additional fields for guest mode
    role: type === 'admin' ? 'super_admin' : 'user',
    guest_mode: true,
    guest_type: type,
  } as Profile & {
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
      return guestType === 'admin'; // Admin can also be team lead
    case 'user':
      return true; // Both admin and user have user role
    default:
      return false;
  }
};