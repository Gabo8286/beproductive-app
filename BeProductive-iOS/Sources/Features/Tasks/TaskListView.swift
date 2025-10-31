import SwiftUI
import BeProductiveUI

struct TaskListView: View {
    @StateObject private var viewModel: TaskViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @State private var showingCreateTask = false
    @State private var showingFilters = false
    @State private var selectedTask: Task?

    init(dataManager: DataManager) {
        _viewModel = StateObject(wrappedValue: TaskViewModel(dataManager: dataManager))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Search and Filter Bar
            SearchAndFilterBar(
                searchText: $viewModel.searchText,
                selectedFilter: $viewModel.selectedFilter,
                selectedSort: $viewModel.selectedSort,
                showingFilters: $showingFilters
            )

            // Task List Content
            if viewModel.isLoading {
                LoadingView()
            } else if viewModel.filteredTasks.isEmpty {
                EmptyTasksView(
                    hasAnyTasks: !viewModel.tasks.isEmpty,
                    currentFilter: viewModel.selectedFilter
                ) {
                    showingCreateTask = true
                }
            } else {
                TaskScrollView(
                    tasks: viewModel.filteredTasks,
                    viewModel: viewModel,
                    selectedTask: $selectedTask
                )
            }
        }
        .sheet(isPresented: $showingCreateTask) {
            CreateTaskView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingFilters) {
            TaskFiltersView(viewModel: viewModel)
        }
        .sheet(item: $selectedTask) { task in
            TaskDetailView(task: task, dataManager: viewModel.dataManager)
        }
        .onAppear {
            viewModel.loadTasks()
        }
        .refreshable {
            viewModel.loadTasks()
        }
    }
}

struct SearchAndFilterBar: View {
    @Binding var searchText: String
    @Binding var selectedFilter: TaskFilter
    @Binding var selectedSort: TaskSort
    @Binding var showingFilters: Bool

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            // Search Bar
            BPTextField(
                text: $searchText,
                placeholder: "Search tasks...",
                type: .search
            )
            .padding(.horizontal, BPSpacing.md)

            // Quick Filters
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: BPSpacing.sm) {
                    QuickFilterButton(
                        title: "All",
                        isSelected: selectedFilter == .all
                    ) {
                        selectedFilter = .all
                    }

                    QuickFilterButton(
                        title: "Today",
                        isSelected: selectedFilter == .today
                    ) {
                        selectedFilter = .today
                    }

                    QuickFilterButton(
                        title: "This Week",
                        isSelected: selectedFilter == .thisWeek
                    ) {
                        selectedFilter = .thisWeek
                    }

                    QuickFilterButton(
                        title: "Overdue",
                        isSelected: selectedFilter == .overdue
                    ) {
                        selectedFilter = .overdue
                    }

                    QuickFilterButton(
                        title: "Completed",
                        isSelected: selectedFilter == .completed
                    ) {
                        selectedFilter = .completed
                    }
                }
                .padding(.horizontal, BPSpacing.md)
            }
        }
        .padding(.vertical, BPSpacing.sm)
        .background(BPColors.backgroundSecondary)
    }
}

struct QuickFilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        BPButton(
            title: title,
            style: isSelected ? .primary : .ghost,
            size: .small
        ) {
            action()
        }
    }
}

struct TaskScrollView: View {
    let tasks: [Task]
    @ObservedObject var viewModel: TaskViewModel
    @Binding var selectedTask: Task?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: BPSpacing.sm) {
                // Task Sections
                if !todayTasks.isEmpty {
                    TaskSection(title: "Today", tasks: todayTasks)
                }

                if !overdueTasks.isEmpty {
                    TaskSection(title: "Overdue", tasks: overdueTasks, isOverdue: true)
                }

                if !upcomingTasks.isEmpty {
                    TaskSection(title: "Upcoming", tasks: upcomingTasks)
                }

                if !otherTasks.isEmpty {
                    TaskSection(title: "Other", tasks: otherTasks)
                }
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.bottom, 100) // Safe area for floating action button
        }
    }

    private var todayTasks: [Task] {
        let today = Calendar.current.startOfDay(for: Date())
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!

        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate >= today && dueDate < tomorrow
        }
    }

    private var overdueTasks: [Task] {
        let today = Calendar.current.startOfDay(for: Date())
        return tasks.filter { task in
            guard let dueDate = task.dueDate, !task.isCompleted else { return false }
            return dueDate < today
        }
    }

    private var upcomingTasks: [Task] {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        let weekFromNow = Calendar.current.date(byAdding: .day, value: 7, to: Date())!

        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate >= tomorrow && dueDate <= weekFromNow
        }
    }

    private var otherTasks: [Task] {
        let weekFromNow = Calendar.current.date(byAdding: .day, value: 7, to: Date())!
        return tasks.filter { task in
            if let dueDate = task.dueDate {
                return dueDate > weekFromNow
            } else {
                return true // Tasks without due dates
            }
        }
    }
}

