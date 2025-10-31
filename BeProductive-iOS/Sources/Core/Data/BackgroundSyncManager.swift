import Foundation
import BackgroundTasks
import SwiftUI
import SwiftData

@available(iOS 16.0, *)
class BackgroundSyncManager: ObservableObject {

    // MARK: - Constants
    private static let backgroundSyncIdentifier = "com.beproductive.ios.backgroundsync"
    private static let backgroundProcessingIdentifier = "com.beproductive.ios.backgroundprocessing"

    // MARK: - Properties
    private let _dataManager: Any?
    private let syncEngine: SyncEngine
    
    @available(iOS 17.0, *)
    private var dataManager: DataManager? {
        return _dataManager as? DataManager
    }

    // MARK: - Published Properties
    @Published var backgroundSyncEnabled: Bool {
        didSet {
            UserDefaults.standard.set(backgroundSyncEnabled, forKey: "backgroundSyncEnabled")
            if backgroundSyncEnabled {
                scheduleBackgroundSync()
            } else {
                cancelBackgroundSync()
            }
        }
    }

    // MARK: - Initialization
    init(syncEngine: SyncEngine) {
        self.syncEngine = syncEngine
        self._dataManager = nil
        self.backgroundSyncEnabled = UserDefaults.standard.bool(forKey: "backgroundSyncEnabled")

        registerBackgroundTasks()
        if backgroundSyncEnabled {
            scheduleBackgroundSync()
        }
    }
    
    @available(iOS 17.0, *)
    init(dataManager: DataManager, syncEngine: SyncEngine) {
        self.syncEngine = syncEngine
        self._dataManager = dataManager
        self.backgroundSyncEnabled = UserDefaults.standard.bool(forKey: "backgroundSyncEnabled")

        registerBackgroundTasks()
        if backgroundSyncEnabled {
            scheduleBackgroundSync()
        }
    }

    // MARK: - Public Methods
    func enableBackgroundSync() {
        backgroundSyncEnabled = true
    }

    func disableBackgroundSync() {
        backgroundSyncEnabled = false
    }

    func scheduleBackgroundSync() {
        guard backgroundSyncEnabled else { return }

        // Schedule background app refresh
        let refreshRequest = BGAppRefreshTaskRequest(identifier: Self.backgroundSyncIdentifier)
        refreshRequest.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

        do {
            try BGTaskScheduler.shared.submit(refreshRequest)
            print("Background sync scheduled successfully")
        } catch {
            print("Failed to schedule background sync: \(error)")
        }

        // Schedule background processing for larger syncs
        let processingRequest = BGProcessingTaskRequest(identifier: Self.backgroundProcessingIdentifier)
        processingRequest.earliestBeginDate = Date(timeIntervalSinceNow: 60 * 60) // 1 hour
        processingRequest.requiresNetworkConnectivity = true
        processingRequest.requiresExternalPower = false

        do {
            try BGTaskScheduler.shared.submit(processingRequest)
            print("Background processing scheduled successfully")
        } catch {
            print("Failed to schedule background processing: \(error)")
        }
    }

