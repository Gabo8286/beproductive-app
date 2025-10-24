#!/bin/bash

echo "🍎 Building BeProductive Coding Framework for App Store..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script must be run on macOS${NC}"
    exit 1
fi

# Check if Apple Developer tools are installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode command line tools not found. Install with: xcode-select --install${NC}"
    exit 1
fi

# Check if we have the required certificates
echo -e "${BLUE}🔍 Checking for required certificates...${NC}"
if ! security find-identity -v -p codesigning | grep -q "Mac App Store"; then
    echo -e "${YELLOW}⚠️  Mac App Store certificate not found. You'll need to create one in Apple Developer Portal.${NC}"
fi

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf dist/
rm -rf dist-appstore/
rm -rf node_modules/.cache/

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Build React app
echo -e "${BLUE}⚛️  Building React application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ React build failed${NC}"
    exit 1
fi

# Create entitlements directory if it doesn't exist
mkdir -p build

# Create entitlements for Mac App Store
echo -e "${BLUE}📄 Creating entitlements files...${NC}"

cat > build/entitlements.mas.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.downloads.read-write</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
EOF

cat > build/entitlements.mas.inherit.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
EOF

# Build for Mac App Store
echo -e "${BLUE}🏗️  Building for Mac App Store...${NC}"
npx electron-builder --mac mas --publish=never

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mac App Store build completed successfully!${NC}"
    echo ""
    echo -e "${GREEN}📁 Build location:${NC} dist-appstore/"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Upload to App Store Connect using Transporter app"
    echo "2. Or use: xcrun altool --upload-app --type osx --file 'dist-appstore/BeProductive Coding Framework-1.0.0.pkg' --username 'your-apple-id' --password 'app-specific-password'"
    echo ""
    echo -e "${BLUE}🎉 Ready for App Store submission!${NC}"
else
    echo -e "${RED}❌ Mac App Store build failed${NC}"
    echo ""
    echo -e "${YELLOW}💡 Common issues:${NC}"
    echo "- Missing Mac App Store certificate"
    echo "- Missing provisioning profile"
    echo "- Invalid entitlements"
    echo ""
    echo "Check the Apple Developer Portal for required certificates and profiles."
    exit 1
fi

# Also build regular DMG for direct distribution
echo ""
echo -e "${BLUE}🔄 Building regular DMG for direct distribution...${NC}"
npx electron-builder --mac dmg --publish=never

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ DMG build completed successfully!${NC}"
    echo -e "${GREEN}📁 DMG location:${NC} dist/"

    # Show file sizes
    echo ""
    echo -e "${BLUE}📊 Build statistics:${NC}"
    if [ -f "dist-appstore/BeProductive Coding Framework-1.0.0.pkg" ]; then
        echo "App Store package: $(du -h "dist-appstore/BeProductive Coding Framework-1.0.0.pkg" | cut -f1)"
    fi
    if [ -f "dist/BeProductive Coding Framework-1.0.0-arm64.dmg" ]; then
        echo "Direct DMG: $(du -h "dist/BeProductive Coding Framework-1.0.0-arm64.dmg" | cut -f1)"
    fi
fi

echo ""
echo -e "${GREEN}🎯 Build process completed!${NC}"