import { useEffect, useState, useCallback } from 'react';

// Type definitions for the Electron API
interface BrowserConfig {
  browser?: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
  url?: string;
  device?: 'desktop' | 'mobile';
}

interface ScreenshotOptions {
  type?: 'fullscreen' | 'selection' | 'window' | 'region';
  format?: 'png' | 'jpg';
  quality?: number;
  delay?: number;
  filename?: string;
}

interface TestConfig {
  type?: 'quick' | 'performance' | 'accessibility' | 'ai-generated';
  url?: string;
  [key: string]: any;
}

interface AutomationAPI {
  startBrowser: (config: BrowserConfig) => Promise<any>;
  takeScreenshot: (options: ScreenshotOptions) => Promise<any>;
  runTest: (testConfig: TestConfig) => Promise<any>;
  onBrowserStarted: (callback: (event: any, data: any) => void) => void;
  onTestCompleted: (callback: (event: any, data: any) => void) => void;
  onScreenshotCaptured: (callback: (event: any, data: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

interface AIAPI {
  sendMessage: (message: string) => Promise<any>;
  generateTest: (prompt: string) => Promise<any>;
  analyzeImage: (imagePath: string) => Promise<any>;
  onMessageReceived: (callback: (event: any, data: any) => void) => void;
  onTestGenerated: (callback: (event: any, data: any) => void) => void;
  onAnalysisComplete: (callback: (event: any, data: any) => void) => void;
}

interface SidecarAPI {
  enable: () => Promise<any>;
  disable: () => Promise<any>;
  getStatus: () => Promise<any>;
  onStatusChanged: (callback: (event: any, data: any) => void) => void;
  onEnabled: (callback: (event: any, data: any) => void) => void;
  onDisabled: (callback: (event: any, data: any) => void) => void;
}

interface WindowAPI {
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  toggleFloatingPanel: () => Promise<void>;
  onNavigate: (callback: (event: any, route: string) => void) => void;
  onNewBrowser: (callback: (event: any) => void) => void;
  onQuickTest: (callback: (event: any) => void) => void;
  onOpenChat: (callback: (event: any) => void) => void;
  onAnalyzePage: (callback: (event: any) => void) => void;
  onGenerateTests: (callback: (event: any) => void) => void;
  onSyncBrowser: (callback: (event: any) => void) => void;
  onMirrorTest: (callback: (event: any) => void) => void;
}

interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  quit: () => Promise<void>;
}

interface ElectronAPI {
  app: AppAPI;
  automation: AutomationAPI;
  ai: AIAPI;
  sidecar: SidecarAPI;
  window: WindowAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    platform: {
      isDarwin: boolean;
      isWindows: boolean;
      isLinux: boolean;
    };
  }
}

export function useElectronAPI() {
  const [api, setApi] = useState<ElectronAPI | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    if (window.electronAPI) {
      setApi(window.electronAPI);
      setIsElectron(true);
    } else {
      // Running in web browser - provide mock API for development
      console.warn('ElectronAPI not available - running in web mode');
      setIsElectron(false);
    }
  }, []);

  return { api, isElectron };
}

// Hook for browser automation
export function useAutomation() {
  const { api, isElectron } = useElectronAPI();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const startBrowser = useCallback(async (config: BrowserConfig) => {
    if (!api) return null;

    try {
      const result = await api.automation.startBrowser(config);
      if (result.success) {
        setSessions(prev => [...prev, result]);
      }
      return result;
    } catch (error) {
      console.error('Failed to start browser:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const takeScreenshot = useCallback(async (options: ScreenshotOptions = {}) => {
    if (!api) return null;

    setIsCapturing(true);
    try {
      const result = await api.automation.takeScreenshot(options);
      return result;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return { success: false, error: error.message };
    } finally {
      setIsCapturing(false);
    }
  }, [api]);

  const runTest = useCallback(async (config: TestConfig) => {
    if (!api) return null;

    setIsRunningTest(true);
    try {
      const result = await api.automation.runTest(config);
      return result;
    } catch (error) {
      console.error('Failed to run test:', error);
      return { success: false, error: error.message };
    } finally {
      setIsRunningTest(false);
    }
  }, [api]);

  // Set up event listeners
  useEffect(() => {
    if (!api) return;

    const handleBrowserStarted = (event: any, data: any) => {
      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, status: 'ready' }
          : session
      ));
    };

    const handleTestCompleted = (event: any, data: any) => {
      setIsRunningTest(false);
      console.log('Test completed:', data);
    };

    const handleScreenshotCaptured = (event: any, data: any) => {
      setIsCapturing(false);
      console.log('Screenshot captured:', data);
    };

    api.automation.onBrowserStarted(handleBrowserStarted);
    api.automation.onTestCompleted(handleTestCompleted);
    api.automation.onScreenshotCaptured(handleScreenshotCaptured);

    return () => {
      api.automation.removeAllListeners('automation:browserStarted');
      api.automation.removeAllListeners('automation:testCompleted');
      api.automation.removeAllListeners('screenshot:captured');
    };
  }, [api]);

  return {
    startBrowser,
    takeScreenshot,
    runTest,
    sessions,
    isCapturing,
    isRunningTest,
    isElectron
  };
}

