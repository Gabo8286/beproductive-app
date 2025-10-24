// TypeScript declarations for Electron API in renderer process

export interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    quit: () => Promise<void>;
  };

  automation: {
    startBrowser: (config: any) => Promise<any>;
    takeScreenshot: (options: any) => Promise<any>;
    runTest: (testConfig: any) => Promise<any>;
    onBrowserStarted: (callback: (event: any, data: any) => void) => void;
    onTestCompleted: (callback: (event: any, data: any) => void) => void;
    onScreenshotCaptured: (callback: (event: any, data: any) => void) => void;
    removeAllListeners: (channel: string) => void;
  };

  ai: {
    sendMessage: (message: string) => Promise<any>;
    generateTest: (prompt: string) => Promise<any>;
    analyzeImage: (imagePath: string) => Promise<any>;
    onMessageReceived: (callback: (event: any, data: any) => void) => void;
    onTestGenerated: (callback: (event: any, data: any) => void) => void;
    onAnalysisComplete: (callback: (event: any, data: any) => void) => void;
  };

  sidecar: {
    enable: () => Promise<any>;
    disable: () => Promise<any>;
    getStatus: () => Promise<any>;
    onStatusChanged: (callback: (event: any, data: any) => void) => void;
    onEnabled: (callback: (event: any) => void) => void;
    onDisabled: (callback: (event: any) => void) => void;
  };

  window: {
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
  };
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

export {};