import Foundation
import SwiftUI
import UserNotifications
import AVFoundation
import CoreLocation

@MainActor
class OnboardingManager: ObservableObject {

    // MARK: - Published Properties
    @Published var currentStep: OnboardingStep = .welcome
    @Published var isOnboardingCompleted: Bool {
        didSet {
            UserDefaults.standard.set(isOnboardingCompleted, forKey: "onboardingCompleted")
        }
    }

    // MARK: - Initialization
    init() {
        self.isOnboardingCompleted = UserDefaults.standard.bool(forKey: "onboardingCompleted")
    }

    // MARK: - Public Methods
    func nextStep() {
        guard let nextStep = OnboardingStep(rawValue: currentStep.rawValue + 1) else {
            completeOnboarding()
            return
        }

        withAnimation(.easeInOut(duration: 0.3)) {
            currentStep = nextStep
        }
    }

    func previousStep() {
        guard let previousStep = OnboardingStep(rawValue: currentStep.rawValue - 1) else {
            return
        }

        withAnimation(.easeInOut(duration: 0.3)) {
            currentStep = previousStep
        }
    }

    func skipToStep(_ step: OnboardingStep) {
        withAnimation(.easeInOut(duration: 0.3)) {
            currentStep = step
        }
    }

    func completeOnboarding() {
        isOnboardingCompleted = true

        // Track onboarding completion
        AnalyticsManager.shared?.trackUserAction(.guestModeEntered, context: [
            "onboarding_completed": true,
            "final_step": currentStep.rawValue
        ])
    }

    func resetOnboarding() {
        isOnboardingCompleted = false
        currentStep = .welcome
    }

    // MARK: - Static Methods
    static func shouldShowOnboarding() -> Bool {
        return !UserDefaults.standard.bool(forKey: "onboardingCompleted")
    }
}

// MARK: - Permission Manager
@MainActor
class PermissionManager: ObservableObject {

    // MARK: - Published Properties
    @Published var notificationsGranted = false
    @Published var locationGranted = false
    @Published var cameraGranted = false

    // MARK: - Initialization
    init() {
        checkPermissions()
    }

    // MARK: - Public Methods
    func requestNotifications() async {
        do {
            let granted = try await UNUserNotificationCenter.current().requestAuthorization(
                options: [.alert, .badge, .sound]
            )
            notificationsGranted = granted

            if granted {
                // Register for remote notifications
                UIApplication.shared.registerForRemoteNotifications()
            }
        } catch {
            print("Failed to request notification permission: \(error)")
        }
    }

    func requestLocation() async {
        let locationManager = CLLocationManager()
        locationManager.requestWhenInUseAuthorization()

        // Check status after request
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.checkLocationPermission()
        }
    }

    func requestCamera() async {
        let status = await AVCaptureDevice.requestAccess(for: .video)
        cameraGranted = status
    }

    func checkPermissions() {
        checkNotificationPermission()
        checkLocationPermission()
        checkCameraPermission()
    }

    // MARK: - Private Methods
    private func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.notificationsGranted = settings.authorizationStatus == .authorized
            }
        }
    }

    private func checkLocationPermission() {
        let status = CLLocationManager().authorizationStatus
        locationGranted = status == .authorizedWhenInUse || status == .authorizedAlways
    }

    private func checkCameraPermission() {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        cameraGranted = status == .authorized
    }
}

// MARK: - Onboarding Step Enum
enum OnboardingStep: Int, CaseIterable {
    case welcome = 0
    case features = 1
    case permissions = 2
    case personalization = 3
    case completion = 4

    var title: String {
        switch self {
        case .welcome: return "Welcome"
        case .features: return "Features"
        case .permissions: return "Permissions"
        case .personalization: return "Personalization"
        case .completion: return "Completion"
        }
    }

    var description: String {
        switch self {
        case .welcome: return "Welcome to BeProductive"
        case .features: return "Discover what you can do"
        case .permissions: return "Grant necessary permissions"
        case .personalization: return "Customize your experience"
        case .completion: return "You're ready to go!"
        }
    }
}

// MARK: - Onboarding Analytics
extension OnboardingManager {
    func trackStepViewed(_ step: OnboardingStep) {
        AnalyticsManager.shared?.trackScreenView("onboarding_\(step.title.lowercased())", properties: [
            "step_number": step.rawValue,
            "step_title": step.title
        ])
    }

    func trackStepCompleted(_ step: OnboardingStep, timeSpent: TimeInterval) {
        AnalyticsManager.shared?.trackEvent(.userAction, properties: [
            "action": "onboarding_step_completed",
            "step": step.title,
            "step_number": step.rawValue,
            "time_spent": timeSpent
        ])
    }

    func trackOnboardingAbandoned(_ step: OnboardingStep) {
        AnalyticsManager.shared?.trackEvent(.userAction, properties: [
            "action": "onboarding_abandoned",
            "step": step.title,
            "step_number": step.rawValue
        ])
    }
}

// MARK: - Onboarding Validation
extension OnboardingManager {
    func canProceedFromStep(_ step: OnboardingStep) -> Bool {
        switch step {
        case .welcome, .features:
            return true
        case .permissions:
            // Can proceed without permissions, but encourage them
            return true
        case .personalization:
            return true
        case .completion:
            return true
        }
    }

    func getStepProgress() -> Double {
        return Double(currentStep.rawValue) / Double(OnboardingStep.allCases.count - 1)
    }
}

// MARK: - User Onboarding Data
struct OnboardingUserData {
    var hasSeenWelcome: Bool = false
    var hasGrantedNotifications: Bool = false
    var hasGrantedLocation: Bool = false
    var hasGrantedCamera: Bool = false
    var hasCustomizedPreferences: Bool = false
    var completionDate: Date?

    static func load() -> OnboardingUserData {
        let defaults = UserDefaults.standard

        return OnboardingUserData(
            hasSeenWelcome: defaults.bool(forKey: "onboarding_seen_welcome"),
            hasGrantedNotifications: defaults.bool(forKey: "onboarding_granted_notifications"),
            hasGrantedLocation: defaults.bool(forKey: "onboarding_granted_location"),
            hasGrantedCamera: defaults.bool(forKey: "onboarding_granted_camera"),
            hasCustomizedPreferences: defaults.bool(forKey: "onboarding_customized_preferences"),
            completionDate: defaults.object(forKey: "onboarding_completion_date") as? Date
        )
    }

    func save() {
        let defaults = UserDefaults.standard

        defaults.set(hasSeenWelcome, forKey: "onboarding_seen_welcome")
        defaults.set(hasGrantedNotifications, forKey: "onboarding_granted_notifications")
        defaults.set(hasGrantedLocation, forKey: "onboarding_granted_location")
        defaults.set(hasGrantedCamera, forKey: "onboarding_granted_camera")
        defaults.set(hasCustomizedPreferences, forKey: "onboarding_customized_preferences")

        if let completionDate = completionDate {
            defaults.set(completionDate, forKey: "onboarding_completion_date")
        }
    }
}