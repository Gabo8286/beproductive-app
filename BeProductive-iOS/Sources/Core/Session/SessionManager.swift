import SwiftUI
import Combine
import Foundation

@MainActor
class SessionManager: ObservableObject {

    // MARK: - Published Properties
    @Published var isSessionActive: Bool = false
    @Published var sessionDuration: TimeInterval = 0
    @Published var currentUser: User?
    @Published var userPreferences: UserPreferences = UserPreferences()
    @Published var lastActivity: Date = Date()

    // MARK: - Private Properties
    private let authManager: AuthenticationManager
    private let dataManager: DataManager
    private var sessionTimer: Timer?
    private var inactivityTimer: Timer?
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Configuration
    private let sessionTimeoutInterval: TimeInterval = 30 * 60 // 30 minutes
    private let backgroundTimeoutInterval: TimeInterval = 5 * 60 // 5 minutes
    private let autoSaveInterval: TimeInterval = 60 // 1 minute

    // MARK: - Initialization
    init(authManager: AuthenticationManager, dataManager: DataManager) {
        self.authManager = authManager
        self.dataManager = dataManager

        setupObservers()
        setupNotificationObservers()
    }

    // MARK: - Public Methods
    func startSession() async {
        guard let user = authManager.currentUser else {
            print("Cannot start session: No authenticated user")
            return
        }

        currentUser = user
        isSessionActive = true
        lastActivity = Date()

        // Load user preferences
        await loadUserPreferences()

        // Start session tracking
        startSessionTimer()
        startInactivityTimer()

        // Initialize data manager
        await dataManager.initialize()

        print("Session started for user: \(user.email)")
    }

    func endSession() async {
        isSessionActive = false
        sessionDuration = 0

        // Stop timers
        stopSessionTimer()
        stopInactivityTimer()

        // Save session data
        await saveSessionData()

        // Perform final sync
        await dataManager.performSync()

        print("Session ended")
    }

    func pauseSession() {
        guard isSessionActive else { return }

        stopSessionTimer()
        stopInactivityTimer()

        // Save current state
        Task {
            await saveSessionData()
        }

        print("Session paused")
    }

    func resumeSession() {
        guard isSessionActive else { return }

        updateActivity()
        startSessionTimer()
        startInactivityTimer()

        print("Session resumed")
    }

    func updateActivity() {
        lastActivity = Date()
        resetInactivityTimer()
    }

    func saveUserPreferences() async {
        guard let userId = currentUser?.id else { return }

        let encoder = JSONEncoder()
        if let data = try? encoder.encode(userPreferences) {
            UserDefaults.standard.set(data, forKey: "userPreferences_\(userId)")
        }

        print("User preferences saved")
    }

    func loadUserPreferences() async {
        guard let userId = currentUser?.id else { return }

        if let data = UserDefaults.standard.data(forKey: "userPreferences_\(userId)") {
            let decoder = JSONDecoder()
            if let preferences = try? decoder.decode(UserPreferences.self, from: data) {
                userPreferences = preferences
            }
        }

        print("User preferences loaded")
    }

    // MARK: - Session Persistence
    func saveSessionData() async {
        guard let userId = currentUser?.id else { return }

        let sessionData = SessionData(
            userId: userId,
            startTime: Date(timeIntervalSinceNow: -sessionDuration),
            duration: sessionDuration,
            lastActivity: lastActivity,
            isActive: isSessionActive
        )

        let encoder = JSONEncoder()
        if let data = try? encoder.encode(sessionData) {
            UserDefaults.standard.set(data, forKey: "currentSession")
        }

        // Auto-save data
        await dataManager.performIncrementalSync()

        print("Session data saved")
    }

    func restoreSession() async {
        if let data = UserDefaults.standard.data(forKey: "currentSession") {
            let decoder = JSONDecoder()
            if let sessionData = try? decoder.decode(SessionData.self, from: data) {

                // Check if session is still valid
                let timeSinceLastActivity = Date().timeIntervalSince(sessionData.lastActivity)

                if timeSinceLastActivity < sessionTimeoutInterval && sessionData.isActive {
                    // Restore session
                    sessionDuration = sessionData.duration + timeSinceLastActivity
                    lastActivity = sessionData.lastActivity
                    isSessionActive = true

                    print("Session restored after \(timeSinceLastActivity) seconds")
                    resumeSession()
                } else {
                    // Session expired
                    print("Session expired, starting fresh")
                    await clearSessionData()
                }
            }
        }
    }

    func clearSessionData() async {
        UserDefaults.standard.removeObject(forKey: "currentSession")
        sessionDuration = 0
        lastActivity = Date()
        isSessionActive = false
        print("Session data cleared")
    }

