/**
 * Modern Sign In Page
 *
 * Clean, focused sign-in page using our new authentication components.
 * Replaces the old complex Login.tsx with better UX and maintainability.
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import { SignInForm } from '../components/SignInForm';
import { MagicLinkAuth } from '../components/MagicLinkAuth';
import { AuthLoadingSpinner } from '../components/LoadingSpinner';

// ==================== Types ====================

type AuthMode = 'password' | 'magic-link';

interface SignInPageProps {
  defaultMode?: AuthMode;
  redirectTo?: string;
}

// ==================== Main Component ====================

export function SignInPage({
  defaultMode = 'password',
  redirectTo
}: SignInPageProps) {
  const { state } = useAuth();
  const [currentMode, setCurrentMode] = useState<AuthMode>(defaultMode);

  // ==================== Auth State Handling ====================

  // Show loading while checking authentication
  if (state.isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    const targetUrl = redirectTo || (state.user?.onboardingCompleted ? '/app/capture' : '/onboarding');
    return <Navigate to={targetUrl} replace />;
  }

  // ==================== Mode Switching ====================

  const handleModeSwitch = (mode: AuthMode) => {
    setCurrentMode(mode);
  };

  const handleBackToPassword = () => {
    setCurrentMode('password');
  };

  // ==================== Render ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Mode Switcher */}
        {currentMode === 'password' && (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-1 bg-white rounded-full p-1 shadow-sm border inline-flex">
              <button
                onClick={() => handleModeSwitch('password')}
                className="px-4 py-2 text-sm font-medium rounded-full bg-blue-600 text-white transition-colors"
              >
                Password
              </button>
              <button
                onClick={() => handleModeSwitch('magic-link')}
                className="px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:text-gray-900 transition-colors"
              >
                Magic Link
              </button>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        {currentMode === 'password' ? (
          <SignInForm
            redirectTo={redirectTo}
            showMagicLink={true}
            onMagicLinkClick={() => handleModeSwitch('magic-link')}
          />
        ) : (
          <MagicLinkAuth
            onBack={handleBackToPassword}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
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
              This is the new authentication system. The old Login.tsx will be replaced after migration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Export ====================

export default SignInPage;