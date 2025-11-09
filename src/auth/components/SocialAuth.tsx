/**
 * Social Authentication Components
 *
 * Clean, accessible social login components with proper error handling,
 * loading states, and customizable providers.
 */

import React, { useState } from 'react';
import { useAuth } from '../core/AuthProvider';
import { InlineLoadingSpinner } from './LoadingSpinner';
import type { AuthMethod, SocialAuthProvider } from '../core/types';

// ==================== Provider Configurations ====================

const SOCIAL_PROVIDERS: Record<AuthMethod, SocialAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    icon: 'google',
    color: 'border-gray-300 hover:bg-gray-50',
    enabled: true
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    icon: 'apple',
    color: 'border-gray-800 hover:bg-gray-800 hover:text-white',
    enabled: true
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: 'border-gray-900 hover:bg-gray-900 hover:text-white',
    enabled: true
  },
  email: {
    id: 'email',
    name: 'Email',
    icon: 'email',
    color: 'border-blue-500 hover:bg-blue-50',
    enabled: true
  },
  'magic-link': {
    id: 'magic-link',
    name: 'Magic Link',
    icon: 'magic-link',
    color: 'border-purple-500 hover:bg-purple-50',
    enabled: true
  }
};

// ==================== Provider Icons ====================

const ProviderIcon: React.FC<{ provider: AuthMethod; className?: string }> = ({
  provider,
  className = "w-5 h-5"
}) => {
  switch (provider) {
    case 'google':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      );

    case 'apple':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      );

    case 'github':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      );

    case 'email':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );

    case 'magic-link':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );

    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
  }
};

// ==================== Individual Provider Button ====================

interface SocialProviderButtonProps {
  provider: AuthMethod;
  onAuth: (provider: AuthMethod) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function SocialProviderButton({
  provider,
  onAuth,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  showIcon = true,
  showText = true,
  className = ''
}: SocialProviderButtonProps) {
  const providerConfig = SOCIAL_PROVIDERS[provider];
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading || isLoading) return;

    setIsLoading(true);
    try {
      await onAuth(provider);
    } catch (error) {
      console.error(`${provider} auth error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'py-1 px-2 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base'
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
    ${sizeClasses[size]}
  `;

  const variantClasses = variant === 'filled'
    ? 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent'
    : `bg-white text-gray-700 border ${providerConfig.color}`;

  const isCurrentlyLoading = loading || isLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isCurrentlyLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-label={`Continue with ${providerConfig.name}`}
    >
      {isCurrentlyLoading ? (
        <InlineLoadingSpinner />
      ) : (
        <>
          {showIcon && (
            <ProviderIcon
              provider={provider}
              className={showText ? 'mr-2' : ''}
            />
          )}
          {showText && providerConfig.name}
        </>
      )}
    </button>
  );
}

// ==================== Social Auth Grid ====================

interface SocialAuthGridProps {
  providers?: AuthMethod[];
  onAuth: (provider: AuthMethod) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SocialAuthGrid({
  providers = ['google', 'github'],
  onAuth,
  loading = false,
  disabled = false,
  size = 'md',
  columns = 2,
  className = ''
}: SocialAuthGridProps) {
  const enabledProviders = providers.filter(p => SOCIAL_PROVIDERS[p]?.enabled);

  if (enabledProviders.length === 0) {
    return null;
  }

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-3 ${className}`}>
      {enabledProviders.map((provider) => (
        <SocialProviderButton
          key={provider}
          provider={provider}
          onAuth={onAuth}
          loading={loading}
          disabled={disabled}
          size={size}
        />
      ))}
    </div>
  );
}

// ==================== Complete Social Auth Section ====================

interface SocialAuthSectionProps {
  providers?: AuthMethod[];
  title?: string;
  onAuth?: (provider: AuthMethod) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
  size?: 'sm' | 'md' | 'lg';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SocialAuthSection({
  providers = ['google', 'github'],
  title = 'Or continue with',
  onAuth,
  loading = false,
  disabled = false,
  showDivider = true,
  size = 'md',
  columns = 2,
  className = ''
}: SocialAuthSectionProps) {
  const { signIn } = useAuth();
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});

  const handleSocialAuth = async (provider: AuthMethod) => {
    // Clear previous errors
    setAuthErrors(prev => ({ ...prev, [provider]: '' }));

    try {
      if (onAuth) {
        await onAuth(provider);
      } else {
        // Default implementation - would need to be connected to actual OAuth flows
        console.log(`Initiating ${provider} authentication...`);

        // Mock implementation for demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, this would redirect to OAuth provider
        throw new Error(`${provider} authentication is not yet implemented`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : `Failed to authenticate with ${provider}`;

      setAuthErrors(prev => ({ ...prev, [provider]: errorMessage }));
    }
  };

  const enabledProviders = providers.filter(p => SOCIAL_PROVIDERS[p]?.enabled);

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showDivider && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{title}</span>
          </div>
        </div>
      )}

      <SocialAuthGrid
        providers={enabledProviders}
        onAuth={handleSocialAuth}
        loading={loading}
        disabled={disabled}
        size={size}
        columns={columns}
      />

      {/* Error Display */}
      {Object.entries(authErrors).map(([provider, error]) => (
        error && (
          <div key={provider} className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// ==================== Quick Social Login Modal ====================

interface QuickSocialLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  providers?: AuthMethod[];
}

export function QuickSocialLogin({
  isOpen,
  onClose,
  onSuccess,
  providers = ['google', 'github', 'apple']
}: QuickSocialLoginProps) {
  const [loading, setLoading] = useState(false);

  const handleAuth = async (provider: AuthMethod) => {
    setLoading(true);
    try {
      // Implementation would go here
      console.log(`Quick login with ${provider}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(`Quick ${provider} login failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Sign In</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SocialAuthSection
          providers={providers}
          title="Choose a sign-in method"
          onAuth={handleAuth}
          loading={loading}
          showDivider={false}
          columns={1}
        />

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Export Default ====================

export default SocialAuthSection;