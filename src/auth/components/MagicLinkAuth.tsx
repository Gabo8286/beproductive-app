/**
 * Magic Link Authentication - Passwordless Login
 *
 * Clean, secure passwordless authentication with magic links.
 * Provides better UX and security compared to traditional passwords.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import { validateEmail } from '../utils/validation';
import { InlineLoadingSpinner } from './LoadingSpinner';

// ==================== Types ====================

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
  showHeader?: boolean;
  autoFocus?: boolean;
  className?: string;
  defaultEmail?: string;
}

interface FormState {
  email: string;
  emailSent: boolean;
  isResending: boolean;
  lastSentTime: Date | null;
  resendCount: number;
}

// ==================== Main Component ====================

export function MagicLinkAuth({
  onSuccess,
  onBack,
  showHeader = true,
  autoFocus = true,
  className = '',
  defaultEmail = ''
}: MagicLinkFormProps) {
  const { sendMagicLink } = useAuth();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    email: defaultEmail,
    emailSent: false,
    isResending: false,
    lastSentTime: null,
    resendCount: 0
  });

  // Validation and UI state
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Refs
  const emailRef = useRef<HTMLInputElement>(null);

  // ==================== Effects ====================

  // Auto focus email field
  useEffect(() => {
    if (autoFocus && emailRef.current && !formState.email) {
      emailRef.current.focus();
    }
  }, [autoFocus]);

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  // ==================== Event Handlers ====================

  const handleEmailChange = (value: string) => {
    setFormState(prev => ({ ...prev, email: value }));

    // Clear email error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const validateForm = (): boolean => {
    const emailValidation = validateEmail(formState.email);

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.errors[0]);
      emailRef.current?.focus();
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await sendMagicLink({
        email: formState.email.trim(),
        redirectUrl: `${window.location.origin}/auth/magic-link/callback`
      });

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          emailSent: true,
          lastSentTime: new Date(),
          resendCount: prev.resendCount + 1
        }));

        // Set cooldown (30 seconds base, +15 seconds per resend)
        const cooldown = 30 + (formState.resendCount * 15);
        setCooldownSeconds(cooldown);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setEmailError(response.error?.message || 'Failed to send magic link');
      }
    } catch (error) {
      setEmailError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || formState.isResending) return;

    setFormState(prev => ({ ...prev, isResending: true }));

    try {
      const response = await sendMagicLink({
        email: formState.email.trim(),
        redirectUrl: `${window.location.origin}/auth/magic-link/callback`
      });

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          lastSentTime: new Date(),
          resendCount: prev.resendCount + 1
        }));

        // Increase cooldown with each resend
        const cooldown = 30 + (formState.resendCount * 15);
        setCooldownSeconds(cooldown);
      } else {
        setEmailError(response.error?.message || 'Failed to resend magic link');
      }
    } catch (error) {
      setEmailError('Failed to resend magic link. Please try again.');
    } finally {
      setFormState(prev => ({ ...prev, isResending: false }));
    }
  };

  const handleTryAgain = () => {
    setFormState({
      email: formState.email,
      emailSent: false,
      isResending: false,
      lastSentTime: null,
      resendCount: 0
    });
    setCooldownSeconds(0);
    setEmailError('');

    // Focus email field
    setTimeout(() => emailRef.current?.focus(), 100);
  };

  // ==================== Email Sent View ====================

  if (formState.emailSent) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>

          {/* Title and Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            We've sent a magic link to <strong>{formState.email}</strong>.
            Click the link in your email to sign in securely without a password.
          </p>

          {/* Email Tips */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-blue-900 mb-2">
              📧 Email not arriving?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your spam or junk mail folder</li>
              <li>• Make sure {formState.email} is correct</li>
              <li>• The link expires in 10 minutes for security</li>
              <li>• Only the latest link will work if you request multiple</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={cooldownSeconds > 0 || formState.isResending}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formState.isResending ? (
                <InlineLoadingSpinner message="Sending..." />
              ) : cooldownSeconds > 0 ? (
                `Resend in ${cooldownSeconds}s`
              ) : (
                'Resend Magic Link'
              )}
            </button>

            {/* Try Different Email */}
            <button
              onClick={handleTryAgain}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try a different email
            </button>

            {/* Back to Sign In */}
            {onBack ? (
              <button
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in options
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in
              </Link>
            )}
          </div>

          {/* Send Count Info */}
          {formState.resendCount > 0 && (
            <p className="text-xs text-gray-500 mt-6">
              Magic link sent {formState.resendCount} {formState.resendCount === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== Email Form View ====================

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {showHeader && (
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">BeProductive</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Magic Link Sign In</h1>
            <p className="text-gray-600">Enter your email for a passwordless sign-in link</p>
          </div>
        )}

        <div className="px-8 pb-8">
          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              ✨ Why Magic Links?
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>🔒 More secure than passwords</li>
              <li>⚡ Faster than typing passwords</li>
              <li>🎯 No passwords to remember or forget</li>
              <li>📱 Works great on mobile devices</li>
            </ul>
          </div>

          {/* Error Display */}
          {emailError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{emailError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                required
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  emailError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="you@company.com"
                value={formState.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formState.email.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <InlineLoadingSpinner message="Sending magic link..." />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Send Magic Link
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center">
            {onBack ? (
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to other sign-in options
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to password sign-in
              </Link>
            )}

            <div className="text-xs text-gray-500">
              <p>
                New to BeProductive?{' '}
                <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Magic Link Callback Handler ====================

interface MagicLinkCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MagicLinkCallback({ onSuccess, onError }: MagicLinkCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      try {
        // Extract token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
          throw new Error('Invalid magic link - missing required parameters');
        }

        // Verify token (implementation would call your auth service)
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, you would verify the token with your backend
        // and get back a valid session

        setStatus('success');
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid or expired magic link';
        setErrorMessage(message);
        setStatus('error');
        if (onError) {
          onError(message);
        }
      }
    };

    handleMagicLinkCallback();
  }, [onSuccess, onError]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying Magic Link</h2>
          <p className="text-gray-600">Please wait while we sign you in...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Magic Link Invalid
          </h2>

          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <Link
              to="/auth/magic-link"
              className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Request New Magic Link
            </Link>

            <Link
              to="/login"
              className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Successfully Signed In</h2>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

// ==================== Export Default ====================

export default MagicLinkAuth;