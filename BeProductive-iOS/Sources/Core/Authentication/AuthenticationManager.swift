import SwiftUI
import Combine
import Supabase
import AuthenticationServices

@MainActor
class AuthenticationManager: NSObject, ObservableObject {

    static var shared: AuthenticationManager?

    // MARK: - Published Properties
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var currentUser: User?
    @Published var authenticationError: AuthenticationError?
    @Published var isGuestMode = false

    // MARK: - Private Properties
    private let supabaseClient: SupabaseClient
    private var cancellables = Set<AnyCancellable>()
    private let keychain = KeychainManager()

    // MARK: - Initialization
    override init() {
        // Initialize Supabase client
        self.supabaseClient = SupabaseClient(
            supabaseURL: URL(string: ConfigurationManager.shared.supabaseURL)!,
            supabaseKey: ConfigurationManager.shared.supabaseAnonKey
        )
        super.init()
        setupAuthStateListener()
        AuthenticationManager.shared = self
    }

    // MARK: - Public Methods
    func initialize() async {
        do {
            // Check for existing session
            let session = try await supabaseClient.auth.session
            await handleAuthSuccess(session.user)
        } catch {
            // No existing session, check for guest mode preference
            if UserDefaults.standard.bool(forKey: "preferGuestMode") {
                await enterGuestMode()
            } else {
                isLoading = false
            }
        }
    }

    func signInWithEmail(_ email: String, password: String) async {
        isLoading = true
        authenticationError = nil

        do {
            let response = try await supabaseClient.auth.signIn(
                email: email,
                password: password
            )
            await handleAuthSuccess(response.user)
        } catch {
            await handleAuthError(.signInFailed(error))
        }
    }

    func signUpWithEmail(_ email: String, password: String, fullName: String) async {
        isLoading = true
        authenticationError = nil

        do {
            let response = try await supabaseClient.auth.signUp(
                email: email,
                password: password,
                data: ["full_name": try AnyJSON(fullName)]
            )

            await handleAuthSuccess(response.user)
        } catch {
            await handleAuthError(.signUpFailed(error))
        }
    }

    func signInWithApple() async {
        isLoading = true
        authenticationError = nil

        let appleIDProvider = ASAuthorizationAppleIDProvider()
        let request = appleIDProvider.createRequest()
        request.requestedScopes = [.fullName, .email]

        let authorizationController = ASAuthorizationController(authorizationRequests: [request])
        authorizationController.delegate = self
        authorizationController.performRequests()
    }

    func signInWithGoogle() async {
        isLoading = true
        authenticationError = nil

        do {
            try await supabaseClient.auth.signInWithOAuth(provider: .google)
        } catch {
            await handleAuthError(.googleSignInFailed(error))
        }
    }

    func enterGuestMode() async {
        isLoading = true
        isGuestMode = true

        // Create a mock user for guest mode
        currentUser = User(
            id: UUID(),
            email: "guest@beproductive.app",
            fullName: "Guest User",
            isGuest: true
        )

        // Set up guest data
        await setupGuestData()

        isAuthenticated = true
        isLoading = false

        UserDefaults.standard.set(true, forKey: "preferGuestMode")
    }

    func exitGuestMode() async {
        isGuestMode = false
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "preferGuestMode")

