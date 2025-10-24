import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for BeProductive Coding Framework
 *
 * Provides secure bridge between the main process and renderer process
 * Exposes limited, safe APIs to the frontend React application
 */

// Define the API interface for TypeScript
const electronAPI = {
  // App-level operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    quit: () => ipcRenderer.invoke('app:quit')
  },

  // Browser automation API
  automation: {
    startBrowser: (config) => ipcRenderer.invoke('automation:startBrowser', config),
    takeScreenshot: (options) => ipcRenderer.invoke('automation:takeScreenshot', options),
    runTest: (testConfig) => ipcRenderer.invoke('automation:runTest', testConfig),

    // Event listeners for automation updates
    onBrowserStarted: (callback) => ipcRenderer.on('automation:browserStarted', callback),
    onTestCompleted: (callback) => ipcRenderer.on('automation:testCompleted', callback),
    onScreenshotCaptured: (callback) => ipcRenderer.on('screenshot:captured', callback),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  },

  // AI/MCP integration API
  ai: {
    sendMessage: (message) => ipcRenderer.invoke('ai:sendMessage', message),
    generateTest: (prompt) => ipcRenderer.invoke('ai:generateTest', prompt),
    analyzeImage: (imagePath) => ipcRenderer.invoke('ai:analyzeImage', imagePath),

    // Event listeners for AI responses
    onMessageReceived: (callback) => ipcRenderer.on('ai:messageReceived', callback),
    onTestGenerated: (callback) => ipcRenderer.on('ai:testGenerated', callback),
    onAnalysisComplete: (callback) => ipcRenderer.on('ai:analysisComplete', callback)
  },

  // Sidecar/iPad Pro integration API
  sidecar: {
    enable: () => ipcRenderer.invoke('sidecar:enable'),
    disable: () => ipcRenderer.invoke('sidecar:disable'),
    getStatus: () => ipcRenderer.invoke('sidecar:getStatus'),

    // Event listeners for sidecar events
    onStatusChanged: (callback) => ipcRenderer.on('sidecar:statusChanged', callback),
    onEnabled: (callback) => ipcRenderer.on('sidecar:enabled', callback),
    onDisabled: (callback) => ipcRenderer.on('sidecar:disabled', callback)
  },

  // Window management API
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    close: () => ipcRenderer.invoke('window:close'),
    toggleFloatingPanel: () => ipcRenderer.invoke('window:toggleFloatingPanel'),

    // Navigation events from menu
    onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
    onNewBrowser: (callback) => ipcRenderer.on('automation:newBrowser', callback),
    onQuickTest: (callback) => ipcRenderer.on('automation:quickTest', callback),
    onOpenChat: (callback) => ipcRenderer.on('ai:openChat', callback),
    onAnalyzePage: (callback) => ipcRenderer.on('ai:analyzePage', callback),
    onGenerateTests: (callback) => ipcRenderer.on('ai:generateTests', callback),
    onSyncBrowser: (callback) => ipcRenderer.on('sidecar:syncBrowser', callback),
    onMirrorTest: (callback) => ipcRenderer.on('sidecar:mirrorTest', callback)
  },

  // Utility functions
  utils: {
    // Safe file operations
    selectFile: () => ipcRenderer.invoke('utils:selectFile'),
    saveFile: (data, filename) => ipcRenderer.invoke('utils:saveFile', data, filename),

    // Notifications
    showNotification: (title, body) => ipcRenderer.invoke('utils:showNotification', title, body),

    // System information
    getSystemInfo: () => ipcRenderer.invoke('utils:getSystemInfo')
  },

  // Development and debugging
  dev: {
    openDevTools: () => ipcRenderer.invoke('dev:openDevTools'),
    reloadWindow: () => ipcRenderer.invoke('dev:reloadWindow'),

    // Only available in development mode
    isDevMode: () => ipcRenderer.invoke('dev:isDevMode')
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also expose a version check
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});

// Expose environment info
contextBridge.exposeInMainWorld('platform', {
  isDarwin: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});

// Security: Log any attempts to access Node.js APIs
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔒 Electron preload script loaded safely');
  console.log('🖥️ Platform:', process.platform);
  console.log('⚡ Electron version:', process.versions.electron);
});

// Prevent any unauthorized access to Node.js APIs
delete window.require;
delete window.exports;
delete window.module;