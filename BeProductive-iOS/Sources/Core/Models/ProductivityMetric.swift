import CoreData
import SwiftData
import Foundation

// MARK: - Enums
enum MetricType: String, CaseIterable, Codable {
    case tasksCompleted = "tasks_completed"
    case timeTracked = "time_tracked"
    case focusTime = "focus_time"
    case distractions = "distractions"
    case energyLevel = "energy_level"
    case mood = "mood"
    case productivityScore = "productivity_score"
    case habitsCompleted = "habits_completed"
    case goalsProgress = "goals_progress"
    case projectsCompleted = "projects_completed"
    case efficiency = "efficiency"
    case quality = "quality"
    case collaboration = "collaboration"
    case learning = "learning"
    case creativity = "creativity"
    case wellbeing = "wellbeing"
    case revenue = "revenue"
    case costs = "costs"
    case custom = "custom"

    var displayName: String {
        switch self {
        case .tasksCompleted: return "Tasks Completed"
        case .timeTracked: return "Time Tracked"
        case .focusTime: return "Focus Time"
        case .distractions: return "Distractions"
        case .energyLevel: return "Energy Level"
        case .mood: return "Mood"
        case .productivityScore: return "Productivity Score"
        case .habitsCompleted: return "Habits Completed"
        case .goalsProgress: return "Goals Progress"
        case .projectsCompleted: return "Projects Completed"
        case .efficiency: return "Efficiency"
        case .quality: return "Quality"
        case .collaboration: return "Collaboration"
        case .learning: return "Learning"
        case .creativity: return "Creativity"
        case .wellbeing: return "Well-being"
        case .revenue: return "Revenue"
        case .costs: return "Costs"
        case .custom: return "Custom"
        }
    }

    var iconName: String {
        switch self {
        case .tasksCompleted: return "checkmark.circle"
        case .timeTracked: return "clock"
        case .focusTime: return "brain.head.profile"
        case .distractions: return "exclamationmark.triangle"
        case .energyLevel: return "battery.100"
        case .mood: return "face.smiling"
        case .productivityScore: return "chart.line.uptrend.xyaxis"
        case .habitsCompleted: return "repeat"
        case .goalsProgress: return "target"
        case .projectsCompleted: return "folder.badge.checkmark"
        case .efficiency: return "speedometer"
        case .quality: return "star"
        case .collaboration: return "person.2"
        case .learning: return "book"
        case .creativity: return "lightbulb"
        case .wellbeing: return "heart"
        case .revenue: return "dollarsign.circle"
        case .costs: return "minus.circle"
        case .custom: return "slider.horizontal.3"
        }
    }

    var defaultUnit: String {
        switch self {
        case .tasksCompleted, .distractions, .habitsCompleted, .projectsCompleted:
            return "count"
        case .timeTracked, .focusTime:
            return "minutes"
        case .energyLevel, .mood, .productivityScore, .goalsProgress, .efficiency, .quality, .collaboration, .learning, .creativity, .wellbeing:
            return "score"
        case .revenue, .costs:
            return "currency"
        case .custom:
            return "value"
        }
    }

    var category: MetricCategory {
        switch self {
        case .tasksCompleted, .timeTracked, .focusTime, .efficiency, .productivityScore:
            return .productivity
        case .distractions, .energyLevel, .mood, .wellbeing:
            return .wellness
        case .habitsCompleted, .goalsProgress:
            return .habits
        case .projectsCompleted, .collaboration:
            return .projects
        case .quality, .learning, .creativity:
            return .skills
        case .revenue, .costs:
            return .financial
        case .custom:
            return .custom
        }
    }
}

enum MetricCategory: String, CaseIterable, Codable {
    case productivity = "productivity"
    case wellness = "wellness"
    case habits = "habits"
    case projects = "projects"
    case skills = "skills"
    case financial = "financial"
    case custom = "custom"

    var displayName: String {
        switch self {
        case .productivity: return "Productivity"
        case .wellness: return "Wellness"
        case .habits: return "Habits"
        case .projects: return "Projects"
        case .skills: return "Skills"
        case .financial: return "Financial"
        case .custom: return "Custom"
        }
    }

    var iconName: String {
        switch self {
        case .productivity: return "chart.line.uptrend.xyaxis"
        case .wellness: return "heart"
        case .habits: return "repeat"
        case .projects: return "folder"
        case .skills: return "brain"
        case .financial: return "dollarsign.circle"
        case .custom: return "slider.horizontal.3"
        }
    }

    var color: String {
        switch self {
        case .productivity: return "blue"
        case .wellness: return "green"
        case .habits: return "purple"
        case .projects: return "orange"
        case .skills: return "red"
        case .financial: return "yellow"
        case .custom: return "gray"
        }
    }
}

// MARK: - Remote Data Types
struct RemoteProductivityMetric: Codable {
    let id: UUID
    let date: Date
    let metricType: MetricType
    let value: Double
    let unit: String
    let category: String?
    let tags: [String]
    let metadata: [String: String]
    let createdAt: Date
    let updatedAt: Date
    let userId: UUID
}

// MARK: - SwiftData Model

@available(iOS 17, *)
@Model
final class ProductivityMetric: SyncableModel {
    
    var id: UUID
    var date: Date
    var metricTypeRaw: String
    var value: Double
    var unit: String
    var category: String?
    var tagsData: Data?
    var metadataData: Data?
    var createdAt: Date
    var updatedAt: Date
    var userId: UUID

    // Sync properties
    var needsSync: Bool
    var lastModified: Date
    var isSoftDeleted: Bool
    var isNew: Bool
    
