/**
 * UnauthorizedView - Clean Access Denied UI
 *
 * Professional, informative component for handling access denied scenarios
 * with clear messaging and appropriate actions.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserRole, SubscriptionTier } from '../core/types';

interface UnauthorizedViewProps {
  message?: string;
  requiredRoles?: UserRole[];
  userRole?: UserRole;
  requiredSubscription?: SubscriptionTier;
  userSubscription?: SubscriptionTier;
  showUpgradeButton?: boolean;
  showContactSupport?: boolean;
  customActions?: React.ReactNode;
}

const ROLE_LABELS: Record<UserRole, string> = {
  'user': 'User',
  'team_lead': 'Team Lead',
  'admin': 'Administrator',
  'super_admin': 'Super Administrator'
};

const SUBSCRIPTION_LABELS: Record<SubscriptionTier, string> = {
  'free': 'Free',
  'pro': 'Pro',
  'team': 'Team',
  'enterprise': 'Enterprise'
};

export function UnauthorizedView({
  message = 'You don\'t have permission to access this resource.',
  requiredRoles,
  userRole,
  requiredSubscription,
  userSubscription,
  showUpgradeButton = false,
  showContactSupport = true,
  customActions
}: UnauthorizedViewProps) {
  const navigate = useNavigate();

  const isSubscriptionIssue = requiredSubscription && userSubscription;
  const isRoleIssue = requiredRoles && userRole;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Restricted
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Specific Requirements */}
        <div className="space-y-4 mb-6">
          {isRoleIssue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Required role:</strong>{' '}
                {requiredRoles!.map(role => ROLE_LABELS[role]).join(' or ')}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Your current role: {ROLE_LABELS[userRole!]}
              </p>
            </div>
          )}

          {isSubscriptionIssue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Required subscription:</strong>{' '}
                {SUBSCRIPTION_LABELS[requiredSubscription!]} or higher
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Your current plan: {SUBSCRIPTION_LABELS[userSubscription!]}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {customActions}

          {showUpgradeButton && isSubscriptionIssue && (
            <Link
              to="/pricing"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586l2.293-2.293z" clipRule="evenodd" />
              </svg>
              Upgrade Subscription
            </Link>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>

          <Link
            to="/app/capture"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Go to Dashboard
          </Link>

          {showContactSupport && (
            <Link
              to="/support"
              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contact Support
            </Link>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact your administrator
            or check that you're signed in with the correct account.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== Specialized Unauthorized Views ====================

/**
 * Subscription upgrade required view
 */
export function SubscriptionRequiredView({
  requiredPlan,
  currentPlan,
  feature
}: {
  requiredPlan: SubscriptionTier;
  currentPlan?: SubscriptionTier;
  feature?: string;
}) {
  return (
    <UnauthorizedView
      message={`${feature ? `The ${feature} feature` : 'This feature'} requires a ${SUBSCRIPTION_LABELS[requiredPlan]} subscription or higher.`}
      requiredSubscription={requiredPlan}
      userSubscription={currentPlan}
      showUpgradeButton={true}
      showContactSupport={false}
      customActions={
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🚀 Unlock Premium Features
          </h3>
          <p className="text-sm text-gray-600">
            Upgrade to {SUBSCRIPTION_LABELS[requiredPlan]} to access advanced productivity tools,
            enhanced analytics, and priority support.
          </p>
        </div>
      }
    />
  );
}

/**
 * Admin access required view
 */
export function AdminRequiredView({ userRole }: { userRole?: UserRole }) {
  return (
    <UnauthorizedView
      message="This area is restricted to administrators only."
      requiredRoles={['admin', 'super_admin']}
      userRole={userRole}
      showUpgradeButton={false}
      customActions={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-red-900 mb-2">
            🔒 Administrator Access Required
          </h3>
          <p className="text-sm text-red-700">
            This section contains sensitive settings and administrative tools.
            Contact your administrator if you need access.
          </p>
        </div>
      }
    />
  );
}

/**
 * Email verification required view
 */
export function EmailVerificationRequiredView() {
  const handleResendEmail = async () => {
    // Implementation would go here
    alert('Verification email sent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Verify Your Email
        </h1>

        <p className="text-gray-600 mb-6">
          Please check your email and click the verification link to continue.
          You may need to check your spam folder.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Resend Verification Email
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            I've verified my email
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}