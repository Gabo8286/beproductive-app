// Module Integration Test Page
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  Settings,
  Activity,
  Brain
} from 'lucide-react';
import { moduleRegistry } from '@/shared/services/moduleRegistry';
import { moduleComm, MESSAGE_TYPES } from '@/shared/services/moduleComm';
import { eventBus, EVENT_TYPES } from '@/shared/services/eventBus';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function ModuleTest() {
  const [modules, setModules] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [eventHistory, setEventHistory] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to all module events
    const unsubscribe = eventBus.subscribe('*', (event) => {
      setEventHistory(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    }, { module: 'module-test', priority: 10 });

    loadModuleStatus();
    return unsubscribe;
  }, []);

  const loadModuleStatus = () => {
    const allModules = moduleRegistry.getAllModules();
    setModules(allModules);
  };

  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests: TestResult[] = [
      { name: 'Module Registry Health Check', status: 'pending' },
      { name: 'AI Assistant Communication', status: 'pending' },
      { name: 'Productivity Cycle Communication', status: 'pending' },
      { name: 'Cross-Module Data Flow', status: 'pending' },
      { name: 'Event Bus Functionality', status: 'pending' }
    ];

    setTestResults(tests);

    // Test 1: Module Registry Health Check
    await runTest(0, async () => {
      const loadedModules = moduleRegistry.getLoadedModules();
      if (loadedModules.length === 0) {
        throw new Error('No modules are loaded');
      }
      return `${loadedModules.length} modules loaded successfully`;
    });

    // Test 2: AI Assistant Communication
    await runTest(1, async () => {
      try {
        await moduleRegistry.loadModule('ai-assistant');
        const response = await moduleComm.request(
          'module-test',
          'ai-assistant',
          MESSAGE_TYPES.HEALTH_CHECK
        );
        if (!response.success) {
          throw new Error(response.error || 'Health check failed');
        }
        return 'AI Assistant responds to health check';
      } catch (error) {
        throw new Error(`AI Assistant communication failed: ${error}`);
      }
    });

    // Test 3: Productivity Cycle Communication
    await runTest(2, async () => {
      try {
        await moduleRegistry.loadModule('productivity-cycle');
        const response = await moduleComm.request(
          'module-test',
          'productivity-cycle',
          MESSAGE_TYPES.CYCLE_GET_STATE
        );
        if (!response.success) {
          throw new Error(response.error || 'State retrieval failed');
        }
        return 'Productivity Cycle state retrieved successfully';
      } catch (error) {
        throw new Error(`Productivity Cycle communication failed: ${error}`);
      }
    });

    // Test 4: Cross-Module Data Flow
    await runTest(3, async () => {
      try {
        // Try to get productivity state and send it to AI for analysis
        const cycleResponse = await moduleComm.request(
          'module-test',
          'productivity-cycle',
          MESSAGE_TYPES.CYCLE_GET_STATE
        );

        if (!cycleResponse.success) {
          throw new Error('Failed to get cycle state');
        }

        const aiResponse = await moduleComm.request(
          'module-test',
          'ai-assistant',
          MESSAGE_TYPES.AI_ANALYZE_DATA,
          {
            data: cycleResponse.data,
            analysisType: 'productivity-analysis'
          }
        );

        if (!aiResponse.success) {
          throw new Error('AI analysis failed');
        }

        return 'Cross-module data flow working';
      } catch (error) {
        throw new Error(`Cross-module communication failed: ${error}`);
      }
    });

    // Test 5: Event Bus Functionality
    await runTest(4, async () => {
      let eventReceived = false;

      const unsubscribe = eventBus.subscribe(EVENT_TYPES.USER_ACTION, () => {
        eventReceived = true;
      }, { module: 'test-listener' });

      // Emit a test event
      await eventBus.emit({
        type: EVENT_TYPES.USER_ACTION,
        source: 'module-test',
        data: { action: 'test-action' }
      });

      // Wait a bit for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      if (!eventReceived) {
        throw new Error('Event was not received');
      }

      return 'Event bus working correctly';
    });

    setIsRunningTests(false);
  };

  const runTest = async (index: number, testFn: () => Promise<string>) => {
    const startTime = Date.now();

    setTestResults(prev => prev.map((test, i) =>
      i === index ? { ...test, status: 'running' } : test
    ));

    try {
      const message = await testFn();
      const duration = Date.now() - startTime;

      setTestResults(prev => prev.map((test, i) =>
        i === index ? {
          ...test,
          status: 'success',
          message,
          duration
        } : test
      ));
    } catch (error) {
      const duration = Date.now() - startTime;

      setTestResults(prev => prev.map((test, i) =>
        i === index ? {
          ...test,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        } : test
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loaded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Module Integration Test</h1>
          <p className="text-muted-foreground">
            Test the modular architecture and inter-module communication
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadModuleStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={runIntegrationTests}
            disabled={isRunningTests}
          >
            {isRunningTests && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Run Tests
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Module Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.map((module) => (
              <div key={module.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(module.status)}
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">v{module.version}</p>
                  </div>
                </div>
                <Badge variant={module.status === 'loaded' ? 'default' : 'secondary'}>
                  {module.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Integration Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getTestIcon(test.status)}
                <div className="flex-1">
                  <p className="font-medium">{test.name}</p>
                  {test.message && (
                    <p className={`text-sm ${
                      test.status === 'error' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {test.message}
                    </p>
                  )}
                  {test.duration && (
                    <p className="text-xs text-muted-foreground">
                      {test.duration}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Event History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {eventHistory.map((event, index) => (
                <div key={event.id || index} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    From: {event.source} {event.target && `→ ${event.target}`}
                  </p>
                </div>
              ))}
              {eventHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No recent events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}