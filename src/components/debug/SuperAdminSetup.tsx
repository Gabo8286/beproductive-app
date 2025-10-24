import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { isGuestUser, getGuestUserType } from '@/utils/auth/guestMode';

/**
 * Debug component to set up super admin access
 * This component should only be used during development/setup
 */
export const SuperAdminSetup: React.FC = () => {
  const { user, isGuestMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const isGuestModeUser = isGuestMode && user && isGuestUser(user);
  const guestUserType = isGuestModeUser ? getGuestUserType(user) : null;

  const assignInitialSuperAdmin = async () => {
    setLoading(true);
    setStatus('Assigning super admin role...');

    try {
      // Handle guest mode users differently
      if (isGuestModeUser && guestUserType === 'admin') {
        console.log('Guest mode admin detected, simulating super admin assignment...');

        // Simulate successful assignment for guest admin
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

        const mockRole = { role_name: 'super_admin', assigned_at: new Date().toISOString() };
        setUserRoles([mockRole]);
        setStatus('✅ Guest admin successfully assigned super admin role (simulated)');
        setLoading(false);
        return;
      }

      // For non-guest users, use the real database function
      if (!user?.id) {
        setStatus('❌ No authenticated user');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('assign_initial_super_admin');

      if (error) {
        console.error('Error assigning super admin:', error);
        setStatus(`Error: ${error.message}`);
      } else {
        console.log('Super admin assignment result:', data);
        setStatus(data?.success ?
          `✅ ${data.message}` :
          `❌ ${data.error || 'Unknown error'}`
        );

        if (data?.success) {
          // Refresh user roles after successful assignment
          await getUserRoles();
        }
      }
    } catch (err) {
      console.error('Exception during super admin assignment:', err);
      setStatus(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserRoles = async () => {
    if (!user?.id) return;

    try {
      // Handle guest mode users differently
      if (isGuestModeUser && guestUserType === 'admin') {
        console.log('Guest mode admin detected, returning mock super admin role...');
        const mockRole = { role_name: 'super_admin', assigned_at: new Date().toISOString() };
        setUserRoles([mockRole]);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_roles', {
        check_user_id: user.id
      } as any) as any;

      if (error) {
        console.error('Error fetching user roles:', error);
      } else {
        console.log('User roles:', data);
        setUserRoles(data || []);
      }
    } catch (err) {
      console.error('Exception fetching user roles:', err);
    }
  };

  const testHasRole = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Handle guest mode users differently
      if (isGuestModeUser && guestUserType === 'admin') {
        console.log('Guest mode admin detected, simulating has_role test...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setStatus(`has_role result: TRUE (Super Admin) - Guest Mode Simulation`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'super_admin'
      });

      console.log('has_role test result:', { data, error });
      setStatus(`has_role result: ${data ? 'TRUE (Super Admin)' : 'FALSE (Not Super Admin)'}`);
    } catch (err) {
      console.error('Exception testing has_role:', err);
      setStatus(`Error testing has_role: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      getUserRoles();
    }
  }, [user?.id]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Super Admin Setup (Development Only)</CardTitle>
        <CardDescription>
          Use this component to set up initial super admin access and debug role issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Current User:</strong> {user?.email || 'Not authenticated'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </p>
          {isGuestModeUser && (
            <p className="text-sm text-blue-600 mb-2">
              <strong>Mode:</strong> Guest Mode ({guestUserType}) - Database functions simulated
            </p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Current Roles:</h4>
          {userRoles.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {userRoles.map((role, index) => (
                <Badge
                  key={index}
                  variant={role.role_name === 'super_admin' ? 'default' : 'secondary'}
                >
                  {role.role_name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No roles assigned</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={assignInitialSuperAdmin}
            disabled={loading}
            variant="default"
          >
            {loading ? 'Assigning...' : 'Assign Initial Super Admin'}
          </Button>

          <Button
            onClick={getUserRoles}
            disabled={loading}
            variant="outline"
          >
            Refresh Roles
          </Button>

          <Button
            onClick={testHasRole}
            disabled={loading}
            variant="outline"
          >
            Test has_role Function
          </Button>
        </div>

        {status && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono">{status}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Click "Assign Initial Super Admin" to give yourself super admin role</li>
            <li>Use "Test has_role Function" to verify the database function works</li>
            <li>Check browser console for detailed debugging logs</li>
            <li>Navigate to Capture tab to test if Super Admin Dashboard appears</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};