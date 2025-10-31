// MARK: - TaskModel Extensions
// This file contains extensions and additional functionality for the Task model
// The main Task model is defined in Task.swift

import SwiftUI
import SwiftData
import Foundation

// MARK: - Task Filtering and Sorting

enum TodoTaskFilter: String, CaseIterable {
    case all = "all"
    case completed = "completed"
    case pending = "pending"
    case overdue = "overdue"
    case today = "today"
    case upcoming = "upcoming"

    var displayName: String {
        switch self {
        case .all: return "All"
        case .completed: return "Completed"
        case .pending: return "Pending"
        case .overdue: return "Overdue"
        case .today: return "Today"
        case .upcoming: return "Upcoming"
        }
    }
}

enum TodoTaskSort: String, CaseIterable {
    case dueDate = "dueDate"
    case priority = "priority"
    case title = "title"
    case dateCreated = "dateCreated"
    case dateCompleted = "dateCompleted"

    var displayName: String {
        switch self {
        case .dueDate: return "Due Date"
        case .priority: return "Priority"
        case .title: return "Title"
        case .dateCreated: return "Date Created"
        case .dateCompleted: return "Date Completed"
        }
    }
}

// MARK: - Task Priority (alias for consistency)
typealias TodoTaskPriority = TaskPriorityLevel

// MARK: - Task Errors

enum TodoTaskError: Error, LocalizedError {
    case taskNotFound
    case invalidTitle
    case invalidDueDate
    case saveFailed(Error)
    case deleteFailed(Error)
    case syncFailed(Error)
    case attachmentUploadFailed(Error)
    case invalidAttachment

    var errorDescription: String? {
        switch self {
        case .taskNotFound:
            return "Task not found"
        case .invalidTitle:
            return "Invalid task title"
        case .invalidDueDate:
            return "Invalid due date"
        case .saveFailed(let error):
            return "Failed to save task: \(error.localizedDescription)"
        case .deleteFailed(let error):
            return "Failed to delete task: \(error.localizedDescription)"
        case .syncFailed(let error):
            return "Failed to sync task: \(error.localizedDescription)"
        case .attachmentUploadFailed(let error):
            return "Failed to upload attachment: \(error.localizedDescription)"
        case .invalidAttachment:
            return "Invalid attachment"
        }
    }
}

// MARK: - Task Attachments

struct TodoTaskAttachment: Codable, Identifiable {
    let id: UUID
    let taskId: UUID
    let fileName: String
    let fileSize: Int64
    let mimeType: String
    let uploadedAt: Date
    let localURL: URL?
    let remoteURL: URL?

    init(
        id: UUID = UUID(),
        taskId: UUID,
        fileName: String,
        fileSize: Int64,
        mimeType: String,
        uploadedAt: Date = Date(),
        localURL: URL? = nil,
        remoteURL: URL? = nil
    ) {
        self.id = id
        self.taskId = taskId
        self.fileName = fileName
        self.fileSize = fileSize
        self.mimeType = mimeType
        self.uploadedAt = uploadedAt
        self.localURL = localURL
        self.remoteURL = remoteURL
    }
}

// MARK: - Task Comments

struct TodoTaskComment: Codable, Identifiable {
    let id: UUID
    let taskId: UUID
    let authorId: UUID
    let authorName: String
    let content: String
    let createdAt: Date
    let updatedAt: Date

    init(
        id: UUID = UUID(),
        taskId: UUID,
        authorId: UUID,
        authorName: String,
        content: String,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.taskId = taskId
        self.authorId = authorId
        self.authorName = authorName
        self.content = content
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - Task Model Extensions
// Additional computed properties and helper methods can be added here if needed

// MARK: - Supporting Models
// Note: Other models (Project, Note, Habit, ProductivityMetric) are defined in their respective files
// Task model is defined in Task.swift
// RemoteTask model is defined in DataManager.swift



