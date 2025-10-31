import CoreData
import Foundation

// MARK: - Core Data Entity for ProductivityMetric (Pre-iOS 17 compatibility)
@objc(ProductivityMetricEntity)
public class ProductivityMetricEntity: NSManagedObject {
    
    @NSManaged public var id: UUID
    @NSManaged public var date: Date
    @NSManaged public var metricTypeRaw: String
    @NSManaged public var value: Double
    @NSManaged public var unit: String
    @NSManaged public var category: String?
    @NSManaged public var tagsData: Data?
    @NSManaged public var metadataData: Data?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var userId: UUID
    
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
    
    // Convenience initializer
    convenience init(
        context: NSManagedObjectContext,
        date: Date = Date(),
        metricType: MetricType,
        value: Double,
        unit: String = "",
        category: String? = nil,
        tags: [String] = [],
        metadata: [String: String] = [:],
        userId: UUID
    ) {
        self.init(context: context)
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
    }
}

extension ProductivityMetricEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<ProductivityMetricEntity> {
        return NSFetchRequest<ProductivityMetricEntity>(entityName: "ProductivityMetricEntity")
    }
}

// MARK: - Core Data Manager for ProductivityMetric (Pre-iOS 17 compatibility)
@MainActor
class ProductivityMetricDataManager: ObservableObject {
    
    // MARK: - Singleton
    static let shared = ProductivityMetricDataManager()
    
    // MARK: - Core Data Stack
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "ProductivityMetric")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
        return container
    }()
    
    var context: NSManagedObjectContext {
        persistentContainer.viewContext
    }
    
    // MARK: - Initialization
    private init() {}
    
    // MARK: - CRUD Operations
    func createProductivityMetric(
        date: Date = Date(),
        metricType: MetricType,
        value: Double,
        unit: String = "",
        category: String? = nil,
        tags: [String] = [],
        metadata: [String: String] = [:],
        userId: UUID
    ) -> ProductivityMetricEntity {
        let metric = ProductivityMetricEntity(
            context: context,
            date: date,
            metricType: metricType,
            value: value,
            unit: unit,
            category: category,
            tags: tags,
            metadata: metadata,
            userId: userId
        )
        
        save()
        return metric
    }
    
    func fetchProductivityMetrics(
        predicate: NSPredicate? = nil,
        sortDescriptors: [NSSortDescriptor] = []
    ) -> [ProductivityMetricEntity] {
        let request: NSFetchRequest<ProductivityMetricEntity> = ProductivityMetricEntity.fetchRequest()
        request.predicate = predicate
        request.sortDescriptors = sortDescriptors
        
        do {
            return try context.fetch(request)
        } catch {
            print("Failed to fetch productivity metrics: \(error)")
            return []
        }
    }
    
    // Convenience method for fetching metrics by user ID
    func fetchProductivityMetrics(for userId: UUID) -> [ProductivityMetricCompat] {
        let predicate = NSPredicate(format: "userId == %@", userId as CVarArg)
        let sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        let entities = fetchProductivityMetrics(predicate: predicate, sortDescriptors: sortDescriptors)
        
        // Convert entities to ProductivityMetric compatibility structs
        return entities.map { entity in
            ProductivityMetricCompat(
                id: entity.id,
                date: entity.date,
                metricType: entity.metricType,
                value: entity.value,
                unit: entity.unit,
                category: entity.category,
                tags: entity.tags,
                metadata: entity.metadata,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                userId: entity.userId
            )
        }
    }
    
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Failed to save context: \(error)")
            }
        }
    }
    
    func deleteProductivityMetric(_ metric: ProductivityMetricEntity) {
        context.delete(metric)
        save()
    }
    
    func updateProductivityMetric(_ metric: ProductivityMetricEntity, value: Double) {
        metric.value = value
        metric.updatedAt = Date()
        save()
    }

    // ... rest of your code ...
}

// MARK: - Compatibility ProductivityMetric struct
struct ProductivityMetricCompat {
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
}
