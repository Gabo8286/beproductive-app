import Foundation

class ConfigurationManager {
    static let shared = ConfigurationManager()

    // MARK: - Environment Configuration
    enum Environment {
        case development
        case staging
        case production

        var name: String {
            switch self {
            case .development: return "Development"
            case .staging: return "Staging"
            case .production: return "Production"
            }
        }
    }

    // MARK: - Properties
    private(set) var environment: Environment
    private(set) var configuration: [String: Any]

    // MARK: - Computed Properties
    var supabaseURL: String {
        guard let url = getValue(for: "SUPABASE_URL"), !url.contains("your-project") else {
            fatalError("SUPABASE_URL not configured. Please set your Supabase URL in Configuration-\(environment.name).plist or as an environment variable.")
        }
        return url
    }

    var supabaseAnonKey: String {
        guard let key = getValue(for: "SUPABASE_ANON_KEY"), !key.isEmpty, !key.contains("your-supabase") else {
            fatalError("SUPABASE_ANON_KEY not configured. Please set your Supabase anonymous key in Configuration-\(environment.name).plist or as an environment variable.")
        }
        return key
    }

    var openAIAPIKey: String? {
        return getValue(for: "OPENAI_API_KEY")
    }

    var anthropicAPIKey: String? {
        return getValue(for: "ANTHROPIC_API_KEY")
    }

    var googleAIAPIKey: String? {
        return getValue(for: "GOOGLE_AI_API_KEY")
    }

