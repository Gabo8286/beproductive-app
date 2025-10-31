import SwiftUI
import BeProductiveUI

struct GoalListView: View {
    @StateObject private var viewModel: GoalViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @State private var showingCreateGoal = false
    @State private var showingFilters = false
    @State private var selectedGoal: Goal?

    init(dataManager: DataManager) {
        _viewModel = StateObject(wrappedValue: GoalViewModel(dataManager: dataManager))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Progress Overview
            GoalProgressOverview(viewModel: viewModel)

            // Search and Filter Bar
            GoalSearchAndFilterBar(
                searchText: $viewModel.searchText,
                selectedFilter: $viewModel.selectedFilter,
                showingFilters: $showingFilters
            )

            // Goal List Content
            if viewModel.isLoading {
                LoadingView()
            } else if viewModel.filteredGoals.isEmpty {
                EmptyGoalsView(
                    hasAnyGoals: !viewModel.goals.isEmpty,
                    currentFilter: viewModel.selectedFilter
                ) {
                    showingCreateGoal = true
                }
            } else {
                GoalScrollView(
                    goals: viewModel.filteredGoals,
                    viewModel: viewModel,
                    selectedGoal: $selectedGoal
                )
            }
        }
        .sheet(isPresented: $showingCreateGoal) {
            CreateGoalView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingFilters) {
            GoalFiltersView(viewModel: viewModel)
        }
        .sheet(item: $selectedGoal) { goal in
            GoalDetailView(goal: goal, dataManager: viewModel.dataManager)
        }
        .onAppear {
            viewModel.loadGoals()
        }
        .refreshable {
            viewModel.loadGoals()
        }
    }
}

struct GoalProgressOverview: View {
    @ObservedObject var viewModel: GoalViewModel

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            HStack(spacing: BPSpacing.lg) {
                ProgressMetric(
                    title: "Overall Progress",
                    value: "\(Int(viewModel.overallProgress * 100))%",
                    progress: viewModel.overallProgress,
                    icon: "target",
                    color: BPColors.Primary.main
                )

                ProgressMetric(
                    title: "Completion Rate",
                    value: "\(Int(viewModel.completionRate * 100))%",
                    progress: viewModel.completionRate,
                    icon: "checkmark.circle.fill",
                    color: BPColors.Success.main
                )

                ProgressMetric(
                    title: "Active Goals",
                    value: "\(viewModel.activeGoals.count)",
                    progress: nil,
                    icon: "play.circle.fill",
                    color: BPColors.Warning.main
                )
            }

            // Quick Stats
            HStack(spacing: BPSpacing.lg) {
                QuickStatChip(
                    title: "Overdue",
                    count: viewModel.overdueGoals.count,
                    color: BPColors.Error.main
                )

                QuickStatChip(
                    title: "This Month",
                    count: viewModel.thisMonthGoals.count,
                    color: BPColors.Primary.main
                )

                QuickStatChip(
                    title: "Completed",
                    count: viewModel.completedGoals.count,
                    color: BPColors.Success.main
                )

                Spacer()
            }
        }
        .padding(BPSpacing.md)
        .background(BPColors.Background.secondary)
    }
}

struct ProgressMetric: View {
    let title: String
    let value: String
    let progress: Double?
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            HStack(spacing: BPSpacing.xs) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundColor(color)

                BPText(title, style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            BPText(value, style: .heading5)
                .foregroundColor(BPColors.Text.primary)

            if let progress = progress {
                BPProgressTracker(
                    title: title,
                    currentValue: progress,
                    targetValue: 1.0,
                    style: .linear,
                    showPercentage: false
                )
                .frame(height: 4)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct QuickStatChip: View {
    let title: String
    let count: Int
    let color: Color

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            BPText("\(count)", style: .labelMedium)
                .foregroundColor(color)

            BPText(title, style: .labelSmall)
                .foregroundColor(BPColors.Text.secondary)
        }
        .padding(.horizontal, BPSpacing.sm)
        .padding(.vertical, BPSpacing.xs)
        .background(color.opacity(0.1))
        .cornerRadius(BPSpacing.sm)
    }
}

struct GoalSearchAndFilterBar: View {
    @Binding var searchText: String
    @Binding var selectedFilter: GoalFilter
    @Binding var showingFilters: Bool

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            // Search Bar
            BPTextField(
                placeholder: "Search goals...",
                text: $searchText,
                inputType: .search
            )
            .padding(.horizontal, BPSpacing.md)

