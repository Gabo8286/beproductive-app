import SwiftUI

/// BeProductive Core Modifiers
///
/// A collection of commonly used view modifiers that provide consistent styling patterns
/// throughout the BeProductive application, building on the theme system foundation.

// MARK: - Card Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPCardModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: CardStyle
    let padding: PaddingStyle
    let interactive: Bool

    public enum CardStyle {
        case elevated
        case outlined
        case filled
        case subtle
        case flat
    }

    public enum PaddingStyle {
        case none
        case small
        case medium
        case large
        case custom(CGFloat)
    }

    public init(
        style: CardStyle = .elevated,
        padding: PaddingStyle = .medium,
        interactive: Bool = false
    ) {
        self.style = style
        self.padding = padding
        self.interactive = interactive
    }

    public func body(content: Content) -> some View {
        content
            .padding(paddingValue)
            .background(backgroundColor)
            .overlay(borderOverlay)
            .clipShape(RoundedRectangle(cornerRadius: theme.borders.defaultRadius))
            .shadow(color: shadowColor, radius: shadowRadius, x: shadowX, y: shadowY)
            .apply(if: interactive) { view in
                view.contentShape(Rectangle())
                    .hoverEffect(.lift)
            }
    }

    private var paddingValue: CGFloat {
        switch padding {
        case .none:
            return 0
        case .small:
            return theme.spacing.sm
        case .medium:
            return theme.spacing.md
        case .large:
            return theme.spacing.lg
        case .custom(let value):
            return theme.spacing.scaled(value)
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .elevated, .outlined, .flat:
            return theme.colors.background.card
        case .filled:
            return theme.colors.background.secondary
        case .subtle:
            return theme.colors.background.tertiary
        }
    }

    @ViewBuilder
    private var borderOverlay: some View {
        switch style {
        case .outlined:
            RoundedRectangle(cornerRadius: theme.borders.defaultRadius)
                .stroke(theme.colors.border.default, lineWidth: theme.borders.defaultWidth)
        default:
            EmptyView()
        }
    }

    private var shadowColor: Color {
        switch style {
        case .elevated:
            return theme.shadows.medium
        case .subtle:
            return theme.shadows.subtle
        default:
            return Color.clear
        }
    }

    private var shadowRadius: CGFloat {
        switch style {
        case .elevated:
            return 4
        case .subtle:
            return 1
        default:
            return 0
        }
    }

    private var shadowX: CGFloat { 0 }

    private var shadowY: CGFloat {
        switch style {
        case .elevated:
            return 2
        case .subtle:
            return 1
        default:
            return 0
        }
    }
}

// MARK: - Interactive State Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPInteractiveModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: InteractiveStyle
    let hapticFeedback: HapticStyle?

    @State private var isPressed = false
    @State private var isHovered = false

    public enum InteractiveStyle {
        case button
        case card
        case listItem
        case subtle
        case none
    }

    public enum HapticStyle {
        case light
        case medium
        case heavy
        case selection
    }

    public init(
        style: InteractiveStyle = .button,
        hapticFeedback: HapticStyle? = .light
    ) {
        self.style = style
        self.hapticFeedback = hapticFeedback
    }

    public func body(content: Content) -> some View {
        content
            .scaleEffect(scaleEffect)
            .opacity(opacityEffect)
            .animation(Animation.easeInOut(duration: theme.animations.fast), value: isPressed)
            .animation(Animation.easeInOut(duration: theme.animations.fast), value: isHovered)
            .onTapGesture {
                triggerHapticFeedback()
            }
            .pressEvents { isPressed in
                withAnimation(Animation.easeInOut(duration: theme.animations.fast)) {
                    self.isPressed = isPressed
                }
            }
            .onHover { isHovered in
                withAnimation(Animation.easeInOut(duration: theme.animations.fast)) {
                    self.isHovered = isHovered
                }
            }
    }

    private var scaleEffect: CGFloat {
        guard style != .none else { return 1.0 }

        if isPressed {
            switch style {
            case .button:
                return 0.96
            case .card:
                return 0.98
            case .listItem, .subtle:
                return 0.99
            case .none:
                return 1.0
            }
        }

        return 1.0
    }

    private var opacityEffect: Double {
        guard style != .none else { return 1.0 }

        if isPressed {
            return 0.8
        } else if isHovered {
            return 0.9
        }

        return 1.0
    }

    private func triggerHapticFeedback() {
        guard let hapticFeedback = hapticFeedback else { return }

        switch hapticFeedback {
        case .light:
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case .medium:
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case .heavy:
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        case .selection:
            UISelectionFeedbackGenerator().selectionChanged()
        }
    }
}