    // MARK: - Private Methods
    private func setupObservers() {
        // Observe authentication changes
        authManager.$currentUser
            .receive(on: DispatchQueue.main)
            .sink { [weak self] user in
                self?.currentUser = user
                if user == nil && self?.isSessionActive == true {
                    Task {
                        await self?.endSession()
                    }
                }
            }
            .store(in: &cancellables)

        authManager.$isAuthenticated
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isAuthenticated in
                if !isAuthenticated && self?.isSessionActive == true {
                    Task {
                        await self?.endSession()
                    }
                }
            }
            .store(in: &cancellables)
    }

    private func setupNotificationObservers() {
        // App lifecycle notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillTerminate),
            name: UIApplication.willTerminateNotification,
            object: nil
        )

        // User interaction notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(userDidInteract),
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )
    }

    @objc private func appDidEnterBackground() {
        pauseSession()
    }

    @objc private func appWillEnterForeground() {
        if isSessionActive {
            resumeSession()
        }
    }

    @objc private func appWillTerminate() {
        Task {
            await endSession()
        }
    }

    @objc private func userDidInteract() {
        updateActivity()
    }

    private func startSessionTimer() {
        sessionTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.sessionDuration += 1
        }
    }

    private func stopSessionTimer() {
        sessionTimer?.invalidate()
        sessionTimer = nil
    }

    private func startInactivityTimer() {
        inactivityTimer = Timer.scheduledTimer(withTimeInterval: sessionTimeoutInterval, repeats: false) { [weak self] _ in
            Task {
                await self?.handleInactivityTimeout()
            }
        }
    }

    private func stopInactivityTimer() {
        inactivityTimer?.invalidate()
        inactivityTimer = nil
    }

    private func resetInactivityTimer() {
        stopInactivityTimer()
        startInactivityTimer()
    }

    private func handleInactivityTimeout() async {
        print("Session timed out due to inactivity")

        // Save current state before timeout
        await saveSessionData()

        // End session
        await endSession()

        // Optionally show timeout alert
        // This would be handled by the UI layer
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - Supporting Types
struct UserPreferences: Codable {
    var theme: AppTheme = .system
    var language: String = "en"
    var notifications: NotificationSettings = NotificationSettings()
    var sync: SyncSettings = SyncSettings()
    var privacy: PrivacySettings = PrivacySettings()

    enum AppTheme: String, CaseIterable, Codable {
        case light = "light"
        case dark = "dark"
        case system = "system"
    }
}

struct NotificationSettings: Codable {
    var taskReminders: Bool = true
    var goalDeadlines: Bool = true
    var habitReminders: Bool = true
    var syncNotifications: Bool = false
    var analyticsReports: Bool = true

    var reminderTime: String = "09:00" // HH:mm format
    var quietHoursStart: String = "22:00"
    var quietHoursEnd: String = "08:00"
}

struct SyncSettings: Codable {
    var autoSync: Bool = true
    var backgroundSync: Bool = true
    var syncFrequency: SyncFrequency = .every30Minutes
    var syncOnlyOnWiFi: Bool = false
    var conflictResolution: ConflictResolution = .askUser

    enum SyncFrequency: String, CaseIterable, Codable {
        case every15Minutes = "15min"
        case every30Minutes = "30min"
        case hourly = "1hour"
        case manual = "manual"

        var interval: TimeInterval {
            switch self {
            case .every15Minutes: return 15 * 60
            case .every30Minutes: return 30 * 60
            case .hourly: return 60 * 60
            case .manual: return .infinity
            }
        }
    }

    enum ConflictResolution: String, CaseIterable, Codable {
        case askUser = "ask"
        case preferLocal = "local"
        case preferRemote = "remote"
        case mergeChanges = "merge"
    }
}

struct PrivacySettings: Codable {
    var shareUsageData: Bool = false
    var shareCrashReports: Bool = true
    var allowAnalytics: Bool = true
    var biometricAuth: Bool = false
    var requireAuthOnLaunch: Bool = false
}

struct SessionData: Codable {
    let userId: UUID
    let startTime: Date
    let duration: TimeInterval
    let lastActivity: Date
    let isActive: Bool
}

// MARK: - Session Analytics
extension SessionManager {
    func getSessionStats() -> SessionStats {
        return SessionStats(
            currentSessionDuration: sessionDuration,
            lastActivity: lastActivity,
            isActive: isSessionActive,
            totalSessions: getTotalSessionCount(),
            averageSessionDuration: getAverageSessionDuration()
        )
    }

    private func getTotalSessionCount() -> Int {
        return UserDefaults.standard.integer(forKey: "totalSessionCount")
    }

    private func getAverageSessionDuration() -> TimeInterval {
        let total = UserDefaults.standard.double(forKey: "totalSessionDuration")
        let count = getTotalSessionCount()
        return count > 0 ? total / Double(count) : 0
    }

    private func updateSessionStats() {
        let currentCount = getTotalSessionCount()
        let currentTotal = UserDefaults.standard.double(forKey: "totalSessionDuration")

        UserDefaults.standard.set(currentCount + 1, forKey: "totalSessionCount")
        UserDefaults.standard.set(currentTotal + sessionDuration, forKey: "totalSessionDuration")
    }
}

struct SessionStats {
    let currentSessionDuration: TimeInterval
    let lastActivity: Date
    let isActive: Bool
    let totalSessions: Int
    let averageSessionDuration: TimeInterval
}