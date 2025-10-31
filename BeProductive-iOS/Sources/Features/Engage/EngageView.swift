import SwiftUI
import BeProductiveUI

struct EngageView: View {
    @State private var selectedMetric: MetricType = .productivityScore
    @State private var selectedTimeframe: TimeFrame = .week

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Header Stats
                    ProductivitySummaryCard()

                    // Metric Selector
                    MetricSelectorView(selectedMetric: $selectedMetric)

                    // Time Frame Selector
                    TimeFrameSelectorView(selectedTimeframe: $selectedTimeframe)

                    // Main Chart
                    MetricChartView(metric: selectedMetric, timeframe: selectedTimeframe)

                    // Insights Section
                    InsightsSection()

                    // Achievements Section
                    AchievementsSection()

                    // Luna AI Insights
                    LunaInsightsCard()
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationTitle("Engage")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button {
                        // Present detailed analytics view
                    } label: {
                        Image(systemName: "chart.bar.xaxis")
                    }
                    
                    Button {
                        // Present Luna AI insights view
                    } label: {
                        Image(systemName: "brain.head.profile")
                    }
                }
            }
        }
    }
}

struct ProductivitySummaryCard: View {
    var body: some View {
        VStack(spacing: BPSpacing.md) {
            BPText("Today's Productivity", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            HStack(spacing: BPSpacing.lg) {
                ProductivityMetricView(
                    title: "Focus Score",
                    value: "87%",
                    change: "+12%",
                    isPositive: true,
                    icon: "brain.head.profile"
                )

                ProductivityMetricView(
                    title: "Tasks Done",
                    value: "8/12",
                    change: "+3",
                    isPositive: true,
                    icon: "checkmark.circle.fill"
                )

                ProductivityMetricView(
                    title: "Time Focused",
                    value: "5.2h",
                    change: "+1.3h",
                    isPositive: true,
                    icon: "clock.fill"
                )
            }
        }
        .bpCard()
    }
}

struct ProductivityMetricView: View {
    let title: String
    let value: String
    let change: String
    let isPositive: Bool
    let icon: String

    var body: some View {
        VStack(spacing: BPSpacing.xs) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(BPColors.Primary.main)

            BPText(value, style: .heading4)
                .foregroundColor(BPColors.Text.primary)

            BPText(title, style: .labelSmall)
                .foregroundColor(BPColors.Text.secondary)

            HStack(spacing: BPSpacing.xs) {
                Image(systemName: isPositive ? "arrow.up" : "arrow.down")
                    .font(.caption2)
                    .foregroundColor(isPositive ? BPColors.Success.main : BPColors.Error.main)

                BPText(change, style: .labelSmall)
                    .foregroundColor(isPositive ? BPColors.Success.main : BPColors.Error.main)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct MetricSelectorView: View {
    @Binding var selectedMetric: MetricType

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: BPSpacing.sm) {
                ForEach(MetricType.allCases, id: \.self) { metric in
                    BPButton(
                        metric.displayName,
                        icon: metric.iconName,
                        style: selectedMetric == metric ? .primary : .secondary,
                        size: .small
                    ) {
                        selectedMetric = metric
                    }
                }
            }
            .padding(.horizontal, BPSpacing.md)
        }
    }
}

struct TimeFrameSelectorView: View {
    @Binding var selectedTimeframe: TimeFrame

    var body: some View {
        HStack(spacing: BPSpacing.sm) {
            ForEach(TimeFrame.allCases, id: \.self) { timeframe in
                BPButton(
                    timeframe.title,
                    style: selectedTimeframe == timeframe ? .primary : .ghost,
                    size: .small
                ) {
                    selectedTimeframe = timeframe
                }
            }
        }
        .bpCard()
    }
}

struct MetricChartView: View {
    let metric: MetricType
    let timeframe: TimeFrame

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                BPText("\(metric.displayName) Trend", style: .heading3)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPText(timeframe.title, style: .labelMedium)
                    .foregroundColor(BPColors.Text.secondary)
            }

            // Placeholder for chart
            Rectangle()
                .fill(BPColors.Primary.main.opacity(0.1))
                .frame(height: 200)
                .overlay(
                    VStack {
                        Image(systemName: "chart.line.uptrend.xyaxis")
                            .font(.largeTitle)
                            .foregroundColor(BPColors.Primary.main)

                        BPText("Chart Coming Soon", style: .bodyMedium)
                            .foregroundColor(BPColors.Text.secondary)
                    }
                )
                .cornerRadius(BPSpacing.sm)
        }
        .bpCard()
    }
}

