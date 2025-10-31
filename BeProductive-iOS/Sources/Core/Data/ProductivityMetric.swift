import SwiftData
import Foundation

@available(iOS 17.0, macOS 14.0, *)
@Model
final class ProductivityMetric: SyncableModel {
    var id: UUID
    var metricType: MetricType
    var value: Double
    var date: Date
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    var tableName: String { "productivity_metrics" }

    init(
        metricType: MetricType,
        value: Double,
        date: Date = Date(),
        notes: String? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.metricType = metricType
        self.value = value
        self.date = date
        self.notes = notes
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
    }

    // MARK: - Sync Methods
    func updateFrom(_ remoteMetric: RemoteProductivityMetric) {
        self.metricType = remoteMetric.metricType
        self.value = remoteMetric.value
        self.date = remoteMetric.date
        self.notes = remoteMetric.notes
        self.updatedAt = remoteMetric.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteMetric() -> RemoteProductivityMetric {
        RemoteProductivityMetric(
            id: id,
            metricType: metricType,
            value: value,
            date: date,
            notes: notes,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    static func from(_ remoteMetric: RemoteProductivityMetric) -> ProductivityMetric {
        let metric = ProductivityMetric(
            metricType: remoteMetric.metricType,
            value: remoteMetric.value,
            date: remoteMetric.date,
            notes: remoteMetric.notes,
            userId: remoteMetric.userId
        )
        metric.id = remoteMetric.id
        metric.createdAt = remoteMetric.createdAt
        metric.updatedAt = remoteMetric.updatedAt
        metric.needsSync = false
        metric.isNew = false
        return metric
    }
}

enum MetricType: String, CaseIterable, Codable {
    case tasksCompleted = "tasks_completed"
    case focusTime = "focus_time"
    case productivityScore = "productivity_score"
    case habitsCompleted = "habits_completed"
    case goalsAchieved = "goals_achieved"
    case workHours = "work_hours"
    case breakTime = "break_time"
    case distractions = "distractions"

    var displayName: String {
        switch self {
        case .tasksCompleted: return "Tasks Completed"
        case .focusTime: return "Focus Time"
        case .productivityScore: return "Productivity Score"
        case .habitsCompleted: return "Habits Completed"
        case .goalsAchieved: return "Goals Achieved"
        case .workHours: return "Work Hours"
        case .breakTime: return "Break Time"
        case .distractions: return "Distractions"
        }
    }

    var unit: String {
        switch self {
        case .tasksCompleted: return "tasks"
        case .focusTime: return "hours"
        case .productivityScore: return "score"
        case .habitsCompleted: return "habits"
        case .goalsAchieved: return "goals"
        case .workHours: return "hours"
        case .breakTime: return "minutes"
        case .distractions: return "count"
        }
    }

    var iconName: String {
        switch self {
        case .tasksCompleted: return "checkmark.circle"
        case .focusTime: return "clock"
        case .productivityScore: return "chart.bar"
        case .habitsCompleted: return "repeat"
        case .goalsAchieved: return "target"
        case .workHours: return "briefcase"
        case .breakTime: return "pause.circle"
        case .distractions: return "exclamationmark.triangle"
        }
    }
}

// MARK: - Remote Data Types
struct RemoteProductivityMetric: Codable {
    let id: UUID
    let metricType: MetricType
    let value: Double
    let date: Date
    let notes: String?
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}