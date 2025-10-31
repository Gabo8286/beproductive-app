// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BeProductive-iOS",
    platforms: [
        .iOS(.v16),
        .watchOS(.v9),
        .macOS(.v13)
    ],
    dependencies: [
        // Local BeProductiveUI dependency
        .package(path: "../BeProductiveUI"),

        // External dependencies
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.5.1"),
        .package(url: "https://github.com/apple/swift-algorithms.git", from: "1.2.0"),
        .package(url: "https://github.com/apple/swift-collections.git", from: "1.0.0"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture.git", from: "1.5.0"),
        .package(url: "https://github.com/kean/Nuke.git", from: "12.0.0"),
        .package(url: "https://github.com/daltoniam/Starscream.git", from: "4.0.0"),
        .package(url: "https://github.com/SwiftyJSON/SwiftyJSON.git", from: "5.0.0"),
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "BeProductive-iOS",
            dependencies: [
                "BeProductiveUI",
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "Algorithms", package: "swift-algorithms"),
                .product(name: "Collections", package: "swift-collections"),
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture"),
                .product(name: "Nuke", package: "Nuke"),
                .product(name: "NukeUI", package: "Nuke"),
                .product(name: "Starscream", package: "Starscream"),
                .product(name: "SwiftyJSON", package: "SwiftyJSON"),
                .product(name: "Kingfisher", package: "Kingfisher")
            ],
            path: "Sources"
        ),
        .testTarget(
            name: "BeProductive-iOSTests",
            dependencies: ["BeProductive-iOS"],
            path: "Tests"
        )
    ]
)