import SwiftUI

/// BeProductive Layout and Animation Modifiers
///
/// A collection of layout helpers and animation modifiers that provide consistent
/// spacing, positioning, and motion patterns throughout the BeProductive application.

// MARK: - Responsive Layout Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPResponsiveModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    let compactLayout: () -> AnyView
    let regularLayout: () -> AnyView

    public init<Compact: View, Regular: View>(
        @ViewBuilder compact: @escaping () -> Compact,
        @ViewBuilder regular: @escaping () -> Regular
    ) {
        self.compactLayout = { AnyView(compact()) }
        self.regularLayout = { AnyView(regular()) }
    }

    public func body(content: Content) -> some View {
        Group {
            if horizontalSizeClass == .compact {
                compactLayout()
            } else {
                regularLayout()
            }
        }
    }
}

// MARK: - Conditional Layout Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPConditionalModifier<TrueContent: View, FalseContent: View>: ViewModifier {

    let condition: Bool
    let trueContent: (Content) -> TrueContent
    let falseContent: (Content) -> FalseContent

    public init(
        _ condition: Bool,
        @ViewBuilder ifTrue: @escaping (Content) -> TrueContent,
        @ViewBuilder ifFalse: @escaping (Content) -> FalseContent
    ) {
        self.condition = condition
        self.trueContent = ifTrue
        self.falseContent = ifFalse
    }

    public func body(content: Content) -> some View {
        Group {
            if condition {
                trueContent(content)
            } else {
                falseContent(content)
            }
        }
    }
}

// MARK: - Grid Layout Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPGridLayoutModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let columns: [GridItem]
    let spacing: CGFloat?
    let alignment: HorizontalAlignment

    public init(
        columns: Int = 2,
        spacing: BPSpacing.SpacingType = .normal,
        alignment: HorizontalAlignment = .center,
        minItemWidth: CGFloat? = nil
    ) {
        let spacingValue = Self.spacingValue(for: spacing)
        self.spacing = spacingValue

        if let minWidth = minItemWidth {
            self.columns = [GridItem(.adaptive(minimum: minWidth, maximum: .infinity), spacing: spacingValue)]
        } else {
            self.columns = Array(repeating: GridItem(.flexible(), spacing: spacingValue), count: columns)
        }

        self.alignment = alignment
    }

    public func body(content: Content) -> some View {
        LazyVGrid(columns: columns, alignment: alignment, spacing: spacing) {
            content
        }
    }

    private static func spacingValue(for spacing: BPSpacing.SpacingType) -> CGFloat {
        // Since we can't access theme here, use base values
        switch spacing {
        case .tight: return BPSpacing.xs
        case .normal: return BPSpacing.sm
        case .loose: return BPSpacing.md
        case .custom(let value): return value
        }
    }
}

// MARK: - Animation Preset Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPAnimationModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let preset: AnimationPreset
    let trigger: AnyHashable?

    public enum AnimationPreset {
        case fadeIn
        case slideIn(from: Edge)
        case scaleIn
        case bounce
        case spring
        case gentle
        case quick
        case custom(Animation)

        func animation(theme: BPTheme) -> Animation {
            switch self {
            case .fadeIn:
                return theme.animations.smooth
            case .slideIn:
                return theme.animations.eased
            case .scaleIn:
                return theme.animations.bouncy
            case .bounce:
                return theme.animations.bouncy
            case .spring:
                return theme.animations.spring
            case .gentle:
                return Animation.easeInOut(duration: theme.animations.slow)
            case .quick:
                return Animation.easeInOut(duration: theme.animations.fast)
            case .custom(let animation):
                return animation
            }
        }
    }

    public init(
        _ preset: AnimationPreset,
        trigger: AnyHashable? = nil
    ) {
        self.preset = preset
        self.trigger = trigger
    }

    public func body(content: Content) -> some View {
        content
            .animation(preset.animation(theme: theme), value: trigger)
    }
}

// MARK: - Transition Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTransitionModifier: ViewModifier {

    let transition: TransitionPreset

    public enum TransitionPreset {
        case fade
        case slide(from: Edge)
        case scale
        case moveAndFade(from: Edge)
        case push(from: Edge)
        case opacity
        case custom(AnyTransition)

        var transition: AnyTransition {
            switch self {
            case .fade:
                return .opacity
            case .slide(let edge):
                return .move(edge: edge)
            case .scale:
                return .scale
            case .moveAndFade(let edge):
                return .move(edge: edge).combined(with: .opacity)
            case .push(let edge):
                return .push(from: edge)
            case .opacity:
                return .opacity
            case .custom(let transition):
                return transition
            }
        }
    }

    public init(_ transition: TransitionPreset) {
        self.transition = transition
    }

    public func body(content: Content) -> some View {
        content
            .transition(transition.transition)
    }
}

