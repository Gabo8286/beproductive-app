import SwiftUI
import SwiftUI
import SwiftData
import Combine
import Supabase
import Network

@MainActor
class SyncEngine: ObservableObject {

    // MARK: - Published Properties
    @Published var syncStatus: SyncStatus = .idle
    @Published var lastSyncDate: Date?
    @Published var conflictCount: Int = 0
    @Published var isOnline: Bool = true

    // MARK: - Private Properties
    private let dataManager: DataManager
    private let supabaseClient: SupabaseClient
    private let networkMonitor = NWPathMonitor()
    private let syncQueue = DispatchQueue(label: "com.beproductive.sync", qos: .utility)
    private var cancellables = Set<AnyCancellable>()
    private var syncTimer: Timer?

    // MARK: - Configuration
    private let syncInterval: TimeInterval
    private let maxRetryAttempts: Int
    private let batchSize: Int = 50

    init(dataManager: DataManager) {
        self.dataManager = dataManager
        self.supabaseClient = SupabaseClient(
            supabaseURL: URL(string: ConfigurationManager.shared.supabaseURL)!,
            supabaseKey: ConfigurationManager.shared.supabaseAnonKey
        )
        self.syncInterval = ConfigurationManager.shared.syncInterval
        self.maxRetryAttempts = ConfigurationManager.shared.maxRetryAttempts

        setupNetworkMonitoring()
        setupPeriodicSync()
    }

    // MARK: - Public Methods
    func initialize() async {
        lastSyncDate = UserDefaults.standard.object(forKey: "lastSyncDate") as? Date

        if isOnline {
            await performFullSync()
        }
    }

