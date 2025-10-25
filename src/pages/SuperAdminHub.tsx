import React from 'react';
import {
  Shield,
  Key,
  Bot,
  Users,
  BarChart3,
  Settings,
  FileSearch,
  Activity,
  Database,
  AlertTriangle,
  TrendingUp,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuperAdminAccess } from '@/hooks/useSupeRadminAccess';

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  status?: 'active' | 'beta' | 'coming-soon';
  badge?: string;
}

const adminSections: AdminSection[] = [
  {
    id: 'api-management',
    title: 'API Management',
    description: 'Manage API keys, usage limits, and system configuration',
    icon: Key,
    path: '/admin/api-management',
    status: 'active'
  },
  {
    id: 'beta-signups',
    title: 'Beta Signup Management',
    description: 'Manage beta user approvals, invitations, and email templates',
    icon: Users,
    path: '/admin/beta-signups',
    status: 'active'
  },
  {
    id: 'fmea-dashboard',
    title: 'FMEA Dashboard',
    description: 'Error prevention, failure analysis, and quality metrics',
    icon: AlertTriangle,
    path: '/admin/fmea',
    status: 'active',
    badge: 'New'
  },
  {
    id: 'agent-dashboard',
    title: 'Agent Dashboard',
    description: 'Monitor AI agents, security, backup, and system health',
    icon: Bot,
    path: '/admin/agents',
    status: 'active'
  },
  {
    id: 'analytics',
    title: 'System Analytics',
    description: 'Application performance, user metrics, and insights',
    icon: BarChart3,
    path: '/admin/analytics',
    status: 'beta'
  },
  {
    id: 'teams-testing',
    title: 'Teams Testing Environment',
    description: 'Test team collaboration features and workspace management',
    icon: Building,
    path: '/admin/teams-testing',
    status: 'beta',
    badge: 'Testing'
  },
  {
    id: 'database-health',
    title: 'Database Health',
    description: 'Monitor database performance, connections, and migrations',
    icon: Database,
    path: '/admin/database',
    status: 'active'
  },
  {
    id: 'system-config',
    title: 'System Configuration',
    description: 'Global settings, feature flags, and environment variables',
    icon: Settings,
    path: '/admin/config',
    status: 'active'
  },
  {
    id: 'audit-logs',
    title: 'Audit & Logs',
    description: 'System logs, user actions, and security audit trails',
    icon: FileSearch,
    path: '/admin/audit',
    status: 'coming-soon'
  }
];

export default function SuperAdminHub() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading } = useSuperAdminAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Restricted</h1>
          <p className="text-gray-600 max-w-md">
            You don't have permission to access the super admin dashboard.
          </p>
          <Button
            onClick={() => navigate('/app')}
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>;
      case 'coming-soon':
        return <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  const handleSectionClick = (section: AdminSection) => {
    if (section.status === 'coming-soon') {
      return; // Don't navigate for coming soon items
    }
    navigate(section.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">
              Centralized control center for system administration and management
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI Agents</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isDisabled = section.status === 'coming-soon';

            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
                onClick={() => handleSectionClick(section)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(section.status)}
                      {section.badge && (
                        <Badge variant="secondary">{section.badge}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant={isDisabled ? "ghost" : "outline"}
                    className="w-full"
                    disabled={isDisabled}
                  >
                    {isDisabled ? 'Coming Soon' : 'Access'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Teams Testing Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Teams Features Testing</CardTitle>
                <CardDescription className="text-blue-700">
                  Test collaboration features and prepare for team management capabilities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start border-blue-200 hover:bg-blue-50"
                onClick={() => navigate('/admin/teams-testing')}
              >
                <Users className="w-4 h-4 mr-2" />
                Workspace Testing
              </Button>
              <Button
                variant="outline"
                className="justify-start border-blue-200 hover:bg-blue-50"
                onClick={() => navigate('/admin/teams-testing/collaboration')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Collaboration Testing
              </Button>
            </div>
            <p className="text-sm text-blue-600">
              Use this environment to test team features before full deployment and to explore future team management capabilities.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>Super Admin Dashboard • Be Productive App</p>
          <p className="mt-1">Manage your application with confidence</p>
        </div>
      </div>
    </div>
  );
}