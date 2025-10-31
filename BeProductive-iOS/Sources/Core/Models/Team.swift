import SwiftData
import Foundation

@Model
final class Team: SyncableModel {
    var id: UUID
    var name: String
    var teamDescription: String?
    var isPublic: Bool
    var inviteCode: String?
    var createdAt: Date
    var updatedAt: Date
    var ownerId: UUID
    var userId: UUID // Required by SyncableModel protocol

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isSoftDeleted: Bool
    var isNew: Bool

    // Relationships
    var members: [TeamMember]
    var projects: [Project]

    var tableName: String { "teams" }

    var memberCount: Int {
        return members.count
    }

    var activeProjectsCount: Int {
        return projects.filter { $0.status == .active }.count
    }

    init(
        name: String,
        teamDescription: String? = nil,
        isPublic: Bool = false,
        ownerId: UUID
    ) {
        self.id = UUID()
        self.name = name
        self.teamDescription = teamDescription
        self.isPublic = isPublic
        self.inviteCode = generateInviteCode()
        self.createdAt = Date()
        self.updatedAt = Date()
        self.ownerId = ownerId
        self.userId = ownerId // Set userId to ownerId for SyncableModel compliance
        self.needsSync = true
        self.lastModified = Date()
        self.isSoftDeleted = false
        self.isNew = true
        self.members = []
        self.projects = []
    }

    private func generateInviteCode() -> String {
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return String((0..<8).map { _ in characters.randomElement()! })
    }

    func addMember(_ member: TeamMember) {
        member.teamId = self.id
        members.append(member)
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func removeMember(_ memberId: UUID) {
        members.removeAll { $0.userId == memberId }
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func regenerateInviteCode() {
        inviteCode = generateInviteCode()
        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }
}

@Model
final class TeamMember {
    var id: UUID
    var teamId: UUID
    var userId: UUID
    var role: TeamRole
    var joinedAt: Date
    var isActive: Bool

    // User info (cached for offline use)
    var userName: String
    var userEmail: String
    var userAvatarURL: String?

    init(
        teamId: UUID,
        userId: UUID,
        role: TeamRole = .member,
        userName: String,
        userEmail: String,
        userAvatarURL: String? = nil
    ) {
        self.id = UUID()
        self.teamId = teamId
        self.userId = userId
        self.role = role
        self.joinedAt = Date()
        self.isActive = true
        self.userName = userName
        self.userEmail = userEmail
        self.userAvatarURL = userAvatarURL
    }

    func updateRole(_ newRole: TeamRole) {
        role = newRole
    }

    func deactivate() {
        isActive = false
    }
}

enum TeamRole: String, CaseIterable, Codable {
    case owner = "owner"
    case admin = "admin"
    case member = "member"
    case viewer = "viewer"

    var displayName: String {
        switch self {
        case .owner: return "Owner"
        case .admin: return "Admin"
        case .member: return "Member"
        case .viewer: return "Viewer"
        }
    }

    var permissions: [TeamPermission] {
        switch self {
        case .owner:
            return TeamPermission.allCases
        case .admin:
            return [.read, .write, .invite, .manageMembers, .manageProjects]
        case .member:
            return [.read, .write, .invite]
        case .viewer:
            return [.read]
        }
    }
}

enum TeamPermission: String, CaseIterable {
    case read = "read"
    case write = "write"
    case invite = "invite"
    case manageMembers = "manage_members"
    case manageProjects = "manage_projects"
    case deleteTeam = "delete_team"
}