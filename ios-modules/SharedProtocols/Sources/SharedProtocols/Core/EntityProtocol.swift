import Foundation

// MARK: - Core Entity Protocol

/// Base protocol that all data entities must implement
/// Mirrors the TypeScript EntityProtocol interface for cross-platform consistency
public protocol EntityProtocol: Identifiable, Codable, Hashable, Sendable {
    /// Unique identifier for the entity
    var id: String { get }

    /// Timestamp when the entity was created
    var createdAt: Date { get }

    /// Timestamp when the entity was last updated
    var updatedAt: Date { get }

    /// Optional version number for optimistic locking
    var version: Int? { get }
}

// MARK: - Synchronizable Protocol

/// Protocol for entities that can be synchronized across platforms
/// Provides conflict resolution and sync status tracking
public protocol SynchronizableProtocol: EntityProtocol {
    /// Current synchronization status
    var syncStatus: SyncStatus { get }

    /// Timestamp of last successful sync
    var lastSyncAt: Date? { get }

    /// Data for conflict resolution if sync conflicts occur
    var conflictData: [String: Any]? { get }

    /// Update the sync status
    mutating func updateSyncStatus(_ status: SyncStatus)

    /// Mark as synced with timestamp
    mutating func markAsSynced(at timestamp: Date)

    /// Set conflict data for manual resolution
    mutating func setConflictData(_ data: [String: Any])
}

// MARK: - Searchable Protocol

/// Protocol for entities that support full-text search
/// Enables consistent search functionality across platforms
public protocol SearchableProtocol {
    /// Searchable text content
    var searchableText: String { get }

    /// Search tags for categorization
    var searchTags: [String] { get }

    /// Search priority for ranking results
    var searchPriority: Int { get }

    /// Update searchable content
    mutating func updateSearchableContent()

    /// Check if entity matches search query
    func matches(query: String) -> Bool
}

// MARK: - Cacheable Protocol

/// Protocol for entities that support local caching
/// Provides offline support and performance optimization
public protocol CacheableProtocol {
    /// Unique cache key for the entity
    var cacheKey: String { get }

    /// Optional cache expiry date
    var cacheExpiry: Date? { get }

    /// Cache priority for eviction policies
    var cachePriority: CachePriority { get }

    /// Check if cache entry is expired
    var isExpired: Bool { get }

    /// Refresh cache expiry
    mutating func refreshCacheExpiry(ttl: TimeInterval)
}

// MARK: - Supporting Enums

/// Synchronization status enumeration
public enum SyncStatus: String, Codable, CaseIterable, Sendable {
    case pending = "pending"
    case synced = "synced"
    case error = "error"
    case conflict = "conflict"

    /// Localized description for UI display
    public var localizedDescription: String {
        switch self {
        case .pending:
            return NSLocalizedString("sync.status.pending", comment: "Sync pending")
        case .synced:
            return NSLocalizedString("sync.status.synced", comment: "Synced")
        case .error:
            return NSLocalizedString("sync.status.error", comment: "Sync error")
        case .conflict:
            return NSLocalizedString("sync.status.conflict", comment: "Sync conflict")
        }
    }

    /// Whether the status indicates a problem
    public var isProblematic: Bool {
        switch self {
        case .error, .conflict:
            return true
        case .pending, .synced:
            return false
        }
    }
}

/// Cache priority enumeration
public enum CachePriority: Int, Codable, CaseIterable, Sendable {
    case low = 1
    case medium = 5
    case high = 10

    /// Localized description
    public var localizedDescription: String {
        switch self {
        case .low:
            return NSLocalizedString("cache.priority.low", comment: "Low priority")
        case .medium:
            return NSLocalizedString("cache.priority.medium", comment: "Medium priority")
        case .high:
            return NSLocalizedString("cache.priority.high", comment: "High priority")
        }
    }
}

// MARK: - Base Entity Implementation

/// Base implementation of EntityProtocol
/// Provides common functionality for all entities
public struct BaseEntity: EntityProtocol {
    public let id: String
    public let createdAt: Date
    public let updatedAt: Date
    public let version: Int?

    public init(
        id: String = UUID().uuidString,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        version: Int? = nil
    ) {
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.version = version
    }

    /// Create a new version with updated timestamp
    public func withUpdatedTimestamp() -> BaseEntity {
        BaseEntity(
            id: id,
            createdAt: createdAt,
            updatedAt: Date(),
            version: version.map { $0 + 1 }
        )
    }
}

// MARK: - Protocol Extensions

extension SynchronizableProtocol {
    /// Default implementation for updating sync status
    public mutating func updateSyncStatus(_ status: SyncStatus) {
        // Implementation would depend on the concrete type
        // This is a protocol extension providing default behavior
    }

    /// Default implementation for marking as synced
    public mutating func markAsSynced(at timestamp: Date = Date()) {
        updateSyncStatus(.synced)
        // Update lastSyncAt would be handled by concrete implementation
    }

    /// Check if entity needs sync
    public var needsSync: Bool {
        switch syncStatus {
        case .pending, .error, .conflict:
            return true
        case .synced:
            return false
        }
    }
}

extension SearchableProtocol {
    /// Default implementation for search matching
    public func matches(query: String) -> Bool {
        let lowercaseQuery = query.lowercased()
        let searchText = searchableText.lowercased()
        let searchTagsText = searchTags.joined(separator: " ").lowercased()

        return searchText.contains(lowercaseQuery) ||
               searchTagsText.contains(lowercaseQuery)
    }

    /// Extract search terms from query
    public func extractSearchTerms(from query: String) -> [String] {
        query.components(separatedBy: .whitespacesAndNewlines)
            .filter { !$0.isEmpty }
            .map { $0.lowercased() }
    }
}

extension CacheableProtocol {
    /// Default implementation for cache expiry check
    public var isExpired: Bool {
        guard let expiry = cacheExpiry else { return false }
        return Date() > expiry
    }

    /// Default implementation for cache key generation
    public var cacheKey: String {
        if let entity = self as? EntityProtocol {
            return "cache_\(type(of: self))_\(entity.id)"
        }
        return "cache_\(type(of: self))_\(UUID().uuidString)"
    }
}

// MARK: - Utility Functions

/// Generate a new entity ID
public func generateEntityID() -> String {
    UUID().uuidString
}

/// Create timestamp for current time
public func currentTimestamp() -> Date {
    Date()
}

/// Check if two entities are the same version
public func areEntitiesEqual<T: EntityProtocol>(_ lhs: T, _ rhs: T) -> Bool {
    lhs.id == rhs.id &&
    lhs.version == rhs.version &&
    lhs.updatedAt == rhs.updatedAt
}

/// Compare entity versions for conflict resolution
public func compareEntityVersions<T: EntityProtocol>(_ lhs: T, _ rhs: T) -> ComparisonResult {
    // First compare by version if available
    if let lhsVersion = lhs.version, let rhsVersion = rhs.version {
        return lhsVersion.compare(to: rhsVersion)
    }

    // Fall back to timestamp comparison
    return lhs.updatedAt.compare(rhs.updatedAt)
}

// MARK: - Comparable Extension for Int

extension Int {
    fileprivate func compare(to other: Int) -> ComparisonResult {
        if self < other {
            return .orderedAscending
        } else if self > other {
            return .orderedDescending
        } else {
            return .orderedSame
        }
    }
}