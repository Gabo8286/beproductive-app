import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isGuestUser } from "@/utils/auth/guestMode";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading, isGuestMode } = useAuth();
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Allow access if:
  // 1. User exists and it's either guest mode OR a regular authenticated user
  // 2. In guest mode with a valid guest user
  const hasValidAuth = user && (
    (isGuestMode && isGuestUser(user)) ||  // Guest user in guest mode
    (!isGuestMode && !isGuestUser(user))   // Regular user not in guest mode
  );

  if (!hasValidAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
