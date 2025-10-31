import SwiftUI
import Combine

@MainActor
class AppCoordinator: ObservableObject {

    // MARK: - Published Properties
    @Published var selectedTab: TabType = .capture
    @Published var navigationPath = NavigationPath()
    @Published var presentedSheet: SheetType?
    @Published var presentedAlert: AlertType?
    @Published var isOnboardingRequired = false

    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let userDefaults = UserDefaults.standard

    // MARK: - Initialization
    func initialize() {
        checkOnboardingStatus()
        setupNavigationObservers()
    }

    // MARK: - Navigation Methods
    func navigateToTab(_ tab: TabType) {
        selectedTab = tab
        navigationPath = NavigationPath() // Reset path when switching tabs
    }

    func push<T: Hashable>(_ destination: T) {
        navigationPath.append(destination)
    }

    func pop() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }

    func popToRoot() {
        navigationPath = NavigationPath()
    }

    func presentSheet(_ sheet: SheetType) {
        presentedSheet = sheet
    }

    func dismissSheet() {
        presentedSheet = nil
    }

    func presentAlert(_ alert: AlertType) {
        presentedAlert = alert
    }

    func dismissAlert() {
        presentedAlert = nil
    }

    // MARK: - Deep Linking
    func handleDeepLink(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else { return }

        switch host {
        case "capture":
            navigateToTab(.capture)
        case "plan":
            navigateToTab(.plan)
        case "engage":
            navigateToTab(.engage)
        case "profile":
            navigateToTab(.profile)
        case "task":
            handleTaskDeepLink(components)
        case "goal":
            handleGoalDeepLink(components)
        case "project":
            handleProjectDeepLink(components)
        default:
            break
        }
    }

    // MARK: - Onboarding
    func completeOnboarding() {
        isOnboardingRequired = false
        userDefaults.set(true, forKey: "hasCompletedOnboarding")
    }

    // MARK: - Private Methods
    private func checkOnboardingStatus() {
        isOnboardingRequired = !userDefaults.bool(forKey: "hasCompletedOnboarding")
    }

    private func setupNavigationObservers() {
        // Listen for external navigation events
        NotificationCenter.default
            .publisher(for: .navigateToTab)
            .compactMap { $0.userInfo?["tab"] as? TabType }
            .sink { [weak self] tab in
                self?.navigateToTab(tab)
            }
            .store(in: &cancellables)
    }

    private func handleTaskDeepLink(_ components: URLComponents) {
        guard let taskId = components.queryItems?.first(where: { $0.name == "id" })?.value else { return }
        navigateToTab(.plan)
        push(TaskDestination.detail(taskId))
    }

    private func handleGoalDeepLink(_ components: URLComponents) {
        guard let goalId = components.queryItems?.first(where: { $0.name == "id" })?.value else { return }
        navigateToTab(.plan)
        push(GoalDestination.detail(goalId))
    }

    private func handleProjectDeepLink(_ components: URLComponents) {
        guard let projectId = components.queryItems?.first(where: { $0.name == "id" })?.value else { return }
        navigateToTab(.plan)
        push(ProjectDestination.detail(projectId))
    }
}

// MARK: - Supporting Types
enum TabType: String, CaseIterable {
    case capture = "capture"
    case plan = "plan"
    case engage = "engage"
    case profile = "profile"

    var title: String {
        switch self {
        case .capture: return "Capture"
        case .plan: return "Plan"
        case .engage: return "Engage"
        case .profile: return "Profile"
        }
    }

    var iconName: String {
        switch self {
        case .capture: return "mic.fill"
        case .plan: return "list.bullet.clipboard"
        case .engage: return "chart.line.uptrend.xyaxis"
        case .profile: return "person.crop.circle"
        }
    }
}

enum SheetType: Identifiable {
    case settings
    case newTask
    case newGoal
    case newProject
    case lunaChat
    case notifications
    case teamInvite

    var id: String {
        switch self {
        case .settings: return "settings"
        case .newTask: return "newTask"
        case .newGoal: return "newGoal"
        case .newProject: return "newProject"
        case .lunaChat: return "lunaChat"
        case .notifications: return "notifications"
        case .teamInvite: return "teamInvite"
        }
    }
}

enum AlertType: Identifiable {
    case deleteConfirmation(String)
    case error(String)
    case success(String)
    case networkUnavailable

    var id: String {
        switch self {
        case .deleteConfirmation: return "deleteConfirmation"
        case .error: return "error"
        case .success: return "success"
        case .networkUnavailable: return "networkUnavailable"
        }
    }
}

// MARK: - Navigation Destinations
enum TaskDestination: Hashable {
    case list
    case detail(String)
    case edit(String)
    case create
}

enum GoalDestination: Hashable {
    case list
    case detail(String)
    case edit(String)
    case create
}

enum ProjectDestination: Hashable {
    case list
    case detail(String)
    case edit(String)
    case create
}

// MARK: - Notification Extensions
extension Notification.Name {
    static let navigateToTab = Notification.Name("navigateToTab")
}