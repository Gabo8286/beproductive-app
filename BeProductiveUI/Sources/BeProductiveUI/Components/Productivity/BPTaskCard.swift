import SwiftUI

/// BeProductive Task Card Component
///
/// A comprehensive task card component designed specifically for productivity applications,
/// featuring task completion states, priority indicators, due dates, and interactive elements.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTaskCard: View {

    // MARK: - Properties

    private let task: TaskData
    private let style: CardStyle
    private let showActions: Bool
    private let onToggleComplete: (() -> Void)?
    private let onEdit: (() -> Void)?
    private let onDelete: (() -> Void)?

    @Environment(\.bpTheme) private var theme
    @State private var isCompleted: Bool

    // MARK: - Task Data Model

    public struct TaskData {
        public let id: String
        public let title: String
        public let description: String?
        public let priority: Priority
        public let status: Status
        public let dueDate: Date?
        public let tags: [String]
        public let progress: Double? // 0.0 to 1.0
        public let estimatedTime: TimeInterval?
        public let assignee: String?
        public let project: String?

        public init(
            id: String = UUID().uuidString,
            title: String,
            description: String? = nil,
            priority: Priority = .medium,
            status: Status = .todo,
            dueDate: Date? = nil,
            tags: [String] = [],
            progress: Double? = nil,
            estimatedTime: TimeInterval? = nil,
            assignee: String? = nil,
            project: String? = nil
        ) {
            self.id = id
            self.title = title
            self.description = description
            self.priority = priority
            self.status = status
            self.dueDate = dueDate
            self.tags = tags
            self.progress = progress
            self.estimatedTime = estimatedTime
            self.assignee = assignee
            self.project = project
        }
    }

    // MARK: - Enums

    public enum Priority: String, CaseIterable {
        case low = "Low"
        case medium = "Medium"
        case high = "High"
        case urgent = "Urgent"

        var color: Color {
            switch self {
            case .low:
                return Color.blue
            case .medium:
                return Color.orange
            case .high:
                return Color.red
            case .urgent:
                return Color.purple
            }
        }

        var icon: String {
            switch self {
            case .low:
                return "arrow.down.circle"
            case .medium:
                return "minus.circle"
            case .high:
                return "arrow.up.circle"
            case .urgent:
                return "exclamationmark.circle"
            }
        }
    }

    public enum Status: String, CaseIterable {
        case todo = "To Do"
        case inProgress = "In Progress"
        case review = "Review"
        case completed = "Completed"
        case blocked = "Blocked"
        case cancelled = "Cancelled"

        var color: Color {
            switch self {
            case .todo:
                return Color.gray
            case .inProgress:
                return Color.blue
            case .review:
                return Color.orange
            case .completed:
                return Color.green
            case .blocked:
                return Color.red
            case .cancelled:
                return Color.gray
            }
        }

        var icon: String {
            switch self {
            case .todo:
                return "circle"
            case .inProgress:
                return "play.circle"
            case .review:
                return "eye.circle"
            case .completed:
                return "checkmark.circle.fill"
            case .blocked:
                return "xmark.circle"
            case .cancelled:
                return "minus.circle"
            }
        }
    }

    public enum CardStyle {
        case compact
        case standard
        case detailed
        case minimal
    }

    // MARK: - Initializer

    public init(
        task: TaskData,
        style: CardStyle = .standard,
        showActions: Bool = true,
        onToggleComplete: (() -> Void)? = nil,
        onEdit: (() -> Void)? = nil,
        onDelete: (() -> Void)? = nil
    ) {
        self.task = task
        self.style = style
        self.showActions = showActions
        self.onToggleComplete = onToggleComplete
        self.onEdit = onEdit
        self.onDelete = onDelete
        self._isCompleted = State(initialValue: task.status == .completed)
    }

    // MARK: - Body

    public var body: some View {
        VStack(spacing: 0) {
            mainContent
                .padding(cardPaddingValue)

            if showActions && style != .minimal {
                actionBar
            }
        }
        .bpCard(
            style: cardBackground,
            padding: .none,
            interactive: true
        )
        .opacity(isCompleted ? 0.7 : 1.0)
        .animation(theme.animations.smooth, value: isCompleted)
    }

    // MARK: - Main Content

    @ViewBuilder
    private var mainContent: some View {
        switch style {
        case .compact:
            compactLayout
        case .standard:
            standardLayout
        case .detailed:
            detailedLayout
        case .minimal:
            minimalLayout
        }
    }

    // MARK: - Layout Variants

    private var compactLayout: some View {
        HStack(spacing: theme.spacing.sm) {
            completionButton

            VStack(alignment: .leading, spacing: theme.spacing.xs) {
                HStack {
                    BPText(task.title, style: .taskTitle)
                        .strikethrough(isCompleted)
                        .lineLimit(1)

                    Spacer()

                    priorityIndicator
                }

                if let dueDate = task.dueDate {
                    dueDateView(dueDate, compact: true)
                }
            }

            Spacer()
        }
    }

    private var standardLayout: some View {
        VStack(alignment: .leading, spacing: theme.spacing.sm) {
            // Header
            HStack(spacing: theme.spacing.sm) {
                completionButton

                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    BPText(task.title, style: .taskTitle)
                        .strikethrough(isCompleted)
                        .lineLimit(2)

                    if let description = task.description {
                        BPText(description, style: .bodySmall, color: .secondary)
                            .lineLimit(2)
                    }
                }

                Spacer()

                priorityIndicator
            }

            // Metadata
            metadataRow
        }
    }

    private var detailedLayout: some View {
        VStack(alignment: .leading, spacing: theme.spacing.md) {
            // Header with completion and priority
            HStack(spacing: theme.spacing.sm) {
                completionButton

                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    BPText(task.title, style: .taskTitle)
                        .strikethrough(isCompleted)

                    if let description = task.description {
                        BPText(description, style: .bodyMedium, color: .secondary)
                    }
                }

                Spacer()

                VStack(spacing: theme.spacing.xs) {
                    priorityIndicator
                    statusBadge
                }
            }

            // Progress bar if available
            if let progress = task.progress {
                progressView(progress)
            }

            // Detailed metadata
            detailedMetadata

            // Tags
            if !task.tags.isEmpty {
                tagsView
            }
        }
    }

    private var minimalLayout: some View {
        HStack(spacing: theme.spacing.sm) {
            completionButton

            BPText(task.title, style: .bodyMedium)
                .strikethrough(isCompleted)
                .lineLimit(1)

            Spacer()

            if task.priority != .medium {
                priorityIndicator
            }
        }
    }

    // MARK: - Components

    private var completionButton: some View {
        Button(action: toggleCompletion) {
            Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.title2)
                .foregroundColor(isCompleted ? theme.colors.success.main : theme.colors.text.tertiary)
        }
        .bpInteractive(style: .button, hapticFeedback: .selection)
    }

    private var priorityIndicator: some View {
        HStack(spacing: theme.spacing.xs) {
            Image(systemName: task.priority.icon)
                .font(.caption)

            if style == .detailed {
                BPText(task.priority.rawValue, style: .captionSmall)
            }
        }
        .foregroundColor(task.priority.color)
        .bpBadge(style: priorityBadgeStyle, size: .small)
    }

    private var statusBadge: some View {
        BPText(task.status.rawValue, style: .captionSmall)
            .bpBadge(style: statusBadgeStyle, size: .small)
    }

    private var metadataRow: some View {
        HStack(spacing: theme.spacing.md) {
            if let dueDate = task.dueDate {
                dueDateView(dueDate)
            }

            if let project = task.project {
                projectView(project)
            }

            Spacer()

            statusBadge
        }
    }

    private var detailedMetadata: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            if let dueDate = task.dueDate {
                metadataItem(icon: "calendar", text: formatDate(dueDate))
            }

            if let estimatedTime = task.estimatedTime {
                metadataItem(icon: "clock", text: formatDuration(estimatedTime))
            }

            if let assignee = task.assignee {
                metadataItem(icon: "person", text: assignee)
            }

            if let project = task.project {
                metadataItem(icon: "folder", text: project)
            }
        }
    }

    private func metadataItem(icon: String, text: String) -> some View {
        HStack(spacing: theme.spacing.xs) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(theme.colors.text.tertiary)
                .frame(width: 16)

            BPText(text, style: .captionMedium, color: .secondary)
        }
    }

    private func dueDateView(_ dueDate: Date, compact: Bool = false) -> some View {
        HStack(spacing: theme.spacing.xs) {
            Image(systemName: "calendar")
                .font(.caption)

            if !compact {
                BPText(formatDate(dueDate), style: .captionMedium)
            }
        }
        .foregroundColor(dueDateColor(dueDate))
    }

    private func projectView(_ project: String) -> some View {
        HStack(spacing: theme.spacing.xs) {
            Image(systemName: "folder")
                .font(.caption)

            BPText(project, style: .captionSmall)
        }
        .foregroundColor(theme.colors.text.tertiary)
    }

    private func progressView(_ progress: Double) -> some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            HStack {
                BPText("Progress", style: .captionMedium, color: .secondary)
                Spacer()
                BPText("\(Int(progress * 100))%", style: .captionMedium, color: .secondary)
            }

            ProgressView(value: progress)
                .progressViewStyle(LinearProgressViewStyle(tint: theme.colors.primary.main))
                .frame(height: 4)
        }
    }

    private var tagsView: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: theme.spacing.xs) {
                ForEach(task.tags, id: \.self) { tag in
                    BPText(tag, style: .captionSmall)
                        .bpBadge(style: .neutral, size: .small)
                }
            }
            .padding(.horizontal, 1) // Prevent clipping
        }
    }

    private var actionBar: some View {
        HStack(spacing: theme.spacing.md) {
            if let onEdit = onEdit {
                Button("Edit", action: onEdit)
                    .font(theme.typography.semantic.button.font)
                    .foregroundColor(theme.colors.primary.main)
            }

            Spacer()

            if let onDelete = onDelete {
                Button("Delete", action: onDelete)
                    .font(theme.typography.semantic.button.font)
                    .foregroundColor(theme.colors.error.main)
            }
        }
        .padding(theme.spacing.sm)
        .background(theme.colors.background.secondary)
    }

    // MARK: - Computed Properties

    private var cardPadding: BPCardModifier.PaddingStyle {
        switch style {
        case .compact, .minimal:
            return .small
        case .standard:
            return .medium
        case .detailed:
            return .large
        }
    }

    private var cardPaddingValue: CGFloat {
        switch cardPadding {
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

    private var cardBackground: BPCardModifier.CardStyle {
        switch task.status {
        case .completed:
            return .subtle
        case .blocked:
            return .outlined
        default:
            return .elevated
        }
    }

    private var priorityBadgeStyle: BPBadgeModifier.BadgeStyle {
        switch task.priority {
        case .low:
            return .info
        case .medium:
            return .neutral
        case .high:
            return .warning
        case .urgent:
            return .error
        }
    }

    private var statusBadgeStyle: BPBadgeModifier.BadgeStyle {
        switch task.status {
        case .todo:
            return .neutral
        case .inProgress:
            return .info
        case .review:
            return .warning
        case .completed:
            return .success
        case .blocked:
            return .error
        case .cancelled:
            return .neutral
        }
    }

    private func dueDateColor(_ dueDate: Date) -> Color {
        let calendar = Calendar.current
        let now = Date()

        if calendar.isDate(dueDate, inSameDayAs: now) {
            return theme.colors.warning.main
        } else if dueDate < now {
            return theme.colors.error.main
        } else {
            return theme.colors.text.tertiary
        }
    }

    // MARK: - Actions

    private func toggleCompletion() {
        withAnimation(theme.animations.smooth) {
            isCompleted.toggle()
        }
        onToggleComplete?()
    }

    // MARK: - Formatting Helpers

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        let calendar = Calendar.current

        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else if calendar.isDate(date, equalTo: Date(), toGranularity: .year) {
            formatter.dateFormat = "MMM d"
        } else {
            formatter.dateFormat = "MMM d, yyyy"
        }

        return formatter.string(from: date)
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTaskCard {

    /// Create a simple task card
    public static func simple(
        title: String,
        isCompleted: Bool = false,
        priority: Priority = .medium,
        onToggleComplete: (() -> Void)? = nil
    ) -> BPTaskCard {
        let task = TaskData(
            title: title,
            priority: priority,
            status: isCompleted ? .completed : .todo
        )

        return BPTaskCard(
            task: task,
            style: .compact,
            onToggleComplete: onToggleComplete
        )
    }

    /// Create a detailed task card
    public static func detailed(
        title: String,
        description: String? = nil,
        priority: Priority = .medium,
        dueDate: Date? = nil,
        progress: Double? = nil,
        tags: [String] = [],
        onToggleComplete: (() -> Void)? = nil,
        onEdit: (() -> Void)? = nil
    ) -> BPTaskCard {
        let task = TaskData(
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            tags: tags,
            progress: progress
        )

        return BPTaskCard(
            task: task,
            style: .detailed,
            onToggleComplete: onToggleComplete,
            onEdit: onEdit
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPTaskCard_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Simple tasks
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Simple Tasks", style: .sectionTitle)

                    BPTaskCard.simple(
                        title: "Complete project documentation",
                        priority: .high
                    )

                    BPTaskCard.simple(
                        title: "Review pull requests",
                        isCompleted: true
                    )
                }

                Divider()

                // Detailed tasks
                VStack(alignment: .leading, spacing: 8) {
                    BPText("Detailed Tasks", style: .sectionTitle)

                    BPTaskCard.detailed(
                        title: "Design new user interface",
                        description: "Create wireframes and prototypes for the new dashboard interface",
                        priority: .urgent,
                        dueDate: Date().addingTimeInterval(86400), // Tomorrow
                        progress: 0.6,
                        tags: ["Design", "UI/UX", "Priority"]
                    )

                    BPTaskCard(
                        task: BPTaskCard.TaskData(
                            title: "Backend API Development",
                            description: "Implement REST API endpoints for user management",
                            priority: .high,
                            status: .inProgress,
                            dueDate: Date().addingTimeInterval(259200), // 3 days
                            tags: ["Backend", "API"],
                            estimatedTime: 14400, // 4 hours
                            assignee: "John Doe",
                            project: "Mobile App"
                        ),
                        style: .detailed
                    )
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}