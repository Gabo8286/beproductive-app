import SwiftUI

/// BeProductive Text Component
///
/// A comprehensive text component that provides consistent typography, semantic styling,
/// accessibility compliance, and theme integration throughout the BeProductive application.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPText: View {

    // MARK: - Properties

    private let content: String
    private let style: TextStyle
    private let color: TextColor?
    private let alignment: TextAlignment
    private let lineLimit: Int?
    private let multilineTextAlignment: TextAlignment
    private let truncationMode: Text.TruncationMode

    @Environment(\.bpTheme) private var theme

    // MARK: - Text Styles

    public enum TextStyle: CaseIterable {
        // Display styles
        case displayLarge
        case displayMedium
        case displaySmall

        // Heading styles
        case heading1
        case heading2
        case heading3
        case heading4
        case heading5
        case heading6

        // Body styles
        case bodyLarge
        case bodyMedium
        case bodySmall
        case bodyEmphasized

        // Label styles
        case labelLarge
        case labelMedium
        case labelSmall

        // Caption styles
        case captionLarge
        case captionMedium
        case captionSmall

        // Monospace styles
        case monoLarge
        case monoMedium
        case monoSmall

        // Semantic styles
        case pageTitle
        case sectionTitle
        case cardTitle
        case button
        case navigation
        case placeholder
        case error
        case success
        case timestamp
        case badge
        case tabLabel
        case metric
        case quote
        case footer

        // Productivity styles
        case taskTitle
        case goalTitle
        case projectTitle
        case noteTitle
        case progressLabel
        case deadline
        case priority
        case status
        case aiMessage
        case userMessage
        case habitStreak

        var description: String {
            switch self {
            case .displayLarge: return "Display Large"
            case .displayMedium: return "Display Medium"
            case .displaySmall: return "Display Small"
            case .heading1: return "Heading 1"
            case .heading2: return "Heading 2"
            case .heading3: return "Heading 3"
            case .heading4: return "Heading 4"
            case .heading5: return "Heading 5"
            case .heading6: return "Heading 6"
            case .bodyLarge: return "Body Large"
            case .bodyMedium: return "Body Medium"
            case .bodySmall: return "Body Small"
            case .bodyEmphasized: return "Body Emphasized"
            case .labelLarge: return "Label Large"
            case .labelMedium: return "Label Medium"
            case .labelSmall: return "Label Small"
            case .captionLarge: return "Caption Large"
            case .captionMedium: return "Caption Medium"
            case .captionSmall: return "Caption Small"
            case .monoLarge: return "Mono Large"
            case .monoMedium: return "Mono Medium"
            case .monoSmall: return "Mono Small"
            case .pageTitle: return "Page Title"
            case .sectionTitle: return "Section Title"
            case .cardTitle: return "Card Title"
            case .button: return "Button Text"
            case .navigation: return "Navigation Text"
            case .placeholder: return "Placeholder Text"
            case .error: return "Error Text"
            case .success: return "Success Text"
            case .timestamp: return "Timestamp"
            case .badge: return "Badge Text"
            case .tabLabel: return "Tab Label"
            case .metric: return "Metric Text"
            case .quote: return "Quote Text"
            case .footer: return "Footer Text"
            case .taskTitle: return "Task Title"
            case .goalTitle: return "Goal Title"
            case .projectTitle: return "Project Title"
            case .noteTitle: return "Note Title"
            case .progressLabel: return "Progress Label"
            case .deadline: return "Deadline Text"
            case .priority: return "Priority Text"
            case .status: return "Status Text"
            case .aiMessage: return "AI Message"
            case .userMessage: return "User Message"
            case .habitStreak: return "Habit Streak"
            }
        }
    }

    // MARK: - Text Colors

    public enum TextColor: CaseIterable {
        case primary
        case secondary
        case tertiary
        case disabled
        case inverse
        case success
        case warning
        case error
        case info
        case brand
        case accent
        case custom(Color)

        public static var allCases: [TextColor] {
            return [.primary, .secondary, .tertiary, .disabled, .inverse, .success, .warning, .error, .info, .brand, .accent]
        }

        var description: String {
            switch self {
            case .primary: return "Primary"
            case .secondary: return "Secondary"
            case .tertiary: return "Tertiary"
            case .disabled: return "Disabled"
            case .inverse: return "Inverse"
            case .success: return "Success"
            case .warning: return "Warning"
            case .error: return "Error"
            case .info: return "Info"
            case .brand: return "Brand"
            case .accent: return "Accent"
            case .custom(_): return "Custom"
            }
        }
    }

    // MARK: - Initializers

    /// Create a text component with basic styling
    public init(
        _ content: String,
        style: TextStyle = .bodyMedium,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading,
        lineLimit: Int? = nil,
        multilineTextAlignment: TextAlignment = .leading,
        truncationMode: Text.TruncationMode = .tail
    ) {
        self.content = content
        self.style = style
        self.color = color
        self.alignment = alignment
        self.lineLimit = lineLimit
        self.multilineTextAlignment = multilineTextAlignment
        self.truncationMode = truncationMode
    }

    // MARK: - Body

    public var body: some View {
        Text(content)
            .bpTextStyle(resolvedTextStyle)
            .foregroundColor(resolvedColor)
            .multilineTextAlignment(multilineTextAlignment)
            .lineLimit(lineLimit)
            .truncationMode(truncationMode)
            .accessibilityLabel(accessibilityLabel)
            .accessibilityAddTraits(accessibilityTraits)
    }

    // MARK: - Style Resolution

    private var resolvedTextStyle: BPTextStyle {
        let baseStyle = baseTextStyle
        return theme.typography.scaled(baseStyle)
    }

    private var baseTextStyle: BPTextStyle {
        switch style {
        // Display styles
        case .displayLarge: return BPTypography.Display.large
        case .displayMedium: return BPTypography.Display.medium
        case .displaySmall: return BPTypography.Display.small

        // Heading styles
        case .heading1: return BPTypography.Heading.h1
        case .heading2: return BPTypography.Heading.h2
        case .heading3: return BPTypography.Heading.h3
        case .heading4: return BPTypography.Heading.h4
        case .heading5: return BPTypography.Heading.h5
        case .heading6: return BPTypography.Heading.h6

        // Body styles
        case .bodyLarge: return BPTypography.Body.large
        case .bodyMedium: return BPTypography.Body.medium
        case .bodySmall: return BPTypography.Body.small
        case .bodyEmphasized: return BPTypography.Body.emphasized

        // Label styles
        case .labelLarge: return BPTypography.Label.large
        case .labelMedium: return BPTypography.Label.medium
        case .labelSmall: return BPTypography.Label.small

        // Caption styles
        case .captionLarge: return BPTypography.Caption.large
        case .captionMedium: return BPTypography.Caption.medium
        case .captionSmall: return BPTypography.Caption.small

        // Monospace styles
        case .monoLarge: return BPTypography.Mono.large
        case .monoMedium: return BPTypography.Mono.medium
        case .monoSmall: return BPTypography.Mono.small

        // Semantic styles
        case .pageTitle: return BPTypography.Semantic.pageTitle
        case .sectionTitle: return BPTypography.Semantic.sectionTitle
        case .cardTitle: return BPTypography.Semantic.cardTitle
        case .button: return BPTypography.Semantic.button
        case .navigation: return BPTypography.Semantic.navigation
        case .placeholder: return BPTypography.Semantic.placeholder
        case .error: return BPTypography.Semantic.error
        case .success: return BPTypography.Semantic.success
        case .timestamp: return BPTypography.Semantic.timestamp
        case .badge: return BPTypography.Semantic.badge
        case .tabLabel: return BPTypography.Semantic.tabLabel
        case .metric: return BPTypography.Semantic.metric
        case .quote: return BPTypography.Semantic.quote
        case .footer: return BPTypography.Semantic.footer

        // Productivity styles
        case .taskTitle: return BPTypography.Productivity.taskTitle
        case .goalTitle: return BPTypography.Productivity.goalTitle
        case .projectTitle: return BPTypography.Productivity.projectTitle
        case .noteTitle: return BPTypography.Productivity.noteTitle
        case .progressLabel: return BPTypography.Productivity.progressLabel
        case .deadline: return BPTypography.Productivity.deadline
        case .priority: return BPTypography.Productivity.priority
        case .status: return BPTypography.Productivity.status
        case .aiMessage: return BPTypography.Productivity.aiMessage
        case .userMessage: return BPTypography.Productivity.userMessage
        case .habitStreak: return BPTypography.Productivity.habitStreak
        }
    }

    private var resolvedColor: Color {
        guard let color = color else {
            return defaultColorForStyle
        }

        switch color {
        case .primary:
            return theme.colors.text.primary
        case .secondary:
            return theme.colors.text.secondary
        case .tertiary:
            return theme.colors.text.tertiary
        case .disabled:
            return theme.colors.text.disabled
        case .inverse:
            return theme.colors.text.inverse
        case .success:
            return theme.colors.success.main
        case .warning:
            return theme.colors.warning.main
        case .error:
            return theme.colors.error.main
        case .info:
            return theme.colors.info.main
        case .brand:
            return theme.colors.primary.main
        case .accent:
            return theme.colors.secondary.main
        case .custom(let customColor):
            return theme.colors.enhancedContrast(customColor)
        }
    }

    private var defaultColorForStyle: Color {
        switch style {
        case .error:
            return theme.colors.error.main
        case .success:
            return theme.colors.success.main
        case .timestamp, .placeholder:
            return theme.colors.text.tertiary
        case .pageTitle, .sectionTitle, .cardTitle:
            return theme.colors.text.primary
        case .metric, .habitStreak:
            return theme.colors.primary.main
        case .badge, .status:
            return theme.colors.text.secondary
        default:
            return theme.colors.text.primary
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabel: String {
        return content
    }

    private var accessibilityTraits: AccessibilityTraits {
        var traits: AccessibilityTraits = [.isStaticText]

        // Add header trait for headings
        switch style {
        case .displayLarge, .displayMedium, .displaySmall,
             .heading1, .heading2, .heading3, .heading4, .heading5, .heading6,
             .pageTitle, .sectionTitle, .cardTitle:
            traits.formUnion(.isHeader)
        default:
            break
        }

        return traits
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPText {

    /// Create a heading text
    public static func heading(
        _ content: String,
        level: Int = 1,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading
    ) -> BPText {
        let style: TextStyle
        switch level {
        case 1: style = .heading1
        case 2: style = .heading2
        case 3: style = .heading3
        case 4: style = .heading4
        case 5: style = .heading5
        default: style = .heading6
        }

        return BPText(content, style: style, color: color, alignment: alignment)
    }

    /// Create a body text
    public static func body(
        _ content: String,
        size: BodySize = .medium,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading,
        lineLimit: Int? = nil
    ) -> BPText {
        let style: TextStyle
        switch size {
        case .small: style = .bodySmall
        case .medium: style = .bodyMedium
        case .large: style = .bodyLarge
        case .emphasized: style = .bodyEmphasized
        }

        return BPText(content, style: style, color: color, alignment: alignment, lineLimit: lineLimit)
    }

    /// Create a caption text
    public static func caption(
        _ content: String,
        size: CaptionSize = .medium,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading
    ) -> BPText {
        let style: TextStyle
        switch size {
        case .small: style = .captionSmall
        case .medium: style = .captionMedium
        case .large: style = .captionLarge
        }

        return BPText(content, style: style, color: color, alignment: alignment)
    }

    /// Create a label text
    public static func label(
        _ content: String,
        size: LabelSize = .medium,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading
    ) -> BPText {
        let style: TextStyle
        switch size {
        case .small: style = .labelSmall
        case .medium: style = .labelMedium
        case .large: style = .labelLarge
        }

        return BPText(content, style: style, color: color, alignment: alignment)
    }

    /// Create a monospace text
    public static func mono(
        _ content: String,
        size: MonoSize = .medium,
        color: TextColor? = nil,
        alignment: TextAlignment = .leading
    ) -> BPText {
        let style: TextStyle
        switch size {
        case .small: style = .monoSmall
        case .medium: style = .monoMedium
        case .large: style = .monoLarge
        }

        return BPText(content, style: style, color: color, alignment: alignment)
    }

    /// Create an error text
    public static func error(
        _ content: String,
        alignment: TextAlignment = .leading
    ) -> BPText {
        return BPText(content, style: .error, color: .error, alignment: alignment)
    }

    /// Create a success text
    public static func success(
        _ content: String,
        alignment: TextAlignment = .leading
    ) -> BPText {
        return BPText(content, style: .success, color: .success, alignment: alignment)
    }

    /// Create a placeholder text
    public static func placeholder(
        _ content: String,
        alignment: TextAlignment = .leading
    ) -> BPText {
        return BPText(content, style: .placeholder, color: .tertiary, alignment: alignment)
    }

    // Helper enums for convenience initializers
    public enum BodySize {
        case small, medium, large, emphasized
    }

    public enum CaptionSize {
        case small, medium, large
    }

    public enum LabelSize {
        case small, medium, large
    }

    public enum MonoSize {
        case small, medium, large
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPText_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Display styles
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Display Styles", style: .sectionTitle)
                    BPText("Display Large", style: .displayLarge)
                    BPText("Display Medium", style: .displayMedium)
                    BPText("Display Small", style: .displaySmall)
                }

                Divider()

                // Heading styles
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Heading Styles", style: .sectionTitle)
                    BPText("Heading 1", style: .heading1)
                    BPText("Heading 2", style: .heading2)
                    BPText("Heading 3", style: .heading3)
                    BPText("Heading 4", style: .heading4)
                    BPText("Heading 5", style: .heading5)
                    BPText("Heading 6", style: .heading6)
                }

                Divider()

                // Body styles
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Body Styles", style: .sectionTitle)
                    BPText("Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.", style: .bodyLarge)
                    BPText("Body Medium - Lorem ipsum dolor sit amet, consectetur adipiscing elit.", style: .bodyMedium)
                    BPText("Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.", style: .bodySmall)
                    BPText("Body Emphasized - Lorem ipsum dolor sit amet, consectetur adipiscing elit.", style: .bodyEmphasized)
                }

                Divider()

                // Semantic colors
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Semantic Colors", style: .sectionTitle)
                    BPText("Primary Text", color: .primary)
                    BPText("Secondary Text", color: .secondary)
                    BPText("Success Text", color: .success)
                    BPText("Warning Text", color: .warning)
                    BPText("Error Text", color: .error)
                    BPText("Info Text", color: .info)
                }

                Divider()

                // Convenience methods
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Convenience Methods", style: .sectionTitle)
                    BPText.heading("Heading Text", level: 2)
                    BPText.body("Body text with medium size")
                    BPText.caption("Caption text")
                    BPText.label("Label text")
                    BPText.mono("Monospace text")
                    BPText.error("Error message")
                    BPText.success("Success message")
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}