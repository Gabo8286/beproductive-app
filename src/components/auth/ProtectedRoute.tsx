import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isGuestUser } from "@/utils/auth/guestMode";
import {
  hasPageAccess,
  hasAllFeatures,
  getEffectiveUserRole
} from "@/utils/permissions";
import {
  UserRole,
  Feature,
  PageAccessLevel
} from "@/types/roles";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Star } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: PageAccessLevel;
  requiredFeatures?: Feature[];
  fallbackPath?: string;
  allowGuest?: boolean;
  showUpgradePrompt?: boolean;
  customUnauthorizedComponent?: React.ReactNode;
}

function UnauthorizedPage({
  requiredRole,
  requiredFeatures,
  showUpgradePrompt = true,
  fallbackPath = "/app/capture"
}: {
  requiredRole?: PageAccessLevel;
  requiredFeatures?: Feature[];
  showUpgradePrompt?: boolean;
  fallbackPath?: string;
}) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Access Restricted</h1>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>

        {requiredRole && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This page requires <strong>{requiredRole}</strong> level access or higher.
            </AlertDescription>
          </Alert>
        )}

        {requiredFeatures && requiredFeatures.length > 0 && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This page requires access to: {requiredFeatures.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={() => window.location.href = fallbackPath}
            variant="default"
            className="w-full"
          >
            Go to Dashboard
          </Button>

          {showUpgradePrompt && (
            <Button
              onClick={() => window.location.href = "/pricing"}
              variant="secondary"
              className="w-full"
            >
              <Star className="mr-2 h-4 w-4" />
              Upgrade Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredFeatures = [],
  fallbackPath = "/app/capture",
  allowGuest = false,
  showUpgradePrompt = true,
  customUnauthorizedComponent
}: ProtectedRouteProps) {
  const { user, profile, authLoading, isGuestMode } = useAuth();
  const location = useLocation();

  // TEMPORARY: Bypass authentication in development mode
  // Toggle this to easily enable/disable login requirement during development
  const BYPASS_AUTH_IN_DEV = true;
  if (process.env.NODE_ENV === 'development' && BYPASS_AUTH_IN_DEV) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check basic authentication
  const hasValidAuth = user && (
    (isGuestMode && isGuestUser(user)) ||  // Guest user in guest mode
    (!isGuestMode && !isGuestUser(user))   // Regular user not in guest mode
  );

  if (!hasValidAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get effective user role
  const userRole = getEffectiveUserRole(profile);

  // Check if guest access is allowed
  if (userRole === 'guest' && !allowGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based page access
  if (requiredRole && !hasPageAccess(userRole, requiredRole)) {
    if (customUnauthorizedComponent) {
      return <>{customUnauthorizedComponent}</>;
    }

    return (
      <UnauthorizedPage
        requiredRole={requiredRole}
        requiredFeatures={requiredFeatures}
        showUpgradePrompt={showUpgradePrompt}
        fallbackPath={fallbackPath}
      />
    );
  }

  // Check feature-based access
  if (requiredFeatures && requiredFeatures.length > 0 && !hasAllFeatures(userRole, requiredFeatures)) {
    if (customUnauthorizedComponent) {
      return <>{customUnauthorizedComponent}</>;
    }

    return (
      <UnauthorizedPage
        requiredRole={requiredRole}
        requiredFeatures={requiredFeatures}
        showUpgradePrompt={showUpgradePrompt}
        fallbackPath={fallbackPath}
      />
    );
  }

  return <>{children}</>;
}