struct TaskSection: View {
    let title: String
    let tasks: [Task]
    var isOverdue: Bool = false
    @ObservedObject var viewModel: TaskViewModel
    @Binding var selectedTask: Task?

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText(title, style: .headingSmall)
                    .foregroundColor(isOverdue ? BPColors.danger : BPColors.textPrimary)

                Spacer()

                BPText("\(tasks.count)", style: .labelMedium)
                    .foregroundColor(BPColors.textSecondary)
            }

            ForEach(tasks, id: \.id) { task in
                TaskRowView(task: task, viewModel: viewModel) {
                    selectedTask = task
                }
            }
        }
    }
}

struct TaskRowView: View {
    @ObservedObject var task: Task
    @ObservedObject var viewModel: TaskViewModel
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: BPSpacing.md) {
                // Completion Checkbox
                Button(action: {
                    Task {
                        try? await viewModel.toggleTaskCompletion(task)
                    }
                }) {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.title3)
                        .foregroundColor(task.isCompleted ? BPColors.success : BPColors.textTertiary)
                }
                .buttonStyle(PlainButtonStyle())

                // Task Content
                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    HStack {
                        BPText(task.title, style: .bodyLarge)
                            .foregroundColor(BPColors.textPrimary)
                            .strikethrough(task.isCompleted)

                        Spacer()

                        if task.priority != .medium {
                            TaskPriorityIndicator(priority: task.priority)
                        }
                    }

                    if let description = task.description, !description.isEmpty {
                        BPText(description, style: .bodySmall)
                            .foregroundColor(BPColors.textSecondary)
                            .lineLimit(2)
                    }

                    // Metadata row
                    HStack {
                        if let dueDate = task.dueDate {
                            TaskMetadataChip(
                                icon: "calendar",
                                text: formatDueDate(dueDate),
                                color: task.isOverdue ? BPColors.danger : BPColors.textSecondary
                            )
                        }

                        if let category = task.category {
                            TaskMetadataChip(
                                icon: "folder",
                                text: category,
                                color: BPColors.primary
                            )
                        }

                        if !task.subtasks.isEmpty {
                            let completedSubtasks = task.subtasks.filter { $0.isCompleted }.count
                            TaskMetadataChip(
                                icon: "list.bullet",
                                text: "\(completedSubtasks)/\(task.subtasks.count)",
                                color: BPColors.textSecondary
                            )
                        }

                        Spacer()
                    }
                }

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(BPColors.textTertiary)
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.vertical, BPSpacing.sm)
            .background(BPColors.backgroundPrimary)
            .cornerRadius(BPSpacing.md)
            .overlay(
                RoundedRectangle(cornerRadius: BPSpacing.md)
                    .stroke(BPColors.borderPrimary, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .contextMenu {
            TaskContextMenu(task: task, viewModel: viewModel)
        }
    }

    private func formatDueDate(_ date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .short
            return formatter.string(from: date)
        }
    }
}

struct TaskPriorityIndicator: View {
    let priority: TaskPriority

    var body: some View {
        Circle()
            .fill(Color(priority.color))
            .frame(width: 8, height: 8)
    }
}

struct TaskMetadataChip: View {
    let icon: String
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundColor(color)

            BPText(text, style: .labelSmall)
                .foregroundColor(color)
        }
    }
}

struct TaskContextMenu: View {
    @ObservedObject var task: Task
    @ObservedObject var viewModel: TaskViewModel

