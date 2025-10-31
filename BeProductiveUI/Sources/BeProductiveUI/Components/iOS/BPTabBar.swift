import SwiftUI

/// BeProductive iOS Tab Bar Component
///
/// A modern iOS tab bar component designed for productivity applications,
/// featuring dynamic islands, animated indicators, and contextual actions.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTabBar: View {

    // MARK: - Properties

    @Binding private var selectedIndex: Int
    private let items: [TabItem]
    private let style: TabBarStyle
    private let position: TabBarPosition
    private let showBadges: Bool
    private let hapticFeedback: Bool
    private let onTabSelection: ((Int, TabItem) -> Void)?

    @Environment(\.bpTheme) private var theme
    @Environment(\.safeAreaInsets) private var safeAreaInsets
    @State private var indicatorOffset: CGFloat = 0
    @State private var indicatorWidth: CGFloat = 0

    // MARK: - Tab Item Model

    public struct TabItem {
        public let id: String
        public let title: String
        public let icon: String
        public let selectedIcon: String?
        public let badgeCount: Int?
        public let badgeText: String?
        public let isEnabled: Bool
        public let color: Color?
        public let accessibilityHint: String?

        public init(
            id: String = UUID().uuidString,
            title: String,
            icon: String,
            selectedIcon: String? = nil,
            badgeCount: Int? = nil,
            badgeText: String? = nil,
            isEnabled: Bool = true,
            color: Color? = nil,
            accessibilityHint: String? = nil
        ) {
            self.id = id
            self.title = title
            self.icon = icon
            self.selectedIcon = selectedIcon
            self.badgeCount = badgeCount
            self.badgeText = badgeText
            self.isEnabled = isEnabled
            self.color = color
            self.accessibilityHint = accessibilityHint
        }
    }

    // MARK: - Enums

    public enum TabBarStyle {
        case standard
        case floating
        case minimal
        case pill
        case dynamic_island
    }

    public enum TabBarPosition {
        case bottom
        case top
        case floating(CGFloat) // offset from bottom
    }

    // MARK: - Initializer

    public init(
        selectedIndex: Binding<Int>,
        items: [TabItem],
        style: TabBarStyle = .standard,
        position: TabBarPosition = .bottom,
        showBadges: Bool = true,
        hapticFeedback: Bool = true,
        onTabSelection: ((Int, TabItem) -> Void)? = nil
    ) {
        self._selectedIndex = selectedIndex
        self.items = items
        self.style = style
        self.position = position
        self.showBadges = showBadges
        self.hapticFeedback = hapticFeedback
        self.onTabSelection = onTabSelection
    }

    // MARK: - Body

    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                if case .top = position {
                    tabBarContent(geometry: geometry)
                    Spacer()
                } else {
                    Spacer()
                    tabBarContent(geometry: geometry)
                }
            }
        }
        .onAppear {
            updateIndicator(geometry: nil)
        }
        .onChange(of: selectedIndex) { _ in
            updateIndicator(geometry: nil)
        }
    }

    // MARK: - Tab Bar Content

    private func tabBarContent(geometry: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            if style == .dynamic_island {
                dynamicIslandTabBar(geometry: geometry)
            } else {
                standardTabBar(geometry: geometry)
            }
        }
        .background(tabBarBackground)
        .overlay(tabBarBorder, alignment: .top)
        .clipShape(tabBarShape)
        .shadow(color: tabBarShadow, radius: shadowRadius, y: shadowY)
        .padding(.horizontal, horizontalPadding)
        .padding(.bottom, bottomPadding)
    }

    private func standardTabBar(geometry: GeometryProxy) -> some View {
        ZStack(alignment: .bottom) {
            // Selection indicator
            if style != .minimal {
                selectionIndicator(geometry: geometry)
            }

            // Tab items
            HStack(spacing: 0) {
                ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                    tabItemButton(item: item, index: index, geometry: geometry)
                }
            }
            .padding(.horizontal, theme.spacing.sm)
            .padding(.vertical, tabVerticalPadding)
        }
    }

    private func dynamicIslandTabBar(geometry: GeometryProxy) -> some View {
        HStack(spacing: theme.spacing.sm) {
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                dynamicIslandItem(item: item, index: index, geometry: geometry)
            }
        }
        .padding(.horizontal, theme.spacing.lg)
        .padding(.vertical, theme.spacing.md)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .stroke(theme.colors.border.subtle, lineWidth: 0.5)
                )
        )
    }

    // MARK: - Tab Item Views

    private func tabItemButton(item: TabItem, index: Int, geometry: GeometryProxy) -> some View {
        Button(action: {
            selectTab(index: index, item: item)
        }) {
            tabItemContent(item: item, index: index)
        }
        .disabled(!item.isEnabled)
        .frame(maxWidth: .infinity)
        .contentShape(Rectangle())
        .accessibilityLabel(item.title)
        .accessibilityHint(item.accessibilityHint ?? "Tab \(index + 1) of \(items.count)")
        .accessibilityAddTraits(selectedIndex == index ? [.isSelected] : [])
    }

    private func tabItemContent(item: TabItem, index: Int) -> some View {
        VStack(spacing: theme.spacing.xs) {
            ZStack {
                // Icon
                Image(systemName: isSelected(index) ? (item.selectedIcon ?? item.icon) : item.icon)
                    .font(iconFont)
                    .foregroundColor(iconColor(item: item, index: index))
                    .scaleEffect(isSelected(index) ? 1.1 : 1.0)
                    .animation(theme.animations.bouncy, value: selectedIndex)

                // Badge
                if showBadges && (item.badgeCount != nil || item.badgeText != nil) {
                    badgeView(item: item)
                }
            }

            // Title
            if style != .minimal {
                BPText(
                    item.title,
                    style: .captionSmall,
                    color: isSelected(index) ? .primary : .tertiary
                )
                .lineLimit(1)
                .animation(Animation.easeInOut(duration: theme.animations.fast), value: selectedIndex)
            }
        }
        .opacity(item.isEnabled ? 1.0 : 0.5)
    }

    private func dynamicIslandItem(item: TabItem, index: Int, geometry: GeometryProxy) -> some View {
        Button(action: {
            selectTab(index: index, item: item)
        }) {
            HStack(spacing: theme.spacing.xs) {
                ZStack {
                    Image(systemName: isSelected(index) ? (item.selectedIcon ?? item.icon) : item.icon)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(iconColor(item: item, index: index))

                    if showBadges && (item.badgeCount != nil || item.badgeText != nil) {
                        badgeView(item: item)
                    }
                }

                if isSelected(index) {
                    BPText(item.title, style: .labelSmall)
                        .foregroundColor(theme.colors.text.primary)
                        .transition(.move(edge: .leading).combined(with: .opacity))
                }
            }
            .padding(.horizontal, theme.spacing.sm)
            .padding(.vertical, theme.spacing.xs)
            .background(
                Capsule()
                    .fill(isSelected(index) ? theme.colors.primary.main : Color.clear)
                    .animation(theme.animations.spring, value: selectedIndex)
            )
        }
        .disabled(!item.isEnabled)
        .accessibilityLabel(item.title)
    }

    // MARK: - Selection Indicator

    private func selectionIndicator(geometry: GeometryProxy) -> some View {
        Group {
            switch style {
            case .standard:
                standardIndicator(geometry: geometry)
            case .floating:
                floatingIndicator(geometry: geometry)
            case .pill:
                pillIndicator(geometry: geometry)
            default:
                EmptyView()
            }
        }
    }

    private func standardIndicator(geometry: GeometryProxy) -> some View {
        Rectangle()
            .fill(theme.colors.primary.main)
            .frame(width: indicatorWidth, height: 3)
            .offset(x: indicatorOffset)
            .animation(theme.animations.spring, value: selectedIndex)
    }

    private func floatingIndicator(geometry: GeometryProxy) -> some View {
        Circle()
            .fill(theme.colors.primary.main)
            .frame(width: 6, height: 6)
            .offset(x: indicatorOffset, y: -8)
            .animation(theme.animations.bouncy, value: selectedIndex)
    }

    private func pillIndicator(geometry: GeometryProxy) -> some View {
        Capsule()
            .fill(theme.colors.primary.main.opacity(0.1))
            .frame(width: indicatorWidth + 16, height: 36)
            .offset(x: indicatorOffset)
            .animation(theme.animations.spring, value: selectedIndex)
    }

    // MARK: - Badge View

    private func badgeView(item: TabItem) -> some View {
        Group {
            if let badgeText = item.badgeText {
                BPText(badgeText, style: .captionSmall)
                    .bpBadge(style: .error, size: .small)
            } else if let badgeCount = item.badgeCount, badgeCount > 0 {
                BPText(badgeCount > 99 ? "99+" : "\(badgeCount)", style: .captionSmall)
                    .bpBadge(style: .error, size: .small)
            }
        }
        .offset(x: 12, y: -8)
    }

    // MARK: - Computed Properties

    private var tabBarBackground: some View {
        Group {
            switch style {
            case .standard:
                theme.colors.background.card
            case .floating, .pill:
                Color.clear.background(.ultraThinMaterial)
            case .minimal:
                Color.clear
            case .dynamic_island:
                Color.clear
            }
        }
    }

    @ViewBuilder
    private var tabBarBorder: some View {
        if style == .standard {
            Rectangle()
                .fill(theme.colors.border.subtle)
                .frame(height: 0.5)
        }
    }

    private var tabBarShape: some Shape {
        switch style {
        case .standard, .minimal:
            return AnyShape(Rectangle())
        case .floating, .pill:
            return AnyShape(RoundedRectangle(cornerRadius: theme.borders.largeRadius))
        case .dynamic_island:
            return AnyShape(Capsule())
        }
    }

    private var tabBarShadow: Color {
        switch style {
        case .floating, .pill, .dynamic_island:
            return theme.shadows.medium
        default:
            return Color.clear
        }
    }

    private var shadowRadius: CGFloat {
        switch style {
        case .floating, .pill, .dynamic_island:
            return 8
        default:
            return 0
        }
    }

    private var shadowY: CGFloat {
        switch style {
        case .floating, .pill, .dynamic_island:
            return 4
        default:
            return 0
        }
    }

    private var horizontalPadding: CGFloat {
        switch style {
        case .floating, .pill:
            return theme.spacing.lg
        case .dynamic_island:
            return theme.spacing.xl
        default:
            return 0
        }
    }

    private var bottomPadding: CGFloat {
        switch position {
        case .bottom:
            return safeAreaInsets.bottom > 0 ? 0 : theme.spacing.sm
        case .top:
            return 0
        case .floating(let offset):
            return offset + (safeAreaInsets.bottom > 0 ? safeAreaInsets.bottom : theme.spacing.lg)
        }
    }

    private var tabVerticalPadding: CGFloat {
        switch style {
        case .minimal:
            return theme.spacing.xs
        case .standard:
            return theme.spacing.sm
        case .floating, .pill:
            return theme.spacing.md
        case .dynamic_island:
            return 0
        }
    }

    private var iconFont: Font {
        switch style {
        case .minimal:
            return .system(size: 20, weight: .medium)
        case .dynamic_island:
            return .system(size: 16, weight: .medium)
        default:
            return .system(size: 22, weight: .medium)
        }
    }

    private func iconColor(item: TabItem, index: Int) -> Color {
        if let customColor = item.color {
            return isSelected(index) ? customColor : theme.colors.text.tertiary
        }

        return isSelected(index) ? theme.colors.primary.main : theme.colors.text.tertiary
    }

    private func isSelected(_ index: Int) -> Bool {
        return selectedIndex == index
    }

    // MARK: - Actions

    private func selectTab(index: Int, item: TabItem) {
        guard item.isEnabled, index != selectedIndex else { return }

        if hapticFeedback {
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }

        withAnimation(theme.animations.spring) {
            selectedIndex = index
        }

        onTabSelection?(index, item)
    }

    private func updateIndicator(geometry: GeometryProxy?) {
        guard !items.isEmpty else { return }

        let tabWidth = (geometry?.size.width ?? UIScreen.main.bounds.width) / CGFloat(items.count)
        let selectedTabX = CGFloat(selectedIndex) * tabWidth + (tabWidth / 2)

        withAnimation(theme.animations.spring) {
            indicatorOffset = selectedTabX - (geometry?.size.width ?? UIScreen.main.bounds.width) / 2
            indicatorWidth = tabWidth * 0.6
        }
    }
}

