import Foundation
import SharedProtocols

// MARK: - Task Protocol

/// Task protocol that mirrors the TypeScript TaskProtocol interface
/// Provides cross-platform consistency for task management
public protocol TaskProtocol: EntityProtocol, SynchronizableProtocol, SearchableProtocol {
    /// Task title
    var title: String { get }

    /// Optional task description
    var description: String? { get }

    /// Current task status
    var status: TaskStatus { get }

    /// Task priority level
    var priority: TaskPriority { get }

    /// Optional due date
    var dueDate: Date? { get }

    /// Completion timestamp
    var completedAt: Date? { get }

    /// Estimated duration in minutes
    var estimatedDuration: Int? { get }

    /// Actual duration in minutes
    var actualDuration: Int? { get }

    /// Associated tags
    var tags: [String] { get }

    /// Parent task ID for hierarchical tasks
    var parentTaskId: String? { get }

    /// Subtask IDs
    var subtaskIds: [String] { get }

    /// Associated project ID
    var projectId: String? { get }

    /// Assigned user ID
    var assignedUserId: String? { get }

    /// Recurrence pattern if applicable
    var recurrence: RecurrencePattern? { get }

    /// Update task status
    mutating func updateStatus(_ status: TaskStatus)

    /// Mark task as completed
    mutating func markCompleted(at date: Date)

    /// Update task progress
    mutating func updateProgress(estimatedDuration: Int?, actualDuration: Int?)

    /// Add subtask
    mutating func addSubtask(id: String)

    /// Remove subtask
    mutating func removeSubtask(id: String)
}

// MARK: - Supporting Enums

/// Task status enumeration
public enum TaskStatus: String, Codable, CaseIterable, Sendable {
    case pending = "pending"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"

    /// Localized description
    public var localizedDescription: String {
        switch self {
        case .pending:
            return NSLocalizedString("task.status.pending", comment: "Pending")
        case .inProgress:
            return NSLocalizedString("task.status.in_progress", comment: "In Progress")
        case .completed:
            return NSLocalizedString("task.status.completed", comment: "Completed")
        case .cancelled:
            return NSLocalizedString("task.status.cancelled", comment: "Cancelled")
        }
    }

    /// System color for status
    public var systemColor: String {
        switch self {
        case .pending:
            return "systemGray"
        case .inProgress:
            return "systemBlue"
        case .completed:
            return "systemGreen"
        case .cancelled:
            return "systemRed"
        }
    }

    /// Whether task is considered active
    public var isActive: Bool {
        switch self {
        case .pending, .inProgress:
            return true
        case .completed, .cancelled:
            return false
        }
    }

    /// Whether task is finished
    public var isFinished: Bool {
        switch self {
        case .completed, .cancelled:
            return true
        case .pending, .inProgress:
            return false
        }
    }
}

/// Task priority enumeration
public enum TaskPriority: String, Codable, CaseIterable, Sendable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"

    /// Numeric value for sorting
    public var sortOrder: Int {
        switch self {
        case .low:
            return 1
        case .medium:
            return 2
        case .high:
            return 3
        case .urgent:
            return 4
        }
    }

    /// Localized description
    public var localizedDescription: String {
        switch self {
        case .low:
            return NSLocalizedString("task.priority.low", comment: "Low Priority")
        case .medium:
            return NSLocalizedString("task.priority.medium", comment: "Medium Priority")
        case .high:
            return NSLocalizedString("task.priority.high", comment: "High Priority")
        case .urgent:
            return NSLocalizedString("task.priority.urgent", comment: "Urgent")
        }
    }

    /// System color for priority
    public var systemColor: String {
        switch self {
        case .low:
            return "systemGray"
        case .medium:
            return "systemBlue"
        case .high:
            return "systemOrange"
        case .urgent:
            return "systemRed"
        }
    }
}

// MARK: - Recurrence Protocol

