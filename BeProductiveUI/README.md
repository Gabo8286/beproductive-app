# BeProductiveUI

A comprehensive SwiftUI component library designed specifically for productivity applications, featuring modern design patterns, accessibility compliance, and iOS-native experiences.

## 🎯 **Overview**

BeProductiveUI provides everything you need to build beautiful, accessible, and consistent productivity apps for iOS, watchOS, and macOS. Built with SwiftUI and designed for iOS 16+.

### **Key Features**

- 🎨 **Complete Design System** - Colors, typography, spacing with 8pt grid
- 🧩 **40+ Components** - Buttons, inputs, cards, progress trackers, chat interfaces
- ♿ **WCAG AAA Accessibility** - Screen reader support, high contrast, keyboard navigation
- 🌙 **Dark Mode Support** - Automatic theme switching with custom variations
- 📱 **iOS-Native** - Tab bars, navigation, widgets, Dynamic Island support
- 🤖 **AI-Ready** - Chat components, message bubbles, AI response styling
- 📊 **Productivity Focus** - Task cards, progress tracking, goal management
- 🔧 **Highly Customizable** - Extensive modifier system and theming options

## 🚀 **Quick Start**

### Installation

Add BeProductiveUI to your Swift package dependencies:

```swift
dependencies: [
    .package(url: "https://github.com/your-org/BeProductiveUI", from: "1.0.0")
]
```

### Basic Usage

```swift
import SwiftUI
import BeProductiveUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            BPText("Welcome to BeProductive", style: .heading1)

            BPButton("Get Started", style: .primary) {
                // Your action here
            }

            BPTaskCard.simple(
                title: "Complete project setup",
                priority: .high
            )
        }
        .beProductiveTheme() // Apply the theme
    }
}
```

## 🎨 **Design System**

### Colors

```swift
// Primary brand colors
theme.colors.primary.main
theme.colors.secondary.main

// Semantic colors
theme.colors.success.main
theme.colors.warning.main
theme.colors.error.main

// Adaptive colors (light/dark mode)
theme.colors.background.primary
theme.colors.text.primary
```

### Typography

```swift
// Display styles
BPText("Large Title", style: .displayLarge)
BPText("Medium Title", style: .displayMedium)

// Headings
BPText("Section Title", style: .heading1)
BPText("Subsection", style: .heading3)

// Body text
BPText("Content text", style: .bodyLarge)
BPText("Description", style: .bodyMedium)

// Productivity-specific
BPText("Task Title", style: .taskTitle)
BPText("Goal Title", style: .goalTitle)
```

### Spacing

```swift
// Base spacing (8pt grid)
theme.spacing.xs    // 4pt
theme.spacing.sm    // 8pt
theme.spacing.md    // 12pt
theme.spacing.lg    // 16pt
theme.spacing.xl    // 24pt

// Semantic spacing
theme.spacing.semantic.related    // For related elements
theme.spacing.component.cardPadding    // For cards
theme.spacing.layout.container    // For containers
```

## 🧩 **Components**

### Basic Components

#### Buttons

```swift
// Primary button
BPButton("Save", style: .primary) { /* action */ }

// Button with icon
BPButton("Delete", icon: "trash", style: .destructive) { /* action */ }

// Loading state
BPButton("Processing", style: .primary, loading: true) { /* action */ }

// Different sizes
BPButton("Small", style: .primary, size: .small) { /* action */ }
BPButton("Large", style: .primary, size: .large) { /* action */ }
```

#### Text Input

```swift
// Basic text field
BPTextField(
    title: "Task Name",
    placeholder: "Enter task name",
    text: $taskName
)

// Email input
BPTextField.email(
    title: "Email Address",
    text: $email,
    isRequired: true
)

// Search field
BPTextField.search(
    placeholder: "Search tasks",
    text: $searchQuery
)

// Text area
BPTextField.textArea(
    title: "Notes",
    placeholder: "Add notes...",
    text: $notes,
    maxLength: 500
)
```

#### Text Display

```swift
// Heading with convenience method
BPText.heading("Project Overview", level: 2)

// Body text with color
BPText.body("Task description", color: .secondary)

// Error message
BPText.error("Please fix this issue")

// Success message
BPText.success("Task completed!")
```

### Productivity Components

#### Task Cards

```swift
// Simple task
BPTaskCard.simple(
    title: "Review pull request",
    priority: .high,
    onToggleComplete: { /* handle completion */ }
)

// Detailed task with progress
BPTaskCard.detailed(
    title: "Design new feature",
    description: "Create wireframes and prototypes",
    priority: .urgent,
    dueDate: Date().addingTimeInterval(86400),
    progress: 0.6,
    tags: ["Design", "UI/UX"],
    onEdit: { /* edit action */ }
)

// Custom task data
let task = BPTaskCard.TaskData(
    title: "Backend API Development",
    priority: .high,
    status: .inProgress,
    dueDate: tomorrow,
    estimatedTime: 14400 // 4 hours
)

BPTaskCard(task: task, style: .detailed)
```

