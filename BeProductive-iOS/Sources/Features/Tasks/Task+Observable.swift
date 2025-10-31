import Foundation
import Observation

// Modern Observable Task model for iOS 17+
@Observable
class TodoTask: Identifiable {
    let id = UUID()
    var title: String
    var taskDescription: String?
    var priority: TodoTaskPriority
    var category: String?
    var dueDate: Date?
    var estimatedDuration: TimeInterval?
    var tags: [String]
    var isCompleted: Bool
    var createdAt: Date
    var updatedAt: Date
    let userId: UUID
    
    init(title: String, priority: TodoTaskPriority, category: String? = nil, userId: UUID) {
        self.title = title
        self.priority = priority
        self.category = category
        self.userId = userId
        self.tags = []
        self.isCompleted = false
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// If you need to support iOS 16 and earlier, use this ObservableObject version instead:
/*
import Foundation
import Combine

class TodoTask: ObservableObject, Identifiable {
    let id = UUID()
    @Published var title: String
    @Published var taskDescription: String?
    @Published var priority: TodoTaskPriority
    @Published var category: String?
    @Published var dueDate: Date?
    @Published var estimatedDuration: TimeInterval?
    @Published var tags: [String]
    @Published var isCompleted: Bool
    @Published var createdAt: Date
    @Published var updatedAt: Date
    let userId: UUID
    
    init(title: String, priority: TodoTaskPriority, category: String? = nil, userId: UUID) {
        self.title = title
        self.priority = priority
        self.category = category
        self.userId = userId
        self.tags = []
        self.isCompleted = false
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
*/

// Task Priority enum
enum TodoTaskPriority: String, CaseIterable, Codable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"
    
    var displayName: String {
        switch self {
        case .low:
            return "Low"
        case .medium:
            return "Medium"
        case .high:
            return "High"
        case .urgent:
            return "Urgent"
        }
    }
}