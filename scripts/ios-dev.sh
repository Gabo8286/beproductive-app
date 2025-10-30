#!/bin/bash

# =============================================================================
# iOS Development Launcher Script
# BeProductive iOS App - Xcode Project Launcher
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_NAME="iOS Dev Launcher"
VERSION="1.0.0"
VERBOSE=false
CLEAN_BUILD=false
SIMULATOR=""
SPECIFIC_PACKAGE=""

# Project paths (in priority order)
PROJECTS=(
    "/Users/gabrielsotomorales/projects/Gemini/spark-bloom-flow/BeProductive-iOS/BeProductive.xcodeproj"
    "/Users/gabrielsotomorales/projects/beproductive-ios/BeProductiveApp/BeProductiveApp.xcodeproj"
    "./ios-app/BeProductive.xcodeproj"
    "./BeProductive-iOS/BeProductive.xcodeproj"
)

WORKSPACES=(
    "/Users/gabrielsotomorales/projects/Gemini/spark-bloom-flow/BeProductive-iOS/BeProductive.xcworkspace"
    "/Users/gabrielsotomorales/projects/beproductive-ios/BeProductiveApp/BeProductiveApp.xcworkspace"
    "./ios-app/BeProductive.xcworkspace"
    "./BeProductive-iOS/BeProductive.xcworkspace"
)

SWIFT_PACKAGES=(
    "/Users/gabrielsotomorales/projects/spark-bloom-flow/ios-modules/SharedProtocols/Package.swift"
    "./ios-modules/SharedProtocols/Package.swift"
)

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "${CYAN}=============================================${NC}"
    echo -e "${CYAN}  📱 $SCRIPT_NAME v$VERSION${NC}"
    echo -e "${CYAN}=============================================${NC}"
}

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

iOS Development Environment Launcher for BeProductive App

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging
    -c, --clean             Clean build folder before opening
    -s, --simulator DEVICE  Specify target simulator device
    -p, --package NAME      Open specific Swift package
    --list-projects         List all available projects
    --list-simulators       List available iOS simulators

EXAMPLES:
    $0                      # Open main iOS project in Xcode
    $0 --verbose            # Open with detailed logging
    $0 --clean              # Clean build before opening
    $0 --simulator "iPhone 15 Pro"
    $0 --package SharedProtocols

WORKFLOW INTEGRATION:
    npm run ios             # Alias for this script
    npm run ios:clean       # Open with clean build
    npm run ios:sim         # Open with simulator selection

EOF
}

log() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
    fi
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# =============================================================================
# System Checks
# =============================================================================

check_xcode() {
    log "Checking Xcode installation..."

    if ! command -v xcodebuild >/dev/null 2>&1; then
        error "Xcode is not installed or not in PATH"
        info "Please install Xcode from the App Store"
        exit 1
    fi

    local xcode_version=$(xcodebuild -version | head -n 1)
    success "Found $xcode_version"
}

check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        error "This script requires macOS to run Xcode"
        exit 1
    fi
}

# =============================================================================
# Project Detection
# =============================================================================

find_project() {
    log "Searching for iOS projects..."

    # First, try to find workspaces (preferred for CocoaPods/SPM)
    for workspace in "${WORKSPACES[@]}"; do
        if [[ -d "$workspace" ]]; then
            log "Found workspace: $workspace"
            echo "$workspace"
            return 0
        fi
    done

    # Then try Xcode projects
    for project in "${PROJECTS[@]}"; do
        if [[ -d "$project" ]]; then
            log "Found project: $project"
            echo "$project"
            return 0
        fi
    done

    return 1
}

find_swift_package() {
    local package_name="$1"

    if [[ -n "$package_name" ]]; then
        # Look for specific package
        for package in "${SWIFT_PACKAGES[@]}"; do
            if [[ "$(basename "$(dirname "$package")")" == "$package_name" ]]; then
                if [[ -f "$package" ]]; then
                    echo "$package"
                    return 0
                fi
            fi
        done
    else
        # Return first available package
        for package in "${SWIFT_PACKAGES[@]}"; do
            if [[ -f "$package" ]]; then
                echo "$package"
                return 0
            fi
        done
    fi

    return 1
}

