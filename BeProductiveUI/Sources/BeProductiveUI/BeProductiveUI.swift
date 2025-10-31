import SwiftUI

/// BeProductiveUI - A comprehensive SwiftUI component library for the BeProductive iOS app
///
/// This library provides a consistent design system and reusable components that ensure
/// visual consistency and accessibility across the entire BeProductive application.
///
/// # Key Features
/// - Complete design token system (colors, typography, spacing)
/// - 100+ reusable SwiftUI components
/// - Built-in accessibility support
/// - Dark mode and high contrast support
/// - Productivity-focused component specializations
/// - AI chat interface components
/// - Enterprise and team collaboration components
///
/// # Usage
/// ```swift
/// import BeProductiveUI
///
/// struct ContentView: View {
///     var body: some View {
///         VStack {
///             BPText("Welcome to BeProductive", style: .heading1)
///             BPButton("Get Started", style: .primary) {
///                 // Action
///             }
///         }
///         .beProductiveTheme()
///     }
/// }
/// ```
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BeProductiveUI {

    /// The current version of the BeProductiveUI library
    public static let version = "1.0.0"

    /// Initialize the BeProductiveUI library with optional configuration
    public static func configure(theme: BPTheme = .default) {
        BPThemeManager.shared.setTheme(theme)
    }
}

/// Main library export for SwiftUI integration
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BeProductiveUI {

    /// Apply the BeProductive theme to any SwiftUI view
    public static func themed<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .beProductiveTheme()
    }
}