import SwiftUI
import SwiftData
import Combine

@MainActor
class TaskViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var tasks: [TodoTask] = []
    @Published var filteredTasks: [TodoTask] = []
    @Published var searchText = ""
    @Published var selectedFilter: TodoTaskFilter = .all
    @Published var selectedSort: TodoTaskSort = .dueDate
    @Published var showCompleted = true
    @Published var isLoading = false
    @Published var error: TodoTaskError?

    // MARK: - Private Properties
    private let dataManager: DataManager
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init(dataManager: DataManager) {
        self.dataManager = dataManager
        setupObservers()
        loadTasks()
    }

    // MARK: - Public Methods
    func loadTasks() {
        isLoading = true

        do {
            let allTasks = try dataManager.fetch(TodoTask.self)
            tasks = allTasks.filter { !$0.isSoftDeleted }
            applyFiltersAndSort()
            isLoading = false
        } catch {
            await handleError(.loadFailed(error))
            isLoading = false
        }
    }

    func createTask(
        title: String,
        description: String? = nil,
        priority: TodoTaskPriority = .medium,
        dueDate: Date? = nil,
        category: String? = nil,
        projectId: UUID? = nil,
        goalId: UUID? = nil
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw TaskError.noUser
        }

        let task = TodoTask(
            title: title,
            description: description,
            priority: priority,
            category: category,
            dueDate: dueDate,
            userId: userId
        )

        // Set relationships if provided
        if let projectId = projectId {
            task.project = try? dataManager.fetch(Project.self).first { $0.id == projectId }
        }

        if let goalId = goalId {
            task.goal = try? dataManager.fetch(Goal.self).first { $0.id == goalId }
        }

        do {
            try dataManager.save(task)
            tasks.append(task)
            applyFiltersAndSort()
        } catch {
            let taskError = TaskError.createFailed(error)
            await handleError(taskError)
            throw taskError
        }
    }

    func updateTask(_ task: TodoTask) async throws {
        task.updatedAt = Date()
        task.needsSync = true
        task.lastModified = Date()

        do {
            try dataManager.container.mainContext.save()
            applyFiltersAndSort()
        } catch {
            let taskError = TaskError.updateFailed(error)
            await handleError(taskError)
            throw taskError
        }
    }

    func toggleTaskCompletion(_ task: TodoTask) async throws {
        if task.isCompleted {
            task.markIncomplete()
        } else {
            task.markCompleted()
        }

        try await updateTask(task)

        // Update goal progress if task is linked to a goal
        if let goal = task.goal {
            goal.updateProgress()
            try await dataManager.container.mainContext.save()
        }
    }

    func deleteTask(_ task: TodoTask) async throws {
        do {
            try dataManager.delete(task)
            tasks.removeAll { $0.id == task.id }
            applyFiltersAndSort()
        } catch {
            let taskError = TaskError.deleteFailed(error)
            await handleError(taskError)
            throw taskError
        }
    }

    func addSubtask(to parentTask: TodoTask, title: String) async throws {
        guard let userId = getCurrentUserId() else {
            throw TaskError.noUser
        }

        let subtask = Task(
            title: title,
            priority: parentTask.priority,
            category: parentTask.category,
            userId: userId
        )

        parentTask.addSubtask(subtask)

        do {
            try dataManager.save(subtask)
            try await updateTask(parentTask)
        } catch {
            throw TaskError.createFailed(error)
        }
    }

    func duplicateTask(_ task: TodoTask) async throws {
        guard let userId = getCurrentUserId() else {
            throw TaskError.noUser
        }

        let duplicatedTask = Task(
            title: "\(task.title) (Copy)",
            description: task.description,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate,
            userId: userId
        )

        // Copy tags
        for tag in task.tags {
            duplicatedTask.addTag(tag)
        }

        // Set relationships
        duplicatedTask.project = task.project
        duplicatedTask.goal = task.goal

        try await createTask(
            title: duplicatedTask.title,
            description: duplicatedTask.description,
            priority: duplicatedTask.priority,
            dueDate: duplicatedTask.dueDate,
            category: duplicatedTask.category,
            projectId: duplicatedTask.project?.id,
            goalId: duplicatedTask.goal?.id
        )
    }

    func updateFilter(_ filter: TodoTaskFilter) {
        selectedFilter = filter
        applyFiltersAndSort()
    }

    func updateSort(_ sort: TodoTaskSort) {
        selectedSort = sort
        applyFiltersAndSort()
    }

    func updateSearchText(_ text: String) {
        searchText = text
        applyFiltersAndSort()
    }

    func toggleShowCompleted() {
        showCompleted.toggle()
        applyFiltersAndSort()
    }

    // MARK: - Computed Properties
    var overdueTasks: [Task] {
        tasks.filter { $0.isOverdue }
    }

    var todayTasks: [Task] {
        let today = Calendar.current.startOfDay(for: Date())
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!

        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate >= today && dueDate < tomorrow
        }
    }

    var upcomingTasks: [Task] {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        let weekFromNow = Calendar.current.date(byAdding: .day, value: 7, to: Date())!

        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate >= tomorrow && dueDate <= weekFromNow
        }
    }

    var completionRate: Double {
        guard !tasks.isEmpty else { return 0.0 }
        let completedCount = tasks.filter { $0.isCompleted }.count
        return Double(completedCount) / Double(tasks.count)
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
        var filtered = tasks

        // Apply completion filter
        if !showCompleted {
            filtered = filtered.filter { !$0.isCompleted }
        }

        // Apply status filter
        switch selectedFilter {
        case .all:
            break
        case .active:
            filtered = filtered.filter { !$0.isCompleted }
        case .completed:
            filtered = filtered.filter { $0.isCompleted }
        case .overdue:
            filtered = filtered.filter { $0.isOverdue }
        case .today:
            let today = Calendar.current.startOfDay(for: Date())
            let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
            filtered = filtered.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return dueDate >= today && dueDate < tomorrow
            }
        case .thisWeek:
            let startOfWeek = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
            let endOfWeek = Calendar.current.date(byAdding: .day, value: 7, to: startOfWeek)!
            filtered = filtered.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return dueDate >= startOfWeek && dueDate < endOfWeek
            }
        case .priority(let priority):
            filtered = filtered.filter { $0.priority == priority }
        case .category(let category):
            filtered = filtered.filter { $0.category == category }
        }

        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { task in
                task.title.localizedCaseInsensitiveContains(searchText) ||
                task.description?.localizedCaseInsensitiveContains(searchText) == true ||
                task.tags.contains { $0.localizedCaseInsensitiveContains(searchText) }
            }
        }

        // Apply sorting
        switch selectedSort {
        case .title:
            filtered.sort { $0.title.localizedCompare($1.title) == .orderedAscending }
        case .dueDate:
            filtered.sort { (lhs, rhs) in
                switch (lhs.dueDate, rhs.dueDate) {
                case (nil, nil): return lhs.createdAt < rhs.createdAt
                case (nil, _): return false
                case (_, nil): return true
                case (let lhsDate?, let rhsDate?): return lhsDate < rhsDate
                }
            }
        case .priority:
            filtered.sort { $0.priority.rawValue > $1.priority.rawValue }
        case .createdDate:
            filtered.sort { $0.createdAt > $1.createdAt }
        case .updatedDate:
            filtered.sort { $0.updatedAt > $1.updatedAt }
        }

        filteredTasks = filtered
    }

    private func getCurrentUserId() -> UUID? {
        return AuthenticationManager.shared?.currentUser?.id
    }

    private func handleError(_ error: TodoTaskError) async {
        self.error = error
        print("TaskViewModel Error: \(error.localizedDescription)")

        // Clear error after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.error = nil
        }
    }
}

