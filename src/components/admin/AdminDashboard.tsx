import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  HardDrive,
  MemoryStick,
  Monitor,
  Server,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  Zap,
  BarChart3,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
}

interface ApplicationMetrics {
  activeUsers: number;
  totalUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  averageResponseTime: number;
  uptime: number;
  version: string;
  environment: string;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  service: string;
}

export const AdminDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: { usage: 45, cores: 8, temperature: 65 },
    memory: { used: 12.4, total: 32, usage: 38.75 },
    disk: { used: 250, total: 500, usage: 50 },
    network: { inbound: 1.2, outbound: 0.8, latency: 45 },
    database: { connections: 25, queryTime: 125, cacheHitRate: 89.5 }
  });

  const [appMetrics, setAppMetrics] = useState<ApplicationMetrics>({
    activeUsers: 1247,
    totalUsers: 15623,
    requestsPerMinute: 2340,
    errorRate: 0.12,
    averageResponseTime: 185,
    uptime: 99.97,
    version: '1.2.3',
    environment: 'production'
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 85% threshold',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      service: 'api-server'
    },
    {
      id: '2',
      type: 'info',
      title: 'Deployment Complete',
      message: 'Version 1.2.3 deployed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: true,
      service: 'deployment'
    },
    {
      id: '3',
      type: 'error',
      title: 'Database Connection Spike',
      message: 'Unusual database connection count detected',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false,
      service: 'database'
    }
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: {
          ...prev.cpu,
          usage: Math.max(20, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10))
        },
        memory: {
          ...prev.memory,
          usage: Math.max(30, Math.min(95, prev.memory.usage + (Math.random() - 0.5) * 5))
        },
        network: {
          ...prev.network,
          inbound: Math.max(0, prev.network.inbound + (Math.random() - 0.5) * 0.5),
          outbound: Math.max(0, prev.network.outbound + (Math.random() - 0.5) * 0.3)
        }
      }));

      setAppMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(1000, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50)),
        requestsPerMinute: Math.max(1000, prev.requestsPerMinute + Math.floor((Math.random() - 0.5) * 200)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.1))
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.type === 'error').length;
  const warningAlerts = unresolvedAlerts.filter(alert => alert.type === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              System monitoring and management for Spark Bloom Flow
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={appMetrics.environment === 'production' ? 'default' : 'secondary'}>
              {appMetrics.environment.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">System Status</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {appMetrics.uptime}%
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {appMetrics.activeUsers.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                of {appMetrics.totalUsers.toLocaleString()} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Response Time</CardTitle>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {appMetrics.averageResponseTime}ms
              </div>
              <p className="text-sm text-gray-600">Average response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Alerts</CardTitle>
                <Bell className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-600">
                  {criticalAlerts}
                </div>
                <div className="text-sm text-yellow-600">
                  +{warningAlerts} warnings
                </div>
              </div>
              <p className="text-sm text-gray-600">Active alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Usage</span>
                    <span className={`font-semibold ${getStatusColor(systemMetrics.cpu.usage, { warning: 70, critical: 85 })}`}>
                      {systemMetrics.cpu.usage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={systemMetrics.cpu.usage} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Cores: </span>
                      <span className="font-medium">{systemMetrics.cpu.cores}</span>
                    </div>
                    {systemMetrics.cpu.temperature && (
                      <div>
                        <span className="text-gray-600">Temp: </span>
                        <span className="font-medium">{systemMetrics.cpu.temperature}°C</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MemoryStick className="h-5 w-5 text-green-500" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Usage</span>
                    <span className={`font-semibold ${getStatusColor(systemMetrics.memory.usage, { warning: 80, critical: 90 })}`}>
                      {systemMetrics.memory.usage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={systemMetrics.memory.usage} className="h-2" />
                  <div className="text-sm">
                    <span className="text-gray-600">
                      {systemMetrics.memory.used.toFixed(1)} GB / {systemMetrics.memory.total} GB
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Disk Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                    Disk Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Usage</span>
                    <span className={`font-semibold ${getStatusColor(systemMetrics.disk.usage, { warning: 80, critical: 90 })}`}>
                      {systemMetrics.disk.usage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={systemMetrics.disk.usage} className="h-2" />
                  <div className="text-sm">
                    <span className="text-gray-600">
                      {systemMetrics.disk.used} GB / {systemMetrics.disk.total} GB
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Network Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-orange-500" />
                    Network Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Inbound</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {systemMetrics.network.inbound.toFixed(1)} MB/s
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Outbound</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {systemMetrics.network.outbound.toFixed(1)} MB/s
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">
                      Latency: {systemMetrics.network.latency}ms
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database & Application Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-500" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600">
                        {systemMetrics.database.connections}
                      </div>
                      <div className="text-xs text-gray-600">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {systemMetrics.database.queryTime}ms
                      </div>
                      <div className="text-xs text-gray-600">Avg Query Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {systemMetrics.database.cacheHitRate}%
                      </div>
                      <div className="text-xs text-gray-600">Cache Hit Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    Application Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Requests/min</div>
                      <div className="text-lg font-bold text-blue-600">
                        {appMetrics.requestsPerMinute.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                      <div className={`text-lg font-bold ${getStatusColor(appMetrics.errorRate, { warning: 1, critical: 5 })}`}>
                        {appMetrics.errorRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Version: {appMetrics.version} • Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Real-time performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Performance charts and metrics would be displayed here
                  <BarChart3 className="h-8 w-8 ml-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>
                    {unresolvedAlerts.length} unresolved alerts
                  </CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <h4 className={`font-medium ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                              {alert.title}
                            </h4>
                            <p className={`text-sm ${alert.resolved ? 'text-gray-500' : 'text-gray-600'}`}>
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {alert.service}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {alert.timestamp.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {alert.resolved ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        ) : (
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Real-time system and application logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-black rounded-lg p-4 font-mono text-sm text-green-400 overflow-hidden">
                  <div className="space-y-1">
                    <div>[{new Date().toISOString()}] INFO: API server started on port 3000</div>
                    <div>[{new Date().toISOString()}] INFO: Database connection established</div>
                    <div>[{new Date().toISOString()}] WARN: High memory usage detected (85%)</div>
                    <div>[{new Date().toISOString()}] INFO: User authentication successful</div>
                    <div>[{new Date().toISOString()}] INFO: Background job completed</div>
                    <div className="animate-pulse">_</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};