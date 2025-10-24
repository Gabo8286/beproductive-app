import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Browser Automation Service
 *
 * Bridges the Electron app with the existing browser automation scripts
 * Provides a clean API for the frontend to control browser sessions,
 * screenshots, and test execution.
 */
export class AutomationService {
    constructor() {
        this.activeSessions = new Map();
        this.scriptsPath = this.findScriptsPath();
        this.sessionCounter = 0;
    }

    async initialize() {
        console.log('🔧 Initializing Automation Service...');

        try {
            // Verify that automation scripts exist
            if (!this.scriptsPath) {
                throw new Error('Browser automation scripts not found');
            }

            // Test script accessibility
            const testScript = path.join(this.scriptsPath, 'interactive-browser.js');
            if (!fs.existsSync(testScript)) {
                throw new Error(`Required script not found: ${testScript}`);
            }

            console.log(`📁 Scripts path: ${this.scriptsPath}`);
            console.log('✅ Automation Service initialized');

            return { success: true };
        } catch (error) {
            console.error('❌ Automation Service initialization failed:', error);
            throw error;
        }
    }

    findScriptsPath() {
        // Look for the scripts directory relative to the electron app
        const possiblePaths = [
            path.join(__dirname, '../../../scripts'),
            path.join(__dirname, '../../scripts'),
            path.join(__dirname, '../scripts'),
            path.join(process.cwd(), 'scripts'),
            path.join(process.cwd(), '../scripts')
        ];

        for (const scriptsPath of possiblePaths) {
            if (fs.existsSync(scriptsPath)) {
                const testFile = path.join(scriptsPath, 'interactive-browser.js');
                if (fs.existsSync(testFile)) {
                    return scriptsPath;
                }
            }
        }

        return null;
    }

