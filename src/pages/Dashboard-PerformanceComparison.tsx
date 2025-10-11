import React, { useState, useEffect } from "react";
import { performanceMonitor } from "@/utils/performanceMonitor";
import { supabaseMonitor } from "@/utils/supabaseMonitor";

interface TestResult {
  name: string;
  url: string;
  description: string;
  status: 'not-tested' | 'testing' | 'completed';
  metrics?: {
    loadTime?: number;
    renderTime?: number;
    supabaseCalls?: number;
    totalDuration?: number;
  };
}

const DashboardPerformanceComparison: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Minimal Dashboard',
      url: '/dashboard-minimal',
      description: 'Zero dependencies, pure static components',
      status: 'not-tested'
    },
    {
      name: 'Context Test Dashboard',
      url: '/dashboard-context-test',
      description: 'Original components + Command Palette hook',
      status: 'not-tested'
    },
    {
      name: 'Original Capture Page',
      url: '/app/capture',
      description: 'Full app with all contexts and Luna framework',
      status: 'not-tested'
    }
  ]);

  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runTest = async (testName: string, url: string) => {
    setCurrentTest(testName);
    setTestResults(prev => prev.map(test =>
      test.name === testName
        ? { ...test, status: 'testing' }
        : test
    ));

    // Clear previous metrics
    performanceMonitor.clear();
    supabaseMonitor.clear();

    try {
      // Navigate to test URL in new tab to measure performance
      const startTime = performance.now();
      window.open(url, '_blank');

      // Simulate test completion after 5 seconds
      setTimeout(() => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        const metrics = {
          loadTime,
          renderTime: performanceMonitor.getMetric('dashboard-render')?.duration || 0,
          supabaseCalls: supabaseMonitor.getAllCalls().length,
          totalDuration: performanceMonitor.getAllMetrics().reduce((sum, m) => sum + (m.duration || 0), 0)
        };

        setTestResults(prev => prev.map(test =>
          test.name === testName
            ? { ...test, status: 'completed', metrics }
            : test
        ));
        setCurrentTest(null);
      }, 5000);

    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => prev.map(test =>
        test.name === testName
          ? { ...test, status: 'not-tested' }
          : test
      ));
      setCurrentTest(null);
    }
  };

  const clearResults = () => {
    setTestResults(prev => prev.map(test => ({ ...test, status: 'not-tested', metrics: undefined })));
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      tests: testResults,
      performanceMetrics: performanceMonitor.getAllMetrics(),
      supabaseMetrics: supabaseMonitor.getAllCalls()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-performance-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard Performance Analysis</h1>
        <p className="text-blue-100">
          Comprehensive testing suite to identify and fix Dashboard loading issues
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Results
          </button>
          <button
            onClick={exportResults}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Results
          </button>
          <button
            onClick={() => {
              performanceMonitor.logSummary();
              supabaseMonitor.logSummary();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Summary
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid gap-6">
        {testResults.map((test) => (
          <div key={test.name} className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{test.name}</h3>
                <p className="text-muted-foreground text-sm">{test.description}</p>
                <a
                  href={test.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {test.url}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : test.status === 'testing'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                }`}>
                  {test.status === 'not-tested' ? 'Not Tested' :
                   test.status === 'testing' ? 'Testing...' : 'Completed'}
                </div>
                <button
                  onClick={() => runTest(test.name, test.url)}
                  disabled={currentTest !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentTest === test.name ? 'Testing...' : 'Run Test'}
                </button>
              </div>
            </div>

            {test.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {test.metrics.loadTime?.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {test.metrics.renderTime?.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Render Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {test.metrics.supabaseCalls || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">DB Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {test.metrics.totalDuration?.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <h2 className="text-xl font-semibold mb-4 text-amber-900 dark:text-amber-100">
          🔍 Performance Insights
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Minimal Dashboard should load in &lt;100ms (pure static content)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">⚠</span>
            <span>Context Test should show impact of hooks and component imports</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">✗</span>
            <span>Original Dashboard issues should be clearly visible in metrics</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">💡</span>
            <span>Compare DB calls between versions to identify unnecessary queries</span>
          </div>
        </div>
      </div>

      {/* Current Session Metrics */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Current Session Metrics</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Performance Metrics</h3>
            <div className="text-sm space-y-1">
              <div>Active measurements: {performanceMonitor.getAllMetrics().length}</div>
              <div>Completed: {performanceMonitor.getCompletedMetrics().length}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Supabase Metrics</h3>
            <div className="text-sm space-y-1">
              <div>Total calls: {supabaseMonitor.getAllCalls().length}</div>
              <div>Failed calls: {supabaseMonitor.getFailedCalls().length}</div>
              <div>Slow calls (&gt;1s): {supabaseMonitor.getSlowCalls().length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPerformanceComparison;