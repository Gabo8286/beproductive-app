import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sidecar Service
 *
 * Manages iPad Pro integration via Apple's Sidecar
 * Coordinates dual-device testing and automation workflows
 */
export class SidecarService {
    constructor() {
        this.scriptsPath = this.findScriptsPath();
        this.sidecarStatus = {
            enabled: false,
            iPadConnected: false,
            lastCheck: null
        };
        this.statusCheckInterval = null;
    }

    async initialize() {
        console.log('📱 Initializing Sidecar Service...');

        try {
            // Verify we're on macOS
            if (process.platform !== 'darwin') {
                throw new Error('Sidecar is only available on macOS');
            }

            // Check for macOS version compatibility (Sidecar requires macOS 10.15+)
            const osVersion = this.getMacOSVersion();
            if (!this.isSidecarSupported(osVersion)) {
                throw new Error(`Sidecar requires macOS 10.15 or later. Current: ${osVersion}`);
            }

            // Verify apple ecosystem testing script exists
            if (this.scriptsPath) {
                const appleScript = path.join(this.scriptsPath, 'apple-ecosystem-testing.js');
                if (!fs.existsSync(appleScript)) {
                    console.warn('Apple ecosystem testing script not found');
                }
            }

            // Check current Sidecar status
            await this.checkSidecarStatus();

            // Start periodic status monitoring
            this.startStatusMonitoring();

            console.log('✅ Sidecar Service initialized');
            return { success: true, status: this.sidecarStatus };

        } catch (error) {
            console.error('❌ Sidecar Service initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    findScriptsPath() {
        const possiblePaths = [
            path.join(__dirname, '../../../scripts'),
            path.join(__dirname, '../../scripts'),
            path.join(__dirname, '../scripts'),
            path.join(process.cwd(), 'scripts'),
            path.join(process.cwd(), '../scripts')
        ];

        for (const scriptsPath of possiblePaths) {
            if (fs.existsSync(scriptsPath)) {
                const testFile = path.join(scriptsPath, 'apple-ecosystem-testing.js');
                if (fs.existsSync(testFile)) {
                    return scriptsPath;
                }
            }
        }

        return null;
    }

    getMacOSVersion() {
        try {
            const version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
            return version;
        } catch (error) {
            console.error('Failed to get macOS version:', error);
            return 'unknown';
        }
    }

    isSidecarSupported(version) {
        if (version === 'unknown') return false;

        const [major, minor] = version.split('.').map(Number);
        return major > 10 || (major === 10 && minor >= 15);
    }

    async checkSidecarStatus() {
        try {
            // Check if Sidecar is enabled using system preferences
            const sidecarCheck = execSync(
                'defaults read com.apple.sidecar.display allowAllDevices 2>/dev/null || echo "false"',
                { encoding: 'utf8' }
            ).trim();

            // Check for connected iPad devices
            const deviceCheck = execSync(
                'system_profiler SPUSBDataType | grep -A 5 "iPad" | grep "Serial Number" | wc -l',
                { encoding: 'utf8' }
            ).trim();

            const iPadCount = parseInt(deviceCheck) || 0;

            this.sidecarStatus = {
                enabled: sidecarCheck !== 'false' && sidecarCheck !== '0',
                iPadConnected: iPadCount > 0,
                iPadCount: iPadCount,
                lastCheck: Date.now()
            };

            return this.sidecarStatus;

        } catch (error) {
            console.error('Failed to check Sidecar status:', error);
            this.sidecarStatus.lastCheck = Date.now();
            return this.sidecarStatus;
        }
    }

    async enable() {
        console.log('🔧 Enabling Sidecar...');

        try {
            if (this.scriptsPath) {
                // Use the apple-ecosystem-testing script for enhanced Sidecar setup
                const appleScript = path.join(this.scriptsPath, 'apple-ecosystem-testing.js');
                if (fs.existsSync(appleScript)) {
                    const result = execSync(`node "${appleScript}" sidecar enable`, {
                        cwd: this.scriptsPath,
                        encoding: 'utf8',
                        timeout: 10000
                    });

                    console.log('Sidecar setup result:', result);
                }
            }

            // Enable Sidecar system setting
            execSync('defaults write com.apple.sidecar.display allowAllDevices -bool true', {
                timeout: 5000
            });

            // Wait a moment for the setting to take effect
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check status
            await this.checkSidecarStatus();

            if (this.sidecarStatus.enabled) {
                console.log('✅ Sidecar enabled successfully');
                return {
                    success: true,
                    status: this.sidecarStatus,
                    message: 'Sidecar has been enabled. Connect your iPad Pro to use it as a second display.'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to enable Sidecar - check System Preferences manually'
                };
            }

        } catch (error) {
            console.error('❌ Failed to enable Sidecar:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async disable() {
        console.log('🔧 Disabling Sidecar...');

        try {
            if (this.scriptsPath) {
                // Use the apple-ecosystem-testing script
                const appleScript = path.join(this.scriptsPath, 'apple-ecosystem-testing.js');
                if (fs.existsSync(appleScript)) {
                    const result = execSync(`node "${appleScript}" sidecar disable`, {
                        cwd: this.scriptsPath,
                        encoding: 'utf8',
                        timeout: 10000
                    });

                    console.log('Sidecar disable result:', result);
                }
            }

            // Disable Sidecar system setting
            execSync('defaults write com.apple.sidecar.display allowAllDevices -bool false', {
                timeout: 5000
            });

            // Wait for the setting to take effect
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check status
            await this.checkSidecarStatus();

            console.log('✅ Sidecar disabled');
            return {
                success: true,
                status: this.sidecarStatus
            };

        } catch (error) {
            console.error('❌ Failed to disable Sidecar:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getStatus() {
        await this.checkSidecarStatus();
        return {
            success: true,
            status: this.sidecarStatus,
            capabilities: {
                supported: this.isSidecarSupported(this.getMacOSVersion()),
                platform: process.platform,
                macOSVersion: this.getMacOSVersion()
            }
        };
    }

    async setupResponsiveTesting() {
        console.log('📱 Setting up responsive testing environment...');

        try {
            if (!this.scriptsPath) {
                throw new Error('Apple ecosystem testing scripts not available');
            }

            const appleScript = path.join(this.scriptsPath, 'apple-ecosystem-testing.js');
            const result = execSync(`node "${appleScript}" responsive`, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 15000
            });

            console.log('✅ Responsive testing environment setup complete');
            return {
                success: true,
                output: result,
                message: 'iPad Pro configured for responsive testing'
            };

        } catch (error) {
            console.error('❌ Responsive testing setup failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async startMirrorSession(url = 'http://localhost:5173') {
        console.log('🪞 Starting mirror testing session...');

        try {
            if (!this.sidecarStatus.enabled || !this.sidecarStatus.iPadConnected) {
                throw new Error('Sidecar not enabled or iPad not connected');
            }

            // Open browser on iPad display
            const safariCommand = `open -a Safari "${url}"`;
            execSync(safariCommand, { timeout: 5000 });

            // Move Safari to iPad display (requires additional AppleScript)
            const moveToiPad = `
                osascript -e '
                tell application "System Events"
                    tell process "Safari"
                        set frontmost to true
                        -- Move window to secondary display (iPad)
                        set position of window 1 to {1440, 0}
                    end tell
                end tell'
            `;

            execSync(moveToiPad, { timeout: 5000 });

            console.log('✅ Mirror session started on iPad');
            return {
                success: true,
                url: url,
                message: 'Browser opened on iPad Pro display'
            };

        } catch (error) {
            console.error('❌ Mirror session failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async syncBrowserSession(sessionData) {
        console.log('🔄 Syncing browser session with iPad...');

        try {
            if (!this.sidecarStatus.iPadConnected) {
                throw new Error('iPad not connected');
            }

            // Use the apple ecosystem script for advanced sync
            if (this.scriptsPath) {
                const appleScript = path.join(this.scriptsPath, 'apple-ecosystem-testing.js');

                const syncData = {
                    url: sessionData.url,
                    viewport: sessionData.viewport,
                    timestamp: Date.now()
                };

                const tempFile = path.join(this.scriptsPath, `temp_sync_${Date.now()}.json`);
                fs.writeFileSync(tempFile, JSON.stringify(syncData, null, 2));

                const result = execSync(`node "${appleScript}" sync "${tempFile}"`, {
                    cwd: this.scriptsPath,
                    encoding: 'utf8',
                    timeout: 10000
                });

                // Clean up temp file
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }

                console.log('✅ Browser session synced with iPad');
                return {
                    success: true,
                    output: result
                };
            }

            // Fallback: basic URL sync
            await this.startMirrorSession(sessionData.url);
            return {
                success: true,
                message: 'Basic sync completed'
            };

        } catch (error) {
            console.error('❌ Browser sync failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    startStatusMonitoring() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }

        // Check status every 30 seconds
        this.statusCheckInterval = setInterval(() => {
            this.checkSidecarStatus();
        }, 30000);
    }

    stopStatusMonitoring() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    async getConnectedDevices() {
        try {
            // Get detailed device information
            const deviceInfo = execSync(
                'system_profiler SPUSBDataType | grep -A 10 "iPad"',
                { encoding: 'utf8' }
            );

            const devices = this.parseDeviceInfo(deviceInfo);

            return {
                success: true,
                devices: devices,
                count: devices.length
            };

        } catch (error) {
            console.error('Failed to get connected devices:', error);
            return {
                success: false,
                error: error.message,
                devices: [],
                count: 0
            };
        }
    }

    parseDeviceInfo(deviceInfo) {
        const devices = [];
        const lines = deviceInfo.split('\n');

        let currentDevice = null;
        for (const line of lines) {
            if (line.includes('iPad')) {
                if (currentDevice) {
                    devices.push(currentDevice);
                }
                currentDevice = {
                    name: line.trim(),
                    type: 'iPad'
                };
            } else if (currentDevice) {
                if (line.includes('Serial Number')) {
                    currentDevice.serialNumber = line.split(':')[1]?.trim();
                } else if (line.includes('Version')) {
                    currentDevice.version = line.split(':')[1]?.trim();
                }
            }
        }

        if (currentDevice) {
            devices.push(currentDevice);
        }

        return devices;
    }

    // Cleanup method
    async cleanup() {
        console.log('🧹 Cleaning up Sidecar Service...');

        this.stopStatusMonitoring();

        // Clean up any temp files
        if (this.scriptsPath) {
            const tempFiles = fs.readdirSync(this.scriptsPath).filter(file =>
                file.startsWith('temp_sync_') && file.endsWith('.json')
            );

            for (const file of tempFiles) {
                try {
                    fs.unlinkSync(path.join(this.scriptsPath, file));
                } catch (error) {
                    console.warn(`Failed to clean temp file ${file}:`, error.message);
                }
            }
        }

        console.log('✅ Sidecar Service cleanup complete');
    }
}