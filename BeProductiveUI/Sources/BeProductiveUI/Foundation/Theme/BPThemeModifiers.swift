import SwiftUI

/// BeProductive Theme View Modifiers
///
/// Provides convenient view modifiers for applying the BeProductive theme system
/// to SwiftUI views, including automatic theme injection, responsive scaling,
/// and accessibility compliance.

// MARK: - Primary Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPThemeModifier: ViewModifier {

    @ObservedObject private var themeManager = BPThemeManager.shared

    let customTheme: BPTheme?
    let respectSystemAppearance: Bool

    init(
        theme: BPTheme? = nil,
        respectSystemAppearance: Bool = true
    ) {
        self.customTheme = theme
        self.respectSystemAppearance = respectSystemAppearance
    }

    public func body(content: Content) -> some View {
        content
            .environment(\.bpTheme, effectiveTheme)
            .environment(\.bpThemeManager, themeManager)
            .environment(\.bpThemePreference, BPThemePreference(
                appearance: effectiveTheme.appearance,
                accessibilityLevel: effectiveTheme.accessibilityLevel,
                respectSystemAppearance: respectSystemAppearance
            ))
            .preferredColorScheme(colorScheme)
            .dynamicTypeSize(dynamicTypeSize)
    }

    private var effectiveTheme: BPTheme {
        customTheme ?? themeManager.currentTheme
    }

    private var colorScheme: ColorScheme? {
        switch effectiveTheme.appearance {
        case .light:
            return .light
        case .dark:
            return .dark
        case .unspecified:
            return nil
        @unknown default:
            return nil
        }
    }

    private var dynamicTypeSize: DynamicTypeSize {
        switch effectiveTheme.accessibilityLevel {
        case .standard:
            return .large
        case .enhanced:
            return .xLarge
        case .maximum:
            return .xxLarge
        }
    }
}

// MARK: - Background Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPBackgroundModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: BackgroundStyle
    let ignoresSafeArea: Bool

    public enum BackgroundStyle {
        case primary
        case secondary
        case tertiary
        case card
        case elevated
        case custom(Color)
    }

    init(
        style: BackgroundStyle = .primary,
        ignoresSafeArea: Bool = false
    ) {
        self.style = style
        self.ignoresSafeArea = ignoresSafeArea
    }

    public func body(content: Content) -> some View {
        content
            .background(backgroundColor)
            .apply(if: ignoresSafeArea) { view in
                view.ignoresSafeArea()
            }
    }

    private var backgroundColor: Color {
        switch style {
        case .primary:
            return theme.colors.background.primary
        case .secondary:
            return theme.colors.background.secondary
        case .tertiary:
            return theme.colors.background.tertiary
        case .card:
            return theme.colors.background.card
        case .elevated:
            return theme.colors.background.elevated
        case .custom(let color):
            return color
        }
    }
}

// MARK: - Text Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTextThemeModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let textStyle: TextStyle
    let color: TextColor?

    public enum TextStyle {
        case display(BPTypography.Display)
        case heading(BPTypography.Heading)
        case body(BPTypography.Body)
        case label(BPTypography.Label)
        case caption(BPTypography.Caption)
        case mono(BPTypography.Mono)
        case semantic(BPTypography.Semantic)
        case productivity(BPTypography.Productivity)
        case custom(BPTextStyle)
    }

    public enum TextColor {
        case primary
        case secondary
        case tertiary
        case disabled
        case inverse
        case success
        case warning
        case error
        case info
        case custom(Color)
    }

    init(
        style: TextStyle,
        color: TextColor? = nil
    ) {
        self.textStyle = style
        self.color = color
    }

    public func body(content: Content) -> some View {
        content
            .bpTextStyle(resolvedTextStyle)
            .foregroundColor(resolvedColor)
    }

    private var resolvedTextStyle: BPTextStyle {
        switch textStyle {
        case .display:
            return BPTypography.Display.large
        case .heading:
            return BPTypography.Heading.h1
        case .body:
            return BPTypography.Body.large
        case .label:
            return BPTypography.Label.large
        case .caption:
            return BPTypography.Caption.large
        case .mono:
            return BPTypography.Mono.large
        case .semantic:
            return BPTypography.Semantic.pageTitle
        case .productivity:
            return BPTypography.Productivity.taskTitle
        case .custom(let style):
            return theme.typography.scaled(style)
        }
    }

    private var resolvedColor: Color {
        guard let color = color else {
            return theme.colors.text.primary
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
        case .custom(let customColor):
            return theme.colors.enhancedContrast(customColor)
        }
    }
}

