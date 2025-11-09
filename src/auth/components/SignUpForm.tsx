/**
 * Enhanced SignUpForm - Progressive Disclosure and Better UX
 *
 * Modern sign-up form with progressive disclosure, real-time validation,
 * password strength indicator, and accessibility features.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordConfirmation,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText
} from '../utils/validation';
import { InlineLoadingSpinner } from './LoadingSpinner';
import type { SignUpCredentials } from '../core/types';

// ==================== Types ====================

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showHeader?: boolean;
  showSocialAuth?: boolean;
  className?: string;
}

interface FormState {
  // Step 1: Basic Info
  fullName: string;
  email: string;

  // Step 2: Password
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;

  // Step 3: Preferences
  acceptTerms: boolean;
  subscribeNewsletter: boolean;
  marketingEmails: boolean;
}

interface ValidationState {
  fullName: string[];
  email: string[];
  password: string[];
  confirmPassword: string[];
  form: string[];
}

interface TouchedState {
  fullName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

// ==================== Main Component ====================

export function SignUpForm({
  onSuccess,
  redirectTo,
  showHeader = true,
  showSocialAuth = true,
  className = ''
}: SignUpFormProps) {
  const { state, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    acceptTerms: false,
    subscribeNewsletter: true,
    marketingEmails: false
  });

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    fullName: [],
    email: [],
    password: [],
    confirmPassword: [],
    form: []
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [touched, setTouched] = useState<TouchedState>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Refs for accessibility
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // ==================== Effects ====================

  // Focus first field on mount
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  // Redirect on successful authentication
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (onSuccess) {
        onSuccess();
      } else {
        const targetUrl = redirectTo || '/onboarding';
        navigate(targetUrl, { replace: true });
      }
    }
  }, [state.isAuthenticated, state.user, navigate, redirectTo, onSuccess]);

  // ==================== Validation ====================

  const validateField = (field: keyof FormState, value: string | boolean) => {
    let errors: string[] = [];

    switch (field) {
      case 'fullName':
        const nameValidation = validateFullName(value as string);
        errors = nameValidation.isValid ? [] : nameValidation.errors;
        break;
      case 'email':
        const emailValidation = validateEmail(value as string);
        errors = emailValidation.isValid ? [] : emailValidation.errors;
        break;
      case 'password':
        const passwordValidation = validatePassword(value as string);
        errors = passwordValidation.isValid ? [] : passwordValidation.errors;
        break;
      case 'confirmPassword':
        const confirmValidation = validatePasswordConfirmation(formState.password, value as string);
        errors = confirmValidation.isValid ? [] : confirmValidation.errors;
        break;
    }

    setValidation(prev => ({
      ...prev,
      [field]: errors
    }));

    return errors.length === 0;
  };

  const validateStep = (step: number): boolean => {
    let isValid = true;

    switch (step) {
      case 1:
        if (!validateField('fullName', formState.fullName)) isValid = false;
        if (!validateField('email', formState.email)) isValid = false;
        break;
      case 2:
        if (!validateField('password', formState.password)) isValid = false;
        if (!validateField('confirmPassword', formState.confirmPassword)) isValid = false;
        break;
      case 3:
        if (!formState.acceptTerms) {
          setValidation(prev => ({
            ...prev,
            form: ['You must accept the terms and conditions to continue']
          }));
          isValid = false;
        }
        break;
    }

    return isValid;
  };

  // ==================== Event Handlers ====================

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }));

    // Real-time validation for touched fields
    if (typeof value === 'string' && touched[field as keyof TouchedState]) {
      setTimeout(() => validateField(field, value), 300);
    }

    // Clear form errors when user starts typing
    if (validation.form.length > 0) {
      setValidation(prev => ({ ...prev, form: [] }));
    }
  };

  const handleBlur = (field: keyof TouchedState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formState[field]);
  };

  const handleNextStep = () => {
    // Mark current step fields as touched
    if (currentStep === 1) {
      setTouched(prev => ({ ...prev, fullName: true, email: true }));
    } else if (currentStep === 2) {
      setTouched(prev => ({ ...prev, password: true, confirmPassword: true }));
    }

    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);

      // Focus next step's first field
      setTimeout(() => {
        if (currentStep === 1 && passwordRef.current) {
          passwordRef.current.focus();
        }
      }, 100);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Go back to first invalid step
      if (validation.fullName.length > 0 || validation.email.length > 0) {
        setCurrentStep(1);
      } else if (validation.password.length > 0 || validation.confirmPassword.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials: SignUpCredentials = {
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        password: formState.password,
        acceptTerms: formState.acceptTerms,
        subscribeNewsletter: formState.subscribeNewsletter
      };

      const response = await signUp(credentials);

      if (response.success) {
        if (response.data?.emailSent) {
          setEmailSent(true);
        }
        // If no email sent, user will be redirected by useEffect
      } else if (response.error) {
        setValidation(prev => ({
          ...prev,
          form: [response.error!.message]
        }));

        // Navigate to appropriate step based on error
        if (response.error.code === 'EMAIL_ALREADY_EXISTS') {
          setCurrentStep(1);
          setTimeout(() => emailRef.current?.focus(), 100);
        } else if (response.error.code === 'WEAK_PASSWORD') {
          setCurrentStep(2);
          setTimeout(() => passwordRef.current?.focus(), 100);
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

  // ==================== Helper Functions ====================

  const hasFieldError = (field: keyof ValidationState) => {
    return touched[field as keyof TouchedState] && validation[field].length > 0;
  };

  const getFieldError = (field: keyof ValidationState) => {
    return validation[field][0];
  };

  const passwordStrength = calculatePasswordStrength(formState.password);

  // ==================== Email Sent View ====================

  if (emailSent) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verify Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{formState.email}</strong>.
            Please check your email and click the verification link to activate your account.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue to Sign In
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or contact support.
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Join thousands of productive professionals</p>
          </div>
        )}

        <div className="px-8 pb-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Let's get started</h3>
                  <p className="text-sm text-gray-600">Tell us a bit about yourself</p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    ref={nameRef}
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      hasFieldError('fullName')
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholder="John Doe"
                    value={formState.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    disabled={isSubmitting}
                    aria-invalid={hasFieldError('fullName')}
                    aria-describedby={hasFieldError('fullName') ? 'fullName-error' : undefined}
                  />
                  {hasFieldError('fullName') && (
                    <p id="fullName-error" className="mt-1 text-sm text-red-600">
                      {getFieldError('fullName')}
                    </p>
                  )}
                </div>

                {/* Email */}
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
                    placeholder="john@company.com"
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

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formState.fullName || !formState.email}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Secure your account</h3>
                  <p className="text-sm text-gray-600">Create a strong password</p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      id="password"
                      type={formState.showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        hasFieldError('password')
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Create a strong password"
                      value={formState.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      disabled={isSubmitting}
                      aria-invalid={hasFieldError('password')}
                      aria-describedby="password-strength password-error"
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

                  {/* Password Strength Indicator */}
                  {formState.password && (
                    <div id="password-strength" className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Password strength</span>
                        <span className={`font-medium text-${getPasswordStrengthColor(passwordStrength.score)}-600`}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 bg-${getPasswordStrengthColor(passwordStrength.score)}-500`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {passwordStrength.feedback[0]}
                        </p>
                      )}
                    </div>
                  )}

                  {hasFieldError('password') && (
                    <p id="password-error" className="mt-1 text-sm text-red-600">
                      {getFieldError('password')}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      ref={confirmPasswordRef}
                      id="confirmPassword"
                      type={formState.showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        hasFieldError('confirmPassword')
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Confirm your password"
                      value={formState.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      disabled={isSubmitting}
                      aria-invalid={hasFieldError('confirmPassword')}
                      aria-describedby={hasFieldError('confirmPassword') ? 'confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => handleInputChange('showConfirmPassword', !formState.showConfirmPassword)}
                      disabled={isSubmitting}
                      aria-label={formState.showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {formState.showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {hasFieldError('confirmPassword') && (
                    <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formState.password || !formState.confirmPassword || !passwordStrength.isValid}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Almost done!</h3>
                  <p className="text-sm text-gray-600">Set your preferences</p>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={formState.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="accept-terms" className="text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="subscribe-newsletter"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={formState.subscribeNewsletter}
                      onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="subscribe-newsletter" className="text-gray-700">
                      Send me productivity tips and feature updates
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formState.acceptTerms}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <InlineLoadingSpinner message="Creating account..." />
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Social Authentication */}
          {showSocialAuth && currentStep === 1 && (
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

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}