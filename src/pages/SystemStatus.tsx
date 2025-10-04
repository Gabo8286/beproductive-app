import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Shield,
  Zap,
  RefreshCw,
  TrendingUp,
  HardDrive
} from 'lucide-react';
import { useHealthCheck } from '@/utils/health';
import { useErrorTracking } from '@/utils/errorTracking';
import { usePerformanceMonitor } from '@/utils/performance';

interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'pass' | 'fail' | 'warn';
  label: string;
  description?: string;
  lastChecked?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, description, lastChecked }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return { color: 'bg-green-500', badge: 'default', icon: CheckCircle };
      case 'degraded':
      case 'warn':
        return { color: 'bg-yellow-500', badge: 'secondary', icon: AlertTriangle };
      case 'unhealthy':
      case 'fail':
        return { color: 'bg-red-500', badge: 'destructive', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-500', badge: 'outline', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <div>
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
            <Badge variant={config.badge as any} className="text-xs">
              {status.toUpperCase()}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          {lastChecked && (
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date(lastChecked).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SystemStatus: React.FC = () => {
  const { healthData, isLoading, checkHealth, systemInfo } = useHealthCheck();
  const { metrics: errorMetrics } = useErrorTracking();
  const { getPerformanceSummary } = usePerformanceMonitor();
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    setPerformanceData(getPerformanceSummary());
  }, [getPerformanceSummary]);

  const getOverallStatus = () => {
    if (!healthData) return 'unknown';
    return healthData.status;
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of application health and performance
          </p>
        </div>
        <Button onClick={checkHealth} disabled={isLoading} className="flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Overall System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`w-6 h-6 rounded-full ${
              getOverallStatus() === 'healthy' ? 'bg-green-500' :
              getOverallStatus() === 'degraded' ? 'bg-yellow-500' :
              getOverallStatus() === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <div>
              <div className="text-2xl font-bold capitalize">{getOverallStatus()}</div>
              <div className="text-sm text-muted-foreground">
                {healthData && `Uptime: ${formatUptime(healthData.uptime)}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Application Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version:</span>
              <span className="text-sm font-medium">{systemInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Environment:</span>
              <Badge variant="outline">{systemInfo.environment}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Build Time:</span>
              <span className="text-sm font-medium">
                {new Date(systemInfo.buildTime).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Features:</span>
              <span className="text-sm font-medium">{systemInfo.features.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Load Time:</span>
              <span className="text-sm font-medium">
                {performanceData?.performance?.loadTime?.toFixed(0)}ms
              </span>
            </div>
            {performanceData?.memory && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Memory Used:</span>
                  <span className="text-sm font-medium">
                    {formatBytes(performanceData.memory.usedJSHeapSize)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Memory Usage:</span>
                    <span>
                      {((performanceData.memory.usedJSHeapSize / performanceData.memory.jsHeapSizeLimit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(performanceData.memory.usedJSHeapSize / performanceData.memory.jsHeapSizeLimit) * 100}
                    className="h-2"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Error Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Session ID:</span>
              <span className="text-sm font-mono">{errorMetrics.sessionId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Queued Errors:</span>
              <Badge variant={errorMetrics.errorsQueued > 0 ? 'destructive' : 'default'}>
                {errorMetrics.errorsQueued}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Performance Issues:</span>
              <Badge variant={errorMetrics.performanceIssuesQueued > 0 ? 'secondary' : 'default'}>
                {errorMetrics.performanceIssuesQueued}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tracking:</span>
              <Badge variant={errorMetrics.isInitialized ? 'default' : 'destructive'}>
                {errorMetrics.isInitialized ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Service Health Checks</span>
            </CardTitle>
            <CardDescription>
              Status of critical system components and external dependencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(healthData.checks).map(([service, check]) => (
              <StatusIndicator
                key={service}
                status={check.status}
                label={service.charAt(0).toUpperCase() + service.slice(1)}
                description={check.output || check.error}
                lastChecked={healthData.timestamp}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Feature Availability</span>
          </CardTitle>
          <CardDescription>
            Status of application features and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemInfo.features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium capitalize">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      {import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Debug Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Health Data</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Performance Data</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(performanceData, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemStatus;