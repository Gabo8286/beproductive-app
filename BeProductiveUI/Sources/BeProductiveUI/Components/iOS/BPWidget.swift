import SwiftUI
import WidgetKit

/// BeProductive iOS Widget Component
///
/// A comprehensive widget system designed for iOS Home Screen widgets,
/// Lock Screen widgets, and Apple Watch complications with productivity focus.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPWidget: View {

    // MARK: - Properties

    private let content: WidgetContent
    private let size: WidgetSize
    private let style: WidgetStyle
    private let colorScheme: WidgetColorScheme
    private let refreshDate: Date?
    private let onTap: (() -> Void)?

    @Environment(\.bpTheme) private var theme
    @Environment(\.widgetFamily) private var widgetFamily

    // MARK: - Widget Content Model

    public struct WidgetContent {
        public let title: String?
        public let subtitle: String?
        public let primaryMetric: Metric?
        public let secondaryMetrics: [Metric]
        public let items: [WidgetItem]
        public let progress: Progress?
        public let status: Status?
        public let lastUpdated: Date?

        public init(
            title: String? = nil,
            subtitle: String? = nil,
            primaryMetric: Metric? = nil,
            secondaryMetrics: [Metric] = [],
            items: [WidgetItem] = [],
            progress: Progress? = nil,
            status: Status? = nil,
            lastUpdated: Date? = nil
        ) {
            self.title = title
            self.subtitle = subtitle
            self.primaryMetric = primaryMetric
            self.secondaryMetrics = secondaryMetrics
            self.items = items
            self.progress = progress
            self.status = status
            self.lastUpdated = lastUpdated
        }
    }

    // MARK: - Supporting Types

    public struct Metric {
        public let value: String
        public let label: String
        public let trend: Trend?
        public let color: Color?
        public let icon: String?

        public enum Trend {
            case up(Double)
            case down(Double)
            case stable

            var icon: String {
                switch self {
                case .up: return "arrow.up.right"
                case .down: return "arrow.down.right"
                case .stable: return "minus"
                }
            }

            var color: Color {
                switch self {
                case .up: return .green
                case .down: return .red
                case .stable: return .gray
                }
            }
        }

        public init(
            value: String,
            label: String,
            trend: Trend? = nil,
            color: Color? = nil,
            icon: String? = nil
        ) {
            self.value = value
            self.label = label
            self.trend = trend
            self.color = color
            self.icon = icon
        }
    }

    public struct WidgetItem {
        public let id: String
        public let title: String
        public let subtitle: String?
        public let icon: String?
        public let color: Color?
        public let isCompleted: Bool
        public let priority: Priority?
        public let dueDate: Date?

        public enum Priority {
            case low, medium, high, urgent

            var color: Color {
                switch self {
                case .low: return .blue
                case .medium: return .orange
                case .high: return .red
                case .urgent: return .purple
                }
            }
        }

        public init(
            id: String = UUID().uuidString,
            title: String,
            subtitle: String? = nil,
            icon: String? = nil,
            color: Color? = nil,
            isCompleted: Bool = false,
            priority: Priority? = nil,
            dueDate: Date? = nil
        ) {
            self.id = id
            self.title = title
            self.subtitle = subtitle
            self.icon = icon
            self.color = color
            self.isCompleted = isCompleted
            self.priority = priority
            self.dueDate = dueDate
        }
    }

    public struct Progress {
        public let current: Double
        public let target: Double
        public let label: String
        public let style: ProgressStyle

        public enum ProgressStyle {
            case linear
            case circular
            case ring
        }

        public init(
            current: Double,
            target: Double,
            label: String,
            style: ProgressStyle = .linear
        ) {
            self.current = current
            self.target = target
            self.label = label
            self.style = style
        }

        public var percentage: Double {
            guard target > 0 else { return 0 }
            return min(1.0, current / target)
        }
    }

    public struct Status {
        public let text: String
        public let type: StatusType
        public let showIndicator: Bool

        public enum StatusType {
            case info
            case success
            case warning
            case error
            case neutral

            var color: Color {
                switch self {
                case .info: return .blue
                case .success: return .green
                case .warning: return .orange
                case .error: return .red
                case .neutral: return .gray
                }
            }
        }

        public init(text: String, type: StatusType = .neutral, showIndicator: Bool = true) {
            self.text = text
            self.type = type
            self.showIndicator = showIndicator
        }
    }

    // MARK: - Widget Configuration

    public enum WidgetSize {
        case small
        case medium
        case large
        case extraLarge
        case lockScreen
        case accessory

        var isCompact: Bool {
            switch self {
            case .small, .lockScreen, .accessory:
                return true
            default:
                return false
            }
        }
    }

    public enum WidgetStyle {
        case standard
        case minimal
        case glassmorphic
        case productivity
        case dashboard
    }

    public enum WidgetColorScheme {
        case auto
        case light
        case dark
        case vibrant(Color)
    }

    // MARK: - Initializer

    public init(
        content: WidgetContent,
        size: WidgetSize,
        style: WidgetStyle = .standard,
        colorScheme: WidgetColorScheme = .auto,
        refreshDate: Date? = nil,
        onTap: (() -> Void)? = nil
    ) {
        self.content = content
        self.size = size
        self.style = style
        self.colorScheme = colorScheme
        self.refreshDate = refreshDate
        self.onTap = onTap
    }

    // MARK: - Body

    public var body: some View {
        widgetContainer {
            widgetContent
        }
        .widgetURL(URL(string: "beproductive://widget"))
    }

    // MARK: - Widget Container

    private func widgetContainer<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .background(widgetBackground)
            .overlay(widgetBorder)
            .clipShape(widgetShape)
            .shadow(color: widgetShadow, radius: shadowRadius, y: shadowY)
    }

    // MARK: - Widget Content

    @ViewBuilder
    private var widgetContent: some View {
        switch size {
        case .small, .lockScreen:
            smallWidgetContent
        case .medium:
            mediumWidgetContent
        case .large:
            largeWidgetContent
        case .extraLarge:
            extraLargeWidgetContent
        case .accessory:
            accessoryWidgetContent
        }
    }

    // MARK: - Size-Specific Layouts

    private var smallWidgetContent: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            // Header
            if let title = content.title {
                widgetHeader(title: title, compact: true)
            }

            Spacer()

            // Primary metric or progress
            if let primaryMetric = content.primaryMetric {
                primaryMetricView(primaryMetric, compact: true)
            } else if let progress = content.progress {
                progressView(progress, compact: true)
            } else if let firstItem = content.items.first {
                singleItemView(firstItem, compact: true)
            }

            Spacer()

            // Status or update time
            if let status = content.status {
                statusView(status, compact: true)
            } else if let lastUpdated = content.lastUpdated {
                updateTimeView(lastUpdated, compact: true)
            }
        }
        .padding(theme.spacing.sm)
    }

    private var mediumWidgetContent: some View {
        VStack(alignment: .leading, spacing: theme.spacing.sm) {
            // Header
            if let title = content.title {
                widgetHeader(title: title)
            }

            // Primary content
            if let primaryMetric = content.primaryMetric {
                HStack {
                    primaryMetricView(primaryMetric)
                    Spacer()
                    if let progress = content.progress {
                        progressView(progress)
                    }
                }
            } else if let progress = content.progress {
                progressView(progress)
            }

            // Secondary metrics or items
            if !content.secondaryMetrics.isEmpty {
                secondaryMetricsView
            } else if !content.items.isEmpty {
                itemsListView(maxItems: 2)
            }

            Spacer(minLength: 0)

            // Footer
            footerView
        }
        .padding(theme.spacing.md)
    }

    private var largeWidgetContent: some View {
        VStack(alignment: .leading, spacing: theme.spacing.md) {
            // Header with metrics
            VStack(alignment: .leading, spacing: theme.spacing.sm) {
                if let title = content.title {
                    widgetHeader(title: title)
                }

                if let primaryMetric = content.primaryMetric {
                    primaryMetricView(primaryMetric)
                }

                if !content.secondaryMetrics.isEmpty {
                    secondaryMetricsView
                }
            }

            // Progress
            if let progress = content.progress {
                progressView(progress)
            }

            // Items list
            if !content.items.isEmpty {
                itemsListView(maxItems: 4)
            }

            Spacer(minLength: 0)

            // Footer
            footerView
        }
        .padding(theme.spacing.lg)
    }

    private var extraLargeWidgetContent: some View {
        VStack(alignment: .leading, spacing: theme.spacing.lg) {
            // Header section
            VStack(alignment: .leading, spacing: theme.spacing.md) {
                if let title = content.title {
                    widgetHeader(title: title, subtitle: content.subtitle)
                }

                // Metrics row
                HStack(spacing: theme.spacing.lg) {
                    if let primaryMetric = content.primaryMetric {
                        primaryMetricView(primaryMetric)
                    }

                    if !content.secondaryMetrics.isEmpty {
                        secondaryMetricsView
                    }

                    Spacer()

                    if let progress = content.progress {
                        progressView(progress)
                    }
                }
            }

            // Main content
            if !content.items.isEmpty {
                itemsListView(maxItems: 6)
            }

            Spacer(minLength: 0)

            // Footer
            footerView
        }
        .padding(theme.spacing.xl)
    }

    private var accessoryWidgetContent: some View {
        Group {
            if let primaryMetric = content.primaryMetric {
                VStack(spacing: 2) {
                    BPText(primaryMetric.value, style: .labelLarge)
                        .foregroundColor(primaryMetric.color ?? theme.colors.text.primary)
                    BPText(primaryMetric.label, style: .captionSmall)
                        .foregroundColor(theme.colors.text.tertiary)
                }
            } else if let progress = content.progress {
                VStack(spacing: 2) {
                    BPText("\(Int(progress.percentage * 100))%", style: .labelLarge)
                    BPText(progress.label, style: .captionSmall)
                        .foregroundColor(theme.colors.text.tertiary)
                }
            } else if let firstItem = content.items.first {
                VStack(spacing: 2) {
                    if let icon = firstItem.icon {
                        Image(systemName: icon)
                            .font(.caption)
                    }
                    BPText(firstItem.title, style: .captionSmall)
                        .lineLimit(1)
                }
            }
        }
        .padding(4)
    }

    // MARK: - Content Views

    private func widgetHeader(title: String, subtitle: String? = nil, compact: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            BPText(
                title,
                style: compact ? .labelMedium : .heading6,
                color: .primary
            )
            .lineLimit(1)

            if let subtitle = subtitle, !compact {
                BPText(subtitle, style: .captionMedium, color: .secondary)
                    .lineLimit(1)
            }
        }
    }

    private func primaryMetricView(_ metric: Metric, compact: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: theme.spacing.xs) {
                if let icon = metric.icon {
                    Image(systemName: icon)
                        .font(.caption)
                        .foregroundColor(metric.color ?? theme.colors.text.secondary)
                }

                BPText(
                    metric.value,
                    style: compact ? .heading6 : .displaySmall,
                    color: .custom(metric.color ?? theme.colors.text.primary)
                )

                if let trend = metric.trend {
                    trendIndicator(trend, compact: compact)
                }
            }

            BPText(
                metric.label,
                style: compact ? .captionSmall : .captionMedium,
                color: .secondary
            )
            .lineLimit(1)
        }
    }

    private var secondaryMetricsView: some View {
        HStack(spacing: theme.spacing.md) {
            ForEach(Array(content.secondaryMetrics.prefix(3).enumerated()), id: \.offset) { index, metric in
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        BPText(metric.value, style: .labelMedium)
                            .foregroundColor(metric.color ?? theme.colors.text.primary)

                        if let trend = metric.trend {
                            trendIndicator(trend, compact: true)
                        }
                    }

                    BPText(metric.label, style: .captionSmall, color: .tertiary)
                        .lineLimit(1)
                }

                if index < content.secondaryMetrics.count - 1 {
                    Spacer()
                }
            }
        }
    }

    private func progressView(_ progress: Progress, compact: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            HStack {
                BPText(progress.label, style: .captionMedium, color: .secondary)
                Spacer()
                BPText("\(Int(progress.percentage * 100))%", style: .captionMedium, color: .secondary)
            }

            switch progress.style {
            case .linear:
                ProgressView(value: progress.percentage)
                    .progressViewStyle(LinearProgressViewStyle(tint: theme.colors.primary.main))
                    .frame(height: compact ? 3 : 4)
            case .circular:
                CircularProgressView(progress: progress.percentage, compact: compact)
            case .ring:
                RingProgressView(progress: progress.percentage, compact: compact)
            }
        }
    }

    private func itemsListView(maxItems: Int) -> some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            ForEach(Array(content.items.prefix(maxItems).enumerated()), id: \.element.id) { index, item in
                itemRowView(item, isLast: index == min(maxItems, content.items.count) - 1)
            }

            if content.items.count > maxItems {
                BPText("+\(content.items.count - maxItems) more", style: .captionSmall, color: .tertiary)
                    .padding(.top, 2)
            }
        }
    }

    private func itemRowView(_ item: WidgetItem, isLast: Bool) -> some View {
        HStack(spacing: theme.spacing.sm) {
            // Completion indicator
            Circle()
                .fill(item.isCompleted ? theme.colors.success.main : theme.colors.neutral._300)
                .frame(width: 8, height: 8)

            // Content
            VStack(alignment: .leading, spacing: 1) {
                BPText(item.title, style: .labelSmall)
                    .strikethrough(item.isCompleted)
                    .foregroundColor(item.isCompleted ? theme.colors.text.tertiary : theme.colors.text.primary)
                    .lineLimit(1)

                if let subtitle = item.subtitle {
                    BPText(subtitle, style: .captionSmall, color: .tertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Priority indicator
            if let priority = item.priority {
                Circle()
                    .fill(priority.color)
                    .frame(width: 6, height: 6)
            }

            // Due date
            if let dueDate = item.dueDate {
                BPText(formatDueDate(dueDate), style: .captionSmall, color: .tertiary)
            }
        }
        .opacity(item.isCompleted ? 0.7 : 1.0)
    }

    private func singleItemView(_ item: WidgetItem, compact: Bool) -> some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            HStack(spacing: theme.spacing.xs) {
                if let icon = item.icon {
                    Image(systemName: icon)
                        .font(.caption)
                        .foregroundColor(item.color ?? theme.colors.text.secondary)
                }

                BPText(
                    item.title,
                    style: compact ? .labelMedium : .labelLarge
                )
                .strikethrough(item.isCompleted)
                .lineLimit(compact ? 1 : 2)

                Spacer()

                if let priority = item.priority {
                    Circle()
                        .fill(priority.color)
                        .frame(width: 8, height: 8)
                }
            }

            if let subtitle = item.subtitle, !compact {
                BPText(subtitle, style: .captionMedium, color: .secondary)
                    .lineLimit(1)
            }
        }
    }

    private func statusView(_ status: Status, compact: Bool = false) -> some View {
        HStack(spacing: theme.spacing.xs) {
            if status.showIndicator {
                Circle()
                    .fill(status.type.color)
                    .frame(width: compact ? 6 : 8, height: compact ? 6 : 8)
            }

            BPText(
                status.text,
                style: compact ? .captionSmall : .captionMedium,
                color: .secondary
            )
            .lineLimit(1)
        }
    }

    private func updateTimeView(_ date: Date, compact: Bool = false) -> some View {
        BPText(
            "Updated \(formatUpdateTime(date))",
            style: compact ? .captionSmall : .captionMedium,
            color: .tertiary
        )
        .lineLimit(1)
    }

    private var footerView: some View {
        HStack {
            if let status = content.status {
                statusView(status)
            } else if let lastUpdated = content.lastUpdated {
                updateTimeView(lastUpdated)
            }

            Spacer()

            // Refresh indicator
            if let refreshDate = refreshDate {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.clockwise")
                        .font(.caption2)
                    BPText(formatUpdateTime(refreshDate), style: .captionSmall)
                }
                .foregroundColor(theme.colors.text.tertiary)
            }
        }
    }

    // MARK: - Helper Views

    private func trendIndicator(_ trend: Metric.Trend, compact: Bool) -> some View {
        HStack(spacing: 2) {
            Image(systemName: trend.icon)
                .font(.caption2)
                .foregroundColor(trend.color)

            if case .up(let value) = trend, !compact {
                BPText("+\(Int(value))%", style: .captionSmall)
                    .foregroundColor(trend.color)
            } else if case .down(let value) = trend, !compact {
                BPText("-\(Int(value))%", style: .captionSmall)
                    .foregroundColor(trend.color)
            }
        }
    }

    // MARK: - Custom Progress Views

    private func CircularProgressView(progress: Double, compact: Bool) -> some View {
        ZStack {
            Circle()
                .stroke(theme.colors.neutral._200, lineWidth: compact ? 3 : 4)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(theme.colors.primary.main, style: StrokeStyle(lineWidth: compact ? 3 : 4, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .frame(width: compact ? 24 : 32, height: compact ? 24 : 32)
    }

    private func RingProgressView(progress: Double, compact: Bool) -> some View {
        ZStack {
            Circle()
                .stroke(theme.colors.neutral._100, lineWidth: 2)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(theme.colors.primary.main, style: StrokeStyle(lineWidth: compact ? 2 : 3, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .scaleEffect(0.8)

            BPText("\(Int(progress * 100))", style: compact ? .captionSmall : .captionMedium)
                .foregroundColor(theme.colors.primary.main)
        }
        .frame(width: compact ? 32 : 40, height: compact ? 32 : 40)
    }

    // MARK: - Widget Styling

    private var widgetBackground: some View {
        Group {
            switch style {
            case .standard:
                theme.colors.background.card
            case .minimal:
                Color.clear
            case .glassmorphic:
                Color.clear.background(.ultraThinMaterial)
            case .productivity:
                LinearGradient(
                    colors: [
                        theme.colors.primary.main.opacity(0.1),
                        theme.colors.background.card
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            case .dashboard:
                theme.colors.background.elevated
            }
        }
    }

    @ViewBuilder
    private var widgetBorder: some View {
        if style == .standard || style == .dashboard {
            RoundedRectangle(cornerRadius: widgetCornerRadius)
                .stroke(theme.colors.border.subtle, lineWidth: 0.5)
        }
    }

    private var widgetShape: some Shape {
        RoundedRectangle(cornerRadius: widgetCornerRadius)
    }

    private var widgetCornerRadius: CGFloat {
        switch size {
        case .small, .lockScreen:
            return theme.borders.defaultRadius
        case .accessory:
            return theme.borders.smallRadius
        default:
            return theme.borders.largeRadius
        }
    }

    private var widgetShadow: Color {
        switch style {
        case .glassmorphic, .productivity, .dashboard:
            return theme.shadows.subtle
        default:
            return Color.clear
        }
    }

    private var shadowRadius: CGFloat {
        switch style {
        case .glassmorphic, .productivity, .dashboard:
            return 4
        default:
            return 0
        }
    }

    private var shadowY: CGFloat {
        switch style {
        case .glassmorphic, .productivity, .dashboard:
            return 2
        default:
            return 0
        }
    }

    // MARK: - Helper Functions

    private func formatDueDate(_ date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d"
            return formatter.string(from: date)
        }
    }

    private func formatUpdateTime(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPWidget {

    /// Create a task summary widget
    public static func taskSummary(
        completedTasks: Int,
        totalTasks: Int,
        upcomingTasks: [WidgetItem],
        size: WidgetSize
    ) -> BPWidget {
        let progress = Progress(
            current: Double(completedTasks),
            target: Double(totalTasks),
            label: "Daily Progress"
        )

        let content = WidgetContent(
            title: "Tasks",
            primaryMetric: Metric(
                value: "\(completedTasks)/\(totalTasks)",
                label: "Completed Today"
            ),
            items: upcomingTasks,
            progress: progress
        )

        return BPWidget(
            content: content,
            size: size,
            style: .productivity
        )
    }

    /// Create a goals widget
    public static func goals(
        currentStreak: Int,
        targetStreak: Int,
        weeklyProgress: Double,
        size: WidgetSize
    ) -> BPWidget {
        let content = WidgetContent(
            title: "Goals",
            primaryMetric: Metric(
                value: "\(currentStreak)",
                label: "Day Streak",
                icon: "flame"
            ),
            secondaryMetrics: [
                Metric(value: "\(Int(weeklyProgress * 100))%", label: "Weekly"),
                Metric(value: "\(targetStreak)", label: "Target")
            ],
            progress: Progress(
                current: Double(currentStreak),
                target: Double(targetStreak),
                label: "Streak Progress",
                style: .ring
            )
        )

        return BPWidget(
            content: content,
            size: size,
            style: .dashboard
        )
    }

    /// Create a habits widget
    public static func habits(
        completedHabits: Int,
        totalHabits: Int,
        habitItems: [WidgetItem],
        size: WidgetSize
    ) -> BPWidget {
        let content = WidgetContent(
            title: "Habits",
            primaryMetric: Metric(
                value: "\(completedHabits)/\(totalHabits)",
                label: "Today",
                trend: completedHabits > totalHabits / 2 ? .up(20) : .stable
            ),
            items: habitItems,
            status: Status(
                text: completedHabits == totalHabits ? "All Done!" : "Keep Going",
                type: completedHabits == totalHabits ? .success : .info
            )
        )

        return BPWidget(
            content: content,
            size: size,
            style: .standard
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Small task widget
            BPWidget.taskSummary(
                completedTasks: 5,
                totalTasks: 8,
                upcomingTasks: [
                    BPWidget.WidgetItem(title: "Review code", priority: .high),
                    BPWidget.WidgetItem(title: "Team meeting", dueDate: Date())
                ],
                size: .small
            )
            .previewContext(WidgetPreviewContext(family: .systemSmall))

            // Medium goals widget
            BPWidget.goals(
                currentStreak: 12,
                targetStreak: 30,
                weeklyProgress: 0.8,
                size: .medium
            )
            .previewContext(WidgetPreviewContext(family: .systemMedium))

            // Large habits widget
            BPWidget.habits(
                completedHabits: 3,
                totalHabits: 5,
                habitItems: [
                    BPWidget.WidgetItem(title: "Meditation", isCompleted: true),
                    BPWidget.WidgetItem(title: "Exercise", isCompleted: true),
                    BPWidget.WidgetItem(title: "Reading", isCompleted: false),
                    BPWidget.WidgetItem(title: "Water intake", isCompleted: true),
                    BPWidget.WidgetItem(title: "Journaling", isCompleted: false)
                ],
                size: .large
            )
            .previewContext(WidgetPreviewContext(family: .systemLarge))
        }
        .beProductiveTheme()
    }
}