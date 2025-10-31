import SwiftUI
import Combine

/// BeProductive Theme Manager
///
/// Manages theme state and provides reactive theme updates throughout the application.
/// Supports automatic system appearance changes, accessibility updates, and custom theme switching.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public class BPThemeManager: ObservableObject {

    // MARK: - Singleton

    public static let shared = BPThemeManager()

    // MARK: - Published Properties

    @Published public private(set) var currentTheme: BPTheme
    @Published public private(set) var systemAppearance: UIUserInterfaceStyle = .unspecified
    @Published public private(set) var accessibilitySettings: AccessibilitySettings

    // MARK: - Private Properties

    private var cancellables = Set<AnyCancellable>()
    private let userDefaults = UserDefaults.standard

    // MARK: - User Defaults Keys

    private enum UserDefaultsKeys {
        static let selectedTheme = "BPTheme_SelectedTheme"
        static let accessibilityLevel = "BPTheme_AccessibilityLevel"
        static let respectSystemAppearance = "BPTheme_RespectSystemAppearance"
    }

    // MARK: - Accessibility Settings

    public struct AccessibilitySettings {
        public let level: BPTheme.AccessibilityLevel
        public let respectSystemSettings: Bool
        public let reduceMotion: Bool
        public let increaseContrast: Bool
        public let boldText: Bool

        public init(
            level: BPTheme.AccessibilityLevel = .standard,
            respectSystemSettings: Bool = true,
            reduceMotion: Bool = false,
            increaseContrast: Bool = false,
            boldText: Bool = false
        ) {
            self.level = level
            self.respectSystemSettings = respectSystemSettings
            self.reduceMotion = reduceMotion
            self.increaseContrast = increaseContrast
            self.boldText = boldText
        }
    }

    // MARK: - Initialization

    private init() {
        // Initialize accessibility settings
        self.accessibilitySettings = AccessibilitySettings()

        // Load saved theme preference or use default
        let savedThemeName = userDefaults.string(forKey: UserDefaultsKeys.selectedTheme) ?? "default"
        self.currentTheme = BPThemeManager.theme(for: savedThemeName)

        // Set up system appearance monitoring
        self.setupSystemAppearanceMonitoring()

        // Set up accessibility monitoring
        self.setupAccessibilityMonitoring()
    }

    // MARK: - Public Methods

    /// Set the current theme
    public func setTheme(_ theme: BPTheme) {
        withAnimation(theme.animations.smooth) {
            currentTheme = theme
        }
        userDefaults.set(theme.name, forKey: UserDefaultsKeys.selectedTheme)
    }

    /// Set theme by name
    public func setTheme(named name: String) {
        let theme = BPThemeManager.theme(for: name)
        setTheme(theme)
    }

    /// Toggle between light and dark theme
    public func toggleAppearance() {
        let newAppearance: UIUserInterfaceStyle = currentTheme.appearance == .light ? .dark : .light
        let newTheme = BPTheme(
            name: "BeProductive \(newAppearance == .light ? "Light" : "Dark")",
            appearance: newAppearance,
            accessibilityLevel: currentTheme.accessibilityLevel
        )
        setTheme(newTheme)
    }

    /// Update accessibility level
    public func setAccessibilityLevel(_ level: BPTheme.AccessibilityLevel) {
        let newTheme = BPTheme(
            name: currentTheme.name,
            appearance: currentTheme.appearance,
            accessibilityLevel: level
        )
        setTheme(newTheme)
        userDefaults.set(level.rawValue, forKey: UserDefaultsKeys.accessibilityLevel)
    }

    /// Enable or disable system appearance following
    public func setRespectSystemAppearance(_ respect: Bool) {
        userDefaults.set(respect, forKey: UserDefaultsKeys.respectSystemAppearance)
        if respect {
            updateThemeForSystemAppearance()
        }
    }

    /// Get whether the app respects system appearance
    public var respectsSystemAppearance: Bool {
        return userDefaults.bool(forKey: UserDefaultsKeys.respectSystemAppearance)
    }

    // MARK: - Private Methods

    private func setupSystemAppearanceMonitoring() {
        // Monitor system appearance changes
        NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)
            .sink { [weak self] _ in
                self?.updateSystemAppearance()
            }
            .store(in: &cancellables)

        // Initial system appearance detection
        updateSystemAppearance()
    }

    private func setupAccessibilityMonitoring() {
        // Monitor accessibility setting changes
        NotificationCenter.default.publisher(for: UIAccessibility.reduceMotionStatusDidChangeNotification)
            .merge(with: NotificationCenter.default.publisher(for: UIAccessibility.darkerSystemColorsStatusDidChangeNotification))
            .merge(with: NotificationCenter.default.publisher(for: UIAccessibility.boldTextStatusDidChangeNotification))
            .sink { [weak self] _ in
                self?.updateAccessibilitySettings()
            }
            .store(in: &cancellables)

        // Initial accessibility settings detection
        updateAccessibilitySettings()
    }

    private func updateSystemAppearance() {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            return
        }

        let newAppearance = window.traitCollection.userInterfaceStyle

        if newAppearance != systemAppearance {
            systemAppearance = newAppearance

            if respectsSystemAppearance {
                updateThemeForSystemAppearance()
            }
        }
    }

    private func updateThemeForSystemAppearance() {
        let newTheme = BPTheme(
            name: "BeProductive System",
            appearance: systemAppearance,
            accessibilityLevel: currentTheme.accessibilityLevel
        )
        setTheme(newTheme)
    }

    private func updateAccessibilitySettings() {
        let newSettings = AccessibilitySettings(
            level: accessibilitySettings.level,
            respectSystemSettings: accessibilitySettings.respectSystemSettings,
            reduceMotion: UIAccessibility.isReduceMotionEnabled,
            increaseContrast: UIAccessibility.isDarkerSystemColorsEnabled,
            boldText: UIAccessibility.isBoldTextEnabled
        )

        accessibilitySettings = newSettings

        // Update theme if needed based on accessibility changes
        if newSettings.increaseContrast && currentTheme.accessibilityLevel == .standard {
            setAccessibilityLevel(.enhanced)
        }
    }

    // MARK: - Theme Lookup

    private static func theme(for name: String) -> BPTheme {
        switch name.lowercased() {
        case "light":
            return .light
        case "dark":
            return .dark
        case "high contrast light", "highcontrastlight":
            return .highContrastLight
        case "high contrast dark", "highcontrastdark":
            return .highContrastDark
        case "enhanced":
            return .enhanced
        default:
            return .default
        }
    }
}

