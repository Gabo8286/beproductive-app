// Re-export BeProductiveUI for easy access throughout the app
@_exported import BeProductiveUI
import SwiftUI

// MARK: - Theme Integration
extension BPThemeManager {
    /// Apply app-specific theme customizations
    func applyAppTheme() {
        // Customize themes for the main app if needed
        // This allows for app-specific overrides while using the component library
    }
}

// MARK: - Color Extensions
extension BPColors {
    // App-specific color additions
    static let appAccent = Color(hex: 0xFF6B6B)
    static let appBackground = Color(hex: 0xF8F9FA)
}

// MARK: - Typography Extensions
extension BPTypography {
    // App-specific typography styles
    // Note: BPTextStyle initializer is internal, so we use existing styles as base
    // For a custom 34pt rounded bold style, Display.small (36pt) is the closest match
    static let appBrand = Display.small
}

// MARK: - BPText Extensions
extension BPText {
    /// Create an app brand text with the closest available styling
    public static func appBrand(
        _ content: String,
        color: TextColor = .brand,
        alignment: TextAlignment = .leading
    ) -> BPText {
        return BPText(content, style: .displaySmall, color: color, alignment: alignment)
    }
}