            // Quick Filters
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: BPSpacing.sm) {
                    GoalQuickFilterButton(
                        title: "All",
                        isSelected: selectedFilter == .all
                    ) {
                        selectedFilter = .all
                    }

                    GoalQuickFilterButton(
                        title: "Active",
                        isSelected: selectedFilter == .active
                    ) {
                        selectedFilter = .active
                    }

                    GoalQuickFilterButton(
                        title: "This Month",
                        isSelected: selectedFilter == .thisMonth
                    ) {
                        selectedFilter = .thisMonth
                    }

                    GoalQuickFilterButton(
                        title: "Overdue",
                        isSelected: selectedFilter == .overdue
                    ) {
                        selectedFilter = .overdue
                    }

                    GoalQuickFilterButton(
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
        .background(BPColors.Background.secondary)
    }
}

struct GoalQuickFilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        BPButton(
            title,
            style: isSelected ? .primary : .ghost,
            size: .small
        ) {
            action()
        }
    }
}

struct GoalScrollView: View {
    let goals: [Goal]
    @ObservedObject var viewModel: GoalViewModel
    @Binding var selectedGoal: Goal?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: BPSpacing.md) {
                ForEach(goals, id: \.id) { goal in
                    GoalCardView(goal: goal, viewModel: viewModel) {
                        selectedGoal = goal
                    }
                }
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.bottom, 100) // Safe area for floating action button
        }
    }
}

