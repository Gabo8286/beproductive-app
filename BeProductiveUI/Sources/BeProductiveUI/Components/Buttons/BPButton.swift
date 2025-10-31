import SwiftUI

/// BeProductive Button Component
///
/// A comprehensive button component that provides consistent styling, accessibility,
/// and interaction patterns throughout the BeProductive application.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPButton: View {

    // MARK: - Properties

    private let title: String
    private let icon: String?
    private let style: ButtonStyle
    private let size: ButtonSize
    private let state: ButtonState
    private let fullWidth: Bool
    private let loading: Bool
    private let action: () -> Void

    @Environment(\.bpTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled

    @State private var isPressed = false

    // MARK: - Button Styles

    public enum ButtonStyle: CaseIterable {
        case primary
        case secondary
        case tertiary
        case destructive
        case success
        case warning
        case ghost
        case outline
        case link

        var description: String {
            switch self {
            case .primary: return "Primary"
            case .secondary: return "Secondary"
            case .tertiary: return "Tertiary"
            case .destructive: return "Destructive"
            case .success: return "Success"
            case .warning: return "Warning"
            case .ghost: return "Ghost"
            case .outline: return "Outline"
            case .link: return "Link"
            }
        }
    }

    // MARK: - Button Sizes

    public enum ButtonSize: CaseIterable {
        case small
        case medium
        case large
        case extraLarge

        var description: String {
            switch self {
            case .small: return "Small"
            case .medium: return "Medium"
            case .large: return "Large"
            case .extraLarge: return "Extra Large"
            }
        }
    }

    // MARK: - Button States

    public enum ButtonState {
        case normal
        case focused
        case disabled
        case loading
    }

    // MARK: - Initializers

    /// Create a basic button with text
    public init(
        _ title: String,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        fullWidth: Bool = false,
        loading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = nil
        self.style = style
        self.size = size
        self.state = loading ? .loading : .normal
        self.fullWidth = fullWidth
        self.loading = loading
        self.action = action
    }

    /// Create a button with text and icon
    public init(
        _ title: String,
        icon: String,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        fullWidth: Bool = false,
        loading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.style = style
        self.size = size
        self.state = loading ? .loading : .normal
        self.fullWidth = fullWidth
        self.loading = loading
        self.action = action
    }

    /// Create an icon-only button
    public init(
        icon: String,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        action: @escaping () -> Void
    ) {
        self.title = ""
        self.icon = icon
        self.style = style
        self.size = size
        self.state = .normal
        self.fullWidth = false
        self.loading = false
        self.action = action
    }

    // MARK: - Body

    public var body: some View {
        Button(action: handleAction) {
            buttonContent
        }
        .buttonStyle(BPButtonStyle(
            bpStyle: style,
            size: size,
            isPressed: $isPressed,
            fullWidth: fullWidth
        ))
        .disabled(!isEnabled || loading)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint(accessibilityHint)
        .accessibilityAddTraits(accessibilityTraits)
    }

    // MARK: - Button Content

    @ViewBuilder
    private var buttonContent: some View {
        HStack(spacing: theme.spacing.xs) {
            if loading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: textColor))
                    .scaleEffect(progressViewScale)
            } else if let icon = icon, !title.isEmpty {
                Image(systemName: icon)
                    .font(iconFont)
                Text(title)
                    .font(textFont)
            } else if let icon = icon {
                Image(systemName: icon)
                    .font(iconFont)
            } else {
                Text(title)
                    .font(textFont)
            }
        }
        .foregroundColor(textColor)
        .frame(maxWidth: fullWidth ? .infinity : nil)
        .frame(minHeight: minHeight)
        .animation(Animation.easeInOut(duration: theme.animations.fast), value: loading)
    }

    // MARK: - Style Computations

    private var textColor: Color {
        if !isEnabled || loading {
            return theme.colors.text.disabled
        }

        switch style {
        case .primary:
            return theme.colors.text.inverse
        case .secondary:
            return theme.colors.primary.text
        case .tertiary:
            return theme.colors.text.secondary
        case .destructive:
            return style == .outline ? theme.colors.error.main : theme.colors.text.inverse
        case .success:
            return style == .outline ? theme.colors.success.main : theme.colors.text.inverse
        case .warning:
            return style == .outline ? theme.colors.warning.main : theme.colors.text.inverse
        case .ghost, .link:
            return theme.colors.primary.main
        case .outline:
            return theme.colors.primary.main
        }
    }

    private var textFont: Font {
        let baseStyle = theme.typography.semantic.button
        let scaledStyle = theme.typography.scaled(baseStyle)

        switch size {
        case .small:
            return scaledStyle.font
        case .medium:
            return scaledStyle.font
        case .large:
            return Font.system(size: scaledStyle.size * 1.1, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        case .extraLarge:
            return Font.system(size: scaledStyle.size * 1.25, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        }
    }

    private var iconFont: Font {
        switch size {
        case .small:
            return .caption
        case .medium:
            return .body
        case .large:
            return .title3
        case .extraLarge:
            return .title2
        }
    }

    private var minHeight: CGFloat {
        switch size {
        case .small:
            return theme.spacing.scaled(32)
        case .medium:
            return theme.spacing.scaled(44)
        case .large:
            return theme.spacing.scaled(52)
        case .extraLarge:
            return theme.spacing.scaled(60)
        }
    }

    private var progressViewScale: CGFloat {
        switch size {
        case .small:
            return 0.7
        case .medium:
            return 0.8
        case .large:
            return 0.9
        case .extraLarge:
            return 1.0
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabel: String {
        if title.isEmpty && icon != nil {
            return "Button" // Should be customized based on icon
        }
        return title
    }

    private var accessibilityHint: String {
        if loading {
            return "Loading"
        }
        return style.description + " button"
    }

    private var accessibilityTraits: AccessibilityTraits {
        var traits: AccessibilityTraits = [.isButton]

        if loading {
            _ = traits.insert(.updatesFrequently)
        }

        return traits
    }

    // MARK: - Actions

    private func handleAction() {
        guard isEnabled && !loading else { return }

        // Haptic feedback for better UX
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()

        action()
    }
}

// MARK: - Button Style Implementation

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPButtonStyle: ButtonStyle {

    @Environment(\.bpTheme) private var theme

    let bpStyle: BPButton.ButtonStyle
    let size: BPButton.ButtonSize
    @Binding var isPressed: Bool
    let fullWidth: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, horizontalPadding)
            .padding(.vertical, verticalPadding)
            .background(backgroundColor(isPressed: configuration.isPressed))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(Animation.easeInOut(duration: theme.animations.fast), value: configuration.isPressed)
            .onChange(of: configuration.isPressed) { newValue in
                isPressed = newValue
            }
    }

    // MARK: - Style Computations

    private var horizontalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.sm
        case .medium:
            return theme.spacing.md
        case .large:
            return theme.spacing.lg
        case .extraLarge:
            return theme.spacing.xl
        }
    }

    private var verticalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.xs
        case .medium:
            return theme.spacing.sm
        case .large:
            return theme.spacing.md
        case .extraLarge:
            return theme.spacing.lg
        }
    }

    private var cornerRadius: CGFloat {
        switch size {
        case .small:
            return theme.borders.smallRadius
        case .medium, .large, .extraLarge:
            return theme.borders.defaultRadius
        }
    }

    private func backgroundColor(isPressed: Bool) -> Color {
        let baseColor = baseBackgroundColor

        if isPressed {
            return theme.colors.enhancedContrast(baseColor.darker(by: 0.1))
        }

        return baseColor
    }

    private var baseBackgroundColor: Color {
        switch bpStyle {
        case .primary:
            return theme.colors.primary.main
        case .secondary:
            return theme.colors.secondary.main
        case .tertiary:
            return theme.colors.background.tertiary
        case .destructive:
            return theme.colors.error.main
        case .success:
            return theme.colors.success.main
        case .warning:
            return theme.colors.warning.main
        case .ghost, .link:
            return Color.clear
        case .outline:
            return Color.clear
        }
    }

    private var borderColor: Color {
        switch bpStyle {
        case .outline:
            return theme.colors.border.default
        case .ghost, .link:
            return Color.clear
        default:
            return Color.clear
        }
    }

    private var borderWidth: CGFloat {
        switch bpStyle {
        case .outline:
            return theme.borders.defaultWidth
        default:
            return 0
        }
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPButton {

    /// Create a primary button
    public static func primary(
        _ title: String,
        icon: String? = nil,
        size: ButtonSize = .medium,
        fullWidth: Bool = false,
        loading: Bool = false,
        action: @escaping () -> Void
    ) -> BPButton {
        if let icon = icon {
            return BPButton(title, icon: icon, style: .primary, size: size, fullWidth: fullWidth, loading: loading, action: action)
        } else {
            return BPButton(title, style: .primary, size: size, fullWidth: fullWidth, loading: loading, action: action)
        }
    }

    /// Create a secondary button
    public static func secondary(
        _ title: String,
        icon: String? = nil,
        size: ButtonSize = .medium,
        fullWidth: Bool = false,
        action: @escaping () -> Void
    ) -> BPButton {
        if let icon = icon {
            return BPButton(title, icon: icon, style: .secondary, size: size, fullWidth: fullWidth, action: action)
        } else {
            return BPButton(title, style: .secondary, size: size, fullWidth: fullWidth, action: action)
        }
    }

    /// Create a destructive button
    public static func destructive(
        _ title: String,
        icon: String? = nil,
        size: ButtonSize = .medium,
        fullWidth: Bool = false,
        action: @escaping () -> Void
    ) -> BPButton {
        if let icon = icon {
            return BPButton(title, icon: icon, style: .destructive, size: size, fullWidth: fullWidth, action: action)
        } else {
            return BPButton(title, style: .destructive, size: size, fullWidth: fullWidth, action: action)
        }
    }

    /// Create a ghost button
    public static func ghost(
        _ title: String,
        icon: String? = nil,
        size: ButtonSize = .medium,
        action: @escaping () -> Void
    ) -> BPButton {
        if let icon = icon {
            return BPButton(title, icon: icon, style: .ghost, size: size, action: action)
        } else {
            return BPButton(title, style: .ghost, size: size, action: action)
        }
    }

    /// Create an icon-only button
    public static func icon(
        _ icon: String,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        action: @escaping () -> Void
    ) -> BPButton {
        return BPButton(icon: icon, style: style, size: size, action: action)
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPButton_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            // Basic buttons
            BPButton("Primary Button", style: .primary) { }
            BPButton("Secondary Button", style: .secondary) { }
            BPButton("Destructive Button", style: .destructive) { }

            // Buttons with icons
            BPButton("Save", icon: "checkmark", style: .primary) { }
            BPButton("Delete", icon: "trash", style: .destructive) { }

            // Different sizes
            HStack {
                BPButton("Small", style: .primary, size: .small) { }
                BPButton("Medium", style: .primary, size: .medium) { }
                BPButton("Large", style: .primary, size: .large) { }
            }

            // Loading states
            BPButton("Loading", style: .primary, loading: true) { }

            // Full width
            BPButton("Full Width", style: .primary, fullWidth: true) { }
        }
        .padding()
        .beProductiveTheme()
    }
}