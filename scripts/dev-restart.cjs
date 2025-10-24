#!/usr/bin/env node

/**
 * Development Server Restart Helper
 * Ensures clean restart of the Vite dev server
 */

const { execSync, spawn } = require('child_process');
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

function killProcessOnPort(port) {
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
      log(`Found ${pids.length} process(es) on port ${port}`, 'yellow');

      pids.forEach(pid => {
        try {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
          log(`  ✓ Killed process ${pid}`, 'green');
        } catch (err) {
          log(`  ✗ Failed to kill process ${pid}`, 'red');
        }
      });

      // Wait for port to be released
      return new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      log(`Port ${port} is free`, 'green');
    }
  } catch (err) {
    // Port is likely free if command fails
    log(`Port ${port} appears to be free`, 'green');
  }
}

function killViteProcesses() {
  try {
    const command = process.platform === 'win32'
      ? 'wmic process where "name=\'node.exe\' and commandline like \'%vite%\'" get processid'
      : 'ps aux | grep vite | grep -v grep | awk \'{print $2}\'';

    const output = execSync(command, { encoding: 'utf8' });
    const pids = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !isNaN(line));

    if (pids.length > 0) {
      log(`Found ${pids.length} Vite process(es)`, 'yellow');

      pids.forEach(pid => {
        try {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
          log(`  ✓ Killed Vite process ${pid}`, 'green');
        } catch (err) {
          // Process might have already exited
        }
      });
    }
  } catch (err) {
    // No Vite processes found
  }
}

function clearNodeModulesCache() {
  const cacheDir = path.join(PROJECT_ROOT, 'node_modules', '.vite');
  if (fs.existsSync(cacheDir)) {
    try {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      log('Cleared Vite cache', 'green');
    } catch (err) {
      log('Failed to clear Vite cache', 'yellow');
    }
  }
}

function startDevServer() {
  log('Starting development server...', 'cyan');

  // Start the dev server
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1'
    }
  });

  devServer.on('error', (err) => {
    log(`Failed to start dev server: ${err.message}`, 'red');
    process.exit(1);
  });

  devServer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`Dev server exited with code ${code}`, 'yellow');
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\nShutting down dev server...', 'yellow');
    devServer.kill('SIGTERM');
    setTimeout(() => {
      devServer.kill('SIGKILL');
      process.exit(0);
    }, 3000);
  });

  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
    process.exit(0);
  });
}

async function main() {
  log('🔄 Development Server Restart Helper', 'bright');
  log('=====================================\n', 'bright');

  // Step 1: Kill existing processes
  log('Step 1: Cleaning up existing processes...', 'blue');
  killViteProcesses();
  await killProcessOnPort(PORT);

  // Step 2: Clear cache
  log('\nStep 2: Clearing cache...', 'blue');
  clearNodeModulesCache();

  // Step 3: Start fresh server
  log('\nStep 3: Starting fresh server...', 'blue');
  startDevServer();
}

// Run the script
main().catch(err => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});