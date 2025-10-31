import SwiftUI
import BeProductiveUI

struct OnboardingView: View {
    @StateObject private var onboardingManager = OnboardingManager()
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            TabView(selection: $onboardingManager.currentStep) {
                WelcomeStep()
                    .tag(OnboardingStep.welcome)

                FeaturesStep()
                    .tag(OnboardingStep.features)

                PermissionsStep()
                    .tag(OnboardingStep.permissions)

                PersonalizationStep()
                    .tag(OnboardingStep.personalization)

                CompletionStep()
                    .tag(OnboardingStep.completion)
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            .ignoresSafeArea(.container, edges: .top)
        }
        .overlay(alignment: .bottom) {
            OnboardingControls()
        }
        .environmentObject(onboardingManager)
    }
}

struct OnboardingControls: View {
    @EnvironmentObject var onboardingManager: OnboardingManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            // Progress Indicator
            HStack(spacing: BPSpacing.xs) {
                ForEach(OnboardingStep.allCases, id: \.self) { step in
                    Circle()
                        .fill(step.rawValue <= onboardingManager.currentStep.rawValue ? BPColors.Primary.main : BPColors.Background.secondary)
                        .frame(width: 8, height: 8)
                }
            }

            // Navigation Buttons
            HStack {
                if onboardingManager.currentStep != .welcome {
                    BPButton(
                        title: "Back",
                        style: .secondary,
                        size: .medium
                    ) {
                        onboardingManager.previousStep()
                    }
                }

                Spacer()

                if onboardingManager.currentStep == .completion {
                    BPButton(
                        title: "Get Started",
                        style: .primary,
                        size: .medium
                    ) {
                        onboardingManager.completeOnboarding()
                        dismiss()
                    }
                } else {
                    BPButton(
                        title: onboardingManager.currentStep == .welcome ? "Get Started" : "Next",
                        style: .primary,
                        size: .medium
                    ) {
                        onboardingManager.nextStep()
                    }
                }
            }
            .padding(.horizontal, BPSpacing.lg)
        }
        .padding(.vertical, BPSpacing.lg)
        .background(BPColors.Background.primary)
    }
}

// MARK: - Onboarding Steps
struct WelcomeStep: View {
    var body: some View {
        VStack(spacing: BPSpacing.xl) {
            Spacer()

            // App Icon/Logo
            Image(systemName: "target")
                .font(.system(size: 100))
                .foregroundColor(BPColors.Primary.main)

            VStack(spacing: BPSpacing.md) {
                BPText("Welcome to BeProductive", style: .displayLarge)
                    .foregroundColor(BPColors.Text.primary)
                    .multilineTextAlignment(.center)

                BPText("Your personal productivity companion for tasks, goals, and habits", style: .bodyLarge)
                    .foregroundColor(BPColors.Text.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, BPSpacing.lg)
            }

            Spacer()

            // Features Preview
            HStack(spacing: BPSpacing.lg) {
                FeaturePreview(icon: "checkmark.circle", title: "Tasks")
                FeaturePreview(icon: "target", title: "Goals")
                FeaturePreview(icon: "repeat", title: "Habits")
            }

            Spacer()
        }
        .padding(.horizontal, BPSpacing.lg)
    }
}

struct FeaturesStep: View {
    var body: some View {
        ScrollView {
            VStack(spacing: BPSpacing.xl) {
                VStack(spacing: BPSpacing.md) {
                    BPText("Powerful Features", style: .displayMedium)
                        .foregroundColor(BPColors.Text.primary)

                    BPText("Everything you need to stay productive and achieve your goals", style: .bodyLarge)
                        .foregroundColor(BPColors.Text.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, BPSpacing.xl)

                VStack(spacing: BPSpacing.lg) {
                    FeatureCard(
                        icon: "list.bullet.rectangle",
                        title: "Smart Task Management",
                        description: "Organize tasks with priorities, due dates, and subtasks. Track progress and stay on top of your responsibilities."
                    )

                    FeatureCard(
                        icon: "flag.checkered",
                        title: "Goal Achievement",
                        description: "Set meaningful goals, break them into milestones, and track your progress over time."
                    )

                    FeatureCard(
                        icon: "repeat.circle",
                        title: "Habit Formation",
                        description: "Build positive habits with streak tracking, reminders, and detailed analytics."
                    )

                    FeatureCard(
                        icon: "chart.line.uptrend.xyaxis",
                        title: "Analytics & Insights",
                        description: "Understand your productivity patterns with detailed analytics and AI-powered insights."
                    )

                    FeatureCard(
                        icon: "icloud.and.arrow.up",
                        title: "Sync Everywhere",
                        description: "Your data syncs seamlessly across all your devices, even when offline."
                    )
                }
            }
            .padding(.horizontal, BPSpacing.lg)
            .padding(.bottom, 120) // Space for controls
        }
    }
}

struct PermissionsStep: View {
    @StateObject private var permissionManager = PermissionManager()

    var body: some View {
        VStack(spacing: BPSpacing.xl) {
            VStack(spacing: BPSpacing.md) {
                Image(systemName: "lock.shield")
                    .font(.system(size: 60))
                    .foregroundColor(BPColors.Primary.main)

                BPText("Privacy & Permissions", style: .displayMedium)
                    .foregroundColor(BPColors.Text.primary)

                BPText("We respect your privacy. These permissions help us provide the best experience.", style: .bodyLarge)
                    .foregroundColor(BPColors.Text.secondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: BPSpacing.md) {
                PermissionCard(
                    icon: "bell",
                    title: "Notifications",
                    description: "Get reminders for tasks, goals, and habit check-ins",
                    isGranted: permissionManager.notificationsGranted
                ) {
                    Task {
                        await permissionManager.requestNotifications()
                    }
                }

                PermissionCard(
                    icon: "location",
                    title: "Location (Optional)",
                    description: "Set location-based reminders for tasks",
                    isGranted: permissionManager.locationGranted,
                    isOptional: true
                ) {
                    Task {
                        await permissionManager.requestLocation()
                    }
                }

                PermissionCard(
                    icon: "camera",
                    title: "Camera (Optional)",
                    description: "Capture photos and documents for your tasks",
                    isGranted: permissionManager.cameraGranted,
                    isOptional: true
                ) {
                    Task {
                        await permissionManager.requestCamera()
                    }
                }
            }

            Spacer()
        }
        .padding(.horizontal, BPSpacing.lg)
        .padding(.bottom, 120) // Space for controls
    }
}

struct PersonalizationStep: View {
    @StateObject private var preferences = UserPreferences()

    var body: some View {
        ScrollView {
            VStack(spacing: BPSpacing.xl) {
                VStack(spacing: BPSpacing.md) {
                    Image(systemName: "person.crop.circle.badge.checkmark")
                        .font(.system(size: 60))
                        .foregroundColor(BPColors.Primary.main)

                    BPText("Personalize Your Experience", style: .displayMedium)
                        .foregroundColor(BPColors.Text.primary)

                    BPText("Customize BeProductive to match your workflow and preferences", style: .bodyLarge)
                        .foregroundColor(BPColors.Text.secondary)
                        .multilineTextAlignment(.center)
                }

                VStack(spacing: BPSpacing.lg) {
                    PreferenceSection(title: "Appearance") {
                        VStack(spacing: BPSpacing.md) {
                            BPText("Theme", style: .bodyLarge)
                                .foregroundColor(BPColors.Text.primary)

                            HStack(spacing: BPSpacing.sm) {
                                ForEach(UserPreferences.AppTheme.allCases, id: \.self) { theme in
                                    ThemeOption(
                                        theme: theme,
                                        isSelected: preferences.theme == theme
                                    ) {
                                        preferences.theme = theme
                                    }
                                }
                            }
                        }
                    }

                    PreferenceSection(title: "Notifications") {
                        VStack(spacing: BPSpacing.md) {
                            PreferenceToggle(
                                title: "Task Reminders",
                                description: "Get notified about upcoming task deadlines",
                                isOn: $preferences.notifications.taskReminders
                            )

                            PreferenceToggle(
                                title: "Goal Check-ins",
                                description: "Weekly reminders to review your goals",
                                isOn: $preferences.notifications.goalDeadlines
                            )

                            PreferenceToggle(
                                title: "Habit Reminders",
                                description: "Daily reminders for your habit tracking",
                                isOn: $preferences.notifications.habitReminders
                            )
                        }
                    }

                    PreferenceSection(title: "Productivity") {
                        VStack(spacing: BPSpacing.md) {
                            PreferenceToggle(
                                title: "Analytics",
                                description: "Track your productivity patterns and insights",
                                isOn: $preferences.privacy.allowAnalytics
                            )

                            PreferenceToggle(
                                title: "Auto Sync",
                                description: "Automatically sync your data across devices",
                                isOn: $preferences.sync.autoSync
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, BPSpacing.lg)
            .padding(.bottom, 120) // Space for controls
        }
    }
}

struct CompletionStep: View {
    var body: some View {
        VStack(spacing: BPSpacing.xl) {
            Spacer()

            VStack(spacing: BPSpacing.lg) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(BPColors.Success.main)

                VStack(spacing: BPSpacing.md) {
                    BPText("You're All Set!", style: .displayLarge)
                        .foregroundColor(BPColors.Text.primary)

                    BPText("Welcome to BeProductive! Start by creating your first task, goal, or habit.", style: .bodyLarge)
                        .foregroundColor(BPColors.Text.secondary)
                        .multilineTextAlignment(.center)
                }
            }

            Spacer()

            VStack(spacing: BPSpacing.md) {
                BPText("Quick Tips", style: .headingMedium)
                    .foregroundColor(BPColors.Text.primary)

                VStack(spacing: BPSpacing.sm) {
                    QuickTip(icon: "plus", text: "Tap the + button to create new items")
                    QuickTip(icon: "magnifyingglass", text: "Use search to quickly find what you need")
                    QuickTip(icon: "chart.bar", text: "Check the Engage tab for your analytics")
                    QuickTip(icon: "person", text: "Customize settings in your Profile")
                }
            }

            Spacer()
        }
        .padding(.horizontal, BPSpacing.lg)
    }
}

// MARK: - Supporting Views
struct FeaturePreview: View {
    let icon: String
    let title: String

    var body: some View {
        VStack(spacing: BPSpacing.xs) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(BPColors.Primary.main)

            BPText(title, style: .labelMedium)
                .foregroundColor(BPColors.Text.secondary)
        }
    }
}

struct FeatureCard: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(BPColors.Primary.main)
                .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(title, style: .bodyLarge)
                    .foregroundColor(BPColors.Text.primary)

                BPText(description, style: .bodySmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            Spacer()
        }
        .padding(BPSpacing.md)
        .background(BPColors.Background.secondary)
        .cornerRadius(BPSpacing.md)
    }
}

struct PermissionCard: View {
    let icon: String
    let title: String
    let description: String
    let isGranted: Bool
    let isOptional: Bool
    let action: () -> Void

