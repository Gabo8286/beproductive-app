/**
 * Forgot Password Page
 *
 * Clean password reset flow with better UX and security features.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import { validateEmail } from '../utils/validation';
import { InlineLoadingSpinner } from '../components/LoadingSpinner';

// ==================== Types ====================

interface FormState {
  email: string;
  emailSent: boolean;
  lastSentTime: Date | null;
  resendCount: number;
}

// ==================== Main Component ====================

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    email: '',
    emailSent: false,
    lastSentTime: null,
    resendCount: 0
  });

  // UI state
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Refs
  const emailRef = useRef<HTMLInputElement>(null);

  // ==================== Effects ====================

  // Focus email field on mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

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
      const response = await resetPassword(formState.email.trim());

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          emailSent: true,
          lastSentTime: new Date(),
          resendCount: prev.resendCount + 1
        }));

        // Set cooldown (60 seconds base, +30 seconds per resend)
        const cooldown = 60 + (formState.resendCount * 30);
        setCooldownSeconds(cooldown);
      } else {
        setEmailError(response.error?.message || 'Failed to send reset email');
      }
    } catch (error) {
      setEmailError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0) return;

    setIsSubmitting(true);

    try {
      const response = await resetPassword(formState.email.trim());

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          lastSentTime: new Date(),
          resendCount: prev.resendCount + 1
        }));

        // Increase cooldown with each resend
        const cooldown = 60 + (formState.resendCount * 30);
        setCooldownSeconds(cooldown);
      } else {
        setEmailError(response.error?.message || 'Failed to resend reset email');
      }
    } catch (error) {
      setEmailError('Failed to resend reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setFormState({
      email: formState.email,
      emailSent: false,
      lastSentTime: null,
      resendCount: 0
    });
    setCooldownSeconds(0);
    setEmailError('');

    setTimeout(() => emailRef.current?.focus(), 100);
  };

  // ==================== Email Sent View ====================

  if (formState.emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>

          {/* Title and Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{formState.email}</strong>.
            Check your email and follow the link to reset your password.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-blue-900 mb-2">
              📋 Next steps:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the "Reset Password" link in the email</li>
              <li>Create a new, strong password</li>
              <li>Sign in with your new password</li>
            </ol>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800">
              🔐 <strong>Security note:</strong> The reset link expires in 15 minutes and can only be used once.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={cooldownSeconds > 0 || isSubmitting}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <InlineLoadingSpinner message="Sending..." />
              ) : cooldownSeconds > 0 ? (
                `Resend in ${cooldownSeconds}s`
              ) : (
                'Resend reset email'
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
            <Link
              to="/login"
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back to sign in
            </Link>
          </div>

          {/* Send Count Info */}
          {formState.resendCount > 0 && (
            <p className="text-xs text-gray-500 mt-6">
              Reset email sent {formState.resendCount} {formState.resendCount === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== Email Form View ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">BeProductive</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
          <p className="text-gray-600">No worries! We'll send you reset instructions</p>
        </div>

        <div className="px-8 pb-8">
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

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <p>Enter your email address and we'll send you a secure link to reset your password. The link will expire in 15 minutes for security.</p>
              </div>
            </div>
          </div>

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
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <InlineLoadingSpinner message="Sending reset email..." />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send reset instructions
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to sign in
            </Link>

            <div className="text-xs text-gray-500">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Export ====================

export default ForgotPasswordPage;