import Foundation

@MainActor
class ConfigurationManager: ObservableObject {
    static let shared = ConfigurationManager()
    
    // Supabase Configuration
    let supabaseURL: String
    let supabaseAnonKey: String
    
    // Sync Configuration
    let syncInterval: TimeInterval
    let maxRetryAttempts: Int
    
    private init() {
        // In a real app, these would come from a plist, environment, or other secure source
        self.supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? "https://your-project.supabase.co"
        self.supabaseAnonKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? "your-anon-key"
        
        // Default sync settings
        self.syncInterval = 300 // 5 minutes
        self.maxRetryAttempts = 3
    }
    
    // MARK: - Environment-based configuration
    var isDevelopment: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    var isProduction: Bool {
        return !isDevelopment
    }
    
    // MARK: - Feature Flags
    var isSyncEnabled: Bool {
        return !supabaseURL.contains("your-project") && !supabaseAnonKey.contains("your-anon-key")
    }
    
    var isOfflineModeEnabled: Bool {
        return true
    }
    
    var isAnalyticsEnabled: Bool {
        return isProduction
    }
}