import SwiftUI
import BeProductiveUI

struct MainTabView: View {
    @EnvironmentObject var appCoordinator: AppCoordinator
    
    // Convert TabType to Int index for BPTabBar
    private var selectedIndex: Binding<Int> {
        Binding(
            get: {
                TabType.allCases.firstIndex(of: appCoordinator.selectedTab) ?? 0
            },
            set: { newIndex in
                if newIndex < TabType.allCases.count {
                    appCoordinator.selectedTab = TabType.allCases[newIndex]
                }
            }
        )
    }
    
    // Create TabItem array from TabType enum
    private var tabItems: [BPTabBar.TabItem] {
        TabType.allCases.map { tab in
            BPTabBar.TabItem(
                id: tab.rawValue,
                title: tab.title,
                icon: tab.iconName
            )
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Main content view based on selected tab
            Group {
                switch appCoordinator.selectedTab {
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
            
            // Tab bar
            BPTabBar(
                selectedIndex: selectedIndex,
                items: tabItems
            )
        }
        .sheet(item: $appCoordinator.presentedSheet) { sheet in
            SheetContentView(sheet: sheet)
        }
        .alert(item: $appCoordinator.presentedAlert) { alert in
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



#Preview {
    MainTabView()
        .environmentObject(AppCoordinator())
        .environmentObject(BPThemeManager.shared)
}