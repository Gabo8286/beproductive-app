import SwiftData
import Foundation

@available(iOS 17.0, macOS 14.0, *)
@Model
final class Note: SyncableModel {
    var id: UUID
    var title: String
    var content: String
    var tags: [String]
    var category: String?
    var isPinned: Bool
    var isArchived: Bool
    var isFavorite: Bool
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    // Relationships
    var project: Project?
    var task: Task?
    var attachments: [NoteAttachment]

    var tableName: String { "notes" }

    init(
        title: String,
        content: String = "",
        category: String? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.content = content
        self.tags = []
        self.category = category
        self.isPinned = false
        self.isArchived = false
        self.isFavorite = false
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
        self.attachments = []
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

    func pin() {
        isPinned = true
        needsSync = true
        lastModified = Date()
    }

    func unpin() {
        isPinned = false
        needsSync = true
        lastModified = Date()
    }

    func archive() {
        isArchived = true
        needsSync = true
        lastModified = Date()
    }

    func unarchive() {
        isArchived = false
        needsSync = true
        lastModified = Date()
    }
}

@available(iOS 17.0, macOS 14.0, *)
@Model
final class NoteAttachment {
    var id: UUID
    var noteId: UUID
    var fileName: String
    var fileURL: String
    var fileSize: Int64
    var mimeType: String
    var createdAt: Date

    init(noteId: UUID, fileName: String, fileURL: String, fileSize: Int64, mimeType: String) {
        self.id = UUID()
        self.noteId = noteId
        self.fileName = fileName
        self.fileURL = fileURL
        self.fileSize = fileSize
        self.mimeType = mimeType
        self.createdAt = Date()
    }
}