// MARK: - Safe Area Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPSafeAreaModifier: ViewModifier {

    @Environment(\.bpTheme) private var theme

    let edges: Edge.Set
    let padding: SafeAreaPadding

    public enum SafeAreaPadding {
        case none
        case minimum
        case standard
        case comfortable
        case custom(CGFloat)
    }

    public init(
        edges: Edge.Set = .all,
        padding: SafeAreaPadding = .standard
    ) {
        self.edges = edges
        self.padding = padding
    }

    public func body(content: Content) -> some View {
        content
            .safeAreaInset(edge: .top, spacing: topSpacing) {
                if edges.contains(.top) {
                    Color.clear.frame(height: paddingValue)
                }
            }
            .safeAreaInset(edge: .bottom, spacing: bottomSpacing) {
                if edges.contains(.bottom) {
                    Color.clear.frame(height: paddingValue)
                }
            }
            .safeAreaInset(edge: .leading, spacing: leadingSpacing) {
                if edges.contains(.leading) {
                    Color.clear.frame(width: paddingValue)
                }
            }
            .safeAreaInset(edge: .trailing, spacing: trailingSpacing) {
                if edges.contains(.trailing) {
                    Color.clear.frame(width: paddingValue)
                }
            }
    }

    private var paddingValue: CGFloat {
        switch padding {
        case .none:
            return 0
        case .minimum:
            return theme.spacing.xs
        case .standard:
            return theme.spacing.md
        case .comfortable:
            return theme.spacing.lg
        case .custom(let value):
            return theme.spacing.scaled(value)
        }
    }

    private var topSpacing: CGFloat {
        edges.contains(.top) ? 0 : paddingValue
    }

    private var bottomSpacing: CGFloat {
        edges.contains(.bottom) ? 0 : paddingValue
    }

    private var leadingSpacing: CGFloat {
        edges.contains(.leading) ? 0 : paddingValue
    }

    private var trailingSpacing: CGFloat {
        edges.contains(.trailing) ? 0 : paddingValue
    }
}

// MARK: - Visibility Modifier

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPVisibilityModifier: ViewModifier {

    let isVisible: Bool
    let transition: BPTransitionModifier.TransitionPreset
    let animation: BPAnimationModifier.AnimationPreset

    public init(
        _ isVisible: Bool,
        transition: BPTransitionModifier.TransitionPreset = .fade,
        animation: BPAnimationModifier.AnimationPreset = .gentle
    ) {
        self.isVisible = isVisible
        self.transition = transition
        self.animation = animation
    }

    public func body(content: Content) -> some View {
        Group {
            if isVisible {
                content
                    .bpTransition(transition)
                    .bpAnimation(animation, trigger: isVisible)
            }
        }
    }
}

// MARK: - Spacing Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPSpacing {

    public enum SpacingType {
        case tight
        case normal
        case loose
        case custom(CGFloat)
    }
}

// MARK: - View Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Create responsive layouts for different size classes
    public func bpResponsive<Compact: View, Regular: View>(
        @ViewBuilder compact: @escaping () -> Compact,
        @ViewBuilder regular: @escaping () -> Regular
    ) -> some View {
        self.modifier(BPResponsiveModifier(compact: compact, regular: regular))
    }

    /// Apply conditional view transformations
    public func bpIf<TrueContent: View, FalseContent: View>(
        _ condition: Bool,
        @ViewBuilder ifTrue: @escaping (Self) -> TrueContent,
        @ViewBuilder ifFalse: @escaping (Self) -> FalseContent
    ) -> some View {
        self.modifier(BPConditionalModifier(condition,
            ifTrue: { _ in ifTrue(self) },
            ifFalse: { _ in ifFalse(self) }))
    }

    /// Apply animation presets
    public func bpAnimation(
        _ preset: BPAnimationModifier.AnimationPreset,
        trigger: AnyHashable? = nil
    ) -> some View {
        self.modifier(BPAnimationModifier(preset, trigger: trigger))
    }

    /// Apply transition presets
    public func bpTransition(
        _ transition: BPTransitionModifier.TransitionPreset
    ) -> some View {
        self.modifier(BPTransitionModifier(transition))
    }

    /// Add safe area padding
    public func bpSafeArea(
        edges: Edge.Set = .all,
        padding: BPSafeAreaModifier.SafeAreaPadding = .standard
    ) -> some View {
        self.modifier(BPSafeAreaModifier(edges: edges, padding: padding))
    }

    /// Control visibility with animations
    public func bpVisible(
        _ isVisible: Bool,
        transition: BPTransitionModifier.TransitionPreset = .fade,
        animation: BPAnimationModifier.AnimationPreset = .gentle
    ) -> some View {
        self.modifier(BPVisibilityModifier(isVisible, transition: transition, animation: animation))
    }

    /// Apply grid layout
    public func bpGrid(
        columns: Int = 2,
        spacing: BPSpacing.SpacingType = .normal,
        alignment: HorizontalAlignment = .center,
        minItemWidth: CGFloat? = nil
    ) -> some View {
        self.modifier(BPGridLayoutModifier(
            columns: columns,
            spacing: spacing,
            alignment: alignment,
            minItemWidth: minItemWidth
        ))
    }
}

