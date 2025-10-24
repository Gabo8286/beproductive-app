// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SparkBloomFlowSharedProtocols",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .watchOS(.v8),
        .tvOS(.v15)
    ],
    products: [
        // Core protocols library
        .library(
            name: "SharedProtocols",
            targets: ["SharedProtocols"]
        ),
        // Cross-platform data models
        .library(
            name: "DataModels",
            targets: ["DataModels"]
        ),
        // Synchronization protocols
        .library(
            name: "SyncProtocols",
            targets: ["SyncProtocols"]
        ),
        // AI integration protocols
        .library(
            name: "AIProtocols",
            targets: ["AIProtocols"]
        )
    ],
    dependencies: [
        // No external dependencies for pure protocol definitions
        // This ensures maximum compatibility and minimal overhead
    ],
    targets: [
        // MARK: - Core Protocols Target
        .target(
            name: "SharedProtocols",
            dependencies: [],
            path: "Sources/SharedProtocols",
            sources: [
                "Core/",
                "Foundation/"
            ]
        ),

        // MARK: - Data Models Target
        .target(
            name: "DataModels",
            dependencies: ["SharedProtocols"],
            path: "Sources/DataModels",
            sources: [
                "Tasks/",
                "Goals/",
                "Reflections/",
                "Analytics/"
            ]
        ),

        // MARK: - Synchronization Protocols Target
        .target(
            name: "SyncProtocols",
            dependencies: ["SharedProtocols"],
            path: "Sources/SyncProtocols",
            sources: [
                "Sync/",
                "Conflict/",
                "Operations/"
            ]
        ),

        // MARK: - AI Integration Protocols Target
        .target(
            name: "AIProtocols",
            dependencies: ["SharedProtocols"],
            path: "Sources/AIProtocols",
            sources: [
                "Providers/",
                "Conversations/",
                "Insights/"
            ]
        ),

        // MARK: - Test Targets
        .testTarget(
            name: "SharedProtocolsTests",
            dependencies: ["SharedProtocols"],
            path: "Tests/SharedProtocolsTests"
        ),
        .testTarget(
            name: "DataModelsTests",
            dependencies: ["DataModels"],
            path: "Tests/DataModelsTests"
        ),
        .testTarget(
            name: "SyncProtocolsTests",
            dependencies: ["SyncProtocols"],
            path: "Tests/SyncProtocolsTests"
        ),
        .testTarget(
            name: "AIProtocolsTests",
            dependencies: ["AIProtocols"],
            path: "Tests/AIProtocolsTests"
        )
    ],
    swiftLanguageVersions: [.v5]
)

// MARK: - Package Configuration

extension Package {
    /// Configure package for cross-platform compatibility
    static func configureForCrossPlatform() -> Package {
        let package = Package(
            name: "SparkBloomFlowSharedProtocols",
            platforms: [
                .iOS(.v15),
                .macOS(.v12),
                .watchOS(.v8),
                .tvOS(.v15)
            ],
            products: [
                .library(name: "SharedProtocols", targets: ["SharedProtocols"]),
                .library(name: "DataModels", targets: ["DataModels"]),
                .library(name: "SyncProtocols", targets: ["SyncProtocols"]),
                .library(name: "AIProtocols", targets: ["AIProtocols"])
            ],
            targets: [
                .target(name: "SharedProtocols"),
                .target(name: "DataModels", dependencies: ["SharedProtocols"]),
                .target(name: "SyncProtocols", dependencies: ["SharedProtocols"]),
                .target(name: "AIProtocols", dependencies: ["SharedProtocols"])
            ]
        )

        return package
    }
}

// MARK: - Build Settings

#if canImport(PackageConfig)
import PackageConfig

let config = PackageConfig(
    // Enable whole module optimization for release builds
    swiftSettings: [
        .define("SWIFT_PACKAGE", .when(configuration: .release)),
        .enableUpcomingFeature("BareSlashRegexLiterals"),
        .enableUpcomingFeature("ConciseMagicFile"),
        .enableUpcomingFeature("ExistentialAny"),
        .enableUpcomingFeature("ForwardTrailingClosures"),
        .enableUpcomingFeature("ImplicitOpenExistentials"),
        .enableUpcomingFeature("StrictConcurrency")
    ],
    // Optimize for size and performance
    cSettings: [
        .define("NDEBUG", .when(configuration: .release)),
        .define("NS_BLOCK_ASSERTIONS", .when(configuration: .release))
    ]
)
#endif