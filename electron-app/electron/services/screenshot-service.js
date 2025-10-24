import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Screenshot Service
 *
 * Native macOS screenshot capture integration
 * Bridges with existing screenshot-capture script
 */
export class ScreenshotService {
    constructor() {
        this.scriptsPath = this.findScriptsPath();

        // Use proper user directory for screenshots
        try {
            // Try to use Electron's app.getPath for Documents folder
            const documentsPath = app.getPath('documents');
            this.outputDir = path.join(documentsPath, 'BeProductive Coding Framework', 'Screenshots');
        } catch (error) {
            // Fallback to user home directory if app.getPath fails
            const userHome = os.homedir();
            this.outputDir = path.join(userHome, 'Documents', 'BeProductive Coding Framework', 'Screenshots');
        }

        this.ensureOutputDirectory();
    }

    async initialize() {
        console.log('📸 Initializing Screenshot Service...');

        try {
            // Verify we're on macOS for native screenshot support
            if (process.platform !== 'darwin') {
                console.warn('Native screenshot features are optimized for macOS');
            }

            // Verify screenshot script exists
            if (this.scriptsPath) {
                const screenshotScript = path.join(this.scriptsPath, 'screenshot-capture.js');
                if (!fs.existsSync(screenshotScript)) {
                    console.warn('Screenshot capture script not found');
                }
            }

            // Test screenshot capability
            await this.testScreenshotCapability();

            console.log(`📁 Screenshots will be saved to: ${this.outputDir}`);
            console.log('✅ Screenshot Service initialized');

            return { success: true, outputDir: this.outputDir };

        } catch (error) {
            console.error('❌ Screenshot Service initialization failed:', error);
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
                const testFile = path.join(scriptsPath, 'screenshot-capture.js');
                if (fs.existsSync(testFile)) {
                    return scriptsPath;
                }
            }
        }