#### Progress Trackers

```swift
// Linear progress
BPProgressTracker.linear(
    title: "Daily Steps",
    current: 7500,
    target: 10000
)

// Circular progress with center text
BPProgressTracker.circular(
    title: "Project Completion",
    current: 15,
    target: 20,
    showCenter: true
)

// Goal tracking
BPProgressTracker.goal(
    title: "Monthly Sales",
    subtitle: "Q1 Target",
    current: 85000,
    target: 100000,
    unit: "$"
)

// Habit streak
BPProgressTracker.streak(
    title: "Meditation Streak",
    currentStreak: 12,
    targetStreak: 30
)
```

### AI & Chat Components

#### Chat Messages

```swift
// User message
BPChatMessage.user(
    content: "Can you help me organize my tasks?",
    sender: BPChatMessage.Sender(id: "user1", name: "John")
)

// AI assistant response
BPChatMessage.ai(
    content: "I'd be happy to help! Let me suggest some priorities..."
)

// System notification
BPChatMessage.system(
    content: "3 new tasks were created"
)

// Custom message with reactions
let message = BPChatMessage.MessageData(
    content: "Great job on the presentation!",
    sender: sender,
    reactions: [.thumbsUp: 3, .heart: 1]
)
BPChatMessage(message: message)
```

### iOS-Specific Components

#### Tab Bar

```swift
// Standard productivity tab bar
BPTabBar.productivity(
    selectedIndex: $selectedTab
)

// Custom tab items
let tabItems = [
    BPTabBar.TabItem(title: "Tasks", icon: "checkmark.circle"),
    BPTabBar.TabItem(title: "Goals", icon: "target", badgeCount: 2),
    BPTabBar.TabItem(title: "Analytics", icon: "chart.bar")
]

BPTabBar(
    selectedIndex: $selectedTab,
    items: tabItems,
    style: .floating
)

// Dynamic Island style
BPTabBar.dynamicIsland(
    selectedIndex: $selectedTab,
    items: tabItems
)
```

#### Navigation Bar

```swift
// Standard navigation with back button
BPNavigationBar.standard(
    title: "Task Details",
    onBack: { /* handle back */ }
)

// Large title with actions
BPNavigationBar.productivity(
    title: "Dashboard",
    subtitle: "Welcome back, John",
    hasNotifications: true,
    notificationCount: 3,
    onNotifications: { /* show notifications */ },
    onProfile: { /* show profile */ }
)

// Searchable navigation
BPNavigationBar.searchable(
    title: "Projects",
    searchPlaceholder: "Search projects...",
    onSearchTextChanged: { query in
        // Handle search
    }
)
```

#### Widgets

```swift
// Task summary widget
BPWidget.taskSummary(
    completedTasks: 5,
    totalTasks: 8,
    upcomingTasks: upcomingTasks,
    size: .medium
)

// Goals widget
BPWidget.goals(
    currentStreak: 12,
    targetStreak: 30,
    weeklyProgress: 0.8,
    size: .small
)

// Habits widget
BPWidget.habits(
    completedHabits: 3,
    totalHabits: 5,
    habitItems: habitItems,
    size: .large
)
```

## 🎛️ **Modifiers**

### Core Modifiers

```swift
// Card styling
Text("Content")
    .bpCard(style: .elevated, padding: .medium)

// Interactive behavior
Button("Tap me") { /* action */ }
    .bpInteractive(style: .button, hapticFeedback: .light)

// Loading states
VStack { /* content */ }
    .bpLoading(isLoading, style: .spinner, overlay: true)

// Badge styling
Text("New")
    .bpBadge(style: .success, size: .small)

// List item styling
HStack { /* item content */ }
    .bpListItem(style: .card, interactive: true)
```

### Layout Modifiers

```swift
// Responsive layouts
ContentView()
    .bpResponsive(
        compact: { CompactLayout() },
        regular: { RegularLayout() }
    )

// Conditional styling
Text("Dynamic")
    .bpIf(condition,
          ifTrue: { $0.foregroundColor(.red) },
          ifFalse: { $0.foregroundColor(.blue) })

// Animations
Rectangle()
    .bpAnimation(.spring, trigger: animationTrigger)
    .bpTransition(.fadeIn)

// Safe area handling
VStack { /* content */ }
    .bpSafeArea(edges: .bottom, padding: .standard)
```

