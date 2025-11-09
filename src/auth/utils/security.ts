/**
 * Security Utilities for Authentication
 *
 * Provides rate limiting, device fingerprinting, and other
 * security features to protect against abuse and attacks.
 */

import type {
  RateLimitConfig,
  RateLimitStatus,
  TrustedDevice,
  SecurityEvent
} from '../core/types';

/**
 * Rate limiter implementation using local storage for client-side limits
 * In production, this should be complemented by server-side rate limiting
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private storageKey: string;

  constructor(config: RateLimitConfig, identifier: string = '') {
    this.config = config;
    this.storageKey = `auth_rate_limit_${identifier}`;
  }

  public async checkLimit(): Promise<RateLimitStatus> {
    const now = Date.now();
    const attempts = this.getAttempts();

    // Clean up old attempts outside the window
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    // Check if blocked
    if (validAttempts.length > 0) {
      const oldestAttempt = Math.min(...validAttempts);
      const timeSinceOldest = now - oldestAttempt;

      if (validAttempts.length >= this.config.maxAttempts &&
          timeSinceOldest < this.config.blockDurationMs) {
        const resetTime = new Date(oldestAttempt + this.config.blockDurationMs);
        return {
          remaining: 0,
          resetTime,
          blocked: true
        };
      }
    }

    // Calculate remaining attempts
    const remaining = Math.max(0, this.config.maxAttempts - validAttempts.length);
    const resetTime = new Date(now + this.config.windowMs);

    return {
      remaining,
      resetTime,
      blocked: false
    };
  }

  public recordAttempt(): void {
    const attempts = this.getAttempts();
    attempts.push(Date.now());
    this.setAttempts(attempts);
  }

  public reset(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to reset rate limiter:', error);
    }
  }

  private getAttempts(): number[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private setAttempts(attempts: number[]): void {
    try {
      // Keep only recent attempts to prevent storage bloat
      const now = Date.now();
      const recentAttempts = attempts.filter(
        timestamp => now - timestamp < this.config.windowMs * 2
      );
      localStorage.setItem(this.storageKey, JSON.stringify(recentAttempts));
    } catch (error) {
      console.warn('Failed to store rate limit attempts:', error);
    }
  }
}

/**
 * Device fingerprinting for trusted device management
 */
export class DeviceFingerprinter {
  private static instance: DeviceFingerprinter;

  public static getInstance(): DeviceFingerprinter {
    if (!DeviceFingerprinter.instance) {
      DeviceFingerprinter.instance = new DeviceFingerprinter();
    }
    return DeviceFingerprinter.instance;
  }

  /**
   * Generate a device fingerprint based on browser characteristics
   */
  public async generateFingerprint(): Promise<string> {
    const components = await this.collectFingerprint();
    const fingerprint = await this.hashComponents(components);
    return fingerprint;
  }

  /**
   * Get a human-readable device name
   */
  public getDeviceName(): string {
    const userAgent = navigator.userAgent;

    // Extract browser
    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    }