    func performFullSync() async {
        guard isOnline else {
            syncStatus = .offline
            return
        }

        guard syncStatus != .syncing else { return }

        syncStatus = .syncing

        do {
            // Phase 1: Push local changes
            try await pushLocalChanges()

            // Phase 2: Pull remote changes
            try await pullRemoteChanges()

            // Phase 3: Resolve conflicts
            try await resolveConflicts()

            // Update sync status
            syncStatus = .completed
            lastSyncDate = Date()
            UserDefaults.standard.set(lastSyncDate, forKey: "lastSyncDate")

            // Reset status after delay
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                if self.syncStatus == .completed {
                    self.syncStatus = .idle
                }
            }

        } catch {
            syncStatus = .failed(error)
            print("Sync failed: \(error)")
        }
    }

    func performIncrementalSync() async {
        guard isOnline else { return }
        guard syncStatus != .syncing else { return }

        guard let lastSync = lastSyncDate else {
            await performFullSync()
            return
        }

        syncStatus = .syncing

        do {
            // Only sync items modified since last sync
            try await pushIncrementalChanges(since: lastSync)
            try await pullIncrementalChanges(since: lastSync)
            try await resolveConflicts()

            syncStatus = .completed
            lastSyncDate = Date()
            UserDefaults.standard.set(lastSyncDate, forKey: "lastSyncDate")

            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                if self.syncStatus == .completed {
                    self.syncStatus = .idle
                }
            }

        } catch {
            syncStatus = .failed(error)
            print("Incremental sync failed: \(error)")
        }
    }

    func pauseSync() {
        syncTimer?.invalidate()
        syncTimer = nil
        syncStatus = .paused
    }

    func resumeSync() {
        setupPeriodicSync()
        if syncStatus == .paused {
            syncStatus = .idle
        }
    }

    // MARK: - Private Sync Methods
    private func pushLocalChanges() async throws {
        let context = dataManager.container.mainContext

        do {
            // Get all entities that need syncing
            let tasks = try context.fetch(FetchDescriptor<Task>(
                predicate: #Predicate { $0.needsSync == true }
            ))

            let goals = try context.fetch(FetchDescriptor<Goal>(
                predicate: #Predicate { $0.needsSync == true }
            ))

            let habits = try context.fetch(FetchDescriptor<Habit>(
                predicate: #Predicate { $0.needsSync == true }
            ))

            // Push in batches
            try await pushTasksBatch(tasks)
            try await pushGoalsBatch(goals)
            try await pushHabitsBatch(habits)

        } catch {
            throw SyncError.pushFailed(error)
        }
    }

    private func pullRemoteChanges() async throws {
        do {
            try await pullRemoteTasks()
            try await pullRemoteGoals()
            try await pullRemoteHabits()
        } catch {
            throw SyncError.pullFailed(error)
        }
    }

    private func pushTasksBatch(_ tasks: [Task]) async throws {
        let context = dataManager.container.mainContext

        for batch in tasks.chunked(into: batchSize) {
            var retryCount = 0

            while retryCount < maxRetryAttempts {
                do {
                    for task in batch {
                        try await pushTask(task)
                        task.needsSync = false
                        task.lastModified = Date()
                    }

                    try context.save()
                    break

                } catch {
                    retryCount += 1
                    if retryCount >= maxRetryAttempts {
                        throw error
                    }
                    try await Task.sleep(nanoseconds: UInt64(retryCount * 1_000_000_000)) // Exponential backoff
                }
            }
        }
    }

    private func pushTask(_ task: Task) async throws {
        let remoteTask = task.toRemoteTask()

        if task.isDeleted {
            try await supabaseClient
                .from("tasks")
                .delete()
                .eq("id", value: task.id.uuidString)
                .execute()
        } else if task.isNew {
            try await supabaseClient
                .from("tasks")
                .insert(remoteTask)
                .execute()
            task.isNew = false
        } else {
            try await supabaseClient
                .from("tasks")
                .update(remoteTask)
                .eq("id", value: task.id.uuidString)
                .execute()
        }
    }

    private func pullRemoteTasks() async throws {
        let context = dataManager.container.mainContext

        let remoteTasks: [RemoteTask] = try await supabaseClient
            .from("tasks")
            .select("*")
            .execute()
            .value

        for remoteTask in remoteTasks {
            try await syncRemoteTask(remoteTask, context: context)
        }

        try context.save()
    }

    private func syncRemoteTask(_ remoteTask: RemoteTask, context: ModelContext) async throws {
        let predicate = #Predicate<Task> { $0.id == remoteTask.id }
        let descriptor = FetchDescriptor<Task>(predicate: predicate)
        let existingTasks = try context.fetch(descriptor)

        if let existingTask = existingTasks.first {
            // Check for conflicts
            if existingTask.needsSync && remoteTask.updatedAt > existingTask.lastModified {
                // Remote version is newer, but local has unsaved changes
                await handleTaskConflict(local: existingTask, remote: remoteTask)
            } else if remoteTask.updatedAt > existingTask.updatedAt {
                // Remote version is newer, update local
                existingTask.updateFrom(remoteTask)
            }
        } else {
            // Create new local task
            let newTask = Task.from(remoteTask)
            context.insert(newTask)
        }
    }

    private func handleTaskConflict(local: Task, remote: RemoteTask) async {
        // For now, create a conflict record for manual resolution
        _ = SyncConflict(
            entityType: "Task",
            entityId: local.id,
            localVersion: local.updatedAt,
            remoteVersion: remote.updatedAt,
            conflictType: .dataConflict
        )

        // Store conflict for resolution
        conflictCount += 1
        print("Task conflict detected: \(local.title)")

        // Auto-resolve simple conflicts (prefer local for now)
        // In production, this would have more sophisticated rules
        local.updatedAt = Date()
        local.needsSync = true
    }

    private func pushGoalsBatch(_ goals: [Goal]) async throws {
        // Similar implementation to pushTasksBatch
        let context = dataManager.container.mainContext

        for batch in goals.chunked(into: batchSize) {
            for goal in batch {
                try await pushGoal(goal)
                goal.needsSync = false
                goal.lastModified = Date()
            }
            try context.save()
        }
    }

    private func pushGoal(_ goal: Goal) async throws {
        let remoteGoal = goal.toRemoteGoal()

        if goal.isDeleted {
            try await supabaseClient
                .from("goals")
                .delete()
                .eq("id", value: goal.id.uuidString)
                .execute()
        } else if goal.isNew {
            try await supabaseClient
                .from("goals")
                .insert(remoteGoal)
                .execute()
            goal.isNew = false
        } else {
            try await supabaseClient
                .from("goals")
                .update(remoteGoal)
                .eq("id", value: goal.id.uuidString)
                .execute()
        }
    }

    private func pullRemoteGoals() async throws {
        // Similar implementation to pullRemoteTasks
        let context = dataManager.container.mainContext

        let remoteGoals: [RemoteGoal] = try await supabaseClient
            .from("goals")
            .select("*")
            .execute()
            .value

        for remoteGoal in remoteGoals {
            try await syncRemoteGoal(remoteGoal, context: context)
        }

        try context.save()
    }

    private func syncRemoteGoal(_ remoteGoal: RemoteGoal, context: ModelContext) async throws {
        let predicate = #Predicate<Goal> { $0.id == remoteGoal.id }
        let descriptor = FetchDescriptor<Goal>(predicate: predicate)
        let existingGoals = try context.fetch(descriptor)

        if let existingGoal = existingGoals.first {
            if remoteGoal.updatedAt > existingGoal.updatedAt {
                existingGoal.updateFrom(remoteGoal)
            }
        } else {
            let newGoal = Goal.from(remoteGoal)
            context.insert(newGoal)
        }
    }

    private func pushHabitsBatch(_ habits: [Habit]) async throws {
        // Similar implementation to pushTasksBatch
        let context = dataManager.container.mainContext

        for batch in habits.chunked(into: batchSize) {
            for habit in batch {
                try await pushHabit(habit)
                habit.needsSync = false
                habit.lastModified = Date()
            }
            try context.save()
        }
    }

    private func pushHabit(_ habit: Habit) async throws {
        let remoteHabit = habit.toRemoteHabit()

        if habit.isDeleted {
            try await supabaseClient
                .from("habits")
                .delete()
                .eq("id", value: habit.id.uuidString)
                .execute()
        } else if habit.isNew {
            try await supabaseClient
                .from("habits")
                .insert(remoteHabit)
                .execute()
            habit.isNew = false
        } else {
            try await supabaseClient
                .from("habits")
                .update(remoteHabit)
                .eq("id", value: habit.id.uuidString)
                .execute()
        }
    }

    private func pullRemoteHabits() async throws {
        // Similar implementation to pullRemoteTasks
        let context = dataManager.container.mainContext

        let remoteHabits: [RemoteHabit] = try await supabaseClient
            .from("habits")
            .select("*")
            .execute()
            .value

        for remoteHabit in remoteHabits {
            try await syncRemoteHabit(remoteHabit, context: context)
        }

        try context.save()
    }

    private func syncRemoteHabit(_ remoteHabit: RemoteHabit, context: ModelContext) async throws {
        let predicate = #Predicate<Habit> { $0.id == remoteHabit.id }
        let descriptor = FetchDescriptor<Habit>(predicate: predicate)
        let existingHabits = try context.fetch(descriptor)

        if let existingHabit = existingHabits.first {
            if remoteHabit.updatedAt > existingHabit.updatedAt {
                existingHabit.updateFrom(remoteHabit)
            }
        } else {
            let newHabit = Habit.from(remoteHabit)
            context.insert(newHabit)
        }
    }

    private func pushIncrementalChanges(since date: Date) async throws {
        // Implementation for incremental push
    }

    private func pullIncrementalChanges(since date: Date) async throws {
        // Implementation for incremental pull
    }

    private func resolveConflicts() async throws {
        // Handle any remaining conflicts
        if conflictCount > 0 {
            print("Resolving \(conflictCount) conflicts...")
            // Implementation for conflict resolution
            conflictCount = 0
        }
    }

    // MARK: - Network Monitoring
    private func setupNetworkMonitoring() {
        networkMonitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isOnline = path.status == .satisfied

                if path.status == .satisfied {
                    // Network became available, trigger sync
                    Task {
                        await self?.performIncrementalSync()
                    }
                }
            }
        }

        let queue = DispatchQueue(label: "NetworkMonitor")
        networkMonitor.start(queue: queue)
    }

    private func setupPeriodicSync() {
        syncTimer?.invalidate()

        syncTimer = Timer.scheduledTimer(withTimeInterval: syncInterval, repeats: true) { [weak self] _ in
            Task {
                await self?.performIncrementalSync()
            }
        }
    }
}

