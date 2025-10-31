import SwiftUI
import BeProductiveUI

struct GoalDetailView: View {
    let goal: Goal
    @StateObject private var viewModel: GoalViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @Environment(\.dismiss) private var dismiss

    @State private var isEditing = false
    @State private var showingDeleteAlert = false
    @State private var showingMilestoneSheet = false
    @State private var showingProgressUpdate = false
    @State private var showingAddTask = false

    init(goal: Goal, dataManager: DataManager) {
        self.goal = goal
        self._viewModel = StateObject(wrappedValue: GoalViewModel(dataManager: dataManager))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: BPSpacing.lg) {
                // Header Section
                GoalHeaderSection(goal: goal, isEditing: $isEditing)

                // Progress Section
                GoalProgressSection(
                    goal: goal,
                    showingProgressUpdate: $showingProgressUpdate
                )

                // Milestones Section
                if !goal.milestones.isEmpty {
                    GoalMilestonesSection(
                        goal: goal,
                        viewModel: viewModel,
                        showingMilestoneSheet: $showingMilestoneSheet
                    )
                }

                // Related Tasks Section
                if !goal.tasks.isEmpty {
                    GoalTasksSection(
                        goal: goal,
                        viewModel: viewModel,
                        showingAddTask: $showingAddTask
                    )
                }

                // Action Buttons
                GoalActionButtons(
                    goal: goal,
                    viewModel: viewModel,
                    onAddMilestone: { showingMilestoneSheet = true },
                    onAddTask: { showingAddTask = true },
                    onDelete: { showingDeleteAlert = true }
                )
            }
            .padding(.horizontal, BPSpacing.md)
        }
        .navigationTitle("Goal Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: { isEditing = true }) {
                    Image(systemName: "pencil")
                }
                Button(action: { shareGoal() }) {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .sheet(isPresented: $isEditing) {
            GoalEditView(goal: goal, viewModel: viewModel)
        }
        .sheet(isPresented: $showingMilestoneSheet) {
            AddMilestoneView(goal: goal, viewModel: viewModel)
        }
        .sheet(isPresented: $showingProgressUpdate) {
            UpdateProgressView(goal: goal, viewModel: viewModel)
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskToGoalView(goal: goal, viewModel: viewModel)
        }
        .alert("Delete Goal", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteGoal()
            }
        } message: {
            Text("Are you sure you want to delete this goal? This action cannot be undone.")
        }
    }

    private func shareGoal() {
        let progressPercentage = Int(goal.progress * 100)
        let shareText = "Working on my goal: \(goal.title) - \(progressPercentage)% complete! #BeProductive #Goals"

        let activityViewController = UIActivityViewController(
            activityItems: [shareText],
            applicationActivities: nil
        )

        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityViewController, animated: true)
        }
    }

    private func deleteGoal() {
        Swift.Task {
            do {
                try await viewModel.deleteGoal(goal)
                dismiss()
            } catch {
                // Handle error
            }
        }
    }
}

struct GoalHeaderSection: View {
    let goal: Goal
    @Binding var isEditing: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(goal.title, style: .heading3)
                        .foregroundColor(BPColors.Text.primary)

                    if let details = goal.details, !details.isEmpty {
                        BPText(details, style: .bodyMedium)
                            .foregroundColor(BPColors.Text.secondary)
                    }
                }

                Spacer()

                GoalStatusBadge(status: goal.status)
            }

            // Metadata Row
            HStack {
                if let targetDate = goal.targetDate {
                    GoalMetadataItem(
                        icon: "calendar",
                        text: formatDate(targetDate),
                        color: goal.isOverdue ? BPColors.Error.main : BPColors.Text.secondary
                    )
                }

                if let category = goal.category {
                    GoalMetadataItem(
                        icon: "folder",
                        text: category,
                        color: BPColors.Primary.main
                    )
                }

                if goal.priority != .medium {
                    GoalMetadataItem(
                        icon: "exclamationmark.triangle.fill",
                        text: goal.priority.displayName,
                        color: Color(goal.priority.color)
                    )
                }

                Spacer()
            }

            // Target Information
            if let targetValue = goal.targetValue, let unit = goal.unit {
                HStack {
                    Image(systemName: "target")
                        .font(.caption)
                        .foregroundColor(BPColors.Primary.main)

                    BPText("Target: \(formatValue(targetValue)) \(unit)", style: .bodyMedium)
                        .foregroundColor(BPColors.Text.primary)

                    Spacer()
                }
            }

            // Days remaining
            if let daysRemaining = goal.daysRemaining, !goal.isCompleted {
                HStack {
                    Image(systemName: "clock")
                        .font(.caption)
                        .foregroundColor(daysRemaining >= 0 ? BPColors.Text.secondary : BPColors.Error.main)

                    BPText(
                        daysRemaining >= 0 ? "\(daysRemaining) days remaining" : "\(abs(daysRemaining)) days overdue",
                        style: .bodySmall
                    )
                    .foregroundColor(daysRemaining >= 0 ? BPColors.Text.secondary : BPColors.Error.main)

                    Spacer()
                }
            }
        }
        .bpCard()
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }

    private func formatValue(_ value: Double) -> String {
        if value.truncatingRemainder(dividingBy: 1) == 0 {
            return String(Int(value))
        } else {
            return String(format: "%.1f", value)
        }
    }
}