        // Clear guest data
        await clearGuestData()
    }

    func signOut() async {
        isLoading = true

        do {
            try await supabaseClient.auth.signOut()
            await handleSignOut()
        } catch {
            await handleAuthError(.signOutFailed(error))
        }
    }

    func resetPassword(email: String) async {
        authenticationError = nil

        do {
            try await supabaseClient.auth.resetPasswordForEmail(email)
            // Success is handled via email, no direct callback
        } catch {
            await handleAuthError(.passwordResetFailed(error))
        }
    }

    func updateProfile(fullName: String?, avatarURL: String?) async {
        guard let user = currentUser else { return }

        do {
            var updates: [String: AnyJSON] = [:]
            if let fullName = fullName {
                updates["full_name"] = try AnyJSON(fullName)
            }
            if let avatarURL = avatarURL {
                updates["avatar_url"] = try AnyJSON(avatarURL)
            }

            try await supabaseClient.auth.update(user: UserAttributes(data: updates))

            // Update local user
            currentUser?.fullName = fullName ?? user.fullName
            currentUser?.avatarURL = avatarURL ?? user.avatarURL
        } catch {
            await handleAuthError(.profileUpdateFailed(error))
        }
    }

    // MARK: - Private Methods
    private func setupAuthStateListener() {
        Task {
            for await (event, session) in supabaseClient.auth.authStateChanges {
                switch event {
                case .signedIn:
                    if let user = session?.user {
                        await self.handleAuthSuccess(user)
                    }
                case .signedOut:
                    await self.handleSignOut()
                case .tokenRefreshed:
                    if let user = session?.user {
                        await self.handleAuthSuccess(user)
                    }
                default:
                    break
                }
            }
        }
    }

    private func handleAuthSuccess(_ supabaseUser: Supabase.User) async {
        currentUser = User(
            id: UUID(uuidString: supabaseUser.id.uuidString) ?? UUID(),
            email: supabaseUser.email ?? "",
            fullName: supabaseUser.userMetadata["full_name"]?.stringValue ?? "",
            avatarURL: supabaseUser.userMetadata["avatar_url"]?.stringValue,
            isGuest: false
        )

        isAuthenticated = true
        isLoading = false
        authenticationError = nil

        // Store auth token in keychain
        if let accessToken = try? await supabaseClient.auth.session.accessToken {
            keychain.store(accessToken, for: "access_token")
        }
    }

    private func handleSignOut() async {
        currentUser = nil
        isAuthenticated = false
        isGuestMode = false
        isLoading = false

        // Clear stored tokens
        keychain.delete("access_token")

        // Clear user defaults
        UserDefaults.standard.removeObject(forKey: "preferGuestMode")
    }

    private func handleAuthError(_ error: AuthenticationError) async {
        authenticationError = error
        isLoading = false
        print("Authentication error: \(error.localizedDescription)")
    }

    private func setupGuestData() async {
        // This will be implemented to create sample data for guest users
        // Including sample tasks, goals, projects, etc.
    }

    private func clearGuestData() async {
        // This will be implemented to clear guest data when exiting guest mode
    }
}

// MARK: - ASAuthorizationControllerDelegate
extension AuthenticationManager: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        Task { @MainActor in
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                await self.handleAppleSignIn(credential: appleIDCredential)
            }
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        Task { @MainActor in
            await self.handleAuthError(.appleSignInFailed(error))
        }
    }

    private func handleAppleSignIn(credential: ASAuthorizationAppleIDCredential) async {
        do {
            let idToken = credential.identityToken
            let authorizationCode = credential.authorizationCode

            guard let idTokenString = idToken.flatMap({ String(data: $0, encoding: .utf8) }),
                  let authCodeString = authorizationCode.flatMap({ String(data: $0, encoding: .utf8) }) else {
                await handleAuthError(.appleSignInFailed(NSError(domain: "Auth", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to process Apple ID credential"])))
                return
            }

            try await supabaseClient.auth.signInWithIdToken(
                credentials: .init(
                    provider: .apple,
                    idToken: idTokenString,
                    accessToken: authCodeString
                )
            )
        } catch {
            await handleAuthError(.appleSignInFailed(error))
        }
    }
}

// MARK: - Supporting Types
struct User: Identifiable {
    let id: UUID
    var email: String
    var fullName: String
    var avatarURL: String?
    let isGuest: Bool

    var initials: String {
        let names = fullName.split(separator: " ")
        if names.count >= 2 {
            return String(names[0].prefix(1) + names[1].prefix(1)).uppercased()
        } else if let firstName = names.first {
            return String(firstName.prefix(2)).uppercased()
        }
        return "?"
    }
}

enum AuthenticationError: LocalizedError {
    case signInFailed(Error)
    case signUpFailed(Error)
    case signOutFailed(Error)
    case sessionRecoveryFailed(Error)
    case appleSignInFailed(Error)
    case googleSignInFailed(Error)
    case passwordResetFailed(Error)
    case profileUpdateFailed(Error)

    var errorDescription: String? {
        switch self {
        case .signInFailed(let error):
            return "Sign in failed: \(error.localizedDescription)"
        case .signUpFailed(let error):
            return "Sign up failed: \(error.localizedDescription)"
        case .signOutFailed(let error):
            return "Sign out failed: \(error.localizedDescription)"
        case .sessionRecoveryFailed(let error):
            return "Session recovery failed: \(error.localizedDescription)"
        case .appleSignInFailed(let error):
            return "Apple Sign In failed: \(error.localizedDescription)"
        case .googleSignInFailed(let error):
            return "Google Sign In failed: \(error.localizedDescription)"
        case .passwordResetFailed(let error):
            return "Password reset failed: \(error.localizedDescription)"
        case .profileUpdateFailed(let error):
            return "Profile update failed: \(error.localizedDescription)"
        }
    }
}