struct InsightsSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Insights", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                InsightCard(
                    icon: "lightbulb.fill",
                    title: "Peak Performance",
                    description: "You're most productive between 9-11 AM",
                    color: BPColors.Warning.main
                )

                InsightCard(
                    icon: "target",
                    title: "Goal Progress",
                    description: "You're 67% towards your monthly goal",
                    color: BPColors.Success.main
                )

                InsightCard(
                    icon: "brain.head.profile",
                    title: "Focus Pattern",
                    description: "Your focus improves after short breaks",
                    color: BPColors.Primary.main
                )
            }
        }
    }
}

struct InsightCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color

    var body: some View {
        HStack(spacing: BPSpacing.md) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
                .frame(width: 40, height: 40)
                .background(color.opacity(0.1))
                .cornerRadius(BPSpacing.sm)

            VStack(alignment: .leading, spacing: BPSpacing.xs) {
                BPText(title, style: .bodyLarge)
                    .foregroundColor(BPColors.Text.primary)

                BPText(description, style: .bodySmall)
                    .foregroundColor(BPColors.Text.secondary)
            }

            Spacer()
        }
        .bpCard()
    }
}

struct AchievementsSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Recent Achievements", style: .heading3)
                .foregroundColor(BPColors.Text.primary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: BPSpacing.sm) {
                    ForEach(0..<5) { index in
                        AchievementBadge(
                            icon: ["star.fill", "flame.fill", "target", "bolt.fill", "crown.fill"][index],
                            title: ["Streak Master", "Focus Fire", "Goal Crusher", "Speed Demon", "Productivity King"][index],
                            description: "Earned today",
                            isUnlocked: index < 3
                        )
                    }
                }
                .padding(.horizontal, BPSpacing.md)
            }
        }
    }
}

struct AchievementBadge: View {
    let icon: String
    let title: String
    let description: String
    let isUnlocked: Bool

    var body: some View {
        VStack(spacing: BPSpacing.sm) {
            ZStack {
                Circle()
                    .fill(isUnlocked ? BPColors.Primary.main : BPColors.Neutral._400.opacity(0.3))
                    .frame(width: 60, height: 60)

                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(isUnlocked ? .white : BPColors.Text.tertiary)
            }

            VStack(spacing: BPSpacing.xs) {
                BPText(title, style: .labelMedium)
                    .foregroundColor(isUnlocked ? BPColors.Text.primary : BPColors.Text.tertiary)
                    .multilineTextAlignment(.center)

                BPText(description, style: .labelSmall)
                    .foregroundColor(BPColors.Text.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(width: 100)
        .opacity(isUnlocked ? 1.0 : 0.6)
    }
}

struct LunaInsightsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            HStack {
                Image(systemName: "brain.head.profile")
                    .font(.title2)
                    .foregroundColor(BPColors.Primary.main)

                BPText("Luna AI Insights", style: .heading3)
                    .foregroundColor(BPColors.Text.primary)

                Spacer()

                BPButton(
                    "Chat",
                    style: .secondary,
                    size: .small
                ) {
                    // Open Luna chat
                }
            }

            BPText(
                "Based on your productivity patterns, I recommend scheduling your most challenging tasks during your 9-11 AM peak performance window. You've been 23% more productive this week compared to last week!",
                style: .bodyMedium
            )
            .foregroundColor(BPColors.Text.secondary)

            HStack {
                BPButton(
                    "View Details",
                    style: .ghost,
                    size: .small
                ) {
                    // View detailed insights
                }

                Spacer()

                BPText("Just now", style: .labelSmall)
                    .foregroundColor(BPColors.Text.tertiary)
            }
        }
        .bpCard()
    }
}

// MARK: - Supporting Types
enum TimeFrame: String, CaseIterable {
    case day = "day"
    case week = "week"
    case month = "month"
    case year = "year"

    var title: String {
        switch self {
        case .day: return "Day"
        case .week: return "Week"
        case .month: return "Month"
        case .year: return "Year"
        }
    }
}

#Preview {
    EngageView()
        .environmentObject(BPThemeManager.shared)
}