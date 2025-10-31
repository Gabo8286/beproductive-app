import SwiftUI

/// BeProductive Chat Message Component
///
/// A comprehensive chat message component designed for AI conversations and team communications,
/// supporting various message types, attachments, reactions, and interactive elements.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPChatMessage: View {

    // MARK: - Properties

    private let message: MessageData
    private let style: MessageStyle
    private let showAvatar: Bool
    private let showTimestamp: Bool
    private let showActions: Bool
    private let onReply: ((MessageData) -> Void)?
    private let onReaction: ((MessageData, ReactionType) -> Void)?
    private let onCopy: ((MessageData) -> Void)?
    private let onEdit: ((MessageData) -> Void)?

    @Environment(\.bpTheme) private var theme
    @State private var isExpanded = false
    @State private var showReactions = false

    // MARK: - Message Data Model

    public struct MessageData {
        public let id: String
        public let content: String
        public let sender: Sender
        public let timestamp: Date
        public let type: MessageType
        public let status: MessageStatus
        public let reactions: [ReactionType: Int]
        public let attachments: [Attachment]
        public let replyToID: String?
        public let isEdited: Bool
        public let metadata: [String: Any]

        public init(
            id: String = UUID().uuidString,
            content: String,
            sender: Sender,
            timestamp: Date = Date(),
            type: MessageType = .text,
            status: MessageStatus = .sent,
            reactions: [ReactionType: Int] = [:],
            attachments: [Attachment] = [],
            replyToID: String? = nil,
            isEdited: Bool = false,
            metadata: [String: Any] = [:]
        ) {
            self.id = id
            self.content = content
            self.sender = sender
            self.timestamp = timestamp
            self.type = type
            self.status = status
            self.reactions = reactions
            self.attachments = attachments
            self.replyToID = replyToID
            self.isEdited = isEdited
            self.metadata = metadata
        }
    }

    // MARK: - Supporting Types

    public struct Sender {
        public let id: String
        public let name: String
        public let avatarURL: String?
        public let role: SenderRole
        public let isBot: Bool

        public init(
            id: String,
            name: String,
            avatarURL: String? = nil,
            role: SenderRole = .user,
            isBot: Bool = false
        ) {
            self.id = id
            self.name = name
            self.avatarURL = avatarURL
            self.role = role
            self.isBot = isBot
        }
    }

    public enum SenderRole: String, CaseIterable {
        case user = "User"
        case assistant = "AI Assistant"
        case admin = "Admin"
        case system = "System"
        case guest = "Guest"

        var color: Color {
            switch self {
            case .user:
                return .blue
            case .assistant:
                return .purple
            case .admin:
                return .red
            case .system:
                return .gray
            case .guest:
                return .orange
            }
        }
    }

    public enum MessageType {
        case text
        case code
        case markdown
        case ai_response
        case system_notification
        case task_update
        case file_share
        case reminder
    }

    public enum MessageStatus {
        case sending
        case sent
        case delivered
        case read
        case failed
        case typing
    }

    public enum ReactionType: String, CaseIterable {
        case thumbsUp = "👍"
        case thumbsDown = "👎"
        case heart = "❤️"
        case laugh = "😄"
        case surprised = "😮"
        case thinking = "🤔"
        case checkmark = "✅"
        case fire = "🔥"

        var emoji: String {
            return self.rawValue
        }
    }

    public struct Attachment {
        public let id: String
        public let name: String
        public let type: AttachmentType
        public let size: Int64?
        public let url: URL?

        public enum AttachmentType {
            case image
            case document
            case audio
            case video
            case code
            case link
        }

        public init(
            id: String = UUID().uuidString,
            name: String,
            type: AttachmentType,
            size: Int64? = nil,
            url: URL? = nil
        ) {
            self.id = id
            self.name = name
            self.type = type
            self.size = size
            self.url = url
        }
    }

    // MARK: - Message Styles

    public enum MessageStyle {
        case bubble
        case card
        case minimal
        case system
        case ai_enhanced
    }

    // MARK: - Initializer

    public init(
        message: MessageData,
        style: MessageStyle = .bubble,
        showAvatar: Bool = true,
        showTimestamp: Bool = true,
        showActions: Bool = true,
        onReply: ((MessageData) -> Void)? = nil,
        onReaction: ((MessageData, ReactionType) -> Void)? = nil,
        onCopy: ((MessageData) -> Void)? = nil,
        onEdit: ((MessageData) -> Void)? = nil
    ) {
        self.message = message
        self.style = style
        self.showAvatar = showAvatar
        self.showTimestamp = showTimestamp
        self.showActions = showActions
        self.onReply = onReply
        self.onReaction = onReaction
        self.onCopy = onCopy
        self.onEdit = onEdit
    }

    // MARK: - Body

    public var body: some View {
        VStack(spacing: theme.spacing.xs) {
            // Reply context
            if let replyToID = message.replyToID {
                replyContext(replyToID)
            }

            // Main message
            HStack(alignment: .bottom, spacing: theme.spacing.sm) {
                if isFromCurrentUser {
                    Spacer(minLength: 40)
                }

                if showAvatar && !isFromCurrentUser {
                    avatarView
                }

                messageContent

                if isFromCurrentUser && showAvatar {
                    avatarView
                }

                if !isFromCurrentUser {
                    Spacer(minLength: 40)
                }
            }

            // Reactions
            if !message.reactions.isEmpty {
                reactionsView
            }

            // Actions
            if showActions && !isSystemMessage {
                actionsView
            }
        }
        .padding(.horizontal, theme.spacing.md)
        .padding(.vertical, theme.spacing.xs)
    }

    // MARK: - Message Content

    @ViewBuilder
    private var messageContent: some View {
        VStack(alignment: messageAlignment, spacing: theme.spacing.xs) {
            if !isFromCurrentUser && showSenderName {
                senderHeader
            }

            messageBody

            if showTimestamp {
                timestampView
            }
        }
    }

    private var messageBody: some View {
        VStack(alignment: .leading, spacing: theme.spacing.sm) {
            // Message text
            messageText

            // Attachments
            if !message.attachments.isEmpty {
                attachmentsView
            }

            // Status indicator
            if isFromCurrentUser {
                statusIndicator
            }
        }
        .padding(messagePadding)
        .background(messageBackground)
        .overlay(messageBorder)
        .clipShape(messageShape)
        .apply(if: style == .ai_enhanced && message.sender.isBot) { view in
            view.overlay(aiGradientBorder)
        }
    }

    private var messageText: some View {
        Group {
            switch message.type {
            case .code:
                codeMessageView
            case .markdown:
                markdownMessageView
            case .ai_response:
                aiResponseView
            case .system_notification:
                systemNotificationView
            default:
                regularMessageView
            }
        }
    }

    private var regularMessageView: some View {
        BPText(
            message.content,
            style: message.sender.isBot ? .aiMessage : .userMessage,
            color: messageTextColor
        )
        .multilineTextAlignment(.leading)
    }

    private var codeMessageView: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            HStack {
                BPText("Code", style: .captionSmall, color: .tertiary)
                Spacer()
                Button("Copy") {
                    onCopy?(message)
                }
                .font(.caption)
                .foregroundColor(theme.colors.primary.main)
            }

            BPText(message.content, style: .monoMedium, color: messageTextColor)
                .padding(theme.spacing.sm)
                .background(theme.colors.neutral._100)
                .clipShape(RoundedRectangle(cornerRadius: theme.borders.smallRadius))
        }
    }

    private var markdownMessageView: some View {
        // Simplified markdown rendering - in a real app, use a proper markdown parser
        BPText(message.content, style: .bodyMedium, color: messageTextColor)
            .multilineTextAlignment(.leading)
    }

    private var aiResponseView: some View {
        VStack(alignment: .leading, spacing: theme.spacing.sm) {
            HStack {
                Image(systemName: "sparkles")
                    .font(.caption)
                    .foregroundColor(theme.colors.productivity.ai)

                BPText("AI Response", style: .captionSmall, color: .secondary)

                Spacer()

                if message.isEdited {
                    BPText("edited", style: .captionSmall, color: .tertiary)
                }
            }

            BPText(message.content, style: .aiMessage, color: messageTextColor)
                .multilineTextAlignment(.leading)
        }
    }

    private var systemNotificationView: some View {
        HStack(spacing: theme.spacing.xs) {
            Image(systemName: "info.circle")
                .font(.caption)
                .foregroundColor(theme.colors.info.main)

            BPText(message.content, style: .captionMedium, color: .secondary)
                .multilineTextAlignment(.leading)
        }
    }

    // MARK: - Supporting Views

    private var avatarView: some View {
        VStack(spacing: 2) {
            if message.sender.avatarURL != nil {
                // In a real app, use AsyncImage or similar
                Circle()
                    .fill(theme.colors.neutral._300)
                    .frame(width: 32, height: 32)
                    .overlay(
                        BPText(String(message.sender.name.prefix(1)), style: .labelSmall)
                            .foregroundColor(.white)
                    )
            } else {
                Circle()
                    .fill(message.sender.role.color)
                    .frame(width: 32, height: 32)
                    .overlay(
                        Group {
                            if message.sender.isBot {
                                Image(systemName: "brain.head.profile")
                                    .font(.system(size: 14))
                                    .foregroundColor(.white)
                            } else {
                                BPText(String(message.sender.name.prefix(1)), style: .labelSmall)
                                    .foregroundColor(.white)
                            }
                        }
                    )
            }

            if message.sender.isBot {
                Circle()
                    .fill(theme.colors.productivity.ai)
                    .frame(width: 8, height: 8)
            }
        }
    }

    private var senderHeader: some View {
        HStack(spacing: theme.spacing.xs) {
            BPText(message.sender.name, style: .labelSmall, color: .secondary)

            if message.sender.isBot {
                BPText("AI", style: .captionSmall)
                    .bpBadge(style: .info, size: .small)
            }

            if message.sender.role == .admin {
                BPText("Admin", style: .captionSmall)
                    .bpBadge(style: .warning, size: .small)
            }

            Spacer()
        }
    }

    private func replyContext(_ replyToID: String) -> some View {
        HStack(spacing: theme.spacing.sm) {
            Rectangle()
                .fill(theme.colors.primary.main)
                .frame(width: 3)

            VStack(alignment: .leading, spacing: 2) {
                BPText("Replying to message", style: .captionSmall, color: .secondary)
                BPText(
                    "Message ID: \(replyToID)",
                    style: .captionMedium,
                    color: .tertiary
                )
                .lineLimit(1)
            }

            Spacer()
        }
        .padding(theme.spacing.sm)
        .background(theme.colors.background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: theme.borders.smallRadius))
        .padding(.horizontal, theme.spacing.md)
    }

    private var attachmentsView: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            ForEach(message.attachments, id: \.id) { attachment in
                attachmentItem(attachment)
            }
        }
    }

    private func attachmentItem(_ attachment: Attachment) -> some View {
        HStack(spacing: theme.spacing.sm) {
            Image(systemName: attachmentIcon(attachment.type))
                .font(.title3)
                .foregroundColor(attachmentColor(attachment.type))

            VStack(alignment: .leading, spacing: 2) {
                BPText(attachment.name, style: .labelSmall)
                if let size = attachment.size {
                    BPText(formatFileSize(size), style: .captionSmall, color: .tertiary)
                }
            }

            Spacer()

            Button("Open") {
                // Handle attachment opening
            }
            .font(.caption)
            .foregroundColor(theme.colors.primary.main)
        }
        .padding(theme.spacing.sm)
        .background(theme.colors.background.tertiary)
        .clipShape(RoundedRectangle(cornerRadius: theme.borders.smallRadius))
    }

    private var reactionsView: some View {
        HStack(spacing: theme.spacing.xs) {
            ForEach(Array(message.reactions.keys), id: \.self) { reaction in
                if let count = message.reactions[reaction], count > 0 {
                    reactionButton(reaction, count: count)
                }
            }

            Button(action: { showReactions.toggle() }) {
                Image(systemName: "plus.circle")
                    .font(.caption)
                    .foregroundColor(theme.colors.text.tertiary)
            }
        }
        .padding(.horizontal, theme.spacing.md)
    }

    private func reactionButton(_ reaction: ReactionType, count: Int) -> some View {
        Button(action: {
            onReaction?(message, reaction)
        }) {
            HStack(spacing: 4) {
                Text(reaction.emoji)
                    .font(.caption)
                BPText("\(count)", style: .captionSmall)
                    .foregroundColor(theme.colors.text.secondary)
            }
            .padding(.horizontal, theme.spacing.xs)
            .padding(.vertical, 2)
            .background(theme.colors.background.secondary)
            .clipShape(Capsule())
        }
    }

    private var actionsView: some View {
        HStack(spacing: theme.spacing.lg) {
            if let onReply = onReply {
                Button(action: { onReply(message) }) {
                    Image(systemName: "arrowshape.turn.up.left")
                        .font(.caption)
                        .foregroundColor(theme.colors.text.tertiary)
                }
            }

            if let onCopy = onCopy {
                Button(action: { onCopy(message) }) {
                    Image(systemName: "doc.on.doc")
                        .font(.caption)
                        .foregroundColor(theme.colors.text.tertiary)
                }
            }

            if isFromCurrentUser, let onEdit = onEdit {
                Button(action: { onEdit(message) }) {
                    Image(systemName: "pencil")
                        .font(.caption)
                        .foregroundColor(theme.colors.text.tertiary)
                }
            }

            Spacer()
        }
        .padding(.horizontal, theme.spacing.md)
        .opacity(0.7)
    }

    private var timestampView: some View {
        HStack {
            if isFromCurrentUser {
                Spacer()
            }

            BPText(formatTimestamp(message.timestamp), style: .captionSmall, color: .tertiary)

            if message.isEdited {
                BPText("• edited", style: .captionSmall, color: .tertiary)
            }

            if !isFromCurrentUser {
                Spacer()
            }
        }
    }

    private var statusIndicator: some View {
        HStack {
            Spacer()
            Image(systemName: statusIcon)
                .font(.caption2)
                .foregroundColor(statusColor)
        }
    }

    // MARK: - Computed Properties

    private var isFromCurrentUser: Bool {
        !message.sender.isBot && message.sender.role == .user
    }

    private var isSystemMessage: Bool {
        message.type == .system_notification
    }

    private var showSenderName: Bool {
        !isFromCurrentUser && style != .minimal
    }

    private var messageAlignment: HorizontalAlignment {
        isFromCurrentUser ? .trailing : .leading
    }

    private var messagePadding: EdgeInsets {
        switch style {
        case .bubble:
            return EdgeInsets(
                top: theme.spacing.sm,
                leading: theme.spacing.md,
                bottom: theme.spacing.sm,
                trailing: theme.spacing.md
            )
        case .card:
            return EdgeInsets(
                top: theme.spacing.md,
                leading: theme.spacing.md,
                bottom: theme.spacing.md,
                trailing: theme.spacing.md
            )
        case .minimal:
            return EdgeInsets(
                top: theme.spacing.xs,
                leading: theme.spacing.sm,
                bottom: theme.spacing.xs,
                trailing: theme.spacing.sm
            )
        case .system:
            return EdgeInsets(
                top: theme.spacing.xs,
                leading: theme.spacing.md,
                bottom: theme.spacing.xs,
                trailing: theme.spacing.md
            )
        case .ai_enhanced:
            return EdgeInsets(
                top: theme.spacing.md,
                leading: theme.spacing.lg,
                bottom: theme.spacing.md,
                trailing: theme.spacing.lg
            )
        }
    }

    private var messageBackground: Color {
        switch style {
        case .system:
            return theme.colors.background.secondary
        default:
            if isFromCurrentUser {
                return theme.colors.primary.main
            } else if message.sender.isBot {
                return theme.colors.background.card
            } else {
                return theme.colors.background.secondary
            }
        }
    }

    private var messageTextColor: BPText.TextColor {
        if isFromCurrentUser {
            return .inverse
        } else {
            return .primary
        }
    }

    @ViewBuilder
    private var messageBorder: some View {
        if style == .card {
            RoundedRectangle(cornerRadius: theme.borders.defaultRadius)
                .stroke(theme.colors.border.subtle, lineWidth: theme.borders.defaultWidth)
        }
    }

    private var messageShape: some Shape {
        RoundedRectangle(cornerRadius: messageCornerRadius)
    }

    private var messageCornerRadius: CGFloat {
        switch style {
        case .bubble:
            return theme.borders.largeRadius
        case .card, .ai_enhanced:
            return theme.borders.defaultRadius
        case .minimal, .system:
            return theme.borders.smallRadius
        }
    }

    private var aiGradientBorder: some View {
        messageShape
            .stroke(
                LinearGradient(
                    colors: [
                        theme.colors.productivity.ai.opacity(0.3),
                        theme.colors.primary.main.opacity(0.3),
                        theme.colors.secondary.main.opacity(0.3)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                lineWidth: 2
            )
    }

    private var statusIcon: String {
        switch message.status {
        case .sending:
            return "clock"
        case .sent:
            return "checkmark"
        case .delivered:
            return "checkmark.circle"
        case .read:
            return "checkmark.circle.fill"
        case .failed:
            return "exclamationmark.circle"
        case .typing:
            return "ellipsis"
        }
    }

    private var statusColor: Color {
        switch message.status {
        case .sent, .delivered, .read:
            return theme.colors.success.main
        case .failed:
            return theme.colors.error.main
        default:
            return theme.colors.text.tertiary
        }
    }

    // MARK: - Helper Functions

    private func attachmentIcon(_ type: Attachment.AttachmentType) -> String {
        switch type {
        case .image:
            return "photo"
        case .document:
            return "doc.text"
        case .audio:
            return "waveform"
        case .video:
            return "video"
        case .code:
            return "chevron.left.forwardslash.chevron.right"
        case .link:
            return "link"
        }
    }

    private func attachmentColor(_ type: Attachment.AttachmentType) -> Color {
        switch type {
        case .image:
            return .green
        case .document:
            return .blue
        case .audio:
            return .purple
        case .video:
            return .red
        case .code:
            return .orange
        case .link:
            return .cyan
        }
    }

    private func formatFileSize(_ size: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useAll]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: size)
    }

    private func formatTimestamp(_ date: Date) -> String {
        let formatter = DateFormatter()
        let calendar = Calendar.current

        if calendar.isDateInToday(date) {
            formatter.timeStyle = .short
        } else if calendar.isDate(date, equalTo: Date(), toGranularity: .year) {
            formatter.dateFormat = "MMM d, HH:mm"
        } else {
            formatter.dateFormat = "MMM d, yyyy"
        }

        return formatter.string(from: date)
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPChatMessage {

    /// Create a user message
    public static func user(
        content: String,
        sender: Sender
    ) -> BPChatMessage {
        let message = MessageData(
            content: content,
            sender: sender,
            type: .text
        )
        return BPChatMessage(message: message)
    }

    /// Create an AI assistant message
    public static func ai(
        content: String,
        assistantName: String = "AI Assistant"
    ) -> BPChatMessage {
        let sender = Sender(
            id: "ai",
            name: assistantName,
            role: .assistant,
            isBot: true
        )
        let message = MessageData(
            content: content,
            sender: sender,
            type: .ai_response
        )
        return BPChatMessage(message: message, style: .ai_enhanced)
    }

    /// Create a system notification
    public static func system(
        content: String
    ) -> BPChatMessage {
        let sender = Sender(
            id: "system",
            name: "System",
            role: .system
        )
        let message = MessageData(
            content: content,
            sender: sender,
            type: .system_notification
        )
        return BPChatMessage(message: message, style: .system)
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPChatMessage_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 8) {
                BPChatMessage.user(
                    content: "Hello! Can you help me organize my tasks for today?",
                    sender: BPChatMessage.Sender(id: "user1", name: "John Doe")
                )

                BPChatMessage.ai(
                    content: "Of course! I'd be happy to help you organize your tasks. Let me start by understanding what you need to accomplish today. Could you tell me about your priorities?"
                )

                BPChatMessage.user(
                    content: "I need to finish the project presentation, review the marketing budget, and prepare for tomorrow's team meeting.",
                    sender: BPChatMessage.Sender(id: "user1", name: "John Doe")
                )

                BPChatMessage.ai(
                    content: "Perfect! I can help you break those down into manageable tasks with priorities and time estimates. Here's what I suggest:\n\n1. **Project Presentation** (High Priority)\n2. **Marketing Budget Review** (Medium Priority)\n3. **Team Meeting Prep** (Medium Priority)\n\nWould you like me to create these as tasks in your productivity system?"
                )

                BPChatMessage.system(
                    content: "3 new tasks have been created and added to your today's agenda."
                )
            }
            .padding()
        }
        .beProductiveTheme()
    }
}