import XCTest
@testable import BeProductive_iOS

final class BeProductive_iOSTests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testTaskCreation() throws {
        let userId = UUID()
        let task = TodoTask(
            title: "Test Task",
            taskDescription: "This is a test task",
            priority: .medium,
            userId: userId
        )

        XCTAssertEqual(task.title, "Test Task")
        XCTAssertEqual(task.taskDescription, "This is a test task")
        XCTAssertEqual(task.priority, .medium)
        XCTAssertEqual(task.userId, userId)
        XCTAssertFalse(task.isCompleted)
        XCTAssertEqual(task.status, .todo)
    }

    func testTaskCompletion() throws {
        let userId = UUID()
        let task = TodoTask(title: "Test Task", userId: userId)

        XCTAssertFalse(task.isCompleted)
        XCTAssertNil(task.completedDate)

        task.markCompleted()

        XCTAssertTrue(task.isCompleted)
        XCTAssertNotNil(task.completedDate)
        XCTAssertEqual(task.status, .completed)
    }

    func testConfigurationManager() throws {
        let config = ConfigurationManager.shared

        XCTAssertNotNil(config.appVersion)
        XCTAssertNotNil(config.buildNumber)
        XCTAssertNotNil(config.bundleIdentifier)

        // Test configuration validation
        let errors = config.validateConfiguration()
        // In test environment, we expect some configuration errors
        XCTAssertTrue(errors.contains { $0.contains("Supabase") })
    }

    func testAuthenticationUserModel() throws {
        let user = User(
            id: UUID(),
            email: "test@example.com",
            fullName: "Test User",
            avatarURL: nil,
            isGuest: false
        )

        XCTAssertEqual(user.email, "test@example.com")
        XCTAssertEqual(user.fullName, "Test User")
        XCTAssertFalse(user.isGuest)
        XCTAssertEqual(user.initials, "TU")
    }

    // MARK: - Sync and Data Tests
    func testSyncableModelProtocol() throws {
        let task = TodoTask(title: "Sync Test", userId: testUserId)

        XCTAssertTrue(task.needsSync)
        XCTAssertTrue(task.isNew)
        XCTAssertFalse(task.isSoftDeleted)
        XCTAssertEqual(task.tableName, "tasks")

        task.needsSync = false
        task.isNew = false
        XCTAssertFalse(task.needsSync)
        XCTAssertFalse(task.isNew)
    }

    func testRemoteTaskConversion() throws {
        let task = TodoTask(title: "Remote Test", description: "Test conversion", userId: testUserId)
        task.priority = .urgent

        let remoteTask = task.toRemoteTask()
        XCTAssertEqual(remoteTask.title, "Remote Test")
        XCTAssertEqual(remoteTask.description, "Test conversion")
        XCTAssertEqual(remoteTask.priority, TaskPriority.urgent.rawValue)
        XCTAssertEqual(remoteTask.userId, testUserId)

        let convertedTask = Task.from(remoteTask)
        XCTAssertEqual(convertedTask.title, task.title)
        XCTAssertEqual(convertedTask.description, task.description)
        XCTAssertEqual(convertedTask.priority, task.priority)
        XCTAssertFalse(convertedTask.isNew)
        XCTAssertFalse(convertedTask.needsSync)
    }

    // MARK: - Performance Tests
    func testTaskCreationPerformance() throws {
        measure {
            let tasks = (0..<1000).map { index in
                Task(title: "Task \(index)", userId: testUserId)
            }
            XCTAssertEqual(tasks.count, 1000)
        }
    }

    func testHabitStreakCalculationPerformance() throws {
        let habit = Habit(title: "Performance Test", userId: testUserId)
        let calendar = Calendar.current

        // Add 100 days of completions
        for i in 0..<100 {
            let date = calendar.date(byAdding: .day, value: -i, to: Date())!
            habit.markCompleted(on: date)
        }

        measure {
            _ = habit.streak
            _ = habit.longestStreak
        }
    }

    func testGoalProgressCalculationPerformance() throws {
        let goal = Goal(title: "Performance Test", userId: testUserId)

        // Add 50 milestones
        for i in 0..<50 {
            goal.addMilestone("Milestone \(i)")
        }

        measure {
            _ = goal.progress
            _ = goal.completedMilestones
        }
    }

    // MARK: - Integration Tests
    func testDataManagerInitialization() async throws {
        let expectation = XCTestExpectation(description: "DataManager initialization")

        await dataManager.initialize()

        XCTAssertNotNil(dataManager.container)
        XCTAssertNotNil(dataManager.syncEngine)
        expectation.fulfill()

        await fulfillment(of: [expectation], timeout: 5.0)
    }

    func testSessionManagerLifecycle() async throws {
        let authManager = AuthenticationManager()
        let sessionManager = SessionManager(authManager: authManager, dataManager: dataManager)

        // Mock user
        authManager.currentUser = User(id: testUserId, email: "test@test.com", fullName: "Test User", isGuest: false)

        await sessionManager.startSession()
        XCTAssertTrue(sessionManager.isSessionActive)
        XCTAssertNotNil(sessionManager.currentUser)

        await sessionManager.endSession()
        XCTAssertFalse(sessionManager.isSessionActive)
    }
}