import Foundation
import SwiftData

@available(iOS 17.0, macOS 14.0, *)
@Model
final class Habit {
    var id: UUID
    var title: String
    var habitDescription: String?
    var frequency: HabitFrequency
    var targetCount: Int
    var category: String?
    var icon: String?
    var color: String
    var isActive: Bool
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool

    // Relationships
    var completions: [HabitCompletion]

    // Computed properties
    var streak: Int {
        calculateCurrentStreak()
    }

    var longestStreak: Int {
        calculateLongestStreak()
    }

    var totalCompletions: Int {
        completions.count
    }

    var isCompletedToday: Bool {
        let today = Calendar.current.startOfDay(for: Date())
        return completions.contains { completion in
            Calendar.current.isDate(completion.date, inSameDayAs: today)
        }
    }

    var tableName: String { "habits" }

    init(
        title: String,
        description: String? = nil,
        frequency: HabitFrequency = .daily,
        targetCount: Int = 1,
        category: String? = nil,
        icon: String? = nil,
        color: String = "blue",
        userId: UUID
    ) {
        self.id = UUID()
        self.title = title
        self.habitDescription = description
        self.frequency = frequency
        self.targetCount = targetCount
        self.category = category
        self.icon = icon
        self.color = color
        self.isActive = true
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
        self.completions = []
    }

    func markCompleted(on date: Date = Date(), count: Int = 1) {
        let startOfDay = Calendar.current.startOfDay(for: date)

        // Check if already completed on this date
        if let existingCompletion = completions.first(where: {
            Calendar.current.isDate($0.date, inSameDayAs: startOfDay)
        }) {
            existingCompletion.count = count
            existingCompletion.date = startOfDay
        } else {
            let completion = HabitCompletion(
                habitId: id,
                date: startOfDay,
                count: count,
                userId: userId
            )
            completions.append(completion)
        }

        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    func removeCompletion(on date: Date) {
        let startOfDay = Calendar.current.startOfDay(for: date)
        completions.removeAll { completion in
            Calendar.current.isDate(completion.date, inSameDayAs: startOfDay)
        }

        needsSync = true
        lastModified = Date()
        updatedAt = Date()
    }

    private func calculateCurrentStreak() -> Int {
        guard !completions.isEmpty else { return 0 }

        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let sortedCompletions = completions.sorted { $0.date > $1.date }

        var streak = 0
        var currentDate = today

        // Check if today is completed or if we should start from yesterday
        let todayCompleted = completions.contains {
            calendar.isDate($0.date, inSameDayAs: today)
        }

        if !todayCompleted {
            currentDate = calendar.date(byAdding: .day, value: -1, to: today) ?? today
        }

        // Count consecutive days
        for completion in sortedCompletions {
            if calendar.isDate(completion.date, inSameDayAs: currentDate) {
                streak += 1
                currentDate = calendar.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
            } else if completion.date < currentDate {
                break
            }
        }

        return streak
    }

    private func calculateLongestStreak() -> Int {
        guard !completions.isEmpty else { return 0 }

        let calendar = Calendar.current
        let sortedCompletions = completions.sorted { $0.date < $1.date }

        var longestStreak = 0
        var currentStreak = 0
        var lastDate: Date?

        for completion in sortedCompletions {
            if let last = lastDate {
                let daysBetween = calendar.dateComponents([.day], from: last, to: completion.date).day ?? 0

                if daysBetween == 1 {
                    currentStreak += 1
                } else {
                    longestStreak = max(longestStreak, currentStreak)
                    currentStreak = 1
                }
            } else {
                currentStreak = 1
            }

            lastDate = completion.date
        }

        return max(longestStreak, currentStreak)
    }

    func updateFrom(_ remoteHabit: RemoteHabit) {
        self.title = remoteHabit.title
        self.habitDescription = remoteHabit.habitDescription
        self.frequency = remoteHabit.frequency
        self.targetCount = remoteHabit.targetCount
        self.category = remoteHabit.category
        self.icon = remoteHabit.icon
        self.color = remoteHabit.color
        self.isActive = remoteHabit.isActive
        self.updatedAt = remoteHabit.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteHabit() -> RemoteHabit {
        RemoteHabit(
            id: id,
            title: title,
            habitDescription: habitDescription,
            frequency: frequency,
            targetCount: targetCount,
            category: category,
            icon: icon,
            color: color,
            isActive: isActive,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    static func from(_ remoteHabit: RemoteHabit) -> Habit {
        let habit = Habit(
            title: remoteHabit.title,
            description: remoteHabit.habitDescription,
            frequency: remoteHabit.frequency,
            targetCount: remoteHabit.targetCount,
            category: remoteHabit.category,
            icon: remoteHabit.icon,
            color: remoteHabit.color,
            userId: remoteHabit.userId
        )
        habit.id = remoteHabit.id
        habit.isActive = remoteHabit.isActive
        habit.createdAt = remoteHabit.createdAt
        habit.updatedAt = remoteHabit.updatedAt
        habit.needsSync = false
        habit.isNew = false
        return habit
    }
}

// MARK: - SyncableModel Conformance
@available(iOS 17.0, macOS 14.0, *)
extension Habit: SyncableModel {}

@available(iOS 17.0, macOS 14.0, *)
@Model
final class HabitCompletion {
    var id: UUID
    var habitId: UUID
    var date: Date
    var count: Int
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID
    
    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isDeleted: Bool
    var isNew: Bool
    
    var tableName: String { "habit_completions" }

    init(habitId: UUID, date: Date, count: Int = 1, notes: String? = nil, userId: UUID) {
        self.id = UUID()
        self.habitId = habitId
        self.date = Calendar.current.startOfDay(for: date)
        self.count = count
        self.notes = notes
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        
        // Initialize sync properties
        self.needsSync = true
        self.lastModified = Date()
        self.isDeleted = false
        self.isNew = true
    }
}

// MARK: - SyncableModel Conformance
@available(iOS 17.0, macOS 14.0, *)
extension HabitCompletion: SyncableModel {}

enum HabitFrequency: String, CaseIterable, Codable {
    case daily = "daily"
    case weekly = "weekly"
    case monthly = "monthly"
    case custom = "custom"

    var displayName: String {
        switch self {
        case .daily: return "Daily"
        case .weekly: return "Weekly"
        case .monthly: return "Monthly"
        case .custom: return "Custom"
        }
    }

    var iconName: String {
        switch self {
        case .daily: return "sun.max"
        case .weekly: return "calendar.badge.clock"
        case .monthly: return "calendar"
        case .custom: return "gear"
        }
    }
}

// MARK: - Remote Data Types
struct RemoteHabit: Codable {
    let id: UUID
    let title: String
    let habitDescription: String?
    let frequency: HabitFrequency
    let targetCount: Int
    let category: String?
    let icon: String?
    let color: String
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}

struct RemoteHabitCompletion: Codable {
    let id: UUID
    let habitId: UUID
    let date: Date
    let count: Int
    let notes: String?
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}
