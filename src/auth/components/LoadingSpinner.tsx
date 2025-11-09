/**
 * LoadingSpinner - Clean Loading Component
 *
 * Simple, accessible loading spinner for authentication flows.
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && (
        <p className={`text-sm ${colorClasses[color]} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
}

// ==================== Specialized Loading Components ====================

/**
 * Authentication-specific loading spinner
 */
export function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586l2.293-2.293z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">BeProductive</span>
        </div>

        <LoadingSpinner size="lg" message="Checking authentication..." />

        <p className="text-sm text-gray-500 mt-4">
          Setting up your productivity workspace
        </p>
      </div>
    </div>
  );
}

/**
 * Inline loading for forms
 */
export function InlineLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-2">
      <LoadingSpinner size="sm" />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
}

/**
 * Button loading spinner
 */
export function ButtonLoadingSpinner() {
  return (
    <LoadingSpinner size="sm" color="white" />
  );
}

/**
 * Page loading overlay
 */
export function PageLoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg p-6 space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}