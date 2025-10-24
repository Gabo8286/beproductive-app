#!/usr/bin/env node

/**
 * Development Cleanup Utilities
 * Helps clean up stuck ports and processes
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8080;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function killPort(port) {
  try {
    // Find processes using the port
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    const pids = execSync(command, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
      .map(line => {
        if (process.platform === 'win32') {
          // Windows: Extract PID from netstat output
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        }
        // Unix: lsof returns PIDs directly
        return line.trim();
      })
      .filter(pid => pid && !isNaN(pid));

    if (pids.length > 0) {
      log(`Found ${pids.length} process(es) on port ${port}:`, 'yellow');

      pids.forEach(pid => {
        try {
          // Get process info before killing
          const info = process.platform === 'win32'
            ? execSync(`wmic process where processid=${pid} get name`, { encoding: 'utf8' })
            : execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' });

          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
          log(`  ✓ Killed process ${pid} (${info.trim()})`, 'green');
        } catch (err) {
          log(`  ✗ Failed to kill process ${pid}`, 'red');
        }
      });

      return true;
    } else {
      log(`Port ${port} is free`, 'green');
      return false;
    }
  } catch (err) {
    // Port is likely free if command fails
    log(`Port ${port} appears to be free`, 'green');
    return false;
  }
}

function killNodeProcesses() {
  try {
    const command = process.platform === 'win32'
      ? 'wmic process where "name=\'node.exe\'" get processid,commandline'
      : 'ps aux | grep node | grep -v grep';

    const output = execSync(command, { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => {
      // Filter for our project processes
      return line.includes('vite') ||
             line.includes('spark-bloom-flow') ||
             line.includes('localhost:8080');
    });

    if (lines.length > 0) {
      log(`Found ${lines.length} Node.js process(es) related to the project:`, 'yellow');

      lines.forEach(line => {
        const pid = process.platform === 'win32'
          ? line.match(/\d+$/)?.[0]
          : line.trim().split(/\s+/)[1];

        if (pid && !isNaN(pid)) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            } else {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            }
            log(`  ✓ Killed Node process ${pid}`, 'green');
          } catch (err) {
            // Process might have already exited
          }
        }
      });

      return true;
    } else {
      log('No related Node.js processes found', 'green');
      return false;
    }
  } catch (err) {
    log('Error checking Node.js processes', 'yellow');
    return false;
  }
}

function clearCache() {
  const caches = [
    { path: 'node_modules/.vite', name: 'Vite cache' },
    { path: '.parcel-cache', name: 'Parcel cache' },
    { path: 'dist', name: 'Build output' }
  ];

  let cleared = false;
  caches.forEach(({ path: cachePath, name }) => {
    const fullPath = path.join(PROJECT_ROOT, cachePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`  ✓ Cleared ${name}`, 'green');
        cleared = true;
      } catch (err) {
        log(`  ✗ Failed to clear ${name}`, 'yellow');
      }
    }
  });

  if (!cleared) {
    log('No caches to clear', 'green');
  }

  return cleared;
}

function checkHealth() {
  log('\n📊 System Health Check', 'bright');
  log('====================', 'bright');

  // Check port
  log('\n🔌 Port Status:', 'cyan');
  const portInUse = killPort(PORT);
  if (portInUse) {
    log('  ⚠️  Port was in use and has been freed', 'yellow');
  }

  // Check Node version
  log('\n📦 Node.js Version:', 'cyan');
  const nodeVersion = process.version;
  log(`  ${nodeVersion}`, 'green');

  // Check npm version
  try {
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    log('\n📦 npm Version:', 'cyan');
    log(`  ${npmVersion}`, 'green');
  } catch (err) {
    log('\n📦 npm Version:', 'cyan');
    log('  Unable to determine', 'yellow');
  }

  // Check available memory
  const os = require('os');
  const freeMem = Math.round(os.freemem() / 1024 / 1024);
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  log('\n💾 Memory Status:', 'cyan');
  log(`  ${freeMem}MB free of ${totalMem}MB total`, 'green');

  // Check if dev server is running
  try {
    execSync(`curl -s http://localhost:${PORT}`, { timeout: 1000 });
    log('\n🚀 Dev Server:', 'cyan');
    log('  Running', 'green');
  } catch (err) {
    log('\n🚀 Dev Server:', 'cyan');
    log('  Not running', 'yellow');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

function showHelp() {
  log('🧹 Development Cleanup Utilities', 'bright');
  log('================================\n', 'bright');

  log('Usage: node scripts/dev-cleanup.js [command]\n', 'cyan');

  log('Commands:', 'cyan');
  log('  all       - Run all cleanup tasks (default)', 'reset');
  log('  port      - Free up port 8080', 'reset');
  log('  node      - Kill related Node.js processes', 'reset');
  log('  cache     - Clear development caches', 'reset');
  log('  health    - Check system health', 'reset');
  log('  help      - Show this help message\n', 'reset');

  log('Examples:', 'cyan');
  log('  npm run dev:cleanup         # Run all cleanup', 'reset');
  log('  npm run dev:cleanup port    # Just free the port', 'reset');
  log('  npm run dev:cleanup health  # Check system health', 'reset');
}

async function main() {
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case 'port':
      log('🔌 Freeing port...', 'cyan');
      killPort(PORT);
      break;

    case 'node':
      log('🔧 Killing Node.js processes...', 'cyan');
      killNodeProcesses();
      break;

    case 'cache':
      log('🗑️  Clearing caches...', 'cyan');
      clearCache();
      break;

    case 'health':
      checkHealth();
      break;

    case 'all':
    default:
      log('🧹 Development Cleanup', 'bright');
      log('=====================\n', 'bright');

      log('Step 1: Freeing port...', 'blue');
      const hadPortIssue = killPort(PORT);

      log('\nStep 2: Cleaning Node processes...', 'blue');
      const hadProcesses = killNodeProcesses();

      log('\nStep 3: Clearing caches...', 'blue');
      const clearedCache = clearCache();

      if (hadPortIssue || hadProcesses || clearedCache) {
        log('\n✨ Cleanup complete!', 'green');
        log('You can now run: npm run dev', 'cyan');
      } else {
        log('\n✅ Everything was already clean!', 'green');
      }
      break;
  }
}

// Run the script
main().catch(err => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});