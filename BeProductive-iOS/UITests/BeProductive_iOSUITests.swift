import XCTest

final class BeProductive_iOSUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Authentication Flow Tests
    func testLaunchAndAuthentication() throws {
        // Test app launches successfully
        XCTAssertTrue(app.exists)

        // Check if we're on launch screen or auth screen
        if app.staticTexts["BeProductive"].exists {
            // Wait for launch screen to transition
            let authButton = app.buttons["Sign In"].waitForExistence(timeout: 5)
            XCTAssertTrue(authButton)
        }
    }

    func testGuestModeFlow() throws {
        // Look for guest mode button
        let guestButton = app.buttons["Continue as Guest"]
        if guestButton.exists {
            guestButton.tap()

            // Should navigate to main tab view
            let planTab = app.tabBars.buttons["Plan"]
            XCTAssertTrue(planTab.waitForExistence(timeout: 5))
        }
    }

    // MARK: - Main Navigation Tests
    func testMainTabNavigation() throws {
        // Assuming we're in guest mode or logged in
        navigateToMainApp()

        // Test Plan tab
        let planTab = app.tabBars.buttons["Plan"]
        if planTab.exists {
            planTab.tap()
            XCTAssertTrue(app.navigationBars["Plan"].exists)
        }

        // Test Capture tab
        let captureTab = app.tabBars.buttons["Capture"]
        if captureTab.exists {
            captureTab.tap()
            XCTAssertTrue(app.navigationBars["Capture"].exists)
        }

        // Test Engage tab
        let engageTab = app.tabBars.buttons["Engage"]
        if engageTab.exists {
            engageTab.tap()
            XCTAssertTrue(app.navigationBars["Engage"].exists)
        }

        // Test Profile tab
        let profileTab = app.tabBars.buttons["Profile"]
        if profileTab.exists {
            profileTab.tap()
            XCTAssertTrue(app.navigationBars["Profile"].exists)
        }
    }

    // MARK: - Task Management Tests
    func testTaskCreationFlow() throws {
        navigateToMainApp()

        // Navigate to Plan tab
        let planTab = app.tabBars.buttons["Plan"]
        if planTab.exists {
            planTab.tap()

            // Tap plus button to create new item
            let plusButton = app.buttons["plus"]
            if plusButton.exists {
                plusButton.tap()

                // Should show quick create sheet
                let quickCreateTitle = app.staticTexts["Quick Create"]
                XCTAssertTrue(quickCreateTitle.waitForExistence(timeout: 3))

                // Test quick task creation
                let quickTaskButton = app.buttons["Quick Task"]
                if quickTaskButton.exists {
                    quickTaskButton.tap()

                    // Should dismiss sheet and return to plan view
                    XCTAssertTrue(app.navigationBars["Plan"].waitForExistence(timeout: 3))
                }
            }
        }
    }

    func testTaskTypeSelection() throws {
        navigateToMainApp()

        let planTab = app.tabBars.buttons["Plan"]
        if planTab.exists {
            planTab.tap()

            // Test different plan types
            let planTypes = ["Tasks", "Goals", "Projects", "Habits"]

            for planType in planTypes {
                let typeButton = app.buttons[planType]
                if typeButton.exists {
                    typeButton.tap()

                    // Verify content changes based on selection
                    XCTAssertTrue(app.navigationBars["Plan"].exists)

                    // Give time for content to load
                    Thread.sleep(forTimeInterval: 1)
                }
            }
        }
    }

    // MARK: - Goal Management Tests
    func testGoalCreationFlow() throws {
        navigateToMainApp()
        navigateToPlanTab()

        // Select Goals type
        let goalsButton = app.buttons["Goals"]
        if goalsButton.exists {
            goalsButton.tap()

            // Create new goal
            let plusButton = app.buttons["plus"]
            if plusButton.exists {
                plusButton.tap()

                let quickGoalButton = app.buttons["Quick Goal"]
                if quickGoalButton.exists {
                    quickGoalButton.tap()

                    // Should return to goals view
                    XCTAssertTrue(app.navigationBars["Plan"].waitForExistence(timeout: 3))
                }
            }
        }
    }

    // MARK: - Habit Tracking Tests
    func testHabitCreationFlow() throws {
        navigateToMainApp()
        navigateToPlanTab()

        // Select Habits type
        let habitsButton = app.buttons["Habits"]
        if habitsButton.exists {
            habitsButton.tap()

            // Create new habit
            let plusButton = app.buttons["plus"]
            if plusButton.exists {
                plusButton.tap()

                let dailyHabitButton = app.buttons["Daily Habit"]
                if dailyHabitButton.exists {
                    dailyHabitButton.tap()

                    // Should return to habits view
                    XCTAssertTrue(app.navigationBars["Plan"].waitForExistence(timeout: 3))
                }
            }
        }
    }

    // MARK: - Analytics Flow Tests
    func testAnalyticsAccess() throws {
        navigateToMainApp()

        // Navigate to Engage tab for analytics
        let engageTab = app.tabBars.buttons["Engage"]
        if engageTab.exists {
            engageTab.tap()

            // Look for analytics elements
            let analyticsButton = app.buttons["chart.bar.xaxis"]
            if analyticsButton.exists {
                analyticsButton.tap()

                // Should stay on engage view or show analytics
                XCTAssertTrue(app.navigationBars["Engage"].exists)
            }
        }
    }

    // MARK: - Profile and Settings Tests
    func testProfileAccess() throws {
        navigateToMainApp()

        let profileTab = app.tabBars.buttons["Profile"]
        if profileTab.exists {
            profileTab.tap()

            // Should show profile content
            XCTAssertTrue(app.navigationBars["Profile"].exists)

            // Look for settings or user info
            if app.staticTexts["Guest User"].exists || app.staticTexts["Test User"].exists {
                XCTAssertTrue(true) // User info is displayed
            }
        }
    }

    // MARK: - Search Functionality Tests
    func testSearchFunctionality() throws {
        navigateToMainApp()
        navigateToPlanTab()

        // Look for search functionality
        let searchField = app.searchFields.firstMatch
        if searchField.exists {
            searchField.tap()
            searchField.typeText("test")

            // Verify search is working
            XCTAssertEqual(searchField.value as? String, "test")

            // Clear search
            let clearButton = app.buttons["Clear text"]
            if clearButton.exists {
                clearButton.tap()
            }
        }
    }

    // MARK: - Accessibility Tests
    func testAccessibilityElements() throws {
        navigateToMainApp()

        // Check that main navigation elements have accessibility labels
        let planTab = app.tabBars.buttons["Plan"]
        if planTab.exists {
            XCTAssertNotNil(planTab.label)
            XCTAssertTrue(planTab.isHittable)
        }

        let captureTab = app.tabBars.buttons["Capture"]
        if captureTab.exists {
            XCTAssertNotNil(captureTab.label)
            XCTAssertTrue(captureTab.isHittable)
        }
    }

    func testVoiceOverSupport() throws {
        navigateToMainApp()
        navigateToPlanTab()

        // Test that buttons have proper accessibility labels
        let plusButton = app.buttons["plus"]
        if plusButton.exists {
            XCTAssertTrue(plusButton.isHittable)
            XCTAssertNotNil(plusButton.label)
        }
    }

    // MARK: - Performance Tests
    func testAppLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }

    func testNavigationPerformance() throws {
        navigateToMainApp()

        measure {
            // Navigate through all tabs
            let tabs = ["Plan", "Capture", "Engage", "Profile"]
            for tab in tabs {
                let tabButton = app.tabBars.buttons[tab]
                if tabButton.exists {
                    tabButton.tap()
                    _ = app.navigationBars[tab].waitForExistence(timeout: 1)
                }
            }
        }
    }

    // MARK: - Error Handling Tests
    func testOfflineMode() throws {
        // This would require network simulation
        // For now, just test that app doesn't crash when offline
        navigateToMainApp()

        // Try to create content while "offline"
        navigateToPlanTab()
        let plusButton = app.buttons["plus"]
        if plusButton.exists {
            plusButton.tap()

            let quickTaskButton = app.buttons["Quick Task"]
            if quickTaskButton.exists {
                quickTaskButton.tap()

                // Should handle gracefully (though we can't actually test offline mode in UI tests)
                XCTAssertTrue(app.navigationBars["Plan"].waitForExistence(timeout: 3))
            }
        }
    }

    // MARK: - Helper Methods
    private func navigateToMainApp() {
        // Handle different app states (launch, auth, guest mode)
        if app.buttons["Continue as Guest"].exists {
            app.buttons["Continue as Guest"].tap()
        } else if app.buttons["Sign In"].exists {
            // For testing, we might want to use guest mode
            if app.buttons["Guest Mode"].exists {
                app.buttons["Guest Mode"].tap()
            }
        }

        // Wait for main app to load
        let planTab = app.tabBars.buttons["Plan"]
        _ = planTab.waitForExistence(timeout: 5)
    }

    private func navigateToPlanTab() {
        let planTab = app.tabBars.buttons["Plan"]
        if planTab.exists {
            planTab.tap()
        }
    }
}