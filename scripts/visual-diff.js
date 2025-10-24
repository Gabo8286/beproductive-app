#!/usr/bin/env node

/**
 * Visual Diff Engine
 * Compares screenshots and highlights differences for regression detection
 * Usage: node scripts/visual-diff.js [command] [options]
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VisualDiff {
  constructor() {
    this.diffDir = path.join(process.cwd(), 'visual-diffs');
    this.threshold = this.getThreshold();
    this.verbose = process.argv.includes('--verbose');
    this.format = 'png';
    this.highlightColor = '#ff0000'; // Red for differences
  }

  getThreshold() {
    const thresholdArg = process.argv.find(arg => arg.startsWith('--threshold='));
    if (thresholdArg) {
      return parseFloat(thresholdArg.split('=')[1]);
    }
    return 0.1; // Default 0.1% difference threshold
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureDiffDir() {
    try {
      await fs.access(this.diffDir);
    } catch {
      await fs.mkdir(this.diffDir, { recursive: true });
      this.log(`Created visual diffs directory: ${this.diffDir}`);
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

  async checkImageMagick() {
    try {
      await this.runCommand('convert', ['-version']);
      return true;
    } catch {
      this.log('ImageMagick not found. Installing via Homebrew...', 'warning');
      try {
        await this.runCommand('brew', ['install', 'imagemagick']);
        this.log('ImageMagick installed successfully', 'success');
        return true;
      } catch (error) {
        this.log('Failed to install ImageMagick. Please install manually: brew install imagemagick', 'error');
        return false;
      }
    }
  }

  generateDiffFilename(baseImage, compareImage) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = path.basename(baseImage, path.extname(baseImage));
    const compareName = path.basename(compareImage, path.extname(compareImage));
    return `diff-${baseName}-vs-${compareName}-${timestamp}.png`;
  }

  async compareImages(baseImage, compareImage, outputPath = null) {
    await this.ensureDiffDir();

    if (!(await this.checkImageMagick())) {
      throw new Error('ImageMagick is required for image comparison');
    }

    const diffFilename = outputPath || this.generateDiffFilename(baseImage, compareImage);
    const diffPath = path.isAbsolute(diffFilename) ? diffFilename : path.join(this.diffDir, diffFilename);

    try {
      this.log(`Comparing images: ${baseImage} vs ${compareImage}`);

      // Use ImageMagick compare command
      const { stdout } = await this.runCommand('compare', [
        '-metric', 'AE',
        '-fuzz', `${this.threshold}%`,
        '-highlight-color', this.highlightColor,
        baseImage,
        compareImage,
        diffPath
      ]);

      // Parse the number of different pixels
      const pixelDifference = parseInt(stdout.trim()) || 0;

      this.log(`Comparison completed. Different pixels: ${pixelDifference}`, 'success');
      return {
        diffPath,
        pixelDifference,
        hasDifferences: pixelDifference > 0
      };
    } catch (error) {
      // ImageMagick returns exit code 1 when images differ, which is expected
      if (error.message.includes('different')) {
        const pixelDifference = parseInt(error.message.match(/\d+/)?.[0]) || 0;
        this.log(`Images differ. Different pixels: ${pixelDifference}`, 'warning');
        return {
          diffPath,
          pixelDifference,
          hasDifferences: true
        };
      }
      this.log(`Image comparison failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async createSideBySide(baseImage, compareImage, diffImage, outputPath = null) {
    await this.ensureDiffDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sideBySidePath = outputPath || path.join(this.diffDir, `side-by-side-${timestamp}.png`);

    try {
      this.log('Creating side-by-side comparison...');

      // Create a horizontal montage of the three images
      await this.runCommand('montage', [
        baseImage,
        compareImage,
        diffImage,
        '-tile', '3x1',
        '-geometry', '+10+10',
        '-border', '2',
        '-bordercolor', '#cccccc',
        sideBySidePath
      ]);

      this.log(`Side-by-side comparison created: ${sideBySidePath}`, 'success');
      return sideBySidePath;
    } catch (error) {
      this.log(`Failed to create side-by-side: ${error.message}`, 'error');
      throw error;
    }
  }

  async calculateSimilarity(baseImage, compareImage) {
    try {
      // Use PSNR (Peak Signal-to-Noise Ratio) metric
      const { stdout } = await this.runCommand('compare', [
        '-metric', 'PSNR',
        baseImage,
        compareImage,
        'null:'
      ]);

      const psnr = parseFloat(stdout.trim());

      // Convert PSNR to similarity percentage (rough approximation)
      const similarity = psnr === Infinity ? 100 : Math.min(100, Math.max(0, (psnr - 20) / 30 * 100));

      return {
        psnr,
        similarity: Math.round(similarity * 100) / 100
      };
    } catch (error) {
      if (error.message.includes('inf')) {
        return { psnr: Infinity, similarity: 100 };
      }
      throw error;
    }
  }

  async getImageInfo(imagePath) {
    try {
      const { stdout } = await this.runCommand('identify', ['-format', '%w %h %b', imagePath]);
      const [width, height, size] = stdout.trim().split(' ');

      return {
        width: parseInt(width),
        height: parseInt(height),
        size,
        path: imagePath
      };
    } catch (error) {
      this.log(`Failed to get image info: ${error.message}`, 'error');
      throw error;
    }
  }

  async resizeToMatch(imagePath, targetWidth, targetHeight, outputPath = null) {
    const resizedPath = outputPath || imagePath.replace(/(\.[^.]+)$/, '_resized$1');

    try {
      await this.runCommand('convert', [
        imagePath,
        '-resize', `${targetWidth}x${targetHeight}!`,
        resizedPath
      ]);

      this.log(`Image resized to ${targetWidth}x${targetHeight}: ${resizedPath}`);
      return resizedPath;
    } catch (error) {
      this.log(`Failed to resize image: ${error.message}`, 'error');
      throw error;
    }
  }

  async compareWithResize(baseImage, compareImage, outputPath = null) {
    // Get image dimensions
    const baseInfo = await this.getImageInfo(baseImage);
    const compareInfo = await this.getImageInfo(compareImage);

    this.log(`Base image: ${baseInfo.width}x${baseInfo.height} (${baseInfo.size})`);
    this.log(`Compare image: ${compareInfo.width}x${compareInfo.height} (${compareInfo.size})`);

    // Resize if dimensions don't match
    let processedCompareImage = compareImage;
    if (baseInfo.width !== compareInfo.width || baseInfo.height !== compareInfo.height) {
      this.log('Images have different dimensions. Resizing for comparison...', 'warning');
      const tempPath = path.join(this.diffDir, `temp_resized_${Date.now()}.png`);
      processedCompareImage = await this.resizeToMatch(compareImage, baseInfo.width, baseInfo.height, tempPath);
    }

    // Perform comparison
    const result = await this.compareImages(baseImage, processedCompareImage, outputPath);

    // Calculate similarity
    const similarity = await this.calculateSimilarity(baseImage, processedCompareImage);

    // Clean up temp file if created
    if (processedCompareImage !== compareImage) {
      try {
        await fs.unlink(processedCompareImage);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    return {
      ...result,
      ...similarity,
      baseInfo,
      compareInfo
    };
  }

  async createDetailedReport(baseImage, compareImage, outputPath = null) {
    const reportTime = new Date().toISOString();
    const result = await this.compareWithResize(baseImage, compareImage);

    // Create side-by-side comparison if differences found
    let sideBySidePath = null;
    if (result.hasDifferences) {
      sideBySidePath = await this.createSideBySide(baseImage, compareImage, result.diffPath);
    }

    const report = {
      timestamp: reportTime,
      baseImage: {
        path: baseImage,
        ...result.baseInfo
      },
      compareImage: {
        path: compareImage,
        ...result.compareInfo
      },
      comparison: {
        pixelDifference: result.pixelDifference,
        psnr: result.psnr,
        similarity: result.similarity,
        hasDifferences: result.hasDifferences,
        threshold: this.threshold,
        diffImage: result.diffPath,
        sideBySideImage: sideBySidePath
      },
      verdict: this.getVerdict(result.similarity, result.pixelDifference)
    };

    // Save report as JSON
    const reportPath = outputPath || path.join(this.diffDir, `report-${reportTime.replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Detailed report saved: ${reportPath}`, 'success');
    return { report, reportPath };
  }

  getVerdict(similarity, pixelDifference) {
    if (similarity >= 99.9) {
      return { status: 'IDENTICAL', message: 'Images are virtually identical' };
    } else if (similarity >= 95) {
      return { status: 'VERY_SIMILAR', message: 'Images are very similar with minor differences' };
    } else if (similarity >= 80) {
      return { status: 'SIMILAR', message: 'Images are similar but have noticeable differences' };
    } else if (similarity >= 50) {
      return { status: 'DIFFERENT', message: 'Images have significant differences' };
    } else {
      return { status: 'VERY_DIFFERENT', message: 'Images are very different' };
    }
  }

  async batchCompare(baseDir, compareDir, pattern = '*.png') {
    const results = [];

    try {
      const baseFiles = await fs.readdir(baseDir);
      const compareFiles = await fs.readdir(compareDir);

      const baseImages = baseFiles.filter(file =>
        file.match(new RegExp(pattern.replace('*', '.*')))
      );

      this.log(`Found ${baseImages.length} base images to compare`);

      for (const baseFile of baseImages) {
        const basePath = path.join(baseDir, baseFile);
        const comparePath = path.join(compareDir, baseFile);

        // Check if corresponding compare image exists
        try {
          await fs.access(comparePath);

          this.log(`Comparing: ${baseFile}`);
          const result = await this.compareWithResize(basePath, comparePath);

          results.push({
            filename: baseFile,
            ...result
          });

        } catch (error) {
          this.log(`Compare image not found for ${baseFile}`, 'warning');
          results.push({
            filename: baseFile,
            error: 'Compare image not found',
            hasDifferences: null
          });
        }
      }

      // Generate batch report
      const batchReport = {
        timestamp: new Date().toISOString(),
        summary: {
          total: results.length,
          identical: results.filter(r => r.similarity >= 99.9).length,
          similar: results.filter(r => r.similarity >= 95 && r.similarity < 99.9).length,
          different: results.filter(r => r.similarity < 95).length,
          errors: results.filter(r => r.error).length
        },
        results
      };

      const batchReportPath = path.join(this.diffDir, `batch-report-${Date.now()}.json`);
      await fs.writeFile(batchReportPath, JSON.stringify(batchReport, null, 2));

      this.log(`Batch comparison completed. Report: ${batchReportPath}`, 'success');
      return batchReport;

    } catch (error) {
      this.log(`Batch comparison failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async openDiff(diffPath) {
    try {
      await this.runCommand('open', [diffPath]);
      this.log(`Opened diff image: ${diffPath}`);
    } catch (error) {
      this.log(`Failed to open diff: ${error.message}`, 'error');
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const diff = new VisualDiff();

  try {
    switch (command) {
      case 'compare':
        const baseImage = process.argv[3];
        const compareImage = process.argv[4];

        if (!baseImage || !compareImage) {
          console.log('Usage: node scripts/visual-diff.js compare <base-image> <compare-image>');
          process.exit(1);
        }

        const result = await diff.compareWithResize(baseImage, compareImage);

        console.log('\n📊 Comparison Results:');
        console.log(`Similarity: ${result.similarity}%`);
        console.log(`Different pixels: ${result.pixelDifference}`);
        console.log(`PSNR: ${result.psnr === Infinity ? 'Perfect match' : result.psnr.toFixed(2)}`);
        console.log(`Verdict: ${diff.getVerdict(result.similarity, result.pixelDifference).message}`);

        if (result.hasDifferences) {
          console.log(`Diff image: ${result.diffPath}`);
          if (process.argv.includes('--open')) {
            await diff.openDiff(result.diffPath);
          }
        }
        break;

      case 'report':
        const reportBase = process.argv[3];
        const reportCompare = process.argv[4];

        if (!reportBase || !reportCompare) {
          console.log('Usage: node scripts/visual-diff.js report <base-image> <compare-image>');
          process.exit(1);
        }

        const { report, reportPath } = await diff.createDetailedReport(reportBase, reportCompare);

        console.log('\n📋 Detailed Report Generated:');
        console.log(`Report file: ${reportPath}`);
        console.log(`Similarity: ${report.comparison.similarity}%`);
        console.log(`Status: ${report.verdict.status}`);
        console.log(`Message: ${report.verdict.message}`);

        if (report.comparison.sideBySideImage) {
          console.log(`Side-by-side: ${report.comparison.sideBySideImage}`);
          if (process.argv.includes('--open')) {
            await diff.openDiff(report.comparison.sideBySideImage);
          }
        }
        break;

      case 'batch':
        const baseDir = process.argv[3];
        const compareDir = process.argv[4];
        const pattern = process.argv[5] || '*.png';

        if (!baseDir || !compareDir) {
          console.log('Usage: node scripts/visual-diff.js batch <base-dir> <compare-dir> [pattern]');
          process.exit(1);
        }

        const batchResult = await diff.batchCompare(baseDir, compareDir, pattern);

        console.log('\n📊 Batch Comparison Summary:');
        console.log(`Total images: ${batchResult.summary.total}`);
        console.log(`Identical: ${batchResult.summary.identical}`);
        console.log(`Similar: ${batchResult.summary.similar}`);
        console.log(`Different: ${batchResult.summary.different}`);
        console.log(`Errors: ${batchResult.summary.errors}`);
        break;

      default:
        console.log(`
Visual Diff Engine

Usage: node scripts/visual-diff.js [command] [options]

Commands:
  compare <base> <compare>         - Compare two images
  report <base> <compare>          - Generate detailed comparison report
  batch <base-dir> <compare-dir>   - Batch compare directories

Options:
  --threshold=<0-100>              - Difference threshold percentage (default: 0.1)
  --open                           - Open result images automatically
  --verbose                        - Enable verbose logging

Examples:
  node scripts/visual-diff.js compare old.png new.png
  node scripts/visual-diff.js report baseline.png current.png --open
  node scripts/visual-diff.js batch ./baseline ./current "*.png"
  node scripts/visual-diff.js compare old.png new.png --threshold=1.0

Requirements:
  - ImageMagick (automatically installed via Homebrew if missing)
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { VisualDiff };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}