// MARK: - Border Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPBorderModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: BorderStyle
    let radius: BorderRadius

    public enum BorderStyle {
        case none
        case `default`
        case subtle
        case strong
        case focus
        case error
        case custom(Color, CGFloat)
    }

    public enum BorderRadius {
        case none
        case small
        case `default`
        case large
        case round
        case custom(CGFloat)
    }

    init(
        style: BorderStyle = .default,
        radius: BorderRadius = .default
    ) {
        self.style = style
        self.radius = radius
    }

    public func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: resolvedRadius)
                    .stroke(resolvedBorderColor, lineWidth: resolvedBorderWidth)
            )
    }

    private var resolvedBorderColor: Color {
        switch style {
        case .none:
            return Color.clear
        case .default:
            return theme.colors.border.default
        case .subtle:
            return theme.colors.border.subtle
        case .strong:
            return theme.colors.border.strong
        case .focus:
            return theme.colors.border.focus
        case .error:
            return theme.colors.border.error
        case .custom(let color, _):
            return theme.colors.enhancedContrast(color)
        }
    }

    private var resolvedBorderWidth: CGFloat {
        switch style {
        case .none:
            return 0
        case .default, .subtle, .strong:
            return theme.borders.defaultWidth
        case .focus:
            return theme.borders.focusWidth
        case .error:
            return theme.borders.thickWidth
        case .custom(_, let width):
            return width
        }
    }

    private var resolvedRadius: CGFloat {
        switch radius {
        case .none:
            return 0
        case .small:
            return theme.borders.smallRadius
        case .default:
            return theme.borders.defaultRadius
        case .large:
            return theme.borders.largeRadius
        case .round:
            return theme.borders.roundRadius
        case .custom(let value):
            return value
        }
    }
}

// MARK: - Shadow Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPShadowModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let style: ShadowStyle

    public enum ShadowStyle {
        case none
        case subtle
        case small
        case medium
        case large
        case xl
        case custom(Color, CGFloat, CGFloat, CGFloat)
    }

    init(style: ShadowStyle = .small) {
        self.style = style
    }

    public func body(content: Content) -> some View {
        content
            .shadow(
                color: resolvedShadowColor,
                radius: resolvedRadius,
                x: resolvedX,
                y: resolvedY
            )
    }

    private var resolvedShadowColor: Color {
        switch style {
        case .none:
            return Color.clear
        case .subtle:
            return theme.shadows.subtle
        case .small:
            return theme.shadows.small
        case .medium:
            return theme.shadows.medium
        case .large:
            return theme.shadows.large
        case .xl:
            return theme.shadows.xl
        case .custom(let color, _, _, _):
            return color
        }
    }

    private var resolvedRadius: CGFloat {
        switch style {
        case .none, .subtle:
            return 0
        case .small:
            return 2
        case .medium:
            return 4
        case .large:
            return 8
        case .xl:
            return 16
        case .custom(_, let radius, _, _):
            return radius
        }
    }

    private var resolvedX: CGFloat {
        switch style {
        case .custom(_, _, let x, _):
            return x
        default:
            return 0
        }
    }

    private var resolvedY: CGFloat {
        switch style {
        case .none, .subtle:
            return 0
        case .small:
            return 1
        case .medium:
            return 2
        case .large:
            return 4
        case .xl:
            return 8
        case .custom(_, _, _, let y):
            return y
        }
    }
}

