import Foundation
import SwiftUI
import Combine
import os.log

@MainActor
class PerformanceMonitor: ObservableObject {

    // MARK: - Published Properties
    @Published var memoryUsage: MemoryUsage = MemoryUsage()
    @Published var performanceMetrics: [PerformanceMetric] = []
    @Published var isMonitoring: Bool = false

    // MARK: - Private Properties
    private let analyticsManager: AnalyticsManager?
    private var monitoringTimer: Timer?
    private var startupTime: CFTimeInterval?
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Logger
    private let logger = Logger(subsystem: "com.beproductive.ios", category: "Performance")

    // MARK: - Configuration
    private let monitoringInterval: TimeInterval = 30 // 30 seconds
    private let memoryWarningThreshold: Int64 = 500 * 1024 * 1024 // 500MB

    // MARK: - Initialization
    init(analyticsManager: AnalyticsManager? = nil) {
        self.analyticsManager = analyticsManager
        self.startupTime = CFAbsoluteTimeGetCurrent()

        setupMemoryWarningObserver()
        setupAppLifecycleObservers()
    }

    // MARK: - Public Methods
    func startMonitoring() {
        guard !isMonitoring else { return }

        isMonitoring = true
        logger.info("Performance monitoring started")

        // Initial measurement
        updateMemoryUsage()

        // Start periodic monitoring
        monitoringTimer = Timer.scheduledTimer(withTimeInterval: monitoringInterval, repeats: true) { [weak self] _ in
            self?.performPeriodicCheck()
        }

        // Track app launch performance
        if let startupTime = startupTime {
            let launchTime = CFAbsoluteTimeGetCurrent() - startupTime
            trackPerformanceMetric(.appLaunchTime, value: launchTime)
        }
    }

    func stopMonitoring() {
        guard isMonitoring else { return }

        isMonitoring = false
        monitoringTimer?.invalidate()
        monitoringTimer = nil

        logger.info("Performance monitoring stopped")
    }

    func trackPerformanceMetric(_ metric: PerformanceMetricType, value: Double, context: [String: Any] = [:]) {
        let performanceMetric = PerformanceMetric(
            type: metric,
            value: value,
            timestamp: Date(),
            context: context
        )

        performanceMetrics.append(performanceMetric)

        // Keep only recent metrics (last 100)
        if performanceMetrics.count > 100 {
            performanceMetrics.removeFirst(performanceMetrics.count - 100)
        }

        // Log to analytics
        analyticsManager?.trackPerformance(
            AnalyticsManager.AnalyticsPerformanceMetric(rawValue: metric.rawValue) ?? .appLaunchTime,
            value: value,
            context: context
        )

        // Log warning for poor performance
        if metric.shouldLogWarning(value: value) {
            logger.warning("Performance warning: \(metric.rawValue) = \(value)")
        }

        logger.debug("Performance metric: \(metric.rawValue) = \(value)")
    }

    func measureExecutionTime<T>(_ operation: () throws -> T, metricType: PerformanceMetricType) rethrows -> T {
        let startTime = CFAbsoluteTimeGetCurrent()
        let result = try operation()
        let executionTime = CFAbsoluteTimeGetCurrent() - startTime

        trackPerformanceMetric(metricType, value: executionTime)
        return result
    }

    func measureAsyncExecutionTime<T>(_ operation: () async throws -> T, metricType: PerformanceMetricType) async rethrows -> T {
        let startTime = CFAbsoluteTimeGetCurrent()
        let result = try await operation()
        let executionTime = CFAbsoluteTimeGetCurrent() - startTime

        trackPerformanceMetric(metricType, value: executionTime)
        return result
    }

    func getMemoryPressure() -> MemoryPressureLevel {
        let usage = memoryUsage
        let totalMemory = ProcessInfo.processInfo.physicalMemory

        let usagePercentage = Double(usage.usedMemory) / Double(totalMemory)

        switch usagePercentage {
        case 0.0..<0.5:
            return .normal
        case 0.5..<0.75:
            return .warning
        case 0.75..<0.9:
            return .critical
        default:
            return .emergency
        }
    }

    func generatePerformanceReport() -> PerformanceReport {
        let currentMemory = getCurrentMemoryUsage()
        let averageMetrics = calculateAverageMetrics()

        return PerformanceReport(
            timestamp: Date(),
            memoryUsage: currentMemory,
            averageMetrics: averageMetrics,
            memoryPressure: getMemoryPressure(),
            recentMetrics: Array(performanceMetrics.suffix(20))
        )
    }