### Theme Modifiers

```swift
// Apply theme
ContentView()
    .beProductiveTheme()

// Background styling
VStack { /* content */ }
    .bpBackground(.secondary)

// Text styling
Text("Styled text")
    .bpText(style: .heading2, color: .primary)

// Border and shadows
Rectangle()
    .bpBorder(style: .default, radius: .large)
    .bpShadow(.medium)

// Spacing
VStack { /* content */ }
    .bpPadding(.lg, edges: .all)
```

## ♿ **Accessibility**

BeProductiveUI is built with accessibility as a first-class citizen, meeting WCAG AAA standards.

### Automatic Accessibility

All components include:
- Screen reader labels and hints
- Proper semantic roles
- Keyboard navigation support
- Dynamic Type scaling
- High contrast mode support
- Reduced motion respect

### Manual Accessibility

```swift
// Enhanced accessibility
Button("Save") { /* action */ }
    .bpAccessibility(
        role: .button,
        label: "Save document",
        hint: "Saves the current document to storage",
        traits: [.isButton]
    )

// Focus management
TextField("Task name", text: $taskName)
    .bpFocusable(.taskName, focusState: $focusedField)

// Announcements
VStack { /* content */ }
    .bpAnnounceChanges("Task completed", trigger: isCompleted)

// Contrast enhancement
Text("Important text")
    .bpEnhancedContrast(
        foregroundColor: .primary,
        backgroundColor: .background
    )
```

### Accessibility Testing

```swift
// Validate contrast ratios
let result = BPAccessibilityTesting.validateContrast(
    foreground: .black,
    background: .white,
    level: .AAA
)

// Audit component accessibility
let audit = BPAccessibilityTesting.auditAccessibility(for: myView)
print("Accessibility score: \\(audit.overallScore)")
```

## 🎨 **Theming**

### Using Built-in Themes

```swift
// Default adaptive theme
ContentView()
    .beProductiveTheme()

// Specific theme
ContentView()
    .beProductiveTheme(.dark)

// High contrast theme
ContentView()
    .beProductiveTheme(.highContrastLight)
```

### Custom Themes

```swift
// Create custom theme
let customTheme = BPTheme(
    name: "Custom Theme",
    appearance: .light,
    accessibilityLevel: .enhanced
)

ContentView()
    .beProductiveTheme(customTheme)

// Access theme in components
struct CustomComponent: View {
    @Environment(\\.bpTheme) private var theme

    var body: some View {
        Text("Themed text")
            .foregroundColor(theme.colors.primary.main)
            .font(theme.typography.heading1.font)
            .padding(theme.spacing.md)
    }
}
```

### Theme Manager

```swift
// Access theme manager
@Environment(\\.bpThemeManager) private var themeManager

// React to theme changes
struct ThemedView: View {
    @ObservedObject private var themeManager = BPThemeManager.shared

    var body: some View {
        VStack {
            Text("Current theme: \\(themeManager.currentTheme.name)")

            Button("Toggle Dark Mode") {
                themeManager.toggleAppearance()
            }
        }
    }
}
```

## 📱 **Platform Support**

### iOS Requirements
- iOS 16.0+
- Xcode 14.0+
- Swift 5.7+

### Supported Platforms
- ✅ iOS 16.0+
- ✅ watchOS 9.0+
- ✅ macOS 13.0+

### Device Support
- iPhone (all sizes)
- iPad (all sizes)
- Apple Watch
- Mac (Apple Silicon & Intel)

## 🔧 **Advanced Usage**

### Custom Components

```swift
// Extend existing components
extension BPButton {
    static func productivityAction(
        title: String,
        icon: String,
        action: @escaping () -> Void
    ) -> BPButton {
        return BPButton(
            title,
            icon: icon,
            style: .primary,
            size: .large,
            action: action
        )
    }
}

// Create custom modifiers
struct ProductivityCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .bpCard(style: .elevated, padding: .large)
            .bpShadow(.medium)
            .bpBorder(style: .subtle, radius: .large)
    }
}

extension View {
    func productivityCard() -> some View {
        modifier(ProductivityCardModifier())
    }
}
```

### Performance Optimization

```swift
// Lazy loading for large lists
LazyVStack {
    ForEach(tasks) { task in
        BPTaskCard(task: task)
            .onAppear {
                // Load more if needed
            }
    }
}

// Reduce animation overhead
VStack { /* content */ }
    .bpRespectReduceMotion(
        animation: { AnimatedView() },
        static: { StaticView() }
    )
```

## 🧪 **Testing**

### Component Testing

