import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Shield,
  Users,
  Settings,
  Key,
  Lock,
  Activity,
  FileText,
  BarChart3,
  Crown,
  CheckCircle,
  AlertTriangle,
  Globe,
  Database,
} from "lucide-react";

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  status: "enabled" | "disabled" | "warning";
  category: "authentication" | "data" | "access" | "compliance";
  lastUpdated: string;
}

const securityPolicies: SecurityPolicy[] = [
  {
    id: "1",
    name: "Two-Factor Authentication",
    description: "Require 2FA for all user accounts",
    status: "enabled",
    category: "authentication",
    lastUpdated: "2024-10-01",
  },
  {
    id: "2",
    name: "Data Encryption at Rest",
    description: "Encrypt all stored data using AES-256",
    status: "enabled",
    category: "data",
    lastUpdated: "2024-09-15",
  },
  {
    id: "3",
    name: "Session Timeout",
    description: "Automatic logout after 8 hours of inactivity",
    status: "enabled",
    category: "access",
    lastUpdated: "2024-10-05",
  },
  {
    id: "4",
    name: "GDPR Compliance",
    description: "Data processing compliance with GDPR regulations",
    status: "warning",
    category: "compliance",
    lastUpdated: "2024-09-20",
  },
  {
    id: "5",
    name: "IP Allowlisting",
    description: "Restrict access to approved IP addresses",
    status: "disabled",
    category: "access",
    lastUpdated: "2024-08-10",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "enabled":
      return "bg-green-100 text-green-800";
    case "disabled":
      return "bg-gray-100 text-gray-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "enabled":
      return CheckCircle;
    case "warning":
      return AlertTriangle;
    default:
      return Settings;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "authentication":
      return "bg-blue-100 text-blue-800";
    case "data":
      return "bg-purple-100 text-purple-800";
    case "access":
      return "bg-orange-100 text-orange-800";
    case "compliance":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Enterprise() {
  const [activeTab, setActiveTab] = useState("security");

  const enabledPolicies = securityPolicies.filter((p) => p.status === "enabled");
  const warningPolicies = securityPolicies.filter((p) => p.status === "warning");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Management</h1>
          <p className="text-muted-foreground">
            Security, access control, and enterprise-grade features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
          <Button>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Enterprise
          </Button>
        </div>
      </div>

      {/* Enterprise Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Users
              </p>
              <p className="text-2xl font-bold">247</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Security Policies
              </p>
              <p className="text-2xl font-bold">{enabledPolicies.length}/{securityPolicies.length}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Compliance Score
              </p>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Security Alerts
              </p>
              <p className="text-2xl font-bold">{warningPolicies.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="security">Security & Access</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4">
            {securityPolicies.map((policy) => {
              const StatusIcon = getStatusIcon(policy.status);
              return (
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{policy.name}</h3>
                          <Badge className={getCategoryColor(policy.category)}>
                            {policy.category}
                          </Badge>
                          <Badge className={getStatusColor(policy.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {policy.description}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          Last updated: {policy.lastUpdated}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          variant={policy.status === "enabled" ? "secondary" : "default"}
                        >
                          {policy.status === "enabled" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions across your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Active Users</h3>
                      <p className="text-2xl font-bold">247</p>
                      <p className="text-sm text-muted-foreground">+12 this month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Admins</h3>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">Across 3 departments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">2FA Enabled</h3>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-sm text-muted-foreground">242 of 247 users</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-center pt-4">
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Management</CardTitle>
              <CardDescription>
                Monitor compliance with industry standards and regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">GDPR Compliance</h3>
                        <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Data Processing Agreements</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Privacy Policy Updated</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Right to Deletion</span>
                          <span className="text-yellow-600">⚠</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">SOC 2 Type II</h3>
                        <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Security Controls</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Availability Controls</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Processing Integrity</span>
                          <span className="text-yellow-600">⚠</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-center pt-4">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Compliance Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Monitor and track all system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Audit Trail</h3>
                  <p className="text-muted-foreground">
                    View detailed logs of user activities, system changes, and security events
                  </p>
                  <Button className="mt-4">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Audit Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}