    // MARK: - Private Methods
    private func performPeriodicCheck() {
        updateMemoryUsage()
        checkMemoryPressure()
        cleanupOldMetrics()
    }

    private func updateMemoryUsage() {
        memoryUsage = getCurrentMemoryUsage()

        // Track memory usage metric
        trackPerformanceMetric(.memoryUsage, value: Double(memoryUsage.usedMemory))
    }

    private func getCurrentMemoryUsage() -> MemoryUsage {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }

        if kerr == KERN_SUCCESS {
            return MemoryUsage(
                usedMemory: Int64(info.resident_size),
                availableMemory: Int64(ProcessInfo.processInfo.physicalMemory) - Int64(info.resident_size),
                totalMemory: Int64(ProcessInfo.processInfo.physicalMemory)
            )
        } else {
            return MemoryUsage()
        }
    }

    private func checkMemoryPressure() {
        let pressure = getMemoryPressure()

        switch pressure {
        case .warning:
            logger.warning("Memory pressure: WARNING")
            analyticsManager?.trackEvent(.memoryWarning, properties: [
                "memory_usage": memoryUsage.usedMemory,
                "pressure_level": "warning"
            ])

        case .critical:
            logger.error("Memory pressure: CRITICAL")
            analyticsManager?.trackEvent(.memoryWarning, properties: [
                "memory_usage": memoryUsage.usedMemory,
                "pressure_level": "critical"
            ])

        case .emergency:
            logger.fault("Memory pressure: EMERGENCY")
            analyticsManager?.trackEvent(.memoryWarning, properties: [
                "memory_usage": memoryUsage.usedMemory,
                "pressure_level": "emergency"
            ])

        case .normal:
            break
        }
    }

    private func calculateAverageMetrics() -> [PerformanceMetricType: Double] {
        var averages: [PerformanceMetricType: Double] = [:]

        for metricType in PerformanceMetricType.allCases {
            let metricsOfType = performanceMetrics.filter { $0.type == metricType }
            if !metricsOfType.isEmpty {
                let average = metricsOfType.reduce(0) { $0 + $1.value } / Double(metricsOfType.count)
                averages[metricType] = average
            }
        }

        return averages
    }

    private func cleanupOldMetrics() {
        let cutoffDate = Date().addingTimeInterval(-3600) // Keep last hour
        performanceMetrics.removeAll { $0.timestamp < cutoffDate }
    }

    private func setupMemoryWarningObserver() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
    }

    private func setupAppLifecycleObservers() {
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

    @objc private func handleMemoryWarning() {
        logger.warning("Memory warning received")
        updateMemoryUsage()

        analyticsManager?.trackEvent(.memoryWarning, properties: [
            "memory_usage": memoryUsage.usedMemory,
            "available_memory": memoryUsage.availableMemory
        ])
    }

    @objc private func appDidEnterBackground() {
        if isMonitoring {
            stopMonitoring()
        }
    }

    @objc private func appWillEnterForeground() {
        if !isMonitoring {
            startMonitoring()
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - Supporting Types
struct MemoryUsage {
    let usedMemory: Int64
    let availableMemory: Int64
    let totalMemory: Int64

    init(usedMemory: Int64 = 0, availableMemory: Int64 = 0, totalMemory: Int64 = 0) {
        self.usedMemory = usedMemory
        self.availableMemory = availableMemory
        self.totalMemory = totalMemory
    }

    var usagePercentage: Double {
        guard totalMemory > 0 else { return 0 }
        return Double(usedMemory) / Double(totalMemory) * 100
    }

    var formattedUsedMemory: String {
        ByteCountFormatter.string(fromByteCount: usedMemory, countStyle: .memory)
    }

    var formattedTotalMemory: String {
        ByteCountFormatter.string(fromByteCount: totalMemory, countStyle: .memory)
    }
}

struct PerformanceMetric {
    let type: PerformanceMetricType
    let value: Double
    let timestamp: Date
    let context: [String: Any]
}

enum PerformanceMetricType: String, CaseIterable {
    case appLaunchTime = "app_launch_time"
    case memoryUsage = "memory_usage"
    case databaseQuery = "database_query"
    case networkRequest = "network_request"
    case viewRender = "view_render"
    case syncOperation = "sync_operation"
    case imageLoad = "image_load"
    case scrollPerformance = "scroll_performance"
    case batteryUsage = "battery_usage"

    func shouldLogWarning(value: Double) -> Bool {
        switch self {
        case .appLaunchTime:
            return value > 3.0 // More than 3 seconds
        case .memoryUsage:
            return value > 500_000_000 // More than 500MB
        case .databaseQuery:
            return value > 1.0 // More than 1 second
        case .networkRequest:
            return value > 10.0 // More than 10 seconds
        case .viewRender:
            return value > 0.016 // More than 16ms (60fps)
        case .syncOperation:
            return value > 30.0 // More than 30 seconds
        case .imageLoad:
            return value > 2.0 // More than 2 seconds
        case .scrollPerformance:
            return value < 30.0 // Less than 30fps
        case .batteryUsage:
            return value > 10.0 // More than 10% per hour
        }
    }
}

enum MemoryPressureLevel {
    case normal
    case warning
    case critical
    case emergency
}

struct PerformanceReport {
    let timestamp: Date
    let memoryUsage: MemoryUsage
    let averageMetrics: [PerformanceMetricType: Double]
    let memoryPressure: MemoryPressureLevel
    let recentMetrics: [PerformanceMetric]
}

// MARK: - Performance Monitoring Extensions
extension PerformanceMonitor {
    // Database performance monitoring
    func trackDatabaseQuery<T>(_ operation: () throws -> T) rethrows -> T {
        return try measureExecutionTime(operation, metricType: .databaseQuery)
    }

    func trackDatabaseQueryAsync<T>(_ operation: () async throws -> T) async rethrows -> T {
        return try await measureAsyncExecutionTime(operation, metricType: .databaseQuery)
    }

    // Network performance monitoring
    func trackNetworkRequest<T>(_ operation: () async throws -> T) async rethrows -> T {
        return try await measureAsyncExecutionTime(operation, metricType: .networkRequest)
    }

    // View rendering performance monitoring
    func trackViewRender<T>(_ operation: () -> T) -> T {
        return measureExecutionTime(operation, metricType: .viewRender)
    }

    // Sync operation monitoring
    func trackSyncOperation<T>(_ operation: () async throws -> T) async rethrows -> T {
        return try await measureAsyncExecutionTime(operation, metricType: .syncOperation)
    }
}

// MARK: - Memory Leak Detection
extension PerformanceMonitor {
    func detectPotentialMemoryLeaks() -> [MemoryLeakWarning] {
        var warnings: [MemoryLeakWarning] = []

        // Check for consistently increasing memory usage
        let recentMemoryMetrics = performanceMetrics
            .filter { $0.type == .memoryUsage }
            .suffix(10)
            .map { $0.value }

        if recentMemoryMetrics.count >= 5 {
            let trend = calculateTrend(values: Array(recentMemoryMetrics))
            if trend > 10_000_000 { // 10MB increase trend
                warnings.append(MemoryLeakWarning(
                    type: .consistentGrowth,
                    description: "Memory usage consistently increasing",
                    severity: .warning
                ))
            }
        }

        // Check for sudden memory spikes
        if let lastMetric = recentMemoryMetrics.last,
           let previousMetric = recentMemoryMetrics.dropLast().last {
            let increase = lastMetric - previousMetric
            if increase > 100_000_000 { // 100MB spike
                warnings.append(MemoryLeakWarning(
                    type: .suddenSpike,
                    description: "Sudden memory usage spike detected",
                    severity: .critical
                ))
            }
        }

        return warnings
    }

    private func calculateTrend(values: [Double]) -> Double {
        guard values.count >= 2 else { return 0 }

        let n = Double(values.count)
        let sumX = (1...values.count).reduce(0, +)
        let sumY = values.reduce(0, +)
        let sumXY = zip(1...values.count, values).reduce(0) { $0 + Double($1.0) * $1.1 }
        let sumX2 = (1...values.count).reduce(0) { $0 + $1 * $1 }

        let slope = (n * sumXY - Double(sumX) * sumY) / (n * Double(sumX2) - Double(sumX) * Double(sumX))
        return slope
    }
}

struct MemoryLeakWarning {
    let type: MemoryLeakType
    let description: String
    let severity: MemoryLeakSeverity

    enum MemoryLeakType {
        case consistentGrowth
        case suddenSpike
        case cyclicLeak
    }

    enum MemoryLeakSeverity {
        case warning
        case critical
        case emergency
    }
}