// MARK: - Supporting Types
enum TaskFilter: Equatable {
    case all
    case active
    case completed
    case overdue
    case today
    case thisWeek
    case priority(TaskPriority)
    case category(String)

    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .completed: return "Completed"
        case .overdue: return "Overdue"
        case .today: return "Today"
        case .thisWeek: return "This Week"
        case .priority(let priority): return priority.displayName
        case .category(let category): return category
        }
    }
}

enum TaskSort: String, CaseIterable {
    case title = "title"
    case dueDate = "dueDate"
    case priority = "priority"
    case createdDate = "createdDate"
    case updatedDate = "updatedDate"

    var displayName: String {
        switch self {
        case .title: return "Title"
        case .dueDate: return "Due Date"
        case .priority: return "Priority"
        case .createdDate: return "Created"
        case .updatedDate: return "Updated"
        }
    }
}

enum TaskError: LocalizedError {
    case loadFailed(Error)
    case createFailed(Error)
    case updateFailed(Error)
    case deleteFailed(Error)
    case noUser

    var errorDescription: String? {
        switch self {
        case .loadFailed(let error):
            return "Failed to load tasks: \(error.localizedDescription)"
        case .createFailed(let error):
            return "Failed to create task: \(error.localizedDescription)"
        case .updateFailed(let error):
            return "Failed to update task: \(error.localizedDescription)"
        case .deleteFailed(let error):
            return "Failed to delete task: \(error.localizedDescription)"
        case .noUser:
            return "No user logged in"
        }
    }
}