    async startBrowser(config = {}) {
        console.log('🌐 Starting browser session...');

        const sessionId = `session_${++this.sessionCounter}`;
        const defaultConfig = {
            browser: 'chrome',
            headless: false,
            viewport: { width: 1440, height: 900 },
            url: 'https://localhost:5173',
            device: config.device || 'desktop',
            ...config
        };

        try {
            // Launch browser using the interactive-browser script
            const scriptPath = path.join(this.scriptsPath, 'interactive-browser.js');
            const args = ['launch', `--browser=${defaultConfig.browser}`];

            if (defaultConfig.url) {
                args.push(`--url=${defaultConfig.url}`);
            }

            if (defaultConfig.device === 'mobile') {
                args.push('--mobile');
            }

            const browserProcess = spawn('node', [scriptPath, ...args], {
                cwd: this.scriptsPath,
                stdio: 'pipe'
            });

            // Store session info
            this.activeSessions.set(sessionId, {
                id: sessionId,
                process: browserProcess,
                config: defaultConfig,
                startTime: Date.now(),
                status: 'starting'
            });

            // Handle process events
            browserProcess.stdout.on('data', (data) => {
                console.log(`Browser stdout (${sessionId}):`, data.toString());
                this.updateSessionStatus(sessionId, 'ready');
            });

            browserProcess.stderr.on('data', (data) => {
                console.error(`Browser stderr (${sessionId}):`, data.toString());
            });

            browserProcess.on('close', (code) => {
                console.log(`Browser process closed (${sessionId}):`, code);
                this.activeSessions.delete(sessionId);
            });

            console.log(`✅ Browser session started: ${sessionId}`);

            return {
                success: true,
                sessionId: sessionId,
                config: defaultConfig
            };

        } catch (error) {
            console.error('❌ Failed to start browser session:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    updateSessionStatus(sessionId, status) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.status = status;
            session.lastUpdate = Date.now();
        }
    }

    async takeScreenshot(options = {}) {
        console.log('📸 Taking screenshot...');

        const defaultOptions = {
            type: 'fullPage',
            quality: 90,
            format: 'png',
            ...options
        };

        try {
            // Use the screenshot-capture script
            const scriptPath = path.join(this.scriptsPath, 'screenshot-capture.js');
            const command = `node "${scriptPath}" ${defaultOptions.type}`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 10000
            });

            const screenshotData = JSON.parse(result);

            console.log('✅ Screenshot captured');

            return {
                success: true,
                ...screenshotData,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Screenshot failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async runTest(testConfig) {
        console.log('🧪 Running test...');

        const defaultConfig = {
            type: 'quick',
            url: 'http://localhost:5173',
            ...testConfig
        };

        try {
            let scriptPath;
            let args = [];

            switch (defaultConfig.type) {
                case 'quick':
                    scriptPath = path.join(this.scriptsPath, 'browser-automation-orchestrator.js');
                    args = ['dashboard'];
                    break;

                case 'performance':
                    scriptPath = path.join(this.scriptsPath, 'browser-automation-orchestrator.js');
                    args = ['performance'];
                    break;

                case 'accessibility':
                    scriptPath = path.join(this.scriptsPath, 'browser-automation-orchestrator.js');
                    args = ['accessibility'];
                    break;

                case 'ai-generated':
                    scriptPath = path.join(this.scriptsPath, 'ai-test-orchestrator.js');
                    args = [];
                    break;

                default:
                    throw new Error(`Unknown test type: ${defaultConfig.type}`);
            }

            const command = `node "${scriptPath}" ${args.join(' ')}`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 60000 // 1 minute timeout
            });

            console.log('✅ Test completed');

            return {
                success: true,
                type: defaultConfig.type,
                output: result,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            return {
                success: false,
                error: error.message,
                type: defaultConfig.type
            };
        }
    }

    async getActiveSessions() {
        const sessions = Array.from(this.activeSessions.values()).map(session => ({
            id: session.id,
            config: session.config,
            status: session.status,
            startTime: session.startTime,
            lastUpdate: session.lastUpdate
        }));

        return { success: true, sessions };
    }

    async closeSession(sessionId) {
        console.log(`🔚 Closing browser session: ${sessionId}`);

        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        try {
            // Terminate the browser process
            session.process.kill('SIGTERM');

            // Wait for graceful shutdown
            setTimeout(() => {
                if (!session.process.killed) {
                    session.process.kill('SIGKILL');
                }
            }, 5000);

            this.activeSessions.delete(sessionId);

            console.log(`✅ Browser session closed: ${sessionId}`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to close session ${sessionId}:`, error);
            return { success: false, error: error.message };
        }
    }

    async closeAllSessions() {
        console.log('🔚 Closing all browser sessions...');

        const sessions = Array.from(this.activeSessions.keys());
        const results = await Promise.allSettled(
            sessions.map(sessionId => this.closeSession(sessionId))
        );

        return {
            success: true,
            closed: sessions.length,
            results
        };
    }

    async getSystemInfo() {
        try {
            const info = {
                platform: process.platform,
                arch: process.arch,
                scriptsPath: this.scriptsPath,
                activeSessions: this.activeSessions.size,
                capabilities: {
                    browserAutomation: fs.existsSync(path.join(this.scriptsPath, 'interactive-browser.js')),
                    screenshotCapture: fs.existsSync(path.join(this.scriptsPath, 'screenshot-capture.js')),
                    visualDiff: fs.existsSync(path.join(this.scriptsPath, 'visual-diff.js')),
                    aiOrchestration: fs.existsSync(path.join(this.scriptsPath, 'ai-test-orchestrator.js')),
                    appleEcosystem: fs.existsSync(path.join(this.scriptsPath, 'apple-ecosystem-testing.js'))
                }
            };

            return { success: true, info };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Cleanup method
    async cleanup() {
        console.log('🧹 Cleaning up Automation Service...');
        await this.closeAllSessions();
        console.log('✅ Automation Service cleanup complete');
    }
}