// MARK: - Loading State Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPLoadingModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let isLoading: Bool
    let style: LoadingStyle
    let overlay: Bool

    public enum LoadingStyle {
        case spinner
        case skeleton
        case blur
        case fade
    }

    public init(
        isLoading: Bool,
        style: LoadingStyle = .spinner,
        overlay: Bool = false
    ) {
        self.isLoading = isLoading
        self.style = style
        self.overlay = overlay
    }

    public func body(content: Content) -> some View {
        ZStack {
            content
                .opacity(contentOpacity)
                .disabled(isLoading)
                .blur(radius: blurRadius)

            if isLoading && overlay {
                loadingOverlay
            }
        }
        .animation(theme.animations.smooth, value: isLoading)
    }

    private var contentOpacity: Double {
        guard isLoading else { return 1.0 }

        switch style {
        case .fade:
            return 0.5
        case .blur:
            return 0.8
        default:
            return 1.0
        }
    }

    private var blurRadius: CGFloat {
        guard isLoading, style == .blur else { return 0 }
        return 2
    }

    @ViewBuilder
    private var loadingOverlay: some View {
        Rectangle()
            .fill(theme.colors.background.primary.opacity(0.8))
            .overlay(
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: theme.colors.primary.main))
                    .scaleEffect(1.2)
            )
    }
}

// MARK: - Badge Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPBadgeModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: BadgeStyle
    let size: BadgeSize

    public enum BadgeStyle {
        case primary
        case secondary
        case success
        case warning
        case error
        case info
        case neutral
        case outline
    }

    public enum BadgeSize {
        case small
        case medium
        case large
    }

    public init(
        style: BadgeStyle = .primary,
        size: BadgeSize = .medium
    ) {
        self.style = style
        self.size = size
    }

    public func body(content: Content) -> some View {
        content
            .font(textFont)
            .foregroundColor(textColor)
            .padding(.horizontal, horizontalPadding)
            .padding(.vertical, verticalPadding)
            .background(backgroundColor)
            .overlay(borderOverlay)
            .clipShape(Capsule())
    }

    private var textFont: Font {
        let baseStyle = theme.typography.semantic.badge
        let scaledStyle = theme.typography.scaled(baseStyle)

        switch size {
        case .small:
            return Font.system(size: scaledStyle.size * 0.8, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        case .medium:
            return scaledStyle.font
        case .large:
            return Font.system(size: scaledStyle.size * 1.2, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        }
    }

    private var textColor: Color {
        switch style {
        case .outline:
            return badgeColor
        default:
            return theme.colors.text.inverse
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .outline:
            return Color.clear
        default:
            return badgeColor
        }
    }

    private var badgeColor: Color {
        switch style {
        case .primary:
            return theme.colors.primary.main
        case .secondary:
            return theme.colors.secondary.main
        case .success:
            return theme.colors.success.main
        case .warning:
            return theme.colors.warning.main
        case .error:
            return theme.colors.error.main
        case .info:
            return theme.colors.info.main
        case .neutral, .outline:
            return theme.colors.neutral._500
        }
    }

    @ViewBuilder
    private var borderOverlay: some View {
        if style == .outline {
            Capsule()
                .stroke(badgeColor, lineWidth: theme.borders.defaultWidth)
        }
    }

    private var horizontalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.xs
        case .medium:
            return theme.spacing.sm
        case .large:
            return theme.spacing.md
        }
    }

    private var verticalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.xs * 0.5
        case .medium:
            return theme.spacing.xs
        case .large:
            return theme.spacing.sm
        }
    }
}

// MARK: - List Item Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPListItemModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: ListItemStyle
    let showDivider: Bool
    let interactive: Bool

    public enum ListItemStyle {
        case plain
        case inset
        case card
        case grouped
    }

    public init(
        style: ListItemStyle = .plain,
        showDivider: Bool = true,
        interactive: Bool = false
    ) {
        self.style = style
        self.showDivider = showDivider
        self.interactive = interactive
    }

    public func body(content: Content) -> some View {
        VStack(spacing: 0) {
            content
                .padding(.horizontal, horizontalPadding)
                .padding(.vertical, verticalPadding)
                .background(backgroundColor)
                .apply(if: interactive) { view in
                    view.bpInteractive(style: .listItem)
                }

            if showDivider {
                divider
            }
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .plain:
            return Color.clear
        case .inset, .grouped:
            return theme.colors.background.card
        case .card:
            return theme.colors.background.elevated
        }
    }

    private var horizontalPadding: CGFloat {
        switch style {
        case .plain:
            return theme.spacing.md
        case .inset:
            return theme.spacing.lg
        case .card, .grouped:
            return theme.spacing.md
        }
    }

    private var verticalPadding: CGFloat {
        switch style {
        case .plain, .inset:
            return theme.spacing.sm
        case .card, .grouped:
            return theme.spacing.md
        }
    }

    private var divider: some View {
        Rectangle()
            .fill(theme.colors.border.subtle)
            .frame(height: theme.borders.defaultWidth)
            .padding(.leading, horizontalPadding)
    }
}

