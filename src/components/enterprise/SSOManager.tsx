import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Clock,
  Key,
  Globe,
  Building,
  UserCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Zap
} from "lucide-react";
import { SSOProvider, SSOConfig } from "@/types/integrations";

const mockSSOProviders: SSOProvider[] = [
  {
    id: "sso_1",
    name: "Microsoft Azure AD",
    type: "oidc",
    domain: "contoso.com",
    configuration: {
      issuer_url: "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/v2.0",
      client_id: "87654321-4321-4321-4321-210987654321",
      client_secret: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
      authorization_url: "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/oauth2/v2.0/authorize",
      token_url: "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/oauth2/v2.0/token",
      userinfo_url: "https://graph.microsoft.com/oidc/userinfo",
      scopes: ["openid", "profile", "email"],
      attribute_mapping: {
        email: "email",
        name: "name",
        groups: "groups",
        department: "department",
        title: "jobTitle"
      },
      auto_provisioning: true,
      default_role: "user",
      group_role_mapping: {
        "Administrators": "admin",
        "Managers": "manager",
        "Users": "user"
      }
    },
    status: "active",
    user_count: 247,
    last_sync_at: "2024-10-02T10:30:00Z",
    created_at: "2024-09-15T09:00:00Z",
    updated_at: "2024-10-02T10:30:00Z"
  },
  {
    id: "sso_2",
    name: "Google Workspace",
    type: "oidc",
    domain: "example.com",
    configuration: {
      issuer_url: "https://accounts.google.com",
      client_id: "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com",
      client_secret: "GOCSPX-1234567890abcdefghijklmnopqrstuvwxyz",
      authorization_url: "https://accounts.google.com/o/oauth2/v2/auth",
      token_url: "https://oauth2.googleapis.com/token",
      userinfo_url: "https://openidconnect.googleapis.com/v1/userinfo",
      scopes: ["openid", "profile", "email"],
      attribute_mapping: {
        email: "email",
        name: "name",
        department: "hd",
        title: "locale"
      },
      auto_provisioning: true,
      default_role: "user",
      group_role_mapping: {}
    },
    status: "testing",
    user_count: 89,
    created_at: "2024-09-20T14:30:00Z",
    updated_at: "2024-10-01T16:45:00Z"
  },
  {
    id: "sso_3",
    name: "Okta SAML",
    type: "saml",
    domain: "mycompany.okta.com",
    configuration: {
      issuer_url: "https://mycompany.okta.com/app/exk1234567890/sso/saml",
      scopes: [],
      attribute_mapping: {
        email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        groups: "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"
      },
      auto_provisioning: false,
      default_role: "user",
      group_role_mapping: {
        "Admin Group": "admin",
        "Manager Group": "manager"
      }
    },
    status: "inactive",
    user_count: 0,
    created_at: "2024-09-25T11:15:00Z",
    updated_at: "2024-09-25T11:15:00Z"
  }
];

const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-gray-600 bg-gray-100",
  testing: "text-yellow-600 bg-yellow-100"
};

const statusIcons = {
  active: CheckCircle,
  inactive: Clock,
  testing: TestTube
};

const ssoTypeLabels = {
  oidc: "OpenID Connect",
  saml: "SAML 2.0",
  oauth2: "OAuth 2.0",
  ldap: "LDAP"
};

