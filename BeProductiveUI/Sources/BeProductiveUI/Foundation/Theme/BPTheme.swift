import SwiftUI

/// BeProductive Theme System
///
/// Provides a comprehensive theming system that combines colors, typography, spacing,
/// and other design tokens into cohesive themes with support for light/dark mode,
/// accessibility variations, and custom theme creation.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTheme {

    // MARK: - Theme Components

    public let colors: BPThemeColors
    public let typography: BPThemeTypography
    public let spacing: BPThemeSpacing
    public let shadows: BPThemeShadows
    public let borders: BPThemeBorders
    public let animations: BPThemeAnimations

    // MARK: - Theme Metadata

    public let name: String
    public let appearance: UIUserInterfaceStyle
    public let accessibilityLevel: AccessibilityLevel

    // MARK: - Accessibility Levels

    public enum AccessibilityLevel: String, CaseIterable {
        case standard = "Standard"
        case enhanced = "Enhanced"
        case maximum = "Maximum"

        var description: String {
            switch self {
            case .standard:
                return "Standard accessibility"
            case .enhanced:
                return "Enhanced contrast and spacing"
            case .maximum:
                return "Maximum accessibility compliance"
            }
        }
    }

    // MARK: - Initializer

    public init(
        name: String,
        appearance: UIUserInterfaceStyle = .unspecified,
        accessibilityLevel: AccessibilityLevel = .standard,
        colors: BPThemeColors? = nil,
        typography: BPThemeTypography? = nil,
        spacing: BPThemeSpacing? = nil,
        shadows: BPThemeShadows? = nil,
        borders: BPThemeBorders? = nil,
        animations: BPThemeAnimations? = nil
    ) {
        self.name = name
        self.appearance = appearance
        self.accessibilityLevel = accessibilityLevel
        self.colors = colors ?? BPThemeColors(appearance: appearance, accessibilityLevel: accessibilityLevel)
        self.typography = typography ?? BPThemeTypography(accessibilityLevel: accessibilityLevel)
        self.spacing = spacing ?? BPThemeSpacing(accessibilityLevel: accessibilityLevel)
        self.shadows = shadows ?? BPThemeShadows(appearance: appearance)
        self.borders = borders ?? BPThemeBorders(appearance: appearance)
        self.animations = animations ?? BPThemeAnimations()
    }
}

// MARK: - Default Themes

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTheme {

    /// Default light theme
    public static let light = BPTheme(
        name: "BeProductive Light",
        appearance: .light
    )

    /// Default dark theme
    public static let dark = BPTheme(
        name: "BeProductive Dark",
        appearance: .dark
    )

    /// High contrast light theme for accessibility
    public static let highContrastLight = BPTheme(
        name: "BeProductive High Contrast Light",
        appearance: .light,
        accessibilityLevel: .maximum
    )

    /// High contrast dark theme for accessibility
    public static let highContrastDark = BPTheme(
        name: "BeProductive High Contrast Dark",
        appearance: .dark,
        accessibilityLevel: .maximum
    )

    /// System default theme (adapts to system appearance)
    public static let `default` = BPTheme(
        name: "BeProductive System",
        appearance: .unspecified
    )

    /// Enhanced accessibility theme
    public static let enhanced = BPTheme(
        name: "BeProductive Enhanced",
        appearance: .unspecified,
        accessibilityLevel: .enhanced
    )
}

