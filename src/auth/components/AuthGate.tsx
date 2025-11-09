/**
 * AuthGate - Clean Route Protection
 *
 * Replaces the complex ProtectedRoute component with a focused,
 * security-first approach to route protection and access control.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthProvider';
import type { UserRole, SubscriptionTier } from '../core/types';
import { LoadingSpinner } from './LoadingSpinner';
import { UnauthorizedView } from './UnauthorizedView';

// ==================== Types ====================

interface AuthGateProps {
  children: React.ReactNode;

  // Access Control
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredSubscription?: SubscriptionTier;

  // Customization
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;

  // Advanced Options
  checkEmailVerification?: boolean;
  requireOnboardingComplete?: boolean;
  customAccessCheck?: (user: any) => boolean;
}

// ==================== Role Hierarchy ====================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'user': 1,
  'team_lead': 2,
  'admin': 3,
  'super_admin': 4
};

const SUBSCRIPTION_HIERARCHY: Record<SubscriptionTier, number> = {
  'free': 1,
  'pro': 2,
  'team': 3,
  'enterprise': 4
};

// ==================== Utility Functions ====================

function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  return allowedRoles.some(role => userLevel >= ROLE_HIERARCHY[role]);
}

function hasRequiredSubscription(
  userSubscription: SubscriptionTier,
  requiredSubscription: SubscriptionTier
): boolean {
  const userLevel = SUBSCRIPTION_HIERARCHY[userSubscription];
  const requiredLevel = SUBSCRIPTION_HIERARCHY[requiredSubscription];
  return userLevel >= requiredLevel;
}

// ==================== Main Component ====================

export function AuthGate({
  children,
  requireAuth = true,
  allowedRoles,
  requiredSubscription,
  fallbackPath = '/login',
  loadingComponent,
  unauthorizedComponent,
  checkEmailVerification = false,
  requireOnboardingComplete = false,
  customAccessCheck
}: AuthGateProps) {
  const { state } = useAuth();
  const location = useLocation();

  // ==================== Loading State ====================

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {loadingComponent || <LoadingSpinner />}
      </div>
    );
  }

  // ==================== Authentication Check ====================

  if (requireAuth && !state.isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location.pathname, returnUrl: location.pathname + location.search }}
        replace
      />
    );
  }

  // If auth not required and user not authenticated, allow access
  if (!requireAuth && !state.isAuthenticated) {
    return <>{children}</>;
  }

  // ==================== User-specific Checks ====================

  const { user } = state;

  if (!user && requireAuth) {
    // This shouldn't happen, but handle it gracefully
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ==================== Email Verification Check ====================

  if (checkEmailVerification && user && !user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📧</div>
          <h2 className="text-2xl font-bold">Email Verification Required</h2>
          <p className="text-gray-600 max-w-md">
            Please check your email and click the verification link to access this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            I've verified my email
          </button>
        </div>
      </div>
    );
  }

  // ==================== Onboarding Check ====================

  if (requireOnboardingComplete && user && !user.onboardingCompleted) {
    return (
      <Navigate
        to="/onboarding"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ==================== Role-based Access Control ====================

  if (allowedRoles && user && !hasRequiredRole(user.role, allowedRoles)) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <UnauthorizedView
        requiredRoles={allowedRoles}
        userRole={user.role}
        message="You don't have the required permissions to access this page."
      />
    );
  }

  // ==================== Subscription-based Access Control ====================

  if (requiredSubscription && user && !hasRequiredSubscription(user.subscriptionTier, requiredSubscription)) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <UnauthorizedView
        requiredSubscription={requiredSubscription}
        userSubscription={user.subscriptionTier}
        message="Upgrade your subscription to access this feature."
        showUpgradeButton={true}
      />
    );
  }

  // ==================== Custom Access Check ====================

  if (customAccessCheck && user && !customAccessCheck(user)) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <UnauthorizedView
        message="You don't have access to this resource."
      />
    );
  }

  // ==================== Access Granted ====================

  return <>{children}</>;
}

// ==================== Convenience Components ====================

/**
 * Require authentication only
 */
export function RequireAuth({ children, ...props }: Omit<AuthGateProps, 'requireAuth'>) {
  return (
    <AuthGate requireAuth={true} {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Admin-only access
 */
export function AdminOnly({ children, ...props }: Omit<AuthGateProps, 'allowedRoles'>) {
  return (
    <AuthGate allowedRoles={['admin', 'super_admin']} {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Super admin only access
 */
export function SuperAdminOnly({ children, ...props }: Omit<AuthGateProps, 'allowedRoles'>) {
  return (
    <AuthGate allowedRoles={['super_admin']} {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Premium subscription required
 */
export function PremiumOnly({ children, ...props }: Omit<AuthGateProps, 'requiredSubscription'>) {
  return (
    <AuthGate requiredSubscription="pro" {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Team subscription required
 */
export function TeamOnly({ children, ...props }: Omit<AuthGateProps, 'requiredSubscription'>) {
  return (
    <AuthGate requiredSubscription="team" {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Enterprise subscription required
 */
export function EnterpriseOnly({ children, ...props }: Omit<AuthGateProps, 'requiredSubscription'>) {
  return (
    <AuthGate requiredSubscription="enterprise" {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Require email verification
 */
export function RequireVerifiedEmail({ children, ...props }: Omit<AuthGateProps, 'checkEmailVerification'>) {
  return (
    <AuthGate checkEmailVerification={true} {...props}>
      {children}
    </AuthGate>
  );
}

/**
 * Require completed onboarding
 */
export function RequireOnboarding({ children, ...props }: Omit<AuthGateProps, 'requireOnboardingComplete'>) {
  return (
    <AuthGate requireOnboardingComplete={true} {...props}>
      {children}
    </AuthGate>
  );
}

// ==================== Hook for Access Control ====================

/**
 * Hook to check access permissions without rendering
 */
export function useAccessControl() {
  const { state } = useAuth();

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,

    hasRole: (role: UserRole) => {
      if (!state.user) return false;
      return ROLE_HIERARCHY[state.user.role] >= ROLE_HIERARCHY[role];
    },

    hasAnyRole: (roles: UserRole[]) => {
      if (!state.user) return false;
      return hasRequiredRole(state.user.role, roles);
    },

    hasSubscription: (subscription: SubscriptionTier) => {
      if (!state.user) return false;
      return hasRequiredSubscription(state.user.subscriptionTier, subscription);
    },

    isEmailVerified: state.user?.emailVerified || false,
    isOnboardingComplete: state.user?.onboardingCompleted || false,

    canAccess: (requirements: {
      roles?: UserRole[];
      subscription?: SubscriptionTier;
      emailVerified?: boolean;
      onboardingComplete?: boolean;
      customCheck?: (user: any) => boolean;
    }) => {
      if (!state.user) return false;

      if (requirements.roles && !hasRequiredRole(state.user.role, requirements.roles)) {
        return false;
      }

      if (requirements.subscription && !hasRequiredSubscription(state.user.subscriptionTier, requirements.subscription)) {
        return false;
      }

      if (requirements.emailVerified && !state.user.emailVerified) {
        return false;
      }

      if (requirements.onboardingComplete && !state.user.onboardingCompleted) {
        return false;
      }

      if (requirements.customCheck && !requirements.customCheck(state.user)) {
        return false;
      }

      return true;
    }
  };
}