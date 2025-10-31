import Foundation
import SwiftUI
import SwiftData
import Combine

@available(iOS 17, *)
@MainActor
class AnalyticsManager: ObservableObject {

    // MARK: - Published Properties
    @Published var isAnalyticsEnabled: Bool {
        didSet {
            UserDefaults.standard.set(isAnalyticsEnabled, forKey: "analyticsEnabled")
            if !isAnalyticsEnabled {
                clearAllAnalytics()
            }
        }
    }

    @Published var isCrashReportingEnabled: Bool {
        didSet {
            UserDefaults.standard.set(isCrashReportingEnabled, forKey: "crashReportingEnabled")
        }
    }

    // MARK: - Private Properties
    private let dataManager: DataManager
    private var eventQueue: [AnalyticsEvent] = []
    private var sessionStartTime: Date?
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Configuration
    private let maxEventQueueSize = 100
    private let batchUploadSize = 20
    private let uploadInterval: TimeInterval = 300 // 5 minutes

    // MARK: - Initialization
    init(dataManager: DataManager) {
        self.dataManager = dataManager
        self.isAnalyticsEnabled = UserDefaults.standard.bool(forKey: "analyticsEnabled") || ConfigurationManager.shared.analyticsEnabled
        self.isCrashReportingEnabled = UserDefaults.standard.bool(forKey: "crashReportingEnabled") || ConfigurationManager.shared.crashReportingEnabled

        setupAnalytics()
    }

    // MARK: - Public Methods
    func startAnalyticsSession() {
        guard isAnalyticsEnabled else { return }

        sessionStartTime = Date()
        trackEvent(.sessionStart, properties: [
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "app_version": ConfigurationManager.shared.appVersion,
            "build_number": ConfigurationManager.shared.buildNumber,
            "environment": ConfigurationManager.shared.environment.name
        ])

        schedulePeriodicUpload()
    }

    func endAnalyticsSession() {
        guard isAnalyticsEnabled, let startTime = sessionStartTime else { return }

        let sessionDuration = Date().timeIntervalSince(startTime)
        trackEvent(.sessionEnd, properties: [
            "session_duration": sessionDuration,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ])

        uploadPendingEvents()
        sessionStartTime = nil
    }

    func trackEvent(_ event: AnalyticsEventType, properties: [String: Any] = [:]) {
        guard isAnalyticsEnabled else { return }

        let analyticsEvent = AnalyticsEvent(
            type: event,
            properties: properties,
            timestamp: Date(),
            userId: getCurrentUserId(),
            sessionId: getSessionId()
        )

        eventQueue.append(analyticsEvent)

        // Manage queue size
        if eventQueue.count > maxEventQueueSize {
            eventQueue.removeFirst(eventQueue.count - maxEventQueueSize)
        }

        // Upload immediately for critical events
        if event.isCritical {
            uploadPendingEvents()
        }
    }

    func trackUserAction(_ action: UserAction, context: [String: Any] = [:]) {
        trackEvent(.userAction, properties: [
            "action": action.rawValue,
            "context": context
        ])
    }

    func trackScreenView(_ screen: String, properties: [String: Any] = [:]) {
        trackEvent(.screenView, properties: [
            "screen_name": screen,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ].merging(properties) { _, new in new })
    }

    func trackPerformance(_ metric: AnalyticsPerformanceMetric, value: Double, context: [String: Any] = [:]) {
        trackEvent(.performance, properties: [
            "metric": metric.rawValue,
            "value": value,
            "context": context
        ])
    }

    func trackError(_ error: Error, context: [String: Any] = [:]) {
        guard isCrashReportingEnabled else { return }

        trackEvent(.error, properties: [
            "error_type": String(describing: type(of: error)),
            "error_description": error.localizedDescription,
            "context": context,
            "stack_trace": Thread.callStackSymbols.joined(separator: "\n")
        ])
    }

    func trackCrash(_ crashInfo: [String: Any]) {
        guard isCrashReportingEnabled else { return }

        trackEvent(.crash, properties: crashInfo)

        // Immediately try to upload crash data
        uploadPendingEvents()
    }

