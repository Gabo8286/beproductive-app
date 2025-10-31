import SwiftUI
import SwiftData
import BeProductiveUI
import BackgroundTasks

@available(iOS 17, *)
@main
struct BeProductiveApp: App {

    @StateObject private var appCoordinator = AppCoordinator()
    @StateObject private var authenticationManager = AuthenticationManager()
    @StateObject private var themeManager = BPThemeManager.shared
    @StateObject private var dataManager = DataManager()
    @StateObject private var analyticsManager: AnalyticsManager
    @StateObject private var sessionManager: SessionManager
    @StateObject private var backgroundSyncManager: BackgroundSyncManager

    init() {
        // Configure background tasks
        BackgroundSyncManager.configureBGTaskScheduler()

        // Initialize state objects with dependencies
        let dataManager = DataManager()
        let authManager = AuthenticationManager()
        let analyticsManager = AnalyticsManager(dataManager: dataManager)
        let sessionManager = SessionManager(authManager: authManager, dataManager: dataManager)
        let backgroundSyncManager = BackgroundSyncManager(dataManager: dataManager, syncEngine: dataManager.syncEngine)

        self._dataManager = StateObject(wrappedValue: dataManager)
        self._authenticationManager = StateObject(wrappedValue: authManager)
        self._analyticsManager = StateObject(wrappedValue: analyticsManager)
        self._sessionManager = StateObject(wrappedValue: sessionManager)
        self._backgroundSyncManager = StateObject(wrappedValue: backgroundSyncManager)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .task(priority: .userInitiated) {
                    await initializeApp()
                }
                .environmentObject(appCoordinator)
                .environmentObject(authenticationManager)
                .environmentObject(themeManager)
                .environmentObject(dataManager)
                .environmentObject(analyticsManager)
                .environmentObject(sessionManager)
                .environmentObject(backgroundSyncManager)
                .beProductiveTheme(themeManager.currentTheme)
                .modelContainer(dataManager.container)
                .task(id: authenticationManager.isAuthenticated) {
                    let isAuthenticated = authenticationManager.isAuthenticated
                    if isAuthenticated {
                        await sessionManager.startSession()
                    } else {
                        await sessionManager.endSession()
                    }
                }
        }
    }

    private func initializeApp() async {
        // Initialize core services
        await authenticationManager.initialize()
        await dataManager.initialize()
        
        // Start analytics session
        analyticsManager.startAnalyticsSession()

        // Set up initial state
        appCoordinator.initialize()

        // Start session if authenticated
        if authenticationManager.isAuthenticated {
            await sessionManager.startSession()
        }

        // Configure Luna AI if available
        await configureLunaAI()
    }

    private func configureLunaAI() async {
        // Initialize AI services based on user preferences
        // This will be implemented in Phase 3
    }
}

@available(iOS 17, *)
struct RootView: View {
    @EnvironmentObject var appCoordinator: AppCoordinator
    @EnvironmentObject var authenticationManager: AuthenticationManager

    var body: some View {
        Group {
            if authenticationManager.isLoading {
                LaunchView()
            } else if authenticationManager.isAuthenticated {
                MainTabView()
                    .transition(.opacity)
            } else {
                AuthenticationView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authenticationManager.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: authenticationManager.isLoading)
    }
}

@available(iOS 17, *)
struct LaunchView: View {
    var body: some View {
        ZStack {
            BPColors.Background.primary
                .ignoresSafeArea()

            VStack(spacing: 24) { // Using direct value for now
                // App logo/icon
                Image(systemName: "target")
                    .font(.system(size: 80))
                    .foregroundColor(BPColors.Primary.main)

                BPText("BeProductive", style: .displayLarge)
                    .foregroundColor(BPColors.Text.primary)

                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: BPColors.Primary.main))
                    .scaleEffect(1.5)
            }
        }
    }
}