// MARK: - Theme Colors

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeColors {

    // Core color palettes
    public let primary: BPColors.Primary.Type
    public let secondary: BPColors.Secondary.Type
    public let neutral: BPColors.Neutral.Type

    // Semantic colors
    public let success: BPColors.Success.Type
    public let warning: BPColors.Warning.Type
    public let error: BPColors.Error.Type
    public let info: BPColors.Info.Type

    // Interface colors
    public let background: BPColors.Background.Type
    public let text: BPColors.Text.Type
    public let border: BPColors.Border.Type
    public let shadow: BPColors.Shadow.Type

    // Feature colors
    public let role: BPColors.Role.Type
    public let productivity: BPColors.Productivity.Type

    // Theme-specific adjustments
    public let appearance: UIUserInterfaceStyle
    public let accessibilityLevel: BPTheme.AccessibilityLevel

    public init(
        appearance: UIUserInterfaceStyle = .unspecified,
        accessibilityLevel: BPTheme.AccessibilityLevel = .standard
    ) {
        self.appearance = appearance
        self.accessibilityLevel = accessibilityLevel

        // Use existing color system as base
        self.primary = BPColors.Primary.self
        self.secondary = BPColors.Secondary.self
        self.neutral = BPColors.Neutral.self
        self.success = BPColors.Success.self
        self.warning = BPColors.Warning.self
        self.error = BPColors.Error.self
        self.info = BPColors.Info.self
        self.background = BPColors.Background.self
        self.text = BPColors.Text.self
        self.border = BPColors.Border.self
        self.shadow = BPColors.Shadow.self
        self.role = BPColors.Role.self
        self.productivity = BPColors.Productivity.self
    }

    /// Get enhanced contrast version of a color for accessibility
    public func enhancedContrast(_ color: Color) -> Color {
        switch accessibilityLevel {
        case .standard:
            return color
        case .enhanced:
            return appearance == .dark ? color.lighter(by: 0.1) : color.darker(by: 0.1)
        case .maximum:
            return appearance == .dark ? color.lighter(by: 0.2) : color.darker(by: 0.2)
        }
    }
}

// MARK: - Theme Typography

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeTypography {

    public let accessibilityLevel: BPTheme.AccessibilityLevel
    public let scalingFactor: CGFloat

    public init(accessibilityLevel: BPTheme.AccessibilityLevel = .standard) {
        self.accessibilityLevel = accessibilityLevel

        switch accessibilityLevel {
        case .standard:
            self.scalingFactor = 1.0
        case .enhanced:
            self.scalingFactor = 1.1
        case .maximum:
            self.scalingFactor = 1.2
        }
    }

    /// Apply theme-specific typography scaling
    public func scaled(_ style: BPTextStyle) -> BPTextStyle {
        return BPTextStyle(
            size: style.size * scalingFactor,
            lineHeight: style.lineHeight * scalingFactor,
            letterSpacing: style.letterSpacing,
            weight: style.weight,
            family: style.family
        )
    }

    /// Get all display styles with theme scaling
    public var display: BPTypography.Display.Type { BPTypography.Display.self }

    /// Get all heading styles with theme scaling
    public var heading: BPTypography.Heading.Type { BPTypography.Heading.self }

    /// Get all body styles with theme scaling
    public var body: BPTypography.Body.Type { BPTypography.Body.self }

    /// Get all label styles with theme scaling
    public var label: BPTypography.Label.Type { BPTypography.Label.self }

    /// Get all caption styles with theme scaling
    public var caption: BPTypography.Caption.Type { BPTypography.Caption.self }

    /// Get all mono styles with theme scaling
    public var mono: BPTypography.Mono.Type { BPTypography.Mono.self }

    /// Get semantic typography styles
    public var semantic: BPTypography.Semantic.Type { BPTypography.Semantic.self }

    /// Get productivity typography styles
    public var productivity: BPTypography.Productivity.Type { BPTypography.Productivity.self }
}

