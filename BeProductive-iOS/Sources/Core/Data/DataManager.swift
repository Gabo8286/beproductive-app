import SwiftUI
import SwiftUI
import SwiftData
import Combine
import Supabase

// Note: TodoTask model will be referenced directly in the schema and throughout the code

@available(iOS 17, *)
@MainActor
class DataManager: ObservableObject {

    // MARK: - Published Properties
    @Published var isOfflineMode = false
    @Published var syncStatus: SyncStatus = .idle
    @Published var syncProgress: Double = 0.0
    @Published var lastSyncDate: Date?

    // MARK: - Shared Instance
    static let shared = DataManager()

    // MARK: - Properties
    let container: ModelContainer
    private let supabaseClient: SupabaseClient
    private var cancellables = Set<AnyCancellable>()
    private let syncQueue = DispatchQueue(label: "com.beproductive.sync", qos: .utility)
    lazy var syncEngine: SyncEngine = SyncEngine(dataManager: self)

    // MARK: - Initialization
    init() {
        // Initialize SwiftData container
        do {
            let schema = Schema([
                TodoTask.self,
                Goal.self,
                Project.self,
                Note.self,
                Habit.self,
                ProductivityMetric.self
                // TODO: Add these models when they're implemented
                // Team.self,
                // TeamMember.self,
                // AIConversation.self
            ])

            let modelConfiguration = ModelConfiguration(
                schema: schema,
                isStoredInMemoryOnly: false,
                cloudKitDatabase: .none // Disable CloudKit, use custom sync
            )

            self.container = try ModelContainer(
                for: schema,
                configurations: [modelConfiguration]
            )
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }

        // Initialize Supabase client
        self.supabaseClient = SupabaseClient(
            supabaseURL: URL(string: ConfigurationManager.shared.supabaseURL)!,
            supabaseKey: ConfigurationManager.shared.supabaseAnonKey
        )

        setupObservers()
    }

    // MARK: - Public Methods
    func initialize() async {
        // Initialize sync engine
        await syncEngine.initialize()

        // Set up sync status observing
        syncStatus = syncEngine.syncStatus
        lastSyncDate = syncEngine.lastSyncDate
        isOfflineMode = !syncEngine.isOnline
    }

    func performSync() async {
        await syncEngine.performFullSync()
    }

    func performIncrementalSync() async {
        await syncEngine.performIncrementalSync()
    }

    func forcePushToCloud() async throws {
        guard !isOfflineMode else { throw DataError.offlineMode }
        await syncEngine.performFullSync()
    }

    func enableOfflineMode() {
        isOfflineMode = true
        syncStatus = .offline
        syncEngine.pauseSync()
    }

    func disableOfflineMode() async {
        isOfflineMode = false
        syncStatus = .idle
        syncEngine.resumeSync()
        await performSync()
    }

    // MARK: - CRUD Operations
    func save<T: PersistentModel>(_ model: T) throws {
        container.mainContext.insert(model)
        try container.mainContext.save()

        // Mark for sync if online
        if !isOfflineMode, var syncableModel = model as? SyncableModel {
            syncableModel.needsSync = true
            syncableModel.lastModified = Date()
        }
    }

    // MARK: - Entity Creation Methods
    func createTask(
        title: String,
        description: String? = nil,
        priority: TaskPriorityLevel = .medium,
        category: String? = nil,
        dueDate: Date? = nil
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw DataError.noUser
        }

        let task = TodoTask(
            title: title,
            priority: priority,
            category: category,
            dueDate: dueDate,
            userId: userId
        )
        
        // Set description if provided
        if let description = description {
            task.taskDescription = description
        }