list_projects() {
    echo -e "${CYAN}Available iOS Projects:${NC}"

    echo -e "\n${YELLOW}Workspaces:${NC}"
    for workspace in "${WORKSPACES[@]}"; do
        if [[ -d "$workspace" ]]; then
            echo -e "  ${GREEN}✓${NC} $workspace"
        else
            echo -e "  ${RED}✗${NC} $workspace"
        fi
    done

    echo -e "\n${YELLOW}Projects:${NC}"
    for project in "${PROJECTS[@]}"; do
        if [[ -d "$project" ]]; then
            echo -e "  ${GREEN}✓${NC} $project"
        else
            echo -e "  ${RED}✗${NC} $project"
        fi
    done

    echo -e "\n${YELLOW}Swift Packages:${NC}"
    for package in "${SWIFT_PACKAGES[@]}"; do
        if [[ -f "$package" ]]; then
            echo -e "  ${GREEN}✓${NC} $package"
        else
            echo -e "  ${RED}✗${NC} $package"
        fi
    done
}

# =============================================================================
# Simulator Management
# =============================================================================

list_simulators() {
    echo -e "${CYAN}Available iOS Simulators:${NC}"
    xcrun simctl list devices | grep -E "iPhone|iPad" | grep -v "unavailable" | sed 's/^/  /'
}

boot_simulator() {
    local simulator_name="$1"

    if [[ -z "$simulator_name" ]]; then
        return 0
    fi

    log "Booting simulator: $simulator_name"

    local device_id=$(xcrun simctl list devices | grep "$simulator_name" | grep -v "unavailable" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

    if [[ -n "$device_id" ]]; then
        xcrun simctl boot "$device_id" 2>/dev/null || true
        success "Simulator '$simulator_name' is ready"
    else
        warning "Simulator '$simulator_name' not found"
    fi
}

# =============================================================================
# Build Management
# =============================================================================

clean_build() {
    local project_path="$1"

    if [[ "$CLEAN_BUILD" != true ]]; then
        return 0
    fi

    log "Cleaning build folder..."

    local project_dir=$(dirname "$project_path")
    local build_dir="$project_dir/build"
    local derived_data_dir="$HOME/Library/Developer/Xcode/DerivedData"

    # Clean project build folder
    if [[ -d "$build_dir" ]]; then
        rm -rf "$build_dir"
        success "Cleaned project build folder"
    fi

    # Clean DerivedData for this project
    if [[ -d "$derived_data_dir" ]]; then
        find "$derived_data_dir" -name "*BeProductive*" -type d -exec rm -rf {} + 2>/dev/null || true
        success "Cleaned DerivedData"
    fi
}

# =============================================================================
# Xcode Launch
# =============================================================================

open_in_xcode() {
    local project_path="$1"

    log "Opening project in Xcode: $project_path"

    # Clean build if requested
    clean_build "$project_path"

    # Boot simulator if specified
    boot_simulator "$SIMULATOR"

    # Open in Xcode
    if [[ "$project_path" == *.xcworkspace ]]; then
        info "Opening workspace in Xcode..."
        open -a Xcode "$project_path"
    elif [[ "$project_path" == *.xcodeproj ]]; then
        info "Opening project in Xcode..."
        open -a Xcode "$project_path"
    elif [[ "$project_path" == *Package.swift ]]; then
        info "Opening Swift package in Xcode..."
        open -a Xcode "$project_path"
    else
        error "Unknown project type: $project_path"
        exit 1
    fi

    success "iOS project opened in Xcode!"

    # Additional info
    if [[ -n "$SIMULATOR" ]]; then
        info "Target simulator: $SIMULATOR"
    fi

    if [[ "$CLEAN_BUILD" == true ]]; then
        info "Build folder was cleaned"
    fi
}

# =============================================================================
# Main Script Logic
# =============================================================================

main() {
    print_header

    # System checks
    check_macos
    check_xcode

    # Handle Swift package request
    if [[ -n "$SPECIFIC_PACKAGE" ]]; then
        log "Looking for Swift package: $SPECIFIC_PACKAGE"
        local package_path
        if package_path=$(find_swift_package "$SPECIFIC_PACKAGE"); then
            open_in_xcode "$package_path"
            return 0
        else
            error "Swift package '$SPECIFIC_PACKAGE' not found"
            exit 1
        fi
    fi

    # Find and open main project
    local project_path
    if project_path=$(find_project); then
        success "Found iOS project: $(basename "$project_path")"
        open_in_xcode "$project_path"
    else
        error "No iOS project found!"
        echo
        info "Searched in the following locations:"
        list_projects
        echo
        info "Make sure the iOS project exists and is properly configured."
        exit 1
    fi
}

# =============================================================================
# Command Line Argument Parsing
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -s|--simulator)
            SIMULATOR="$2"
            shift 2
            ;;
        -p|--package)
            SPECIFIC_PACKAGE="$2"
            shift 2
            ;;
        --list-projects)
            list_projects
            exit 0
            ;;
        --list-simulators)
            list_simulators
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# =============================================================================
# Script Execution
# =============================================================================

main