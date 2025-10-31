import SwiftUI
import BeProductiveUI

@available(iOS 17.0, *)
struct PlanView: View {
    @StateObject private var dataManager = DataManager()
    @State private var selectedPlanType: PlanType = .tasks
    @State private var showingCreateSheet = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Planning Type Selector
                PlanTypePicker(selectedType: $selectedPlanType)

                // Content Area
                Group {
                    switch selectedPlanType {
                    case .tasks:
                        TaskListView(dataManager: dataManager)
                    case .goals:
                        GoalListView(dataManager: dataManager)
                    case .projects:
                        ProjectsListView()
                    case .habits:
                        HabitListView(dataManager: dataManager)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.large)
            .navigationTitle("Plan")
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateSheet = true }) {
                        Image(systemName: "plus")
                    }
                    
                    Button(action: {
                        // Navigate to analytics/engage tab
                    }) {
                        Image(systemName: "chart.bar.xaxis")
                    }
                }
            }
        }
        .sheet(isPresented: $showingCreateSheet) {
            QuickCreateSheet(
                selectedType: selectedPlanType,
                dataManager: dataManager
            )
        }
    }
}

@available(iOS 17.0, *)
struct PlanTypePicker: View {
    @Binding var selectedType: PlanType

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: BPSpacing.sm) {
                ForEach(PlanType.allCases, id: \.self) { type in
                    BPButton(
                        type.title,
                        icon: type.iconName,
                        style: selectedType == type ? .primary : .secondary,
                        size: .small
                    ) {
                        selectedType = type
                    }
                }
            }
            .padding(.horizontal, BPSpacing.md)
        }
    }
}

@available(iOS 17.0, *)
struct QuickCreateSheet: View {
    let selectedType: PlanType
    let dataManager: DataManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                Image(systemName: selectedType.iconName)
                    .font(.system(size: 60))
                    .foregroundColor(BPColors.Primary.main)

                BPText("Create New \(selectedType.title.dropLast())", style: .heading2)
                    .foregroundColor(BPColors.Text.primary)

                VStack(spacing: BPSpacing.md) {
                    switch selectedType {
                    case .tasks:
                        QuickCreateButton(
                            title: "Quick Task",
                            subtitle: "Simple task with title only",
                            icon: "plus.circle"
                        ) {
                            Task {
                                do {
                                    try await dataManager.createTask(
                                        title: "New Task",
                                        description: nil,
                                        priority: .medium
                                    )
                                    dismiss()
                                } catch {
                                    print("Failed to create task: \(error)")
                                }
                            }
                        }

                        QuickCreateButton(
                            title: "Detailed Task",
                            subtitle: "Full task with all options",
                            icon: "list.bullet.rectangle"
                        ) {
                            // Present detailed task creation sheet
                            dismiss()
                        }

                    case .goals:
                        QuickCreateButton(
                            title: "Quick Goal",
                            subtitle: "Simple goal with basic info",
                            icon: "target"
                        ) {
                            Task {
                                do {
                                    try await dataManager.createGoal(
                                        title: "New Goal",
                                        description: nil,
                                        category: "Personal",
                                        targetDate: Calendar.current.date(byAdding: .month, value: 1, to: Date())
                                    )
                                    dismiss()
                                } catch {
                                    print("Failed to create goal: \(error)")
                                }
                            }
                        }

                        QuickCreateButton(
                            title: "Detailed Goal",
                            subtitle: "Goal with milestones and tracking",
                            icon: "flag.checkered"
                        ) {
                            // Present detailed goal creation sheet
                            dismiss()
                        }

                    case .habits:
                        QuickCreateButton(
                            title: "Daily Habit",
                            subtitle: "Simple daily habit",
                            icon: "repeat"
                        ) {
                            Task {
                                do {
                                    try await dataManager.createHabit(
                                        title: "New Habit",
                                        description: nil,
                                        frequency: .daily
                                    )
                                    dismiss()
                                } catch {
                                    print("Failed to create habit: \(error)")
                                }
                            }
                        }

                        QuickCreateButton(
                            title: "Custom Habit",
                            subtitle: "Habit with custom frequency",
                            icon: "gear"
                        ) {
                            // Present custom habit creation sheet
                            dismiss()
                        }

                    case .projects:
                        QuickCreateButton(
                            title: "Simple Project",
                            subtitle: "Basic project setup",
                            icon: "folder.badge.plus"
                        ) {
                            Task {
                                do {
                                    try await dataManager.createProject(
                                        title: "New Project",
                                        description: nil,
                                        priority: .medium
                                    )
                                    dismiss()
                                } catch {
                                    print("Failed to create project: \(error)")
                                }
                            }
                        }

                        QuickCreateButton(
                            title: "Team Project",
                            subtitle: "Project with team collaboration",
                            icon: "person.2.badge.plus"
                        ) {
                            // Present team project creation sheet
                            dismiss()
                        }
                    }
                }

                Spacer()
            }
            .padding(.horizontal, BPSpacing.md)
            .padding(.top, BPSpacing.xl)
            .navigationTitle("Quick Create")
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

