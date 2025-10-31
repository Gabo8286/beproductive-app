import Foundation

// MARK: - Sync Protocol
protocol SyncableModel {
    var id: UUID { get set }
    var needsSync: Bool { get set }
    var lastModified: Date { get set }
    var isDeleted: Bool { get set }
    var isNew: Bool { get set }
    var createdAt: Date { get set }
    var updatedAt: Date { get set }
    var userId: UUID { get set }
    var tableName: String { get }
}