struct GoalProgressSection: View {
    let goal: Goal
    @Binding var showingProgressUpdate: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText("Progress", style: .sectionTitle)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                if !goal.isCompleted {
                    BPButton(
                        "Update",
                        style: .secondary,
                        size: .small
                    ) {
                        showingProgressUpdate = true
                    }
                }
            }

            // Main Progress Display
            VStack(spacing: BPSpacing.md) {
                // Circular Progress
                ZStack {
                    Circle()
                        .stroke(BPColors.Border.subtle, lineWidth: 8)
                        .frame(width: 120, height: 120)

                    Circle()
                        .trim(from: 0, to: goal.progress)
                        .stroke(BPColors.Primary.main, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                        .frame(width: 120, height: 120)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: goal.progress)

                    VStack(spacing: BPSpacing.xs) {
                        BPText("\(Int(goal.progress * 100))%", style: .heading3)
                            .foregroundColor(BPColors.Primary.main)

                        BPText("Complete", style: .labelSmall)
                            .foregroundColor(BPColors.Text.secondary)
                    }
                }

                // Current vs Target (if applicable)
                if let targetValue = goal.targetValue,
                   let currentValue = goal.currentValue,
                   let unit = goal.unit {
                    VStack(spacing: BPSpacing.sm) {
                        HStack {
                            BPText("Current Progress", style: .labelMedium)
                                .foregroundColor(BPColors.Text.secondary)

                            Spacer()

                            BPText("\(formatValue(currentValue)) / \(formatValue(targetValue)) \(unit)", style: .bodyMedium)
                                .foregroundColor(BPColors.Text.primary)
                        }

                        ProgressView(value: min(currentValue / targetValue, 1.0))
                            .progressViewStyle(LinearProgressViewStyle(tint: BPColors.Primary.main))
                            .frame(height: 6)
                    }
                }
            }
        }
        .bpCard()
    }

    private func formatValue(_ value: Double) -> String {
        if value.truncatingRemainder(dividingBy: 1) == 0 {
            return String(Int(value))
        } else {
            return String(format: "%.1f", value)
        }
    }
}

struct GoalMilestonesSection: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Binding var showingMilestoneSheet: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText("Milestones", style: .sectionTitle)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPButton(
                    "Add",
                    icon: "plus",
                    style: .secondary,
                    size: .small
                ) {
                    showingMilestoneSheet = true
                }
            }

            ForEach(goal.milestones.sorted { $0.targetDate < $1.targetDate }, id: \.id) { milestone in
                MilestoneRow(milestone: milestone, onToggle: {
                    Swift.Task {
                        try? await viewModel.toggleMilestoneCompletion(milestone)
                    }
                })
            }
        }
        .bpCard()
    }
}

struct MilestoneRow: View {
    let milestone: GoalMilestone
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Button(action: {
                onToggle()
            }) {
                Image(systemName: milestone.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(milestone.isCompleted ? BPColors.Success.main : BPColors.Text.tertiary)
            }
            .buttonStyle(PlainButtonStyle())

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(milestone.title, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.primary)
                    .strikethrough(milestone.isCompleted)

                if let details = milestone.details, !details.isEmpty {
                    BPText(details, style: .bodySmall)
                        .foregroundColor(BPColors.Text.secondary)
                }

                HStack {
                    Image(systemName: "calendar")
                        .font(.caption2)
                        .foregroundColor(BPColors.Text.tertiary)

                    BPText(formatDate(milestone.targetDate), style: .labelSmall)
                        .foregroundColor(BPColors.Text.tertiary)

                    Spacer()
                }
            }

            Spacer()
        }
        .padding(.vertical, BPSpacing.xs)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

struct GoalTasksSection: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Binding var showingAddTask: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText("Related Tasks", style: .sectionTitle)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPText("\(goal.tasks.filter { $0.isCompleted }.count)/\(goal.tasks.count)", style: .labelMedium)
                    .foregroundColor(BPColors.Text.secondary)

                BPButton(
                    "Add",
                    icon: "plus",
                    style: .secondary,
                    size: .small
                ) {
                    showingAddTask = true
                }
            }

            ForEach(goal.tasks.sorted { $0.createdAt > $1.createdAt }, id: \.id) { task in
                TaskRowInGoal(task: task)
            }
        }
        .bpCard()
    }
}

