import SwiftUI
import BeProductiveUI

struct HabitListView: View {
    @StateObject private var viewModel: HabitViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @State private var showingCreateHabit = false
    @State private var showingFilters = false
    @State private var selectedHabit: Habit?
    
    private let dataManager: DataManager

    init(dataManager: DataManager) {
        self.dataManager = dataManager
        _viewModel = StateObject(wrappedValue: HabitViewModel(dataManager: dataManager))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Habit Overview
            HabitOverviewSection(viewModel: viewModel)

            // Search and Filter Bar
            HabitSearchAndFilterBar(
                searchText: $viewModel.searchText,
                selectedFilter: $viewModel.selectedFilter,
                showingFilters: $showingFilters
            )

            // Habit List Content
            if viewModel.isLoading {
                LoadingView()
            } else if viewModel.filteredHabits.isEmpty {
                EmptyHabitsView(
                    hasAnyHabits: !viewModel.habits.isEmpty,
                    currentFilter: viewModel.selectedFilter
                ) {
                    showingCreateHabit = true
                }
            } else {
                HabitScrollView(
                    habits: viewModel.filteredHabits,
                    viewModel: viewModel,
                    selectedHabit: $selectedHabit
                )
            }
        }
        .sheet(isPresented: $showingCreateHabit) {
            CreateHabitView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingFilters) {
            HabitFiltersView(viewModel: viewModel)
        }
        .sheet(item: $selectedHabit) { habit in
            HabitDetailView(habit: habit, dataManager: dataManager)
        }
        .onAppear {
            viewModel.loadHabits()
        }
        .refreshable {
            viewModel.loadHabits()
        }
    }
}

struct HabitOverviewSection: View {
    @ObservedObject var viewModel: HabitViewModel

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            // Main Stats
            HStack(spacing: BPSpacing.lg) {
                HabitStatCard(
                    title: "Today's Progress",
                    value: "\(Int(viewModel.todayCompletionRate * 100))%",
                    subtitle: "\(viewModel.completedTodayHabits.count)/\(viewModel.activeHabits.count) completed",
                    icon: "calendar.circle.fill",
                    color: BPColors.Primary.main,
                    progress: viewModel.todayCompletionRate
                )

                HabitStatCard(
                    title: "Longest Streak",
                    value: "\(viewModel.longestActiveStreak)",
                    subtitle: "days in a row",
                    icon: "flame.fill",
                    color: BPColors.Warning.main,
                    progress: nil
                )

                HabitStatCard(
                    title: "Total Habits",
                    value: "\(viewModel.activeHabits.count)",
                    subtitle: "active habits",
                    icon: "repeat.circle.fill",
                    color: BPColors.Success.main,
                    progress: nil
                )
            }

            // Quick Stats Row
            HStack(spacing: BPSpacing.lg) {
                HabitQuickStat(
                    title: "Completed Today",
                    count: viewModel.completedTodayHabits.count,
                    color: BPColors.Success.main
                )

                HabitQuickStat(
                    title: "On Streak",
                    count: viewModel.streakHabits.count,
                    color: BPColors.Warning.main
                )

                HabitQuickStat(
                    title: "Total Completions",
                    count: viewModel.totalCompletions,
                    color: BPColors.primary
                )

                Spacer()
            }
        }
        .padding(BPSpacing.md)
        .background(BPColors.Background.secondary)
    }
}

struct HabitStatCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color
    let progress: Double?

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            HStack(spacing: BPSpacing.xs) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundColor(color)

                BPText(title, style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            BPText(value, style: .headingMedium)
                .foregroundColor(BPColors.textPrimary)

            BPText(subtitle, style: .labelSmall)
                .foregroundColor(BPColors.Text.secondary)
                .multilineTextAlignment(.center)

            if let progress = progress {
                BPProgressTracker(
                    progress: progress,
                    type: .linear,
                    showPercentage: false
                )
                .frame(height: 4)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, BPSpacing.sm)
    }
}

struct HabitQuickStat: View {
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

struct HabitSearchAndFilterBar: View {
    @Binding var searchText: String
    @Binding var selectedFilter: HabitFilter
    @Binding var showingFilters: Bool

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            // Search Bar
            BPTextField(
                placeholder: "Search habits...",
                text: $searchText,
                inputType: .search
            )
            .padding(.horizontal, BPSpacing.md)

