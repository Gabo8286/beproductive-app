import SwiftUI
import CoreData

struct ProductivityMetricExampleView: View {
    @StateObject private var dataManager = ProductivityMetricDataManager.shared
    @State private var metrics: [ProductivityMetricCompat] = []
    
    // Example user ID - in your app, get this from AuthenticationManager
    private let userId = UUID()
    
    var body: some View {
        NavigationView {
            List {
                ForEach(metrics, id: \.id) { metric in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: metric.metricType.iconName)
                                .foregroundColor(.blue)
                            Text(metric.metricType.displayName)
                                .font(.headline)
                            Spacer()
                            Text(metric.formattedValue)
                                .font(.title3)
                                .fontWeight(.semibold)
                        }
                        
                        Text(metric.date, style: .date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        if let category = metric.category {
                            Text(category)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(4)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
            .navigationTitle("Productivity Metrics")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add Sample") {
                        addSampleMetric()
                    }
                }
            }
            .onAppear {
                loadMetrics()
            }
        }
    }
    
    private func loadMetrics() {
        // Explicitly type the local variable to resolve ambiguity
        let fetchedMetrics: [ProductivityMetricCompat] = dataManager.fetchProductivityMetrics(for: userId)
        metrics = fetchedMetrics
    }
    
    private func addSampleMetric() {
        let sampleMetrics: [(MetricType, Double)] = [
            (.tasksCompleted, 8),
            (.focusTime, 120), // 2 hours in minutes
            (.productivityScore, 8.5),
            (.mood, 7.0),
            (.energyLevel, 6.5)
        ]
        
        let randomMetric = sampleMetrics.randomElement()!
        
        let _ = dataManager.createProductivityMetric(
            date: Date(),
            metricType: randomMetric.0,
            value: randomMetric.1,
            unit: randomMetric.0.defaultUnit,
            category: randomMetric.0.category.displayName,
            tags: ["work", "daily"],
            metadata: ["source": "manual_entry"],
            userId: userId
        )
        
        loadMetrics()
    }
}

#Preview {
    ProductivityMetricExampleView()
}