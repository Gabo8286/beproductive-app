import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Shield, Database, Activity } from 'lucide-react';

interface AgentStatus {
  name: string;
  running: boolean;
  last_check?: string;
  health: 'healthy' | 'warning' | 'error';
  metrics?: any;
}

interface SystemStatus {
  total_agents: number;
  running_agents: number;
  system_health: 'healthy' | 'warning' | 'critical';
  last_update: string;
  agents: AgentStatus[];
}

export const AgentDashboard: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      // In production, this would call your actual API
      // For now, we'll simulate the data
      const mockStatus: SystemStatus = {
        total_agents: 3,
        running_agents: 3,
        system_health: 'healthy',
        last_update: new Date().toISOString(),
        agents: [
          {
            name: 'monitoring',
            running: true,
            last_check: new Date().toISOString(),
            health: 'healthy',
            metrics: {
              response_time: 245,
              error_rate: 0.1,
              cpu_usage: 45,
            },
          },
          {
            name: 'security',
            running: true,
            last_check: new Date().toISOString(),
            health: 'healthy',
            metrics: {
              blocked_ips: 0,
              failed_logins: 2,
              threat_level: 'low',
            },
          },
          {
            name: 'backup',
            running: true,
            last_check: new Date().toISOString(),
            health: 'healthy',
            metrics: {
              last_backup: '2 hours ago',
              backup_size: '450MB',
              success_rate: '100%',
            },
          },
        ],
      };

      setStatus(mockStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthBadge = (health: string) => {
    const variant = health === 'healthy' ? 'default' : health === 'warning' ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="ml-2">
        {health}
      </Badge>
    );
  };

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'monitoring':
        return <Activity className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'backup':
        return <Database className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading agent status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Error: {error}</span>
            </div>
            <Button onClick={fetchStatus} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Agents Dashboard</h1>
        <Button onClick={fetchStatus} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.total_agents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {status?.running_agents || 0} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon(status?.system_health || 'error')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {status?.system_health || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last update: {status?.last_update ? new Date(status.last_update).toLocaleTimeString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {status?.agents.map((agent) => (
          <Card key={agent.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getAgentIcon(agent.name)}
                  <span className="ml-2 capitalize">{agent.name} Agent</span>
                </div>
                {getHealthBadge(agent.health)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${agent.running ? 'text-green-600' : 'text-red-600'}`}>
                    {agent.running ? 'Running' : 'Stopped'}
                  </span>
                </div>

                {agent.last_check && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Check:</span>
                    <span className="text-sm">
                      {new Date(agent.last_check).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Agent-specific metrics */}
                {agent.name === 'monitoring' && agent.metrics && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Response Time:</span>
                      <span className="text-xs">{agent.metrics.response_time}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Error Rate:</span>
                      <span className="text-xs">{agent.metrics.error_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">CPU Usage:</span>
                      <span className="text-xs">{agent.metrics.cpu_usage}%</span>
                    </div>
                  </div>
                )}

                {agent.name === 'security' && agent.metrics && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Blocked IPs:</span>
                      <span className="text-xs">{agent.metrics.blocked_ips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Failed Logins:</span>
                      <span className="text-xs">{agent.metrics.failed_logins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Threat Level:</span>
                      <span className="text-xs capitalize">{agent.metrics.threat_level}</span>
                    </div>
                  </div>
                )}

                {agent.name === 'backup' && agent.metrics && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Last Backup:</span>
                      <span className="text-xs">{agent.metrics.last_backup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Size:</span>
                      <span className="text-xs">{agent.metrics.backup_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Success Rate:</span>
                      <span className="text-xs">{agent.metrics.success_rate}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Force Health Check
            </Button>
            <Button variant="outline" size="sm">
              Run Security Scan
            </Button>
            <Button variant="outline" size="sm">
              Create Manual Backup
            </Button>
            <Button variant="outline" size="sm">
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;