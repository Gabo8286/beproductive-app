/**
 * Permission System Usage Examples
 * Demonstrates how to use the new role-based access control system
 */

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  PermissionGate,
  FeatureGate,
  RoleGate,
  AdminGate,
  PremiumGate,
  usePermissions
} from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Example 1: Protected Route Usage
function ExampleProtectedRoute() {
  return (
    <ProtectedRoute
      requiredRole="premium"
      requiredFeatures={['ai_insights']}
      showUpgradePrompt={true}
    >
      <div>This is a premium AI insights page</div>
    </ProtectedRoute>
  );
}

// Example 2: Admin-only Route
function AdminOnlyRoute() {
  return (
    <ProtectedRoute
      requiredRole="admin"
      fallbackPath="/app/capture"
    >
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}

// Example 3: Feature Gates in Components
function ExampleFeatureGates() {
  const permissions = usePermissions();

  return (
    <div className="space-y-4">
      {/* Basic Feature Gate */}
      <FeatureGate feature="ai_insights">
        <Button>AI Insights Feature</Button>
      </FeatureGate>

      {/* Permission Gate with Multiple Features */}
      <PermissionGate
        features={['advanced_analytics', 'custom_reports']}
        requireAll={false} // OR condition
        showUpgradePrompt={true}
      >
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            Premium analytics dashboard
          </CardContent>
        </Card>
      </PermissionGate>

      {/* Role-based Gate */}
      <RoleGate minimumRole="team_lead">
        <Button variant="outline">Team Management</Button>
      </RoleGate>

      {/* Admin Gate (hidden for non-admins) */}
      <AdminGate hideWhenDenied={true}>
        <Button variant="destructive">Delete All Data</Button>
      </AdminGate>

      {/* Premium Gate with Custom Fallback */}
      <PremiumGate
        feature="unlimited_projects"
        fallback={
          <Button variant="outline" disabled>
            Upgrade to create unlimited projects
          </Button>
        }
      >
        <Button>Create New Project</Button>
      </PremiumGate>

      {/* Using Permissions Hook */}
      <div className="space-y-2">
        <p>Your Role: {permissions.userRole}</p>
        <p>Is Premium: {permissions.isPremium ? 'Yes' : 'No'}</p>
        <p>Is Admin: {permissions.isAdmin ? 'Yes' : 'No'}</p>
        <p>Has AI Insights: {permissions.hasFeature('ai_insights') ? 'Yes' : 'No'}</p>

        {permissions.needsUpgrade('ai_insights') && (
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrade to {permissions.getUpgradePath('ai_insights')}
          </Button>
        )}
      </div>
    </div>
  );
}

// Example 4: Navigation Filtering
function ExampleNavigation() {
  const navigation = useRoleBasedNavigation();

  const navigationItems = [
    {
      path: '/app/capture',
      label: 'Capture',
      requiredFeatures: ['basic_tasks' as const]
    },
    {
      path: '/ai-insights',
      label: 'AI Insights',
      requiredRole: 'premium' as const,
      requiredFeatures: ['ai_insights' as const]
    },
    {
      path: '/team',
      label: 'Team',
      requiredRole: 'team_lead' as const,
      requiredFeatures: ['team_management' as const]
    },
    {
      path: '/admin',
      label: 'Admin',
      requiredRole: 'admin' as const
    }
  ];

  const filteredNavItems = navigation.getFilteredNavItems(navigationItems);

  return (
    <nav className="space-y-2">
      {filteredNavItems.map((item) => (
        <div key={item.path}>
          <Button
            variant={navigation.canAccessPage(item.path) ? 'default' : 'outline'}
            onClick={() => window.location.href = item.path}
          >
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}

// Example 5: Dynamic Content Based on Permissions
function ExampleDynamicContent() {
  const permissions = usePermissions();

  return (
    <div className="grid gap-4">
      {/* Always visible content */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Features</CardTitle>
        </CardHeader>
        <CardContent>
          Available to all users
        </CardContent>
      </Card>

      {/* Premium content */}
      {permissions.isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            Advanced productivity tools
          </CardContent>
        </Card>
      )}

      {/* Admin content */}
      {permissions.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            System administration tools
          </CardContent>
        </Card>
      )}

      {/* Feature-specific content */}
      {permissions.hasFeature('ai_insights') && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            Personalized productivity insights
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Example 6: Conditional Rendering with Upgrade Prompts
function ExampleConditionalRendering() {
  const permissions = usePermissions();

  return (
    <div className="space-y-4">
      {permissions.hasFeature('advanced_analytics') ? (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            Your detailed productivity analytics
          </CardContent>
        </Card>
      ) : (
        <PremiumGate feature="advanced_analytics">
          <div>Placeholder for locked content</div>
        </PremiumGate>
      )}
    </div>
  );
}

export default function PermissionSystemUsage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Permission System Examples</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Feature Gates</h2>
        <ExampleFeatureGates />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
        <ExampleNavigation />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Dynamic Content</h2>
        <ExampleDynamicContent />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Conditional Rendering</h2>
        <ExampleConditionalRendering />
      </section>
    </div>
  );
}