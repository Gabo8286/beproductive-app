import SwiftUI
import SwiftData
import BeProductiveUI
import Foundation

// Disambiguate the Habit type to use our SwiftData model
typealias AppHabit = Habit

@available(iOS 17.0, macOS 14.0, *)
struct HabitDetailView: View {
    @Bindable var habit: AppHabit
    @StateObject private var viewModel: HabitViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @Environment(\.dismiss) private var dismiss

    @State private var isEditing = false
    @State private var showingDeleteAlert = false
    @State private var showingCompletionSheet = false
    @State private var showingStatsView = false
    @State private var selectedTimeframe: HabitTimeframe = .week

    init(habit: AppHabit, dataManager: DataManager) {
        self.habit = habit
        self._viewModel = StateObject(wrappedValue: HabitViewModel(dataManager: dataManager))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) { // BPSpacing.lg = 16
                // Header Section
                HabitHeaderSection(habit: habit, isEditing: $isEditing)

                // Quick Actions
                HabitQuickActions(habit: habit, viewModel: viewModel, showingCompletionSheet: $showingCompletionSheet)

                // Streak and Stats
                HabitStreakSection(habit: habit, viewModel: viewModel)

                // Progress Visualization
                HabitProgressVisualization(
                    habit: habit,
                    viewModel: viewModel,
                    selectedTimeframe: $selectedTimeframe
                )

                // Recent Activity
                HabitRecentActivity(habit: habit)

                // Action Buttons
                HabitActionButtons(
                    habit: habit,
                    viewModel: viewModel,
                    onViewStats: { showingStatsView = true },
                    onDelete: { showingDeleteAlert = true }
                )
            }
            .padding(.horizontal, 12) // BPSpacing.md = 12
        }
        .navigationTitle("Habit Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: { isEditing = true }) {
                    Image(systemName: "pencil")
                }
                Button(action: { shareHabit() }) {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .sheet(isPresented: $isEditing) {
            HabitEditView(habit: habit, viewModel: viewModel)
        }
        .sheet(isPresented: $showingCompletionSheet) {
            HabitCompletionSheet(habit: habit, viewModel: viewModel)
        }
        .sheet(isPresented: $showingStatsView) {
            HabitStatsView(habit: habit, viewModel: viewModel)
        }
        .alert("Delete Habit", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteHabit()
            }
        } message: {
            Text("Are you sure you want to delete this habit? This action cannot be undone.")
        }
    }

    private func shareHabit() {
        let shareText = "Check out my \(habit.title) habit! Current streak: \(habit.streak) days. #BeProductive"
        
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            return
        }
        
        let activityViewController = UIActivityViewController(
            activityItems: [shareText],
            applicationActivities: nil
        )
        
        // For iPad support
        if let popover = activityViewController.popoverPresentationController {
            popover.sourceView = window
            popover.sourceRect = CGRect(x: window.bounds.midX, y: window.bounds.midY, width: 0, height: 0)
            popover.permittedArrowDirections = []
        }
        
        rootViewController.present(activityViewController, animated: true)
    }

    private func deleteHabit() {
        Swift.Task {
            do {
                try await viewModel.deleteHabit(habit)
                await MainActor.run {
                    dismiss()
                }
            } catch {
                print("Failed to delete habit: \(error.localizedDescription)")
            }
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitHeaderSection: View {
    @Bindable var habit: AppHabit
    @Binding var isEditing: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                // Habit Icon
                ZStack {
                    Circle()
                        .fill(Color(habit.color).opacity(0.2))
                        .frame(width: 60, height: 60)

                    if let icon = habit.icon {
                        Image(systemName: icon)
                            .font(.title)
                            .foregroundColor(Color(habit.color))
                    } else {
                        Image(systemName: "repeat")
                            .font(.title)
                            .foregroundColor(Color(habit.color))
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    BPText(habit.title, style: .heading1)
                        .foregroundColor(.primary)

                    if let description = habit.habitDescription, !description.isEmpty {
                        BPText(description, style: .bodyMedium)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                // Status Badge
                HabitStatusBadge(habit: habit)
            }

            // Metadata Row
            HStack {
                HabitMetadataItem(
                    icon: "repeat",
                    text: habit.frequency.displayName,
                    color: .blue
                )

                if habit.targetCount > 1 {
                    HabitMetadataItem(
                        icon: "target",
                        text: "\(habit.targetCount) times",
                        color: .orange
                    )
                }

                if let category = habit.category {
                    HabitMetadataItem(
                        icon: "folder",
                        text: category,
                        color: .purple
                    )
                }

                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitStatusBadge: View {
    @Bindable var habit: AppHabit

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(habit.isActive ? Color.green : Color.orange)
                .frame(width: 8, height: 8)

            BPText(habit.isActive ? "Active" : "Paused", style: .labelSmall)
                .foregroundColor(habit.isActive ? Color.green : Color.orange)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background((habit.isActive ? Color.green : Color.orange).opacity(0.1))
        .cornerRadius(4)
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitQuickActions: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    @Binding var showingCompletionSheet: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            BPText("Today's Progress", style: .heading3)
                .foregroundColor(.primary)

            HStack(spacing: 16) {
                // Completion Status
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(habit.isCompletedToday ? Color.green : Color(.systemGray5))
                            .frame(width: 80, height: 80)

                        Circle()
                            .stroke(habit.isCompletedToday ? Color.green : Color(.systemGray3), lineWidth: 3)
                            .frame(width: 80, height: 80)

                        if habit.isCompletedToday {
                            Image(systemName: "checkmark")
                                .font(.title)
                                .foregroundColor(Color.white)
                        } else {
                            VStack(spacing: 4) {
                                BPText("\(habit.targetCount)", style: .heading5)
                                    .foregroundColor(.secondary)

                                BPText("times", style: .labelSmall)
                                    .foregroundColor(Color.primary.opacity(0.6))
                            }
                        }
                    }

                    BPText(habit.isCompletedToday ? "Completed" : "Pending", style: .labelMedium)
                        .foregroundColor(habit.isCompletedToday ? Color.green : Color.secondary)
                }

                // Quick Action Buttons
                VStack(spacing: 8) {
                    BPButton(
                        habit.isCompletedToday ? "Mark Incomplete" : "Mark Complete",
                        icon: habit.isCompletedToday ? "minus.circle" : "checkmark.circle.fill",
                        style: habit.isCompletedToday ? .secondary : .primary,
                        size: .medium
                    ) {
                        Swift.Task {
                            try? await viewModel.toggleHabitCompletion(habit)
                        }
                    }

                    BPButton(
                        "Add Details",
                        icon: "note.text",
                        style: .secondary,
                        size: .medium
                    ) {
                        showingCompletionSheet = true
                    }
                }

                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// Simplified version of remaining components for compilation
@available(iOS 17.0, macOS 14.0, *)
struct HabitStreakSection: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            BPText("Statistics", style: .heading3)
                .foregroundColor(.primary)
            
            Text("Current Streak: \(habit.streak) days")
                .font(.headline)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitProgressVisualization: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    @Binding var selectedTimeframe: HabitTimeframe

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            BPText("Progress", style: .heading3)
                .foregroundColor(.primary)
            
            Text("Progress visualization coming soon")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitRecentActivity: View {
    @Bindable var habit: AppHabit

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            BPText("Recent Activity", style: .heading3)
                .foregroundColor(.primary)

            let recentCompletions = habit.completions
                .sorted { $0.date > $1.date }
                .prefix(5)

            if recentCompletions.isEmpty {
                BPText("No recent activity", style: .bodyMedium)
                    .foregroundColor(.secondary)
            } else {
                ForEach(Array(recentCompletions), id: \.id) { completion in
                    HabitActivityRow(completion: completion)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitActivityRow: View {
    let completion: HabitCompletion

    var body: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
                .font(.title3)
                .foregroundColor(Color.green)

            VStack(alignment: .leading, spacing: 4) {
                BPText("Completed \(completion.count) time\(completion.count == 1 ? "" : "s")", style: .bodyMedium)
                    .foregroundColor(.primary)

                if let notes = completion.notes, !notes.isEmpty {
                    BPText(notes, style: .bodySmall)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }

            Spacer()

            BPText(formatDate(completion.date), style: .labelMedium)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitActionButtons: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    let onViewStats: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                BPButton(
                    "View Full Stats",
                    icon: "chart.bar.xaxis",
                    style: .secondary,
                    size: .medium
                ) {
                    onViewStats()
                }

                BPButton(
                    habit.isActive ? "Pause Habit" : "Resume Habit",
                    icon: habit.isActive ? "pause.circle" : "play.circle",
                    style: .secondary,
                    size: .medium
                ) {
                    Swift.Task {
                        if habit.isActive {
                            try? await viewModel.pauseHabit(habit)
                        } else {
                            try? await viewModel.resumeHabit(habit)
                        }
                    }
                }
            }

            BPButton(
                "Delete Habit",
                icon: "trash",
                style: .destructive,
                size: .medium
            ) {
                onDelete()
            }
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitMetadataItem: View {
    let icon: String
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(color)

            BPText(text, style: .labelSmall)
                .foregroundColor(color)
        }
    }
}

// Simplified versions of edit views for compilation
@available(iOS 17.0, macOS 14.0, *)
struct HabitEditView: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                Text("Edit Habit")
                    .font(.largeTitle)
                Spacer()
                Button("Save") {
                    dismiss()
                }
            }
            .navigationTitle("Edit Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitCompletionSheet: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                Text("Add Completion")
                    .font(.largeTitle)
                Spacer()
                Button("Add") {
                    dismiss()
                }
            }
            .navigationTitle("Add Completion")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitStatsView: View {
    @Bindable var habit: AppHabit
    @ObservedObject var viewModel: HabitViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                Text("Habit Statistics")
                    .font(.largeTitle)
                Spacer()
                Text("Coming soon: Detailed analytics and trends")
                    .foregroundColor(.secondary)
                Spacer()
            }
            .navigationTitle("Habit Statistics")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

enum HabitTimeframe: String, CaseIterable {
    case week = "week"
    case month = "month"

    var displayName: String {
        switch self {
        case .week: return "Week"
        case .month: return "Month"
        }
    }
}

#Preview {
    if #available(iOS 17.0, macOS 14.0, *) {
        // Create a mock habit for preview
        let previewHabit = AppHabit(
            title: "Morning Exercise",
            description: "Start the day with 30 minutes of exercise",
            frequency: HabitFrequency.daily,
            targetCount: 1,
            category: "Health",
            icon: "dumbbell.fill",
            color: "blue",
            userId: UUID()
        )

        // Create a mock DataManager for preview
        let previewDataManager = DataManager()

        HabitDetailView(habit: previewHabit, dataManager: previewDataManager)
            .environmentObject(AppCoordinator())
    } else {
        Text("Habit details are only available on iOS 17+")
            .foregroundColor(.secondary)
    }
}