// MARK: - Custom Shape

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct AnyShape: Shape {
    private let _path: @Sendable (CGRect) -> Path

    init<S: Shape>(_ shape: S) {
        _path = { rect in
            shape.path(in: rect)
        }
    }

    func path(in rect: CGRect) -> Path {
        _path(rect)
    }
}

// MARK: - Environment Values

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
private struct SafeAreaInsetsKey: EnvironmentKey {
    static let defaultValue = EdgeInsets()
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension EnvironmentValues {
    var safeAreaInsets: EdgeInsets {
        get { self[SafeAreaInsetsKey.self] }
        set { self[SafeAreaInsetsKey.self] = newValue }
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTabBar {

    /// Create a standard productivity app tab bar
    public static func productivity(
        selectedIndex: Binding<Int>,
        showBadges: Bool = true
    ) -> BPTabBar {
        let items = [
            TabItem(
                title: "Capture",
                icon: "plus.circle",
                selectedIcon: "plus.circle.fill"
            ),
            TabItem(
                title: "Plan",
                icon: "calendar",
                selectedIcon: "calendar.fill"
            ),
            TabItem(
                title: "Engage",
                icon: "target",
                selectedIcon: "target.fill"
            ),
            TabItem(
                title: "Profile",
                icon: "person.circle",
                selectedIcon: "person.circle.fill"
            )
        ]

        return BPTabBar(
            selectedIndex: selectedIndex,
            items: items,
            style: .standard,
            showBadges: showBadges
        )
    }

    /// Create a floating dynamic island style tab bar
    public static func dynamicIsland(
        selectedIndex: Binding<Int>,
        items: [TabItem]
    ) -> BPTabBar {
        return BPTabBar(
            selectedIndex: selectedIndex,
            items: items,
            style: .dynamic_island,
            position: .floating(30)
        )
    }

    /// Create a minimal top tab bar
    public static func topTabs(
        selectedIndex: Binding<Int>,
        items: [TabItem]
    ) -> BPTabBar {
        return BPTabBar(
            selectedIndex: selectedIndex,
            items: items,
            style: .minimal,
            position: .top,
            showBadges: false
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPTabBar_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 40) {
            // Standard tab bar
            BPTabBar.productivity(
                selectedIndex: .constant(0)
            )

            // Floating tab bar with badges
            BPTabBar(
                selectedIndex: .constant(1),
                items: [
                    BPTabBar.TabItem(title: "Home", icon: "house", badgeCount: 3),
                    BPTabBar.TabItem(title: "Tasks", icon: "checkmark.circle", badgeText: "!"),
                    BPTabBar.TabItem(title: "Goals", icon: "target"),
                    BPTabBar.TabItem(title: "Settings", icon: "gear")
                ],
                style: .floating
            )

            // Dynamic island style
            BPTabBar.dynamicIsland(
                selectedIndex: .constant(2),
                items: [
                    BPTabBar.TabItem(title: "Focus", icon: "brain.head.profile"),
                    BPTabBar.TabItem(title: "Habits", icon: "repeat.circle"),
                    BPTabBar.TabItem(title: "Analytics", icon: "chart.bar")
                ]
            )

            Spacer()
        }
        .beProductiveTheme()
    }
}