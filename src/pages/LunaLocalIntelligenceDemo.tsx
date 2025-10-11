import React, { useState } from "react";
import { processWithLocalIntelligence, lunaLocalIntelligence, type LocalTaskResult } from "@/utils/lunaLocalIntelligence";

const LunaLocalIntelligenceDemo: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LocalTaskResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ input: string; result: LocalTaskResult }>>([]);

  const testCases = [
    "What time is it?",
    "Create a task to review project proposals",
    "Calculate 25 * 8",
    "Show me my tasks",
    "I need to prioritize my urgent work",
    "Give me productivity suggestions",
    "Navigate to calendar",
    "What's today's date?",
    "Help me focus better",
    "Set up a meeting reminder"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const taskResult = await processWithLocalIntelligence(input);
      setResult(taskResult);
      setTestResults(prev => [...prev.slice(-4), { input, result: taskResult }]);
    } catch (error) {
      console.error('Error processing:', error);
    }
    setIsProcessing(false);
  };

  const runTestCase = async (testInput: string) => {
    setInput(testInput);
    setIsProcessing(true);
    try {
      const taskResult = await processWithLocalIntelligence(testInput);
      setResult(taskResult);
      setTestResults(prev => [...prev.slice(-4), { input: testInput, result: taskResult }]);
    } catch (error) {
      console.error('Error processing:', error);
    }
    setIsProcessing(false);
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTestCase(testCase);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  const getResultColor = (result: LocalTaskResult) => {
    if (result.type === 'success') return result.handledLocally ? 'green' : 'blue';
    if (result.type === 'fallback') return 'yellow';
    return 'red';
  };

  const getResultIcon = (result: LocalTaskResult) => {
    if (result.type === 'success' && result.handledLocally) return '⚡';
    if (result.type === 'success') return '🤖';
    if (result.type === 'fallback') return '🔄';
    return '❌';
  };

  const capabilities = lunaLocalIntelligence.getCapabilities();
  const cacheStats = lunaLocalIntelligence.getCacheStats();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Luna Local Intelligence Demo</h1>
        <p className="text-purple-100">
          Test Luna's ability to handle tasks locally without API calls
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold mb-2">Local Algorithms</h3>
          <div className="text-2xl font-bold text-purple-600">{capabilities.length}</div>
          <div className="text-sm text-muted-foreground">Active processors</div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold mb-2">Response Cache</h3>
          <div className="text-2xl font-bold text-green-600">{cacheStats.size}</div>
          <div className="text-sm text-muted-foreground">Cached responses</div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold mb-2">API Reduction</h3>
          <div className="text-2xl font-bold text-blue-600">~60%</div>
          <div className="text-sm text-muted-foreground">Estimated savings</div>
        </div>
      </div>

      {/* Interactive Test */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Interactive Test</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Luna something... (e.g., 'What time is it?', 'Create a task', 'Calculate 2+2')"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Test Luna Local'}
            </button>
            <button
              type="button"
              onClick={() => lunaLocalIntelligence.clearCache()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </form>

        {/* Current Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            getResultColor(result) === 'green' ? 'border-green-200 bg-green-50' :
            getResultColor(result) === 'blue' ? 'border-blue-200 bg-blue-50' :
            getResultColor(result) === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getResultIcon(result)}</span>
              <div className="flex-1">
                <div className="font-medium mb-2">
                  {result.handledLocally ? 'Handled Locally' : result.type === 'fallback' ? 'Needs API' : 'API Required'}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({result.executionTime.toFixed(1)}ms, {(result.confidence * 100).toFixed(0)}% confidence)
                  </span>
                </div>
                <div className="text-sm mb-3">{result.content}</div>
                {result.suggestedActions && (
                  <div className="text-xs">
                    <strong>Suggested actions:</strong> {result.suggestedActions.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Test Cases */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Test Cases</h2>
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run All Tests
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {testCases.map((testCase, index) => (
            <button
              key={index}
              onClick={() => runTestCase(testCase)}
              disabled={isProcessing}
              className="text-left p-3 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              "{testCase}"
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities Overview */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Local Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <span className="text-green-600">✓</span>
              <span className="font-medium">{capability}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
          <div className="space-y-3">
            {testResults.slice(-5).map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <span className="text-lg">{getResultIcon(test.result)}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">"{test.input}"</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {test.result.handledLocally ? 'Local' : 'API'} •
                    {test.result.executionTime.toFixed(1)}ms •
                    {(test.result.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Impact */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h2 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
          🚀 Performance Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-green-800 dark:text-green-200">Local Processing</div>
            <div className="text-green-600">• Response time: 1-20ms</div>
            <div className="text-green-600">• No network latency</div>
            <div className="text-green-600">• Works offline</div>
          </div>
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">API Reduction</div>
            <div className="text-blue-600">• 60%+ fewer API calls</div>
            <div className="text-blue-600">• Reduced server load</div>
            <div className="text-blue-600">• Lower costs</div>
          </div>
          <div>
            <div className="font-medium text-purple-800 dark:text-purple-200">User Experience</div>
            <div className="text-purple-600">• Instant responses</div>
            <div className="text-purple-600">• Better reliability</div>
            <div className="text-purple-600">• Smoother interactions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunaLocalIntelligenceDemo;