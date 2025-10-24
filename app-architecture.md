# Spark Bloom Flow - Native macOS App Architecture

## Overview

A native macOS application built with Electron that provides a professional interface for browser automation, AI-powered testing, and real-time Claude integration. Optimized for M4 MacBook Air + iPad Pro ecosystem.

## Core Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    macOS Native App                         │
├─────────────────────────────────────────────────────────────┤
│  Electron Main Process (Node.js)                           │
│  ├── Window Management                                      │
│  ├── Menu Bar Integration                                   │
│  ├── System Tray                                           │
│  ├── File System Access                                     │
│  └── Native macOS APIs                                      │
├─────────────────────────────────────────────────────────────┤
│  Electron Renderer Process (React)                         │
│  ├── React 18 + TypeScript                                 │
│  ├── Tailwind CSS + Radix UI                               │
│  ├── Framer Motion                                         │
│  └── Apple Design System Components                        │
├─────────────────────────────────────────────────────────────┤
│  Backend Services Layer                                     │
│  ├── MCP Integration (claude-multi-ai)                     │
│  ├── Browser Automation (Playwright)                       │
│  ├── AI Test Orchestration                                 │
│  ├── Visual Diff Engine                                    │
│  └── Apple Ecosystem Integration                           │
├─────────────────────────────────────────────────────────────┤
│  Native macOS Integration                                   │
│  ├── Sidecar API                                           │
│  ├── Universal Control                                     │
│  ├── Screenshot API                                        │
│  ├── Notification Center                                   │
│  └── Dock Integration                                       │
└─────────────────────────────────────────────────────────────┘
```

### Application Structure

```
spark-bloom-flow-app/
├── package.json
├── electron/
│   ├── main.js                    # Electron main process
│   ├── preload.js                 # Context bridge
│   ├── menu.js                    # Native menu bar
│   ├── tray.js                    # System tray management
│   ├── windows/
│   │   ├── main-window.js         # Primary app window
│   │   ├── floating-panel.js      # Floating control panel
│   │   ├── browser-viewer.js      # Browser preview window
│   │   └── ai-chat.js            # Claude chat interface
│   └── services/
│       ├── automation-service.js  # Browser automation bridge
│       ├── mcp-service.js         # MCP integration service
│       ├── sidecar-service.js     # iPad Pro integration
│       └── screenshot-service.js  # Native screenshot capture
├── src/
│   ├── components/
│   │   ├── ui/                    # Apple Design System components
│   │   ├── automation/            # Browser automation controls
│   │   ├── ai-chat/              # Claude interface
│   │   ├── dashboard/            # Main control dashboard
│   │   ├── browser-viewer/       # Embedded browser viewer
│   │   └── settings/             # App configuration
│   ├── hooks/
│   │   ├── useElectronAPI.ts     # Electron IPC bridge
│   │   ├── useAutomation.ts      # Browser automation state
│   │   ├── useMCPIntegration.ts  # MCP connection management
│   │   └── useSidecar.ts         # iPad Pro integration
│   ├── services/
│   │   ├── automation-client.ts   # Frontend automation client
│   │   ├── ai-client.ts          # AI service client
│   │   └── storage.ts            # Local data management
│   └── types/
│       ├── automation.ts         # Automation type definitions
│       ├── ai.ts                 # AI service types
│       └── electron.ts           # Electron API types
├── scripts/                      # Existing automation scripts
└── dist-electron/               # Built Electron app
```

## User Interface Design

### Main Application Window

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●   Spark Bloom Flow                            ⚙️ 👤  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Automation Studio          📊 AI Insights              │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │ 🌐 Browser Sessions     │   │ 🤖 Claude Integration   │  │
│  │ ├── MacBook Chrome ●   │   │ ├── Test Analysis      │  │
│  │ ├── iPad Safari ●      │   │ ├── Code Generation    │  │
│  │ └── + New Session      │   │ └── Recommendations    │  │
│  │                        │   │                        │  │
│  │ 📸 Screenshots         │   │ 📈 Performance         │  │
│  │ ├── Full Page ▶️       │   │ ├── Core Vitals: 95%   │  │
│  │ ├── Selection ▶️       │   │ ├── Bundle: 2.1MB      │  │
│  │ └── Sequence ▶️        │   │ └── Tests: 47/50 ✅    │  │
│  │                        │   │                        │  │
│  │ 🧪 Test Orchestration  │   │ 🎨 Visual Diffs        │  │
│  │ ├── Generate Tests ▶️  │   │ ├── 3 New Changes      │  │
│  │ ├── Run Suite ▶️       │   │ ├── 12 Reviewed ✅     │  │
│  │ └── AI Analysis ▶️     │   │ └── Export Report ▶️   │  │
│  └─────────────────────────┘   └─────────────────────────┘  │
│                                                             │
│  💬 Claude Chat Interface                                   │
│  ┌─────────────────────────────────────────────────────────┤
│  │ 🤖 Ready to help with automation and testing            │
│  │                                                         │
│  │ 💭 Ask me to:                                           │
│  │    • Analyze your application's UI/UX                   │
│  │    • Generate intelligent test scenarios                │
│  │    • Review browser automation results                  │
│  │    • Optimize performance based on metrics              │
│  │                                                         │
│  │ Type your message...                           📎 ▶️    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### Floating Control Panel (Always on Top)

```
┌─────────────────────────────┐
│ 🎯 Automation Controls      │
├─────────────────────────────┤
│ 📸 Screenshot    [Cmd+Shift+4] │
│ 🌐 New Browser  [Cmd+B]    │
│ 🤖 Ask Claude   [Cmd+/]    │
│ 📊 AI Analysis  [Cmd+A]    │
│ ⚡ Quick Test   [Cmd+T]    │
├─────────────────────────────┤
│ Status: Ready ●             │
│ iPad: Connected ●           │
│ Claude: Online ●            │
└─────────────────────────────┘
```

## Core Features

### 1. Browser Automation Studio

- **Multi-Device Browser Management**
  - Control browsers on MacBook Air and iPad Pro simultaneously
  - Sync navigation and testing actions across devices
  - Real-time viewport comparison and responsive testing

- **Intelligent Screenshot Capture**
  - Native macOS screenshot integration
  - Full page, selection, and window capture modes
  - Automated screenshot sequences for user flows
  - Direct integration with AI analysis

- **Visual Regression Testing**
  - Pixel-perfect comparison engine
  - AI-powered difference explanation
  - Batch comparison across device types
  - Automated reporting and notifications

### 2. AI-Powered Test Orchestration

- **Claude Integration**
  - Real-time chat interface for test guidance
  - Natural language test generation
  - Code review and optimization suggestions
  - Performance analysis and recommendations

- **MCP Integration (claude-multi-ai)**
  - Multi-provider AI routing
  - Cost optimization across different AI models
  - Specialized AI agents for different testing domains
  - Intelligent fallback and load balancing

- **Autonomous Test Generation**
  - Application structure analysis
  - Critical path identification
  - Accessibility compliance testing
  - Performance optimization recommendations

### 3. Apple Ecosystem Integration

- **iPad Pro Sidecar Integration**
  - Automatic Sidecar setup and management
  - Dual-display testing workflows
  - Mobile-first development environment
  - Universal Control for seamless interaction

- **Native macOS Features**
  - Menu bar integration with global shortcuts
  - System tray for quick access
  - Notification Center integration
  - Dock progress indicators

- **M4 Optimization**
  - Native performance monitoring
  - Efficient resource utilization
  - Hardware-accelerated visual processing
  - Energy-efficient background operations

## Implementation Plan

### Phase 1: Electron Foundation

```javascript
// package.json
{
  "name": "spark-bloom-flow-app",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:dist": "electron-builder --publish=never"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0",
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0"
  }
}
```

### Phase 2: Main Process Architecture

```javascript
// electron/main.js
import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import { AutomationService } from './services/automation-service.js';
import { MCPService } from './services/mcp-service.js';
import { SidecarService } from './services/sidecar-service.js';

