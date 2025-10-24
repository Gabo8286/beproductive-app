#!/usr/bin/env node

/**
 * Browser Session Manager
 * Manages persistent browser sessions for interactive testing and debugging
 * Usage: node scripts/browser-session-manager.js [command] [options]
 */

import { chromium, firefox, webkit } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { parse } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserSessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionDir = path.join(process.cwd(), 'browser-sessions');
    this.verbose = process.argv.includes('--verbose');
    this.controlPort = this.getControlPort();
    this.server = null;
  }

  getControlPort() {
    const portArg = process.argv.find(arg => arg.startsWith('--port='));
    if (portArg) {
      return parseInt(portArg.split('=')[1]);
    }
    return 3001; // default control port
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureSessionDir() {
    try {
      await fs.access(this.sessionDir);
    } catch {
      await fs.mkdir(this.sessionDir, { recursive: true });
      this.log(`Created session directory: ${this.sessionDir}`);
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createSession(options = {}) {
    const sessionId = this.generateSessionId();
    const {
      browser = 'chromium',
      device = null,
      headless = false,
      devtools = true,
      viewport = null,
      userAgent = null,
      url = 'http://localhost:8080'
    } = options;

    try {
      this.log(`Creating ${browser} session: ${sessionId}`);

      // Select browser
      const browserInstance = browser === 'firefox' ? firefox :
                             browser === 'webkit' ? webkit : chromium;

      // Launch browser
      const browserObj = await browserInstance.launch({
        headless,
        devtools
      });

      // Create context with options
      let contextOptions = {};

      if (device) {
        const { devices } = await import('playwright');
        if (devices[device]) {
          contextOptions = { ...devices[device] };
          this.log(`Emulating device: ${device}`);
        }
      }

      if (viewport) {
        contextOptions.viewport = viewport;
      }

      if (userAgent) {
        contextOptions.userAgent = userAgent;
      }

      const context = await browserObj.newContext(contextOptions);
      const page = await context.newPage();

      // Set up event logging
      if (this.verbose) {
        page.on('console', msg => this.log(`[${sessionId}] Console: ${msg.text()}`, 'debug'));
        page.on('pageerror', err => this.log(`[${sessionId}] Page Error: ${err.message}`, 'error'));
        page.on('request', req => this.log(`[${sessionId}] Request: ${req.method()} ${req.url()}`, 'debug'));
      }

      // Navigate to initial URL
      if (url) {
        await page.goto(url, { waitUntil: 'networkidle' });
        this.log(`[${sessionId}] Navigated to: ${url}`);
      }

      // Store session
      const session = {
        id: sessionId,
        browser: browserObj,
        context,
        page,
        browserType: browser,
        device,
        created: new Date(),
        lastAccessed: new Date(),
        options
      };

      this.sessions.set(sessionId, session);
      this.log(`Session created successfully: ${sessionId}`, 'success');

      return session;
    } catch (error) {
      this.log(`Failed to create session: ${error.message}`, 'error');
      throw error;
    }
  }

  async getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.lastAccessed = new Date();
    return session;
  }

  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.log(`Session not found: ${sessionId}`, 'warning');
      return false;
    }

    try {
      await session.browser.close();
      this.sessions.delete(sessionId);
      this.log(`Session closed: ${sessionId}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to close session ${sessionId}: ${error.message}`, 'error');
      return false;
    }
  }

  async listSessions() {
    const sessionList = Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      browserType: session.browserType,
      device: session.device,
      created: session.created,
      lastAccessed: session.lastAccessed,
      currentUrl: session.page ? session.page.url() : 'Unknown'
    }));

    return sessionList;
  }

  async executeInSession(sessionId, action, params = {}) {
    const session = await this.getSession(sessionId);
    const { page } = session;

    this.log(`[${sessionId}] Executing: ${action}`);

    try {
      switch (action) {
        case 'navigate':
          await page.goto(params.url, { waitUntil: 'networkidle' });
          break;

        case 'click':
          await page.click(params.selector);
          break;

        case 'type':
          await page.fill(params.selector, params.text);
          break;

        case 'screenshot':
          await this.ensureSessionDir();
          const screenshotPath = path.join(this.sessionDir, `${sessionId}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: params.fullPage || false });
          return { screenshotPath };

        case 'evaluate':
          const result = await page.evaluate(params.script);
          return { result };

        case 'wait':
          await page.waitForSelector(params.selector, { timeout: params.timeout || 30000 });
          break;

        case 'getUrl':
          return { url: page.url() };

        case 'getTitle':
          return { title: await page.title() };

        case 'getElementText':
          const text = await page.textContent(params.selector);
          return { text };

        case 'getElementAttribute':
          const attr = await page.getAttribute(params.selector, params.attribute);
          return { attribute: attr };

        case 'hover':
          await page.hover(params.selector);
          break;

        case 'focus':
          await page.focus(params.selector);
          break;

        case 'reload':
          await page.reload({ waitUntil: 'networkidle' });
          break;

        case 'goBack':
          await page.goBack({ waitUntil: 'networkidle' });
          break;

        case 'goForward':
          await page.goForward({ waitUntil: 'networkidle' });
          break;

        case 'setViewport':
          await page.setViewportSize(params.viewport);
          break;

        case 'emulateMedia':
          await page.emulateMedia({ colorScheme: params.colorScheme });
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.log(`[${sessionId}] Action completed: ${action}`, 'success');
      return { success: true };

    } catch (error) {
      this.log(`[${sessionId}] Action failed: ${action} - ${error.message}`, 'error');
      throw error;
    }
  }

  async startControlServer() {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        try {
          const parsedUrl = parse(req.url, true);
          const { pathname, query } = parsedUrl;

          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            switch (pathname) {
              case '/sessions':
                const sessions = await this.listSessions();
                res.writeHead(200);
                res.end(JSON.stringify({ sessions }));
                break;

              case '/session':
                if (!query.id) {
                  res.writeHead(400);
                  res.end(JSON.stringify({ error: 'Session ID required' }));
                  return;
                }

                try {
                  const session = await this.getSession(query.id);
                  res.writeHead(200);
                  res.end(JSON.stringify({
                    id: session.id,
                    browserType: session.browserType,
                    device: session.device,
                    created: session.created,
                    lastAccessed: session.lastAccessed,
                    currentUrl: session.page.url()
                  }));
                } catch (error) {
                  res.writeHead(404);
                  res.end(JSON.stringify({ error: error.message }));
                }
                break;

              case '/health':
                res.writeHead(200);
                res.end(JSON.stringify({ status: 'ok', sessions: this.sessions.size }));
                break;

              default:
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
              try {
                const data = JSON.parse(body);

                switch (pathname) {
                  case '/session/create':
                    const session = await this.createSession(data.options || {});
                    res.writeHead(201);
                    res.end(JSON.stringify({ sessionId: session.id }));
                    break;

                  case '/session/execute':
                    if (!data.sessionId || !data.action) {
                      res.writeHead(400);
                      res.end(JSON.stringify({ error: 'sessionId and action required' }));
                      return;
                    }

                    const result = await this.executeInSession(data.sessionId, data.action, data.params || {});
                    res.writeHead(200);
                    res.end(JSON.stringify(result));
                    break;

                  case '/session/close':
                    if (!data.sessionId) {
                      res.writeHead(400);
                      res.end(JSON.stringify({ error: 'sessionId required' }));
                      return;
                    }

                    const closed = await this.closeSession(data.sessionId);
                    res.writeHead(200);
                    res.end(JSON.stringify({ closed }));
                    break;

                  default:
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Endpoint not found' }));
                }
              } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          }
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      this.server.listen(this.controlPort, (err) => {
        if (err) {
          reject(err);
        } else {
          this.log(`Control server started on port ${this.controlPort}`, 'success');
          resolve();
        }
      });
    });
  }

  async stopControlServer() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.log('Control server stopped');
          resolve();
        });
      });
    }
  }

  async cleanup() {
    this.log('Cleaning up all sessions...');

    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      await this.closeSession(sessionId);
    }

    await this.stopControlServer();
    this.log('Cleanup completed');
  }

  // Preset session configurations
  async createMobileTestingSuite() {
    const devices = ['iPhone 12', 'iPad Pro', 'Pixel 5', 'Galaxy S21'];
    const sessions = [];

    for (const device of devices) {
      try {
        const session = await this.createSession({
          browser: 'chromium',
          device,
          url: 'http://localhost:8080'
        });
        sessions.push(session);
      } catch (error) {
        this.log(`Failed to create session for ${device}: ${error.message}`, 'warning');
      }
    }

    this.log(`Mobile testing suite created: ${sessions.length} devices`, 'success');
    return sessions;
  }

  async createCrossBrowserSuite(url = 'http://localhost:8080') {
    const browsers = ['chromium', 'firefox', 'webkit'];
    const sessions = [];

    for (const browser of browsers) {
      try {
        const session = await this.createSession({
          browser,
          url,
          devtools: false // Don't open devtools for all browsers
        });
        sessions.push(session);
      } catch (error) {
        this.log(`Failed to create ${browser} session: ${error.message}`, 'warning');
      }
    }

    this.log(`Cross-browser suite created: ${sessions.length} browsers`, 'success');
    return sessions;
  }

  async createAccessibilityTestingSuite() {
    const configurations = [
      { name: 'high-contrast', emulateMedia: { colorScheme: 'dark' } },
      { name: 'reduced-motion', viewport: { width: 1280, height: 720 } },
      { name: 'large-text', viewport: { width: 1920, height: 1080 } }
    ];

    const sessions = [];

    for (const config of configurations) {
      try {
        const session = await this.createSession({
          browser: 'chromium',
          url: 'http://localhost:8080',
          ...config
        });

        // Apply accessibility configurations
        if (config.emulateMedia) {
          await session.page.emulateMedia(config.emulateMedia);
        }

        sessions.push({ ...session, configName: config.name });
      } catch (error) {
        this.log(`Failed to create accessibility session ${config.name}: ${error.message}`, 'warning');
      }
    }

    this.log(`Accessibility testing suite created: ${sessions.length} configurations`, 'success');
    return sessions;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const manager = new BrowserSessionManager();

  // Handle cleanup on exit
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await manager.cleanup();
    process.exit(0);
  });

  try {
    switch (command) {
      case 'start':
        await manager.startControlServer();
        console.log(`
🎛️  Browser Session Manager Started

Control Server: http://localhost:${manager.controlPort}

API Endpoints:
  GET  /sessions           - List all sessions
  GET  /session?id=<id>    - Get session info
  POST /session/create     - Create new session
  POST /session/execute    - Execute action in session
  POST /session/close      - Close session
  GET  /health             - Health check

Example API Usage:
  curl -X POST http://localhost:${manager.controlPort}/session/create \\
    -H "Content-Type: application/json" \\
    -d '{"options": {"browser": "chromium", "url": "https://be-productive.app"}}'

Press Ctrl+C to stop the server.
        `);

        // Keep the process running
        await new Promise(() => {});
        break;

      case 'create':
        const browser = process.argv[3] || 'chromium';
        const url = process.argv[4] || 'http://localhost:8080';
        const device = process.argv.find(arg => arg.startsWith('--device='))?.split('=')[1];

        const session = await manager.createSession({
          browser,
          url,
          device,
          headless: process.argv.includes('--headless')
        });

        console.log(`Session created: ${session.id}`);
        console.log(`Browser: ${session.browserType}`);
        console.log(`URL: ${session.page.url()}`);

        if (device) {
          console.log(`Device: ${device}`);
        }

        console.log('\nPress Ctrl+C to close session and exit.');
        await new Promise(() => {});
        break;

      case 'mobile-suite':
        const mobileSessions = await manager.createMobileTestingSuite();
        console.log(`Created ${mobileSessions.length} mobile testing sessions:`);
        mobileSessions.forEach(s => console.log(`  ${s.id} - ${s.device}`));

        console.log('\nPress Ctrl+C to close all sessions and exit.');
        await new Promise(() => {});
        break;

      case 'cross-browser':
        const testUrl = process.argv[3] || 'http://localhost:8080';
        const browserSessions = await manager.createCrossBrowserSuite(testUrl);
        console.log(`Created ${browserSessions.length} cross-browser sessions:`);
        browserSessions.forEach(s => console.log(`  ${s.id} - ${s.browserType}`));

        console.log('\nPress Ctrl+C to close all sessions and exit.');
        await new Promise(() => {});
        break;

      case 'accessibility':
        const a11ySessions = await manager.createAccessibilityTestingSuite();
        console.log(`Created ${a11ySessions.length} accessibility testing sessions:`);
        a11ySessions.forEach(s => console.log(`  ${s.id} - ${s.configName}`));

        console.log('\nPress Ctrl+C to close all sessions and exit.');
        await new Promise(() => {});
        break;

      default:
        console.log(`
Browser Session Manager

Usage: node scripts/browser-session-manager.js [command] [options]

Commands:
  start                           - Start control server for API access
  create [browser] [url]          - Create single browser session
  mobile-suite                    - Create mobile device testing suite
  cross-browser [url]             - Create cross-browser testing suite
  accessibility                   - Create accessibility testing suite

Options:
  --port=<port>                   - Control server port (default: 3001)
  --device=<device_name>          - Emulate specific device
  --headless                      - Run in headless mode
  --verbose                       - Enable verbose logging

Examples:
  node scripts/browser-session-manager.js start
  node scripts/browser-session-manager.js create chromium https://be-productive.app
  node scripts/browser-session-manager.js create --device="iPhone 12"
  node scripts/browser-session-manager.js mobile-suite
  node scripts/browser-session-manager.js cross-browser https://be-productive.app

API Examples:
  # Create session
  curl -X POST http://localhost:3001/session/create \\
    -H "Content-Type: application/json" \\
    -d '{"options": {"browser": "chromium", "url": "https://be-productive.app"}}'

  # Take screenshot
  curl -X POST http://localhost:3001/session/execute \\
    -H "Content-Type: application/json" \\
    -d '{"sessionId": "session_123", "action": "screenshot", "params": {"fullPage": true}}'

  # Navigate
  curl -X POST http://localhost:3001/session/execute \\
    -H "Content-Type: application/json" \\
    -d '{"sessionId": "session_123", "action": "navigate", "params": {"url": "https://example.com"}}'
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { BrowserSessionManager };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}