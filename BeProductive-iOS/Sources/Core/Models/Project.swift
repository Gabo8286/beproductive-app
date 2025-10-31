import SwiftData
import Foundation

@Model
final class Project: SyncableModel {
    var id: UUID
    var title: String
    var projectDescription: String?
    var color: String
    var icon: String?
    var status: ProjectStatus
    var priority: ProjectPriority
    var progress: Double
    var startDate: Date
    var endDate: Date?
    var estimatedDuration: TimeInterval?
    var actualDuration: TimeInterval?
    var budget: Double?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID
    var ownerId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    // Relationships
    var tasks: [Task]
    @available(iOS 17, macOS 14, watchOS 10, tvOS 17, *)
    var goals: [Goal]
    var team: Team?
    @available(iOS 17, macOS 14, watchOS 10, tvOS 17, *)
    var notes: [Note]
    var milestones: [ProjectMilestone]

    // Computed properties
    var isCompleted: Bool {
        return status == .completed
    }

    var isOverdue: Bool {
        guard let endDate = endDate, !isCompleted else { return false }
        return endDate < Date()
    }

    var completedTasksCount: Int {
        return tasks.filter { $0.isCompleted }.count
    }

    var totalTasksCount: Int {
        return tasks.count
    }

    var completionPercentage: Double {
        guard totalTasksCount > 0 else { return 0.0 }
        return Double(completedTasksCount) / Double(totalTasksCount) * 100
    }

    var daysRemaining: Int? {
        guard let endDate = endDate, !isCompleted else { return nil }
        return Calendar.current.dateComponents([.day], from: Date(), to: endDate).day
    }

    var tableName: String { "projects" }

    init(
        title: String,
        projectDescription: String? = nil,
        color: String = "blue",
        icon: String? = nil,
        priority: ProjectPriority = .medium,
        endDate: Date? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.projectDescription = projectDescription
        self.color = color
        self.icon = icon
        self.status = .planning
        self.priority = priority
        self.progress = 0.0
        self.startDate = Date()
        self.endDate = endDate
        self.estimatedDuration = nil
        self.actualDuration = nil
        self.budget = nil
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.ownerId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
        self.tasks = []
        self.goals = []
        self.notes = []
        self.milestones = []
    }

    func updateProgress() {
        let completedTasks = tasks.filter { $0.isCompleted }.count
        let totalTasks = tasks.count

        if totalTasks > 0 {
            progress = Double(completedTasks) / Double(totalTasks)
        }

        // Check if project should be marked as completed
        if progress >= 1.0 && status != .completed {
            markCompleted()
        }

        needsSync = true
        lastModified = Date()
    }

    func markCompleted() {
        status = .completed
        progress = 1.0
        actualDuration = Date().timeIntervalSince(startDate)
        needsSync = true
        lastModified = Date()
    }

    func addTask(_ task: Task) {
        task.project = self
        tasks.append(task)
        updateProgress()
    }

    func addGoal(_ goal: Goal) {
        goals.append(goal)
        needsSync = true
        lastModified = Date()
    }

    func addMilestone(_ milestone: ProjectMilestone) {
        milestone.projectId = self.id
        milestones.append(milestone)
        needsSync = true
        lastModified = Date()
    }

    func startProject() {
        status = .active
        startDate = Date()
        needsSync = true
        lastModified = Date()
    }

    func pauseProject() {
        status = .onHold
        needsSync = true
        lastModified = Date()
    }

    func archiveProject() {
        status = .archived
        needsSync = true
        lastModified = Date()
    }
}

enum ProjectStatus: String, CaseIterable, Codable {
    case planning = "planning"
    case active = "active"
    case onHold = "on_hold"
    case completed = "completed"
    case cancelled = "cancelled"
    case archived = "archived"

    var displayName: String {
        switch self {
        case .planning: return "Planning"
        case .active: return "Active"
        case .onHold: return "On Hold"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .archived: return "Archived"
        }
    }

    var color: String {
        switch self {
        case .planning: return "yellow"
        case .active: return "green"
        case .onHold: return "orange"
        case .completed: return "blue"
        case .cancelled: return "red"
        case .archived: return "gray"
        }
    }
}

enum ProjectPriority: Int, CaseIterable, Codable {
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

@Model
final class ProjectMilestone {
    var id: UUID
    var projectId: UUID
    var title: String
    var milestoneDescription: String?
    var targetDate: Date
    var isCompleted: Bool
    var completedDate: Date?
    var order: Int
    var createdAt: Date

    init(projectId: UUID, title: String, milestoneDescription: String? = nil, targetDate: Date, order: Int = 0) {
        self.id = UUID()
        self.projectId = projectId
        self.title = title
        self.milestoneDescription = milestoneDescription
        self.targetDate = targetDate
        self.isCompleted = false
        self.completedDate = nil
        self.order = order
        self.createdAt = Date()
    }

    func markCompleted() {
        isCompleted = true
        completedDate = Date()
    }
}