// MARK: - Theme Spacing

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeSpacing {

    public let accessibilityLevel: BPTheme.AccessibilityLevel
    public let scalingFactor: CGFloat

    public init(accessibilityLevel: BPTheme.AccessibilityLevel = .standard) {
        self.accessibilityLevel = accessibilityLevel

        switch accessibilityLevel {
        case .standard:
            self.scalingFactor = 1.0
        case .enhanced:
            self.scalingFactor = 1.15
        case .maximum:
            self.scalingFactor = 1.3
        }
    }

    /// Apply theme-specific spacing scaling
    public func scaled(_ spacing: CGFloat) -> CGFloat {
        return spacing * scalingFactor
    }

    /// Get base spacing values with scaling
    public var xs: CGFloat { BPSpacing.xs * scalingFactor }
    public var sm: CGFloat { BPSpacing.sm * scalingFactor }
    public var md: CGFloat { BPSpacing.md * scalingFactor }
    public var lg: CGFloat { BPSpacing.lg * scalingFactor }
    public var xl: CGFloat { BPSpacing.xl * scalingFactor }
    public var xxl: CGFloat { BPSpacing.xxl * scalingFactor }
    public var xxxl: CGFloat { BPSpacing.xxxl * scalingFactor }
    public var xxxxl: CGFloat { BPSpacing.xxxxl * scalingFactor }
    public var xxxxxl: CGFloat { BPSpacing.xxxxxl * scalingFactor }
    public var xxxxxxl: CGFloat { BPSpacing.xxxxxxl * scalingFactor }

    /// Get semantic spacing with scaling
    public var semantic: BPSpacing.Semantic.Type { BPSpacing.Semantic.self }

    /// Get component spacing with scaling
    public var component: BPSpacing.Component.Type { BPSpacing.Component.self }

    /// Get layout spacing with scaling
    public var layout: BPSpacing.Layout.Type { BPSpacing.Layout.self }

    /// Get interactive spacing with scaling
    public var interactive: BPSpacing.Interactive.Type { BPSpacing.Interactive.self }

    /// Get typography spacing with scaling
    public var typography: BPSpacing.Typography.Type { BPSpacing.Typography.self }

    /// Get productivity spacing with scaling
    public var productivity: BPSpacing.Productivity.Type { BPSpacing.Productivity.self }

    /// Get status spacing with scaling
    public var status: BPSpacing.Status.Type { BPSpacing.Status.self }
}

// MARK: - Theme Shadows

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeShadows {

    public let appearance: UIUserInterfaceStyle

    public init(appearance: UIUserInterfaceStyle = .unspecified) {
        self.appearance = appearance
    }

    /// Subtle shadow for light elevation
    public var subtle: Color {
        appearance == .dark ?
        Color.black.opacity(0.15) :
        BPColors.Shadow.subtle
    }

    /// Small shadow for cards and buttons
    public var small: Color {
        appearance == .dark ?
        Color.black.opacity(0.25) :
        BPColors.Shadow.small
    }

    /// Medium shadow for modals and overlays
    public var medium: Color {
        appearance == .dark ?
        Color.black.opacity(0.35) :
        BPColors.Shadow.medium
    }

    /// Large shadow for floating elements
    public var large: Color {
        appearance == .dark ?
        Color.black.opacity(0.45) :
        BPColors.Shadow.large
    }

    /// Extra large shadow for major elevation
    public var xl: Color {
        appearance == .dark ?
        Color.black.opacity(0.55) :
        BPColors.Shadow.xl
    }
}

// MARK: - Theme Borders

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeBorders {

    public let appearance: UIUserInterfaceStyle

    public init(appearance: UIUserInterfaceStyle = .unspecified) {
        self.appearance = appearance
    }

    /// Default border width
    public let defaultWidth: CGFloat = 1

    /// Thick border width
    public let thickWidth: CGFloat = 2

    /// Focus border width
    public let focusWidth: CGFloat = 3

    /// Default border radius
    public let defaultRadius: CGFloat = 8

    /// Small border radius
    public let smallRadius: CGFloat = 4

    /// Large border radius
    public let largeRadius: CGFloat = 12

    /// Round border radius (for circular elements)
    public let roundRadius: CGFloat = 999
}

// MARK: - Theme Animations

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemeAnimations {

    /// Quick animation duration (100ms)
    public let quick: TimeInterval = 0.1

    /// Fast animation duration (150ms)
    public let fast: TimeInterval = 0.15

    /// Normal animation duration (250ms)
    public let normal: TimeInterval = 0.25

    /// Slow animation duration (350ms)
    public let slow: TimeInterval = 0.35

    /// Slower animation duration (500ms)
    public let slower: TimeInterval = 0.5

    /// Spring animation configuration
    public let spring = Animation.spring(
        response: 0.5,
        dampingFraction: 0.8,
        blendDuration: 0
    )

    /// Eased animation configuration
    public let eased = Animation.easeInOut(duration: 0.25)

    /// Bouncy animation configuration
    public let bouncy = Animation.spring(
        response: 0.6,
        dampingFraction: 0.6,
        blendDuration: 0
    )

    /// Smooth animation configuration
    public let smooth = Animation.easeOut(duration: 0.3)
}