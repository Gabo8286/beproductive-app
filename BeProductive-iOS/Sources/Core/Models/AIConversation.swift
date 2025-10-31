import SwiftData
import Foundation

@available(iOS 17, *)
@Model
final class AIConversation: SyncableModel {
    var id: UUID
    var title: String
    var aiProvider: AIProvider
    var model: String
    var systemPrompt: String?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID
    var isActive: Bool

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    // Relationships
    var messages: [AIMessage]

    // Computed properties
    var lastMessage: AIMessage? {
        messages.sorted { $0.createdAt > $1.createdAt }.first
    }

    var messageCount: Int {
        messages.count
    }

    var tableName: String { "ai_conversations" }

    init(
        title: String,
        aiProvider: AIProvider = .openai,
        model: String = "gpt-4",
        systemPrompt: String? = nil,
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.aiProvider = aiProvider
        self.model = model
        self.systemPrompt = systemPrompt
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.isActive = true
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
        self.messages = []
    }

    func addMessage(_ content: String, role: AIMessageRole) {
        let message = AIMessage(
            conversationId: id,
            content: content,
            role: role,
            userId: userId
        )
        messages.append(message)
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func updateTitle(_ newTitle: String) {
        title = newTitle
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func archive() {
        isActive = false
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func restore() {
        isActive = true
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func updateFrom(_ remoteConversation: RemoteAIConversation) {
        self.title = remoteConversation.title
        self.aiProvider = remoteConversation.aiProvider
        self.model = remoteConversation.model
        self.systemPrompt = remoteConversation.systemPrompt
        self.isActive = remoteConversation.isActive
        self.updatedAt = remoteConversation.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteConversation() -> RemoteAIConversation {
        RemoteAIConversation(
            id: id,
            title: title,
            aiProvider: aiProvider,
            model: model,
            systemPrompt: systemPrompt,
            isActive: isActive,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    @available(iOS 17, *)
    static func from(_ remoteConversation: RemoteAIConversation) -> AIConversation {
        let conversation = AIConversation(
            title: remoteConversation.title,
            aiProvider: remoteConversation.aiProvider,
            model: remoteConversation.model,
            systemPrompt: remoteConversation.systemPrompt,
            userId: remoteConversation.userId
        )
        conversation.id = remoteConversation.id
        conversation.isActive = remoteConversation.isActive
        conversation.createdAt = remoteConversation.createdAt
        conversation.updatedAt = remoteConversation.updatedAt
        conversation.needsSync = false
        conversation.isNew = false
        return conversation
    }
}

@available(iOS 17, *)
@Model
final class AIMessage {
    var id: UUID
    var conversationId: UUID
    var content: String
    var role: AIMessageRole
    var metadata: [String: String]
    var createdAt: Date
    var userId: UUID

    init(
        conversationId: UUID,
        content: String,
        role: AIMessageRole,
        metadata: [String: String] = [:],
        userId: UUID
    ) {
        self.id = UUID()
        self.conversationId = conversationId
        self.content = content
        self.role = role
        self.metadata = metadata
        self.createdAt = Date()
        self.userId = userId
    }
}

enum AIProvider: String, CaseIterable, Codable {
    case openai = "openai"
    case anthropic = "anthropic"
    case google = "google"

    var displayName: String {
        switch self {
        case .openai: return "OpenAI"
        case .anthropic: return "Anthropic"
        case .google: return "Google"
        }
    }

    var iconName: String {
        switch self {
        case .openai: return "brain"
        case .anthropic: return "cpu"
        case .google: return "globe"
        }
    }

    var defaultModel: String {
        switch self {
        case .openai: return "gpt-4"
        case .anthropic: return "claude-3-sonnet"
        case .google: return "gemini-pro"
        }
    }

    var availableModels: [String] {
        switch self {
        case .openai:
            return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
        case .anthropic:
            return ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]
        case .google:
            return ["gemini-pro", "gemini-pro-vision"]
        }
    }
}

enum AIMessageRole: String, CaseIterable, Codable {
    case system = "system"
    case user = "user"
    case assistant = "assistant"
    case function = "function"

    var displayName: String {
        switch self {
        case .system: return "System"
        case .user: return "User"
        case .assistant: return "Assistant"
        case .function: return "Function"
        }
    }

    var iconName: String {
        switch self {
        case .system: return "gear"
        case .user: return "person"
        case .assistant: return "brain"
        case .function: return "function"
        }
    }
}

// MARK: - Remote Data Types
struct RemoteAIConversation: Codable {
    let id: UUID
    let title: String
    let aiProvider: AIProvider
    let model: String
    let systemPrompt: String?
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}

struct RemoteAIMessage: Codable {
    let id: UUID
    let conversationId: UUID
    let content: String
    let role: AIMessageRole
    let metadata: [String: String]
    let createdAt: Date
    let userId: UUID
}
