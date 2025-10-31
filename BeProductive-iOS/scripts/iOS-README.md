# BeProductive iOS - Development Commands

## 🚀 Quick Start

The easiest way to open the iOS project in Xcode:

```bash
npm run ios
```

## 📱 Available iOS Commands

### Main Commands
- `npm run ios` - Open iOS app in Xcode (auto-detects project)
- `npm run ios:clean` - Open iOS app with clean build folder
- `npm run ios:verbose` - Open with detailed logging
- `npm run ios:sim` - Open with iPhone 15 Pro simulator
- `npm run ios:package` - Open specific Swift package
- `npm run ios:list` - List all available iOS projects

### Direct Script Usage
You can also use the script directly:

```bash
# Basic usage
./scripts/ios-dev.sh

# With options
./scripts/ios-dev.sh --verbose
./scripts/ios-dev.sh --clean
./scripts/ios-dev.sh --simulator "iPhone 15 Pro"
./scripts/ios-dev.sh --list-projects
```

## 🎯 Project Structure

```
BeProductive-iOS/
├── BeProductive-iOS.xcodeproj/    # Generated Xcode project
├── Sources/                       # Swift source code
├── Resources/                     # App resources (images, etc.)
├── Tests/                        # Unit tests
├── UITests/                      # UI tests
├── project.yml                   # XcodeGen configuration
├── Info.plist                    # App configuration
└── scripts/                      # Development scripts
```

## 🔧 Project Generation

The Xcode project is generated from `project.yml` using XcodeGen:

```bash
# Regenerate the Xcode project
xcodegen generate
```

This automatically:
- ✅ Creates the Xcode project structure
- ✅ Configures Swift Package dependencies
- ✅ Sets up build configurations
- ✅ Creates test targets
- ✅ Configures app settings and Info.plist

## 📦 Dependencies

The project includes these Swift Package dependencies:
- **BeProductiveUI** - Local UI component library
- **Supabase** - Backend and authentication
- **Algorithms** - Swift algorithms library
- **Collections** - Swift collections library
- **ComposableArchitecture** - State management (optional)
- **Nuke** - Image loading and caching
- **Starscream** - WebSocket library
- **SwiftyJSON** - JSON parsing
- **Kingfisher** - Alternative image library

## 🚀 Production Readiness

The iOS app is **PRODUCTION READY** with:

✅ **Complete Architecture**
- SwiftUI + MVVM + Coordinator pattern
- Offline-first data persistence
- Advanced sync engine with conflict resolution

✅ **Core Features**
- Task management with CRUD operations
- Goal tracking with milestones
- Habit formation with streak analytics
- Background synchronization

✅ **Quality Assurance**
- Comprehensive unit and UI tests
- Performance monitoring and memory leak detection
- Analytics and crash reporting
- Production readiness validation

✅ **User Experience**
- Complete onboarding flow
- Accessibility compliance
- Error handling and offline support

## 🧪 Testing

Run tests directly in Xcode or use the production validation:

```bash
# Validate production readiness
swift scripts/validate-production-readiness.swift
```

## 🎯 Next Steps

1. **Open in Xcode**: `npm run ios`
2. **Select Target**: Choose 'BeProductive-iOS' scheme
3. **Choose Device**: Pick simulator or connected device
4. **Build & Run**: Press ⌘+R
5. **Validate**: Run production readiness validation

The app is ready for App Store submission! 🚀