// MARK: - Spacing Theme Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPSpacingModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let edges: Edge.Set
    let spacing: SpacingValue

    public enum SpacingValue {
        case xs, sm, md, lg, xl, xxl, xxxl, xxxxl, xxxxxl, xxxxxxl
        case semantic(BPSpacing.Semantic)
        case component(BPSpacing.Component)
        case layout(BPSpacing.Layout)
        case custom(CGFloat)
    }

    init(
        _ spacing: SpacingValue,
        edges: Edge.Set = .all
    ) {
        self.spacing = spacing
        self.edges = edges
    }

    public func body(content: Content) -> some View {
        content
            .padding(edges, resolvedSpacing)
    }

    private var resolvedSpacing: CGFloat {
        switch spacing {
        case .xs:
            return theme.spacing.xs
        case .sm:
            return theme.spacing.sm
        case .md:
            return theme.spacing.md
        case .lg:
            return theme.spacing.lg
        case .xl:
            return theme.spacing.xl
        case .xxl:
            return theme.spacing.xxl
        case .xxxl:
            return theme.spacing.xxxl
        case .xxxxl:
            return theme.spacing.xxxxl
        case .xxxxxl:
            return theme.spacing.xxxxxl
        case .xxxxxxl:
            return theme.spacing.xxxxxxl
        case .semantic:
            return theme.spacing.scaled(BPSpacing.Semantic.related)
        case .component:
            return theme.spacing.scaled(BPSpacing.Component.cardPadding)
        case .layout:
            return theme.spacing.scaled(BPSpacing.Layout.container)
        case .custom(let value):
            return theme.spacing.scaled(value)
        }
    }
}

// MARK: - View Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Apply the BeProductive theme to this view
    public func beProductiveTheme(
        _ theme: BPTheme? = nil,
        respectSystemAppearance: Bool = true
    ) -> some View {
        self.modifier(BPThemeModifier(
            theme: theme,
            respectSystemAppearance: respectSystemAppearance
        ))
    }

    /// Apply BeProductive background styling
    public func bpBackground(
        _ style: BPBackgroundModifier.BackgroundStyle = .primary,
        ignoresSafeArea: Bool = false
    ) -> some View {
        self.modifier(BPBackgroundModifier(
            style: style,
            ignoresSafeArea: ignoresSafeArea
        ))
    }

    /// Apply BeProductive text styling
    public func bpText(
        style: BPTextThemeModifier.TextStyle,
        color: BPTextThemeModifier.TextColor? = nil
    ) -> some View {
        self.modifier(BPTextThemeModifier(
            style: style,
            color: color
        ))
    }

    /// Apply BeProductive border styling
    public func bpBorder(
        style: BPBorderModifier.BorderStyle = .default,
        radius: BPBorderModifier.BorderRadius = .default
    ) -> some View {
        self.modifier(BPBorderModifier(
            style: style,
            radius: radius
        ))
    }

    /// Apply BeProductive shadow styling
    public func bpShadow(
        _ style: BPShadowModifier.ShadowStyle = .small
    ) -> some View {
        self.modifier(BPShadowModifier(style: style))
    }

    /// Apply BeProductive spacing
    public func bpPadding(
        _ spacing: BPSpacingModifier.SpacingValue,
        edges: Edge.Set = .all
    ) -> some View {
        self.modifier(BPSpacingModifier(spacing, edges: edges))
    }
}

// MARK: - Utility Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Conditionally apply a transform
    @ViewBuilder
    func apply<T: View>(
        if condition: Bool,
        @ViewBuilder transform: (Self) -> T
    ) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    /// Apply a transform if the optional value is not nil
    @ViewBuilder
    func apply<T: View, V>(
        ifLet optionalValue: V?,
        @ViewBuilder transform: (Self, V) -> T
    ) -> some View {
        if let value = optionalValue {
            transform(self, value)
        } else {
            self
        }
    }
}