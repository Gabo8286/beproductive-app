import SwiftUI
import SwiftData
import Combine

@MainActor
class GoalViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var goals: [Goal] = []
    @Published var filteredGoals: [Goal] = []
    @Published var searchText = ""
    @Published var selectedFilter: GoalFilter = .all
    @Published var selectedSort: GoalSort = .dueDate
    @Published var isLoading = false
    @Published var error: GoalError?

    // MARK: - Private Properties
    let dataManager: DataManager
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init(dataManager: DataManager) {
        self.dataManager = dataManager
        setupObservers()
        loadGoals()
    }

    // MARK: - Public Methods
    func loadGoals() {
        isLoading = true

        do {
            let allGoals = try dataManager.fetch(Goal.self)
            goals = allGoals.filter { !$0.isSoftDeleted }
            applyFiltersAndSort()
            isLoading = false
        } catch {
            await handleError(.loadFailed(error))
            isLoading = false
        }
    }

    func createGoal(
        title: String,
        description: String? = nil,
        category: String? = nil,
        priority: GoalPriority = .medium,
        targetDate: Date? = nil,
        targetValue: Double? = nil,
        unit: String? = nil
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw GoalError.noUser
        }

        let goal = Goal(
            title: title,
            details: description,
            category: category,
            priority: priority,
            targetDate: targetDate,
            targetValue: targetValue,
            unit: unit,
            userId: userId
        )

        do {
            try dataManager.save(goal)
            goals.append(goal)
            applyFiltersAndSort()
        } catch {
            let goalError = GoalError.createFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func updateGoal(_ goal: Goal) async throws {
        goal.updatedAt = Date()
        goal.needsSync = true
        goal.lastModified = Date()

        do {
            try dataManager.container.mainContext.save()
            applyFiltersAndSort()
        } catch {
            let goalError = GoalError.updateFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func deleteGoal(_ goal: Goal) async throws {
        do {
            try dataManager.delete(goal)
            goals.removeAll { $0.id == goal.id }
            applyFiltersAndSort()
        } catch {
            let goalError = GoalError.deleteFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func addMilestone(to goal: Goal, title: String, targetDate: Date, description: String? = nil) async throws {
        let milestone = GoalMilestone(
            goalId: goal.id,
            title: title,
            description: description,
            targetDate: targetDate
        )

        goal.addMilestone(milestone)

        do {
            try dataManager.container.mainContext.save()
        } catch {
            let goalError = GoalError.updateFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func updateGoalProgress(_ goal: Goal, newValue: Double) async throws {
        goal.updateValue(newValue)

        do {
            try dataManager.container.mainContext.save()
            applyFiltersAndSort()
        } catch {
            let goalError = GoalError.updateFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func completeGoal(_ goal: Goal) async throws {
        goal.markCompleted()

        do {
            try dataManager.container.mainContext.save()
            applyFiltersAndSort()
        } catch {
            let goalError = GoalError.updateFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func addTaskToGoal(_ goal: Goal, taskTitle: String) async throws {
        guard let userId = getCurrentUserId() else {
            throw GoalError.noUser
        }

        let task = TodoTask(
            title: taskTitle,
            priority: .medium,
            userId: userId
        )

        goal.addTask(task)

        do {
            try dataManager.save(task)
            try await updateGoal(goal)
        } catch {
            let goalError = GoalError.updateFailed(error)
            await handleError(goalError)
            throw goalError
        }
    }

    func updateFilter(_ filter: GoalFilter) {
        selectedFilter = filter
        applyFiltersAndSort()
    }

    func updateSort(_ sort: GoalSort) {
        selectedSort = sort
        applyFiltersAndSort()
    }

    func updateSearchText(_ text: String) {
        searchText = text
        applyFiltersAndSort()
    }

    // MARK: - Computed Properties
    var activeGoals: [Goal] {
        goals.filter { $0.status == .active }
    }

    var completedGoals: [Goal] {
        goals.filter { $0.status == .completed }
    }

    var overdueGoals: [Goal] {
        goals.filter { goal in
            guard let targetDate = goal.targetDate, !goal.isCompleted else { return false }
            return targetDate < Date()
        }
    }

    var thisMonthGoals: [Goal] {
        let now = Date()
        let startOfMonth = Calendar.current.dateInterval(of: .month, for: now)?.start ?? now
        let endOfMonth = Calendar.current.dateInterval(of: .month, for: now)?.end ?? now

        return goals.filter { goal in
            guard let targetDate = goal.targetDate else { return false }
            return targetDate >= startOfMonth && targetDate <= endOfMonth
        }
    }

    var overallProgress: Double {
        guard !goals.isEmpty else { return 0.0 }
        let totalProgress = goals.reduce(0.0) { $0 + $1.progress }
        return totalProgress / Double(goals.count)
    }

    var completionRate: Double {
        guard !goals.isEmpty else { return 0.0 }
        let completedCount = goals.filter { $0.isCompleted }.count
        return Double(completedCount) / Double(goals.count)
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
        var filtered = goals

        // Apply status filter
        switch selectedFilter {
        case .all:
            break
        case .active:
            filtered = filtered.filter { $0.status == .active }
        case .completed:
            filtered = filtered.filter { $0.status == .completed }
        case .overdue:
            filtered = filtered.filter { goal in
                guard let targetDate = goal.targetDate, !goal.isCompleted else { return false }
                return targetDate < Date()
            }
        case .thisMonth:
            let now = Date()
            let startOfMonth = Calendar.current.dateInterval(of: .month, for: now)?.start ?? now
            let endOfMonth = Calendar.current.dateInterval(of: .month, for: now)?.end ?? now

            filtered = filtered.filter { goal in
                guard let targetDate = goal.targetDate else { return false }
                return targetDate >= startOfMonth && targetDate <= endOfMonth
            }
        case .priority(let priority):
            filtered = filtered.filter { $0.priority == priority }
        case .category(let category):
            filtered = filtered.filter { $0.category == category }
        }

        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { goal in
                goal.title.localizedCaseInsensitiveContains(searchText) ||
                goal.description?.localizedCaseInsensitiveContains(searchText) == true ||
                goal.category?.localizedCaseInsensitiveContains(searchText) == true
            }
        }

        // Apply sorting
        switch selectedSort {
        case .title:
            filtered.sort { $0.title.localizedCompare($1.title) == .orderedAscending }
        case .dueDate:
            filtered.sort { (lhs, rhs) in
                switch (lhs.targetDate, rhs.targetDate) {
                case (nil, nil): return lhs.createdAt < rhs.createdAt
                case (nil, _): return false
                case (_, nil): return true
                case (let lhsDate?, let rhsDate?): return lhsDate < rhsDate
                }
            }
        case .priority:
            filtered.sort { $0.priority.rawValue > $1.priority.rawValue }
        case .progress:
            filtered.sort { $0.progress > $1.progress }
        case .createdDate:
            filtered.sort { $0.createdAt > $1.createdAt }
        }

        filteredGoals = filtered
    }

    private func getCurrentUserId() -> UUID? {
        return AuthenticationManager.shared?.currentUser?.id
    }

    private func handleError(_ error: GoalError) async {
        self.error = error
        print("GoalViewModel Error: \(error.localizedDescription)")

        // Clear error after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.error = nil
        }
    }
}

// MARK: - Supporting Types
enum GoalFilter: Equatable {
    case all
    case active
    case completed
    case overdue
    case thisMonth
    case priority(GoalPriority)
    case category(String)

    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .completed: return "Completed"
        case .overdue: return "Overdue"
        case .thisMonth: return "This Month"
        case .priority(let priority): return priority.displayName
        case .category(let category): return category
        }
    }
}

enum GoalSort: String, CaseIterable {
    case title = "title"
    case dueDate = "dueDate"
    case priority = "priority"
    case progress = "progress"
    case createdDate = "createdDate"

    var displayName: String {
        switch self {
        case .title: return "Title"
        case .dueDate: return "Due Date"
        case .priority: return "Priority"
        case .progress: return "Progress"
        case .createdDate: return "Created"
        }
    }
}

enum GoalError: LocalizedError {
    case loadFailed(Error)
    case createFailed(Error)
    case updateFailed(Error)
    case deleteFailed(Error)
    case noUser

    var errorDescription: String? {
        switch self {
        case .loadFailed(let error):
            return "Failed to load goals: \(error.localizedDescription)"
        case .createFailed(let error):
            return "Failed to create goal: \(error.localizedDescription)"
        case .updateFailed(let error):
            return "Failed to update goal: \(error.localizedDescription)"
        case .deleteFailed(let error):
            return "Failed to delete goal: \(error.localizedDescription)"
        case .noUser:
            return "No user logged in"
        }
    }
}