// Hook for AI integration
export function useAI() {
  const { api, isElectron } = useElectronAPI();
  const [messages, setMessages] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!api) return null;

    setIsThinking(true);
    setMessages(prev => [...prev, { type: 'user', content: message, timestamp: Date.now() }]);

    try {
      const result = await api.ai.sendMessage(message);

      if (result.success) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: result.response,
          timestamp: Date.now(),
          provider: result.provider,
          model: result.model
        }]);
      }

      return result;
    } catch (error) {
      console.error('Failed to send AI message:', error);
      return { success: false, error: error.message };
    } finally {
      setIsThinking(false);
    }
  }, [api]);

  const generateTest = useCallback(async (prompt: string) => {
    if (!api) return null;

    try {
      const result = await api.ai.generateTest(prompt);
      return result;
    } catch (error) {
      console.error('Failed to generate test:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const analyzeImage = useCallback(async (imagePath: string) => {
    if (!api) return null;

    try {
      const result = await api.ai.analyzeImage(imagePath);
      return result;
    } catch (error) {
      console.error('Failed to analyze image:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    sendMessage,
    generateTest,
    analyzeImage,
    messages,
    isThinking,
    clearMessages,
    isElectron
  };
}

// Hook for Sidecar/iPad integration
export function useSidecar() {
  const { api, isElectron } = useElectronAPI();
  const [status, setStatus] = useState({
    enabled: false,
    iPadConnected: false,
    iPadCount: 0,
    lastCheck: null
  });

  const enable = useCallback(async () => {
    if (!api) return null;

    try {
      const result = await api.sidecar.enable();
      if (result.success) {
        setStatus(result.status);
      }
      return result;
    } catch (error) {
      console.error('Failed to enable Sidecar:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const disable = useCallback(async () => {
    if (!api) return null;

    try {
      const result = await api.sidecar.disable();
      if (result.success) {
        setStatus(result.status);
      }
      return result;
    } catch (error) {
      console.error('Failed to disable Sidecar:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const getStatus = useCallback(async () => {
    if (!api) return null;

    try {
      const result = await api.sidecar.getStatus();
      if (result.success) {
        setStatus(result.status);
      }
      return result;
    } catch (error) {
      console.error('Failed to get Sidecar status:', error);
      return { success: false, error: error.message };
    }
  }, [api]);

  // Set up event listeners
  useEffect(() => {
    if (!api) return;

    const handleStatusChanged = (event: any, data: any) => {
      setStatus(data);
    };

    const handleEnabled = (event: any) => {
      setStatus(prev => ({ ...prev, enabled: true }));
    };

    const handleDisabled = (event: any) => {
      setStatus(prev => ({ ...prev, enabled: false }));
    };

    api.sidecar.onStatusChanged(handleStatusChanged);
    api.sidecar.onEnabled(handleEnabled);
    api.sidecar.onDisabled(handleDisabled);

    // Get initial status
    getStatus();

    return () => {
      // Note: Electron IPC doesn't have removeListener for these events
      // They'll be cleaned up when the renderer process is destroyed
    };
  }, [api, getStatus]);

  return {
    enable,
    disable,
    getStatus,
    status,
    isElectron
  };
}

// Hook for window management
export function useWindowControls() {
  const { api, isElectron } = useElectronAPI();

  const minimize = useCallback(async () => {
    if (!api) return;
    await api.window.minimize();
  }, [api]);

  const close = useCallback(async () => {
    if (!api) return;
    await api.window.close();
  }, [api]);

  const toggleFloatingPanel = useCallback(async () => {
    if (!api) return;
    await api.window.toggleFloatingPanel();
  }, [api]);

  return {
    minimize,
    close,
    toggleFloatingPanel,
    isElectron
  };
}