            // Quick Filters
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: BPSpacing.sm) {
                    HabitQuickFilterButton(
                        title: "All",
                        isSelected: selectedFilter == .all
                    ) {
                        selectedFilter = .all
                    }

                    HabitQuickFilterButton(
                        title: "Active",
                        isSelected: selectedFilter == .active
                    ) {
                        selectedFilter = .active
                    }

                    HabitQuickFilterButton(
                        title: "Completed Today",
                        isSelected: selectedFilter == .completedToday
                    ) {
                        selectedFilter = .completedToday
                    }

                    HabitQuickFilterButton(
                        title: "Pending Today",
                        isSelected: selectedFilter == .pendingToday
                    ) {
                        selectedFilter = .pendingToday
                    }

                    HabitQuickFilterButton(
                        title: "On Streak",
                        isSelected: selectedFilter == .streak
                    ) {
                        selectedFilter = .streak
                    }
                }
                .padding(.horizontal, BPSpacing.md)
            }
        }
        .padding(.vertical, BPSpacing.sm)
        .background(BPColors.Background.secondary)
    }
}

struct HabitQuickFilterButton: View {
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

struct HabitScrollView: View {
    let habits: [Habit]
    @ObservedObject var viewModel: HabitViewModel
    @Binding var selectedHabit: Habit?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: BPSpacing.md) {
                ForEach(habits, id: \.id) { habit in
                    HabitCardView(habit: habit, viewModel: viewModel) {
                        selectedHabit = habit
                    }
                }
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.bottom, 100) // Safe area for floating action button
        }
    }
}

struct HabitCardView: View {
    let habit: Habit
    @ObservedObject var viewModel: HabitViewModel
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: BPSpacing.md) {
                // Header
                HStack {
                    // Habit Icon
                    ZStack {
                        Circle()
                            .fill(Color(habit.color).opacity(0.2))
                            .frame(width: 40, height: 40)

                        if let icon = habit.icon {
                            Image(systemName: icon)
                                .font(.title3)
                                .foregroundColor(Color(habit.color))
                        } else {
                            Image(systemName: "repeat")
                                .font(.title3)
                                .foregroundColor(Color(habit.color))
                        }
                    }

                    VStack(alignment: .leading, spacing: BPSpacing.xs) {
                        BPText(habit.title, style: .heading3)
                            .foregroundColor(BPColors.Text.primary)

                        if let description = habit.habitDescription, !description.isEmpty {
                            BPText(description, style: .bodySmall)
                                .foregroundColor(BPColors.Text.secondary)
                                .lineLimit(2)
                        }
                    }

                    Spacer()

                    // Completion Button
                    HabitCompletionButton(
                        habit: habit,
                        viewModel: viewModel
                    )
                }

                // Weekly Progress Visualization
                HabitWeeklyProgress(habit: habit, viewModel: viewModel)

                // Metadata
                HStack {
                    HabitMetadataChip(
                        icon: "repeat",
                        text: habit.frequency.displayName,
                        color: BPColors.Primary.main
                    )

                    if let category = habit.category {
                        HabitMetadataChip(
                            icon: "folder",
                            text: category,
                            color: BPColors.Secondary.main
                        )
                    }

                    Spacer()

                    // Streak Display
                    HStack(spacing: BPSpacing.xs) {
                        Image(systemName: "flame.fill")
                            .font(.caption)
                            .foregroundColor(habit.streak > 0 ? BPColors.Warning.main : BPColors.Text.tertiary)

                        BPText("\(habit.streak)", style: .labelMedium)
                            .foregroundColor(habit.streak > 0 ? BPColors.Warning.main : BPColors.Text.tertiary)

                        BPText("day streak", style: .labelSmall)
                            .foregroundColor(BPColors.Text.secondary)
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
            HabitContextMenu(habit: habit, viewModel: viewModel)
        }
    }
}

struct HabitCompletionButton: View {
    let habit: Habit
    @ObservedObject var viewModel: HabitViewModel