export function SSOManager() {
  const [providers, setProviders] = useState<SSOProvider[]>(mockSSOProviders);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newProvider, setNewProvider] = useState({
    name: "",
    type: "oidc" as SSOProvider['type'],
    domain: "",
    configuration: {
      issuer_url: "",
      client_id: "",
      client_secret: "",
      authorization_url: "",
      token_url: "",
      userinfo_url: "",
      scopes: ["openid", "profile", "email"],
      attribute_mapping: {
        email: "email",
        name: "name"
      },
      auto_provisioning: true,
      default_role: "user",
      group_role_mapping: {}
    }
  });

  const handleCreateProvider = () => {
    const provider: SSOProvider = {
      id: `sso_${Date.now()}`,
      name: newProvider.name,
      type: newProvider.type,
      domain: newProvider.domain,
      configuration: newProvider.configuration,
      status: "testing",
      user_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProviders(prev => [...prev, provider]);
    setNewProvider({
      name: "",
      type: "oidc",
      domain: "",
      configuration: {
        issuer_url: "",
        client_id: "",
        client_secret: "",
        authorization_url: "",
        token_url: "",
        userinfo_url: "",
        scopes: ["openid", "profile", "email"],
        attribute_mapping: {
          email: "email",
          name: "name"
        },
        auto_provisioning: true,
        default_role: "user",
        group_role_mapping: {}
      }
    });
    setCreateDialogOpen(false);
  };

  const handleToggleProvider = (id: string) => {
    setProviders(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const handleDeleteProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskSecret = (secret: string) => {
    if (!secret) return "";
    return secret.slice(0, 8) + "..." + secret.slice(-4);
  };

  const getStatusIcon = (status: SSOProvider['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const totalUsers = providers.reduce((sum, provider) => sum + provider.user_count, 0);
  const activeProviders = providers.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Enterprise SSO Management
          </h2>
          <p className="text-muted-foreground">
            Configure Single Sign-On providers for secure enterprise authentication
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add SSO Provider
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSO Providers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProviders} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSO Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Authenticated via SSO
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(providers.map(p => p.domain)).size}</div>
            <p className="text-xs text-muted-foreground">
              Configured domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All configurations valid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SSO Providers List */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {provider.name}
                      <Badge variant="outline" className={statusColors[provider.status]}>
                        {getStatusIcon(provider.status)}
                        {provider.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {ssoTypeLabels[provider.type]}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {provider.domain}
                      {provider.user_count > 0 && (
                        <>
                          <span>•</span>
                          <Users className="h-3 w-3" />
                          {provider.user_count} users
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingProvider(provider)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleProvider(provider.id)}>
                      {provider.status === 'active' ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteProvider(provider.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  <TabsTrigger value="mappings">Mappings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <UserCheck className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-muted-foreground">Auto Provisioning</span>
                      </div>
                      <p className="font-semibold">
                        {provider.configuration.auto_provisioning ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Key className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-muted-foreground">Default Role</span>
                      </div>
                      <p className="font-semibold capitalize">{provider.configuration.default_role}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3 text-purple-600" />
                        <span className="text-xs text-muted-foreground">Group Mappings</span>
                      </div>
                      <p className="font-semibold">
                        {Object.keys(provider.configuration.group_role_mapping).length}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-muted-foreground">Last Sync</span>
                      </div>
                      <p className="font-semibold text-xs">
                        {provider.last_sync_at ? new Date(provider.last_sync_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="configuration" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Issuer URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                          {provider.configuration.issuer_url}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(provider.configuration.issuer_url || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {provider.configuration.client_id && (
                      <div>
                        <Label className="text-sm font-medium">Client ID</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {provider.configuration.client_id}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(provider.configuration.client_id || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {provider.configuration.client_secret && (
                      <div>
                        <Label className="text-sm font-medium">Client Secret</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {showSecrets[provider.id]
                              ? provider.configuration.client_secret
                              : maskSecret(provider.configuration.client_secret)
                            }
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(provider.configuration.client_secret || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Scopes</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.configuration.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mappings" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Attribute Mappings</Label>
                    <div className="space-y-2">
                      {Object.entries(provider.configuration.attribute_mapping).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{value}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(provider.configuration.group_role_mapping).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Group Role Mappings</Label>
                      <div className="space-y-2">
                        {Object.entries(provider.configuration.group_role_mapping).map(([group, role]) => (
                          <div key={group} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{group}</span>
                            <Badge variant="outline" className="capitalize">
                              {role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Sync Users
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {providers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No SSO providers configured</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Set up Single Sign-On to enable secure enterprise authentication for your users
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First SSO Provider
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create SSO Provider Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add SSO Provider</DialogTitle>
            <DialogDescription>
              Configure a new Single Sign-On provider for enterprise authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider-name">Provider Name</Label>
                <Input
                  id="provider-name"
                  placeholder="Microsoft Azure AD"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="provider-type">SSO Type</Label>
                <Select value={newProvider.type} onValueChange={(value: SSOProvider['type']) =>
                  setNewProvider(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oidc">OpenID Connect</SelectItem>
                    <SelectItem value="saml">SAML 2.0</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="ldap">LDAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="provider-domain">Domain</Label>
              <Input
                id="provider-domain"
                placeholder="company.com"
                value={newProvider.domain}
                onChange={(e) => setNewProvider(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>

            {(newProvider.type === 'oidc' || newProvider.type === 'oauth2') && (
              <>
                <div>
                  <Label htmlFor="issuer-url">Issuer URL</Label>
                  <Input
                    id="issuer-url"
                    placeholder="https://login.microsoftonline.com/tenant-id/v2.0"
                    value={newProvider.configuration.issuer_url}
                    onChange={(e) => setNewProvider(prev => ({
                      ...prev,
                      configuration: { ...prev.configuration, issuer_url: e.target.value }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input
                      id="client-id"
                      placeholder="your-client-id"
                      value={newProvider.configuration.client_id}
                      onChange={(e) => setNewProvider(prev => ({
                        ...prev,
                        configuration: { ...prev.configuration, client_id: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <Input
                      id="client-secret"
                      type="password"
                      placeholder="your-client-secret"
                      value={newProvider.configuration.client_secret}
                      onChange={(e) => setNewProvider(prev => ({
                        ...prev,
                        configuration: { ...prev.configuration, client_secret: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </>
            )}

            {newProvider.type === 'saml' && (
              <div>
                <Label htmlFor="saml-issuer">SAML Issuer URL</Label>
                <Input
                  id="saml-issuer"
                  placeholder="https://your-idp.com/saml/sso"
                  value={newProvider.configuration.issuer_url}
                  onChange={(e) => setNewProvider(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, issuer_url: e.target.value }
                  }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProvider}
              disabled={!newProvider.name || !newProvider.domain || !newProvider.configuration.issuer_url}
            >
              Create SSO Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}