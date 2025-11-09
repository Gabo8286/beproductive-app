/**
 * Modern Sign Up Page
 *
 * Progressive disclosure sign-up page using our new authentication components.
 * Replaces the old simple Signup.tsx with better UX and conversion optimization.
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import { SignUpForm } from '../components/SignUpForm';
import { SocialAuthSection } from '../components/SocialAuth';
import { AuthLoadingSpinner } from '../components/LoadingSpinner';

// ==================== Types ====================

interface SignUpPageProps {
  redirectTo?: string;
  invitationCode?: string;
  prefilledEmail?: string;
}

// ==================== Main Component ====================

export function SignUpPage({
  redirectTo,
  invitationCode,
  prefilledEmail
}: SignUpPageProps) {
  const { state } = useAuth();
  const [showSocialFirst, setShowSocialFirst] = useState(true);

  // ==================== Auth State Handling ====================

  // Show loading while checking authentication
  if (state.isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    const targetUrl = redirectTo || '/onboarding';
    return <Navigate to={targetUrl} replace />;
  }

  // ==================== Event Handlers ====================

  const handleSocialAuth = async (provider: string) => {
    try {
      console.log(`Starting ${provider} authentication...`);
      // Implementation would connect to actual OAuth providers
      // For now, this is a placeholder
    } catch (error) {
      console.error(`${provider} auth failed:`, error);
    }
  };

  const handleEmailSignUp = () => {
    setShowSocialFirst(false);
  };

  // ==================== Render ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Invitation Banner */}
        {invitationCode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">You're invited!</span>
            </div>
            <p className="text-xs text-green-700">
              Complete your registration to join the team.
            </p>
          </div>
        )}

        {/* Social-First Sign Up */}
        {showSocialFirst ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586l2.293-2.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">BeProductive</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Join BeProductive</h1>
              <p className="text-gray-600">Start your productivity journey in seconds</p>
            </div>

            <div className="px-8 pb-8">
              {/* Benefits */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">✨ What you'll get:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Smart task management</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>AI-powered insights</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Goal tracking</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Time tracking</span>
                  </div>
                </div>
              </div>

              {/* Social Authentication */}
              <SocialAuthSection
                providers={['google', 'github', 'apple']}
                title="Sign up with"
                onAuth={handleSocialAuth}
                showDivider={false}
                columns={1}
              />

              {/* Email Option */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEmailSignUp}
                className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sign up with email instead
              </button>
            </div>
          </div>
        ) : (
          /* Progressive Sign Up Form */
          <SignUpForm
            redirectTo={redirectTo}
            showSocialAuth={false}
            defaultEmail={prefilledEmail}
          />
        )}

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </a>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR compliant</span>
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever plan</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Development Info */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              🚧 Development Mode
            </h4>
            <p className="text-xs text-yellow-700">
              This is the new authentication system with progressive disclosure and better UX.
            </p>
            {invitationCode && (
              <p className="text-xs text-yellow-700 mt-1">
                Invitation Code: <code className="bg-yellow-100 px-1 rounded">{invitationCode}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Export ====================

export default SignUpPage;