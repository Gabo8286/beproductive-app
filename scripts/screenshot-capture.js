#!/usr/bin/env node

/**
 * Native Screenshot Capture Tool
 * Integrates with macOS screencapture and provides organized screenshot management
 * Usage: node scripts/screenshot-capture.js [command] [options]
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ScreenshotCapture {
  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'screenshots');
    this.sessionDir = null;
    this.verbose = process.argv.includes('--verbose');
    this.format = this.getFormat();
    this.quality = this.getQuality();
  }

  getFormat() {
    const formatArg = process.argv.find(arg => arg.startsWith('--format='));
    if (formatArg) {
      return formatArg.split('=')[1];
    }
    return 'png'; // default
  }

  getQuality() {
    const qualityArg = process.argv.find(arg => arg.startsWith('--quality='));
    if (qualityArg) {
      return parseInt(qualityArg.split('=')[1]);
    }
    return 100; // default
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureDirectories() {
    try {
      await fs.access(this.screenshotDir);
    } catch {
      await fs.mkdir(this.screenshotDir, { recursive: true });
      this.log(`Created screenshots directory: ${this.screenshotDir}`);
    }

    // Create session directory for organized captures
    const sessionName = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    this.sessionDir = path.join(this.screenshotDir, sessionName);

    try {
      await fs.access(this.sessionDir);
    } catch {
      await fs.mkdir(this.sessionDir, { recursive: true });
      this.log(`Created session directory: ${this.sessionDir}`);
    }
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: this.verbose ? 'inherit' : 'pipe' });

      let stdout = '';
      let stderr = '';

      if (proc.stdout) {
        proc.stdout.on('data', (data) => stdout += data.toString());
      }

      if (proc.stderr) {
        proc.stderr.on('data', (data) => stderr += data.toString());
      }

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  generateFilename(prefix = 'screenshot', suffix = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = suffix ? `${prefix}-${suffix}-${timestamp}` : `${prefix}-${timestamp}`;
    return `${name}.${this.format}`;
  }

  async captureFullScreen(filename = null) {
    await this.ensureDirectories();

    const name = filename || this.generateFilename('fullscreen');
    const filepath = path.join(this.sessionDir, name);

    try {
      this.log('Capturing full screen...');
      await this.runCommand('screencapture', ['-x', filepath]);
      this.log(`Full screen captured: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Full screen capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureSelection(filename = null) {
    await this.ensureDirectories();

    const name = filename || this.generateFilename('selection');
    const filepath = path.join(this.sessionDir, name);

    try {
      this.log('Starting selection capture (drag to select area)...');
      await this.runCommand('screencapture', ['-s', filepath]);
      this.log(`Selection captured: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Selection capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureWindow(filename = null) {
    await this.ensureDirectories();

    const name = filename || this.generateFilename('window');
    const filepath = path.join(this.sessionDir, name);

    try {
      this.log('Starting window capture (click on a window)...');
      await this.runCommand('screencapture', ['-w', filepath]);
      this.log(`Window captured: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Window capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureDelayed(delay = 5, mode = 'fullscreen', filename = null) {
    await this.ensureDirectories();

    const name = filename || this.generateFilename(`delayed-${mode}`);
    const filepath = path.join(this.sessionDir, name);

    try {
      this.log(`Starting delayed capture (${delay}s delay)...`);

      let args = ['-T', delay.toString(), filepath];

      if (mode === 'selection') {
        args = ['-s', '-T', delay.toString(), filepath];
      } else if (mode === 'window') {
        args = ['-w', '-T', delay.toString(), filepath];
      }

      await this.runCommand('screencapture', args);
      this.log(`Delayed capture completed: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Delayed capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureWithShadow(mode = 'window', filename = null) {
    await this.ensureDirectories();

    const name = filename || this.generateFilename(`shadow-${mode}`);
    const filepath = path.join(this.sessionDir, name);

    try {
      this.log(`Starting shadow capture...`);

      let args = ['-o', filepath]; // -o includes window shadow

      if (mode === 'selection') {
        args = ['-s', '-o', filepath];
      } else if (mode === 'window') {
        args = ['-w', '-o', filepath];
      }

      await this.runCommand('screencapture', args);
      this.log(`Shadow capture completed: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Shadow capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureClipboard() {
    try {
      this.log('Capturing screen to clipboard...');
      await this.runCommand('screencapture', ['-c']);
      this.log('Screen captured to clipboard', 'success');
      return 'clipboard';
    } catch (error) {
      this.log(`Clipboard capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async listCaptures() {
    try {
      await this.ensureDirectories();
      const files = await fs.readdir(this.sessionDir);
      const screenshots = files.filter(file =>
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
      );

      if (screenshots.length === 0) {
        this.log('No screenshots found in current session');
        return [];
      }

      this.log(`Found ${screenshots.length} screenshots in current session:`);
      for (const screenshot of screenshots) {
        const filepath = path.join(this.sessionDir, screenshot);
        const stats = await fs.stat(filepath);
        console.log(`  ${screenshot} (${(stats.size / 1024).toFixed(1)}KB - ${stats.mtime.toLocaleString()})`);
      }

      return screenshots.map(file => path.join(this.sessionDir, file));
    } catch (error) {
      this.log(`Failed to list captures: ${error.message}`, 'error');
      throw error;
    }
  }

  async openLastCapture() {
    try {
      const captures = await this.listCaptures();
      if (captures.length === 0) {
        this.log('No captures to open', 'warning');
        return;
      }

      // Get most recent capture
      const stats = await Promise.all(
        captures.map(async (file) => ({
          file,
          mtime: (await fs.stat(file)).mtime
        }))
      );

      const latest = stats.reduce((prev, current) =>
        current.mtime > prev.mtime ? current : prev
      );

      this.log(`Opening latest capture: ${latest.file}`);
      await this.runCommand('open', [latest.file]);
    } catch (error) {
      this.log(`Failed to open last capture: ${error.message}`, 'error');
      throw error;
    }
  }

  async createAnnotatedCapture(mode = 'selection') {
    const filepath = await this.captureSelection();

    // Open in Preview for annotation
    try {
      this.log('Opening capture in Preview for annotation...');
      await this.runCommand('open', ['-a', 'Preview', filepath]);
      return filepath;
    } catch (error) {
      this.log(`Failed to open in Preview: ${error.message}`, 'warning');
      return filepath;
    }
  }

  // Preset capture workflows
  async captureBrowserWindow() {
    this.log('Looking for browser windows...');

    // Try to capture active browser window
    const browsers = ['Google Chrome', 'Firefox', 'Safari', 'Microsoft Edge', 'Brave Browser'];
    let captured = false;

    for (const browser of browsers) {
      try {
        // Use AppleScript to focus browser and capture
        const script = `
          tell application "${browser}"
            activate
          end tell
          delay 0.5
        `;

        await new Promise((resolve, reject) => {
          exec(`osascript -e '${script}'`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        const filepath = await this.captureWindow(this.generateFilename('browser', browser.toLowerCase().replace(/\s+/g, '-')));
        this.log(`Captured ${browser} window`, 'success');
        captured = true;
        return filepath;
      } catch (error) {
        // Continue to next browser
        continue;
      }
    }

    if (!captured) {
      this.log('No browser windows found, falling back to window selection', 'warning');
      return await this.captureWindow();
    }
  }

  async captureSequence(count = 3, interval = 2) {
    this.log(`Starting sequence capture: ${count} screenshots, ${interval}s intervals`);
    const captures = [];

    for (let i = 1; i <= count; i++) {
      this.log(`Capturing screenshot ${i}/${count}...`);

      if (i > 1) {
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }

      const filename = this.generateFilename('sequence', `${i.toString().padStart(2, '0')}`);
      const filepath = await this.captureFullScreen(filename);
      captures.push(filepath);
    }

    this.log(`Sequence capture completed: ${captures.length} screenshots`, 'success');
    return captures;
  }

  async setupHotkeys() {
    this.log('Setting up hotkey shortcuts...');

    const hotkeyScript = `
#!/bin/bash
# Screenshot hotkey shortcuts

# Cmd+Shift+4 - Selection capture
osascript -e 'tell application "System Events" to keystroke "4" using {command down, shift down}'

# Cmd+Shift+3 - Full screen capture
osascript -e 'tell application "System Events" to keystroke "3" using {command down, shift down}'

# Cmd+Shift+5 - Screenshot toolbar
osascript -e 'tell application "System Events" to keystroke "5" using {command down, shift down}'
    `;

    const hotkeyPath = path.join(this.screenshotDir, 'hotkeys.sh');
    await fs.writeFile(hotkeyPath, hotkeyScript);
    await this.runCommand('chmod', ['+x', hotkeyPath]);

    this.log(`Hotkey script created: ${hotkeyPath}`);
    this.log('Use system hotkeys: Cmd+Shift+3/4/5 for different capture modes');
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const capture = new ScreenshotCapture();

  try {
    switch (command) {
      case 'full':
      case 'fullscreen':
        const fullPath = await capture.captureFullScreen();
        console.log(`Screenshot saved: ${fullPath}`);
        break;

      case 'select':
      case 'selection':
        const selectPath = await capture.captureSelection();
        console.log(`Screenshot saved: ${selectPath}`);
        break;

      case 'window':
        const windowPath = await capture.captureWindow();
        console.log(`Screenshot saved: ${windowPath}`);
        break;

      case 'delayed':
        const delay = parseInt(process.argv[3]) || 5;
        const mode = process.argv[4] || 'fullscreen';
        const delayedPath = await capture.captureDelayed(delay, mode);
        console.log(`Screenshot saved: ${delayedPath}`);
        break;

      case 'shadow':
        const shadowMode = process.argv[3] || 'window';
        const shadowPath = await capture.captureWithShadow(shadowMode);
        console.log(`Screenshot saved: ${shadowPath}`);
        break;

      case 'clipboard':
        await capture.captureClipboard();
        console.log('Screenshot copied to clipboard');
        break;

      case 'browser':
        const browserPath = await capture.captureBrowserWindow();
        console.log(`Browser screenshot saved: ${browserPath}`);
        break;

      case 'sequence':
        const count = parseInt(process.argv[3]) || 3;
        const interval = parseInt(process.argv[4]) || 2;
        const sequencePaths = await capture.captureSequence(count, interval);
        console.log(`Sequence screenshots saved: ${sequencePaths.join(', ')}`);
        break;

      case 'annotate':
        const annotatePath = await capture.createAnnotatedCapture();
        console.log(`Screenshot ready for annotation: ${annotatePath}`);
        break;

      case 'list':
        await capture.listCaptures();
        break;

      case 'open':
        await capture.openLastCapture();
        break;

      case 'setup':
        await capture.setupHotkeys();
        break;

      default:
        console.log(`
Native Screenshot Capture Tool

Usage: node scripts/screenshot-capture.js [command] [options]

Commands:
  full, fullscreen                 - Capture entire screen
  select, selection               - Capture selected area (drag to select)
  window                          - Capture specific window (click to select)
  delayed [seconds] [mode]        - Delayed capture (default: 5s, fullscreen)
  shadow [mode]                   - Capture with window shadow
  clipboard                       - Capture to clipboard
  browser                         - Capture active browser window
  sequence [count] [interval]     - Capture sequence (default: 3 shots, 2s apart)
  annotate                        - Capture and open for annotation
  list                           - List captured screenshots
  open                           - Open most recent screenshot
  setup                          - Setup hotkey shortcuts

Options:
  --format=<png|jpg>             - Output format (default: png)
  --quality=<1-100>              - JPEG quality (default: 100)
  --verbose                      - Enable verbose logging

Examples:
  node scripts/screenshot-capture.js select
  node scripts/screenshot-capture.js delayed 3 selection
  node scripts/screenshot-capture.js sequence 5 1
  node scripts/screenshot-capture.js browser
  node scripts/screenshot-capture.js shadow window
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { ScreenshotCapture };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}