import SwiftUI
import BeProductiveUI

struct TaskDetailView: View {
    @Bindable var task: TodoTask
    @StateObject private var viewModel: TodoTaskViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @Environment(\.dismiss) private var dismiss

    @State private var isEditing = false
    @State private var showingDeleteAlert = false
    @State private var showingSubtaskSheet = false
    @State private var newSubtaskTitle = ""

    init(task: TodoTask, dataManager: DataManager) {
        self.task = task
        self._viewModel = StateObject(wrappedValue: TodoTaskViewModel(dataManager: dataManager))
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Header Section
                    TaskHeaderSection(task: task, isEditing: $isEditing, viewModel: viewModel)

                    // Main Content
                    TaskContentSection(task: task)

                    // Subtasks Section
                    if !task.subtasks.isEmpty {
                        SubtasksSection(task: task, viewModel: viewModel)
                    }

                    // Attachments Section
                    if !task.attachments.isEmpty {
                        AttachmentsSection(attachments: task.attachments)
                    }

                    // Comments Section
                    if !task.comments.isEmpty {
                        CommentsSection(comments: task.comments)
                    }

                    // Action Buttons
                    TaskActionButtons(task: task, viewModel: viewModel) {
                        showingSubtaskSheet = true
                    } onDelete: {
                        showingDeleteAlert = true
                    }
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationTitle("Task Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button(action: { isEditing = true }) {
                        Image(systemName: "pencil")
                    }
                    Button(action: { shareTask() }) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
        .sheet(isPresented: $isEditing) {
            TaskEditView(task: task, viewModel: viewModel)
        }
        .sheet(isPresented: $showingSubtaskSheet) {
            AddSubtaskView(parentTask: task, viewModel: viewModel)
        }
        .alert("Delete Task", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteTask()
            }
        } message: {
            Text("Are you sure you want to delete this task? This action cannot be undone.")
        }
    }

    private func shareTask() {
        let statusText = task.isCompleted ? "✅ Completed" : "📋 In Progress"
        let priorityText = task.priority.displayName
        let shareText = "\(statusText): \(task.title) (Priority: \(priorityText)) #BeProductive #Tasks"

        let activityViewController = UIActivityViewController(
            activityItems: [shareText],
            applicationActivities: nil
        )

        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityViewController, animated: true)
        }
    }

    private func deleteTask() {
        Task {
            do {
                try await viewModel.deleteTask(task)
                await MainActor.run {
                    dismiss()
                }
            } catch {
                // Handle error
            }
        }
    }
}

struct TaskHeaderSection: View {
    @Bindable var task: TodoTask
    @Binding var isEditing: Bool
    @ObservedObject var viewModel: TodoTaskViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                Button(action: {
                    Task {
                        try? await viewModel.toggleTaskCompletion(task)
                    }
                }) {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.title2)
                        .foregroundColor(task.isCompleted ? BPColors.Success.main : BPColors.Text.tertiary)
                }

                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(task.title, style: .taskTitle)
                        .foregroundColor(BPColors.Text.primary)
                        .strikethrough(task.isCompleted)

                    if let description = task.taskDescription, !description.isEmpty {
                        BPText(description, style: .bodyMedium)
                            .foregroundColor(BPColors.Text.secondary)
                    }
                }

                Spacer()

                TaskPriorityBadge(priority: task.priority)
            }

            // Metadata Row
            HStack {
                if let dueDate = task.dueDate {
                    TaskMetadataItem(
                        icon: "calendar",
                        text: formatDate(dueDate),
                        color: task.isOverdue ? BPColors.Error.main : BPColors.Text.secondary
                    )
                }

                if let category = task.category {
                    TaskMetadataItem(
                        icon: "folder",
                        text: category,
                        color: BPColors.Primary.main
                    )
                }

                if let project = task.project {
                    TaskMetadataItem(
                        icon: "briefcase",
                        text: project.title,
                        color: Color(hex: project.color)
                    )
                }

                Spacer()
            }

            // Tags
            if !task.tags.isEmpty {
                TaskTagsView(tags: task.tags)
            }
        }
        .bpCard()
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct TaskContentSection: View {
    @Bindable var task: TodoTask

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Details", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                TaskDetailRow(title: "Status", value: task.status.displayName)
                TaskDetailRow(title: "Created", value: formatDate(task.createdAt))
                TaskDetailRow(title: "Updated", value: formatDate(task.updatedAt))

                if let startDate = task.startDate {
                    TaskDetailRow(title: "Started", value: formatDate(startDate))
                }

                if let completedDate = task.completedDate {
                    TaskDetailRow(title: "Completed", value: formatDate(completedDate))
                }

                if let estimatedDuration = task.estimatedDuration {
                    TaskDetailRow(title: "Estimated Time", value: formatDuration(estimatedDuration))
                }

                if let actualDuration = task.actualDuration {
                    TaskDetailRow(title: "Actual Time", value: formatDuration(actualDuration))
                }
            }
        }
        .bpCard()
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.hour, .minute]
        formatter.unitsStyle = .abbreviated
        return formatter.string(from: duration) ?? "Unknown"
    }
}