    init(icon: String, title: String, description: String, isGranted: Bool, isOptional: Bool = false, action: @escaping () -> Void) {
        self.icon = icon
        self.title = title
        self.description = description
        self.isGranted = isGranted
        self.isOptional = isOptional
        self.action = action
    }

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(isGranted ? BPColors.Success.main : BPColors.Text.secondary)
                .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                HStack {
                    BPText(title, style: .bodyLarge)
                        .foregroundColor(BPColors.Text.primary)

                    if isOptional {
                        BPText("Optional", style: .labelSmall)
                            .foregroundColor(BPColors.textTertiary)
                            .padding(.horizontal, BPSpacing.xs)
                            .padding(.vertical, BPSpacing.xxs)
                            .background(BPColors.backgroundTertiary)
                            .cornerRadius(BPSpacing.xs)
                    }

                    Spacer()
                }

                BPText(description, style: .bodySmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            if !isGranted {
                BPButton(
                    title: "Allow",
                    style: .primary,
                    size: .small,
                    action: action
                )
            } else {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(BPColors.Success.main)
            }
        }
        .padding(BPSpacing.md)
        .background(BPColors.Background.secondary)
        .cornerRadius(BPSpacing.md)
    }
}

struct PreferenceSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText(title, style: .headingMedium)
                .foregroundColor(BPColors.Text.primary)

            content
        }
        .padding(BPSpacing.md)
        .background(BPColors.Background.secondary)
        .cornerRadius(BPSpacing.md)
    }
}

struct PreferenceToggle: View {
    let title: String
    let description: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(title, style: .bodyMedium)
                    .foregroundColor(BPColors.Text.primary)

                BPText(description, style: .bodySmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            Spacer()

            Toggle("", isOn: $isOn)
                .tint(BPColors.Primary.main)
        }
    }
}

struct ThemeOption: View {
    let theme: UserPreferences.AppTheme
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: BPSpacing.xs) {
                Image(systemName: theme.iconName)
                    .font(.title2)
                    .foregroundColor(isSelected ? BPColors.Primary.main : BPColors.Text.secondary)

                BPText(theme.displayName, style: .labelSmall)
                    .foregroundColor(isSelected ? BPColors.Primary.main : BPColors.Text.secondary)
            }
            .padding(BPSpacing.md)
            .background(isSelected ? BPColors.Primary.main.opacity(0.1) : BPColors.backgroundTertiary)
            .cornerRadius(BPSpacing.sm)
            .overlay(
                RoundedRectangle(cornerRadius: BPSpacing.sm)
                    .stroke(isSelected ? BPColors.Primary.main : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct QuickTip: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: BPSpacing.sm) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(BPColors.Primary.main)
                .frame(width: 16)

            BPText(text, style: .bodySmall)
                .foregroundColor(BPColors.Text.secondary)

            Spacer()
        }
    }
}

// MARK: - Extensions
extension UserPreferences.AppTheme {
    var displayName: String {
        switch self {
        case .light: return "Light"
        case .dark: return "Dark"
        case .system: return "System"
        }
    }

    var iconName: String {
        switch self {
        case .light: return "sun.max"
        case .dark: return "moon"
        case .system: return "gearshape"
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AuthenticationManager())
}