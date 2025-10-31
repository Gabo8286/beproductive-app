import SwiftUI

/// BeProductive Typography System
///
/// A comprehensive type scale designed for productivity applications with Dynamic Type support,
/// accessibility compliance, and proper text hierarchy for complex information displays.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTypography {

    // MARK: - Font Families

    /// System font stack with fallbacks
    public enum FontFamily: String, CaseIterable {
        case system = "SF Pro"
        case rounded = "SF Pro Rounded"
        case mono = "SF Mono"

        var font: Font.Design {
            switch self {
            case .system:
                return .default
            case .rounded:
                return .rounded
            case .mono:
                return .monospaced
            }
        }
    }

    // MARK: - Font Weights

    /// Semantic font weights for consistent typography
    public enum FontWeight: String, CaseIterable {
        case light = "Light"
        case regular = "Regular"
        case medium = "Medium"
        case semibold = "Semibold"
        case bold = "Bold"

        var weight: Font.Weight {
            switch self {
            case .light:
                return .light
            case .regular:
                return .regular
            case .medium:
                return .medium
            case .semibold:
                return .semibold
            case .bold:
                return .bold
            }
        }
    }

    // MARK: - Typography Scale

    /// Display text styles for large headings and hero content
    public struct Display {
        /// Display Large - 57pt/64pt line height
        public static let large = BPTextStyle(
            size: 57,
            lineHeight: 64,
            letterSpacing: -0.25,
            weight: .bold,
            family: .system
        )

        /// Display Medium - 45pt/52pt line height
        public static let medium = BPTextStyle(
            size: 45,
            lineHeight: 52,
            letterSpacing: 0,
            weight: .bold,
            family: .system
        )

        /// Display Small - 36pt/44pt line height
        public static let small = BPTextStyle(
            size: 36,
            lineHeight: 44,
            letterSpacing: 0,
            weight: .bold,
            family: .system
        )
    }

    /// Heading text styles for section headers and page titles
    public struct Heading {
        /// Heading 1 - 32pt/40pt line height
        public static let h1 = BPTextStyle(
            size: 32,
            lineHeight: 40,
            letterSpacing: 0,
            weight: .bold,
            family: .system
        )

        /// Heading 2 - 28pt/36pt line height
        public static let h2 = BPTextStyle(
            size: 28,
            lineHeight: 36,
            letterSpacing: 0,
            weight: .semibold,
            family: .system
        )

        /// Heading 3 - 24pt/32pt line height
        public static let h3 = BPTextStyle(
            size: 24,
            lineHeight: 32,
            letterSpacing: 0,
            weight: .semibold,
            family: .system
        )

        /// Heading 4 - 20pt/28pt line height
        public static let h4 = BPTextStyle(
            size: 20,
            lineHeight: 28,
            letterSpacing: 0.15,
            weight: .medium,
            family: .system
        )

        /// Heading 5 - 18pt/26pt line height
        public static let h5 = BPTextStyle(
            size: 18,
            lineHeight: 26,
            letterSpacing: 0.15,
            weight: .medium,
            family: .system
        )

        /// Heading 6 - 16pt/24pt line height
        public static let h6 = BPTextStyle(
            size: 16,
            lineHeight: 24,
            letterSpacing: 0.15,
            weight: .medium,
            family: .system
        )
    }

    /// Body text styles for main content and reading
    public struct Body {
        /// Body Large - 16pt/24pt line height
        public static let large = BPTextStyle(
            size: 16,
            lineHeight: 24,
            letterSpacing: 0.5,
            weight: .regular,
            family: .system
        )

        /// Body Medium - 14pt/20pt line height
        public static let medium = BPTextStyle(
            size: 14,
            lineHeight: 20,
            letterSpacing: 0.25,
            weight: .regular,
            family: .system
        )

        /// Body Small - 12pt/16pt line height
        public static let small = BPTextStyle(
            size: 12,
            lineHeight: 16,
            letterSpacing: 0.4,
            weight: .regular,
            family: .system
        )

        /// Body Emphasized - 16pt/24pt line height (medium weight)
        public static let emphasized = BPTextStyle(
            size: 16,
            lineHeight: 24,
            letterSpacing: 0.5,
            weight: .medium,
            family: .system
        )
    }

    /// Label text styles for UI elements and metadata
    public struct Label {
        /// Label Large - 14pt/20pt line height
        public static let large = BPTextStyle(
            size: 14,
            lineHeight: 20,
            letterSpacing: 0.1,
            weight: .medium,
            family: .system
        )

        /// Label Medium - 12pt/16pt line height
        public static let medium = BPTextStyle(
            size: 12,
            lineHeight: 16,
            letterSpacing: 0.5,
            weight: .medium,
            family: .system
        )

        /// Label Small - 11pt/16pt line height
        public static let small = BPTextStyle(
            size: 11,
            lineHeight: 16,
            letterSpacing: 0.5,
            weight: .medium,
            family: .system
        )
    }

    /// Caption text styles for small text and annotations
    public struct Caption {
        /// Caption Large - 12pt/16pt line height
        public static let large = BPTextStyle(
            size: 12,
            lineHeight: 16,
            letterSpacing: 0.4,
            weight: .regular,
            family: .system
        )

        /// Caption Medium - 11pt/14pt line height
        public static let medium = BPTextStyle(
            size: 11,
            lineHeight: 14,
            letterSpacing: 0.5,
            weight: .regular,
            family: .system
        )

        /// Caption Small - 10pt/12pt line height
        public static let small = BPTextStyle(
            size: 10,
            lineHeight: 12,
            letterSpacing: 0.5,
            weight: .regular,
            family: .system
        )
    }

    /// Monospace text styles for code and data
    public struct Mono {
        /// Code Large - 14pt/20pt line height
        public static let large = BPTextStyle(
            size: 14,
            lineHeight: 20,
            letterSpacing: 0,
            weight: .regular,
            family: .mono
        )

        /// Code Medium - 12pt/16pt line height
        public static let medium = BPTextStyle(
            size: 12,
            lineHeight: 16,
            letterSpacing: 0,
            weight: .regular,
            family: .mono
        )

        /// Code Small - 10pt/14pt line height
        public static let small = BPTextStyle(
            size: 10,
            lineHeight: 14,
            letterSpacing: 0,
            weight: .regular,
            family: .mono
        )
    }
}