    // Computed properties for complex types
    var metricType: MetricType {
        get { MetricType(rawValue: metricTypeRaw) ?? .custom }
        set { metricTypeRaw = newValue.rawValue }
    }
    
    var tags: [String] {
        get {
            guard let data = tagsData else { return [] }
            return (try? JSONDecoder().decode([String].self, from: data)) ?? []
        }
        set {
            tagsData = try? JSONEncoder().encode(newValue)
        }
    }
    
    var metadata: [String: String] {
        get {
            guard let data = metadataData else { return [:] }
            return (try? JSONDecoder().decode([String: String].self, from: data)) ?? [:]
        }
        set {
            metadataData = try? JSONEncoder().encode(newValue)
        }
    }

    // Computed properties
    var tableName: String { "productivity_metrics" }

    var formattedValue: String {
        switch metricType.defaultUnit {
        case "count":
            return String(format: "%.0f", value)
        case "minutes":
            let hours = Int(value) / 60
            let minutes = Int(value) % 60
            return "\(hours)h \(minutes)m"
        case "score":
            return String(format: "%.1f", value)
        case "currency":
            return String(format: "$%.2f", value)
        default:
            return String(format: "%.1f", value)
        }
    }


    // MARK: - Initialization
    init(
        date: Date = Date(),
        metricType: MetricType,
        value: Double,
        unit: String = "",
        category: String? = nil,
        tags: [String] = [],
        metadata: [String: String] = [:],
        userId: UUID
    ) {
        self.id = UUID()
        self.date = Calendar.current.startOfDay(for: date)
        self.metricTypeRaw = metricType.rawValue
        self.value = value
        self.unit = unit.isEmpty ? metricType.defaultUnit : unit
        self.category = category
        self.tagsData = try? JSONEncoder().encode(tags)
        self.metadataData = try? JSONEncoder().encode(metadata)
        self.createdAt = Date()
        self.updatedAt = Date()
        self.userId = userId
        self.needsSync = true
        self.lastModified = Date()
        self.isSoftDeleted = false
        self.isNew = true
    }

    func updateValue(_ newValue: Double) {
        value = newValue
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func addTag(_ tag: String) {
        var currentTags = tags
        if !currentTags.contains(tag) {
            currentTags.append(tag)
            tags = currentTags
            updatedAt = Date()
            needsSync = true
            lastModified = Date()
        }
    }

    func removeTag(_ tag: String) {
        var currentTags = tags
        currentTags.removeAll { $0 == tag }
        tags = currentTags
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func updateMetadata(key: String, value: String) {
        var currentMetadata = metadata
        currentMetadata[key] = value
        metadata = currentMetadata
        updatedAt = Date()
        needsSync = true
        lastModified = Date()
    }

    func updateFrom(_ remoteMetric: RemoteProductivityMetric) {
        self.date = remoteMetric.date
        self.metricTypeRaw = remoteMetric.metricType.rawValue
        self.value = remoteMetric.value
        self.unit = remoteMetric.unit
        self.category = remoteMetric.category
        self.tagsData = try? JSONEncoder().encode(remoteMetric.tags)
        self.metadataData = try? JSONEncoder().encode(remoteMetric.metadata)
        self.updatedAt = remoteMetric.updatedAt
        self.needsSync = false
        self.lastModified = Date()
    }

    func toRemoteMetric() -> RemoteProductivityMetric {
        RemoteProductivityMetric(
            id: id,
            date: date,
            metricType: metricType,
            value: value,
            unit: unit,
            category: category,
            tags: tags,
            metadata: metadata,
            createdAt: createdAt,
            updatedAt: updatedAt,
            userId: userId
        )
    }

    @available(iOS 17, *)
    static func from(_ remoteMetric: RemoteProductivityMetric) -> ProductivityMetric {
        let metric = ProductivityMetric(
            date: remoteMetric.date,
            metricType: remoteMetric.metricType,
            value: remoteMetric.value,
            unit: remoteMetric.unit,
            category: remoteMetric.category,
            tags: remoteMetric.tags,
            metadata: remoteMetric.metadata,
            userId: remoteMetric.userId
        )
        metric.id = remoteMetric.id
        metric.createdAt = remoteMetric.createdAt
        metric.updatedAt = remoteMetric.updatedAt
        metric.needsSync = false
        metric.isNew = false
        return metric
    }
}


// MARK: - Analytics Extensions
extension ProductivityMetric {
    static func weeklyAverage(for metrics: [ProductivityMetric], metricType: MetricType) -> Double {
        let weekMetrics = metrics.filter {
            $0.metricType == metricType &&
            Calendar.current.isDate($0.date, equalTo: Date(), toGranularity: .weekOfYear)
        }

        guard !weekMetrics.isEmpty else { return 0.0 }
        return weekMetrics.reduce(0) { $0 + $1.value } / Double(weekMetrics.count)
    }

    static func monthlyTrend(for metrics: [ProductivityMetric], metricType: MetricType) -> Double {
        let calendar = Calendar.current
        let now = Date()

        let thisMonth = metrics.filter {
            $0.metricType == metricType &&
            calendar.isDate($0.date, equalTo: now, toGranularity: .month)
        }

        let lastMonth = metrics.filter {
            $0.metricType == metricType &&
            calendar.isDate($0.date, equalTo: calendar.date(byAdding: .month, value: -1, to: now) ?? now, toGranularity: .month)
        }

        guard !thisMonth.isEmpty && !lastMonth.isEmpty else { return 0.0 }

        let thisMonthAvg = thisMonth.reduce(0) { $0 + $1.value } / Double(thisMonth.count)
        let lastMonthAvg = lastMonth.reduce(0) { $0 + $1.value } / Double(lastMonth.count)

        return lastMonthAvg == 0 ? 0 : ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100
    }
}