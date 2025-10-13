#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import os from 'os';
import http from 'http';

/**
 * Cross-platform browser launcher for mobile-sized floating window development
 * Opens the development server in a smartphone-sized floating window for authentic mobile testing
 */

const DEV_URL = 'http://localhost:8080'; // Default Vite dev server URL
const FALLBACK_URLS = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085'
]; // Fallback ports

// Mobile device presets - realistic smartphone dimensions
const MOBILE_CONFIGS = {
  'default': {
    width: 390,
    height: 844,
    name: 'Modern Mobile (Default)',
    description: 'Average modern smartphone size'
  },
  'iphone14': {
    width: 393,
    height: 852,
    name: 'iPhone 14 Pro',
    description: 'Apple iPhone 14 Pro dimensions'
  },
  'iphoneSE': {
    width: 375,
    height: 667,
    name: 'iPhone SE',
    description: 'Compact iPhone dimensions'
  },
  'pixel7': {
    width: 412,
    height: 915,
    name: 'Google Pixel 7',
    description: 'Modern Android flagship'
  },
  'galaxyS23': {
    width: 384,
    height: 854,
    name: 'Galaxy S23',
    description: 'Samsung Galaxy S23 dimensions'
  }
};

// Get device preset from command line argument or environment variable
const deviceType = process.argv[2] || process.env.MOBILE_DEVICE || 'default';
const DEVICE_CONFIG = MOBILE_CONFIGS[deviceType] || MOBILE_CONFIGS['default'];

// Calculate centered position (will be updated after screen detection)
let WINDOW_CONFIG = {
  width: DEVICE_CONFIG.width,
  height: DEVICE_CONFIG.height,
  x: 100, // Will be calculated for centering
  y: 100  // Will be calculated for centering
};

/**
 * Calculate centered window position based on screen size
 */
function calculateCenteredPosition(screenWidth = 1920, screenHeight = 1080) {
  // Center horizontally and position slightly above center vertically for better visibility
  const x = Math.max(0, Math.floor((screenWidth - WINDOW_CONFIG.width) / 2));
  const y = Math.max(0, Math.floor((screenHeight - WINDOW_CONFIG.height) / 2) - 50); // 50px above center

  WINDOW_CONFIG.x = x;
  WINDOW_CONFIG.y = y;

  return { x, y };
}

/**
 * Detect the platform and launch browser accordingly
 */
function launchMobileWindow(url = DEV_URL) {
  const platform = os.platform();

  // Calculate centered position (using default screen size, browsers will handle actual centering)
  calculateCenteredPosition();

  console.log(`📱 Launching mobile development window on ${platform}...`);
  console.log(`📐 Device: ${DEVICE_CONFIG.name} (${DEVICE_CONFIG.width}×${DEVICE_CONFIG.height})`);
  console.log(`💡 ${DEVICE_CONFIG.description}`);
  console.log(`🎯 Position: Centered floating window`);
  console.log(`🌐 Opening: ${url}`);

  switch (platform) {
    case 'darwin': // macOS
      launchMacOS(url);
      break;
    case 'win32': // Windows
      launchWindows(url);
      break;
    case 'linux': // Linux
      launchLinux(url);
      break;
    default:
      console.warn(`⚠️  Platform ${platform} not specifically supported, trying default browser...`);
      launchDefault(url);
  }
}

/**
 * Launch browser on macOS with mobile-sized floating window
 */