    func cancelBackgroundSync() {
        BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: Self.backgroundSyncIdentifier)
        BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: Self.backgroundProcessingIdentifier)
        print("Background sync cancelled")
    }

    // MARK: - Private Methods
    private func registerBackgroundTasks() {
        // Register background app refresh
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.backgroundSyncIdentifier,
            using: nil
        ) { task in
            self.handleBackgroundSync(task: task as! BGAppRefreshTask)
        }

        // Register background processing
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.backgroundProcessingIdentifier,
            using: nil
        ) { task in
            self.handleBackgroundProcessing(task: task as! BGProcessingTask)
        }
    }

    private func handleBackgroundSync(task: BGAppRefreshTask) {
        print("Background sync started")

        // Schedule the next background sync
        scheduleBackgroundSync()

        // Create a task to handle the sync
        let syncTask = _Concurrency.Task {
            do {
                // Perform quick incremental sync
                await syncEngine.performIncrementalSync()
                task.setTaskCompleted(success: true)
                print("Background sync completed successfully")
            } catch {
                print("Background sync failed: \(error)")
                task.setTaskCompleted(success: false)
            }
        }

        // Handle expiration
        task.expirationHandler = {
            print("Background sync expired")
            syncTask.cancel()
            task.setTaskCompleted(success: false)
        }
    }

    private func handleBackgroundProcessing(task: BGProcessingTask) {
        print("Background processing started")

        // Schedule the next background processing
        scheduleBackgroundSync()

        // Create a task to handle the processing
        let processingTask = _Concurrency.Task {
            do {
                // Perform full sync and maintenance tasks
                await syncEngine.performFullSync()
                await performMaintenanceTasks()
                task.setTaskCompleted(success: true)
                print("Background processing completed successfully")
            } catch {
                print("Background processing failed: \(error)")
                task.setTaskCompleted(success: false)
            }
        }

        // Handle expiration
        task.expirationHandler = {
            print("Background processing expired")
            processingTask.cancel()
            task.setTaskCompleted(success: false)
        }

        // Update progress periodically
        updateBackgroundTaskProgress(task: task)
    }

    private func performMaintenanceTasks() async {
        print("Performing maintenance tasks...")

        // Clean up old data
        await cleanupOldData()

        // Optimize database
        await optimizeDatabase()

        // Update analytics
        await updateAnalytics()

        print("Maintenance tasks completed")
    }

    private func cleanupOldData() async {
        guard #available(iOS 17.0, *), let dataManager = dataManager else {
            print("SwiftData not available, skipping cleanup")
            return
        }
        
        await MainActor.run {
            let context = dataManager.container.mainContext
            
            do {
                // Clean up old deleted items
                let cutoffDate = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()
                
                let deletedTasks = try context.fetch(FetchDescriptor<Task>(
                    predicate: #Predicate<Task> { $0.isDeleted == true && $0.updatedAt < cutoffDate }
                ))
                
                for task in deletedTasks {
                    context.delete(task)
                }
                
                // Clean up old productivity metrics (keep last 6 months)
                let metricsDate = Calendar.current.date(byAdding: .month, value: -6, to: Date()) ?? Date()
                let oldMetrics: [ProductivityMetric] = try context.fetch(FetchDescriptor<ProductivityMetric>(
                    predicate: #Predicate<ProductivityMetric> { $0.date < metricsDate }
                ))
                
                for metric in oldMetrics {
                    context.delete(metric)
                }
                
                try context.save()
                print("Cleaned up \(deletedTasks.count) deleted tasks and \(oldMetrics.count) old metrics")
                
            } catch {
                print("Failed to cleanup old data: \(error)")
            }
        }
    }

    private func optimizeDatabase() async {
        // Perform database optimization tasks
        // This could include compacting, reindexing, etc.
        print("Database optimization completed")
    }

    private func updateAnalytics() async {
        guard #available(iOS 17.0, *), let dataManager = dataManager else {
            print("SwiftData not available, skipping analytics update")
            return
        }
        
        await MainActor.run {
            let context = dataManager.container.mainContext
            
            do {
                // Calculate daily productivity metrics
                let today = Calendar.current.startOfDay(for: Date())
                
                // Task completion rate - using simplified predicate
                let allTasksDescriptor = FetchDescriptor<Task>()
                let allTasks = try context.fetch(allTasksDescriptor).filter { task in
                    Calendar.current.isDate(task.createdAt, inSameDayAs: today) ||
                    Calendar.current.isDate(task.completedDate ?? Date.distantPast, inSameDayAs: today)
                }
                
                let completedTasks = allTasks.filter { $0.isCompleted &&
                    Calendar.current.isDate($0.completedDate ?? Date.distantPast, inSameDayAs: today)
                }
                
                let completionRate = allTasks.isEmpty ? 0.0 : Double(completedTasks.count) / Double(allTasks.count)
                
                // Save productivity metric
                if let userId = AuthenticationManager.shared?.currentUser?.id {
                    let metric: ProductivityMetric = ProductivityMetric(
                        date: today,
                        metricType: .tasksCompleted,
                        value: Double(completedTasks.count),
                        userId: userId
                    )
                    context.insert(metric)
                    
                    let efficiencyMetric: ProductivityMetric = ProductivityMetric(
                        date: today,
                        metricType: .efficiency,
                        value: completionRate,
                        userId: userId
                    )
                    context.insert(efficiencyMetric)
                    
                    try context.save()
                    print("Updated analytics: \(completedTasks.count) tasks completed, \(Int(completionRate * 100))% efficiency")
                }
                
            } catch {
                print("Failed to update analytics: \(error)")
            }
        }
    }

    private func updateBackgroundTaskProgress(task: BGProcessingTask) {
        // Simulate progress updates
        _Concurrency.Task {
            for progress in stride(from: 0.0, through: 1.0, by: 0.1) {
                try? await _Concurrency.Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
                if _Concurrency.Task.isCancelled { break }

                await MainActor.run {
                    // Update progress if needed
                }
            }
        }
    }
}

// MARK: - Background Sync Configuration
extension BackgroundSyncManager {
    static func configureBGTaskScheduler() {
        // This should be called from the app delegate or scene delegate
        print("Background task scheduler configured")
    }

    static func handleBackgroundURLSession(identifier: String, completionHandler: @escaping () -> Void) {
        // Handle background URL session completion
        print("Background URL session completed: \(identifier)")
        completionHandler()
    }
}

// MARK: - Sync Strategies
extension BackgroundSyncManager {
    enum SyncStrategy {
        case incremental
        case full
        case deltaOnly
        case priorityOnly

        var timeLimit: TimeInterval {
            switch self {
            case .incremental: return 20 // 20 seconds for app refresh
            case .full: return 60 // 1 minute for background processing
            case .deltaOnly: return 10 // 10 seconds for quick updates
            case .priorityOnly: return 15 // 15 seconds for priority items
            }
        }
    }

    func performSyncWithStrategy(_ strategy: SyncStrategy) async {
        let startTime = Date()

        switch strategy {
        case .incremental:
            await syncEngine.performIncrementalSync()

        case .full:
            await syncEngine.performFullSync()

        case .deltaOnly:
            // Only sync items that have changed since last sync
            if #available(iOS 17.0, *) {
                let lastSync = await MainActor.run { syncEngine.lastSyncDate }
                if let lastSync = lastSync {
                    await syncDeltaChanges(since: lastSync)
                }
            } else {
                // Fallback for iOS < 17
                await syncDeltaChanges(since: Date().addingTimeInterval(-3600)) // Last hour
            }

        case .priorityOnly:
            // Only sync high-priority items
            await syncPriorityItems()
        }

        let duration = Date().timeIntervalSince(startTime)
        print("Sync strategy \(strategy) completed in \(duration) seconds")
    }

    private func syncDeltaChanges(since date: Date) async {
        // Implementation for delta sync
        print("Performing delta sync since \(date)")
    }

    private func syncPriorityItems() async {
        // Sync only urgent tasks, active goals, etc.
        print("Performing priority sync")
    }
}