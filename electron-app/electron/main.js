import { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, globalShortcut, screen } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';

// Services
import { AutomationService } from './services/automation-service.js';
import { MCPService } from './services/mcp-service.js';
import { SidecarService } from './services/sidecar-service.js';
import { ScreenshotService } from './services/screenshot-service.js';

// Development Hub Services (in JavaScript for now)
// Note: These would be converted to JS or imported differently in production
const { ProjectManager } = await import('../src/services/project-manager.ts').catch(() => ({ ProjectManager: null }));
const { EnhancedMCPClient } = await import('../src/services/enhanced-mcp-client.ts').catch(() => ({ EnhancedMCPClient: null }));
const { FoundationModelsService } = await import('../src/services/foundation-models.ts').catch(() => ({ FoundationModelsService: null }));
const { AssetCreationStudio } = await import('../src/services/asset-creation-studio.ts').catch(() => ({ AssetCreationStudio: null }));
const { PlatformIntegrationsService } = await import('../src/services/platform-integrations.ts').catch(() => ({ PlatformIntegrationsService: null }));
const { DevOpsManager } = await import('../src/services/devops-manager.ts').catch(() => ({ DevOpsManager: null }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App configuration
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const store = new Store();

class BeProductiveCodingFramework {
    constructor() {
        this.mainWindow = null;
        this.floatingPanel = null;
        this.tray = null;
        this.isQuitting = false;

        // Initialize services
        this.services = {
            automation: new AutomationService(),
            mcp: new MCPService(),
            sidecar: new SidecarService(),
            screenshot: new ScreenshotService()
        };

        // Initialize Development Hub services if available
        this.hubServices = {};
        this.initializeHubServices();

        // Bind methods
        this.createMainWindow = this.createMainWindow.bind(this);
        this.createFloatingPanel = this.createFloatingPanel.bind(this);
        this.setupMenuBar = this.setupMenuBar.bind(this);
        this.setupSystemTray = this.setupSystemTray.bind(this);
    }

    async initializeHubServices() {
        console.log('🏗️ Initializing Development Hub services...');

        try {
            // Initialize project manager
            if (ProjectManager) {
                this.hubServices.projectManager = new ProjectManager();
                console.log('✅ Project Manager initialized');
            }

            // Initialize enhanced MCP client
            if (EnhancedMCPClient) {
                this.hubServices.enhancedMCP = new EnhancedMCPClient();
                console.log('✅ Enhanced MCP Client initialized');
            }

            // Initialize Foundation Models service
            if (FoundationModelsService) {
                this.hubServices.foundationModels = new FoundationModelsService();
                await this.hubServices.foundationModels.initialize();
                console.log('✅ Foundation Models Service initialized');
            }

            // Initialize Asset Creation Studio
            if (AssetCreationStudio) {
                this.hubServices.assetStudio = new AssetCreationStudio();
                await this.hubServices.assetStudio.initialize();
                console.log('✅ Asset Creation Studio initialized');
            }

            // Initialize Platform Integrations
            if (PlatformIntegrationsService) {
                this.hubServices.platformIntegrations = new PlatformIntegrationsService();
                await this.hubServices.platformIntegrations.initialize();
                console.log('✅ Platform Integrations initialized');
            }

            // Initialize DevOps Manager
            if (DevOpsManager && this.hubServices.platformIntegrations && this.hubServices.foundationModels) {
                this.hubServices.devOps = new DevOpsManager(
                    this.hubServices.platformIntegrations,
                    this.hubServices.foundationModels
                );
                await this.hubServices.devOps.initialize();
                console.log('✅ DevOps Manager initialized');
            }

            console.log('🎉 Development Hub services initialization complete');

        } catch (error) {
            console.warn('⚠️ Some Development Hub services failed to initialize:', error.message);
            // Continue with basic services if hub services fail
        }
    }

    async initialize() {
        console.log('🚀 Initializing BeProductive Coding Framework...');

        // Set up app event listeners
        app.whenReady().then(async () => {
            await this.createMainWindow();
            await this.createFloatingPanel();
            await this.setupMenuBar();
            await this.setupSystemTray();
            await this.setupGlobalShortcuts();
            await this.initializeServices();
            await this.setupIPCHandlers();

            console.log('✅ App initialization complete');
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });

        app.on('before-quit', () => {
            this.isQuitting = true;
        });
    }

    async createMainWindow() {
        console.log('🪟 Creating main window...');

        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1200,
            minHeight: 800,
            titleBarStyle: 'hiddenInset',
            vibrancy: 'under-window',
            backgroundColor: '#1a1a1a',
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // Load app content
        if (isDev) {
            try {
                console.log('📡 Loading development server at http://localhost:5173');
                await this.mainWindow.loadURL('http://localhost:5173');
                this.mainWindow.webContents.openDevTools();
                console.log('✅ Development server loaded successfully');
            } catch (error) {
                console.error('❌ Failed to load development server:', error);
                console.log('⏳ Retrying in 2 seconds...');
                setTimeout(async () => {
                    try {
                        await this.mainWindow.loadURL('http://localhost:5173');
                        console.log('✅ Development server loaded on retry');
                    } catch (retryError) {
                        console.error('❌ Retry failed:', retryError);
                    }
                }, 2000);
            }
        } else {
            await this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }

        // Window event handlers
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            console.log('✅ Main window ready');
        });

        this.mainWindow.on('close', (event) => {
            if (!this.isQuitting && process.platform === 'darwin') {
                event.preventDefault();
                this.mainWindow.hide();
            }
        });

        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    async createFloatingPanel() {
        console.log('🎛️ Creating floating control panel...');

        this.floatingPanel = new BrowserWindow({
            width: 280,
            height: 400,
            alwaysOnTop: true,
            skipTaskbar: true,
            frame: false,
            resizable: false,
            transparent: true,
            vibrancy: 'popover',
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // Position in top-right corner
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        this.floatingPanel.setPosition(width - 300, 50);

        if (isDev) {
            await this.floatingPanel.loadURL('http://localhost:5173/floating-panel');
        } else {
            await this.floatingPanel.loadFile(path.join(__dirname, '../dist/floating-panel.html'));
        }

        this.floatingPanel.on('blur', () => {
            // Auto-hide when focus is lost
            setTimeout(() => {
                if (this.floatingPanel && !this.floatingPanel.isFocused()) {
                    this.floatingPanel.hide();
                }
            }, 1000);
        });

        console.log('✅ Floating panel ready');
    }

    async setupMenuBar() {
        console.log('📋 Setting up menu bar...');

        const template = [
            {
                label: 'BeProductive',
                submenu: [
                    {
                        label: 'About BeProductive Coding Framework',
                        click: () => this.showAboutDialog()
                    },
                    { type: 'separator' },
                    {
                        label: 'Preferences...',
                        accelerator: 'Cmd+,',
                        click: () => this.showPreferences()
                    },
                    { type: 'separator' },
                    {
                        label: 'Hide BeProductive',
                        accelerator: 'Cmd+H',
                        role: 'hide'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Cmd+Alt+H',
                        role: 'hideothers'
                    },
                    {
                        label: 'Show All',
                        role: 'unhide'
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: 'Cmd+Q',
                        click: () => app.quit()
                    }
                ]
            },
            {
                label: 'Automation',
                submenu: [
                    {
                        label: 'New Browser Session',
                        accelerator: 'Cmd+B',
                        click: () => this.newBrowserSession()
                    },
                    {
                        label: 'Take Screenshot',
                        accelerator: 'Cmd+Shift+4',
                        click: () => this.takeScreenshot()
                    },
                    {
                        label: 'Run Quick Test',
                        accelerator: 'Cmd+T',
                        click: () => this.runQuickTest()
                    },
                    { type: 'separator' },
                    {
                        label: 'Show Floating Panel',
                        accelerator: 'Cmd+Ctrl+P',
                        click: () => this.toggleFloatingPanel()
                    }
                ]
            },
            {
                label: 'AI',
                submenu: [
                    {
                        label: 'Chat with Claude',
                        accelerator: 'Cmd+/',
                        click: () => this.openClaudeChat()
                    },
                    {
                        label: 'Analyze Current Page',
                        accelerator: 'Cmd+A',
                        click: () => this.analyzeCurrentPage()
                    },
                    {
                        label: 'Generate Tests',
                        click: () => this.generateTests()
                    }
                ]
            },
            {
                label: 'iPad Pro',
                submenu: [
                    {
                        label: 'Enable Sidecar',
                        click: () => this.enableSidecar()
                    },
                    {
                        label: 'Disable Sidecar',
                        click: () => this.disableSidecar()
                    },
                    { type: 'separator' },
                    {
                        label: 'Sync Browser Session',
                        click: () => this.syncBrowserSession()
                    },
                    {
                        label: 'Mirror Testing',
                        click: () => this.startMirrorTesting()
                    }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Minimize',
                        accelerator: 'Cmd+M',
                        role: 'minimize'
                    },
                    {
                        label: 'Close',
                        accelerator: 'Cmd+W',
                        role: 'close'
                    },
                    { type: 'separator' },
                    {
                        label: 'Bring All to Front',
                        role: 'front'
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Documentation',
                        click: () => shell.openExternal('https://docs.sparkbloomflow.com')
                    },
                    {
                        label: 'Report Issue',
                        click: () => shell.openExternal('https://github.com/sparkbloomflow/issues')
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        console.log('✅ Menu bar configured');
    }

    async setupSystemTray() {
        console.log('🔄 Setting up system tray...');

        try {
            // For development, we'll skip the tray to avoid icon issues
            if (isDev) {
                console.log('⚠️ Skipping system tray in development mode');
                return;
            }

            // In production, attempt to create tray with a simple template icon
            try {
                // Use Electron's built-in nativeImage to create a simple template icon
                const { nativeImage } = await import('electron');
                const icon = nativeImage.createEmpty();
                this.tray = new Tray(icon);
            } catch (error) {
                console.warn('⚠️ Could not create system tray:', error.message);
                return;
            }
        } catch (error) {
            console.warn('⚠️ System tray setup failed:', error.message);
            return;
        }

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show BeProductive',
                click: () => {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                }
            },
            {
                label: 'Floating Panel',
                click: () => this.toggleFloatingPanel()
            },
            { type: 'separator' },
            {
                label: 'Quick Screenshot',
                click: () => this.takeScreenshot()
            },
            {
                label: 'New Browser',
                click: () => this.newBrowserSession()
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);

        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip('BeProductive Coding Framework - Development Hub & AI Assistant');

        this.tray.on('click', () => {
            this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show();
        });

        console.log('✅ System tray configured');
    }

    async setupGlobalShortcuts() {
        console.log('⌨️ Setting up global shortcuts...');

        // Global shortcuts for quick actions
        globalShortcut.register('Cmd+Shift+S', () => {
            this.takeScreenshot();
        });

        globalShortcut.register('Cmd+Shift+B', () => {
            this.newBrowserSession();
        });

        globalShortcut.register('Cmd+Shift+/', () => {
            this.openClaudeChat();
        });

        globalShortcut.register('Cmd+Shift+P', () => {
            this.toggleFloatingPanel();
        });

        console.log('✅ Global shortcuts registered');
    }

    async initializeServices() {
        console.log('🔧 Initializing services...');

        try {
            await this.services.automation.initialize();
            await this.services.mcp.initialize();
            await this.services.sidecar.initialize();
            await this.services.screenshot.initialize();

            console.log('✅ All services initialized');
        } catch (error) {
            console.error('❌ Service initialization failed:', error);

            dialog.showErrorBox(
                'Service Initialization Failed',
                `Failed to initialize core services: ${error.message}`
            );
        }
    }

    async setupIPCHandlers() {
        console.log('🔗 Setting up IPC handlers...');

        // Main window communication
        ipcMain.handle('app:getVersion', () => app.getVersion());
        ipcMain.handle('app:getPlatform', () => process.platform);
        ipcMain.handle('app:quit', () => app.quit());

        // Browser automation
        ipcMain.handle('automation:startBrowser', async (event, config) => {
            return await this.services.automation.startBrowser(config);
        });

        ipcMain.handle('automation:takeScreenshot', async (event, options) => {
            return await this.services.screenshot.capture(options);
        });

        ipcMain.handle('automation:runTest', async (event, testConfig) => {
            return await this.services.automation.runTest(testConfig);
        });

        // MCP/AI integration
        ipcMain.handle('ai:sendMessage', async (event, message) => {
            return await this.services.mcp.sendMessage(message);
        });

        ipcMain.handle('ai:generateTest', async (event, prompt) => {
            return await this.services.mcp.generateTest(prompt);
        });

        ipcMain.handle('ai:analyzeImage', async (event, imagePath) => {
            return await this.services.mcp.analyzeImage(imagePath);
        });

        // Sidecar/iPad integration
        ipcMain.handle('sidecar:enable', async () => {
            return await this.services.sidecar.enable();
        });

        ipcMain.handle('sidecar:disable', async () => {
            return await this.services.sidecar.disable();
        });

        ipcMain.handle('sidecar:getStatus', async () => {
            return await this.services.sidecar.getStatus();
        });

        // Window management
        ipcMain.handle('window:minimize', () => {
            this.mainWindow.minimize();
        });

        ipcMain.handle('window:close', () => {
            this.mainWindow.close();
        });

        ipcMain.handle('window:toggleFloatingPanel', () => {
            this.toggleFloatingPanel();
        });

        // Development Hub IPC handlers
        this.setupHubIPCHandlers();

        console.log('✅ IPC handlers configured');
    }

    setupHubIPCHandlers() {
        console.log('🔗 Setting up Development Hub IPC handlers...');

        // Project Management
        ipcMain.handle('hub:getProjects', async () => {
            try {
                if (this.hubServices.projectManager) {
                    return this.hubServices.projectManager.getAllProjects();
                }
                return [];
            } catch (error) {
                console.error('Failed to get projects:', error);
                return [];
            }
        });

        ipcMain.handle('hub:createProject', async (event, config) => {
            try {
                if (this.hubServices.projectManager) {
                    const template = this.hubServices.projectManager.getProjectTemplates()
                        .find(t => t.id === config.template);
                    if (template) {
                        return await this.hubServices.projectManager.createProject(
                            template,
                            process.cwd(),
                            config.name
                        );
                    }
                }
                return { success: false, error: 'Project manager not available' };
            } catch (error) {
                console.error('Failed to create project:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:scanDirectory', async (event, dirPath) => {
            try {
                if (this.hubServices.projectManager) {
                    return await this.hubServices.projectManager.scanDirectory(dirPath);
                }
                return [];
            } catch (error) {
                console.error('Failed to scan directory:', error);
                return [];
            }
        });

        // Asset Creation Studio
        ipcMain.handle('hub:createAsset', async (event, assetRequest) => {
            try {
                if (this.hubServices.assetStudio) {
                    return await this.hubServices.assetStudio.createAsset(assetRequest);
                }
                return { success: false, error: 'Asset studio not available' };
            } catch (error) {
                console.error('Failed to create asset:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:getAssetLibraries', async () => {
            try {
                if (this.hubServices.assetStudio) {
                    return await this.hubServices.assetStudio.getLibraries();
                }
                return [];
            } catch (error) {
                console.error('Failed to get asset libraries:', error);
                return [];
            }
        });

        // Foundation Models / M4 Optimization
        ipcMain.handle('hub:optimizeProject', async (event, config) => {
            try {
                if (this.hubServices.foundationModels && this.hubServices.projectManager) {
                    const project = this.hubServices.projectManager.getProject(config.projectId);
                    if (project) {
                        return await this.hubServices.foundationModels.optimizeCode({
                            id: `opt_${Date.now()}`,
                            type: config.optimizationType || 'm4_acceleration',
                            project,
                            input: {}
                        });
                    }
                }
                return { success: false, error: 'Optimization service not available' };
            } catch (error) {
                console.error('Failed to optimize project:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:getM4Capabilities', async () => {
            try {
                if (this.hubServices.foundationModels) {
                    return await this.hubServices.foundationModels.getCapabilities();
                }
                return { isM4Supported: false };
            } catch (error) {
                console.error('Failed to get M4 capabilities:', error);
                return { isM4Supported: false };
            }
        });

        // Platform Integrations
        ipcMain.handle('hub:getGitHubData', async () => {
            try {
                if (this.hubServices.platformIntegrations) {
                    return this.hubServices.platformIntegrations.getGitHubData();
                }
                return { repositories: [], organizations: [] };
            } catch (error) {
                console.error('Failed to get GitHub data:', error);
                return { repositories: [], organizations: [] };
            }
        });

        ipcMain.handle('hub:connectGitHub', async (event, token) => {
            try {
                if (this.hubServices.platformIntegrations) {
                    return await this.hubServices.platformIntegrations.connectGitHub(token);
                }
                return { success: false, error: 'Platform integrations not available' };
            } catch (error) {
                console.error('Failed to connect GitHub:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:connectSupabase', async (event, config) => {
            try {
                if (this.hubServices.platformIntegrations) {
                    return await this.hubServices.platformIntegrations.connectSupabase(
                        config.projectId,
                        config.apiKey,
                        config.url
                    );
                }
                return { success: false, error: 'Platform integrations not available' };
            } catch (error) {
                console.error('Failed to connect Supabase:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:connectIONOS', async (event, apiKey) => {
            try {
                if (this.hubServices.platformIntegrations) {
                    return await this.hubServices.platformIntegrations.connectIONOS(apiKey);
                }
                return { success: false, error: 'Platform integrations not available' };
            } catch (error) {
                console.error('Failed to connect IONOS:', error);
                return { success: false, error: error.message };
            }
        });

        // DevOps Management
        ipcMain.handle('hub:getPipelines', async () => {
            try {
                if (this.hubServices.devOps) {
                    return this.hubServices.devOps.getAllPipelines();
                }
                return [];
            } catch (error) {
                console.error('Failed to get pipelines:', error);
                return [];
            }
        });

        ipcMain.handle('hub:getEnvironments', async () => {
            try {
                if (this.hubServices.devOps) {
                    return this.hubServices.devOps.getAllEnvironments();
                }
                return [];
            } catch (error) {
                console.error('Failed to get environments:', error);
                return [];
            }
        });

        ipcMain.handle('hub:createPipeline', async (event, config) => {
            try {
                if (this.hubServices.devOps && this.hubServices.projectManager) {
                    const project = this.hubServices.projectManager.getProject(config.projectId);
                    if (project) {
                        return await this.hubServices.devOps.createPipeline(project, config.name);
                    }
                }
                return { success: false, error: 'DevOps service not available' };
            } catch (error) {
                console.error('Failed to create pipeline:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:runPipeline', async (event, pipelineId) => {
            try {
                if (this.hubServices.devOps) {
                    return await this.hubServices.devOps.runPipeline(pipelineId);
                }
                return { success: false, error: 'DevOps service not available' };
            } catch (error) {
                console.error('Failed to run pipeline:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:deployProject', async (event, config) => {
            try {
                if (this.hubServices.platformIntegrations && this.hubServices.projectManager) {
                    const project = this.hubServices.projectManager.getProject(config.projectId);
                    if (project) {
                        return await this.hubServices.platformIntegrations.deployProject(project, config.environment);
                    }
                }
                return { success: false, error: 'Deployment service not available' };
            } catch (error) {
                console.error('Failed to deploy project:', error);
                return { success: false, error: error.message };
            }
        });

        // Enhanced MCP/AI Integration
        ipcMain.handle('hub:generateCode', async (event, task) => {
            try {
                if (this.hubServices.enhancedMCP) {
                    return await this.hubServices.enhancedMCP.generateCode(task);
                }
                return { success: false, error: 'Enhanced MCP not available' };
            } catch (error) {
                console.error('Failed to generate code:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:reviewCode', async (event, task) => {
            try {
                if (this.hubServices.enhancedMCP) {
                    return await this.hubServices.enhancedMCP.reviewCode(task);
                }
                return { success: false, error: 'Enhanced MCP not available' };
            } catch (error) {
                console.error('Failed to review code:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('hub:generateTests', async (event, code, language, framework) => {
            try {
                if (this.hubServices.enhancedMCP) {
                    return await this.hubServices.enhancedMCP.generateTests(code, language, framework);
                }
                return { success: false, error: 'Enhanced MCP not available' };
            } catch (error) {
                console.error('Failed to generate tests:', error);
                return { success: false, error: error.message };
            }
        });

        // System Info
        ipcMain.handle('hub:getSystemInfo', async () => {
            return {
                platform: process.platform,
                arch: process.arch,
                version: app.getVersion(),
                electronVersion: process.versions.electron,
                nodeVersion: process.versions.node,
                chromeVersion: process.versions.chrome,
                isM4: process.platform === 'darwin' && process.arch === 'arm64',
                servicesStatus: {
                    projectManager: !!this.hubServices.projectManager,
                    foundationModels: !!this.hubServices.foundationModels,
                    assetStudio: !!this.hubServices.assetStudio,
                    platformIntegrations: !!this.hubServices.platformIntegrations,
                    devOps: !!this.hubServices.devOps,
                    enhancedMCP: !!this.hubServices.enhancedMCP
                }
            };
        });

        console.log('✅ Development Hub IPC handlers configured');
    }

    // Menu action handlers
    showAboutDialog() {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About BeProductive Coding Framework',
            message: 'BeProductive Coding Framework',
            detail: `Version ${app.getVersion()}\n\nYour Personal AI-Powered Development Environment.\nComplete offline-first development hub optimized for M4 MacBook Air + iPad Pro.`
        });
    }

    showPreferences() {
        // TODO: Implement preferences window
        this.mainWindow.webContents.send('navigate-to', '/settings');
    }

    newBrowserSession() {
        this.mainWindow.webContents.send('automation:newBrowser');
    }

    async takeScreenshot() {
        try {
            const result = await this.services.screenshot.capture({ type: 'selection' });
            this.mainWindow.webContents.send('screenshot:captured', result);
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    }

    runQuickTest() {
        this.mainWindow.webContents.send('automation:quickTest');
    }

    toggleFloatingPanel() {
        if (this.floatingPanel) {
            if (this.floatingPanel.isVisible()) {
                this.floatingPanel.hide();
            } else {
                this.floatingPanel.show();
                this.floatingPanel.focus();
            }
        }
    }

    openClaudeChat() {
        this.mainWindow.webContents.send('ai:openChat');
        this.mainWindow.show();
        this.mainWindow.focus();
    }

    analyzeCurrentPage() {
        this.mainWindow.webContents.send('ai:analyzePage');
    }

    generateTests() {
        this.mainWindow.webContents.send('ai:generateTests');
    }

    async enableSidecar() {
        try {
            const result = await this.services.sidecar.enable();
            if (result.success) {
                this.mainWindow.webContents.send('sidecar:enabled');
            }
        } catch (error) {
            console.error('Sidecar enable failed:', error);
        }
    }

    async disableSidecar() {
        try {
            const result = await this.services.sidecar.disable();
            if (result.success) {
                this.mainWindow.webContents.send('sidecar:disabled');
            }
        } catch (error) {
            console.error('Sidecar disable failed:', error);
        }
    }

    syncBrowserSession() {
        this.mainWindow.webContents.send('sidecar:syncBrowser');
    }

    startMirrorTesting() {
        this.mainWindow.webContents.send('sidecar:mirrorTest');
    }
}

// Initialize and start the application
const beProductiveApp = new BeProductiveCodingFramework();
beProductiveApp.initialize().catch(console.error);

// Export for testing
export { BeProductiveCodingFramework };