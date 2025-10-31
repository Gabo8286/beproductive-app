import SwiftUI

/// BeProductive iOS Navigation Bar Component
///
/// A modern iOS navigation bar component with support for large titles,
/// contextual actions, search integration, and productivity-focused features.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPNavigationBar: View {

    // MARK: - Properties

    private let title: String
    private let subtitle: String?
    private let style: NavigationStyle
    private let prominence: TitleProminence
    private let leadingItems: [NavigationItem]
    private let trailingItems: [NavigationItem]
    private let searchConfig: SearchConfiguration?
    private let onBack: (() -> Void)?

    @Environment(\.bpTheme) private var theme
    @Environment(\.dismiss) private var dismiss
    @State private var isSearchActive = false
    @State private var searchText = ""

    // MARK: - Navigation Item Model

    public struct NavigationItem {
        public let id: String
        public let icon: String?
        public let title: String?
        public let badge: Badge?
        public let style: ItemStyle
        public let isEnabled: Bool
        public let action: () -> Void

        public enum ItemStyle {
            case icon
            case text
            case iconWithText
            case profile
            case contextMenu([ContextAction])
        }

        public struct Badge {
            public let count: Int?
            public let text: String?
            public let style: BPBadgeModifier.BadgeStyle

            public init(count: Int? = nil, text: String? = nil, style: BPBadgeModifier.BadgeStyle = .error) {
                self.count = count
                self.text = text
                self.style = style
            }
        }

        public struct ContextAction {
            public let title: String
            public let icon: String?
            public let isDestructive: Bool
            public let action: () -> Void

            public init(title: String, icon: String? = nil, isDestructive: Bool = false, action: @escaping () -> Void) {
                self.title = title
                self.icon = icon
                self.isDestructive = isDestructive
                self.action = action
            }
        }

        public init(
            id: String = UUID().uuidString,
            icon: String? = nil,
            title: String? = nil,
            badge: Badge? = nil,
            style: ItemStyle = .icon,
            isEnabled: Bool = true,
            action: @escaping () -> Void
        ) {
            self.id = id
            self.icon = icon
            self.title = title
            self.badge = badge
            self.style = style
            self.isEnabled = isEnabled
            self.action = action
        }
    }

    // MARK: - Search Configuration

    public struct SearchConfiguration {
        public let placeholder: String
        public let showsCancelButton: Bool
        public let searchSuggestions: [String]
        public let onSearchTextChanged: (String) -> Void
        public let onSearchSubmitted: (String) -> Void
        public let onSearchCancelled: () -> Void

        public init(
            placeholder: String = "Search",
            showsCancelButton: Bool = true,
            searchSuggestions: [String] = [],
            onSearchTextChanged: @escaping (String) -> Void = { _ in },
            onSearchSubmitted: @escaping (String) -> Void = { _ in },
            onSearchCancelled: @escaping () -> Void = { }
        ) {
            self.placeholder = placeholder
            self.showsCancelButton = showsCancelButton
            self.searchSuggestions = searchSuggestions
            self.onSearchTextChanged = onSearchTextChanged
            self.onSearchSubmitted = onSearchSubmitted
            self.onSearchCancelled = onSearchCancelled
        }
    }

    // MARK: - Enums

    public enum NavigationStyle {
        case standard
        case large
        case compact
        case transparent
        case floating
    }

    public enum TitleProminence {
        case standard
        case large
        case inline
    }

    // MARK: - Initializer

    public init(
        title: String,
        subtitle: String? = nil,
        style: NavigationStyle = .standard,
        prominence: TitleProminence = .standard,
        leadingItems: [NavigationItem] = [],
        trailingItems: [NavigationItem] = [],
        searchConfig: SearchConfiguration? = nil,
        onBack: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.style = style
        self.prominence = prominence
        self.leadingItems = leadingItems
        self.trailingItems = trailingItems
        self.searchConfig = searchConfig
        self.onBack = onBack
    }

    // MARK: - Body

    public var body: some View {
        VStack(spacing: 0) {
            navigationContent

            if let searchConfig = searchConfig, isSearchActive {
                searchBar(config: searchConfig)
            }
        }
        .background(navigationBackground)
        .overlay(navigationBorder, alignment: .bottom)
    }

    // MARK: - Navigation Content

    @ViewBuilder
    private var navigationContent: some View {
        switch style {
        case .large:
            largeNavigationView
        case .compact:
            compactNavigationView
        case .transparent:
            transparentNavigationView
        case .floating:
            floatingNavigationView
        default:
            standardNavigationView
        }
    }

    private var standardNavigationView: some View {
        HStack(spacing: theme.spacing.md) {
            // Leading items
            leadingSection

            // Title section
            titleSection

            // Trailing items
            trailingSection
        }
        .padding(.horizontal, theme.spacing.md)
        .padding(.vertical, theme.spacing.sm)
        .frame(minHeight: 44)
    }

    private var largeNavigationView: some View {
        VStack(alignment: .leading, spacing: theme.spacing.md) {
            // Standard navigation row
            HStack {
                leadingSection
                Spacer()
                trailingSection
            }
            .padding(.horizontal, theme.spacing.md)

            // Large title
            if prominence == .large {
                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    BPText(title, style: .displaySmall)
                        .multilineTextAlignment(.leading)

                    if let subtitle = subtitle {
                        BPText(subtitle, style: .bodyMedium, color: .secondary)
                            .multilineTextAlignment(.leading)
                    }
                }
                .padding(.horizontal, theme.spacing.md)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.bottom, theme.spacing.sm)
    }

    private var compactNavigationView: some View {
        HStack(spacing: theme.spacing.sm) {
            leadingSection

            BPText(title, style: .labelLarge)
                .lineLimit(1)
                .frame(maxWidth: .infinity)

            trailingSection
        }
        .padding(.horizontal, theme.spacing.sm)
        .padding(.vertical, theme.spacing.xs)
        .frame(height: 36)
    }

    private var transparentNavigationView: some View {
        HStack(spacing: theme.spacing.md) {
            leadingSection
            titleSection
            trailingSection
        }
        .padding(.horizontal, theme.spacing.md)
        .padding(.vertical, theme.spacing.sm)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: theme.borders.defaultRadius))
        .padding(.horizontal, theme.spacing.md)
        .padding(.top, theme.spacing.sm)
    }

    private var floatingNavigationView: some View {
        HStack(spacing: theme.spacing.md) {
            leadingSection
            titleSection
            trailingSection
        }
        .padding(.horizontal, theme.spacing.lg)
        .padding(.vertical, theme.spacing.md)
        .background(.regularMaterial)
        .clipShape(Capsule())
        .shadow(color: theme.shadows.medium, radius: 8, y: 4)
        .padding(.horizontal, theme.spacing.xl)
        .padding(.top, theme.spacing.md)
    }

    // MARK: - Navigation Sections

    private var leadingSection: some View {
        HStack(spacing: theme.spacing.sm) {
            // Back button
            if let onBack = onBack {
                backButton(action: onBack)
            }

            // Leading items
            ForEach(leadingItems, id: \.id) { item in
                navigationItemView(item)
            }
        }
    }

    private var titleSection: some View {
        VStack(spacing: 2) {
            if prominence != .large {
                BPText(
                    title,
                    style: prominence == .inline ? .labelLarge : .heading6
                )
                .lineLimit(1)
                .frame(maxWidth: .infinity)

                if let subtitle = subtitle {
                    BPText(subtitle, style: .captionMedium, color: .secondary)
                        .lineLimit(1)
                }
            } else {
                Spacer()
            }
        }
    }

    private var trailingSection: some View {
        HStack(spacing: theme.spacing.sm) {
            // Search button
            if searchConfig != nil {
                searchButton
            }

            // Trailing items
            ForEach(trailingItems, id: \.id) { item in
                navigationItemView(item)
            }
        }
    }

    // MARK: - Navigation Item Views

    private func navigationItemView(_ item: NavigationItem) -> some View {
        Button(action: item.action) {
            itemContent(item)
        }
        .disabled(!item.isEnabled)
        .opacity(item.isEnabled ? 1.0 : 0.5)
        .accessibilityLabel(item.title ?? "Navigation item")
    }

    @ViewBuilder
    private func itemContent(_ item: NavigationItem) -> some View {
        switch item.style {
        case .icon:
            iconItemView(item)
        case .text:
            textItemView(item)
        case .iconWithText:
            iconWithTextView(item)
        case .profile:
            profileItemView(item)
        case .contextMenu(let actions):
            contextMenuView(item, actions: actions)
        }
    }

    private func iconItemView(_ item: NavigationItem) -> some View {
        ZStack {
            if let icon = item.icon {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(theme.colors.text.primary)

                if let badge = item.badge {
                    badgeView(badge)
                }
            }
        }
        .frame(width: 44, height: 44)
        .contentShape(Circle())
    }

    @ViewBuilder
    private func textItemView(_ item: NavigationItem) -> some View {
        if let title = item.title {
            BPText(title, style: .labelMedium, color: .primary)
                .padding(.horizontal, theme.spacing.sm)
                .padding(.vertical, theme.spacing.xs)
        }
    }

    private func iconWithTextView(_ item: NavigationItem) -> some View {
        HStack(spacing: theme.spacing.xs) {
            if let icon = item.icon {
                Image(systemName: icon)
                    .font(.caption)
            }
            if let title = item.title {
                BPText(title, style: .labelSmall)
            }
        }
        .padding(.horizontal, theme.spacing.sm)
        .padding(.vertical, theme.spacing.xs)
        .background(theme.colors.background.secondary)
        .clipShape(Capsule())
    }

    private func profileItemView(_ item: NavigationItem) -> some View {
        ZStack {
            Circle()
                .fill(theme.colors.primary.main)
                .frame(width: 32, height: 32)

            if let title = item.title {
                BPText(String(title.prefix(1)), style: .labelMedium)
                    .foregroundColor(.white)
            } else if let icon = item.icon {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
            }

            if let badge = item.badge {
                badgeView(badge)
            }
        }
    }

    private func contextMenuView(_ item: NavigationItem, actions: [NavigationItem.ContextAction]) -> some View {
        Menu {
            ForEach(Array(actions.enumerated()), id: \.offset) { index, action in
                Button(action: action.action) {
                    Label(action.title, systemImage: action.icon ?? "")
                }
                .foregroundColor(action.isDestructive ? .red : .primary)
            }
        } label: {
            iconItemView(item)
        }
    }

    private func badgeView(_ badge: NavigationItem.Badge) -> some View {
        Group {
            if let text = badge.text {
                BPText(text, style: .captionSmall)
                    .bpBadge(style: badge.style, size: .small)
            } else if let count = badge.count, count > 0 {
                BPText(count > 99 ? "99+" : "\(count)", style: .captionSmall)
                    .bpBadge(style: badge.style, size: .small)
            }
        }
        .offset(x: 12, y: -12)
    }

    // MARK: - Special Buttons

    private func backButton(action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))

                BPText("Back", style: .labelMedium)
            }
            .foregroundColor(theme.colors.primary.main)
        }
        .accessibilityLabel("Back")
    }

    private var searchButton: some View {
        Button(action: {
            withAnimation(theme.animations.eased) {
                isSearchActive.toggle()
            }
        }) {
            Image(systemName: isSearchActive ? "xmark" : "magnifyingglass")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(theme.colors.text.primary)
                .frame(width: 44, height: 44)
                .contentShape(Circle())
        }
        .accessibilityLabel(isSearchActive ? "Cancel search" : "Search")
    }

    // MARK: - Search Bar

    private func searchBar(config: SearchConfiguration) -> some View {
        HStack(spacing: theme.spacing.sm) {
            BPTextField.search(
                placeholder: config.placeholder,
                text: $searchText
            )
            .onChange(of: searchText) { newValue in
                config.onSearchTextChanged(newValue)
            }
            .onSubmit {
                config.onSearchSubmitted(searchText)
            }

            if config.showsCancelButton {
                Button("Cancel") {
                    withAnimation(theme.animations.eased) {
                        isSearchActive = false
                        searchText = ""
                        config.onSearchCancelled()
                    }
                }
                .foregroundColor(theme.colors.primary.main)
            }
        }
        .padding(.horizontal, theme.spacing.md)
        .padding(.bottom, theme.spacing.sm)
        .transition(.move(edge: .top).combined(with: .opacity))
    }

    // MARK: - Background and Border

    private var navigationBackground: some View {
        Group {
            switch style {
            case .transparent:
                Color.clear
            case .floating:
                Color.clear
            default:
                theme.colors.background.card
            }
        }
    }

    @ViewBuilder
    private var navigationBorder: some View {
        if style == .standard || style == .large || style == .compact {
            Rectangle()
                .fill(theme.colors.border.subtle)
                .frame(height: 0.5)
        }
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPNavigationBar {

    /// Create a standard navigation bar with back button
    public static func standard(
        title: String,
        subtitle: String? = nil,
        onBack: @escaping () -> Void
    ) -> BPNavigationBar {
        return BPNavigationBar(
            title: title,
            subtitle: subtitle,
            style: .standard,
            onBack: onBack
        )
    }

    /// Create a large title navigation bar
    public static func largeTitle(
        title: String,
        subtitle: String? = nil,
        trailingItems: [NavigationItem] = []
    ) -> BPNavigationBar {
        return BPNavigationBar(
            title: title,
            subtitle: subtitle,
            style: .large,
            prominence: .large,
            trailingItems: trailingItems
        )
    }

    /// Create a searchable navigation bar
    public static func searchable(
        title: String,
        searchPlaceholder: String = "Search",
        onSearchTextChanged: @escaping (String) -> Void = { _ in },
        onBack: (() -> Void)? = nil
    ) -> BPNavigationBar {
        let searchConfig = SearchConfiguration(
            placeholder: searchPlaceholder,
            onSearchTextChanged: onSearchTextChanged
        )

        return BPNavigationBar(
            title: title,
            style: .standard,
            searchConfig: searchConfig,
            onBack: onBack
        )
    }

    /// Create a productivity app navigation bar
    public static func productivity(
        title: String,
        subtitle: String? = nil,
        hasNotifications: Bool = false,
        notificationCount: Int = 0,
        onNotifications: @escaping () -> Void = { },
        onProfile: @escaping () -> Void = { }
    ) -> BPNavigationBar {
        var trailingItems: [NavigationItem] = []

        // Notifications
        if hasNotifications {
            let badge = notificationCount > 0 ? NavigationItem.Badge(count: notificationCount) : nil
            trailingItems.append(
                NavigationItem(
                    icon: "bell",
                    badge: badge,
                    action: onNotifications
                )
            )
        }

        // Profile
        trailingItems.append(
            NavigationItem(
                icon: "person.circle",
                style: .profile,
                action: onProfile
            )
        )

        return BPNavigationBar(
            title: title,
            subtitle: subtitle,
            style: .large,
            prominence: .large,
            trailingItems: trailingItems
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPNavigationBar_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 0) {
            // Standard navigation
            BPNavigationBar.standard(
                title: "Tasks",
                subtitle: "Today's Focus",
                onBack: { }
            )

            Divider()

            // Large title with actions
            BPNavigationBar.productivity(
                title: "Dashboard",
                subtitle: "Welcome back, John",
                hasNotifications: true,
                notificationCount: 3
            )

            Divider()

            // Searchable navigation
            BPNavigationBar.searchable(
                title: "Projects",
                searchPlaceholder: "Search projects..."
            )

            Spacer()
        }
        .beProductiveTheme()
    }
}