class SparkBloomFlowApp {
  constructor() {
    this.mainWindow = null;
    this.floatingPanel = null;
    this.tray = null;
    this.services = {
      automation: new AutomationService(),
      mcp: new MCPService(),
      sidecar: new SidecarService()
    };
  }

  async initialize() {
    await this.createMainWindow();
    await this.createFloatingPanel();
    await this.setupMenuBar();
    await this.setupSystemTray();
    await this.initializeServices();
    await this.setupIPCHandlers();
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }

  async initializeServices() {
    await this.services.automation.initialize();
    await this.services.mcp.initialize();
    await this.services.sidecar.initialize();
  }
}
```

### Phase 3: React Frontend Integration

```typescript
// src/hooks/useElectronAPI.ts
import { useEffect, useState } from 'react';

interface ElectronAPI {
  automation: {
    startBrowser: (config: BrowserConfig) => Promise<string>;
    takeScreenshot: (options: ScreenshotOptions) => Promise<string>;
    runTest: (testConfig: TestConfig) => Promise<TestResult>;
  };
  mcp: {
    sendMessage: (message: string) => Promise<string>;
    generateTest: (prompt: string) => Promise<TestCode>;
    analyzeImage: (imagePath: string) => Promise<Analysis>;
  };
  sidecar: {
    enable: () => Promise<boolean>;
    disable: () => Promise<boolean>;
    getStatus: () => Promise<SidecarStatus>;
  };
}

