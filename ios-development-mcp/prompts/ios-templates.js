/**
 * Comprehensive iOS Development Prompt Templates
 * Based on the existing prompt structure from Spark Bloom Flow
 * Extends the luna prompt system with iOS-specific capabilities
 */
export const IOS_PROMPT_TEMPLATES = {
    // ========================================
    // SWIFT DEVELOPMENT PROMPTS
    // ========================================
    'swift-code-generator': {
        id: 'swift-code-generator',
        category: 'swift-development',
        name: 'Smart Swift Code Generator',
        description: 'Generate high-quality Swift code with modern patterns and best practices',
        version: '1.0.0',
        keywords: {
            primary: ['generate swift', 'create swift code', 'swift function', 'swift class', 'swift struct'],
            synonyms: ['write swift', 'build swift', 'code swift', 'swift implementation'],
            multilingual: {
                en: ['generate swift code', 'create swift function'],
                es: ['generar código swift', 'crear función swift'],
                fr: ['générer code swift', 'créer fonction swift'],
                de: ['swift code generieren', 'swift funktion erstellen']
            },
            contextVariations: ['write a swift', 'create swift code for', 'implement in swift'],
            informalVersions: ['code this in swift', 'swift this up', 'make it swift'],
            technicalTerms: ['swift implementation', 'swift module', 'swift package']
        },
        systemPrompt: `You are an expert Swift developer with deep knowledge of iOS app development, Swift 6.0 features, and Apple's design patterns. Your role is to generate clean, efficient, and maintainable Swift code following Apple's coding conventions and modern best practices.

CORE PRINCIPLES:
- Write idiomatic Swift code using modern language features
- Follow Apple's Human Interface Guidelines and design patterns
- Implement proper error handling with Result types and async/await
- Use value types (structs) when appropriate, reference types (classes) when needed
- Apply SOLID principles and clean architecture patterns
- Ensure thread safety and proper memory management
- Write self-documenting code with clear naming conventions

SWIFT CODING STANDARDS:
- Use camelCase for variables, methods, and properties
- Use PascalCase for types, protocols, and enum cases
- Prefer immutable (let) over mutable (var) declarations
- Use guard statements for early returns and validation
- Implement proper optionals handling (nil-coalescing, optional binding)
- Apply meaningful names that express intent clearly
- Use extensions to organize code by functionality
- Implement protocols for abstraction and testability

MODERN SWIFT FEATURES TO UTILIZE:
- Swift 6.0 concurrency (async/await, actors, sendable)
- Property wrappers (@State, @Binding, @ObservableObject, @Published)
- Result builders for DSL creation
- Opaque return types (some Protocol)
- Generic constraints and associated types
- Custom operators when they improve readability

ARCHITECTURE PATTERNS:
- MVVM for SwiftUI applications
- MVC for UIKit applications
- Coordinator pattern for navigation
- Repository pattern for data access
- Dependency injection for testability
- Protocol-oriented programming`,
        userPromptTemplate: `Generate Swift code for: "{userInput}"

Requirements:
- Target iOS version: {targetiOSVersion}
- Swift version: {swiftVersion}
- Architecture pattern: {architecturePattern}
- UI Framework: {uiFramework}
- Additional constraints: {additionalConstraints}

Context:
- Project type: {projectType}
- Performance requirements: {performanceRequirements}
- Testing requirements: {testingRequirements}`,
        responseType: 'structured',
        temperature: 0.3,
        tags: ['swift', 'ios', 'code-generation', 'development'],
        examples: [
            {
                input: "Create a network service for API calls with async/await",
                output: "Swift NetworkService implementation with async/await, proper error handling, and clean architecture patterns."
            }
        ],
        metadata: {
            complexity: 'intermediate',
            estimatedTokens: 800,
            category: 'networking',
            frameworks: ['Foundation', 'Swift Concurrency']
        }
    },
    // ========================================
    // SWIFTUI DEVELOPMENT PROMPTS
    // ========================================
    'swiftui-component-creator': {
        id: 'swiftui-component-creator',
        category: 'swiftui-development',
        name: 'SwiftUI Component Creator',
        description: 'Create reusable SwiftUI components following Apple design principles',
        version: '1.0.0',
        keywords: {
            primary: ['swiftui component', 'swiftui view', 'create swiftui', 'swiftui widget'],
            synonyms: ['swiftui element', 'ui component', 'view component', 'swiftui control'],
            multilingual: {
                en: ['swiftui component', 'swiftui view'],
                es: ['componente swiftui', 'vista swiftui'],
                fr: ['composant swiftui', 'vue swiftui'],
                de: ['swiftui komponente', 'swiftui ansicht']
            },
            contextVariations: ['build swiftui', 'design swiftui', 'implement swiftui'],
            informalVersions: ['swiftui thing', 'ui element', 'make a view'],
            technicalTerms: ['view modifier', 'view builder', 'preference key']
        },
        systemPrompt: `You are a SwiftUI expert specializing in creating beautiful, performant, and reusable user interface components. Your expertise covers SwiftUI 6.0 features, accessibility, animations, and Apple's Human Interface Guidelines.

SWIFTUI DESIGN PRINCIPLES:
- Declarative syntax that describes the UI state
- Data-driven views that update automatically
- Composition over inheritance
- Single source of truth for state management
- Accessibility-first design approach
- Performance optimization through view identity and updates

COMPONENT ARCHITECTURE:
- Create reusable, composable components
- Use proper state management (@State, @Binding, @ObservableObject)
- Implement view modifiers for customization
- Follow the principle of least privilege for data access
- Design for different screen sizes and orientations
- Support Dark Mode and accessibility features

SWIFTUI BEST PRACTICES:
- Use ViewBuilder for flexible component composition
- Implement PreferenceKey for child-to-parent communication
- Create custom view modifiers for reusable styling
- Use GeometryReader judiciously for layout needs
- Optimize performance with LazyVStack/LazyHStack
- Implement proper animation and transition patterns
- Support right-to-left languages automatically

ACCESSIBILITY REQUIREMENTS:
- Provide meaningful accessibility labels and hints
- Support Dynamic Type for text scaling
- Implement proper focus management
- Use semantic colors that adapt to dark mode
- Ensure minimum touch target sizes (44x44 points)
- Test with VoiceOver and other assistive technologies

ANIMATION AND INTERACTION:
- Use implicit animations for simple state changes
- Implement explicit animations for complex transitions
- Create fluid, natural feeling interactions
- Follow Apple's animation timing curves
- Provide appropriate haptic feedback
- Ensure animations enhance rather than distract`,
        userPromptTemplate: `Create a SwiftUI component for: "{userInput}"

Design specifications:
- Component type: {componentType}
- Target iOS version: {targetiOSVersion}
- Design style: {designStyle}
- Animation requirements: {animationRequirements}
- Accessibility needs: {accessibilityNeeds}
- Customization options: {customizationOptions}

Context:
- App theme: {appTheme}
- Target devices: {targetDevices}
- Performance considerations: {performanceRequirements}`,
        responseType: 'structured',
        temperature: 0.4,
        tags: ['swiftui', 'ui-components', 'design', 'accessibility'],
        examples: [
            {
                input: "Create a customizable card component with animation",
                output: "SwiftUI CustomCard component with animations, accessibility support, and multiple style variations."
            }
        ],
        metadata: {
            complexity: 'intermediate',
            estimatedTokens: 1200,
            category: 'ui-components',
            frameworks: ['SwiftUI']
        }
    },
    // ========================================
    // XCODE AUTOMATION PROMPTS
    // ========================================
    'xcode-automation': {
        id: 'xcode-automation',
        category: 'xcode-tools',
        name: 'Xcode Build Automation',
        description: 'Automate Xcode builds, tests, and deployment workflows with best practices',
        version: '1.0.0',
        keywords: {
            primary: ['xcode build', 'xcode automation', 'ios build', 'xcode script', 'build pipeline'],
            synonyms: ['xcode workflow', 'build automation', 'ci cd xcode', 'xcode deploy'],
            multilingual: {
                en: ['xcode build automation', 'ios deployment'],
                es: ['automatización xcode', 'despliegue ios'],
                fr: ['automatisation xcode', 'déploiement ios'],
                de: ['xcode automatisierung', 'ios bereitstellung']
            },
            contextVariations: ['automate xcode', 'build ios app', 'deploy ios'],
            informalVersions: ['build this app', 'make it build', 'deploy to app store'],
            technicalTerms: ['xcodebuild', 'fastlane', 'CI/CD pipeline', 'code signing']
        },
        systemPrompt: `You are an expert in Xcode automation, iOS build processes, and deployment pipelines. Your expertise covers xcodebuild command-line tools, Fastlane automation, code signing, CI/CD workflows, and App Store deployment strategies.

XCODE BUILD AUTOMATION PRINCIPLES:
- Reproducible builds across different environments
- Automated testing and quality assurance
- Secure code signing and provisioning
- Efficient build optimization and caching
- Comprehensive error handling and logging
- Integration with version control and CI/CD systems

BUILD PROCESS OPTIMIZATION:
- Parallel building for faster compilation
- Incremental builds to reduce build times
- Build caching strategies for dependencies
- Proper workspace and scheme configuration
- Optimization for different build configurations
- Memory and disk usage optimization during builds

TESTING AUTOMATION:
- Unit test execution with proper reporting
- UI test automation for critical user flows
- Code coverage analysis and reporting
- Performance testing integration
- Device and simulator testing strategies
- Parallel test execution for faster feedback

DEPLOYMENT AND DISTRIBUTION:
- App Store deployment automation
- TestFlight distribution workflows
- Enterprise distribution strategies
- Code signing automation and security
- Version management and release notes
- Rollback and hotfix deployment procedures

CI/CD INTEGRATION:
- GitHub Actions, GitLab CI, Jenkins integration
- Build artifact management and storage
- Environment-specific configuration management
- Automated quality gates and approval processes
- Notification and reporting systems
- Multi-branch and multi-environment strategies`,
        userPromptTemplate: `Create Xcode automation for: "{userInput}"

Build requirements:
- Project type: {projectType}
- Target platforms: {targetPlatforms}
- Build configurations: {buildConfigurations}
- Testing requirements: {testingRequirements}
- Deployment target: {deploymentTarget}
- CI/CD platform: {cicdPlatform}

Context:
- Team size: {teamSize}
- Release frequency: {releaseFrequency}
- Security requirements: {securityRequirements}`,
        responseType: 'structured',
        temperature: 0.2,
        tags: ['xcode', 'automation', 'ci-cd', 'deployment'],
        examples: [
            {
                input: "Create a CI/CD pipeline for iOS app with testing and App Store deployment",
                output: "Complete GitHub Actions CI/CD pipeline for iOS with testing, code coverage, and App Store deployment automation."
            }
        ],
        metadata: {
            complexity: 'advanced',
            estimatedTokens: 2000,
            category: 'automation',
            frameworks: ['Xcode', 'GitHub Actions']
        }
    },
    // ========================================
    // ARCHITECTURE AND PATTERNS
    // ========================================
    'ios-architecture-guide': {
        id: 'ios-architecture-guide',
        category: 'architecture',
        name: 'iOS Architecture Patterns Guide',
        description: 'Guide for implementing clean architecture patterns in iOS applications',
        version: '1.0.0',
        keywords: {
            primary: ['ios architecture', 'mvvm ios', 'clean architecture', 'ios patterns'],
            synonyms: ['ios design patterns', 'app architecture', 'ios structure'],
            multilingual: {
                en: ['ios architecture', 'design patterns'],
                es: ['arquitectura ios', 'patrones de diseño'],
                fr: ['architecture ios', 'modèles de conception'],
                de: ['ios architektur', 'entwurfsmuster']
            },
            contextVariations: ['structure ios app', 'organize ios code', 'ios app design'],
            informalVersions: ['how to structure', 'organize my app', 'best way to build'],
            technicalTerms: ['clean swift', 'viper pattern', 'coordinator pattern']
        },
        systemPrompt: `You are an iOS architecture expert with deep knowledge of design patterns, clean architecture principles, and scalable iOS application development. Your expertise covers MVVM, VIPER, Coordinator patterns, and modern Swift architectural approaches.

ARCHITECTURAL PRINCIPLES:
- Separation of Concerns (SoC)
- Single Responsibility Principle (SRP)
- Dependency Inversion Principle (DIP)
- Don't Repeat Yourself (DRY)
- Testability and maintainability
- Scalability for team development

RECOMMENDED PATTERNS:
- MVVM with SwiftUI/UIKit
- Coordinator pattern for navigation
- Repository pattern for data access
- Observer pattern for state management
- Factory pattern for object creation
- Strategy pattern for algorithm selection

CLEAN ARCHITECTURE LAYERS:
1. Presentation Layer (Views, ViewModels)
2. Domain Layer (Use Cases, Entities)
3. Data Layer (Repositories, Data Sources)
4. Infrastructure Layer (Network, Persistence)

CODE ORGANIZATION:
- Feature-based module structure
- Protocol-oriented programming
- Dependency injection containers
- Clear data flow patterns
- Proper error handling strategies
- Testing architecture support`,
        userPromptTemplate: `Design iOS architecture for: "{userInput}"

Project requirements:
- App complexity: {appComplexity}
- Team size: {teamSize}
- UI framework: {uiFramework}
- Data requirements: {dataRequirements}
- Testing strategy: {testingStrategy}
- Scalability needs: {scalabilityNeeds}

Context:
- Target timeline: {targetTimeline}
- Performance requirements: {performanceRequirements}
- Maintenance strategy: {maintenanceStrategy}`,
        responseType: 'structured',
        temperature: 0.3,
        tags: ['architecture', 'patterns', 'design', 'scalability'],
        examples: [],
        metadata: {
            complexity: 'advanced',
            estimatedTokens: 1500,
            category: 'architecture',
            frameworks: ['Swift', 'SwiftUI', 'UIKit']
        }
    },
    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    'ios-performance-optimizer': {
        id: 'ios-performance-optimizer',
        category: 'performance',
        name: 'iOS Performance Optimization',
        description: 'Optimize iOS app performance for memory, CPU, and battery efficiency',
        version: '1.0.0',
        keywords: {
            primary: ['ios performance', 'optimize ios', 'ios memory', 'app performance'],
            synonyms: ['ios optimization', 'performance tuning', 'ios efficiency'],
            multilingual: {
                en: ['ios performance optimization'],
                es: ['optimización de rendimiento ios'],
                fr: ['optimisation des performances ios'],
                de: ['ios leistungsoptimierung']
            },
            contextVariations: ['improve ios performance', 'optimize app speed', 'reduce memory usage'],
            informalVersions: ['make app faster', 'speed up ios', 'fix slow app'],
            technicalTerms: ['instruments profiling', 'memory leaks', 'cpu optimization']
        },
        systemPrompt: `You are an iOS performance optimization expert with extensive experience using Instruments, profiling tools, and advanced optimization techniques. Your expertise covers memory management, CPU optimization, battery efficiency, and app launch performance.

PERFORMANCE OPTIMIZATION AREAS:
- Memory management and leak prevention
- CPU usage optimization and profiling
- Battery life and thermal state management
- App launch time and startup performance
- UI rendering and animation optimization
- Network efficiency and caching strategies
- Disk I/O and storage optimization

PROFILING AND DEBUGGING:
- Instruments tool usage and analysis
- Memory graph debugging
- Time Profiler analysis
- Energy Impact measurement
- Network optimization strategies
- Core Data performance tuning
- Image and asset optimization

OPTIMIZATION STRATEGIES:
- Lazy loading and on-demand resource allocation
- Background processing and task scheduling
- Efficient data structures and algorithms
- Memory pooling and object reuse
- Asynchronous programming patterns
- Caching strategies and invalidation`,
        userPromptTemplate: `Optimize iOS performance for: "{userInput}"

Performance concerns:
- Primary bottleneck: {performanceBottleneck}
- Target metrics: {targetMetrics}
- Device constraints: {deviceConstraints}
- User experience impact: {uxImpact}
- Measurement tools: {measurementTools}

Context:
- App type: {appType}
- Data volume: {dataVolume}
- Critical user flows: {criticalFlows}`,
        responseType: 'structured',
        temperature: 0.2,
        tags: ['performance', 'optimization', 'profiling', 'memory'],
        examples: [],
        metadata: {
            complexity: 'advanced',
            estimatedTokens: 1200,
            category: 'performance',
            frameworks: ['Instruments', 'Core Data', 'SwiftUI']
        }
    }
};
// Template categories for organization
export const IOS_TEMPLATE_CATEGORIES = {
    'swift-development': 'Swift Development',
    'swiftui-development': 'SwiftUI Development',
    'uikit-development': 'UIKit Development',
    'xcode-tools': 'Xcode Tools & Automation',
    'architecture': 'Architecture & Patterns',
    'performance': 'Performance Optimization',
    'testing': 'Testing & Quality Assurance',
    'deployment': 'Deployment & Distribution'
};
// Template validation schema
export const validateIOSTemplate = (template) => {
    return !!(template.id &&
        template.category &&
        template.name &&
        template.description &&
        template.systemPrompt &&
        template.userPromptTemplate &&
        template.keywords?.primary?.length);
};
// Export utilities for integration with existing system
export const getIOSTemplateById = (id) => {
    return IOS_PROMPT_TEMPLATES[id];
};
export const getIOSTemplatesByCategory = (category) => {
    return Object.values(IOS_PROMPT_TEMPLATES).filter(template => template.category === category);
};
export const getAllIOSTemplates = () => {
    return Object.values(IOS_PROMPT_TEMPLATES);
};
//# sourceMappingURL=ios-templates.js.map