import SwiftUI
import BeProductiveUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var themeManager: BPThemeManager

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                BPNavigationBar.productivity(
                    title: "Profile",
                    onNotifications: { /* Notifications */ },
                    onProfile: { /* Settings */ }
                )
                
                ScrollView {
                    VStack(spacing: BPSpacing.lg) {
                        // Profile Header
                        ProfileHeaderView()

                        // Quick Stats
                        QuickStatsView()

                        // Settings Sections
                        SettingsSectionView()

                        // AI & Premium Section
                        AIAndPremiumSection()

                        // Account Actions
                        AccountActionsView()
                    }
                    .padding(.horizontal, BPSpacing.md)
                }
            }
        }
    }
}

struct ProfileHeaderView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            // Avatar
            ZStack {
                Circle()
                    .fill(BPColors.Primary.main.opacity(0.1))
                    .frame(width: 100, height: 100)

                if let avatarURL = authManager.currentUser?.avatarURL {
                    AsyncImage(url: URL(string: avatarURL)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(BPColors.Primary.main)
                    }
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
                } else {
                    if let user = authManager.currentUser {
                        BPText(user.initials, style: .heading1)
                            .foregroundColor(BPColors.Primary.main)
                    } else {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(BPColors.Primary.main)
                    }
                }

                // Edit button
                Button(action: {
                    // Edit profile photo
                }) {
                    Image(systemName: "camera.fill")
                        .font(.caption)
                        .foregroundColor(.white)
                        .frame(width: 24, height: 24)
                        .background(BPColors.Primary.main)
                        .clipShape(Circle())
                }
                .offset(x: 35, y: 35)
            }

            // User Info
            VStack(spacing: BPSpacing.xs) {
                BPText(authManager.currentUser?.fullName ?? "Guest User", style: .heading2)
                    .foregroundColor(BPColors.Text.primary)

                BPText(authManager.currentUser?.email ?? "guest@beproductive.app", style: .bodyMedium)
                    .foregroundColor(BPColors.Text.secondary)

                if authManager.isGuestMode {
                    HStack(spacing: BPSpacing.xs) {
                        Image(systemName: "person.crop.circle.badge.questionmark")
                            .font(.caption)
                            .foregroundColor(BPColors.Warning.main)

                        BPText("Guest Mode", style: .labelSmall)
                            .foregroundColor(BPColors.Warning.main)
                    }
                    .padding(.horizontal, BPSpacing.sm)
                    .padding(.vertical, BPSpacing.xs)
                    .background(BPColors.Warning.main.opacity(0.1))
                    .cornerRadius(BPSpacing.xs)
                }
            }

            // Edit Profile Button
            BPButton(
                "Edit Profile",
                style: .secondary,
                size: .medium,
                action: {
                    // Edit profile
                }
            )
        }
        .bpCard()
    }
}

struct QuickStatsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Your Progress", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            HStack(spacing: BPSpacing.md) {
                StatCard(title: "Tasks Completed", value: "142", icon: "checkmark.circle.fill", color: BPColors.Success.main)
                StatCard(title: "Goals Achieved", value: "8", icon: "target", color: BPColors.Primary.main)
                StatCard(title: "Day Streak", value: "23", icon: "flame.fill", color: BPColors.Warning.main)
            }
        }
        .bpCard()
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            BPText(value, style: .heading4)
                .foregroundColor(BPColors.Text.primary)

            BPText(title, style: .labelSmall)
                .foregroundColor(BPColors.Text.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, BPSpacing.md)
        .background(color.opacity(0.05))
        .cornerRadius(BPSpacing.sm)
    }
}

struct SettingsSectionView: View {
    @EnvironmentObject var themeManager: BPThemeManager

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Settings", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.xs) {
                SettingsRow(
                    icon: "moon.fill",
                    title: "Theme",
                    subtitle: themeManager.currentTheme.name,
                    action: { /* Change theme */ }
                )

                SettingsRow(
                    icon: "bell.fill",
                    title: "Notifications",
                    subtitle: "Customize alerts",
                    action: { /* Notification settings */ }
                )

                SettingsRow(
                    icon: "globe",
                    title: "Language",
                    subtitle: "English",
                    action: { /* Language settings */ }
                )

                SettingsRow(
                    icon: "icloud.fill",
                    title: "Data & Sync",
                    subtitle: "Manage your data",
                    action: { /* Data settings */ }
                )

