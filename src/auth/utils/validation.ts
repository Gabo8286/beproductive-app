/**
 * Authentication Validation Utilities
 *
 * Provides robust validation for authentication forms with
 * real-time feedback and security-focused password checking.
 */

import type {
  ValidationResult,
  FormValidation,
  PasswordRequirements,
  PasswordStrength,
  AuthError,
  AuthErrorCode
} from '../core/types';

// Default password requirements
const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

/**
 * Validate email address format and deliverability
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || !email.trim()) {
    errors.push('Email address is required');
    return { isValid: false, errors };
  }

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors };
  }

  // Length validation
  if (email.length > 254) {
    errors.push('Email address is too long');
    return { isValid: false, errors };
  }

  // Local part validation
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) {
    errors.push('Email address local part is too long');
    return { isValid: false, errors };
  }

  // Common typo detection
  const commonDomainTypos = {
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'outlook.co': 'outlook.com'
  };

  if (commonDomainTypos[domain as keyof typeof commonDomainTypos]) {
    errors.push(`Did you mean ${email.replace(domain, commonDomainTypos[domain as keyof typeof commonDomainTypos])}?`);
    return { isValid: false, errors };
  }

  // Disposable email detection (basic list)
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org'
  ];

  if (disposableDomains.includes(domain.toLowerCase())) {
    errors.push('Please use a permanent email address');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
}

/**
 * Validate password strength and requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  // Length requirement
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  // Character type requirements
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common password checks
  if (isCommonPassword(password)) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  // Sequential character check
  if (hasSequentialCharacters(password)) {
    errors.push('Password should not contain sequential characters (like 123 or abc)');
  }

  // Repeated character check
  if (hasRepeatedCharacters(password)) {
    errors.push('Password should not contain too many repeated characters');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Calculate password strength score and provide feedback
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isValid: false
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Penalty for common patterns
  if (isCommonPassword(password)) score = Math.max(0, score - 2);
  if (hasSequentialCharacters(password)) score = Math.max(0, score - 1);
  if (hasRepeatedCharacters(password)) score = Math.max(0, score - 1);

  // Cap score at 4
  score = Math.min(4, score);

  // Generate feedback
  switch (score) {
    case 0:
    case 1:
      feedback.push('Very weak password');
      feedback.push('Add uppercase letters, numbers, and special characters');
      break;
    case 2:
      feedback.push('Weak password');
      feedback.push('Consider adding more character types or length');
      break;
    case 3:
      feedback.push('Good password');
      feedback.push('Consider making it longer for better security');
      break;
    case 4:
      feedback.push('Strong password');
      break;
  }

  return {
    score,
    feedback,
    isValid: score >= 3
  };
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): ValidationResult {
  const errors: string[] = [];

  if (!fullName || !fullName.trim()) {
    errors.push('Full name is required');
    return { isValid: false, errors };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (trimmedName.length > 100) {
    errors.push('Full name is too long');
  }

  // Check for invalid characters
  if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    errors.push('Full name contains invalid characters');
  }

  // Check for reasonable structure
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
  if (nameParts.length < 1) {
    errors.push('Please enter at least a first name');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push('Please confirm your password');
    return { isValid: false, errors };
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate entire sign-up form
 */
export function validateSignUpForm(
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  acceptTerms: boolean
): FormValidation {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    fullName: validateFullName(fullName)
  };
}

/**
 * Validate sign-in form
 */
export function validateSignInForm(email: string, password: string): FormValidation {
  return {
    email: validateEmail(email),
    password: password ? { isValid: true, errors: [] } : { isValid: false, errors: ['Password is required'] }
  };
}

/**
 * Create standardized auth error
 */
export function createAuthError(code: AuthErrorCode, message: string, details?: Record<string, any>): AuthError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

// ==================== Helper Functions ====================

/**
 * Check if password is in common password list
 */
function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'password1', '123123', 'football', 'iloveyou',
    'master', 'sunshine', 'princess', 'charlie', 'login',
    'passw0rd', 'Password1', '12345678', 'qwerty123'
  ];

  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Check for sequential characters (123, abc, etc.)
 */
function hasSequentialCharacters(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
    '0123456789'
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const substr = sequence.substring(i, i + 3);
      if (password.toLowerCase().includes(substr)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check for too many repeated characters
 */
function hasRepeatedCharacters(password: string): boolean {
  let maxRepeats = 0;
  let currentRepeats = 1;
  let lastChar = '';

  for (const char of password) {
    if (char === lastChar) {
      currentRepeats++;
    } else {
      maxRepeats = Math.max(maxRepeats, currentRepeats);
      currentRepeats = 1;
      lastChar = char;
    }
  }

  maxRepeats = Math.max(maxRepeats, currentRepeats);
  return maxRepeats >= 3; // 3 or more repeated characters
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red';
    case 2:
      return 'orange';
    case 3:
      return 'yellow';
    case 4:
      return 'green';
    default:
      return 'gray';
  }
}

/**
 * Get password strength text
 */
export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
}