#!/usr/bin/env node

/**
 * iOS App Icon Generator
 * Generates all required iOS app icon sizes from a base design
 */

const fs = require('fs');
const path = require('path');

// Icon specifications for iOS
const iconSizes = [
  { size: 20, scale: 2, filename: 'app-icon-20@2x.png' },    // 40x40
  { size: 20, scale: 3, filename: 'app-icon-20@3x.png' },    // 60x60
  { size: 29, scale: 2, filename: 'app-icon-29@2x.png' },    // 58x58
  { size: 29, scale: 3, filename: 'app-icon-29@3x.png' },    // 87x87
  { size: 40, scale: 2, filename: 'app-icon-40@2x.png' },    // 80x80
  { size: 40, scale: 3, filename: 'app-icon-40@3x.png' },    // 120x120
  { size: 60, scale: 2, filename: 'app-icon-60@2x.png' },    // 120x120
  { size: 60, scale: 3, filename: 'app-icon-60@3x.png' },    // 180x180
  { size: 20, scale: 1, filename: 'app-icon-20.png' },       // 20x20 (iPad)
  { size: 20, scale: 2, filename: 'app-icon-20@2x-ipad.png' }, // 40x40 (iPad)
  { size: 29, scale: 1, filename: 'app-icon-29.png' },       // 29x29 (iPad)
  { size: 29, scale: 2, filename: 'app-icon-29@2x-ipad.png' }, // 58x58 (iPad)
  { size: 40, scale: 1, filename: 'app-icon-40.png' },       // 40x40 (iPad)
  { size: 40, scale: 2, filename: 'app-icon-40@2x-ipad.png' }, // 80x80 (iPad)
  { size: 76, scale: 2, filename: 'app-icon-76@2x.png' },    // 152x152 (iPad)
  { size: 83.5, scale: 2, filename: 'app-icon-83.5@2x.png' }, // 167x167 (iPad Pro)
  { size: 1024, scale: 1, filename: 'app-icon-1024.png' }     // 1024x1024 (App Store)
];

// Create simple colored square icon (BeProductive brand colors)
function createSimpleIcon(size, filename, outputDir) {
  // For now, create a simple SVG that can be converted to PNG
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.15}" fill="white" opacity="0.9"/>
  <rect x="${size * 0.25}" y="${size * 0.55}" width="${size * 0.5}" height="${size * 0.08}" rx="${size * 0.04}" fill="white" opacity="0.9"/>
  <rect x="${size * 0.25}" y="${size * 0.68}" width="${size * 0.35}" height="${size * 0.06}" rx="${size * 0.03}" fill="white" opacity="0.7"/>
  <rect x="${size * 0.25}" y="${size * 0.78}" width="${size * 0.4}" height="${size * 0.06}" rx="${size * 0.03}" fill="white" opacity="0.7"/>
</svg>`;

  const svgPath = path.join(outputDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);

  console.log(`✅ Created ${filename} (${size}x${size})`);
  return svgPath;
}

// Main function
function generateIcons() {
  console.log('🍎 iOS App Icon Generator');
  console.log('═══════════════════════════');

  const outputDir = '/Users/gabrielsotomorales/projects/Gemini/spark-bloom-flow/BeProductive-iOS/BeProductive/Resources/Assets.xcassets/AppIcon.appiconset';

  if (!fs.existsSync(outputDir)) {
    console.error('❌ AppIcon.appiconset directory not found');
    process.exit(1);
  }

  console.log(`📁 Output directory: ${outputDir}`);
  console.log('');

  // Generate all required icons
  iconSizes.forEach(icon => {
    const actualSize = icon.size * icon.scale;
    createSimpleIcon(actualSize, icon.filename, outputDir);
  });

  console.log('');
  console.log('✅ All app icons generated successfully!');
  console.log('💡 Note: SVG files created as placeholders. Convert to PNG using:');
  console.log('   - Sketch, Figma, or Adobe Illustrator');
  console.log('   - Online SVG to PNG converters');
  console.log('   - ImageMagick: convert file.svg file.png');
}

// Run the generator
generateIcons();