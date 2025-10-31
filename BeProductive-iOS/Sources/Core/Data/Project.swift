import SwiftData
import Foundation

@available(iOS 17.0, macOS 14.0, *)
@Model
final class Project: SyncableModel {
    var id: UUID
    var name: String
    var projectDescription: String?
    var color: String
    var status: ProjectStatus
    var priority: ProjectPriority
    var startDate: Date?
    var endDate: Date?
    var progress: Double
    var budget: Double?
    var actualCost: Double?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    // Relationships
    var tasks: [Task]
    var goals: [Goal]
    var notes: [Note]

    // Computed properties
    var isCompleted: Bool {
        return status == .completed
    }

    var isOverdue: Bool {
        guard let endDate = endDate, !isCompleted else { return false }
        return endDate < Date()
    }

    var completionPercentage: Double {
        guard !tasks.isEmpty else { return 0.0 }
        let completedTasks = tasks.filter { $0.isCompleted }.count
        return Double(completedTasks) / Double(tasks.count) * 100
    }

    var tableName: String { "projects" }

    init(
        name: String,
        description: String? = nil,
        color: String = "blue",
        priority: ProjectPriority = .medium,
        startDate: Date? = nil,
        endDate: Date? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.name = name
        self.projectDescription = description
        self.color = color
        self.status = .active
        self.priority = priority
        self.startDate = startDate
        self.endDate = endDate
        self.progress = 0.0
        self.budget = nil
        self.actualCost = nil
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
        self.tasks = []
        self.goals = []
        self.notes = []
    }

    func updateProgress() {
        let completedTasks = tasks.filter { $0.isCompleted }.count
        let totalTasks = tasks.count

        if totalTasks > 0 {
            progress = Double(completedTasks) / Double(totalTasks)
        } else {
            progress = 0.0
        }

        // Check if project should be marked as completed
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
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
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
        updatedAt = Date()
    }

    func addNote(_ note: Note) {
        note.project = self
        notes.append(note)
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    // MARK: - Sync Methods
    func updateFrom(_ remoteProject: RemoteProject) {
        self.name = remoteProject.name
        self.projectDescription = remoteProject.projectDescription
        self.color = remoteProject.color
        self.status = remoteProject.status
        self.priority = remoteProject.priority
        self.startDate = remoteProject.startDate
        self.endDate = remoteProject.endDate
        self.progress = remoteProject.progress
        self.budget = remoteProject.budget
        self.actualCost = remoteProject.actualCost
        self.updatedAt = remoteProject.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteProject() -> RemoteProject {
        RemoteProject(
            id: id,
            name: name,
            projectDescription: projectDescription,
            color: color,
            status: status,
            priority: priority,
            startDate: startDate,
            endDate: endDate,
            progress: progress,
            budget: budget,
            actualCost: actualCost,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    static func from(_ remoteProject: RemoteProject) -> Project {
        let project = Project(
            name: remoteProject.name,
            description: remoteProject.projectDescription,
            color: remoteProject.color,
            priority: remoteProject.priority,
            startDate: remoteProject.startDate,
            endDate: remoteProject.endDate,
            userId: remoteProject.userId
        )
        project.id = remoteProject.id
        project.status = remoteProject.status
        project.progress = remoteProject.progress
        project.budget = remoteProject.budget
        project.actualCost = remoteProject.actualCost
        project.createdAt = remoteProject.createdAt
        project.updatedAt = remoteProject.updatedAt
        project.needsSync = false
        project.isNew = false
        return project
    }
}

enum ProjectStatus: String, CaseIterable, Codable {
    case planning = "planning"
    case active = "active"
    case onHold = "on_hold"
    case completed = "completed"
    case cancelled = "cancelled"

    var displayName: String {
        switch self {
        case .planning: return "Planning"
        case .active: return "Active"
        case .onHold: return "On Hold"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }

    var color: String {
        switch self {
        case .planning: return "orange"
        case .active: return "blue"
        case .onHold: return "yellow"
        case .completed: return "green"
        case .cancelled: return "red"
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

// MARK: - Remote Data Types
struct RemoteProject: Codable {
    let id: UUID
    let name: String
    let projectDescription: String?
    let color: String
    let status: ProjectStatus
    let priority: ProjectPriority
    let startDate: Date?
    let endDate: Date?
    let progress: Double
    let budget: Double?
    let actualCost: Double?
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}