@available(iOS 17.0, *)
struct QuickCreateButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: BPSpacing.md) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(BPColors.Primary.main)
                    .frame(width: 40, height: 40)
                    .background(BPColors.Primary.main.opacity(0.1))
                    .cornerRadius(BPSpacing.sm)

                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(title, style: .bodyLarge)
                        .foregroundColor(BPColors.Text.primary)

                    BPText(subtitle, style: .bodySmall)
                        .foregroundColor(BPColors.Text.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(BPColors.Text.tertiary)
            }
            .padding(BPSpacing.md)
            .background(Color(.systemBackground))
            .cornerRadius(BPSpacing.md)
            .overlay(
                RoundedRectangle(cornerRadius: BPSpacing.md)
                    .stroke(Color(.systemGray4), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

@available(iOS 17.0, *)
struct ProjectsListView: View {
    var body: some View {
        ScrollView {
            LazyVStack(spacing: BPSpacing.sm) {
                ForEach(0..<6) { index in
                    ProjectCard(
                        title: "Sample Project \(index + 1)",
                        description: "This is a sample project description",
                        progress: Double(index) * 0.15,
                        teamSize: Int.random(in: 1...8)
                    )
                }
            }
            .padding(.horizontal, BPSpacing.md)
        }
    }
}

@available(iOS 17.0, *)
struct HabitsListView: View {
    var body: some View {
        ScrollView {
            LazyVStack(spacing: BPSpacing.sm) {
                ForEach(0..<8) { index in
                    HabitCard(
                        title: "Sample Habit \(index + 1)",
                        description: "This is a sample habit description",
                        streak: Int.random(in: 0...30),
                        isCompletedToday: index % 2 == 0
                    )
                }
            }
            .padding(.horizontal, BPSpacing.md)
        }
    }
}

// MARK: - Supporting Views
@available(iOS 17.0, *)
struct GoalCard: View {
    let title: String
    let description: String
    let progress: Double
    let category: String

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.sm) {
            HStack {
                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(title, style: .bodyLarge)
                        .foregroundColor(BPColors.Text.primary)

                    BPText(description, style: .bodySmall)
                        .foregroundColor(BPColors.Text.secondary)
                }

                Spacer()

                BPText(category, style: .labelSmall)
                    .foregroundColor(BPColors.Primary.main)
                    .padding(.horizontal, BPSpacing.xs)
                    .padding(.vertical, BPSpacing.xs)
                    .background(BPColors.Primary.main.opacity(0.1))
                    .cornerRadius(BPSpacing.xs)
            }

            // Simple progress bar
            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                HStack {
                    BPText("Progress", style: .labelSmall)
                        .foregroundColor(BPColors.Text.secondary)
                    Spacer()
                    BPText("\(Int(progress * 100))%", style: .labelSmall)
                        .foregroundColor(BPColors.Text.secondary)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(BPColors.Text.secondary.opacity(0.2))
                            .frame(height: 4)
                            .cornerRadius(2)
                        
                        Rectangle()
                            .fill(BPColors.Primary.main)
                            .frame(width: geometry.size.width * CGFloat(progress), height: 4)
                            .cornerRadius(2)
                    }
                }
                .frame(height: 4)
            }
        }
        .bpCard()
    }
}

@available(iOS 17.0, *)
struct ProjectCard: View {
    let title: String
    let description: String
    let progress: Double
    let teamSize: Int

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.sm) {
            HStack {
                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(title, style: .bodyLarge)
                        .foregroundColor(BPColors.Text.primary)

                    BPText(description, style: .bodySmall)
                        .foregroundColor(BPColors.Text.secondary)
                }

                Spacer()

                HStack(spacing: BPSpacing.xs) {
                    Image(systemName: "person.2.fill")
                        .font(.caption)
                        .foregroundColor(BPColors.Text.secondary)

                    BPText("\(teamSize)", style: .labelSmall)
                        .foregroundColor(BPColors.Text.secondary)
                }
            }

            // Simple progress bar
            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                HStack {
                    BPText("Progress", style: .labelSmall)
                        .foregroundColor(BPColors.Text.secondary)
                    Spacer()
                    BPText("\(Int(progress * 100))%", style: .labelSmall)
                        .foregroundColor(BPColors.Text.secondary)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(BPColors.Text.secondary.opacity(0.2))
                            .frame(height: 4)
                            .cornerRadius(2)
                        
                        Rectangle()
                            .fill(BPColors.Primary.main)
                            .frame(width: geometry.size.width * CGFloat(progress), height: 4)
                            .cornerRadius(2)
                    }
                }
                .frame(height: 4)
            }
        }
        .bpCard()
    }
}

@available(iOS 17.0, *)
struct HabitCard: View {
    let title: String
    let description: String
    let streak: Int
    let isCompletedToday: Bool

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Button(action: {
                // Toggle habit completion
            }) {
                Image(systemName: isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(isCompletedToday ? BPColors.Success.main : BPColors.Text.tertiary)
            }

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(title, style: .bodyLarge)
                    .foregroundColor(BPColors.Text.primary)

                BPText(description, style: .bodySmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: BPSpacing.xs) {
                BPText("\(streak)", style: .heading4)
                    .foregroundColor(BPColors.Primary.main)

                BPText("day streak", style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
            }
        }
        .bpCard()
    }
}

enum PlanType: String, CaseIterable {
    case tasks = "tasks"
    case goals = "goals"
    case projects = "projects"
    case habits = "habits"

    var title: String {
        switch self {
        case .tasks: return "Tasks"
        case .goals: return "Goals"
        case .projects: return "Projects"
        case .habits: return "Habits"
        }
    }

    var iconName: String {
        switch self {
        case .tasks: return "checkmark.circle"
        case .goals: return "target"
        case .projects: return "folder"
        case .habits: return "repeat"
        }
    }

    var searchPlaceholder: String {
        switch self {
        case .tasks: return "tasks"
        case .goals: return "goals"
        case .projects: return "projects"
        case .habits: return "habits"
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"

    var color: Color {
        switch self {
        case .low: return BPColors.Text.tertiary
        case .medium: return BPColors.Warning.main
        case .high: return BPColors.Primary.main
        case .urgent: return BPColors.Error.main
        }
    }
}

@available(iOS 17.0, *)
#Preview {
    PlanView()
        .environmentObject(BPThemeManager.shared)
}