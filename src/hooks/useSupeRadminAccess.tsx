import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SuperAdminAccess {
  isSuperAdmin: boolean;
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to validate super admin access for creator-only features
 * Only users with 'super_admin' role can access API management and other creator features
 */
export const useSuperAdminAccess = (): SuperAdminAccess => {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSuperAdminRole = async () => {
      if (!user?.id) {
        setIsSuperAdmin(false);
        setLoading(false);
        setError("No user found");
        return;
      }

      try {
        const { data, error: rpcError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin'
        });

        if (rpcError) {
          console.error('Error checking super admin role:', rpcError);
          setError(rpcError.message);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(data || false);
          setError(data ? null : "Super admin access required");
        }
      } catch (err) {
        console.error('Error in super admin check:', err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkSuperAdminRole();
    }
  }, [user?.id, authLoading]);

  return {
    isSuperAdmin,
    hasAccess: isSuperAdmin,
    loading: authLoading || loading,
    error
  };
};

/**
 * Higher-order component to protect routes that require super admin access
 */
export const withSuperAdminAccess = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function SuperAdminProtectedComponent(props: P) {
    const { hasAccess, loading, error } = useSuperAdminAccess();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 max-w-md">
              {error || "You do not have permission to access this feature."}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Super admin privileges required
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Component to conditionally render content based on super admin access
 */
export const SuperAdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { hasAccess } = useSuperAdminAccess();

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