    // Extract OS
    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    return `${browser} on ${os}`;
  }

  private async collectFingerprint(): Promise<Record<string, any>> {
    const components: Record<string, any> = {};

    // Basic browser info
    components.userAgent = navigator.userAgent;
    components.language = navigator.language;
    components.languages = navigator.languages?.join(',') || '';
    components.platform = navigator.platform;
    components.cookieEnabled = navigator.cookieEnabled;

    // Screen info
    components.screenResolution = `${screen.width}x${screen.height}`;
    components.screenColorDepth = screen.colorDepth;
    components.screenAvailWidth = screen.availWidth;
    components.screenAvailHeight = screen.availHeight;

    // Timezone
    components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    components.timezoneOffset = new Date().getTimezoneOffset();

    // Canvas fingerprinting (basic)
    components.canvasFingerprint = await this.getCanvasFingerprint();

    // WebGL info
    components.webglFingerprint = this.getWebGLFingerprint();

    // Audio context fingerprinting
    components.audioFingerprint = await this.getAudioFingerprint();

    // Hardware concurrency
    components.hardwareConcurrency = navigator.hardwareConcurrency || 0;

    // Device memory (if available)
    components.deviceMemory = (navigator as any).deviceMemory || 0;

    return components;
  }

  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Draw some text and shapes
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test 🔒', 2, 2);

      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(50, 20, 100, 50);

      return canvas.toDataURL();
    } catch (error) {
      return '';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;

      gainNode.gain.value = 0.05;

      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);

      oscillator.stop();
      await audioContext.close();

      return Array.from(frequencyData).slice(0, 30).join(',');
    } catch (error) {
      return '';
    }
  }

  private async hashComponents(components: Record<string, any>): Promise<string> {
    const componentString = JSON.stringify(components);
    const encoder = new TextEncoder();
    const data = encoder.encode(componentString);

    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback to simple hash if crypto.subtle is not available
      return this.simpleHash(componentString);
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Security token generator for various auth flows
 */
export class SecurityTokenGenerator {
  /**
   * Generate a cryptographically secure random token
   */
  public static generateToken(length: number = 32): string {
    try {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback for environments without crypto.getRandomValues
      return this.fallbackToken(length);
    }
  }

  /**
   * Generate a secure session token
   */
  public static generateSessionToken(): string {
    return this.generateToken(48);
  }

  /**
   * Generate a CSRF token
   */
  public static generateCSRFToken(): string {
    return this.generateToken(32);
  }

  private static fallbackToken(length: number): string {
    const chars = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < length * 2; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Secure password utilities
 */
export class PasswordSecurity {
  /**
   * Check if password has been compromised (mock implementation)
   * In production, this would check against breach databases
   */
  public static async checkPasswordBreach(password: string): Promise<boolean> {
    // Mock implementation - in production, use HaveIBeenPwned API
    const commonBreachedPasswords = [
      '123456', 'password', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    return commonBreachedPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate a secure password
   */
  public static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each set
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(symbols);

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static getRandomChar(chars: string): string {
    try {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return chars[array[0] % chars.length];
    } catch (error) {
      return chars[Math.floor(Math.random() * chars.length)];
    }
  }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize email input
   */
  public static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Sanitize name input
   */
  public static sanitizeName(name: string): string {
    return name.trim().replace(/[^\w\s\-'\.]/g, '');
  }

  /**
   * Escape HTML characters
   */
  public static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove potentially dangerous characters
   */
  public static removeDangerousChars(input: string): string {
    return input.replace(/[<>'"&]/g, '');
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

  /**
   * Check if session is expired
   */
  public static isSessionExpired(expiresAt: Date, lastActivity?: Date): boolean {
    const now = new Date();

    // Check absolute expiration
    if (now > expiresAt) {
      return true;
    }

    // Check activity timeout
    if (lastActivity) {
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      if (timeSinceActivity > this.ACTIVITY_TIMEOUT) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate secure session expiration time
   */
  public static generateExpirationTime(): Date {
    return new Date(Date.now() + this.SESSION_TIMEOUT);
  }

  /**
   * Update last activity timestamp
   */
  public static updateLastActivity(): Date {
    return new Date();
  }
}

/**
 * IP address utilities for security logging
 */
export class IPSecurity {
  /**
   * Get client IP address (mock for client-side)
   */
  public static async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would be provided by the server
      // For client-side, we can't reliably get the real IP
      return '0.0.0.0';
    } catch (error) {
      return '0.0.0.0';
    }
  }

  /**
   * Check if IP is from a known suspicious range
   */
  public static isSuspiciousIP(ip: string): boolean {
    // Mock implementation - in production, check against threat intelligence
    const suspiciousRanges = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16'
    ];

    // This is a simplified check
    return false;
  }
}

/**
 * Browser security checks
 */
export class BrowserSecurity {
  /**
   * Check if browser supports required security features
   */
  public static checkSecuritySupport(): {
    cryptoAvailable: boolean;
    secureContext: boolean;
    storageAvailable: boolean;
    webglAvailable: boolean;
  } {
    return {
      cryptoAvailable: typeof crypto !== 'undefined' && !!crypto.subtle,
      secureContext: window.isSecureContext || location.protocol === 'https:',
      storageAvailable: this.testStorageAvailable(),
      webglAvailable: this.testWebGLAvailable()
    };
  }

  private static testStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static testWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  }
}