struct SubtasksSection: View {
    @Bindable var task: TodoTask
    @ObservedObject var viewModel: TodoTaskViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText("Subtasks", style: .sectionTitle)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPText("\(task.subtasks.filter { $0.isCompleted }.count)/\(task.subtasks.count)", style: .labelMedium)
                    .foregroundColor(BPColors.Text.secondary)
            }

            ForEach(task.subtasks.sorted { $0.createdAt < $1.createdAt }, id: \.id) { subtask in
                SubtaskRow(subtask: subtask, viewModel: viewModel)
            }
        }
        .bpCard()
    }
}

struct SubtaskRow: View {
    @Bindable var subtask: TodoTask
    @ObservedObject var viewModel: TodoTaskViewModel

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Button(action: {
                Task {
                    try? await viewModel.toggleTaskCompletion(subtask)
                }
            }) {
                Image(systemName: subtask.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.body)
                    .foregroundColor(subtask.isCompleted ? BPColors.Success.main : BPColors.Text.tertiary)
            }

            BPText(subtask.title, style: .bodyMedium)
                .foregroundColor(BPColors.Text.primary)
                .strikethrough(subtask.isCompleted)

            Spacer()

            if subtask.priority != TaskPriorityLevel.medium {
                TaskPriorityBadge(priority: subtask.priority, size: .small)
            }
        }
        .padding(.vertical, BPSpacing.xs)
    }
}

struct AttachmentsSection: View {
    let attachments: [TaskAttachment]

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Attachments", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            ForEach(attachments, id: \.id) { attachment in
                AttachmentRow(attachment: attachment)
            }
        }
        .bpCard()
    }
}

struct AttachmentRow: View {
    let attachment: TodoTaskAttachment

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Image(systemName: iconForMimeType(attachment.mimeType))
                .font(.title3)
                .foregroundColor(BPColors.Primary.main)

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(attachment.fileName, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.primary)

                BPText(formatFileSize(attachment.fileSize), style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            Spacer()

            Button(action: {
                // Open attachment
            }) {
                Image(systemName: "arrow.down.circle")
                    .font(.title3)
                    .foregroundColor(BPColors.Primary.main)
            }
        }
        .padding(.vertical, BPSpacing.xs)
    }

    private func iconForMimeType(_ mimeType: String) -> String {
        switch mimeType {
        case let type where type.hasPrefix("image/"):
            return "photo"
        case let type where type.hasPrefix("video/"):
            return "video"
        case let type where type.hasPrefix("audio/"):
            return "music.note"
        case "application/pdf":
            return "doc.text"
        default:
            return "doc"
        }
    }

    private func formatFileSize(_ bytes: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB, .useGB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: bytes)
    }
}

struct CommentsSection: View {
    let comments: [TaskComment]

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Comments", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            ForEach(comments.sorted { $0.createdAt > $1.createdAt }, id: \.id) { comment in
                CommentRow(comment: comment)
            }
        }
        .bpCard()
    }
}

