/**
 * PermissionGate Component
 * Provides granular feature-level access control for UI components
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  hasFeaturePermission,
  hasAllFeatures,
  hasAnyFeature,
  getEffectiveUserRole,
  needsUpgradeForFeature,
  getUpgradePath
} from '@/utils/permissions';
import {
  Feature,
  FeaturePermission,
  UserRole
} from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Sparkles, Crown, Zap, Users, Shield } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;

  // Feature-based permissions
  feature?: Feature;
  features?: Feature[];
  requiredPermission?: FeaturePermission;
  requireAll?: boolean; // For multiple features: true = AND, false = OR

  // Role-based permissions
  minimumRole?: UserRole;

  // Fallback behavior
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  hideWhenDenied?: boolean;

  // Custom access check
  customCheck?: (userRole: UserRole) => boolean;
}

interface UpgradePromptProps {
  feature?: Feature;
  features?: Feature[];
  currentRole: UserRole;
  className?: string;
}

function UpgradePrompt({ feature, features, currentRole, className }: UpgradePromptProps) {
  const targetFeature = feature || (features && features[0]);
  const upgradePath = targetFeature ? getUpgradePath(currentRole, targetFeature) : 'premium';

  const roleIcons: Record<UserRole, React.ReactNode> = {
    guest: <Users className="h-4 w-4" />,
    user: <Users className="h-4 w-4" />,
    premium: <Sparkles className="h-4 w-4" />,
    team_lead: <Crown className="h-4 w-4" />,
    admin: <Shield className="h-4 w-4" />,
    super_admin: <Zap className="h-4 w-4" />,
    enterprise: <Crown className="h-4 w-4" />
  };

  const roleLabels: Record<UserRole, string> = {
    guest: 'Guest',
    user: 'Free',
    premium: 'Premium',
    team_lead: 'Team Lead',
    admin: 'Admin',
    super_admin: 'Super Admin',
    enterprise: 'Enterprise'
  };

  const roleColors: Record<UserRole, string> = {
    guest: 'bg-gray-100 text-gray-700',
    user: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    team_lead: 'bg-green-100 text-green-700',
    admin: 'bg-red-100 text-red-700',
    super_admin: 'bg-yellow-100 text-yellow-700',
    enterprise: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 p-2 rounded-full bg-muted w-fit">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Premium Feature</CardTitle>
        <CardDescription>
          {feature && `Access to ${feature.replace(/_/g, ' ')} requires an upgrade.`}
          {features && features.length > 0 &&
            `Access to these features requires an upgrade: ${features.map(f => f.replace(/_/g, ' ')).join(', ')}.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className={roleColors[currentRole]}>
            {roleIcons[currentRole]}
            {roleLabels[currentRole]}
          </Badge>
          <span className="text-muted-foreground">→</span>
          {upgradePath && (
            <Badge className={roleColors[upgradePath]}>
              {roleIcons[upgradePath]}
              {roleLabels[upgradePath]}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => window.location.href = '/pricing'}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/features'}
            className="w-full"
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleUpgradeAlert({ feature, features, currentRole }: UpgradePromptProps) {
  const targetFeature = feature || (features && features[0]);
  const upgradePath = targetFeature ? getUpgradePath(currentRole, targetFeature) : 'premium';

  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          This feature requires {upgradePath} access or higher.
        </span>
        <Button
          size="sm"
          onClick={() => window.location.href = '/pricing'}
        >
          Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function PermissionGate({
  children,
  feature,
  features = [],
  requiredPermission = 'read',
  requireAll = true,
  minimumRole,
  fallback,
  showUpgradePrompt = true,
  hideWhenDenied = false,
  customCheck
}: PermissionGateProps) {
  const { profile } = useAuth();
  const userRole = getEffectiveUserRole(profile);

  // Combine single feature with features array
  const allFeatures = feature ? [feature, ...features] : features;

  // Check access based on different criteria
  let hasAccess = true;

  // Custom check takes priority
  if (customCheck) {
    hasAccess = customCheck(userRole);
  }
  // Role-based check
  else if (minimumRole) {
    const roleHierarchy: UserRole[] = [
      'guest', 'user', 'premium', 'team_lead', 'admin', 'super_admin', 'enterprise'
    ];
    const userIndex = roleHierarchy.indexOf(userRole);
    const requiredIndex = roleHierarchy.indexOf(minimumRole);
    hasAccess = userIndex >= requiredIndex;
  }
  // Feature-based check
  else if (allFeatures.length > 0) {
    if (requireAll) {
      hasAccess = hasAllFeatures(userRole, allFeatures);
    } else {
      hasAccess = hasAnyFeature(userRole, allFeatures);
    }
  }

  // Grant access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Deny access - hide completely
  if (hideWhenDenied) {
    return null;
  }

  // Deny access - show custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Deny access - show upgrade prompt
  if (showUpgradePrompt) {
    // Check if this is a layout context (prefer simple alert)
    const isLayoutContext = React.useContext(React.createContext(false));

    if (isLayoutContext) {
      return (
        <SimpleUpgradeAlert
          feature={feature}
          features={allFeatures}
          currentRole={userRole}
        />
      );
    }

    return (
      <UpgradePrompt
        feature={feature}
        features={allFeatures}
        currentRole={userRole}
        className="max-w-sm mx-auto"
      />
    );
  }

  // Default: return nothing
  return null;
}

// Convenience components for common use cases

interface FeatureGateProps {
  children: React.ReactNode;
  feature: Feature;
  permission?: FeaturePermission;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({
  children,
  feature,
  permission = 'read',
  fallback,
  showUpgradePrompt = true
}: FeatureGateProps) {
  return (
    <PermissionGate
      feature={feature}
      requiredPermission={permission}
      fallback={fallback}
      showUpgradePrompt={showUpgradePrompt}
    >
      {children}
    </PermissionGate>
  );
}

interface RoleGateProps {
  children: React.ReactNode;
  minimumRole: UserRole;
  fallback?: React.ReactNode;
  hideWhenDenied?: boolean;
}

export function RoleGate({
  children,
  minimumRole,
  fallback,
  hideWhenDenied = false
}: RoleGateProps) {
  return (
    <PermissionGate
      minimumRole={minimumRole}
      fallback={fallback}
      hideWhenDenied={hideWhenDenied}
      showUpgradePrompt={!hideWhenDenied}
    >
      {children}
    </PermissionGate>
  );
}

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideWhenDenied?: boolean;
}

export function AdminGate({
  children,
  fallback,
  hideWhenDenied = true
}: AdminGateProps) {
  return (
    <RoleGate
      minimumRole="admin"
      fallback={fallback}
      hideWhenDenied={hideWhenDenied}
    >
      {children}
    </RoleGate>
  );
}

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: Feature;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function PremiumGate({
  children,
  feature,
  fallback,
  showUpgradePrompt = true
}: PremiumGateProps) {
  return (
    <PermissionGate
      minimumRole="premium"
      feature={feature}
      fallback={fallback}
      showUpgradePrompt={showUpgradePrompt}
    >
      {children}
    </PermissionGate>
  );
}

// Hook for checking permissions in components
export function usePermissions() {
  const { profile } = useAuth();
  const userRole = getEffectiveUserRole(profile);

  return {
    userRole,
    hasFeature: (feature: Feature, permission: FeaturePermission = 'read') =>
      hasFeaturePermission(userRole, feature, permission),
    hasAllFeatures: (features: Feature[]) => hasAllFeatures(userRole, features),
    hasAnyFeature: (features: Feature[]) => hasAnyFeature(userRole, features),
    needsUpgrade: (feature: Feature) => needsUpgradeForFeature(userRole, feature),
    getUpgradePath: (feature: Feature) => getUpgradePath(userRole, feature),
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isPremium: ['premium', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(userRole),
    isTeamLead: ['team_lead', 'admin', 'super_admin', 'enterprise'].includes(userRole)
  };
}