/// Protocol for recurring task patterns
public protocol RecurrenceProtocol: Codable, Sendable {
    /// Recurrence pattern type
    var pattern: RecurrencePattern { get }

    /// Interval between recurrences
    var interval: Int { get }

    /// Days of week for weekly patterns (0-6, Sunday = 0)
    var daysOfWeek: [Int]? { get }

    /// End date for recurrence
    var endDate: Date? { get }

    /// Maximum number of occurrences
    var maxOccurrences: Int? { get }

    /// Whether to skip weekends
    var skipWeekends: Bool { get }

    /// Calculate next occurrence date
    func nextOccurrence(after date: Date) -> Date?

    /// Check if recurrence is active
    func isActive(at date: Date) -> Bool
}

/// Recurrence pattern enumeration
public enum RecurrencePattern: String, Codable, CaseIterable, Sendable {
    case daily = "daily"
    case weekly = "weekly"
    case monthly = "monthly"
    case yearly = "yearly"
    case custom = "custom"

    /// Localized description
    public var localizedDescription: String {
        switch self {
        case .daily:
            return NSLocalizedString("recurrence.daily", comment: "Daily")
        case .weekly:
            return NSLocalizedString("recurrence.weekly", comment: "Weekly")
        case .monthly:
            return NSLocalizedString("recurrence.monthly", comment: "Monthly")
        case .yearly:
            return NSLocalizedString("recurrence.yearly", comment: "Yearly")
        case .custom:
            return NSLocalizedString("recurrence.custom", comment: "Custom")
        }
    }
}

// MARK: - Task Template Protocol

/// Protocol for task templates that can generate standardized tasks
public protocol TaskTemplateProtocol: EntityProtocol {
    /// Template name
    var name: String { get }

    /// Template description
    var description: String? { get }

    /// Default estimated duration
    var estimatedDuration: Int? { get }

    /// Default priority
    var priority: TaskPriority { get }

    /// Default tags
    var tags: [String] { get }

    /// Subtask templates
    var subtaskTemplates: [TaskTemplateProtocol] { get }

    /// Template category
    var category: String { get }

    /// Usage count for analytics
    var usageCount: Int { get }

    /// Create task from template
    func createTask(
        title: String?,
        dueDate: Date?,
        assignedUserId: String?
    ) -> any TaskProtocol
}

// MARK: - Concrete Implementation

/// Concrete implementation of TaskProtocol
public struct Task: TaskProtocol {
    // MARK: - EntityProtocol
    public let id: String
    public let createdAt: Date
    public let updatedAt: Date
    public let version: Int?

    // MARK: - SynchronizableProtocol
    public var syncStatus: SyncStatus
    public var lastSyncAt: Date?
    public var conflictData: [String: Any]?

    // MARK: - TaskProtocol
    public var title: String
    public var description: String?
    public var status: TaskStatus
    public var priority: TaskPriority
    public var dueDate: Date?
    public var completedAt: Date?
    public var estimatedDuration: Int?
    public var actualDuration: Int?
    public var tags: [String]
    public var parentTaskId: String?
    public var subtaskIds: [String]
    public var projectId: String?
    public var assignedUserId: String?
    public var recurrence: RecurrencePattern?

    // MARK: - Initialization
    public init(
        id: String = UUID().uuidString,
        title: String,
        description: String? = nil,
        status: TaskStatus = .pending,
        priority: TaskPriority = .medium,
        dueDate: Date? = nil,
        tags: [String] = [],
        parentTaskId: String? = nil,
        projectId: String? = nil,
        assignedUserId: String? = nil,
        recurrence: RecurrencePattern? = nil
    ) {
        self.id = id
        self.createdAt = Date()
        self.updatedAt = Date()
        self.version = 1
        self.syncStatus = .pending
        self.lastSyncAt = nil
        self.conflictData = nil

        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.dueDate = dueDate
        self.completedAt = nil
        self.estimatedDuration = nil
        self.actualDuration = nil
        self.tags = tags
        self.parentTaskId = parentTaskId
        self.subtaskIds = []
        self.projectId = projectId
        self.assignedUserId = assignedUserId
        self.recurrence = recurrence
    }