        try save(task)
    }

    func createGoal(
        title: String,
        description: String? = nil,
        category: String? = nil,
        priority: GoalPriority = .medium,
        targetDate: Date? = nil
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw DataError.noUser
        }

        let goal = Goal(
            title: title,
            details: description,
            category: category,
            priority: priority,
            targetDate: targetDate,
            userId: userId
        )

        try save(goal)
    }

    func createHabit(
        title: String,
        description: String? = nil,
        frequency: HabitFrequency = .daily,
        targetCount: Int = 1,
        category: String? = nil
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw DataError.noUser
        }

        let habit = Habit(
            title: title,
            frequency: frequency,
            targetCount: targetCount,
            category: category,
            userId: userId
        )
        
        // Set description if provided
        if let description = description {
            habit.habitDescription = description
        }

        try save(habit)
    }

    func createProject(
        title: String,
        description: String? = nil,
        priority: ProjectPriority = .medium
    ) async throws {
        guard let userId = getCurrentUserId() else {
            throw DataError.noUser
        }

        let project = Project(
            title: title,
            priority: priority,
            userId: userId
        )
        
        // Set description if provided
        if let description = description {
            project.projectDescription = description
        }

        try save(project)
    }

    private func getCurrentUserId() -> UUID? {
        // Get current user from AuthenticationManager
        if let authManager = AuthenticationManager.shared,
           let user = authManager.currentUser {
            return user.id
        }
        return nil
    }

    func delete<T: PersistentModel>(_ model: T) throws {
        container.mainContext.delete(model)
        try container.mainContext.save()

        // Mark for deletion sync if online
        if !isOfflineMode, var syncableModel = model as? SyncableModel {
            syncableModel.isSoftDeleted = true
            syncableModel.needsSync = true
            syncableModel.lastModified = Date()
        }
    }

    func fetch<T: PersistentModel>(_ type: T.Type, predicate: Predicate<T>? = nil) throws -> [T] {
        let descriptor = FetchDescriptor<T>(predicate: predicate)
        return try container.mainContext.fetch(descriptor)
    }

    // MARK: - Private Sync Methods
    private func syncTasks() async {
        do {
            let context = container.mainContext

            // Fetch remote tasks
            let remoteTasks: [RemoteTask] = try await supabaseClient
                .from("tasks")
                .select("*")
                .execute()
                .value

            // Sync with local tasks
            for remoteTask in remoteTasks {
                await syncLocalTask(remoteTask, context: context)
            }

            // Push local changes
            try await pushTasks(context: context)

        } catch {
            print("Task sync failed: \(error)")
        }
    }

    private func syncGoals() async {
        // Similar implementation for goals
    }

    private func syncProjects() async {
        // Similar implementation for projects
    }

    private func syncNotes() async {
        // Similar implementation for notes
    }

    private func syncHabits() async {
        // Similar implementation for habits
    }

    private func syncLocalTask(_ remoteTask: RemoteTask, context: ModelContext) async {
        do {
            let predicate = #Predicate<TodoTask> { $0.id == remoteTask.id }
            let descriptor = FetchDescriptor<TodoTask>(predicate: predicate)
            let existingTasks = try context.fetch(descriptor)

            if let existingTask = existingTasks.first {
                // Update existing task if remote is newer
                if remoteTask.updatedAt > existingTask.updatedAt {
                    existingTask.updateFrom(remoteTask)
                }
            } else {
                // Create new local task
                let newTask = TodoTask.from(remoteTask)
                context.insert(newTask)
            }

            try context.save()
        } catch {
            print("Failed to sync local task: \(error)")
        }
    }

    private func pushTasks(context: ModelContext) async throws {
        let predicate = #Predicate<TodoTask> { $0.needsSync == true }
        let descriptor = FetchDescriptor<TodoTask>(predicate: predicate)
        let tasksToSync = try context.fetch(descriptor)

        for task in tasksToSync {
            try await pushTask(task)
            task.needsSync = false
        }

        try context.save()
    }

    private func pushTask(_ task: TodoTask) async throws {
        let remoteTask = task.toRemoteTask()

        if task.isNew {
            try await supabaseClient
                .from("tasks")
                .insert(remoteTask)
                .execute()
        } else {
            try await supabaseClient
                .from("tasks")
                .update(remoteTask)
                .eq("id", value: task.id.uuidString)
                .execute()
        }
    }

    private func queueForSync<T: PersistentModel>(_ model: T) async {
        // Mark model for sync
        if var syncableModel = model as? SyncableModel {
            syncableModel.needsSync = true
            syncableModel.lastModified = Date()
        }
    }

    private func queueForDeletion<T: PersistentModel>(_ model: T) async {
        // Handle deletion sync
        if let syncableModel = model as? SyncableModel {
            // Mark for deletion in remote
            try? await deleteFromRemote(syncableModel)
        }
    }

    private func deleteFromRemote(_ model: SyncableModel) async throws {
        let tableName = model.tableName
        try await supabaseClient
            .from(tableName)
            .delete()
            .eq("id", value: model.id.uuidString)
            .execute()
    }

    private func setupObservers() {
        // Observe sync engine status changes
        syncEngine.$syncStatus
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                self?.syncStatus = status
            }
            .store(in: &cancellables)

        syncEngine.$lastSyncDate
            .receive(on: DispatchQueue.main)
            .sink { [weak self] date in
                self?.lastSyncDate = date
            }
            .store(in: &cancellables)

        syncEngine.$isOnline
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isOnline in
                self?.isOfflineMode = !isOnline
            }
            .store(in: &cancellables)
    }
}

// MARK: - Supporting Types

enum DataError: LocalizedError {
    case offlineMode
    case syncFailed(String)
    case networkUnavailable
    case noUser

    var errorDescription: String? {
        switch self {
        case .offlineMode:
            return "Operation not available in offline mode"
        case .syncFailed(let message):
            return "Sync failed: \(message)"
        case .networkUnavailable:
            return "Network unavailable"
        case .noUser:
            return "No authenticated user found"
        }
    }
}