    func setUserProperty(_ key: String, value: Any) {
        guard isAnalyticsEnabled else { return }

        UserDefaults.standard.set(value, forKey: "analytics_user_\(key)")
    }

    func incrementCounter(_ key: String, by value: Int = 1) {
        guard isAnalyticsEnabled else { return }

        let currentValue = UserDefaults.standard.integer(forKey: "analytics_counter_\(key)")
        UserDefaults.standard.set(currentValue + value, forKey: "analytics_counter_\(key)")
    }

    // MARK: - Privacy & Compliance
    func clearAllAnalytics() {
        eventQueue.removeAll()

        // Clear stored analytics data
        let userDefaults = UserDefaults.standard
        let keys = userDefaults.dictionaryRepresentation().keys
        for key in keys {
            if key.hasPrefix("analytics_") {
                userDefaults.removeObject(forKey: key)
            }
        }

        print("All analytics data cleared")
    }

    func exportAnalyticsData() -> [String: Any] {
        guard isAnalyticsEnabled else { return [:] }

        var exportData: [String: Any] = [:]

        // Export current event queue
        exportData["pending_events"] = eventQueue.map { event in
            [
                "type": event.type.rawValue,
                "properties": event.properties,
                "timestamp": ISO8601DateFormatter().string(from: event.timestamp),
                "user_id": event.userId?.uuidString ?? "anonymous",
                "session_id": event.sessionId
            ]
        }

        // Export user properties
        let userDefaults = UserDefaults.standard
        var userProperties: [String: Any] = [:]
        for (key, value) in userDefaults.dictionaryRepresentation() {
            if key.hasPrefix("analytics_user_") {
                let propertyKey = String(key.dropFirst("analytics_user_".count))
                userProperties[propertyKey] = value
            }
        }
        exportData["user_properties"] = userProperties

        // Export counters
        var counters: [String: Any] = [:]
        for (key, value) in userDefaults.dictionaryRepresentation() {
            if key.hasPrefix("analytics_counter_") {
                let counterKey = String(key.dropFirst("analytics_counter_".count))
                counters[counterKey] = value
            }
        }
        exportData["counters"] = counters

        return exportData
    }

    // MARK: - Private Methods
    private func setupAnalytics() {
        // Set up crash detection
        setupCrashDetection()

        // Set up memory warning detection
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )

        // Set up app lifecycle tracking
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }

    private func setupCrashDetection() {
        guard isCrashReportingEnabled else { return }

        // Set up uncaught exception handler
        NSSetUncaughtExceptionHandler { exception in
            let crashInfo: [String: Any] = [
                "exception_name": exception.name.rawValue,
                "exception_reason": exception.reason ?? "Unknown",
                "stack_trace": exception.callStackSymbols.joined(separator: "\n"),
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]

            // Store crash data for next launch
            UserDefaults.standard.set(crashInfo, forKey: "pending_crash_report")
        }

        // Check for pending crash reports
        if let pendingCrash = UserDefaults.standard.dictionary(forKey: "pending_crash_report") {
            trackCrash(pendingCrash)
            UserDefaults.standard.removeObject(forKey: "pending_crash_report")
        }
    }

    @objc private func handleMemoryWarning() {
        trackEvent(.memoryWarning, properties: [
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "available_memory": getAvailableMemory()
        ])
    }

    @objc private func appDidEnterBackground() {
        trackEvent(.appBackground)
        uploadPendingEvents()
    }

    @objc private func appWillEnterForeground() {
        trackEvent(.appForeground)
    }

    private func schedulePeriodicUpload() {
        Timer.scheduledTimer(withTimeInterval: uploadInterval, repeats: true) { [weak self] _ in
            _Concurrency.Task { @MainActor in
                self?.uploadPendingEvents()
            }
        }
    }

    private func uploadPendingEvents() {
        guard isAnalyticsEnabled, !eventQueue.isEmpty else { return }

        let eventsToUpload = Array(eventQueue.prefix(batchUploadSize))
        eventQueue.removeFirst(min(batchUploadSize, eventQueue.count))

        _Concurrency.Task {
            await uploadEvents(eventsToUpload)
        }
    }

    private func uploadEvents(_ events: [AnalyticsEvent]) async {
        // In a real implementation, this would upload to your analytics service
        // For now, we'll just log and store locally

        for event in events {
            print("Analytics Event: \(event.type.rawValue) - \(event.properties)")

            // Store to ProductivityMetric for local analytics
            if let userId = event.userId {
                let metric = ProductivityMetric(
                    date: event.timestamp,
                    metricType: MetricType.custom,
                    value: 1.0,
                    unit: "event",
                    category: "analytics",
                    tags: [event.type.rawValue],
                    metadata: event.properties.compactMapValues { "\($0)" },
                    userId: userId
                )

                dataManager.container.mainContext.insert(metric)
                try? dataManager.container.mainContext.save()
            }
        }
    }

    private func getCurrentUserId() -> UUID? {
        return AuthenticationManager.shared?.currentUser?.id
    }

    private func getSessionId() -> String {
        if let sessionId = UserDefaults.standard.string(forKey: "current_session_id") {
            return sessionId
        }

        let newSessionId = UUID().uuidString
        UserDefaults.standard.set(newSessionId, forKey: "current_session_id")
        return newSessionId
    }

    private func getAvailableMemory() -> Int64 {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }

        return kerr == KERN_SUCCESS ? Int64(info.resident_size) : 0
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - Supporting Types
struct AnalyticsEvent {
    let type: AnalyticsEventType
    let properties: [String: Any]
    let timestamp: Date
    let userId: UUID?
    let sessionId: String
}

