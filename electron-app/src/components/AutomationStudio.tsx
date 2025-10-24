import React, { useState, useEffect } from 'react';
import { useAutomation, useSidecar } from '../hooks/useElectronAPI';
import { ClaudeChat } from './ClaudeChat';

interface BrowserSession {
  sessionId: string;
  config: any;
  status: string;
  startTime: number;
}

export function AutomationStudio() {
  const {
    startBrowser,
    takeScreenshot,
    runTest,
    sessions,
    isCapturing,
    isRunningTest,
    isElectron
  } = useAutomation();

  const {
    enable: enableSidecar,
    disable: disableSidecar,
    status: sidecarStatus
  } = useSidecar();

  const [selectedUrl, setSelectedUrl] = useState('http://localhost:5173');
  const [screenshotHistory, setScreenshotHistory] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleStartBrowser = async (device: 'desktop' | 'mobile' = 'desktop') => {
    const config = {
      browser: 'chrome',
      headless: false,
      url: selectedUrl,
      device: device,
      viewport: device === 'mobile'
        ? { width: 375, height: 667 }
        : { width: 1440, height: 900 }
    };

    const result = await startBrowser(config);
    if (result?.success) {
      console.log('Browser started:', result);
    }
  };

  const handleTakeScreenshot = async (type: 'fullscreen' | 'selection' | 'window' = 'fullscreen') => {
    const result = await takeScreenshot({ type });
    if (result?.success) {
      setScreenshotHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
    }
  };

  const handleRunTest = async (testType: 'quick' | 'performance' | 'accessibility' = 'quick') => {
    const result = await runTest({
      type: testType,
      url: selectedUrl
    });

    if (result?.success) {
      setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5
    }
  };

  const handleSidecarToggle = async () => {
    if (sidecarStatus.enabled) {
      await disableSidecar();
    } else {
      await enableSidecar();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Automation Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browser automation, AI-powered testing, and iPad Pro integration
          </p>
          {!isElectron && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⚠️ Running in web mode. Full functionality requires the Electron app.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Browser & Testing */}
          <div className="space-y-6">
            {/* URL Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🌐 Browser Sessions
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target URL
                  </label>
                  <input
                    type="url"
                    value={selectedUrl}
                    onChange={(e) => setSelectedUrl(e.target.value)}
                    placeholder="http://localhost:5173"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartBrowser('desktop')}
                    disabled={!isElectron}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed"
                  >
                    🖥️ Desktop Browser
                  </button>
                  <button
                    onClick={() => handleStartBrowser('mobile')}
                    disabled={!isElectron}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed"
                  >
                    📱 Mobile Browser
                  </button>
                </div>

                {/* Active Sessions */}
                {sessions.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Active Sessions ({sessions.length})
                    </h3>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              session.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {session.config?.device === 'mobile' ? '📱' : '🖥️'} {session.sessionId}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Screenshot Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📸 Screenshot Capture
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTakeScreenshot('fullscreen')}
                    disabled={isCapturing || !isElectron}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isCapturing ? '⏳' : '🖼️'} Full
                  </button>
                  <button
                    onClick={() => handleTakeScreenshot('selection')}
                    disabled={isCapturing || !isElectron}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isCapturing ? '⏳' : '✂️'} Select
                  </button>
                  <button
                    onClick={() => handleTakeScreenshot('window')}
                    disabled={isCapturing || !isElectron}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isCapturing ? '⏳' : '🪟'} Window
                  </button>
                </div>

                {/* Screenshot History */}
                {screenshotHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Screenshots
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {screenshotHistory.slice(0, 4).map((screenshot, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                        >
                          <div className="font-medium">{screenshot.filename}</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {new Date(screenshot.capturedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Orchestration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🧪 Test Orchestration
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRunTest('quick')}
                    disabled={isRunningTest || !isElectron}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isRunningTest ? '⏳' : '⚡'} Quick
                  </button>
                  <button
                    onClick={() => handleRunTest('performance')}
                    disabled={isRunningTest || !isElectron}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isRunningTest ? '⏳' : '📊'} Perf
                  </button>
                  <button
                    onClick={() => handleRunTest('accessibility')}
                    disabled={isRunningTest || !isElectron}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400
                             text-white rounded-md transition-colors duration-200
                             disabled:cursor-not-allowed text-sm"
                  >
                    {isRunningTest ? '⏳' : '♿'} A11y
                  </button>
                </div>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Test Results
                    </h3>
                    <div className="space-y-2">
                      {testResults.slice(0, 3).map((result, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {result.type} test
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              result.success
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {result.success ? '✅ Pass' : '❌ Fail'}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - AI & iPad Integration */}
          <div className="space-y-6">
            {/* iPad Pro Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📱 iPad Pro Integration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      sidecarStatus.enabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">Sidecar</span>
                  </div>
                  <button
                    onClick={handleSidecarToggle}
                    disabled={!isElectron}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                      sidecarStatus.enabled
                        ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                    } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    {sidecarStatus.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      sidecarStatus.iPadConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">iPad Connected</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sidecarStatus.iPadCount || 0} device(s)
                  </span>
                </div>

                {sidecarStatus.enabled && sidecarStatus.iPadConnected && (
                  <div className="space-y-2">
                    <button
                      disabled={!isElectron}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                               text-white rounded-md transition-colors duration-200
                               disabled:cursor-not-allowed text-sm"
                    >
                      🪞 Start Mirror Testing
                    </button>
                    <button
                      disabled={!isElectron}
                      className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400
                               text-white rounded-md transition-colors duration-200
                               disabled:cursor-not-allowed text-sm"
                    >
                      📐 Responsive Testing Mode
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📊 Performance Dashboard
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Core Vitals Score</span>
                  <span className="text-lg font-semibold text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bundle Size</span>
                  <span className="text-lg font-semibold text-blue-600">2.1MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tests Passed</span>
                  <span className="text-lg font-semibold text-green-600">47/50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accessibility</span>
                  <span className="text-lg font-semibold text-purple-600">AAA</span>
                </div>
              </div>
            </div>

            {/* Visual Diffs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🎨 Visual Differences
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <span className="text-sm">Homepage Layout</span>
                  <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded">
                    3 changes
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Button Styles</span>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                    Reviewed ✅
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm">Mobile Navigation</span>
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claude Chat - Full Width */}
        <div className="mt-8">
          <ClaudeChat />
        </div>
      </div>
    </div>
  );
}