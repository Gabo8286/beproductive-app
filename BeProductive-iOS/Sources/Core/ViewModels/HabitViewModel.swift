import SwiftUI
import SwiftData
import Combine

@available(iOS 17.0, macOS 14.0, *)
@MainActor
class HabitViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var habits: [Habit] = []
    @Published var filteredHabits: [Habit] = []
    @Published var searchText = ""
    @Published var selectedFilter: HabitFilter = .all
    @Published var selectedSort: HabitSort = .streak
    @Published var isLoading = false
    @Published var error: HabitError?

    // MARK: - Private Properties
    private let dataManager: DataManager
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init(dataManager: DataManager) {
        self.dataManager = dataManager
        setupObservers()
        Task {
            await loadHabits()
        }
    }

    // MARK: - Public Methods
    func loadHabits() async {
        isLoading = true

        do {
            let allHabits = try dataManager.fetch(Habit.self)
            habits = allHabits.filter { !$0.isSoftDeleted }
            applyFiltersAndSort()
            isLoading = false
        } catch {
            await handleError(.loadFailed(error))
            isLoading = false
        }
    }

    func createHabit(
        title: String,
        description: String? = nil,
        frequency: HabitFrequency = .daily,
        targetCount: Int = 1,
        category: String? = nil,
        icon: String? = nil,
        color: String = "blue"
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw HabitError.noUser
        }

        let habit = Habit(
            title: title,
            description: description,
            frequency: frequency,
            targetCount: targetCount,
            category: category,
            icon: icon,
            color: color,
            userId: userId
        )

        do {
            try dataManager.save(habit)
            habits.append(habit)
            applyFiltersAndSort()
        } catch {
            let habitError = HabitError.createFailed(error)
            await handleError(habitError)
            throw habitError
        }
    }

    func updateHabit(_ habit: Habit) async throws {
        habit.updatedAt = Date()
        habit.needsSync = true
        habit.lastModified = Date()

        do {
            try dataManager.container.mainContext.save()
            applyFiltersAndSort()
        } catch {
            let habitError = HabitError.updateFailed(error)
            await handleError(habitError)
            throw habitError
        }
    }

    func deleteHabit(_ habit: Habit) async throws {
        do {
            try dataManager.delete(habit)
            habits.removeAll { $0.id == habit.id }
            applyFiltersAndSort()
        } catch {
            let habitError = HabitError.deleteFailed(error)
            await handleError(habitError)
            throw habitError
        }
    }

    func toggleHabitCompletion(_ habit: Habit, on date: Date = Date(), count: Int = 1) async throws {
        let today = Calendar.current.startOfDay(for: date)

        // Check if already completed today
        let existingCompletion = habit.completions.first { completion in
            Calendar.current.isDate(completion.date, inSameDayAs: today)
        }

        if let existing = existingCompletion {
            // Remove completion
            habit.completions.removeAll { $0.id == existing.id }
            try dataManager.delete(existing)
        } else {
            // Add completion
            habit.markCompleted(on: today, count: count)
        }

        try await updateHabit(habit)
    }

    func addHabitCompletion(_ habit: Habit, on date: Date, count: Int = 1, notes: String? = nil) async throws {
        habit.markCompleted(on: date, count: count)

        if let notes = notes, !notes.isEmpty {
            if let completion = habit.completions.last {
                completion.notes = notes
            }
        }

        try await updateHabit(habit)
    }

    func pauseHabit(_ habit: Habit) async throws {
        habit.isActive = false
        try await updateHabit(habit)
    }

    func resumeHabit(_ habit: Habit) async throws {
        habit.isActive = true
        try await updateHabit(habit)
    }

    func updateFilter(_ filter: HabitFilter) {
        selectedFilter = filter
        applyFiltersAndSort()
    }

    func updateSort(_ sort: HabitSort) {
        selectedSort = sort
        applyFiltersAndSort()
    }

    func updateSearchText(_ text: String) {
        searchText = text
        applyFiltersAndSort()
    }

    // MARK: - Computed Properties
    var activeHabits: [Habit] {
        habits.filter { $0.isActive }
    }

    var pausedHabits: [Habit] {
        habits.filter { !$0.isActive }
    }

    var completedTodayHabits: [Habit] {
        habits.filter { $0.isCompletedToday }
    }

    var streakHabits: [Habit] {
        habits.filter { $0.streak > 0 }
    }

    var todayCompletionRate: Double {
        guard !activeHabits.isEmpty else { return 0.0 }
        let completedCount = completedTodayHabits.count
        return Double(completedCount) / Double(activeHabits.count)
    }

    var averageStreak: Double {
        guard !habits.isEmpty else { return 0.0 }
        let totalStreak = habits.reduce(0) { $0 + $1.streak }
        return Double(totalStreak) / Double(habits.count)
    }

    var longestActiveStreak: Int {
        habits.map { $0.streak }.max() ?? 0
    }

    var totalCompletions: Int {
        habits.reduce(0) { $0 + $1.totalCompletions }
    }

    // MARK: - Analytics Methods
    func getWeeklyData(for habit: Habit) -> [HabitDayData] {
        let calendar = Calendar.current
        let today = Date()
        let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: today)?.start ?? today

        var weekData: [HabitDayData] = []

        for i in 0..<7 {
            let date = calendar.date(byAdding: .day, value: i, to: startOfWeek) ?? startOfWeek
            let completion = habit.completions.first { completion in
                calendar.isDate(completion.date, inSameDayAs: date)
            }

            weekData.append(HabitDayData(
                date: date,
                isCompleted: completion != nil,
                count: completion?.count ?? 0,
                isToday: calendar.isDate(date, inSameDayAs: today)
            ))
        }

        return weekData
    }

    func getMonthlyData(for habit: Habit) -> [HabitDayData] {
        let calendar = Calendar.current
        let today = Date()
        let startOfMonth = calendar.dateInterval(of: .month, for: today)?.start ?? today
        let daysInMonth = calendar.range(of: .day, in: .month, for: today)?.count ?? 30

        var monthData: [HabitDayData] = []

        for i in 0..<daysInMonth {
            let date = calendar.date(byAdding: .day, value: i, to: startOfMonth) ?? startOfMonth
            let completion = habit.completions.first { completion in
                calendar.isDate(completion.date, inSameDayAs: date)
            }

            monthData.append(HabitDayData(
                date: date,
                isCompleted: completion != nil,
                count: completion?.count ?? 0,
                isToday: calendar.isDate(date, inSameDayAs: today)
            ))
        }

        return monthData
    }

    func getHabitStats(for habit: Habit) -> HabitStats {
        let calendar = Calendar.current
        let now = Date()
        let thirtyDaysAgo = calendar.date(byAdding: .day, value: -30, to: now) ?? now

        let recentCompletions = habit.completions.filter { $0.date >= thirtyDaysAgo }
        let completionRate = Double(recentCompletions.count) / 30.0

        return HabitStats(
            currentStreak: habit.streak,
            longestStreak: habit.longestStreak,
            totalCompletions: habit.totalCompletions,
            completionRate: completionRate,
            averagePerWeek: Double(recentCompletions.count) / 4.3 // ~4.3 weeks in 30 days
        )
    }

    // MARK: - Private Methods
    private func setupObservers() {
        // Observe search text changes
        $searchText
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.applyFiltersAndSort()
            }
            .store(in: &cancellables)
    }

    private func applyFiltersAndSort() {
        var filtered = habits

        // Apply status filter
        switch selectedFilter {
        case .all:
            break
        case .active:
            filtered = filtered.filter { $0.isActive }
        case .paused:
            filtered = filtered.filter { !$0.isActive }
        case .completedToday:
            filtered = filtered.filter { $0.isCompletedToday }
        case .pendingToday:
            filtered = filtered.filter { $0.isActive && !$0.isCompletedToday }
        case .streak:
            filtered = filtered.filter { $0.streak > 0 }
        case .frequency(let frequency):
            filtered = filtered.filter { $0.frequency == frequency }
        case .category(let category):
            filtered = filtered.filter { $0.category == category }
        }

        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { habit in
                habit.title.localizedCaseInsensitiveContains(searchText) ||
                habit.habitDescription?.localizedCaseInsensitiveContains(searchText) == true ||
                habit.category?.localizedCaseInsensitiveContains(searchText) == true
            }
        }

        // Apply sorting
        switch selectedSort {
        case .title:
            filtered.sort { $0.title.localizedCompare($1.title) == .orderedAscending }
        case .streak:
            filtered.sort { $0.streak > $1.streak }
        case .completions:
            filtered.sort { $0.totalCompletions > $1.totalCompletions }
        case .createdDate:
            filtered.sort { $0.createdAt > $1.createdAt }
        case .frequency:
            filtered.sort { $0.frequency.rawValue < $1.frequency.rawValue }
        }

        filteredHabits = filtered
    }

    private func getCurrentUserId() -> UUID? {
        return AuthenticationManager.shared?.currentUser?.id
    }

    private func handleError(_ error: HabitError) async {
        self.error = error
        print("HabitViewModel Error: \(error.localizedDescription)")

        // Clear error after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.error = nil
        }
    }
}

