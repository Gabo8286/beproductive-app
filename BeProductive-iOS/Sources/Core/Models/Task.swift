import SwiftData
import Foundation

@available(iOS 17.0, macOS 14.0, watchOS 10.0, tvOS 17.0, *)
@Model
final class TodoTask: SyncableModel {
    var id: UUID
    var title: String
    var taskDescription: String?
    var isCompleted: Bool
    var priority: TaskPriorityLevel
    var status: TaskStatus
    var category: String?
    var tags: [String]
    var dueDate: Date?
    var startDate: Date?
    var completedDate: Date?
    var estimatedDuration: TimeInterval?
    var actualDuration: TimeInterval?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isSoftDeleted: Bool
    var isNew: Bool

    // Relationships
    var project: Project?
    var goal: Goal?
    var subtasks: [TodoTask]
    var parentTask: TodoTask?
    var attachments: [TaskAttachment]
    var comments: [TaskComment]

    // Computed properties
    var isOverdue: Bool {
        guard let dueDate = dueDate, !isCompleted else { return false }
        return dueDate < Date()
    }

    var progress: Double {
        guard !subtasks.isEmpty else { return isCompleted ? 1.0 : 0.0 }
        let completedSubtasks = subtasks.filter { $0.isCompleted }.count
        return Double(completedSubtasks) / Double(subtasks.count)
    }

    var tableName: String { "tasks" }

    init(
        title: String,
        taskDescription: String? = nil,
        priority: TaskPriorityLevel = .medium,
        category: String? = nil,
        dueDate: Date? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.taskDescription = taskDescription
        self.isCompleted = false
        self.priority = priority
        self.status = .todo
        self.category = category
        self.tags = []
        self.dueDate = dueDate
        self.startDate = nil
        self.completedDate = nil
        self.estimatedDuration = nil
        self.actualDuration = nil
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isSoftDeleted = false
        self.isNew = true
        self.subtasks = []
        self.attachments = []
        self.comments = []
    }

    func updateFrom(_ remoteTask: RemoteTask) {
        self.title = remoteTask.title
        self.taskDescription = remoteTask.description
        self.isCompleted = remoteTask.isCompleted
        self.priority = TaskPriorityLevel(rawValue: remoteTask.priority) ?? .medium
        self.dueDate = remoteTask.dueDate
        self.updatedAt = remoteTask.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteTask() -> RemoteTask {
        RemoteTask(
            id: id,
            title: title,
            description: taskDescription,
            isCompleted: isCompleted,
            priority: priority.rawValue,
            dueDate: dueDate,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    static func from(_ remoteTask: RemoteTask) -> TodoTask {
        let task = TodoTask(
            title: remoteTask.title,
            taskDescription: remoteTask.description,
            priority: TaskPriorityLevel(rawValue: remoteTask.priority) ?? .medium,
            dueDate: remoteTask.dueDate,
            userId: remoteTask.userId
        )
        task.id = remoteTask.id
        task.isCompleted = remoteTask.isCompleted
        task.createdAt = remoteTask.createdAt
        task.updatedAt = remoteTask.updatedAt
        task.needsSync = false
        task.isNew = false
        return task
    }

    func markCompleted() {
        isCompleted = true
        completedDate = Date()
        status = .completed
        needsSync = true
        lastModified = Date()
    }

    func markIncomplete() {
        isCompleted = false
        completedDate = nil
        status = .todo
        needsSync = true
        lastModified = Date()
    }

    func startTask() {
        startDate = Date()
        status = .inProgress
        needsSync = true
        lastModified = Date()
    }

    func addSubtask(_ subtask: TodoTask) {
        subtask.parentTask = self
        subtasks.append(subtask)
        needsSync = true
        lastModified = Date()
    }

    func addTag(_ tag: String) {
        if !tags.contains(tag) {
            tags.append(tag)
            needsSync = true
            lastModified = Date()
        }
    }

    func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
        needsSync = true
        lastModified = Date()
    }
}

enum TaskPriorityLevel: Int, CaseIterable, Codable {
    case low = 1
    case medium = 2
    case high = 3
    case urgent = 4

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }

    var color: String {
        switch self {
        case .low: return "gray"
        case .medium: return "blue"
        case .high: return "orange"
        case .urgent: return "red"
        }
    }
}

enum TaskStatus: String, CaseIterable, Codable {
    case todo = "todo"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"
    case onHold = "on_hold"

    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .onHold: return "On Hold"
        }
    }
}

@available(iOS 17.0, macOS 14.0, watchOS 10.0, tvOS 17.0, *)
@Model
final class TaskAttachment {
    var id: UUID
    var taskId: UUID
    var fileName: String
    var fileURL: String
    var fileSize: Int64
    var mimeType: String
    var createdAt: Date

    init(taskId: UUID, fileName: String, fileURL: String, fileSize: Int64, mimeType: String) {
        self.id = UUID()
        self.taskId = taskId
        self.fileName = fileName
        self.fileURL = fileURL
        self.fileSize = fileSize
        self.mimeType = mimeType
        self.createdAt = Date()
    }
}

// MARK: - Remote Data Types
struct RemoteTask: Codable {
    let id: UUID
    let title: String
    let description: String?
    let isCompleted: Bool
    let priority: Int
    let dueDate: Date?
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}

@available(iOS 17.0, macOS 14.0, watchOS 10.0, tvOS 17.0, *)
@Model
final class TaskComment {
    var id: UUID
    var taskId: UUID
    var userId: UUID
    var content: String
    var createdAt: Date
    var updatedAt: Date

    init(taskId: UUID, userId: UUID, content: String) {
        self.id = UUID()
        self.taskId = taskId
        self.userId = userId
        self.content = content
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}