struct TaskRowInGoal: View {
    let task: Task

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.body)
                .foregroundColor(task.isCompleted ? BPColors.Success.main : BPColors.Text.tertiary)

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(task.title, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.primary)
                    .strikethrough(task.isCompleted)

                if let dueDate = task.dueDate {
                    HStack {
                        Image(systemName: "calendar")
                            .font(.caption2)
                            .foregroundColor(BPColors.Text.tertiary)

                        BPText(formatDate(dueDate), style: .labelSmall)
                            .foregroundColor(BPColors.Text.tertiary)

                        Spacer()
                    }
                }
            }

            Spacer()

            if task.priority != .medium {
                Circle()
                    .fill(Color(task.priority.color))
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.vertical, BPSpacing.xs)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}

struct GoalActionButtons: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    let onAddMilestone: () -> Void
    let onAddTask: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            HStack(spacing: BPSpacing.md) {
                BPButton(
                    "Add Milestone",
                    icon: "flag",
                    style: .secondary,
                    size: .medium
                ) {
                    onAddMilestone()
                }

                BPButton(
                    "Add Task",
                    icon: "plus.circle",
                    style: .secondary,
                    size: .medium
                ) {
                    onAddTask()
                }
            }

            HStack(spacing: BPSpacing.md) {
                if !goal.isCompleted {
                    BPButton(
                        "Mark Complete",
                        icon: "checkmark.circle.fill",
                        style: .primary,
                        size: .medium
                    ) {
                        Swift.Task {
                            try? await viewModel.completeGoal(goal)
                        }
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
struct GoalMetadataItem: View {
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

struct GoalEditView: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title: String
    @State private var description: String
    @State private var category: String
    @State private var priority: GoalPriority
    @State private var targetDate: Date
    @State private var hasTargetDate: Bool
    @State private var targetValue: String
    @State private var unit: String
    @State private var hasTargetValue: Bool

    @State private var isSaving = false

    init(goal: Goal, viewModel: GoalViewModel) {
        self.goal = goal
        self.viewModel = viewModel

        _title = State(initialValue: goal.title)
        _description = State(initialValue: goal.details ?? "")
        _category = State(initialValue: goal.category ?? "")
        _priority = State(initialValue: goal.priority)
        _targetDate = State(initialValue: goal.targetDate ?? Date())
        _hasTargetDate = State(initialValue: goal.targetDate != nil)
        _targetValue = State(initialValue: goal.targetValue != nil ? String(goal.targetValue!) : "")
        _unit = State(initialValue: goal.unit ?? "")
        _hasTargetValue = State(initialValue: goal.targetValue != nil)
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Basic Information
                    VStack(spacing: BPSpacing.md) {
                        BPTextField(
                            placeholder: "Goal title",
                            text: $title,
                            inputType: .text
                        )

                        BPTextField(
                            placeholder: "Description (optional)",
                            text: $description,
                            inputType: .multiline()
                        )

                        BPTextField(
                            placeholder: "Category (optional)",
                            text: $category,
                            inputType: .text
                        )
                    }
                    .bpCard()

                    // Priority Selection
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Priority", style: .sectionTitle)
                            .foregroundColor(BPColors.Text.primary)

                        HStack(spacing: BPSpacing.sm) {
                            ForEach(GoalPriority.allCases, id: \.self) { priorityOption in
                                BPButton(
                                    priorityOption.displayName,
                                    style: priority == priorityOption ? .primary : .secondary,
                                    size: .small
                                ) {
                                    priority = priorityOption
                                }
                            }
                        }
                    }
                    .bpCard()

                    // Target Date
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        HStack {
                            Toggle("Set target date", isOn: $hasTargetDate)
                                .toggleStyle(SwitchToggleStyle(tint: BPColors.Primary.main))

                            Spacer()
                        }

                        if hasTargetDate {
                            DatePicker(
                                "Target Date",
                                selection: $targetDate,
                                displayedComponents: [.date]
                            )
                            .datePickerStyle(CompactDatePickerStyle())
                        }
                    }
                    .bpCard()

                    // Target Value
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        HStack {
                            Toggle("Set target value", isOn: $hasTargetValue)
                                .toggleStyle(SwitchToggleStyle(tint: BPColors.Primary.main))

                            Spacer()
                        }

                        if hasTargetValue {
                            HStack(spacing: BPSpacing.md) {
                                BPTextField(
                                    placeholder: "Target value",
                                    text: $targetValue,
                                    inputType: .number
                                )

                                BPTextField(
                                    placeholder: "Unit (e.g., kg, hours)",
                                    text: $unit,
                                    inputType: .text
                                )
                            }
                        }
                    }
                    .bpCard()

                    Spacer(minLength: 100)
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationTitle("Edit Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveGoal()
                    }
                }
            }
        }
        .disabled(isSaving)
    }

    private func saveGoal() {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isSaving = true

        Swift.Task {
            do {
                // Update goal properties
                goal.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
                goal.details = description.isEmpty ? nil : description
                goal.category = category.isEmpty ? nil : category
                goal.priority = priority
                goal.targetDate = hasTargetDate ? targetDate : nil
                goal.targetValue = hasTargetValue ? Double(targetValue) : nil
                goal.unit = hasTargetValue && !unit.isEmpty ? unit : nil

                try await viewModel.updateGoal(goal)

                await MainActor.run {
                    isSaving = false
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isSaving = false
                    // Handle error
                }
            }
        }
    }
}

