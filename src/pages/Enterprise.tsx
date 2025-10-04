import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SSOManager } from '@/components/enterprise/SSOManager';
import { RoleManager } from '@/components/enterprise/RoleManager';
import { Shield, Crown, Building, Users, Globe, Key } from 'lucide-react';

export default function Enterprise() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building className="h-8 w-8 text-blue-600" />
          Enterprise Security & Access Control
        </h1>
        <p className="text-muted-foreground">
          Manage enterprise-grade security, authentication, and access control for your organization
        </p>
      </div>

      <Tabs defaultValue="sso" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sso" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            SSO Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Directory
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Audit & Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sso">
          <SSOManager />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManager />
        </TabsContent>

        <TabsContent value="users">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Directory Management</h3>
            <p className="text-muted-foreground">
              Enterprise user directory and provisioning features coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="text-center py-12">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Audit & Compliance</h3>
            <p className="text-muted-foreground">
              Comprehensive audit logging and compliance reporting features coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}