    var body: some View {
        Button(action: {
            Task {
                try? await viewModel.toggleHabitCompletion(habit)
            }
        }) {
            ZStack {
                Circle()
                    .fill(habit.isCompletedToday ? BPColors.Success.main : BPColors.Background.secondary)
                    .frame(width: 50, height: 50)

                Circle()
                    .stroke(habit.isCompletedToday ? BPColors.Success.main : BPColors.Border.subtle, lineWidth: 2)
                    .frame(width: 50, height: 50)

                if habit.isCompletedToday {
                    Image(systemName: "checkmark")
                        .font(.title3)
                        .foregroundColor(.white)
                } else {
                    BPText("\(habit.targetCount)", style: .labelMedium)
                        .foregroundColor(BPColors.Text.secondary)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct HabitWeeklyProgress: View {
    let habit: Habit
    @ObservedObject var viewModel: HabitViewModel

    var body: some View {
        let weekData = viewModel.getWeeklyData(for: habit)

        HStack(spacing: BPSpacing.xs) {
            ForEach(Array(weekData.enumerated()), id: \.offset) { index, dayData in
                VStack(spacing: BPSpacing.xs) {
                    BPText(formatWeekday(dayData.date), style: .labelSmall)
                        .foregroundColor(BPColors.Text.tertiary)

                    Circle()
                        .fill(dayData.isCompleted ? Color(habit.color) : BPColors.Background.secondary)
                        .frame(width: 24, height: 24)
                        .overlay(
                            Circle()
                                .stroke(
                                    dayData.isToday ? BPColors.Primary.main : BPColors.Border.subtle,
                                    lineWidth: dayData.isToday ? 2 : 1
                                )
                        )
                        .overlay(
                            Group {
                                if dayData.isCompleted && dayData.count > 1 {
                                    BPText("\(dayData.count)", style: .labelSmall)
                                        .foregroundColor(.white)
                                }
                            }
                        )
                }
            }
        }
    }

    private func formatWeekday(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "E"
        return String(formatter.string(from: date).prefix(1))
    }
}

struct HabitMetadataChip: View {
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

struct HabitContextMenu: View {
    let habit: Habit
    @ObservedObject var viewModel: HabitViewModel

    var body: some View {
        Button(action: {
            Task {
                try? await viewModel.toggleHabitCompletion(habit)
            }
        }) {
            Label(habit.isCompletedToday ? "Mark Incomplete" : "Mark Complete",
                  systemImage: habit.isCompletedToday ? "circle" : "checkmark.circle")
        }

        if habit.isActive {
            Button(action: {
                Task {
                    try? await viewModel.pauseHabit(habit)
                }
            }) {
                Label("Pause Habit", systemImage: "pause.circle")
            }
        } else {
            Button(action: {
                Task {
                    try? await viewModel.resumeHabit(habit)
                }
            }) {
                Label("Resume Habit", systemImage: "play.circle")
            }
        }

        Button(action: {
            // Add note or custom completion
        }) {
            Label("Add Note", systemImage: "note.text")
        }

        Button(action: {
            // Share habit
        }) {
            Label("Share", systemImage: "square.and.arrow.up")
        }

        Divider()

        Button(role: .destructive, action: {
            Task {
                try? await viewModel.deleteHabit(habit)
            }
        }) {
            Label("Delete", systemImage: "trash")
        }
    }
}

struct EmptyHabitsView: View {
    let hasAnyHabits: Bool
    let currentFilter: HabitFilter
    let onCreateHabit: () -> Void

    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            Image(systemName: hasAnyHabits ? "line.horizontal.3.decrease.circle" : "repeat")
                .font(.system(size: 60))
                .foregroundColor(BPColors.Text.tertiary)

            VStack(spacing: BPSpacing.sm) {
                BPText(emptyTitle, style: .heading2)
                    .foregroundColor(BPColors.Text.primary)

                BPText(emptySubtitle, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.secondary)
                    .multilineTextAlignment(.center)
            }

            if !hasAnyHabits {
                BPButton(
                    "Create Your First Habit",
                    icon: "plus.circle.fill",
                    style: .primary,
                    size: .large
                ) {
                    onCreateHabit()
                }
            }
        }
        .padding(.horizontal, BPSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyTitle: String {
        if hasAnyHabits {
            return "No habits match your filter"
        } else {
            return "No habits yet"
        }
    }

    private var emptySubtitle: String {
        if hasAnyHabits {
            return "Try adjusting your search or filter criteria to find what you're looking for."
        } else {
            return "Build positive habits that stick. Start with small, consistent actions that compound over time."
        }
    }
}

struct CreateHabitView: View {
    @ObservedObject var viewModel: HabitViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var category = ""
    @State private var frequency: HabitFrequency = .daily
    @State private var targetCount = 1
    @State private var selectedIcon = "repeat"
    @State private var selectedColor = "blue"
    @State private var isCreating = false

    private let availableIcons = [
        "repeat", "heart.fill", "book.fill", "dumbbell.fill", "moon.fill",
        "cup.and.saucer.fill", "leaf.fill", "drop.fill", "flame.fill",
        "bolt.fill", "star.fill", "music.note", "paintbrush.fill"
    ]

    private let availableColors = [
        "blue", "green", "orange", "red", "purple", "pink", "yellow", "teal"
    ]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Basic Information
                    VStack(spacing: BPSpacing.md) {
                        BPTextField(
                            placeholder: "Habit title",
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
                    .padding(BPSpacing.md)
                    .background(BPColors.Background.card)
                    .cornerRadius(BPSpacing.md)

                    // Frequency and Target
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Frequency", style: .heading3)
                            .foregroundColor(BPColors.Text.primary)

                        HStack(spacing: BPSpacing.sm) {
                            ForEach(HabitFrequency.allCases, id: \.self) { freq in
                                BPButton(
                                    title: freq.displayName,
                                    style: frequency == freq ? .primary : .secondary,
                                    size: .small
                                ) {
                                    frequency = freq
                                }
                            }
                        }

                        HStack {
                            BPText("Target per day:", style: .bodyMedium)
                                .foregroundColor(BPColors.Text.primary)

                            Stepper(value: $targetCount, in: 1...10) {
                                BPText("\(targetCount)", style: .bodyMedium)
                                    .foregroundColor(BPColors.Primary.main)
                            }
                        }
                    }
                    .padding(BPSpacing.md)
                    .background(BPColors.Background.card)
                    .cornerRadius(BPSpacing.md)

                    // Icon Selection
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Icon", style: .heading3)
                            .foregroundColor(BPColors.Text.primary)

                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: BPSpacing.sm) {
                            ForEach(availableIcons, id: \.self) { icon in
                                Button(action: {
                                    selectedIcon = icon
                                }) {
                                    Image(systemName: icon)
                                        .font(.title2)
                                        .foregroundColor(selectedIcon == icon ? .white : BPColors.Text.secondary)
                                        .frame(width: 40, height: 40)
                                        .background(selectedIcon == icon ? BPColors.Primary.main : BPColors.Background.secondary)
                                        .cornerRadius(BPSpacing.sm)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                    .padding(BPSpacing.md)
                    .background(BPColors.Background.card)
                    .cornerRadius(BPSpacing.md)

                    // Color Selection
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Color", style: .heading3)
                            .foregroundColor(BPColors.Text.primary)

                        HStack(spacing: BPSpacing.sm) {
                            ForEach(availableColors, id: \.self) { color in
                                Button(action: {
                                    selectedColor = color
                                }) {
                                    Circle()
                                        .fill(Color(color))
                                        .frame(width: 30, height: 30)
                                        .overlay(
                                            Circle()
                                                .stroke(selectedColor == color ? BPColors.Primary.main : Color.clear, lineWidth: 3)
                                        )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }

                            Spacer()
                        }
                    }
                    .padding(BPSpacing.md)
                    .background(BPColors.Background.card)
                    .cornerRadius(BPSpacing.md)

                    Spacer(minLength: 100)
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationTitle("New Habit")
            .navigationBarBackButtonHidden(false)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createHabit()
                    }
                }
            }
        }
        .disabled(isCreating)
    }

    private func createHabit() {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isCreating = true

        Task {
            do {
                try await viewModel.createHabit(
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.isEmpty ? nil : description,
                    frequency: frequency,
                    targetCount: targetCount,
                    category: category.isEmpty ? nil : category,
                    icon: selectedIcon,
                    color: selectedColor
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

struct HabitFiltersView: View {
    @ObservedObject var viewModel: HabitViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Sort Options
                    VStack(alignment: .leading, spacing: BPSpacing.md) {
                        BPText("Sort By", style: .heading3)
                            .foregroundColor(BPColors.Text.primary)

                        ForEach(HabitSort.allCases, id: \.self) { sort in
                            HabitFilterOptionRow(
                                title: sort.displayName,
                                isSelected: viewModel.selectedSort == sort
                            ) {
                                viewModel.updateSort(sort)
                            }
                        }
                    }
                    .padding(BPSpacing.md)
                    .background(BPColors.Background.card)
                    .cornerRadius(BPSpacing.md)
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Filters & Sort")
            .navigationBarBackButtonHidden(false)
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

struct HabitFilterOptionRow: View {
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
    HabitListView(dataManager: DataManager())
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}