# ProductivityMetric Migration Guide

## What was changed

The `ProductivityMetric` model has been migrated from SwiftData (`@Model`) to Core Data (`NSManagedObject`) to support iOS versions prior to iOS 17.

## Key Changes

### 1. Import Changes
- **Before**: `import SwiftData`  
- **After**: `import CoreData`

### 2. Class Declaration
- **Before**: `@Model final class ProductivityMetric: SyncableModel`
- **After**: `@objc(ProductivityMetric) public class ProductivityMetric: NSManagedObject, SyncableModel`

### 3. Property Declarations
- **Before**: Simple `var` declarations
- **After**: `@NSManaged public var` declarations with JSON encoding for complex types

### 4. Complex Properties
Arrays and dictionaries are now stored as `Data` and encoded/decoded with JSON:
- `tags: [String]` → `tagsData: Data?` with computed property
- `metadata: [String: String]` → `metadataData: Data?` with computed property
- `metricType: MetricType` → `metricTypeRaw: String` with computed property

### 5. Initialization
- **Before**: Custom init method
- **After**: Convenience initializer that takes `NSManagedObjectContext`

## Integration Steps

### 1. Add Core Data Model
Add the `ProductivityMetric.xcdatamodel` file to your Xcode project. This defines the Core Data entity with all necessary attributes.

### 2. Use the Data Manager
Use `ProductivityMetricDataManager` instead of SwiftData operations:

```swift
// Create a metric
let dataManager = ProductivityMetricDataManager.shared
let metric = dataManager.createProductivityMetric(
    date: Date(),
    metricType: .tasksCompleted,
    value: 10,
    userId: currentUserId
)

// Fetch metrics
let metrics = dataManager.fetchProductivityMetrics(for: currentUserId)

// Query specific metrics
let focusMetrics = dataManager.fetchProductivityMetrics(
    for: currentUserId,
    metricType: .focusTime,
    from: startOfWeek,
    to: endOfWeek
)
```

### 3. Update Your DataManager
Your main `DataManager` class (which is iOS 17+) should conditionally handle ProductivityMetric:

```swift
// In your DataManager, you can add:
@available(iOS 16, *)
private let productivityMetricManager = ProductivityMetricDataManager()

func createProductivityMetric(/* parameters */) {
    if #available(iOS 17, *) {
        // Use SwiftData when available
        // (implement SwiftData version later if needed)
    } else {
        // Use Core Data version
        productivityMetricManager.createProductivityMetric(/* parameters */)
    }
}
```

### 4. Analytics Methods
The analytics methods (`weeklyAverage`, `monthlyTrend`) are now available as instance methods on `ProductivityMetricDataManager`.

## Benefits

1. **Backward Compatibility**: Works on iOS versions prior to iOS 17
2. **Consistent API**: Same interface as before, just different underlying implementation  
3. **Migration Path**: Easy to migrate to SwiftData later when you drop support for older iOS versions
4. **Performance**: Core Data is mature and well-optimized

## Testing

Use the provided `ProductivityMetricExampleView` to test the implementation. It demonstrates:
- Creating sample metrics
- Displaying metrics in a list
- Using the data manager methods

## Future Migration

When you're ready to require iOS 17+ only, you can:
1. Migrate data from Core Data to SwiftData
2. Replace the Core Data model with the original SwiftData version
3. Update the DataManager to use SwiftData exclusively

This gives you a smooth migration path while maintaining backward compatibility.