```swift
import XCTest
import SwiftUI
@testable import BeProductiveUI

class BPButtonTests: XCTestCase {
    func testButtonAccessibility() {
        let button = BPButton("Test", style: .primary) { }

        // Test accessibility properties
        XCTAssertTrue(button.accessibilityTraits.contains(.isButton))
    }

    func testButtonStates() {
        let button = BPButton("Test", style: .primary, loading: true) { }

        // Test loading state
        XCTAssertTrue(button.loading)
    }
}
```

### Accessibility Testing

```swift
func testAccessibilityCompliance() {
    let view = BPTaskCard.simple(title: "Test Task")
    let audit = BPAccessibilityTesting.auditAccessibility(for: view)

    XCTAssertTrue(audit.isCompliant)
    XCTAssertGreaterThan(audit.overallScore, 0.9)
}
```

## 📖 **Examples**

### Complete Task Management View

```swift
struct TaskManagementView: View {
    @State private var tasks: [TaskData] = []
    @State private var selectedTab = 0
    @State private var searchText = ""

    var body: some View {
        VStack(spacing: 0) {
            // Navigation
            BPNavigationBar.searchable(
                title: "Tasks",
                searchPlaceholder: "Search tasks...",
                onSearchTextChanged: { query in
                    searchText = query
                }
            )

            // Content
            ScrollView {
                LazyVStack(spacing: 16) {
                    // Progress overview
                    BPProgressTracker.goal(
                        title: "Daily Progress",
                        current: Double(completedTasks),
                        target: Double(totalTasks)
                    )

                    // Task list
                    ForEach(filteredTasks) { task in
                        BPTaskCard(
                            task: task,
                            style: .detailed,
                            onToggleComplete: {
                                toggleTask(task)
                            },
                            onEdit: {
                                editTask(task)
                            }
                        )
                    }
                }
                .padding()
            }

            // Tab bar
            BPTabBar.productivity(selectedIndex: $selectedTab)
        }
        .beProductiveTheme()
    }

    private var filteredTasks: [TaskData] {
        if searchText.isEmpty {
            return tasks
        }
        return tasks.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
    }

    private var completedTasks: Int {
        tasks.filter { $0.status == .completed }.count
    }

    private var totalTasks: Int {
        tasks.count
    }

    private func toggleTask(_ task: TaskData) {
        // Toggle task completion
    }

    private func editTask(_ task: TaskData) {
        // Edit task
    }
}
```

### AI Chat Interface

```swift
struct AIChatView: View {
    @State private var messages: [BPChatMessage.MessageData] = []
    @State private var inputText = ""

    var body: some View {
        VStack(spacing: 0) {
            // Navigation
            BPNavigationBar.standard(
                title: "AI Assistant",
                onBack: { /* dismiss */ }
            )

            // Messages
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(messages, id: \\.id) { message in
                        BPChatMessage(
                            message: message,
                            onReaction: { msg, reaction in
                                addReaction(to: msg, reaction: reaction)
                            },
                            onCopy: { msg in
                                copyMessage(msg)
                            }
                        )
                    }
                }
                .padding()
            }

            // Input
            HStack {
                BPTextField.search(
                    placeholder: "Ask me anything...",
                    text: $inputText
                )

                BPButton("Send", style: .primary, size: .medium) {
                    sendMessage()
                }
                .disabled(inputText.isEmpty)
            }
            .padding()
        }
        .beProductiveTheme()
    }

    private func sendMessage() {
        let userMessage = BPChatMessage.MessageData(
            content: inputText,
            sender: BPChatMessage.Sender(id: "user", name: "You")
        )
        messages.append(userMessage)

        // Simulate AI response
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            let aiResponse = BPChatMessage.MessageData(
                content: "I understand you want to \\(inputText). Let me help you with that!",
                sender: BPChatMessage.Sender(
                    id: "ai",
                    name: "AI Assistant",
                    role: .assistant,
                    isBot: true
                ),
                type: .ai_response
            )
            messages.append(aiResponse)
        }

        inputText = ""
    }

    private func addReaction(to message: BPChatMessage.MessageData, reaction: BPChatMessage.ReactionType) {
        // Add reaction logic
    }

    private func copyMessage(_ message: BPChatMessage.MessageData) {
        UIPasteboard.general.string = message.content
    }
}
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure accessibility compliance
6. Submit a pull request

## 📄 **License**

BeProductiveUI is available under the MIT license. See LICENSE for more information.

## 🆘 **Support**

- 📚 [Documentation](https://beproductiveui.com/docs)
- 💬 [Discussions](https://github.com/your-org/BeProductiveUI/discussions)
- 🐛 [Issues](https://github.com/your-org/BeProductiveUI/issues)
- 📧 [Email Support](mailto:support@beproductiveui.com)

---

Built with ❤️ for productivity app developers