        return null;
    }

    ensureOutputDirectory() {
        try {
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
                console.log(`📁 Created screenshots directory: ${this.outputDir}`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to create primary screenshots directory:', error.message);

            // Fallback to a simpler directory in user home
            try {
                const fallbackDir = path.join(os.homedir(), 'BeProductiveCodingFramework-Screenshots');
                this.outputDir = fallbackDir;

                if (!fs.existsSync(fallbackDir)) {
                    fs.mkdirSync(fallbackDir, { recursive: true });
                    console.log(`📁 Created fallback screenshots directory: ${fallbackDir}`);
                }
            } catch (fallbackError) {
                console.error('❌ Failed to create fallback screenshots directory:', fallbackError.message);

                // Last resort: use temp directory
                try {
                    const tempDir = path.join(os.tmpdir(), 'BeProductiveCodingFramework-Screenshots');
                    this.outputDir = tempDir;

                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                        console.log(`📁 Using temp screenshots directory: ${tempDir}`);
                    }
                } catch (tempError) {
                    console.error('❌ Cannot create any screenshots directory:', tempError.message);
                    // Continue without screenshots functionality
                }
            }
        }
    }

    async testScreenshotCapability() {
        try {
            if (process.platform === 'darwin') {
                // Test native macOS screencapture command
                execSync('which screencapture', { timeout: 1000 });
                return { success: true, method: 'native_macos' };
            } else {
                // For other platforms, we'd need alternative methods
                return { success: false, error: 'Native screenshot not supported on this platform' };
            }
        } catch (error) {
            throw new Error('Screenshot capability test failed');
        }
    }

    async capture(options = {}) {
        console.log('📸 Capturing screenshot...');

        const defaultOptions = {
            type: 'fullscreen',
            format: 'png',
            quality: 100,
            delay: 0,
            filename: null,
            ...options
        };

        try {
            let result;

            if (this.scriptsPath) {
                // Use the enhanced screenshot-capture script
                result = await this.captureWithScript(defaultOptions);
            } else {
                // Fallback to native macOS screencapture
                result = await this.captureNative(defaultOptions);
            }

            console.log('✅ Screenshot captured successfully');
            return result;

        } catch (error) {
            console.error('❌ Screenshot capture failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async captureWithScript(options) {
        const screenshotScript = path.join(this.scriptsPath, 'screenshot-capture.js');

        // Map options to script arguments
        const args = [options.type];

        if (options.delay > 0) {
            args.push('--delay', options.delay.toString());
        }

        if (options.filename) {
            args.push('--filename', options.filename);
        }

        const command = `node "${screenshotScript}" ${args.join(' ')}`;

        const result = execSync(command, {
            cwd: this.scriptsPath,
            encoding: 'utf8',
            timeout: 30000
        });

        // Parse the result from the script
        try {
            const screenshotData = JSON.parse(result);
            return {
                success: true,
                ...screenshotData,
                capturedAt: Date.now()
            };
        } catch (parseError) {
            // If script doesn't return JSON, treat as success with basic info
            return {
                success: true,
                output: result,
                capturedAt: Date.now()
            };
        }
    }

    async captureNative(options) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = options.filename || `screenshot-${timestamp}.png`;
        const filepath = path.join(this.outputDir, filename);

        let command = 'screencapture';

        // Build screencapture command based on options
        switch (options.type) {
            case 'fullscreen':
                command += ` "${filepath}"`;
                break;

            case 'selection':
                command += ` -s "${filepath}"`;
                break;

            case 'window':
                command += ` -w "${filepath}"`;
                break;

            case 'clipboard':
                command += ' -c';
                break;

            default:
                command += ` "${filepath}"`;
        }

        if (options.delay > 0) {
            command += ` -T ${options.delay}`;
        }

        // Execute the screenshot command
        execSync(command, { timeout: 30000 });

        // Verify the file was created (unless clipboard mode)
        if (options.type !== 'clipboard' && !fs.existsSync(filepath)) {
            throw new Error('Screenshot file was not created');
        }

        return {
            success: true,
            filepath: options.type !== 'clipboard' ? filepath : null,
            filename: filename,
            type: options.type,
            capturedAt: Date.now(),
            size: options.type !== 'clipboard' ? fs.statSync(filepath).size : null
        };
    }

    async captureSequence(urls, options = {}) {
        console.log('📸 Capturing screenshot sequence...');

        const defaultOptions = {
            delay: 2000,
            type: 'fullscreen',
            ...options
        };

        const results = [];

        try {
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                console.log(`Capturing ${i + 1}/${urls.length}: ${url}`);

                // Navigate to URL (would need browser integration)
                // For now, just capture with delay
                await new Promise(resolve => setTimeout(resolve, defaultOptions.delay));

                const filename = `sequence-${i + 1}-${Date.now()}.png`;
                const result = await this.capture({
                    ...defaultOptions,
                    filename: filename
                });

                results.push({
                    url: url,
                    index: i + 1,
                    ...result
                });
            }

            console.log('✅ Screenshot sequence completed');
            return {
                success: true,
                sequence: results,
                total: results.length
            };

        } catch (error) {
            console.error('❌ Screenshot sequence failed:', error);
            return {
                success: false,
                error: error.message,
                partialResults: results
            };
        }
    }

    async captureWithDelay(delay, options = {}) {
        console.log(`⏱️ Capturing screenshot with ${delay}ms delay...`);

        return new Promise((resolve) => {
            setTimeout(async () => {
                const result = await this.capture(options);
                resolve(result);
            }, delay);
        });
    }

    async captureRegion(x, y, width, height, options = {}) {
        console.log('🔲 Capturing specific region...');

        if (process.platform !== 'darwin') {
            return {
                success: false,
                error: 'Region capture only supported on macOS'
            };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = options.filename || `region-${timestamp}.png`;
        const filepath = path.join(this.outputDir, filename);

        try {
            const command = `screencapture -R ${x},${y},${width},${height} "${filepath}"`;
            execSync(command, { timeout: 10000 });

            if (!fs.existsSync(filepath)) {
                throw new Error('Region screenshot file was not created');
            }

            console.log('✅ Region screenshot captured');
            return {
                success: true,
                filepath: filepath,
                filename: filename,
                region: { x, y, width, height },
                capturedAt: Date.now(),
                size: fs.statSync(filepath).size
            };

        } catch (error) {
            console.error('❌ Region capture failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async listScreenshots(limit = 20) {
        try {
            const files = fs.readdirSync(this.outputDir)
                .filter(file => file.match(/\.(png|jpg|jpeg)$/i))
                .map(file => {
                    const filepath = path.join(this.outputDir, file);
                    const stats = fs.statSync(filepath);
                    return {
                        filename: file,
                        filepath: filepath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created)
                .slice(0, limit);

            return {
                success: true,
                screenshots: files,
                total: files.length,
                outputDir: this.outputDir
            };

        } catch (error) {
            console.error('Failed to list screenshots:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteScreenshot(filename) {
        try {
            const filepath = path.join(this.outputDir, filename);

            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    error: 'Screenshot not found'
                };
            }

            fs.unlinkSync(filepath);

            console.log(`🗑️ Screenshot deleted: ${filename}`);
            return {
                success: true,
                filename: filename
            };

        } catch (error) {
            console.error('Failed to delete screenshot:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cleanupOldScreenshots(daysOld = 7) {
        console.log(`🧹 Cleaning up screenshots older than ${daysOld} days...`);

        try {
            const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
            const files = fs.readdirSync(this.outputDir);

            let deletedCount = 0;

            for (const file of files) {
                if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;

                const filepath = path.join(this.outputDir, file);
                const stats = fs.statSync(filepath);

                if (stats.birthtime < cutoffDate) {
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            }

            console.log(`✅ Cleanup complete: ${deletedCount} screenshots deleted`);
            return {
                success: true,
                deleted: deletedCount,
                cutoffDate: cutoffDate
            };

        } catch (error) {
            console.error('Screenshot cleanup failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Cleanup method
    async cleanup() {
        console.log('🧹 Cleaning up Screenshot Service...');
        // Screenshot service doesn't need special cleanup
        console.log('✅ Screenshot Service cleanup complete');
    }
}