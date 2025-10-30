# 📱 iOS Development Workflow

## Quick Start

```bash
# Open iOS app in Xcode (recommended)
npm run ios

# Or use the script directly
./scripts/ios-dev.sh
```

## Available Commands

### Basic Usage
```bash
npm run ios                 # Open main iOS project in Xcode
npm run ios:clean          # Clean build folder before opening
npm run ios:verbose        # Enable detailed logging
npm run ios:list           # List all available projects
```

### Advanced Usage
```bash
npm run ios:sim             # Open with iPhone 15 Pro simulator
npm run ios:package         # Open Swift package instead of main project

# Direct script usage with custom options
./scripts/ios-dev.sh --simulator "iPhone 14 Pro"
./scripts/ios-dev.sh --package SharedProtocols
./scripts/ios-dev.sh --clean --verbose
```

## Project Structure

The script automatically detects iOS projects in this priority order:

### 1. **Main iOS App** (Priority 1)
- `/Users/gabrielsotomorales/projects/Gemini/spark-bloom-flow/BeProductive-iOS/BeProductive.xcodeproj`
- This is the primary iOS app with all the SwiftUI components

### 2. **Alternative iOS Projects**
- `/Users/gabrielsotomorales/projects/beproductive-ios/BeProductiveApp/BeProductiveApp.xcodeproj`
- Fallback iOS projects if main one isn't available

### 3. **Swift Packages**
- `ios-modules/SharedProtocols/Package.swift`
- Modular Swift packages for shared functionality

## Features

### 🔍 **Smart Detection**
- Automatically finds your iOS project
- Prefers workspaces over projects (for CocoaPods/SPM)
- Clear error messages if projects aren't found

### 🧹 **Build Management**
- Optional build folder cleaning
- DerivedData cleanup
- Fresh build environment

### 📱 **Simulator Integration**
- Boot specific iOS simulators
- Support for iPhone and iPad simulators
- List available simulators

### 🎯 **Developer Experience**
- Colored output with status indicators
- Verbose logging for troubleshooting
- Consistent with existing npm scripts

## Troubleshooting

### Xcode Not Found
```bash
# Install Xcode from App Store
# Or check if it's in PATH
xcode-select --install
```

### Project Not Found
```bash
# List all projects to see what's detected
npm run ios:list

# Or check the specific path
ls -la /Users/gabrielsotomorales/projects/Gemini/spark-bloom-flow/BeProductive-iOS/
```

### Permission Issues
```bash
# Make script executable
chmod +x ./scripts/ios-dev.sh
```

## Integration with Development Workflow

The iOS commands integrate seamlessly with your existing workflow:

```bash
# Web development
npm run dev                 # Start React web app
npm run dev:mobile         # Mobile web view

# iOS development
npm run ios                 # Start iOS development
npm run ios:sim            # iOS with simulator

# Both platforms
npm run dev & npm run ios  # Develop web and iOS simultaneously
```

## Script Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--help` | Show help message | `npm run ios -- --help` |
| `--verbose` | Enable detailed logging | `npm run ios:verbose` |
| `--clean` | Clean build folder | `npm run ios:clean` |
| `--simulator <device>` | Boot specific simulator | `--simulator "iPhone 15 Pro"` |
| `--package <name>` | Open Swift package | `--package SharedProtocols` |
| `--list-projects` | List available projects | `npm run ios:list` |
| `--list-simulators` | List iOS simulators | `--list-simulators` |

## Examples

### Basic Development
```bash
# Start iOS development
npm run ios

# Clean development session
npm run ios:clean

# Development with iPhone simulator
npm run ios:sim
```

### Package Development
```bash
# Open shared protocols package
./scripts/ios-dev.sh --package SharedProtocols

# List available packages
npm run ios:list
```

### Parallel Development
```bash
# Terminal 1: Web development
npm run dev

# Terminal 2: iOS development
npm run ios

# Now you can develop both platforms simultaneously
```

---

## 🚀 **Ready to Code!**

Your iOS development environment is now seamlessly integrated with your existing workflow. Use `npm run ios` to start developing the iOS version of BeProductive! 📱✨