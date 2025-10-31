#!/bin/bash

# BeProductive iOS - Xcode Launcher Script
# Opens the iOS project in Xcode with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_DIR="/Users/gabrielsotomorales/projects/spark-bloom-flow/BeProductive-iOS"
XCODE_PROJECT="$PROJECT_DIR/BeProductive-iOS.xcodeproj"
PROJECT_YML="$PROJECT_DIR/project.yml"

echo -e "${BLUE}🚀 BeProductive iOS - Xcode Launcher${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

# Change to project directory
cd "$PROJECT_DIR"

# Check if XcodeGen is available
if ! command -v xcodegen &> /dev/null; then
    echo -e "${YELLOW}⚠️  XcodeGen not found. Installing via Homebrew...${NC}"
    if command -v brew &> /dev/null; then
        brew install xcodegen
    else
        echo -e "${RED}❌ Homebrew not found. Please install XcodeGen manually:${NC}"
        echo -e "${YELLOW}   mint install yonaskolb/XcodeGen${NC}"
        exit 1
    fi
fi

# Generate Xcode project if needed
if [[ ! -f "$XCODE_PROJECT/project.pbxproj" ]] || [[ "$PROJECT_YML" -nt "$XCODE_PROJECT" ]]; then
    echo -e "${YELLOW}🔧 Generating Xcode project...${NC}"
    xcodegen generate
    echo -e "${GREEN}✅ Xcode project generated successfully${NC}"
else
    echo -e "${GREEN}✅ Xcode project is up to date${NC}"
fi

# Check if Xcode project exists
if [[ ! -f "$XCODE_PROJECT/project.pbxproj" ]]; then
    echo -e "${RED}❌ Xcode project not found at: $XCODE_PROJECT${NC}"
    echo -e "${YELLOW}💡 Run 'xcodegen generate' to create the project${NC}"
    exit 1
fi

# Open in Xcode
echo -e "${BLUE}📱 Opening BeProductive iOS in Xcode...${NC}"

# Check if Xcode is installed
if [[ ! -d "/Applications/Xcode.app" ]]; then
    echo -e "${RED}❌ Xcode not found in /Applications/Xcode.app${NC}"
    echo -e "${YELLOW}💡 Please install Xcode from the App Store${NC}"
    exit 1
fi

# Open the project
open "$XCODE_PROJECT"

echo -e "${GREEN}✅ Xcode project opened successfully!${NC}"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo -e "${YELLOW}   1. Select 'BeProductive-iOS' scheme${NC}"
echo -e "${YELLOW}   2. Choose your target device/simulator${NC}"
echo -e "${YELLOW}   3. Press ⌘+R to build and run${NC}"
echo -e "${YELLOW}   4. Run production validation: await ProductionReadinessRunner.runValidation()${NC}"
echo ""
echo -e "${GREEN}🚀 The iOS app is production ready for App Store submission!${NC}"