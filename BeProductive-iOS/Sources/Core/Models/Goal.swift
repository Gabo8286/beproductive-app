import SwiftData
import Foundation



@available(iOS 17, macOS 14, watchOS 10, tvOS 17, *)
@Model
final class Goal: SyncableModel {
    var id: UUID
    var title: String
    var details: String?
    var category: String?
    var priority: GoalPriority
    var status: GoalStatus
    var progress: Double
    var targetValue: Double?
    var currentValue: Double?
    var unit: String?
    var startDate: Date
    var targetDate: Date?
    var completedDate: Date?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isSoftDeleted: Bool
    var isNew: Bool

    // Relationships - explicitly typed as SwiftData model
    var tasks: [TodoTask] = []
    var milestones: [GoalMilestone]
    var metrics: [GoalMetric]

    // Computed properties
    var isCompleted: Bool {
        return status == .completed
    }

    var isOverdue: Bool {
        guard let targetDate = targetDate, !isCompleted else { return false }
        return targetDate < Date()
    }

    var daysRemaining: Int? {
        guard let targetDate = targetDate, !isCompleted else { return nil }
        return Calendar.current.dateComponents([.day], from: Date(), to: targetDate).day
    }

    var completionPercentage: Double {
        if let targetValue = targetValue, let currentValue = currentValue, targetValue > 0 {
            return min(currentValue / targetValue, 1.0) * 100
        }
        return progress * 100
    }

    init(
        title: String,
        details: String? = nil,
        category: String? = nil,
        priority: GoalPriority = .medium,
        targetDate: Date? = nil,
        targetValue: Double? = nil,
        unit: String? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.details = details
        self.category = category
        self.priority = priority
        self.status = .active
        self.progress = 0.0
        self.targetValue = targetValue
        self.currentValue = 0.0
        self.unit = unit
        self.startDate = Date()
        self.targetDate = targetDate
        self.completedDate = nil
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isSoftDeleted = false
        self.isNew = true
        self.tasks = []
        self.milestones = []
        self.metrics = []
    }

    func updateProgress() {
        let completedTasks = tasks.filter { $0.isCompleted }.count
        let totalTasks = tasks.count

        if totalTasks > 0 {
            progress = Double(completedTasks) / Double(totalTasks)
        }

        // Check if goal should be marked as completed
        if progress >= 1.0 && status != .completed {
            markCompleted()
        }

        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func markCompleted() {
        status = .completed
        progress = 1.0
        completedDate = Date()
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func addTask(_ task: TodoTask) {
        task.goal = self
        tasks.append(task)
        updateProgress()
    }

    func addMilestone(_ milestone: GoalMilestone) {
        milestone.goalId = self.id
        milestones.append(milestone)
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func updateValue(_ newValue: Double) {
        currentValue = newValue
        if let targetValue = targetValue, targetValue > 0 {
            progress = min(newValue / targetValue, 1.0)
        }
        updateProgress()
    }
    
    // MARK: - Sync Methods
    func updateFrom(_ remoteGoal: RemoteGoal) {
        self.title = remoteGoal.title
        self.details = remoteGoal.details
        self.category = remoteGoal.category
        self.priority = remoteGoal.priority
        self.status = remoteGoal.status
        self.progress = remoteGoal.progress
        self.targetValue = remoteGoal.targetValue
        self.currentValue = remoteGoal.currentValue
        self.unit = remoteGoal.unit
        self.startDate = remoteGoal.startDate
        self.targetDate = remoteGoal.targetDate
        self.completedDate = remoteGoal.completedDate
        self.updatedAt = remoteGoal.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteGoal() -> RemoteGoal {
        RemoteGoal(
            id: id,
            title: title,
            details: details,
            category: category,
            priority: priority,
            status: status,
            progress: progress,
            targetValue: targetValue,
            currentValue: currentValue,
            unit: unit,
            startDate: startDate,
            targetDate: targetDate,
            completedDate: completedDate,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    static func from(_ remoteGoal: RemoteGoal) -> Goal {
        let goal = Goal(
            title: remoteGoal.title,
            details: remoteGoal.details,
            category: remoteGoal.category,
            priority: remoteGoal.priority,
            targetDate: remoteGoal.targetDate,
            targetValue: remoteGoal.targetValue,
            unit: remoteGoal.unit,
            userId: remoteGoal.userId
        )
        goal.id = remoteGoal.id
        goal.status = remoteGoal.status
        goal.progress = remoteGoal.progress
        goal.currentValue = remoteGoal.currentValue
        goal.startDate = remoteGoal.startDate
        goal.completedDate = remoteGoal.completedDate
        goal.createdAt = remoteGoal.createdAt
        goal.updatedAt = remoteGoal.updatedAt
        goal.needsSync = false
        goal.isNew = false
        return goal
    }

    // MARK: - SyncableModel Conformance
    var tableName: String { "goals" }
}

enum GoalPriority: Int, CaseIterable, Codable {
    case low = 1
    case medium = 2
    case high = 3
    case critical = 4

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .critical: return "Critical"
        }
    }

    var color: String {
        switch self {
        case .low: return "gray"
        case .medium: return "blue"
        case .high: return "orange"
        case .critical: return "red"
        }
    }
}

enum GoalStatus: String, CaseIterable, Codable {
    case draft = "draft"
    case active = "active"
    case paused = "paused"
    case completed = "completed"
    case cancelled = "cancelled"

    var displayName: String {
        switch self {
        case .draft: return "Draft"
        case .active: return "Active"
        case .paused: return "Paused"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
    
    var color: String {
        switch self {
        case .draft: return "gray"
        case .active: return "blue"
        case .paused: return "orange"
        case .completed: return "green"
        case .cancelled: return "red"
        }
    }
}

@available(iOS 17, macOS 14, watchOS 10, tvOS 17, *)
@Model
final class GoalMilestone {
    var id: UUID
    var goalId: UUID
    var title: String
    var details: String?
    var targetDate: Date
    var isCompleted: Bool
    var completedDate: Date?
    var createdAt: Date

    init(goalId: UUID, title: String, details: String? = nil, targetDate: Date) {
        self.id = UUID()
        self.goalId = goalId
        self.title = title
        self.details = details
        self.targetDate = targetDate
        self.isCompleted = false
        self.completedDate = nil
        self.createdAt = Date()
    }

    func markCompleted() {
        isCompleted = true
        completedDate = Date()
    }
}

@available(iOS 17, macOS 14, watchOS 10, tvOS 17, *)
@Model
final class GoalMetric {
    var id: UUID
    var goalId: UUID
    var date: Date
    var value: Double
    var notes: String?
    var createdAt: Date

    init(goalId: UUID, date: Date, value: Double, notes: String? = nil) {
        self.id = UUID()
        self.goalId = goalId
        self.date = date
        self.value = value
        self.notes = notes
        self.createdAt = Date()
    }
}

// MARK: - Remote Data Types
struct RemoteGoal: Codable {
    let id: UUID
    let title: String
    let details: String?
    let category: String?
    let priority: GoalPriority
    let status: GoalStatus
    let progress: Double
    let targetValue: Double?
    let currentValue: Double?
    let unit: String?
    let startDate: Date
    let targetDate: Date?
    let completedDate: Date?
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}