enum AnalyticsEventType: String, CaseIterable {
    case sessionStart = "session_start"
    case sessionEnd = "session_end"
    case userAction = "user_action"
    case screenView = "screen_view"
    case performance = "performance"
    case error = "error"
    case crash = "crash"
    case memoryWarning = "memory_warning"
    case appBackground = "app_background"
    case appForeground = "app_foreground"

    var isCritical: Bool {
        switch self {
        case .crash, .error, .memoryWarning:
            return true
        default:
            return false
        }
    }
}

enum UserAction: String, CaseIterable {
    case taskCreated = "task_created"
    case taskCompleted = "task_completed"
    case taskDeleted = "task_deleted"
    case goalCreated = "goal_created"
    case goalCompleted = "goal_completed"
    case habitCreated = "habit_created"
    case habitCompleted = "habit_completed"
    case syncTriggered = "sync_triggered"
    case shareTriggered = "share_triggered"
    case searchPerformed = "search_performed"
    case filterApplied = "filter_applied"
    case settingsChanged = "settings_changed"
    case authenticationAttempt = "auth_attempt"
    case guestModeEntered = "guest_mode_entered"
}

enum AnalyticsPerformanceMetric: String, CaseIterable {
    case appLaunchTime = "app_launch_time"
    case syncDuration = "sync_duration"
    case databaseQueryTime = "db_query_time"
    case networkRequestTime = "network_request_time"
    case memoryUsage = "memory_usage"
    case cpuUsage = "cpu_usage"
    case batteryLevel = "battery_level"
    case diskUsage = "disk_usage"
}

// MARK: - Analytics Extensions
@available(iOS 17, *)
extension AnalyticsManager {
    // Convenience methods for common events
    func trackTaskCreated(taskType: String, priority: String) {
        trackUserAction(.taskCreated, context: [
            "task_type": taskType,
            "priority": priority
        ])
    }

    func trackTaskCompleted(duration: TimeInterval?, priority: String) {
        var context: [String: Any] = ["priority": priority]
        if let duration = duration {
            context["completion_time"] = duration
        }
        trackUserAction(.taskCompleted, context: context)
    }

    func trackGoalProgress(goalId: String, progress: Double) {
        trackEvent(.userAction, properties: [
            "action": "goal_progress_updated",
            "goal_id": goalId,
            "progress": progress
        ])
    }

    func trackSyncPerformance(duration: TimeInterval, itemCount: Int, success: Bool) {
        trackPerformance(.syncDuration, value: duration, context: [
            "item_count": itemCount,
            "success": success
        ])
    }

    func trackSearchQuery(query: String, resultCount: Int, category: String) {
        trackUserAction(.searchPerformed, context: [
            "query_length": query.count,
            "result_count": resultCount,
            "category": category
        ])
    }
}