    // MARK: - SearchableProtocol
    public var searchableText: String {
        var text = title
        if let desc = description {
            text += " " + desc
        }
        text += " " + tags.joined(separator: " ")
        return text
    }

    public var searchTags: [String] {
        var allTags = tags
        allTags.append(status.rawValue)
        allTags.append(priority.rawValue)
        return allTags
    }

    public var searchPriority: Int {
        priority.sortOrder
    }

    public mutating func updateSearchableContent() {
        // Search content is computed, no manual update needed
    }

    // MARK: - TaskProtocol Methods
    public mutating func updateStatus(_ status: TaskStatus) {
        self.status = status
        if status == .completed && completedAt == nil {
            completedAt = Date()
        } else if status != .completed {
            completedAt = nil
        }
        syncStatus = .pending
    }

    public mutating func markCompleted(at date: Date = Date()) {
        status = .completed
        completedAt = date
        syncStatus = .pending
    }

    public mutating func updateProgress(estimatedDuration: Int?, actualDuration: Int?) {
        self.estimatedDuration = estimatedDuration
        self.actualDuration = actualDuration
        syncStatus = .pending
    }

    public mutating func addSubtask(id: String) {
        if !subtaskIds.contains(id) {
            subtaskIds.append(id)
            syncStatus = .pending
        }
    }

    public mutating func removeSubtask(id: String) {
        subtaskIds.removeAll { $0 == id }
        syncStatus = .pending
    }

    // MARK: - SynchronizableProtocol Methods
    public mutating func updateSyncStatus(_ status: SyncStatus) {
        self.syncStatus = status
    }

    public mutating func markAsSynced(at timestamp: Date = Date()) {
        syncStatus = .synced
        lastSyncAt = timestamp
    }

    public mutating func setConflictData(_ data: [String: Any]) {
        conflictData = data
        syncStatus = .conflict
    }
}

// MARK: - Task Extensions

extension Task {
    /// Check if task is overdue
    public var isOverdue: Bool {
        guard let dueDate = dueDate else { return false }
        return Date() > dueDate && !status.isFinished
    }

    /// Check if task is due today
    public var isDueToday: Bool {
        guard let dueDate = dueDate else { return false }
        return Calendar.current.isDateInToday(dueDate)
    }

    /// Check if task is due this week
    public var isDueThisWeek: Bool {
        guard let dueDate = dueDate else { return false }
        return Calendar.current.isDate(dueDate, equalTo: Date(), toGranularity: .weekOfYear)
    }

    /// Duration statistics
    public var durationAccuracy: Double? {
        guard let estimated = estimatedDuration,
              let actual = actualDuration,
              estimated > 0 else { return nil }

        return Double(actual) / Double(estimated)
    }

    /// Progress percentage for subtasks
    public var subtaskProgress: Double {
        // This would require access to subtask data
        // In a real implementation, this would be computed from subtask completion
        return 0.0
    }
}

// MARK: - Comparable Implementation

extension TaskPriority: Comparable {
    public static func < (lhs: TaskPriority, rhs: TaskPriority) -> Bool {
        lhs.sortOrder < rhs.sortOrder
    }
}

// MARK: - Task Validation

extension Task {
    /// Validate task data
    public var isValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Validation errors
    public var validationErrors: [String] {
        var errors: [String] = []

        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errors.append("Title cannot be empty")
        }

        if let dueDate = dueDate, dueDate < createdAt {
            errors.append("Due date cannot be before creation date")
        }

        if let estimated = estimatedDuration, estimated <= 0 {
            errors.append("Estimated duration must be positive")
        }

        if let actual = actualDuration, actual < 0 {
            errors.append("Actual duration cannot be negative")
        }

        return errors
    }
}