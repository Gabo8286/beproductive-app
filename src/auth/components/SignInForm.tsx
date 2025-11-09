/**
 * Enhanced SignInForm - Modern UX and Security
 *
 * Replaces the complex 472-line Login page with a focused,
 * accessible form with real-time validation and better UX.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import { validateEmail, validateSignInForm } from '../utils/validation';
import { SessionManager } from '../utils/storage';
import { InlineLoadingSpinner } from './LoadingSpinner';
import type { SignInCredentials } from '../core/types';

// ==================== Types ====================

interface SignInFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showHeader?: boolean;
  showSocialAuth?: boolean;
  showMagicLink?: boolean;
  className?: string;
}

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
}

interface ValidationState {
  email: string[];
  password: string[];
  form: string[];
}

// ==================== Main Component ====================

export function SignInForm({
  onSuccess,
  redirectTo,
  showHeader = true,
  showSocialAuth = true,
  showMagicLink = true,
  className = ''
}: SignInFormProps) {
  const { state, signIn, sendMagicLink } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionManager = new SessionManager();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    rememberMe: false,
    showPassword: false
  });

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    email: [],
    password: [],
    form: []
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Refs for accessibility
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ==================== Effects ====================

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = sessionManager.getRememberedEmail();
    if (rememberedEmail) {
      setFormState(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
      setTouched(prev => ({ ...prev, email: true }));
    }
  }, []);

  // Focus email field on mount
  useEffect(() => {
    if (emailRef.current && !formState.email) {
      emailRef.current.focus();
    }
  }, []);

  // Redirect on successful authentication
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (onSuccess) {
        onSuccess();
      } else {
        const targetUrl = redirectTo ||
          (location.state as any)?.returnUrl ||
          (state.user.onboardingCompleted ? '/app/capture' : '/onboarding');
        navigate(targetUrl, { replace: true });
      }
    }
  }, [state.isAuthenticated, state.user, navigate, location, redirectTo, onSuccess]);

  // ==================== Validation ====================

  const validateField = (field: keyof FormState, value: string) => {
    let errors: string[] = [];

    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value);
        errors = emailValidation.isValid ? [] : emailValidation.errors;
        break;
      case 'password':
        errors = value ? [] : ['Password is required'];
        break;
    }

    setValidation(prev => ({
      ...prev,
      [field]: errors
    }));

    return errors.length === 0;
  };

  const validateForm = (): boolean => {
    const formValidation = validateSignInForm(formState.email, formState.password);

    setValidation({
      email: formValidation.email.errors,
      password: formValidation.password.errors,
      form: []
    });

    return formValidation.email.isValid && formValidation.password.isValid;
  };

  // ==================== Event Handlers ====================

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }));

    // Real-time validation for touched fields
    if (typeof value === 'string' && touched[field as keyof typeof touched]) {
      setTimeout(() => validateField(field as keyof FormState, value), 300);
    }

    // Clear form errors when user starts typing
    if (validation.form.length > 0) {
      setValidation(prev => ({ ...prev, form: [] }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (field === 'email') {
      validateField('email', formState.email);
    } else if (field === 'password') {
      validateField('password', formState.password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate form
    if (!validateForm()) {
      // Focus first invalid field
      if (validation.email.length > 0) {
        emailRef.current?.focus();
      } else if (validation.password.length > 0) {
        passwordRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials: SignInCredentials = {
        email: formState.email.trim(),
        password: formState.password,
        rememberMe: formState.rememberMe
      };

      const response = await signIn(credentials);

      if (!response.success && response.error) {
        setValidation(prev => ({
          ...prev,
          form: [response.error!.message]
        }));

        // Focus appropriate field based on error
        if (response.error.code === 'INVALID_CREDENTIALS') {
          passwordRef.current?.focus();
        }
      }
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        form: ['An unexpected error occurred. Please try again.']
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!formState.email) {
      setValidation(prev => ({
        ...prev,
        email: ['Please enter your email address first']
      }));
      emailRef.current?.focus();
      return;
    }

    if (!validateField('email', formState.email)) {
      return;
    }

    try {
      const response = await sendMagicLink({ email: formState.email.trim() });

      if (response.success) {
        setMagicLinkSent(true);
      } else {
        setValidation(prev => ({
          ...prev,
          form: [response.error?.message || 'Failed to send magic link']
        }));
      }
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        form: ['Failed to send magic link. Please try again.']
      }));
    }
  };

  // ==================== Helper Functions ====================

  const hasFieldError = (field: keyof ValidationState) => {
    return touched[field as keyof typeof touched] && validation[field].length > 0;
  };

  const getFieldError = (field: keyof ValidationState) => {
    return validation[field][0];
  };

  // ==================== Magic Link Sent View ====================

  if (magicLinkSent) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            We've sent a magic link to <strong>{formState.email}</strong>.
            Click the link in your email to sign in securely.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setMagicLinkSent(false)}
              className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Sign In
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>
      </div>
    );
  }

  // ==================== Main Form ====================

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {showHeader && (
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586l2.293-2.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">BeProductive</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to continue your productivity journey</p>
          </div>
        )}

        <div className="px-8 pb-8">
          {/* Form Errors */}
          {validation.form.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{validation.form[0]}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
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
                  hasFieldError('email')
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="you@company.com"
                value={formState.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                aria-invalid={hasFieldError('email')}
                aria-describedby={hasFieldError('email') ? 'email-error' : undefined}
              />
              {hasFieldError('email') && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="flex items-center space-x-3">
                  {showMagicLink && (
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={isSubmitting}
                    >
                      Use magic link
                    </button>
                  )}
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  type={formState.showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    hasFieldError('password')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter your password"
                  value={formState.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isSubmitting}
                  aria-invalid={hasFieldError('password')}
                  aria-describedby={hasFieldError('password') ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => handleInputChange('showPassword', !formState.showPassword)}
                  disabled={isSubmitting}
                  aria-label={formState.showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {formState.showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {hasFieldError('password') && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {getFieldError('password')}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formState.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember my email address
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!formState.email || !formState.password)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <InlineLoadingSpinner message="Signing in..." />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Social Authentication */}
          {showSocialAuth && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.2 2.24c.46-.4 1.2-.59 1.83-.59.09 0 .18 0 .27.01v3.25c-.3-.03-.6-.05-.9-.05-.61 0-1.09.1-1.44.29-.35.19-.58.46-.68.79-.1.34-.15.75-.15 1.25v.65h2.85l-.38 3.32h-2.47v8.84H9.15v-8.84H6.42V7.39h2.73V6.1c0-1.31.35-2.32 1.05-3.04.7-.72 1.68-1.08 2.95-1.08z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </>
          )}

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}