struct CommentRow: View {
    let comment: TodoTaskComment

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.sm) {
            HStack {
                BPText("User", style: .labelMedium) // TODO: Get actual user name
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPText(formatDate(comment.createdAt), style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            BPText(comment.content, style: .bodyMedium)
                .foregroundColor(BPColors.Text.secondary)
        }
        .padding(.vertical, BPSpacing.sm)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(BPColors.Border.default),
            alignment: .bottom
        )
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct TaskActionButtons: View {
    @Bindable var task: TodoTask
    @ObservedObject var viewModel: TodoTaskViewModel
    let onAddSubtask: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            HStack(spacing: BPSpacing.md) {
                BPButton(
                    "Add Subtask",
                    icon: "plus.circle",
                    style: .secondary,
                    size: .medium
                ) {
                    onAddSubtask()
                }

                BPButton(
                    "Duplicate",
                    icon: "doc.on.doc",
                    style: .secondary,
                    size: .medium
                ) {
                    Task {
                        try? await viewModel.duplicateTask(task)
                    }
                }
            }

            HStack(spacing: BPSpacing.md) {
                BPButton(
                    task.isCompleted ? "Mark Incomplete" : "Mark Complete",
                    icon: task.isCompleted ? "circle" : "checkmark.circle.fill",
                    style: task.isCompleted ? .secondary : .primary,
                    size: .medium
                ) {
                    Task {
                        try? await viewModel.toggleTaskCompletion(task)
                    }
                }

                BPButton(
                    "Delete",
                    icon: "trash",
                    style: .destructive,
                    size: .medium
                ) {
                    onDelete()
                }
            }
        }
    }
}

// MARK: - Supporting Views
struct TaskPriorityBadge: View {
    let priority: TaskPriorityLevel
    var size: BadgeSize = .medium

    enum BadgeSize {
        case small, medium, large
    }

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            Circle()
                .fill(Color(priority.color))
                .frame(width: circleSize, height: circleSize)

            BPText(priority.displayName, style: textStyle)
                .foregroundColor(Color(priority.color))
        }
        .padding(.horizontal, horizontalPadding)
        .padding(.vertical, verticalPadding)
        .background(Color(priority.color).opacity(0.1))
        .cornerRadius(BPSpacing.xs)
    }

    private var circleSize: CGFloat {
        switch size {
        case .small: return 6
        case .medium: return 8
        case .large: return 10
        }
    }

    private var textStyle: BPText.TextStyle {
        switch size {
        case .small: return .labelSmall
        case .medium: return .labelMedium
        case .large: return .bodyMedium
        }
    }

    private var horizontalPadding: CGFloat {
        switch size {
        case .small: return BPSpacing.xs
        case .medium: return BPSpacing.sm
        case .large: return BPSpacing.md
        }
    }

    private var verticalPadding: CGFloat {
        switch size {
        case .small: return BPSpacing.xs / 2
        case .medium: return BPSpacing.xs
        case .large: return BPSpacing.sm
        }
    }
}

struct TaskMetadataItem: View {
    let icon: String
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(color)

            BPText(text, style: .labelSmall)
                .foregroundColor(color)
        }
    }
}

struct TaskTagsView: View {
    let tags: [String]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: BPSpacing.xs) {
                ForEach(tags, id: \.self) { tag in
                    BPText(tag, style: .labelSmall)
                        .foregroundColor(BPColors.Primary.main)
                        .padding(.horizontal, BPSpacing.sm)
                        .padding(.vertical, BPSpacing.xs)
                        .background(BPColors.Primary.main.opacity(0.1))
                        .cornerRadius(BPSpacing.xs)
                }
            }
            .padding(.horizontal, BPSpacing.md)
        }
    }
}

struct TaskDetailRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            BPText(title, style: .labelMedium)
                .foregroundColor(BPColors.Text.secondary)

            Spacer()

            BPText(value, style: .bodyMedium)
                .foregroundColor(BPColors.Text.primary)
        }
    }
}

#Preview {
    let task = TodoTask(
        title: "Sample Task",
        taskDescription: "This is a sample task description",
        priority: TaskPriorityLevel.high,
        dueDate: Date(),
        userId: UUID()
    )

    TaskDetailView(task: task, dataManager: DataManager())
        .environmentObject(AppCoordinator())
}