function launchMacOS(url = DEV_URL) {
  // Try Chrome first (best mobile dev tools)
  const chromeCommands = [
    `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    `/Applications/Chromium.app/Contents/MacOS/Chromium`,
    'google-chrome',
    'chromium'
  ];

  const chromeArgs = [
    `--window-size=${WINDOW_CONFIG.width},${WINDOW_CONFIG.height}`,
    `--window-position=${WINDOW_CONFIG.x},${WINDOW_CONFIG.y}`,
    '--new-window',
    '--no-first-run',
    '--no-default-browser-check',
    '--force-device-scale-factor=1', // Ensure consistent mobile scaling
    url
  ];

  // Try to find and launch Chrome
  tryCommands(chromeCommands, chromeArgs, () => {
    // Fallback to Safari with AppleScript for precise mobile window control
    console.log('🍎 Chrome not found, trying Safari...');
    const safariScript = `
      tell application "Safari"
        activate
        make new document
        set bounds of front window to {${WINDOW_CONFIG.x}, ${WINDOW_CONFIG.y}, ${WINDOW_CONFIG.x + WINDOW_CONFIG.width}, ${WINDOW_CONFIG.y + WINDOW_CONFIG.height}}
        set URL of front document to "${url}"
      end tell
    `;

    exec(`osascript -e '${safariScript}'`, (error) => {
      if (error) {
        console.log('🌐 Falling back to system default browser...');
        exec(`open "${url}"`);
      } else {
        console.log('✅ Safari launched in mobile window mode');
      }
    });
  });
}

/**
 * Launch browser on Windows with mobile-sized floating window
 */
function launchWindows(url = DEV_URL) {
  const chromeCommands = [
    'chrome',
    'google-chrome',
    'chromium',
    '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"',
    '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"'
  ];

  const chromeArgs = [
    `--window-size=${WINDOW_CONFIG.width},${WINDOW_CONFIG.height}`,
    `--window-position=${WINDOW_CONFIG.x},${WINDOW_CONFIG.y}`,
    '--new-window',
    '--no-first-run',
    '--no-default-browser-check',
    '--force-device-scale-factor=1',
    url
  ];

  tryCommands(chromeCommands, chromeArgs, () => {
    console.log('🌐 Chrome not found, trying Edge...');

    const edgeCommands = [
      'msedge',
      '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"'
    ];

    const edgeArgs = [
      `--window-size=${WINDOW_CONFIG.width},${WINDOW_CONFIG.height}`,
      `--window-position=${WINDOW_CONFIG.x},${WINDOW_CONFIG.y}`,
      '--new-window',
      '--force-device-scale-factor=1',
      url
    ];

    tryCommands(edgeCommands, edgeArgs, () => {
      console.log('🌐 Falling back to system default browser...');
      exec(`start "${url}"`);
    });
  });
}

/**
 * Launch browser on Linux with mobile-sized floating window
 */
function launchLinux(url = DEV_URL) {
  const chromeCommands = [
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser'
  ];

  const chromeArgs = [
    `--window-size=${WINDOW_CONFIG.width},${WINDOW_CONFIG.height}`,
    `--window-position=${WINDOW_CONFIG.x},${WINDOW_CONFIG.y}`,
    '--new-window',
    '--no-first-run',
    '--no-default-browser-check',
    '--force-device-scale-factor=1',
    url
  ];

  tryCommands(chromeCommands, chromeArgs, () => {
    console.log('🦊 Chrome not found, trying Firefox...');

    const firefoxCommands = ['firefox', 'firefox-esr'];
    const firefoxArgs = [
      '--new-window',
      `--width=${WINDOW_CONFIG.width}`,
      `--height=${WINDOW_CONFIG.height}`,
      url
    ];

    tryCommands(firefoxCommands, firefoxArgs, () => {
      console.log('🌐 Falling back to system default browser...');
      exec(`xdg-open "${url}"`);
    });
  });
}

/**
 * Default fallback browser launch
 */
function launchDefault(url = DEV_URL) {
  const platform = os.platform();

  if (platform === 'darwin') {
    exec(`open "${url}"`);
  } else if (platform === 'win32') {
    exec(`start "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

/**
 * Try multiple commands until one succeeds
 */
function tryCommands(commands, args, fallback) {
  let commandIndex = 0;

  function tryNext() {
    if (commandIndex >= commands.length) {
      fallback();
      return;
    }

    const command = commands[commandIndex];
    commandIndex++;

    console.log(`🔍 Trying: ${command}`);

    const process = spawn(command, args, {
      stdio: 'ignore',
      detached: true
    });

    process.on('error', () => {
      tryNext();
    });

    process.on('spawn', () => {
      console.log(`✅ Mobile window launched successfully`);
      console.log(`📱 Device simulation: ${DEVICE_CONFIG.name}`);
      console.log(`🎯 Perfect for mobile-first development!`);
      process.unref(); // Don't wait for the process to exit
    });
  }

  tryNext();
}

/**
 * Wait for development server to be ready
 */
function waitForServer(callback) {
  const checkUrls = [DEV_URL, ...FALLBACK_URLS];
  let urlIndex = 0;

  function checkNext() {
    if (urlIndex >= checkUrls.length) {
      console.log('⚠️  Development server not ready, launching browser anyway...');
      callback(DEV_URL);
      return;
    }

    const url = checkUrls[urlIndex];
    console.log(`🔍 Checking if server is ready at ${url}...`);

    const urlObj = new URL(url);

    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/',
      method: 'GET',
      timeout: 1000
    }, (res) => {
      console.log(`✅ Development server is ready at ${url}`);
      callback(url);
    });

    req.on('error', () => {
      urlIndex++;
      setTimeout(checkNext, 500);
    });

    req.on('timeout', () => {
      req.destroy();
      urlIndex++;
      setTimeout(checkNext, 500);
    });

    req.end();
  }

  checkNext();
}

/**
 * Display available device presets
 */
function showDevicePresets() {
  console.log('📱 Available device presets:');
  Object.keys(MOBILE_CONFIGS).forEach(key => {
    const config = MOBILE_CONFIGS[key];
    const selected = key === deviceType ? ' (selected)' : '';
    console.log(`   ${key}: ${config.name} (${config.width}×${config.height})${selected}`);
    console.log(`      ${config.description}`);
  });
  console.log('');
  console.log('💡 Usage: node scripts/open-mobile-window.js [device-type]');
  console.log('   Example: node scripts/open-mobile-window.js iphone14');
  console.log('');
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showDevicePresets();
  process.exit(0);
}

// Main execution
console.log('📱 Setting up mobile development window...');

// Show selected device info
if (deviceType !== 'default') {
  console.log(`🎯 Device preset: ${deviceType}`);
}

// Wait a moment for the dev server to start, then launch browser
setTimeout(() => {
  waitForServer((detectedUrl) => {
    launchMobileWindow(detectedUrl);
  });
}, 2000);