struct GoalCardView: View {
    let goal: Goal
    @ObservedObject var viewModel: GoalViewModel
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: BPSpacing.md) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: BPSpacing.xs) {
                        BPText(goal.title, style: .cardTitle)
                            .foregroundColor(BPColors.Text.primary)

                        if let description = goal.details, !description.isEmpty {
                            BPText(description, style: .bodySmall)
                                .foregroundColor(BPColors.Text.secondary)
                                .lineLimit(2)
                        }
                    }

                    Spacer()

                    GoalStatusBadge(status: goal.status)
                }

                // Progress Section
                VStack(alignment: .leading, spacing: BPSpacing.sm) {
                    HStack {
                        BPText("Progress", style: .labelMedium)
                            .foregroundColor(BPColors.Text.secondary)

                        Spacer()

                        BPText("\(Int(goal.progress * 100))%", style: .labelMedium)
                            .foregroundColor(BPColors.Primary.main)
                    }

                    BPProgressTracker(
                        title: "Progress",
                        currentValue: goal.progress,
                        targetValue: 1.0,
                        style: .linear,
                        showPercentage: false
                    )
                    .frame(height: 8)

                    if let targetValue = goal.targetValue,
                       let currentValue = goal.currentValue,
                       let unit = goal.unit {
                        HStack {
                            BPText("\(formatValue(currentValue)) / \(formatValue(targetValue)) \(unit)", style: .bodySmall)
                                .foregroundColor(BPColors.Text.secondary)

                            Spacer()
                        }
                    }
                }

                // Metadata
                HStack {
                    if let category = goal.category {
                        GoalMetadataChip(
                            icon: "folder",
                            text: category,
                            color: BPColors.Primary.main
                        )
                    }

                    if let targetDate = goal.targetDate {
                        GoalMetadataChip(
                            icon: "calendar",
                            text: formatDueDate(targetDate),
                            color: goal.isOverdue ? BPColors.Error.main : BPColors.Text.secondary
                        )
                    }

                    if goal.priority != .medium {
                        GoalMetadataChip(
                            icon: "exclamationmark.triangle.fill",
                            text: goal.priority.displayName,
                            color: Color(goal.priority.color)
                        )
                    }

                    Spacer()

                    if !goal.tasks.isEmpty {
                        let completedTasks = goal.tasks.filter { $0.isCompleted }.count
                        GoalMetadataChip(
                            icon: "checkmark.circle",
                            text: "\(completedTasks)/\(goal.tasks.count) tasks",
                            color: BPColors.Text.secondary
                        )
                    }
                }

                // Milestones preview (if any)
                if !goal.milestones.isEmpty {
                    let upcomingMilestones = goal.milestones
                        .filter { !$0.isCompleted }
                        .sorted { $0.targetDate < $1.targetDate }
                        .prefix(2)

                    if !upcomingMilestones.isEmpty {
                        VStack(alignment: .leading, spacing: BPSpacing.xs) {
                            BPText("Upcoming Milestones", style: .labelMedium)
                                .foregroundColor(BPColors.Text.secondary)

                            ForEach(Array(upcomingMilestones), id: \.id) { milestone in
                                HStack {
                                    Image(systemName: "flag")
                                        .font(.caption)
                                        .foregroundColor(BPColors.Warning.main)

                                    BPText(milestone.title, style: .bodySmall)
                                        .foregroundColor(BPColors.Text.primary)

                                    Spacer()

                                    BPText(formatDate(milestone.targetDate), style: .labelSmall)
                                        .foregroundColor(BPColors.Text.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .padding(BPSpacing.md)
            .background(BPColors.Background.primary)
            .cornerRadius(BPSpacing.md)
            .overlay(
                RoundedRectangle(cornerRadius: BPSpacing.md)
                    .stroke(BPColors.Border.default, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .contextMenu {
            if !goal.isCompleted {
                Button(action: {
                    Task.detached {
                        try? await viewModel.completeGoal(goal)
                    }
                }) {
                    Label("Mark Complete", systemImage: "checkmark.circle")
                }
            }

            Button(action: {
                // Add milestone
            }) {
                Label("Add Milestone", systemImage: "flag")
            }

            Button(action: {
                // Add task
            }) {
                Label("Add Task", systemImage: "plus.circle")
            }

            Button(action: {
                // Share goal
            }) {
                Label("Share", systemImage: "square.and.arrow.up")
            }

            Divider()

            Button(role: .destructive, action: {
                Task.detached {
                    try? await viewModel.deleteGoal(goal)
                }
            }) {
                Label("Delete", systemImage: "trash")
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

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}

struct GoalStatusBadge: View {
    let status: GoalStatus

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            Circle()
                .fill(Color(status.color))
                .frame(width: 8, height: 8)

            BPText(status.displayName, style: .labelSmall)
                .foregroundColor(Color(status.color))
        }
        .padding(.horizontal, BPSpacing.sm)
        .padding(.vertical, BPSpacing.xs)
        .background(Color(status.color).opacity(0.1))
        .cornerRadius(BPSpacing.xs)
    }
}

struct GoalMetadataChip: View {
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



struct EmptyGoalsView: View {
    let hasAnyGoals: Bool
    let currentFilter: GoalFilter
    let onCreateGoal: () -> Void

    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            Image(systemName: hasAnyGoals ? "line.horizontal.3.decrease.circle" : "target")
                .font(.system(size: 60))
                .foregroundColor(BPColors.Text.tertiary)

            VStack(spacing: BPSpacing.sm) {
                BPText(emptyTitle, style: .heading3)
                    .foregroundColor(BPColors.Text.primary)

                BPText(emptySubtitle, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.secondary)
                    .multilineTextAlignment(.center)
            }

            if !hasAnyGoals {
                BPButton(
                    "Create Your First Goal",
                    icon: "plus.circle.fill",
                    style: .primary,
                    size: .large
                ) {
                    onCreateGoal()
                }
            }
        }
        .padding(.horizontal, BPSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyTitle: String {
        if hasAnyGoals {
            return "No goals match your filter"
        } else {
            return "No goals yet"
        }
    }

    private var emptySubtitle: String {
        if hasAnyGoals {
            return "Try adjusting your search or filter criteria to find what you're looking for."
        } else {
            return "Set meaningful goals to guide your productivity journey. Break down your aspirations into achievable targets."
        }
    }
}

struct CreateGoalView: View {
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var category = ""
    @State private var priority: GoalPriority = .medium
    @State private var targetDate = Date()
    @State private var hasTargetDate = false
    @State private var targetValue = ""
    @State private var unit = ""
    @State private var hasTargetValue = false
    @State private var isCreating = false

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
            .navigationTitle("New Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createGoal()
                    }
                }
            }
        }
        .disabled(isCreating)
    }

    private func createGoal() {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isCreating = true

        Task { @MainActor in
            do {
                let targetValueDouble: Double? = {
                    if hasTargetValue, let value = Double(targetValue), value > 0 {
                        return value
                    }
                    return nil
                }()

                try await viewModel.createGoal(
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.isEmpty ? nil : description,
                    category: category.isEmpty ? nil : category,
                    priority: priority,
                    targetDate: hasTargetDate ? targetDate : nil,
                    targetValue: targetValueDouble,
                    unit: hasTargetValue && !unit.isEmpty ? unit : nil
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

struct GoalFiltersView: View {
    @ObservedObject var viewModel: GoalViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Sort Options
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Sort By", style: .sectionTitle)
                            .foregroundColor(BPColors.Text.primary)

                        ForEach(GoalSort.allCases, id: \.self) { sort in
                            GoalFilterOptionRow(
                                title: sort.displayName,
                                isSelected: viewModel.selectedSort == sort
                            ) {
                                viewModel.updateSort(sort)
                            }
                        }
                    }
                    .bpCard()
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationTitle("Filters & Sort")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct GoalFilterOptionRow: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                BPText(title, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.body)
                        .foregroundColor(BPColors.Primary.main)
                }
            }
            .padding(.vertical, BPSpacing.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    GoalListView(dataManager: DataManager())
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}