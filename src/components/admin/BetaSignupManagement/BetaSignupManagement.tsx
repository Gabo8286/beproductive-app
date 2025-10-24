import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Mail,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Settings,
  QrCode,
} from "lucide-react";
import { withSuperAdminAccess } from "@/hooks/useSupeRadminAccess";
import { BetaSignupOverview } from "./BetaSignupOverview";
import { PendingApprovals } from "./PendingApprovals";
import { ApprovedUsers } from "./ApprovedUsers";
import { EmailHistory } from "./EmailHistory";
import { BetaSignupSettings } from "./BetaSignupSettings";
import { SuperAdminQRGenerator } from "./SuperAdminQRGenerator";

interface BetaSignupStats {
  totalSignups: number;
  pendingSignups: number;
  approvedSignups: number;
  rejectedSignups: number;
  recentSignups24h: number;
  recentSignups7d: number;
  invitationsSent: number;
  lastUpdated: string;
}

interface TrendData {
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

const BetaSignupManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - will be replaced with real API calls
  const stats: BetaSignupStats = {
    totalSignups: 47,
    pendingSignups: 12,
    approvedSignups: 31,
    rejectedSignups: 4,
    recentSignups24h: 3,
    recentSignups7d: 18,
    invitationsSent: 28,
    lastUpdated: new Date().toISOString(),
  };

  const trends: Record<string, TrendData> = {
    signups: { value: 47, change: 23.5, trend: "up" },
    pending: { value: 12, change: -15.2, trend: "down" },
    approved: { value: 31, change: 18.3, trend: "up" },
  };

  const renderTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const renderTrendBadge = (
    change: number,
    trend: "up" | "down" | "stable",
  ) => {
    const color =
      trend === "up"
        ? "bg-green-50 text-green-700"
        : trend === "down"
          ? "bg-red-50 text-red-700"
          : "bg-gray-50 text-gray-700";

    return (
      <Badge variant="secondary" className={color}>
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beta Signup Management</h1>
          <p className="text-gray-600 mt-1">
            Manage beta signup requests, approve users, and send invitation emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Invitations
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {stats.pendingSignups > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-700">
                {stats.pendingSignups}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="qr-codes">
            <QrCode className="h-4 w-4 mr-1" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="emails">Email History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alert Banner for Pending Approvals */}
          {stats.pendingSignups > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-orange-800 font-medium">
                      {stats.pendingSignups} signup request
                      {stats.pendingSignups > 1 ? "s" : ""} awaiting approval
                    </p>
                    <p className="text-orange-700 text-sm">
                      Review and approve beta signup requests to send invitation emails
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setActiveTab("pending")}
                  >
                    Review Pending
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSignups}</div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.signups.trend)}
                  {renderTrendBadge(trends.signups.change, trends.signups.trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pendingSignups}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.pending.trend)}
                  {renderTrendBadge(trends.pending.change, trends.pending.trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.approvedSignups}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.approved.trend)}
                  {renderTrendBadge(trends.approved.change, trends.approved.trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Invitations Sent
                </CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.invitationsSent}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.invitationsSent / stats.approvedSignups) * 100)}% of approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest beta signup requests and approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New signup: sarah.developer@gmail.com
                      </p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Approved: john.pm@startup.co
                      </p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Approved
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Invitation sent: alex.freelancer@email.com
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Invited
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
                <CardDescription>
                  Beta signup metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        New signups (24h)
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {stats.recentSignups24h}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        New signups (7d)
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {stats.recentSignups7d}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Approval rate
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      {Math.round((stats.approvedSignups / (stats.approvedSignups + stats.rejectedSignups)) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <PendingApprovals />
        </TabsContent>

        <TabsContent value="approved">
          <ApprovedUsers />
        </TabsContent>

        <TabsContent value="qr-codes">
          <SuperAdminQRGenerator />
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Rejected Signups
              </CardTitle>
              <CardDescription>
                Beta signup requests that have been rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Rejected signups management coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <EmailHistory />
        </TabsContent>

        <TabsContent value="settings">
          <BetaSignupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withSuperAdminAccess(BetaSignupManagement);