                SettingsRow(
                    icon: "lock.fill",
                    title: "Privacy & Security",
                    subtitle: "Protect your information",
                    action: { /* Privacy settings */ }
                )
            }
        }
        .bpCard()
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: BPSpacing.md) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(BPColors.Primary.main)
                    .frame(width: 24, height: 24)

                VStack(alignment: .leading, spacing: BPSpacing.xs) {
                    BPText(title, style: .bodyMedium)
                        .foregroundColor(BPColors.Text.primary)

                    BPText(subtitle, style: .bodySmall)
                        .foregroundColor(BPColors.Text.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(BPColors.Text.tertiary)
            }
            .padding(.vertical, BPSpacing.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct AIAndPremiumSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("AI & Premium", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                // Luna AI Card
                HStack(spacing: BPSpacing.md) {
                    Image(systemName: "brain.head.profile")
                        .font(.title2)
                        .foregroundColor(BPColors.Primary.main)
                        .frame(width: 40, height: 40)
                        .background(BPColors.Primary.main.opacity(0.1))
                        .cornerRadius(BPSpacing.sm)

                    VStack(alignment: .leading, spacing: BPSpacing.xs) {
                        BPText("Luna AI Assistant", style: .bodyLarge)
                            .foregroundColor(BPColors.Text.primary)

                        BPText("Your personal productivity coach", style: .bodySmall)
                            .foregroundColor(BPColors.Text.secondary)
                    }

                    Spacer()

                    BPButton(
                        "Chat",
                        style: .primary,
                        size: .small,
                        action: {
                            // Open Luna chat
                        }
                    )
                }
                .bpCard()

                // Premium Card
                HStack(spacing: BPSpacing.md) {
                    Image(systemName: "crown.fill")
                        .font(.title2)
                        .foregroundColor(BPColors.Warning.main)
                        .frame(width: 40, height: 40)
                        .background(BPColors.Warning.main.opacity(0.1))
                        .cornerRadius(BPSpacing.sm)

                    VStack(alignment: .leading, spacing: BPSpacing.xs) {
                        BPText("BeProductive Premium", style: .bodyLarge)
                            .foregroundColor(BPColors.Text.primary)

                        BPText("Unlock advanced features", style: .bodySmall)
                            .foregroundColor(BPColors.Text.secondary)
                    }

                    Spacer()

                    BPButton(
                        "Upgrade",
                        style: .secondary,
                        size: .small,
                        action: {
                            // Upgrade to premium
                        }
                    )
                }
                .bpCard()
            }
        }
    }
}

struct AccountActionsView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            if authManager.isGuestMode {
                BPButton(
                    "Create Account",
                    icon: "person.badge.plus",
                    style: .primary,
                    size: .large,
                    action: {
                        Task {
                            await authManager.exitGuestMode()
                        }
                    }
                )

                BPButton(
                    "Sign In",
                    icon: "arrow.right.square",
                    style: .secondary,
                    size: .large,
                    action: {
                        Task {
                            await authManager.exitGuestMode()
                        }
                    }
                )
            } else {
                BPButton(
                    "Sign Out",
                    icon: "arrow.left.square",
                    style: .ghost,
                    size: .large,
                    action: {
                        Task {
                            await authManager.signOut()
                        }
                    }
                )
            }

            // App Info
            VStack(spacing: BPSpacing.xs) {
                BPText("BeProductive v\(ConfigurationManager.shared.appVersion)", style: .labelSmall)
                    .foregroundColor(BPColors.Text.tertiary)

                BPText("Build \(ConfigurationManager.shared.buildNumber)", style: .labelSmall)
                    .foregroundColor(BPColors.Text.tertiary)
            }
            .padding(.top, BPSpacing.md)
        }
    }
}

// MARK: - Supporting Views
struct NewTaskView: View {
    var body: some View {
        BPText("New Task", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct NewGoalView: View {
    var body: some View {
        BPText("New Goal", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct NewProjectView: View {
    var body: some View {
        BPText("New Project", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct LunaChatView: View {
    var body: some View {
        BPText("Luna Chat", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct NotificationsView: View {
    var body: some View {
        BPText("Notifications", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct TeamInviteView: View {
    var body: some View {
        BPText("Team Invite", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct SettingsView: View {
    var body: some View {
        BPText("Settings", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

struct AuthenticationView: View {
    var body: some View {
        BPText("Authentication", style: .heading1)
            .foregroundColor(BPColors.Text.primary)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
        .environmentObject(BPThemeManager.shared)
}