// MARK: - Layout Helper Modifiers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPStackModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let spacing: StackSpacing
    let alignment: StackAlignment

    public enum StackSpacing {
        case none
        case tight
        case normal
        case loose
        case custom(CGFloat)
    }

    public enum StackAlignment {
        case leading
        case center
        case trailing
    }

    public init(
        spacing: StackSpacing = .normal,
        alignment: StackAlignment = .leading
    ) {
        self.spacing = spacing
        self.alignment = alignment
    }

    public func body(content: Content) -> some View {
        content
    }

    public var spacingValue: CGFloat {
        switch spacing {
        case .none:
            return 0
        case .tight:
            return theme.spacing.xs
        case .normal:
            return theme.spacing.sm
        case .loose:
            return theme.spacing.md
        case .custom(let value):
            return theme.spacing.scaled(value)
        }
    }
}

// MARK: - View Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Apply card styling to this view
    public func bpCard(
        style: BPCardModifier.CardStyle = .elevated,
        padding: BPCardModifier.PaddingStyle = .medium,
        interactive: Bool = false
    ) -> some View {
        self.modifier(BPCardModifier(
            style: style,
            padding: padding,
            interactive: interactive
        ))
    }

    /// Add interactive behavior to this view
    public func bpInteractive(
        style: BPInteractiveModifier.InteractiveStyle = .button,
        hapticFeedback: BPInteractiveModifier.HapticStyle? = .light
    ) -> some View {
        self.modifier(BPInteractiveModifier(
            style: style,
            hapticFeedback: hapticFeedback
        ))
    }

    /// Add loading state to this view
    public func bpLoading(
        _ isLoading: Bool,
        style: BPLoadingModifier.LoadingStyle = .spinner,
        overlay: Bool = false
    ) -> some View {
        self.modifier(BPLoadingModifier(
            isLoading: isLoading,
            style: style,
            overlay: overlay
        ))
    }

    /// Style this view as a badge
    public func bpBadge(
        style: BPBadgeModifier.BadgeStyle = .primary,
        size: BPBadgeModifier.BadgeSize = .medium
    ) -> some View {
        self.modifier(BPBadgeModifier(
            style: style,
            size: size
        ))
    }

    /// Style this view as a list item
    public func bpListItem(
        style: BPListItemModifier.ListItemStyle = .plain,
        showDivider: Bool = true,
        interactive: Bool = false
    ) -> some View {
        self.modifier(BPListItemModifier(
            style: style,
            showDivider: showDivider,
            interactive: interactive
        ))
    }
}

// MARK: - Helper Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Add press event handling
    func pressEvents(onPress: @escaping (Bool) -> Void) -> some View {
        self.simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in onPress(true) }
                .onEnded { _ in onPress(false) }
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPCoreModifiers_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Card examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Cards", style: .sectionTitle)

                    HStack(spacing: 12) {
                        BPText("Elevated")
                            .bpCard(style: .elevated)

                        BPText("Outlined")
                            .bpCard(style: .outlined)

                        BPText("Filled")
                            .bpCard(style: .filled)
                    }
                }

                Divider()

                // Badge examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Badges", style: .sectionTitle)

                    HStack(spacing: 8) {
                        BPText("Primary")
                            .bpBadge(style: .primary)

                        BPText("Success")
                            .bpBadge(style: .success)

                        BPText("Warning")
                            .bpBadge(style: .warning)

                        BPText("Error")
                            .bpBadge(style: .error)
                    }

                    HStack(spacing: 8) {
                        BPText("Small")
                            .bpBadge(style: .primary, size: .small)

                        BPText("Medium")
                            .bpBadge(style: .primary, size: .medium)

                        BPText("Large")
                            .bpBadge(style: .primary, size: .large)
                    }
                }

                Divider()

                // Interactive examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Interactive Elements", style: .sectionTitle)

                    BPText("Tap me!")
                        .bpCard(style: .elevated, interactive: true)
                        .bpInteractive(style: .card)

                    BPText("Button-style interaction")
                        .bpCard(style: .outlined)
                        .bpInteractive(style: .button)
                }

                Divider()

                // List items
                VStack(alignment: .leading, spacing: 0) {
                    BPText("List Items", style: .sectionTitle)
                        .padding(.bottom, 12)

                    BPText("Plain list item")
                        .bpListItem(style: .plain, interactive: true)

                    BPText("Inset list item")
                        .bpListItem(style: .inset, interactive: true)

                    BPText("Card list item")
                        .bpListItem(style: .card, showDivider: false, interactive: true)
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}