struct AddMilestoneView: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var targetDate = Date()
    @State private var isAdding = false

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                BPTextField(
                    placeholder: "Milestone title",
                    text: $title,
                    inputType: .text
                )

                BPTextField(
                    placeholder: "Description (optional)",
                    text: $description,
                    inputType: .multiline()
                )

                DatePicker(
                    "Target Date",
                    selection: $targetDate,
                    displayedComponents: [.date]
                )
                .datePickerStyle(WheelDatePickerStyle())

                Spacer()
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.top, BPSpacing.lg)
            .navigationTitle("Add Milestone")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addMilestone()
                    }
                }
            }
        }
        .disabled(isAdding)
    }

    private func addMilestone() {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isAdding = true

        Swift.Task {
            do {
                try await viewModel.addMilestone(
                    to: goal,
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    targetDate: targetDate,
                    description: description.isEmpty ? nil : description
                )

                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isAdding = false
                    // Handle error
                }
            }
        }
    }
}

struct UpdateProgressView: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var currentValue: String
    @State private var isUpdating = false

    init(goal: Goal, viewModel: GoalViewModel) {
        self.goal = goal
        self.viewModel = viewModel
        _currentValue = State(initialValue: goal.currentValue != nil ? String(goal.currentValue!) : "")
    }

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                if let targetValue = goal.targetValue, let unit = goal.unit {
                    VStack(spacing: BPSpacing.md) {
                        BPText("Update Progress", style: .sectionTitle)
                            .foregroundColor(BPColors.Text.primary)

                        BPText("Target: \(formatValue(targetValue)) \(unit)", style: .bodyMedium)
                            .foregroundColor(BPColors.Text.secondary)

                        BPTextField(
                            placeholder: "Current value",
                            text: $currentValue,
                            inputType: .number
                        )

                        if let current = Double(currentValue) {
                            let progress = min(current / targetValue, 1.0)
                            ProgressView(value: progress)
                                .progressViewStyle(LinearProgressViewStyle(tint: BPColors.Primary.main))
                        }
                    }
                } else {
                    BPText("This goal doesn't have a target value set.", style: .bodyMedium)
                        .foregroundColor(BPColors.Text.secondary)
                }

                Spacer()
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.top, BPSpacing.lg)
            .navigationTitle("Update Progress")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Update") {
                        updateProgress()
                    }
                }
            }
        }
        .disabled(isUpdating)
    }

    private func updateProgress() {
        guard let value = Double(currentValue) else { return }

        isUpdating = true

        Swift.Task {
            do {
                try await viewModel.updateGoalProgress(goal, newValue: value)

                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isUpdating = false
                    // Handle error
                }
            }
        }
    }

    private func formatValue(_ value: Double) -> String {
        if value.truncatingRemainder(dividingBy: 1) == 0 {
            return String(Int(value))
        } else {
            return String(format: "%.1f", value)
        }
    }
}

struct AddTaskToGoalView: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var taskTitle = ""
    @State private var isAdding = false

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                BPTextField(
                    placeholder: "Task title",
                    text: $taskTitle,
                    inputType: .text
                )

                Spacer()
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.top, BPSpacing.lg)
            .navigationTitle("Add Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addTask()
                    }
                }
            }
        }
        .disabled(isAdding)
    }

    private func addTask() {
        guard !taskTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isAdding = true

        Swift.Task {
            do {
                try await viewModel.addTaskToGoal(goal, title: taskTitle.trimmingCharacters(in: .whitespacesAndNewlines))

                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isAdding = false
                    // Handle error
                }
            }
        }
    }
}

#Preview {
    let goal = Goal(
        title: "Sample Goal",
        details: "This is a sample goal description",
        priority: .high,
        targetDate: Date(),
        targetValue: 100,
        unit: "points",
        userId: UUID()
    )

    GoalDetailView(goal: goal, dataManager: DataManager())
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}