// MARK: - Supporting Types
@available(iOS 17.0, macOS 14.0, *)
enum HabitFilter: Equatable {
    case all
    case active
    case paused
    case completedToday
    case pendingToday
    case streak
    case frequency(HabitFrequency)
    case category(String)

    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .paused: return "Paused"
        case .completedToday: return "Completed Today"
        case .pendingToday: return "Pending Today"
        case .streak: return "On Streak"
        case .frequency(let frequency): return frequency.displayName
        case .category(let category): return category
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
enum HabitSort: String, CaseIterable {
    case title = "title"
    case streak = "streak"
    case completions = "completions"
    case createdDate = "createdDate"
    case frequency = "frequency"

    var displayName: String {
        switch self {
        case .title: return "Title"
        case .streak: return "Streak"
        case .completions: return "Completions"
        case .createdDate: return "Created"
        case .frequency: return "Frequency"
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
enum HabitError: LocalizedError {
    case loadFailed(Error)
    case createFailed(Error)
    case updateFailed(Error)
    case deleteFailed(Error)
    case noUser

    var errorDescription: String? {
        switch self {
        case .loadFailed(let error):
            return "Failed to load habits: \(error.localizedDescription)"
        case .createFailed(let error):
            return "Failed to create habit: \(error.localizedDescription)"
        case .updateFailed(let error):
            return "Failed to update habit: \(error.localizedDescription)"
        case .deleteFailed(let error):
            return "Failed to delete habit: \(error.localizedDescription)"
        case .noUser:
            return "No user logged in"
        }
    }
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitDayData {
    let date: Date
    let isCompleted: Bool
    let count: Int
    let isToday: Bool
}

@available(iOS 17.0, macOS 14.0, *)
struct HabitStats {
    let currentStreak: Int
    let longestStreak: Int
    let totalCompletions: Int
    let completionRate: Double
    let averagePerWeek: Double
}