    var appVersion: String {
        return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    var buildNumber: String {
        return Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    var bundleIdentifier: String {
        return Bundle.main.bundleIdentifier ?? "com.beproductive.ios"
    }

    var isDebugMode: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    var isTestEnvironment: Bool {
        return ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil
    }

    // MARK: - Feature Flags
    var isLunaAIEnabled: Bool {
        return getValue(for: "FEATURE_LUNA_AI") == "true"
    }

    var isTeamCollaborationEnabled: Bool {
        return getValue(for: "FEATURE_TEAM_COLLABORATION") == "true"
    }

    var isWidgetsEnabled: Bool {
        return getValue(for: "FEATURE_WIDGETS") == "true"
    }

    var isAdvancedAnalyticsEnabled: Bool {
        return getValue(for: "FEATURE_ADVANCED_ANALYTICS") == "true"
    }

    var isOfflineModeEnabled: Bool {
        return getValue(for: "FEATURE_OFFLINE_MODE") == "true"
    }

    // MARK: - API Configuration
    var maxAPIRequestsPerMinute: Int {
        return Int(getValue(for: "MAX_API_REQUESTS_PER_MINUTE") ?? "60") ?? 60
    }

    var requestTimeoutInterval: TimeInterval {
        return TimeInterval(getValue(for: "REQUEST_TIMEOUT_INTERVAL") ?? "30") ?? 30
    }

    var maxRetryAttempts: Int {
        return Int(getValue(for: "MAX_RETRY_ATTEMPTS") ?? "3") ?? 3
    }

    // MARK: - Storage Configuration
    var maxLocalStorageSize: Int64 {
        return Int64(getValue(for: "MAX_LOCAL_STORAGE_SIZE") ?? "1073741824") ?? 1_073_741_824 // 1GB
    }

    var syncInterval: TimeInterval {
        return TimeInterval(getValue(for: "SYNC_INTERVAL") ?? "300") ?? 300 // 5 minutes
    }

    // MARK: - Analytics Configuration
    var analyticsEnabled: Bool {
        return getValue(for: "ANALYTICS_ENABLED") != "false"
    }

    var crashReportingEnabled: Bool {
        return getValue(for: "CRASH_REPORTING_ENABLED") != "false"
    }

    // MARK: - Initialization
    private init() {
        // Determine environment
        #if DEBUG
        if ProcessInfo.processInfo.environment["STAGING"] == "true" {
            self.environment = .staging
        } else {
            self.environment = .development
        }
        #else
        self.environment = .production
        #endif

        // Load configuration
        self.configuration = loadConfiguration()
    }

    // MARK: - Private Methods
    private func loadConfiguration() -> [String: Any] {
        var config: [String: Any] = [:]

        // Load from main bundle
        if let path = Bundle.main.path(forResource: "Configuration", ofType: "plist"),
           let plist = NSDictionary(contentsOfFile: path) as? [String: Any] {
            config.merge(plist) { _, new in new }
        }

        // Load environment-specific configuration
        let envConfigName = "Configuration-\(environment.name)"
        if let path = Bundle.main.path(forResource: envConfigName, ofType: "plist"),
           let plist = NSDictionary(contentsOfFile: path) as? [String: Any] {
            config.merge(plist) { _, new in new }
        }

        // Override with environment variables
        for (key, value) in ProcessInfo.processInfo.environment {
            config[key] = value
        }

        return config
    }

    private func getValue(for key: String) -> String? {
        // First check environment variables
        if let envValue = ProcessInfo.processInfo.environment[key] {
            return envValue
        }

        // Then check configuration
        return configuration[key] as? String
    }

    // MARK: - Public Methods
    func updateConfiguration(_ updates: [String: Any]) {
        configuration.merge(updates) { _, new in new }
    }

    func printConfiguration() {
        print("=== BeProductive Configuration ===")
        print("Environment: \(environment.name)")
        print("App Version: \(appVersion) (\(buildNumber))")
        print("Bundle ID: \(bundleIdentifier)")
        print("Debug Mode: \(isDebugMode)")
        print("Test Environment: \(isTestEnvironment)")
        print("Supabase URL: \(supabaseURL)")
        print("Feature Flags:")
        print("  - Luna AI: \(isLunaAIEnabled)")
        print("  - Team Collaboration: \(isTeamCollaborationEnabled)")
        print("  - Widgets: \(isWidgetsEnabled)")
        print("  - Advanced Analytics: \(isAdvancedAnalyticsEnabled)")
        print("  - Offline Mode: \(isOfflineModeEnabled)")
        print("API Configuration:")
        print("  - Max Requests/min: \(maxAPIRequestsPerMinute)")
        print("  - Timeout: \(requestTimeoutInterval)s")
        print("  - Max Retries: \(maxRetryAttempts)")
        print("=================================")
    }
}

// MARK: - Configuration Validation
extension ConfigurationManager {
    func validateConfiguration() -> [String] {
        var errors: [String] = []

        // Validate required configuration
        if supabaseURL.isEmpty || supabaseURL.contains("your-project") {
            errors.append("Invalid Supabase URL configuration")
        }

        if supabaseAnonKey.isEmpty {
            errors.append("Missing Supabase anonymous key")
        }

        // Validate API keys if features are enabled
        if isLunaAIEnabled {
            let hasAPIKey = openAIAPIKey != nil || anthropicAPIKey != nil || googleAIAPIKey != nil
            if !hasAPIKey {
                errors.append("Luna AI enabled but no AI API keys configured")
            }
        }

        // Validate numeric configurations
        if maxAPIRequestsPerMinute <= 0 {
            errors.append("Invalid max API requests per minute")
        }

        if requestTimeoutInterval <= 0 {
            errors.append("Invalid request timeout interval")
        }

        if maxRetryAttempts < 0 {
            errors.append("Invalid max retry attempts")
        }

        if maxLocalStorageSize <= 0 {
            errors.append("Invalid max local storage size")
        }

        if syncInterval <= 0 {
            errors.append("Invalid sync interval")
        }

        return errors
    }
}

// MARK: - Environment Detection
extension ConfigurationManager {
    var isProductionEnvironment: Bool {
        return environment == .production
    }

    var isDevelopmentEnvironment: Bool {
        return environment == .development
    }

    var isStagingEnvironment: Bool {
        return environment == .staging
    }
}