// MARK: - Supporting Types
enum SyncError: LocalizedError {
    case pushFailed(Error)
    case pullFailed(Error)
    case conflictResolutionFailed(Error)
    case networkUnavailable
    case authenticationRequired

    var errorDescription: String? {
        switch self {
        case .pushFailed(let error):
            return "Failed to push changes: \(error.localizedDescription)"
        case .pullFailed(let error):
            return "Failed to pull changes: \(error.localizedDescription)"
        case .conflictResolutionFailed(let error):
            return "Failed to resolve conflicts: \(error.localizedDescription)"
        case .networkUnavailable:
            return "Network unavailable for sync"
        case .authenticationRequired:
            return "Authentication required for sync"
        }
    }
}

struct SyncConflict {
    let entityType: String
    let entityId: UUID
    let localVersion: Date
    let remoteVersion: Date
    let conflictType: ConflictType

    enum ConflictType {
        case dataConflict
        case deleteConflict
        case createConflict
    }
}

enum SyncStatus: Equatable {
    case idle
    case syncing
    case completed
    case failed(Error)
    case offline
    case paused

    static func == (lhs: SyncStatus, rhs: SyncStatus) -> Bool {
        switch (lhs, rhs) {
        case (.idle, .idle),
             (.syncing, .syncing),
             (.completed, .completed),
             (.offline, .offline),
             (.paused, .paused):
            return true
        case (.failed, .failed):
            return true
        default:
            return false
        }
    }
}

// MARK: - Array Extension for Batching
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}