    var body: some View {
        Button(action: {
            Task {
                try? await viewModel.toggleTaskCompletion(task)
            }
        }) {
            Label(task.isCompleted ? "Mark Incomplete" : "Mark Complete",
                  systemImage: task.isCompleted ? "circle" : "checkmark.circle")
        }

        Button(action: {
            Task {
                try? await viewModel.duplicateTask(task)
            }
        }) {
            Label("Duplicate", systemImage: "doc.on.doc")
        }

        Button(action: {
            // Share task
        }) {
            Label("Share", systemImage: "square.and.arrow.up")
        }

        Divider()

        Button(role: .destructive, action: {
            Task {
                try? await viewModel.deleteTask(task)
            }
        }) {
            Label("Delete", systemImage: "trash")
        }
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: BPColors.primary))
                .scaleEffect(1.5)

            BPText("Loading tasks...", style: .bodyMedium)
                .foregroundColor(BPColors.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct EmptyTasksView: View {
    let hasAnyTasks: Bool
    let currentFilter: TaskFilter
    let onCreateTask: () -> Void

    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            Image(systemName: hasAnyTasks ? "line.horizontal.3.decrease.circle" : "checkmark.circle")
                .font(.system(size: 60))
                .foregroundColor(BPColors.textTertiary)

            VStack(spacing: BPSpacing.sm) {
                BPText(emptyTitle, style: .headingMedium)
                    .foregroundColor(BPColors.textPrimary)

                BPText(emptySubtitle, style: .bodyMedium)
                    .foregroundColor(BPColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if !hasAnyTasks {
                BPButton(
                    title: "Create Your First Task",
                    icon: "plus.circle.fill",
                    style: .primary,
                    size: .large
                ) {
                    onCreateTask()
                }
            }
        }
        .padding(.horizontal, BPSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyTitle: String {
        if hasAnyTasks {
            return "No tasks match your filter"
        } else {
            return "No tasks yet"
        }
    }

    private var emptySubtitle: String {
        if hasAnyTasks {
            return "Try adjusting your search or filter criteria to find what you're looking for."
        } else {
            return "Get started by creating your first task. Break down your goals into actionable steps."
        }
    }
}

struct CreateTaskView: View {
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var priority: TaskPriority = .medium
    @State private var category = ""
    @State private var dueDate = Date()
    @State private var hasDueDate = false
    @State private var isCreating = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    VStack(spacing: BPSpacing.md) {
                        BPTextField(
                            text: $title,
                            placeholder: "Task title",
                            type: .default
                        )

                        BPTextField(
                            text: $description,
                            placeholder: "Description (optional)",
                            type: .multiline
                        )

                        BPTextField(
                            text: $category,
                            placeholder: "Category (optional)",
                            type: .default
                        )
                    }
                    .bpCard()

                    // Priority Selection
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Priority", style: .headingSmall)
                            .foregroundColor(BPColors.textPrimary)

                        HStack(spacing: BPSpacing.sm) {
                            ForEach(TaskPriority.allCases, id: \.self) { priorityOption in
                                BPButton(
                                    title: priorityOption.displayName,
                                    style: priority == priorityOption ? .primary : .secondary,
                                    size: .small
                                ) {
                                    priority = priorityOption
                                }
                            }
                        }
                    }
                    .bpCard()

                    // Due Date
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        HStack {
                            Toggle("Set due date", isOn: $hasDueDate)
                                .toggleStyle(SwitchToggleStyle(tint: BPColors.primary))

                            Spacer()
                        }

                        if hasDueDate {
                            DatePicker(
                                "Due Date",
                                selection: $dueDate,
                                displayedComponents: [.date, .hourAndMinute]
                            )
                            .datePickerStyle(CompactDatePickerStyle())
                        }
                    }
                    .bpCard()

                    Spacer(minLength: 100)
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .bpNavigationBar(
                title: "New Task",
                displayMode: .inline,
                leading: [
                    .init(title: "Cancel", action: { dismiss() })
                ],
                actions: [
                    .init(title: "Create", action: { createTask() })
                ]
            )
        }
        .disabled(isCreating)
    }

    private func createTask() {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isCreating = true

        Task {
            do {
                try await viewModel.createTask(
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.isEmpty ? nil : description,
                    priority: priority,
                    dueDate: hasDueDate ? dueDate : nil,
                    category: category.isEmpty ? nil : category
                )

                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isCreating = false
                    // Handle error
                }
            }
        }
    }
}

struct TaskFiltersView: View {
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Sort Options
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Sort By", style: .headingSmall)
                            .foregroundColor(BPColors.textPrimary)

                        ForEach(TaskSort.allCases, id: \.self) { sort in
                            FilterOptionRow(
                                title: sort.displayName,
                                isSelected: viewModel.selectedSort == sort
                            ) {
                                viewModel.updateSort(sort)
                            }
                        }
                    }
                    .bpCard()

                    // Show/Hide Completed
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Display Options", style: .headingSmall)
                            .foregroundColor(BPColors.textPrimary)

                        HStack {
                            Toggle("Show completed tasks", isOn: Binding(
                                get: { viewModel.showCompleted },
                                set: { _ in viewModel.toggleShowCompleted() }
                            ))
                            .toggleStyle(SwitchToggleStyle(tint: BPColors.primary))

                            Spacer()
                        }
                    }
                    .bpCard()
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .bpNavigationBar(
                title: "Filters & Sort",
                displayMode: .inline,
                leading: [
                    .init(title: "Done", action: { dismiss() })
                ]
            )
        }
    }
}

struct FilterOptionRow: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                BPText(title, style: .bodyMedium)
                    .foregroundColor(BPColors.textPrimary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.body)
                        .foregroundColor(BPColors.primary)
                }
            }
            .padding(.vertical, BPSpacing.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    TaskListView(dataManager: DataManager())
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}