import SwiftUI
import SwiftData
import BeProductiveUI

@available(iOS 17.0, macOS 14.0, *)
struct HabitDetailView_Legacy: View {
    @Bindable var habit: Habit
    @StateObject private var viewModel: HabitViewModel
    @EnvironmentObject var appCoordinator: AppCoordinator
    @Environment(\.dismiss) private var dismiss

    @State private var isEditing = false
    @State private var showingDeleteAlert = false
    @State private var showingCompletionSheet = false
    @State private var showingStatsView = false
    @State private var selectedTimeframe: HabitTimeframe = .week

    init(habit: Habit, dataManager: DataManager) {
        self.habit = habit
        self._viewModel = StateObject(wrappedValue: HabitViewModel(dataManager: dataManager))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) { // BPSpacing.lg = 16
                // Header Section
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        if let icon = habit.icon {
                            Image(systemName: icon)
                                .font(.largeTitle)
                                .foregroundColor(Color(habit.color))
                        }
                        
                        VStack(alignment: .leading) {
                            Text(habit.title)
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            if let description = habit.habitDescription {
                                Text(description)
                                    .font(.body)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Quick Actions
                HStack(spacing: 12) {
                    Button(action: {
                        if habit.isCompletedToday {
                            habit.removeCompletion(on: Date())
                        } else {
                            habit.markCompleted()
                        }
                    }) {
                        HStack {
                            Image(systemName: habit.isCompletedToday ? "checkmark.circle.fill" : "circle")
                            Text(habit.isCompletedToday ? "Completed" : "Mark Complete")
                        }
                        .padding()
                        .background(habit.isCompletedToday ? Color.green : Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal)

                // Streak and Stats
                VStack(spacing: 12) {
                    HStack {
                        VStack {
                            Text("\(habit.streak)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Current Streak")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        VStack {
                            Text("\(habit.longestStreak)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Best Streak")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        VStack {
                            Text("\(habit.totalCompletions)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("Total")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }

                // Progress Visualization
                VStack(alignment: .leading, spacing: 12) {
                    Text("Progress")
                        .font(.headline)
                    
                    Picker("Timeframe", selection: $selectedTimeframe) {
                        ForEach(HabitTimeframe.allCases, id: \.self) { timeframe in
                            Text(timeframe.displayName).tag(timeframe)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // Placeholder for chart
                    Rectangle()
                        .fill(Color(.systemGray5))
                        .frame(height: 120)
                        .cornerRadius(8)
                        .overlay(
                            Text("Progress Chart")
                                .foregroundColor(.secondary)
                        )
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Action Buttons
                VStack(spacing: 12) {
                    Button("View Detailed Stats") {
                        showingStatsView = true
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    
                    Button("Delete Habit") {
                        showingDeleteAlert = true
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .padding(.horizontal)
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
            // Placeholder for HabitEditView - replace with your actual edit view
            NavigationView {
                Form {
                    Section("Habit Details") {
                        TextField("Title", text: .constant(habit.title))
                        TextField("Description", text: .constant(habit.habitDescription ?? ""))
                    }
                }
                .navigationTitle("Edit Habit")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { isEditing = false }
                    }
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Save") { isEditing = false }
                    }
                }
            }
        }
        .sheet(isPresented: $showingCompletionSheet) {
            // Placeholder for HabitCompletionSheet
            NavigationView {
                VStack {
                    Text("Mark Completion")
                        .font(.title2)
                        .padding()
                    
                    Button("Mark as Complete") {
                        habit.markCompleted()
                        showingCompletionSheet = false
                    }
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    
                    Spacer()
                }
                .navigationTitle("Complete Habit")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { showingCompletionSheet = false }
                    }
                }
            }
        }
        .sheet(isPresented: $showingStatsView) {
            // Placeholder for HabitStatsView
            NavigationView {
                VStack {
                    Text("Habit Statistics")
                        .font(.title2)
                        .padding()
                    
                    VStack(spacing: 16) {
                        HStack {
                            Text("Current Streak:")
                            Spacer()
                            Text("\(habit.streak) days")
                        }
                        
                        HStack {
                            Text("Best Streak:")
                            Spacer()
                            Text("\(habit.longestStreak) days")
                        }
                        
                        HStack {
                            Text("Total Completions:")
                            Spacer()
                            Text("\(habit.totalCompletions)")
                        }
                    }
                    .padding()
                    
                    Spacer()
                }
                .navigationTitle("Statistics")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Done") { showingStatsView = false }
                    }
                }
            }
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
        let activityViewController = UIActivityViewController(
            activityItems: [shareText],
            applicationActivities: nil
        )

        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityViewController, animated: true)
        }
    }

    private func deleteHabit() {
        Task {
            do {
                try await viewModel.deleteHabit(habit)
                dismiss()
            } catch {
                print("Failed to delete habit: \(error.localizedDescription)")
            }
        }
    }
}


#Preview {
    if #available(iOS 17.0, *) {
        let habit = Habit(
            title: "Morning Exercise",
            description: "Start the day with 30 minutes of exercise",
            frequency: HabitFrequency.daily,
            targetCount: 1,
            category: "Health",
            icon: "dumbbell.fill",
            color: "blue",
            userId: UUID()
        )

        HabitDetailView_Legacy(habit: habit, dataManager: DataManager())
            .environmentObject(AppCoordinator())
            .environmentObject(BPThemeManager.shared)
    } else {
        Text("Habit details are only available on iOS 17+")
            .foregroundColor(.secondary)
    }
}

