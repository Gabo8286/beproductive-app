#!/usr/bin/env node

/**
 * Asset Optimization Script
 * Optimizes images, fonts, and other static assets for production deployment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class AssetOptimizer {
  constructor() {
    this.results = {
      images: { original: 0, optimized: 0, savings: 0 },
      fonts: { original: 0, optimized: 0, savings: 0 },
      css: { original: 0, optimized: 0, savings: 0 },
      js: { original: 0, optimized: 0, savings: 0 },
      total: { original: 0, optimized: 0, savings: 0 }
    };
    this.errors = [];
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileSize(filePath) {
    try {
      return statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  optimizeImages() {
    console.log('\n🖼️  Optimizing Images...');

    const distDir = join(rootDir, 'dist');
    const publicDir = join(rootDir, 'public');

    const imageDirs = [
      join(distDir, 'assets', 'img'),
      join(publicDir),
      join(rootDir, 'src', 'assets', 'images')
    ].filter(dir => existsSync(dir));

    let optimizedCount = 0;

    imageDirs.forEach(dir => {
      try {
        const files = readdirSync(dir, { recursive: true });

        files.forEach(file => {
          const filePath = join(dir, file);

          if (!statSync(filePath).isFile()) return;

          const ext = extname(filePath).toLowerCase();
          if (!['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) return;

          const originalSize = this.getFileSize(filePath);

          try {
            // For SVG files, use SVGO optimization
            if (ext === '.svg') {
              this.optimizeSVG(filePath);
            } else {
              // For raster images, log recommendation
              console.log(`📷 ${file} (${this.formatBytes(originalSize)}) - Consider WebP conversion`);
            }

            const optimizedSize = this.getFileSize(filePath);
            const savings = originalSize - optimizedSize;

            this.results.images.original += originalSize;
            this.results.images.optimized += optimizedSize;
            this.results.images.savings += savings;

            optimizedCount++;
          } catch (error) {
            this.errors.push(`Failed to optimize ${file}: ${error.message}`);
          }
        });
      } catch (error) {
        console.warn(`Could not read directory ${dir}: ${error.message}`);
      }
    });

    console.log(`✓ Processed ${optimizedCount} images`);
  }

  optimizeSVG(filePath) {
    try {
      // Basic SVG optimization without external dependencies
      let content = readFileSync(filePath, 'utf8');

      // Remove comments
      content = content.replace(/<!--[\s\S]*?-->/g, '');

      // Remove unnecessary whitespace
      content = content.replace(/>\s+</g, '><');

      // Remove empty attributes
      content = content.replace(/\s+([a-zA-Z-]+)=""/g, '');

      writeFileSync(filePath, content);

      console.log(`✓ Optimized SVG: ${basename(filePath)}`);
    } catch (error) {
      throw new Error(`SVG optimization failed: ${error.message}`);
    }
  }

  optimizeFonts() {
    console.log('\n🔤 Analyzing Fonts...');

    const fontDirs = [
      join(rootDir, 'dist', 'assets', 'fonts'),
      join(rootDir, 'public', 'fonts'),
      join(rootDir, 'src', 'assets', 'fonts')
    ].filter(dir => existsSync(dir));

    let fontCount = 0;

    fontDirs.forEach(dir => {
      try {
        const files = readdirSync(dir, { recursive: true });

        files.forEach(file => {
          const filePath = join(dir, file);

          if (!statSync(filePath).isFile()) return;

          const ext = extname(filePath).toLowerCase();
          if (!['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return;

          const size = this.getFileSize(filePath);
          this.results.fonts.original += size;
          this.results.fonts.optimized += size; // No optimization applied, just measurement

          console.log(`📝 ${file} (${this.formatBytes(size)}) - ${ext === '.woff2' ? '✓ Optimal' : '⚠️ Consider WOFF2'}`);
          fontCount++;
        });
      } catch (error) {
        console.warn(`Could not read font directory ${dir}: ${error.message}`);
      }
    });

    console.log(`✓ Analyzed ${fontCount} font files`);
  }

  generateWebPVariants() {
    console.log('\n🌐 WebP Conversion Recommendations...');

    const distDir = join(rootDir, 'dist');
    if (!existsSync(distDir)) {
      console.log('ℹ️  Build directory not found. Run build first.');
      return;
    }

    const imageFiles = [];
    const walkDir = (dir) => {
      try {
        const files = readdirSync(dir);
        files.forEach(file => {
          const filePath = join(dir, file);
          const stat = statSync(filePath);

          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (/\.(png|jpe?g)$/i.test(file)) {
            imageFiles.push(filePath);
          }
        });
      } catch (error) {
        // Ignore errors for inaccessible directories
      }
    };

    walkDir(distDir);

    if (imageFiles.length > 0) {
      console.log('📸 Images that could benefit from WebP conversion:');
      imageFiles.forEach(file => {
        const size = this.getFileSize(file);
        const relativePath = file.replace(rootDir, '');
        console.log(`  • ${relativePath} (${this.formatBytes(size)})`);
      });

      console.log('\n💡 Consider using a CDN service like Cloudflare or AWS CloudFront with automatic WebP conversion');
    } else {
      console.log('✓ No large raster images found');
    }
  }

  generateCDNConfiguration() {
    console.log('\n☁️  Generating CDN Configuration...');

    const cdnConfig = {
      // CloudFront configuration example
      cloudfront: {
        origins: {
          static: '${VITE_CDN_URL}',
          api: '${VITE_API_BASE_URL}'
        },
        behaviors: {
          '/assets/*': {
            cachingPolicy: 'CachingOptimized',
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD'],
            headers: {
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          },
          '/api/*': {
            cachingPolicy: 'CachingDisabled',
            originRequestPolicy: 'CORS-S3Origin',
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE']
          },
          'default': {
            cachingPolicy: 'CachingOptimized',
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            headers: {
              'Cache-Control': 'public, max-age=86400'
            }
          }
        }
      },

      // Cloudflare configuration example
      cloudflare: {
        caching: {
          browserCacheTtl: 31536000,
          edgeCacheTtl: 31536000,
          cacheEverything: true
        },
        performance: {
          minify: {
            css: true,
            js: true,
            html: true
          },
          brotli: true,
          earlyHints: true,
          http2: true,
          http3: true
        },
        optimization: {
          autoMinify: true,
          polish: 'webp',
          mirage: true,
          rocketLoader: false
        }
      },

      // Service Worker caching strategies
      serviceWorker: {
        staticAssets: {
          strategy: 'CacheFirst',
          maxEntries: 100,
          maxAgeSeconds: 31536000 // 1 year
        },
        apiRequests: {
          strategy: 'NetworkFirst',
          maxEntries: 50,
          maxAgeSeconds: 86400, // 1 day
          networkTimeoutSeconds: 10
        },
        images: {
          strategy: 'CacheFirst',
          maxEntries: 200,
          maxAgeSeconds: 2592000 // 30 days
        }
      }
    };

    const configPath = join(rootDir, 'cdn-config.json');
    writeFileSync(configPath, JSON.stringify(cdnConfig, null, 2));

    console.log(`✓ CDN configuration saved to ${configPath}`);
  }

  generateAssetManifest() {
    console.log('\n📋 Generating Asset Manifest...');

    const distDir = join(rootDir, 'dist');
    if (!existsSync(distDir)) {
      console.log('ℹ️  Build directory not found. Run build first.');
      return;
    }

    const manifest = {
      timestamp: new Date().toISOString(),
      assets: {
        css: [],
        js: [],
        images: [],
        fonts: [],
        other: []
      },
      totalSize: 0,
      gzippedSize: 0
    };

    const walkDir = (dir, baseDir = dir) => {
      try {
        const files = readdirSync(dir);
        files.forEach(file => {
          const filePath = join(dir, file);
          const stat = statSync(filePath);

          if (stat.isDirectory()) {
            walkDir(filePath, baseDir);
          } else {
            const size = stat.size;
            const relativePath = filePath.replace(baseDir + '/', '');
            const ext = extname(file).toLowerCase();

            const assetInfo = {
              path: relativePath,
              size: size,
              sizeFormatted: this.formatBytes(size),
              lastModified: stat.mtime.toISOString()
            };

            if (['.css'].includes(ext)) {
              manifest.assets.css.push(assetInfo);
            } else if (['.js', '.mjs'].includes(ext)) {
              manifest.assets.js.push(assetInfo);
            } else if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'].includes(ext)) {
              manifest.assets.images.push(assetInfo);
            } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
              manifest.assets.fonts.push(assetInfo);
            } else {
              manifest.assets.other.push(assetInfo);
            }

            manifest.totalSize += size;
          }
        });
      } catch (error) {
        console.warn(`Could not read directory ${dir}: ${error.message}`);
      }
    };

    walkDir(distDir);

    // Sort by size (largest first)
    Object.keys(manifest.assets).forEach(type => {
      manifest.assets[type].sort((a, b) => b.size - a.size);
    });

    manifest.totalSizeFormatted = this.formatBytes(manifest.totalSize);

    const manifestPath = join(rootDir, 'asset-manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✓ Asset manifest saved to ${manifestPath}`);
    console.log(`📊 Total assets: ${this.formatBytes(manifest.totalSize)}`);
  }

  generateReport() {
    console.log('\n📊 Asset Optimization Report');
    console.log('============================');

    const totalOriginal = this.results.images.original + this.results.fonts.original;
    const totalOptimized = this.results.images.optimized + this.results.fonts.optimized;
    const totalSavings = totalOriginal - totalOptimized;

    console.log(`🖼️  Images: ${this.formatBytes(this.results.images.original)} → ${this.formatBytes(this.results.images.optimized)}`);
    console.log(`🔤 Fonts: ${this.formatBytes(this.results.fonts.original)} (analyzed)`);

    if (totalSavings > 0) {
      const savingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);
      console.log(`💾 Total savings: ${this.formatBytes(totalSavings)} (${savingsPercent}%)`);
    }

    if (this.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    console.log('\n🚀 Optimization Complete!');
    console.log('\nNext steps:');
    console.log('  1. Configure CDN using cdn-config.json');
    console.log('  2. Set up automatic WebP conversion');
    console.log('  3. Enable Brotli compression on your server');
    console.log('  4. Configure proper cache headers');
  }

  async run() {
    console.log('⚡ Asset Optimization Tool');
    console.log('=========================');

    this.optimizeImages();
    this.optimizeFonts();
    this.generateWebPVariants();
    this.generateCDNConfiguration();
    this.generateAssetManifest();
    this.generateReport();
  }
}

// Main execution
async function main() {
  const optimizer = new AssetOptimizer();
  await optimizer.run();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Asset Optimization Script

Usage:
  node scripts/optimize-assets.js

This script:
  - Optimizes SVG images
  - Analyzes font usage
  - Generates WebP conversion recommendations
  - Creates CDN configuration
  - Generates asset manifest

Prerequisites:
  - Built application (run 'npm run build' first)
`);
  process.exit(0);
}

main().catch(console.error);