// MARK: - Text Style Definition

/// A comprehensive text style definition with all typography properties
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTextStyle {
    public let size: CGFloat
    public let lineHeight: CGFloat
    public let letterSpacing: CGFloat
    public let weight: BPTypography.FontWeight
    public let family: BPTypography.FontFamily

    /// Line height as a multiplier of font size
    public var lineHeightMultiple: CGFloat {
        return lineHeight / size
    }

    /// Create a SwiftUI Font from this text style
    public var font: Font {
        return Font.system(
            size: size,
            weight: weight.weight,
            design: family.font
        )
    }

    /// Create a SwiftUI Font with Dynamic Type support
    public func dynamicFont(
        textStyle: Font.TextStyle = .body,
        maximumSize: CGFloat? = nil
    ) -> Font {
        var font = Font.system(
            textStyle,
            design: family.font,
            weight: weight.weight
        )

        if let maxSize = maximumSize {
            font = Font.system(
                size: min(size, maxSize),
                weight: weight.weight,
                design: family.font
            )
        }

        return font
    }
}

// MARK: - Text Style Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTextStyle {

    /// Apply this text style to a Text view
    public func apply(to text: Text) -> some View {
        text
            .font(font)
            .lineSpacing(lineHeight - size)
            .kerning(letterSpacing)
    }

    /// Create a modifier that applies this text style
    public func modifier() -> some ViewModifier {
        BPTextStyleModifier(style: self)
    }
}

// MARK: - View Modifiers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPTextStyleModifier: ViewModifier {
    let style: BPTextStyle

    func body(content: Content) -> some View {
        content
            .font(style.font)
            .lineSpacing(style.lineHeight - style.size)
            .kerning(style.letterSpacing)
    }
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Apply a BeProductive text style to any view
    public func bpTextStyle(_ style: BPTextStyle) -> some View {
        self.modifier(style.modifier())
    }

    /// Apply typography with accessibility support
    public func bpAccessibleText(
        _ style: BPTextStyle,
        dynamicType: Bool = true,
        maxSize: CGFloat? = nil
    ) -> some View {
        Group {
            if dynamicType {
                self.font(style.dynamicFont(maximumSize: maxSize))
            } else {
                self.font(style.font)
            }
        }
        .lineSpacing(style.lineHeight - style.size)
        .kerning(style.letterSpacing)
    }
}

// MARK: - Semantic Text Styles

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTypography {

    /// Semantic text styles for common UI elements
    public struct Semantic {
        /// Page title style
        public static let pageTitle = Heading.h1

        /// Section title style
        public static let sectionTitle = Heading.h3

        /// Card title style
        public static let cardTitle = Heading.h5

        /// Button text style
        public static let button = Label.large

        /// Navigation item style
        public static let navigation = Body.medium

        /// Input placeholder style
        public static let placeholder = Body.medium

        /// Error message style
        public static let error = Caption.medium

        /// Success message style
        public static let success = Caption.medium

        /// Timestamp style
        public static let timestamp = Caption.small

        /// Badge text style
        public static let badge = Label.small

        /// Tab label style
        public static let tabLabel = Label.medium

        /// Metric number style
        public static let metric = Display.medium

        /// Quote or testimonial style
        public static let quote = Body.large

        /// Footer text style
        public static let footer = Caption.medium
    }

    /// Productivity-specific text styles
    public struct Productivity {
        /// Task title style
        public static let taskTitle = Body.emphasized

        /// Goal title style
        public static let goalTitle = Heading.h4

        /// Project title style
        public static let projectTitle = Heading.h3

        /// Note title style
        public static let noteTitle = Heading.h5

        /// Progress label style
        public static let progressLabel = Label.medium

        /// Deadline style
        public static let deadline = Caption.large

        /// Priority label style
        public static let priority = Label.small

        /// Status badge style
        public static let status = Label.small

        /// AI message style
        public static let aiMessage = Body.medium

        /// User message style
        public static let userMessage = Body.medium

        /// Habit streak style
        public static let habitStreak = Display.small
    }
}

// MARK: - Dynamic Type Support

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTypography {

    /// Dynamic Type scaling factors for accessibility
    public struct DynamicTypeScaling {
        public static let small: CGFloat = 0.8
        public static let regular: CGFloat = 1.0
        public static let large: CGFloat = 1.2
        public static let extraLarge: CGFloat = 1.4
        public static let accessibility: CGFloat = 1.6

        /// Get the appropriate scaling factor for the current content size category
        public static func currentScalingFactor() -> CGFloat {
            let category = UIApplication.shared.preferredContentSizeCategory

            switch category {
            case .extraSmall, .small:
                return small
            case .medium, .large:
                return regular
            case .extraLarge, .extraExtraLarge:
                return large
            case .extraExtraExtraLarge:
                return extraLarge
            case .accessibilityMedium, .accessibilityLarge,
                 .accessibilityExtraLarge, .accessibilityExtraExtraLarge,
                 .accessibilityExtraExtraExtraLarge:
                return accessibility
            default:
                return regular
            }
        }
    }
}