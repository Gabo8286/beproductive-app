#!/usr/bin/env node

/**
 * Visual Recognition Module for RPA Testing
 * Extends screenshot capabilities with computer vision and template matching
 * Usage: node scripts/visual-recognition.js [command] [options]
 */

import { ScreenshotCapture } from './screenshot-capture.js';
// Dynamic import for jimp to handle potential ES module issues
let Jimp;
import pixelmatch from 'pixelmatch';
import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VisualRecognition extends ScreenshotCapture {
  constructor() {
    super();
    this.templatesDir = path.join(process.cwd(), 'rpa-templates');
    this.confidence = 0.8; // Default confidence threshold (0-1)
    this.tolerance = 0.1;   // Pixel difference tolerance (0-1)
    this.jimpInitialized = false;
  }

  async initJimp() {
    if (!this.jimpInitialized) {
      try {
        const jimpModule = await import('jimp');
        Jimp = jimpModule.default || jimpModule.Jimp || jimpModule;
        this.jimpInitialized = true;
      } catch (error) {
        this.log(`Failed to initialize Jimp: ${error.message}`, 'error');
        throw error;
      }
    }
  }

  async ensureTemplatesDir() {
    try {
      await fs.access(this.templatesDir);
    } catch {
      await fs.mkdir(this.templatesDir, { recursive: true });
      this.log(`Created RPA templates directory: ${this.templatesDir}`);
    }
  }

  /**
   * Load and process an image using Jimp
   */
  async loadImage(imagePath) {
    try {
      await this.initJimp();
      const image = await Jimp.read(imagePath);
      return image;
    } catch (error) {
      this.log(`Failed to load image ${imagePath}: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Save a template image for future recognition
   */
  async saveTemplate(templateName, sourceImage, x, y, width, height) {
    await this.ensureTemplatesDir();

    try {
      const image = await this.loadImage(sourceImage);
      const template = image.crop(x, y, width, height);

      const templatePath = path.join(this.templatesDir, `${templateName}.png`);
      await template.writeAsync(templatePath);

      this.log(`Template saved: ${templatePath}`, 'success');
      return templatePath;
    } catch (error) {
      this.log(`Failed to save template: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Find template in source image using basic template matching
   */
  async findTemplate(sourceImagePath, templatePath, options = {}) {
    const {
      confidence = this.confidence,
      tolerance = this.tolerance,
      multiple = false
    } = options;

    try {
      const sourceImage = await this.loadImage(sourceImagePath);
      const templateImage = await this.loadImage(templatePath);

      const sourceWidth = sourceImage.getWidth();
      const sourceHeight = sourceImage.getHeight();
      const templateWidth = templateImage.getWidth();
      const templateHeight = templateImage.getHeight();

      this.log(`Searching for template (${templateWidth}x${templateHeight}) in source (${sourceWidth}x${sourceHeight})`);

      const matches = [];
      let bestMatch = null;
      let bestScore = 0;

      // Sliding window approach
      for (let y = 0; y <= sourceHeight - templateHeight; y += 2) {
        for (let x = 0; x <= sourceWidth - templateWidth; x += 2) {
          // Extract region from source image
          const region = sourceImage.clone().crop(x, y, templateWidth, templateHeight);

          // Calculate similarity score
          const score = await this.calculateSimilarity(region, templateImage, tolerance);

          if (score >= confidence) {
            const match = {
              x,
              y,
              width: templateWidth,
              height: templateHeight,
              centerX: x + templateWidth / 2,
              centerY: y + templateHeight / 2,
              confidence: score
            };

            matches.push(match);

            if (score > bestScore) {
              bestScore = score;
              bestMatch = match;
            }

            if (!multiple) {
              // Return first match if not looking for multiple
              this.log(`Template found at (${x}, ${y}) with confidence ${score.toFixed(3)}`, 'success');
              return bestMatch;
            }
          }
        }
      }

      if (multiple && matches.length > 0) {
        this.log(`Found ${matches.length} template matches`, 'success');
        return matches.sort((a, b) => b.confidence - a.confidence);
      }

      if (bestMatch) {
        this.log(`Template found at (${bestMatch.x}, ${bestMatch.y}) with confidence ${bestMatch.confidence.toFixed(3)}`, 'success');
        return bestMatch;
      }

      this.log(`Template not found (best score: ${bestScore.toFixed(3)}, required: ${confidence})`, 'warning');
      return null;

    } catch (error) {
      this.log(`Template matching failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Calculate similarity between two images using pixel comparison
   */
  async calculateSimilarity(image1, image2, tolerance = 0.1) {
    try {
      const width = Math.min(image1.getWidth(), image2.getWidth());
      const height = Math.min(image1.getHeight(), image2.getHeight());

      // Resize images to same size if needed
      const img1 = image1.clone().resize(width, height);
      const img2 = image2.clone().resize(width, height);

      // Get image data as buffers
      const data1 = img1.bitmap.data;
      const data2 = img2.bitmap.data;

      // Use pixelmatch for comparison
      const threshold = tolerance * 255; // Convert tolerance to 0-255 range
      const diffPixels = pixelmatch(data1, data2, null, width, height, { threshold });

      const totalPixels = width * height;
      const similarity = 1 - (diffPixels / totalPixels);

      return Math.max(0, Math.min(1, similarity));
    } catch (error) {
      this.log(`Similarity calculation failed: ${error.message}`, 'error');
      return 0;
    }
  }

  /**
   * Simulate mouse click at specific coordinates
   */
  async clickAt(x, y, options = {}) {
    const {
      button = 'left',
      doubleClick = false,
      delay = 100
    } = options;

    try {
      this.log(`Clicking at coordinates (${x}, ${y})`);

      // Use osascript to simulate mouse click on macOS
      const clickScript = doubleClick
        ? `osascript -e 'tell application "System Events" to tell process "Safari" to set frontmost to true' -e 'tell application "System Events" to click at {${x}, ${y}}' -e 'delay 0.1' -e 'tell application "System Events" to click at {${x}, ${y}}'`
        : `osascript -e 'tell application "System Events" to tell process "Safari" to set frontmost to true' -e 'tell application "System Events" to click at {${x}, ${y}}'`;

      await new Promise((resolve, reject) => {
        exec(clickScript, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Click failed: ${error.message}`));
          } else {
            resolve(stdout);
          }
        });
      });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      this.log(`Click completed at (${x}, ${y})`, 'success');
      return true;
    } catch (error) {
      this.log(`Click failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Find element and click on it
   */
  async findAndClick(sourceImagePath, templatePath, options = {}) {
    try {
      const match = await this.findTemplate(sourceImagePath, templatePath, options);

      if (!match) {
        this.log('Element not found for clicking', 'warning');
        return false;
      }

      await this.clickAt(match.centerX, match.centerY, options);
      return true;
    } catch (error) {
      this.log(`Find and click failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Create a template from current screen by selecting an area
   */
  async createTemplateFromScreen(templateName) {
    try {
      this.log('Take a screenshot to create template from...');
      const screenshotPath = await this.captureFullScreen();

      this.log('Please use an image editor to crop the element you want to template match');
      this.log(`Screenshot saved at: ${screenshotPath}`);
      this.log(`Manually crop the element and save as: ${path.join(this.templatesDir, templateName + '.png')}`);

      // Open the screenshot for manual editing
      await this.runCommand('open', [screenshotPath]);

      return screenshotPath;
    } catch (error) {
      this.log(`Template creation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Verify element is visible on screen
   */
  async verifyElementVisible(templatePath, options = {}) {
    try {
      const screenshotPath = await this.captureFullScreen();
      const match = await this.findTemplate(screenshotPath, templatePath, options);

      if (match) {
        this.log(`Element verified visible with confidence ${match.confidence.toFixed(3)}`, 'success');
        return { visible: true, match };
      } else {
        this.log('Element not visible on screen', 'warning');
        return { visible: false, match: null };
      }
    } catch (error) {
      this.log(`Element verification failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Wait for element to appear on screen
   */
  async waitForElement(templatePath, options = {}) {
    const {
      timeout = 10000,
      interval = 1000,
      confidence = this.confidence
    } = options;

    const startTime = Date.now();

    this.log(`Waiting for element (timeout: ${timeout}ms, interval: ${interval}ms)`);

    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.verifyElementVisible(templatePath, { confidence });
        if (result.visible) {
          this.log(`Element appeared after ${Date.now() - startTime}ms`, 'success');
          return result.match;
        }
      } catch (error) {
        // Continue waiting despite errors
        this.log(`Wait iteration failed: ${error.message}`, 'debug');
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    this.log(`Element did not appear within ${timeout}ms timeout`, 'warning');
    return null;
  }

  /**
   * List available templates
   */
  async listTemplates() {
    try {
      await this.ensureTemplatesDir();
      const files = await fs.readdir(this.templatesDir);
      const templates = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));

      if (templates.length === 0) {
        this.log('No templates found');
        return [];
      }

      this.log(`Found ${templates.length} templates:`);
      for (const template of templates) {
        const templatePath = path.join(this.templatesDir, template);
        const stats = await fs.stat(templatePath);

        // Load image to get dimensions
        try {
          const image = await this.loadImage(templatePath);
          console.log(`  ${template} (${image.getWidth()}x${image.getHeight()}) - ${stats.mtime.toLocaleString()}`);
        } catch {
          console.log(`  ${template} (invalid image) - ${stats.mtime.toLocaleString()}`);
        }
      }

      return templates.map(template => path.join(this.templatesDir, template));
    } catch (error) {
      this.log(`Failed to list templates: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * RPA Workflow: Find, verify, and interact with UI elements
   */
  async executeRPAWorkflow(steps) {
    this.log(`Starting RPA workflow with ${steps.length} steps`);
    const results = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.log(`Executing step ${i + 1}: ${step.action}`);

      try {
        let result;

        switch (step.action) {
          case 'find':
            result = await this.findTemplate(step.source, step.template, step.options);
            break;
          case 'click':
            result = await this.findAndClick(step.source, step.template, step.options);
            break;
          case 'verify':
            result = await this.verifyElementVisible(step.template, step.options);
            break;
          case 'wait':
            result = await this.waitForElement(step.template, step.options);
            break;
          case 'screenshot':
            result = await this.captureFullScreen(step.filename);
            break;
          default:
            throw new Error(`Unknown action: ${step.action}`);
        }

        results.push({
          step: i + 1,
          action: step.action,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });

        this.log(`Step ${i + 1} completed successfully`, 'success');

        // Add delay between steps if specified
        if (step.delay) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }

      } catch (error) {
        this.log(`Step ${i + 1} failed: ${error.message}`, 'error');
        results.push({
          step: i + 1,
          action: step.action,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        if (step.continueOnError !== true) {
          break;
        }
      }
    }

    this.log(`RPA workflow completed. ${results.filter(r => r.success).length}/${results.length} steps successful`);
    return results;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const recognition = new VisualRecognition();

  try {
    switch (command) {
      case 'find':
        const sourceImage = process.argv[3];
        const templateImage = process.argv[4];
        const confidence = parseFloat(process.argv[5]) || 0.8;

        if (!sourceImage || !templateImage) {
          throw new Error('Usage: node visual-recognition.js find <source-image> <template-image> [confidence]');
        }

        const match = await recognition.findTemplate(sourceImage, templateImage, { confidence });
        if (match) {
          console.log(`Template found: (${match.x}, ${match.y}) size: ${match.width}x${match.height} confidence: ${match.confidence.toFixed(3)}`);
        } else {
          console.log('Template not found');
        }
        break;

      case 'click':
        const x = parseInt(process.argv[3]);
        const y = parseInt(process.argv[4]);

        if (isNaN(x) || isNaN(y)) {
          throw new Error('Usage: node visual-recognition.js click <x> <y>');
        }

        await recognition.clickAt(x, y);
        break;

      case 'find-click':
        const sourceImg = process.argv[3];
        const templateImg = process.argv[4];

        if (!sourceImg || !templateImg) {
          throw new Error('Usage: node visual-recognition.js find-click <source-image> <template-image>');
        }

        const clicked = await recognition.findAndClick(sourceImg, templateImg);
        console.log(clicked ? 'Element found and clicked' : 'Element not found');
        break;

      case 'verify':
        const templatePath = process.argv[3];

        if (!templatePath) {
          throw new Error('Usage: node visual-recognition.js verify <template-image>');
        }

        const verification = await recognition.verifyElementVisible(templatePath);
        console.log(verification.visible ? 'Element is visible' : 'Element is not visible');
        break;

      case 'wait':
        const waitTemplate = process.argv[3];
        const timeout = parseInt(process.argv[4]) || 10000;

        if (!waitTemplate) {
          throw new Error('Usage: node visual-recognition.js wait <template-image> [timeout-ms]');
        }

        const waitResult = await recognition.waitForElement(waitTemplate, { timeout });
        console.log(waitResult ? 'Element appeared' : 'Element did not appear within timeout');
        break;

      case 'create-template':
        const templateName = process.argv[3];

        if (!templateName) {
          throw new Error('Usage: node visual-recognition.js create-template <template-name>');
        }

        await recognition.createTemplateFromScreen(templateName);
        break;

      case 'list-templates':
        await recognition.listTemplates();
        break;

      default:
        console.log(`
Visual Recognition RPA Tool

Usage: node scripts/visual-recognition.js [command] [options]

Commands:
  find <source> <template> [confidence]    - Find template in source image
  click <x> <y>                           - Click at coordinates
  find-click <source> <template>          - Find template and click on it
  verify <template>                       - Check if element is visible
  wait <template> [timeout]               - Wait for element to appear
  create-template <name>                  - Create template from screen selection
  list-templates                          - List available templates

Options:
  --verbose                               - Enable verbose logging
  --confidence=<0-1>                      - Set recognition confidence (default: 0.8)
  --tolerance=<0-1>                       - Set pixel difference tolerance (default: 0.1)

Examples:
  node scripts/visual-recognition.js find screenshot.png luna-fab-template.png 0.9
  node scripts/visual-recognition.js find-click screenshot.png button-template.png
  node scripts/visual-recognition.js verify luna-fab-template.png
  node scripts/visual-recognition.js wait loading-spinner.png 5000
  node scripts/visual-recognition.js create-template luna-fab
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
// VisualRecognition is already exported as a class above

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}