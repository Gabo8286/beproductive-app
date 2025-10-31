import SwiftUI
import BeProductiveUI

struct MainTabView: View {
    @EnvironmentObject var appCoordinator: AppCoordinator

    var body: some View {
        BPTabBar(selectedTab: $appCoordinator.selectedTab) {
            ForEach(TabType.allCases, id: \.self) { tab in
                Group {
                    switch tab {
                    case .capture:
                        CaptureView()
                    case .plan:
                        PlanView()
                    case .engage:
                        EngageView()
                    case .profile:
                        ProfileView()
                    }
                }
                .bpTabItem(tab.title, icon: tab.iconName, tag: tab)
            }
        }
        .sheet(item: $appCoordinator.presentedSheet) { sheet in
            SheetContentView(sheet: sheet)
        }
        .alert(item: $appCoordinator.presentedAlert) { alert in
            AlertContentView(alert: alert)
        }
    }
}

struct SheetContentView: View {
    let sheet: SheetType

    var body: some View {
        NavigationView {
            Group {
                switch sheet {
                case .settings:
                    SettingsView()
                case .newTask:
                    NewTaskView()
                case .newGoal:
                    NewGoalView()
                case .newProject:
                    NewProjectView()
                case .lunaChat:
                    LunaChatView()
                case .notifications:
                    NotificationsView()
                case .teamInvite:
                    TeamInviteView()
                }
            }
        }
    }
}

struct AlertContentView: View {
    let alert: AlertType
    @EnvironmentObject var appCoordinator: AppCoordinator

    var body: some View {
        switch alert {
        case .deleteConfirmation(let message):
            Alert(
                title: Text("Confirm Deletion"),
                message: Text(message),
                primaryButton: .destructive(Text("Delete")) {
                    // Handle deletion
                },
                secondaryButton: .cancel()
            )
        case .error(let message):
            Alert(
                title: Text("Error"),
                message: Text(message),
                dismissButton: .default(Text("OK"))
            )
        case .success(let message):
            Alert(
                title: Text("Success"),
                message: Text(message),
                dismissButton: .default(Text("OK"))
            )
        case .networkUnavailable:
            Alert(
                title: Text("Network Unavailable"),
                message: Text("Please check your internet connection and try again."),
                dismissButton: .default(Text("OK"))
            )
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}