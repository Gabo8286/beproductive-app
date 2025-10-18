import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Debug component to set up super admin access
 * This component should only be used during development/setup
 */
export const SuperAdminSetup: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const assignInitialSuperAdmin = async () => {
    setLoading(true);
    setStatus('Assigning super admin role...');

    try {
      const { data, error } = await supabase.rpc('assign_initial_super_admin') as any;

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