// MARK: - Layout Helper Views

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPSpacer: View {

    @Environment(\.bpTheme) private var theme

    let size: SpacerSize
    let axis: Axis

    public enum SpacerSize {
        case xs, sm, md, lg, xl, xxl
        case flexible
        case custom(CGFloat)

        func value(theme: BPTheme) -> CGFloat? {
            switch self {
            case .xs: return theme.spacing.xs
            case .sm: return theme.spacing.sm
            case .md: return theme.spacing.md
            case .lg: return theme.spacing.lg
            case .xl: return theme.spacing.xl
            case .xxl: return theme.spacing.xxl
            case .flexible: return nil
            case .custom(let value): return theme.spacing.scaled(value)
            }
        }
    }

    public enum Axis {
        case horizontal
        case vertical
    }

    public init(
        _ size: SpacerSize = .flexible,
        axis: Axis = .vertical
    ) {
        self.size = size
        self.axis = axis
    }

    public var body: some View {
        if let value = size.value(theme: theme) {
            switch axis {
            case .horizontal:
                Rectangle()
                    .fill(Color.clear)
                    .frame(width: value, height: 1)
            case .vertical:
                Rectangle()
                    .fill(Color.clear)
                    .frame(width: 1, height: value)
            }
        } else {
            Spacer()
        }
    }
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPDivider: View {

    @Environment(\.bpTheme) private var theme

    let style: DividerStyle
    let axis: Axis

    public enum DividerStyle {
        case thin
        case thick
        case subtle
        case prominent
    }

    public enum Axis {
        case horizontal
        case vertical
    }

    public init(
        style: DividerStyle = .thin,
        axis: Axis = .horizontal
    ) {
        self.style = style
        self.axis = axis
    }

    public var body: some View {
        Rectangle()
            .fill(dividerColor)
            .frame(
                width: axis == .horizontal ? nil : dividerThickness,
                height: axis == .vertical ? nil : dividerThickness
            )
    }

    private var dividerColor: Color {
        switch style {
        case .thin, .thick:
            return theme.colors.border.default
        case .subtle:
            return theme.colors.border.subtle
        case .prominent:
            return theme.colors.border.strong
        }
    }

    private var dividerThickness: CGFloat {
        switch style {
        case .thin, .subtle:
            return theme.borders.defaultWidth
        case .thick, .prominent:
            return theme.borders.thickWidth
        }
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPLayoutModifiers_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Animation examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Animations", style: .sectionTitle)

                    BPText("Fade in animation")
                        .bpCard()
                        .bpAnimation(.fadeIn, trigger: UUID())

                    BPText("Bounce animation")
                        .bpCard()
                        .bpAnimation(.bounce, trigger: UUID())

                    BPText("Spring animation")
                        .bpCard()
                        .bpAnimation(.spring, trigger: UUID())
                }

                BPDivider()

                // Layout helpers
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Layout Helpers", style: .sectionTitle)

                    HStack {
                        BPText("Left")
                        BPSpacer(.md, axis: .horizontal)
                        BPText("Right")
                    }
                    .bpCard()

                    VStack {
                        BPText("Top")
                        BPSpacer(.lg)
                        BPText("Bottom")
                    }
                    .bpCard()
                }

                BPDivider()

                // Responsive layout example
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Responsive Layout", style: .sectionTitle)

                    BPText("This content adapts to screen size")
                        .bpCard()
                        .bpResponsive(
                            compact: {
                                BPText("Compact Layout")
                                    .font(.caption)
                                    .bpCard(style: .filled)
                            },
                            regular: {
                                BPText("Regular Layout")
                                    .font(.title2)
                                    .bpCard(style: .elevated)
                            }
                        )
                }

                BPDivider()

                // Conditional layout
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Conditional Layout", style: .sectionTitle)

                    BPText("Dynamic content")
                        .bpIf(true,
                              ifTrue: { view in
                                  view.bpCard(style: .elevated)
                                      .foregroundColor(.green)
                              },
                              ifFalse: { view in
                                  view.bpCard(style: .outlined)
                                      .foregroundColor(.red)
                              }
                        )
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}