// MARK: - Theme Environment

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPThemeKey: EnvironmentKey {
    static let defaultValue: BPTheme = .default
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension EnvironmentValues {
    public var bpTheme: BPTheme {
        get { self[BPThemeKey.self] }
        set { self[BPThemeKey.self] = newValue }
    }
}

// MARK: - Theme Manager Environment

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPThemeManagerKey: EnvironmentKey {
    static let defaultValue: BPThemeManager = BPThemeManager.shared
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension EnvironmentValues {
    public var bpThemeManager: BPThemeManager {
        get { self[BPThemeManagerKey.self] }
        set { self[BPThemeManagerKey.self] = newValue }
    }
}

// MARK: - Theme Preference Environment

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPThemePreference {
    public let appearance: UIUserInterfaceStyle
    public let accessibilityLevel: BPTheme.AccessibilityLevel
    public let respectSystemAppearance: Bool

    public init(
        appearance: UIUserInterfaceStyle = .unspecified,
        accessibilityLevel: BPTheme.AccessibilityLevel = .standard,
        respectSystemAppearance: Bool = true
    ) {
        self.appearance = appearance
        self.accessibilityLevel = accessibilityLevel
        self.respectSystemAppearance = respectSystemAppearance
    }
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPThemePreferenceKey: EnvironmentKey {
    static let defaultValue = BPThemePreference()
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension EnvironmentValues {
    public var bpThemePreference: BPThemePreference {
        get { self[BPThemePreferenceKey.self] }
        set { self[BPThemePreferenceKey.self] = newValue }
    }
}