export function useElectronAPI(): ElectronAPI | null {
  const [api, setApi] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      setApi(window.electronAPI);
    }
  }, []);

  return api;
}
```

### Phase 4: UI Components

```typescript
// src/components/dashboard/AutomationStudio.tsx
import React from 'react';
import { BrowserSessionManager } from './BrowserSessionManager';
import { ScreenshotControls } from './ScreenshotControls';
import { TestOrchestrator } from './TestOrchestrator';
import { useElectronAPI } from '@/hooks/useElectronAPI';

export function AutomationStudio() {
  const electronAPI = useElectronAPI();

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <div className="space-y-6">
        <BrowserSessionManager api={electronAPI?.automation} />
        <ScreenshotControls api={electronAPI?.automation} />
        <TestOrchestrator api={electronAPI?.automation} />
      </div>

      <div className="space-y-6">
        <ClaudeIntegration api={electronAPI?.mcp} />
        <PerformanceDashboard />
        <VisualDiffViewer />
      </div>
    </div>
  );
}
```

## Security & Privacy

### Data Protection
- All automation data stored locally
- Encrypted configuration storage
- Secure API key management
- Optional cloud sync with end-to-end encryption

### macOS Permissions
- Screen Recording permission for screenshots
- Accessibility permission for UI automation
- Camera/Microphone permissions for iPad integration
- Network access for AI services

### AI Privacy
- Local processing when possible
- Configurable AI provider selection
- Data retention controls
- Anonymization options for shared data

## Development Workflow

### Setup Process
1. Clone repository
2. Install dependencies: `npm install`
3. Configure MCP integration
4. Run development: `npm run electron:dev`
5. Build for distribution: `npm run electron:build`

### Testing Strategy
- Unit tests for React components
- Integration tests for Electron services
- E2E tests for full automation workflows
- Manual testing on M4 devices

### Distribution
- Code signing for macOS
- Notarization for Gatekeeper
- Auto-updater integration
- Mac App Store submission ready

## Advanced Features

### AI Assistants
- **Test Generator**: Creates comprehensive test suites
- **UI Analyzer**: Reviews interface design and usability
- **Performance Optimizer**: Identifies bottlenecks and solutions
- **Accessibility Auditor**: Ensures WCAG compliance

### Automation Workflows
- **Smart Recording**: AI-powered user action recording
- **Cross-Device Sync**: Coordinate actions across MacBook and iPad
- **Visual Validation**: Automated UI regression detection
- **Performance Monitoring**: Real-time Web Vitals tracking

### Professional Tools
- **Test Report Generator**: Beautiful, shareable reports
- **CI/CD Integration**: GitHub Actions and pipeline support
- **Team Collaboration**: Share automation scripts and results
- **Enterprise Features**: SSO, audit logs, centralized management

This architecture provides a solid foundation for a professional macOS application that leverages all the browser automation and AI capabilities we've built, optimized specifically for the M4 ecosystem.