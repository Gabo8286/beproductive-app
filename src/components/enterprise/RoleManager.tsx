import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Plus,
  Settings,
  Users,
  CheckCircle,
  AlertTriangle,
  Crown,
  Key,
  Lock,
  Unlock,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  UserCheck,
  Building,
  Globe,
  Database,
  Zap
} from "lucide-react";
import { EnterpriseRole, Permission, IntegrationType } from "@/types/integrations";

const mockRoles: EnterpriseRole[] = [
  {
    id: "role_1",
    name: "Enterprise Admin",
    description: "Full administrative access to all enterprise features and integrations",
    permissions: [
      { resource: "integrations", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "users", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "roles", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "sso", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "webhooks", actions: ["create", "read", "update", "delete", "manage"] },
      { resource: "analytics", actions: ["read", "manage"] }
    ],
    is_system_role: true,
    user_count: 3,
    integration_access: {
      allowed_providers: ["slack", "microsoft_teams", "google_workspace", "jira", "github"],
      max_integrations: -1, // unlimited
      can_create_custom: true,
      webhook_access: true
    },
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-10-01T12:00:00Z"
  },
  {
    id: "role_2",
    name: "Integration Manager",
    description: "Manage integrations and webhooks with limited administrative access",
    permissions: [
      { resource: "integrations", actions: ["create", "read", "update", "delete"] },
      { resource: "webhooks", actions: ["create", "read", "update", "delete"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "users", actions: ["read"] }
    ],
    is_system_role: false,
    user_count: 12,
    integration_access: {
      allowed_providers: ["slack", "microsoft_teams", "google_workspace"],
      max_integrations: 10,
      can_create_custom: false,
      webhook_access: true
    },
    created_at: "2024-09-15T10:30:00Z",
    updated_at: "2024-09-30T14:20:00Z"
  },
  {
    id: "role_3",
    name: "Team Lead",
    description: "Access to team-specific integrations and basic management features",
    permissions: [
      { resource: "integrations", actions: ["read", "update"] },
      { resource: "users", actions: ["read"] },
      { resource: "analytics", actions: ["read"] }
    ],
    is_system_role: false,
    user_count: 25,
    integration_access: {
      allowed_providers: ["slack", "microsoft_teams"],
      max_integrations: 5,
      can_create_custom: false,
      webhook_access: false
    },
    created_at: "2024-09-20T08:15:00Z",
    updated_at: "2024-09-25T16:45:00Z"
  },
  {
    id: "role_4",
    name: "Standard User",
    description: "Basic access to personal integrations and productivity features",
    permissions: [
      { resource: "integrations", actions: ["read"] },
      { resource: "analytics", actions: ["read"] }
    ],
    is_system_role: true,
    user_count: 184,
    integration_access: {
      allowed_providers: ["slack", "google_workspace"],
      max_integrations: 3,
      can_create_custom: false,
      webhook_access: false
    },
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z"
  }
];

const availableResources = [
  "integrations",
  "users",
  "roles",
  "sso",
  "webhooks",
  "analytics",
  "processes",
  "automation",
  "ai_features",
  "reports"
];

const availableActions = ["create", "read", "update", "delete", "manage"];

const availableProviders: IntegrationType[] = [
  "slack",
  "microsoft_teams",
  "google_workspace",
  "outlook",
  "jira",
  "trello",
  "asana",
  "notion",
  "discord",
  "zoom",
  "calendly",
  "github",
  "gitlab",
  "custom_api",
  "webhook",
  "zapier",
  "power_automate"
];

export function RoleManager() {
  const [roles, setRoles] = useState<EnterpriseRole[]>(mockRoles);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EnterpriseRole | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
    integration_access: {
      allowed_providers: [] as IntegrationType[],
      max_integrations: 5,
      can_create_custom: false,
      webhook_access: false
    }
  });

  const handleCreateRole = () => {
    const role: EnterpriseRole = {
      id: `role_${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      is_system_role: false,
      user_count: 0,
      integration_access: newRole.integration_access,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setRoles(prev => [...prev, role]);
    setNewRole({
      name: "",
      description: "",
      permissions: [],
      integration_access: {
        allowed_providers: [],
        max_integrations: 5,
        can_create_custom: false,
        webhook_access: false
      }
    });
    setCreateDialogOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role && !role.is_system_role) {
      setRoles(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleCloneRole = (role: EnterpriseRole) => {
    const clonedRole: EnterpriseRole = {
      ...role,
      id: `role_${Date.now()}`,
      name: `${role.name} (Copy)`,
      is_system_role: false,
      user_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setRoles(prev => [...prev, clonedRole]);
  };

  const updatePermission = (resource: string, action: string, checked: boolean) => {
    setNewRole(prev => {
      const existingPermission = prev.permissions.find(p => p.resource === resource);

      if (existingPermission) {
        if (checked) {
          // Add action if not present
          if (!existingPermission.actions.includes(action as any)) {
            existingPermission.actions.push(action as any);
          }
        } else {
          // Remove action
          existingPermission.actions = existingPermission.actions.filter(a => a !== action);
        }

        // Remove permission if no actions left
        if (existingPermission.actions.length === 0) {
          return {
            ...prev,
            permissions: prev.permissions.filter(p => p.resource !== resource)
          };
        }

        return prev;
      } else if (checked) {
        // Create new permission
        return {
          ...prev,
          permissions: [...prev.permissions, {
            resource,
            actions: [action as any]
          }]
        };
      }

      return prev;
    });
  };

  const hasPermission = (resource: string, action: string) => {
    const permission = newRole.permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action as any) || false;
  };

  const getPermissionLevel = (role: EnterpriseRole) => {
    const totalPermissions = role.permissions.reduce((sum, p) => sum + p.actions.length, 0);
    if (totalPermissions >= 20) return { level: "Full", color: "text-red-600" };
    if (totalPermissions >= 10) return { level: "High", color: "text-orange-600" };
    if (totalPermissions >= 5) return { level: "Medium", color: "text-yellow-600" };
    return { level: "Limited", color: "text-green-600" };
  };

  const totalUsers = roles.reduce((sum, role) => sum + role.user_count, 0);
  const customRoles = roles.filter(r => !r.is_system_role).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-purple-600" />
            Advanced Role Management
          </h2>
          <p className="text-muted-foreground">
            Configure enterprise roles with granular permissions and integration access
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {customRoles} custom roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration Access</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableProviders.length}</div>
            <p className="text-xs text-muted-foreground">
              Available providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              Role-based access active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Roles Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => {
              const permissionLevel = getPermissionLevel(role);
              return (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          {role.is_system_role ? (
                            <Shield className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Crown className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {role.name}
                            {role.is_system_role && (
                              <Badge variant="secondary" className="text-xs">
                                System Role
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${permissionLevel.color}`}
                            >
                              {permissionLevel.level} Access
                            </Badge>
                          </CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingRole(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone Role
                          </DropdownMenuItem>
                          {!role.is_system_role && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Permissions Summary */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Permissions</Label>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 4).map((permission) => (
                            <Badge key={permission.resource} variant="outline" className="text-xs">
                              {permission.resource}: {permission.actions.join(", ")}
                            </Badge>
                          ))}
                          {role.permissions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Integration Access */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Integration Access</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-blue-600" />
                            <span className="text-muted-foreground">Providers:</span>
                            <span className="font-medium">{role.integration_access.allowed_providers.length}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3 text-green-600" />
                            <span className="text-muted-foreground">Max Integrations:</span>
                            <span className="font-medium">
                              {role.integration_access.max_integrations === -1 ? "Unlimited" : role.integration_access.max_integrations}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-purple-600" />
                            <span className="text-muted-foreground">Custom APIs:</span>
                            <span className="font-medium">
                              {role.integration_access.can_create_custom ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Key className="h-3 w-3 text-orange-600" />
                            <span className="text-muted-foreground">Webhooks:</span>
                            <span className="font-medium">
                              {role.integration_access.webhook_access ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-muted-foreground">Assigned Users</span>
                          </div>
                          <p className="font-semibold">{role.user_count}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Key className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-muted-foreground">Permissions</span>
                          </div>
                          <p className="font-semibold">{role.permissions.length}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <CheckCircle className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-muted-foreground">Created</span>
                          </div>
                          <p className="font-semibold text-xs">
                            {new Date(role.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of permissions across all roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Resource</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-2 min-w-24">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {availableResources.map((resource) => (
                      <tr key={resource} className="border-b">
                        <td className="p-2 font-medium capitalize">{resource.replace('_', ' ')}</td>
                        {roles.map((role) => {
                          const permission = role.permissions.find(p => p.resource === resource);
                          return (
                            <td key={role.id} className="text-center p-2">
                              {permission ? (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {permission.actions.map((action) => (
                                    <Badge key={action} variant="secondary" className="text-xs">
                                      {action.charAt(0).toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Audit Log</CardTitle>
              <CardDescription>
                Track role changes and permission modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Audit Log</h3>
                <p className="text-muted-foreground mb-4">
                  Role change audit logging would be implemented here
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Audit Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and integration access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="Integration Manager"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  placeholder="Describe the role's purpose and responsibilities..."
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">Permissions</Label>
              <div className="space-y-4">
                {availableResources.map((resource) => (
                  <div key={resource} className="border rounded-lg p-4">
                    <Label className="font-medium capitalize mb-2 block">
                      {resource.replace('_', ' ')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {availableActions.map((action) => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${resource}-${action}`}
                            checked={hasPermission(resource, action)}
                            onCheckedChange={(checked) =>
                              updatePermission(resource, action, checked as boolean)
                            }
                          />
                          <Label htmlFor={`${resource}-${action}`} className="text-sm capitalize">
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">Integration Access</Label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-integrations">Max Integrations</Label>
                    <Input
                      id="max-integrations"
                      type="number"
                      min="1"
                      value={newRole.integration_access.max_integrations}
                      onChange={(e) => setNewRole(prev => ({
                        ...prev,
                        integration_access: {
                          ...prev.integration_access,
                          max_integrations: parseInt(e.target.value) || 5
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="custom-apis"
                        checked={newRole.integration_access.can_create_custom}
                        onCheckedChange={(checked) =>
                          setNewRole(prev => ({
                            ...prev,
                            integration_access: {
                              ...prev.integration_access,
                              can_create_custom: checked as boolean
                            }
                          }))
                        }
                      />
                      <Label htmlFor="custom-apis">Can create custom APIs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="webhook-access"
                        checked={newRole.integration_access.webhook_access}
                        onCheckedChange={(checked) =>
                          setNewRole(prev => ({
                            ...prev,
                            integration_access: {
                              ...prev.integration_access,
                              webhook_access: checked as boolean
                            }
                          }))
                        }
                      />
                      <Label htmlFor="webhook-access">Webhook access</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Allowed Integration Providers</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {availableProviders.map((provider) => (
                      <div key={provider} className="flex items-center space-x-2">
                        <Checkbox
                          id={`provider-${provider}`}
                          checked={newRole.integration_access.allowed_providers.includes(provider)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRole(prev => ({
                                ...prev,
                                integration_access: {
                                  ...prev.integration_access,
                                  allowed_providers: [...prev.integration_access.allowed_providers, provider]
                                }
                              }));
                            } else {
                              setNewRole(prev => ({
                                ...prev,
                                integration_access: {
                                  ...prev.integration_access,
                                  allowed_providers: prev.integration_access.allowed_providers.filter(p => p !== provider)
                                }
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`provider-${provider}`} className="text-sm">
                          {provider.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={!newRole.name || !newRole.description || newRole.permissions.length === 0}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}