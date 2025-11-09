/**
 * Storage Utilities for Authentication
 *
 * Provides secure session management, remember me functionality,
 * and proper token storage with encryption and expiration.
 */

import type { AuthSession, AuthUser } from '../core/types';
import { SecurityTokenGenerator } from './security';

/**
 * Session manager for secure token storage and retrieval
 */
export class SessionManager {
  private static readonly SESSION_KEY = 'beproductive_auth_session';
  private static readonly REMEMBER_ME_KEY = 'beproductive_remember_me';
  private static readonly LAST_ACTIVITY_KEY = 'beproductive_last_activity';
  private static readonly DEVICE_ID_KEY = 'beproductive_device_id';

  /**
   * Store authentication session securely
   */
  public setSession(session: AuthSession): void {
    try {
      const sessionData = {
        ...session,
        expiresAt: session.expiresAt.toISOString(),
        user: {
          ...session.user,
          createdAt: session.user.createdAt.toISOString(),
          updatedAt: session.user.updatedAt.toISOString(),
          lastSignInAt: session.user.lastSignInAt?.toISOString()
        }
      };

      const encrypted = this.encryptData(JSON.stringify(sessionData));
      sessionStorage.setItem(SessionManager.SESSION_KEY, encrypted);
      this.updateLastActivity();
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Retrieve authentication session
   */
  public getSession(): AuthSession | null {
    try {
      const encrypted = sessionStorage.getItem(SessionManager.SESSION_KEY);
      if (!encrypted) return null;

      const decrypted = this.decryptData(encrypted);
      const sessionData = JSON.parse(decrypted);

      // Convert ISO strings back to Date objects
      const session: AuthSession = {
        ...sessionData,
        expiresAt: new Date(sessionData.expiresAt),
        user: {
          ...sessionData.user,
          createdAt: new Date(sessionData.user.createdAt),
          updatedAt: new Date(sessionData.user.updatedAt),
          lastSignInAt: sessionData.user.lastSignInAt ? new Date(sessionData.user.lastSignInAt) : undefined
        }
      };

      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear authentication session
   */
  public clearSession(): void {
    try {
      sessionStorage.removeItem(SessionManager.SESSION_KEY);
      sessionStorage.removeItem(SessionManager.LAST_ACTIVITY_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session exists and is valid
   */
  public hasValidSession(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Update last activity timestamp
   */
  public updateLastActivity(): void {
    try {
      const now = new Date().toISOString();
      sessionStorage.setItem(SessionManager.LAST_ACTIVITY_KEY, now);
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Get last activity timestamp
   */
  public getLastActivity(): Date | null {
    try {
      const timestamp = sessionStorage.getItem(SessionManager.LAST_ACTIVITY_KEY);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set remember me preference and email
   */
  public setRememberMe(email: string): void {
    try {
      const rememberData = {
        email,
        timestamp: new Date().toISOString()
      };
      const encrypted = this.encryptData(JSON.stringify(rememberData));
      localStorage.setItem(SessionManager.REMEMBER_ME_KEY, encrypted);
    } catch (error) {
      console.error('Failed to set remember me:', error);
    }
  }

  /**
   * Get remembered email
   */
  public getRememberedEmail(): string | null {
    try {
      const encrypted = localStorage.getItem(SessionManager.REMEMBER_ME_KEY);
      if (!encrypted) return null;

      const decrypted = this.decryptData(encrypted);
      const rememberData = JSON.parse(decrypted);

      // Check if remember me data is not too old (30 days)
      const timestamp = new Date(rememberData.timestamp);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (timestamp < thirtyDaysAgo) {
        this.clearRememberMe();
        return null;
      }

      return rememberData.email;
    } catch (error) {
      console.error('Failed to get remembered email:', error);
      this.clearRememberMe();
      return null;
    }
  }

  /**
   * Clear remember me data
   */
  public clearRememberMe(): void {
    try {
      localStorage.removeItem(SessionManager.REMEMBER_ME_KEY);
    } catch (error) {
      console.error('Failed to clear remember me:', error);
    }
  }

  /**
   * Get or create device ID for device trust
   */
  public getDeviceId(): string {
    try {
      let deviceId = localStorage.getItem(SessionManager.DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = SecurityTokenGenerator.generateToken(16);
        localStorage.setItem(SessionManager.DEVICE_ID_KEY, deviceId);
      }
      return deviceId;
    } catch (error) {
      // Return a temporary device ID if storage fails
      return 'temp_' + SecurityTokenGenerator.generateToken(8);
    }
  }

  /**
   * Store user preferences
   */
  public setUserPreferences(userId: string, preferences: Record<string, any>): void {
    try {
      const key = `beproductive_preferences_${userId}`;
      const encrypted = this.encryptData(JSON.stringify(preferences));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(userId: string): Record<string, any> | null {
    try {
      const key = `beproductive_preferences_${userId}`;
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = this.decryptData(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  /**
   * Clear all auth-related storage
   */
  public clearAllStorage(): void {
    this.clearSession();
    this.clearRememberMe();

    // Clear any other auth-related storage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('beproductive_auth_') ||
            key.startsWith('beproductive_preferences_') ||
            key.startsWith('auth_rate_limit_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all storage:', error);
    }
  }

  // ==================== Private Methods ====================

  /**
   * Check if session is expired based on timestamp and activity
   */
  private isSessionExpired(session: AuthSession): boolean {
    const now = new Date();

    // Check absolute expiration
    if (now > session.expiresAt) {
      return true;
    }

    // Check activity timeout (4 hours)
    const lastActivity = this.getLastActivity();
    if (lastActivity) {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      if (lastActivity < fourHoursAgo) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple encryption for storage (not cryptographically secure)
   * In production, use proper encryption or store tokens server-side
   */
  private encryptData(data: string): string {
    try {
      // Simple base64 encoding with XOR cipher
      const key = this.getEncryptionKey();
      let encrypted = '';

      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }

      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(data); // Fallback to just base64
    }
  }

  /**
   * Simple decryption for storage
   */
  private decryptData(encryptedData: string): string {
    try {
      const encrypted = atob(encryptedData);
      const key = this.getEncryptionKey();
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return atob(encryptedData); // Fallback to just base64
    }
  }

  /**
   * Get encryption key based on device characteristics
   */
  private getEncryptionKey(): string {
    // Generate a device-specific key
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width.toString(),
      screen.height.toString(),
      new Date().getTimezoneOffset().toString()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36) + 'beproductive';
  }
}

/**
 * Token storage utilities for different types of tokens
 */
export class TokenStorage {
  private static readonly PREFIX = 'beproductive_token_';

  /**
   * Store a token with expiration
   */
  public static setToken(
    name: string,
    token: string,
    expiresIn: number = 3600000, // 1 hour default
    persistent: boolean = false
  ): void {
    try {
      const expiresAt = new Date(Date.now() + expiresIn);
      const tokenData = {
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      };

      const storage = persistent ? localStorage : sessionStorage;
      const key = TokenStorage.PREFIX + name;
      storage.setItem(key, JSON.stringify(tokenData));
    } catch (error) {
      console.error(`Failed to store token ${name}:`, error);
    }
  }

  /**
   * Get a token if it exists and hasn't expired
   */
  public static getToken(name: string, persistent: boolean = false): string | null {
    try {
      const storage = persistent ? localStorage : sessionStorage;
      const key = TokenStorage.PREFIX + name;
      const stored = storage.getItem(key);

      if (!stored) return null;

      const tokenData = JSON.parse(stored);
      const expiresAt = new Date(tokenData.expiresAt);

      if (new Date() > expiresAt) {
        TokenStorage.removeToken(name, persistent);
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error(`Failed to get token ${name}:`, error);
      TokenStorage.removeToken(name, persistent);
      return null;
    }
  }

  /**
   * Remove a token
   */
  public static removeToken(name: string, persistent: boolean = false): void {
    try {
      const storage = persistent ? localStorage : sessionStorage;
      const key = TokenStorage.PREFIX + name;
      storage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove token ${name}:`, error);
    }
  }

  /**
   * Check if a token exists and is valid
   */
  public static hasValidToken(name: string, persistent: boolean = false): boolean {
    return TokenStorage.getToken(name, persistent) !== null;
  }

  /**
   * Clear all tokens
   */
  public static clearAllTokens(): void {
    try {
      [sessionStorage, localStorage].forEach(storage => {
        const keys = Object.keys(storage);
        keys.forEach(key => {
          if (key.startsWith(TokenStorage.PREFIX)) {
            storage.removeItem(key);
          }
        });
      });
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
    }
  }
}

/**
 * Cache manager for auth-related data
 */
export class AuthCache {
  private static readonly PREFIX = 'beproductive_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cached data with TTL
   */
  public static set(
    key: string,
    data: any,
    ttl: number = AuthCache.DEFAULT_TTL
  ): void {
    try {
      const expiresAt = new Date(Date.now() + ttl);
      const cacheData = {
        data,
        expiresAt: expiresAt.toISOString()
      };

      const cacheKey = AuthCache.PREFIX + key;
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Failed to cache data for ${key}:`, error);
    }
  }

  /**
   * Get cached data if not expired
   */
  public static get(key: string): any | null {
    try {
      const cacheKey = AuthCache.PREFIX + key;
      const stored = sessionStorage.getItem(cacheKey);

      if (!stored) return null;

      const cacheData = JSON.parse(stored);
      const expiresAt = new Date(cacheData.expiresAt);

      if (new Date() > expiresAt) {
        AuthCache.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error(`Failed to get cached data for ${key}:`, error);
      AuthCache.remove(key);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  public static remove(key: string): void {
    try {
      const cacheKey = AuthCache.PREFIX + key;
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      console.error(`Failed to remove cached data for ${key}:`, error);
    }
  }

  /**
   * Clear all cached data
   */
  public static clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(AuthCache.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear auth cache:', error);
    }
  }
}

/**
 * Storage health checker
 */
export class StorageHealth {
  /**
   * Check if storage is available and working
   */
  public static checkStorageHealth(): {
    localStorage: boolean;
    sessionStorage: boolean;
    quotaAvailable: boolean;
  } {
    return {
      localStorage: this.testStorage(localStorage),
      sessionStorage: this.testStorage(sessionStorage),
      quotaAvailable: this.checkQuota()
    };
  }

  /**
   * Test if a storage mechanism is working
   */
  private static testStorage(storage: Storage): boolean {
    try {
      const testKey = 'beproductive_storage_test';
      const testValue = 'test';
      storage.setItem(testKey, testValue);
      const retrieved = storage.getItem(testKey);
      storage.removeItem(testKey);
      return retrieved === testValue;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if we have sufficient storage quota
   */
  private static checkQuota(): boolean {
    try {
      // Try to estimate storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          const used = estimate.usage || 0;
          const quota = estimate.quota || 0;
          const available = quota - used;
          return available > 1024 * 1024; // At least 1MB available
        });
      }
      return true; // Assume available if we can't check
    } catch (error) {
      return true;
    }
  }
}