import SwiftUI

/// BeProductive Progress Tracker Component
///
/// A comprehensive progress tracking component designed for goals, habits, and metrics
/// with various visualization styles and interactive elements.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPProgressTracker: View {

    // MARK: - Properties

    private let title: String
    private let subtitle: String?
    private let currentValue: Double
    private let targetValue: Double
    private let style: ProgressStyle
    private let visualization: VisualizationType
    private let showPercentage: Bool
    private let showValues: Bool
    private let animated: Bool
    private let color: ProgressColor
    private let unit: String?
    private let onTap: (() -> Void)?

    @Environment(\.bpTheme) private var theme
    @State private var animatedProgress: Double = 0

    // MARK: - Progress Styles

    public enum ProgressStyle {
        case linear
        case circular
        case ring
        case radial
        case stepped(steps: Int)
        case gauge
    }

    // MARK: - Visualization Types

    public enum VisualizationType {
        case minimal
        case standard
        case detailed
        case dashboard
        case widget
    }

    // MARK: - Progress Colors

    public enum ProgressColor {
        case primary
        case success
        case warning
        case error
        case info
        case gradient(from: Color, to: Color)
        case dynamic // Changes based on progress
        case custom(Color)
    }

    // MARK: - Initializer

    public init(
        title: String,
        subtitle: String? = nil,
        currentValue: Double,
        targetValue: Double,
        style: ProgressStyle = .linear,
        visualization: VisualizationType = .standard,
        showPercentage: Bool = true,
        showValues: Bool = false,
        animated: Bool = true,
        color: ProgressColor = .primary,
        unit: String? = nil,
        onTap: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.currentValue = max(0, currentValue)
        self.targetValue = max(1, targetValue)
        self.style = style
        self.visualization = visualization
        self.showPercentage = showPercentage
        self.showValues = showValues
        self.animated = animated
        self.color = color
        self.unit = unit
        self.onTap = onTap
    }

    // MARK: - Body

    public var body: some View {
        Group {
            if let onTap = onTap {
                Button(action: onTap) {
                    progressContent
                }
                .buttonStyle(PlainButtonStyle())
                .bpInteractive(style: .card)
            } else {
                progressContent
            }
        }
        .onAppear {
            if animated {
                withAnimation(.easeInOut(duration: 1.0)) {
                    animatedProgress = progress
                }
            } else {
                animatedProgress = progress
            }
        }
        .onChange(of: progress) { newValue in
            if animated {
                withAnimation(.easeInOut(duration: 0.5)) {
                    animatedProgress = newValue
                }
            } else {
                animatedProgress = newValue
            }
        }
    }

    // MARK: - Progress Content

    @ViewBuilder
    private var progressContent: some View {
        switch visualization {
        case .minimal:
            minimalVisualization
        case .standard:
            standardVisualization
        case .detailed:
            detailedVisualization
        case .dashboard:
            dashboardVisualization
        case .widget:
            widgetVisualization
        }
    }

    // MARK: - Visualization Layouts

    private var minimalVisualization: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            HStack {
                BPText(title, style: .labelMedium)
                Spacer()
                if showPercentage {
                    BPText(percentageText, style: .labelSmall, color: .secondary)
                }
            }

            progressIndicator
        }
    }

    private var standardVisualization: some View {
        VStack(alignment: .leading, spacing: theme.spacing.sm) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    BPText(title, style: .labelLarge)
                    if let subtitle = subtitle {
                        BPText(subtitle, style: .captionMedium, color: .secondary)
                    }
                }

                Spacer()

                if showPercentage || showValues {
                    VStack(alignment: .trailing, spacing: 2) {
                        if showPercentage {
                            BPText(percentageText, style: .labelMedium, color: progressTextColor)
                        }
                        if showValues {
                            BPText(valuesText, style: .captionSmall, color: .secondary)
                        }
                    }
                }
            }

            // Progress indicator
            progressIndicator
        }
        .bpCard(padding: .medium)
    }

    private var detailedVisualization: some View {
        VStack(alignment: .leading, spacing: theme.spacing.md) {
            // Header with status
            HStack {
                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    BPText(title, style: .goalTitle)
                    if let subtitle = subtitle {
                        BPText(subtitle, style: .bodySmall, color: .secondary)
                    }
                }

                Spacer()

                statusBadge
            }

            // Progress indicator
            progressIndicator

            // Detailed metrics
            HStack {
                metricItem(label: "Current", value: formattedValue(currentValue))
                Spacer()
                metricItem(label: "Target", value: formattedValue(targetValue))
                Spacer()
                metricItem(label: "Remaining", value: formattedValue(max(0, targetValue - currentValue)))
            }
        }
        .bpCard(padding: .large)
    }

    private var dashboardVisualization: some View {
        HStack(spacing: theme.spacing.lg) {
            // Circular progress
            circularProgress
                .frame(width: 80, height: 80)

            // Info
            VStack(alignment: .leading, spacing: theme.spacing.xs) {
                BPText(title, style: .goalTitle)
                if let subtitle = subtitle {
                    BPText(subtitle, style: .bodySmall, color: .secondary)
                }

                HStack {
                    BPText(valuesText, style: .labelMedium, color: .secondary)
                    Spacer()
                    statusBadge
                }
            }

            Spacer()
        }
        .bpCard(padding: .large)
    }

    private var widgetVisualization: some View {
        VStack(spacing: theme.spacing.sm) {
            HStack {
                BPText(title, style: .labelLarge)
                Spacer()
                BPText(percentageText, style: .metric, color: progressTextColor)
            }

            progressIndicator

            if showValues {
                HStack {
                    BPText("Current", style: .captionSmall, color: .tertiary)
                    Spacer()
                    BPText(formattedValue(currentValue), style: .captionMedium, color: .secondary)
                }
            }
        }
        .bpCard(style: .subtle, padding: .medium)
    }

    // MARK: - Progress Indicators

    @ViewBuilder
    private var progressIndicator: some View {
        switch style {
        case .linear:
            linearProgress
        case .circular:
            circularProgress
        case .ring:
            ringProgress
        case .radial:
            radialProgress
        case .stepped(let steps):
            steppedProgress(steps: steps)
        case .gauge:
            gaugeProgress
        }
    }

    private var linearProgress: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                Rectangle()
                    .fill(theme.colors.neutral._200)
                    .frame(height: progressHeight)

                // Progress
                Rectangle()
                    .fill(progressGradient)
                    .frame(width: geometry.size.width * animatedProgress, height: progressHeight)
            }
        }
        .frame(height: progressHeight)
        .clipShape(Capsule())
    }

    private var circularProgress: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(theme.colors.neutral._200, lineWidth: progressLineWidth)

            // Progress arc
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(progressGradient, style: StrokeStyle(lineWidth: progressLineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))

            // Center text
            if visualization == .dashboard || visualization == .widget {
                VStack(spacing: 2) {
                    BPText(percentageText, style: .metric, color: progressTextColor)
                    if let unit = unit {
                        BPText(unit, style: .captionSmall, color: .tertiary)
                    }
                }
            }
        }
    }

    private var ringProgress: some View {
        ZStack {
            // Outer ring
            Circle()
                .stroke(theme.colors.neutral._100, lineWidth: 2)

            // Inner progress
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(progressGradient, style: StrokeStyle(lineWidth: progressLineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .scaleEffect(0.8)

            // Center content
            VStack(spacing: 2) {
                BPText("\(Int(animatedProgress * 100))", style: .heading4, color: progressTextColor)
                BPText("%", style: .captionMedium, color: .secondary)
            }
        }
    }

    private var radialProgress: some View {
        ZStack {
            ForEach(0..<12, id: \.self) { index in
                Rectangle()
                    .fill(index < Int(animatedProgress * 12) ? progressColors.0 : theme.colors.neutral._200)
                    .frame(width: 3, height: 12)
                    .offset(y: -25)
                    .rotationEffect(.degrees(Double(index) * 30))
            }

            // Center text
            BPText(percentageText, style: .labelLarge, color: progressTextColor)
        }
        .frame(width: 60, height: 60)
    }

    private func steppedProgress(steps: Int) -> some View {
        HStack(spacing: 4) {
            ForEach(0..<steps, id: \.self) { step in
                Rectangle()
                    .fill(step < Int(animatedProgress * Double(steps)) ? progressColors.0 : theme.colors.neutral._200)
                    .frame(height: 8)
                    .clipShape(RoundedRectangle(cornerRadius: 2))
            }
        }
    }

    private var gaugeProgress: some View {
        ZStack {
            // Background arc
            Circle()
                .trim(from: 0, to: 0.75)
                .stroke(theme.colors.neutral._200, lineWidth: progressLineWidth)
                .rotationEffect(.degrees(135))

            // Progress arc
            Circle()
                .trim(from: 0, to: 0.75 * animatedProgress)
                .stroke(progressGradient, style: StrokeStyle(lineWidth: progressLineWidth, lineCap: .round))
                .rotationEffect(.degrees(135))

            // Needle indicator
            Rectangle()
                .fill(progressColors.0)
                .frame(width: 2, height: 30)
                .offset(y: -15)
                .rotationEffect(.degrees(135 + (270 * animatedProgress)))

            // Center value
            VStack(spacing: 2) {
                BPText(formattedValue(currentValue), style: .heading5, color: progressTextColor)
                if let unit = unit {
                    BPText(unit, style: .captionSmall, color: .tertiary)
                }
            }
            .offset(y: 10)
        }
    }

    // MARK: - Helper Views

    private func metricItem(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            BPText(label, style: .captionSmall, color: .tertiary)
            BPText(value, style: .labelMedium, color: .secondary)
        }
    }

    private var statusBadge: some View {
        BPText(statusText, style: .captionSmall)
            .bpBadge(style: statusBadgeStyle, size: .small)
    }

    // MARK: - Computed Properties

    private var progress: Double {
        min(1.0, currentValue / targetValue)
    }

    private var progressHeight: CGFloat {
        switch visualization {
        case .minimal:
            return 4
        case .standard, .widget:
            return 6
        case .detailed, .dashboard:
            return 8
        }
    }

    private var progressLineWidth: CGFloat {
        switch visualization {
        case .minimal:
            return 4
        case .standard, .widget:
            return 6
        case .detailed, .dashboard:
            return 8
        }
    }

    private var progressColors: (Color, Color) {
        switch color {
        case .primary:
            return (theme.colors.primary.main, theme.colors.primary.main)
        case .success:
            return (theme.colors.success.main, theme.colors.success.main)
        case .warning:
            return (theme.colors.warning.main, theme.colors.warning.main)
        case .error:
            return (theme.colors.error.main, theme.colors.error.main)
        case .info:
            return (theme.colors.info.main, theme.colors.info.main)
        case .gradient(let from, let to):
            return (from, to)
        case .dynamic:
            if progress < 0.3 {
                return (theme.colors.error.main, theme.colors.warning.main)
            } else if progress < 0.7 {
                return (theme.colors.warning.main, theme.colors.info.main)
            } else {
                return (theme.colors.success.main, theme.colors.success.main)
            }
        case .custom(let color):
            return (color, color)
        }
    }

    private var progressGradient: LinearGradient {
        let colors = progressColors
        return LinearGradient(
            colors: [colors.0, colors.1],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    private var progressTextColor: BPText.TextColor {
        switch color {
        case .success:
            return .success
        case .warning:
            return .warning
        case .error:
            return .error
        case .info:
            return .info
        case .dynamic:
            if progress < 0.3 {
                return .error
            } else if progress < 0.7 {
                return .warning
            } else {
                return .success
            }
        default:
            return .primary
        }
    }

    private var statusText: String {
        if progress >= 1.0 {
            return "Complete"
        } else if progress >= 0.7 {
            return "On Track"
        } else if progress >= 0.3 {
            return "In Progress"
        } else {
            return "Getting Started"
        }
    }

    private var statusBadgeStyle: BPBadgeModifier.BadgeStyle {
        if progress >= 1.0 {
            return .success
        } else if progress >= 0.7 {
            return .info
        } else if progress >= 0.3 {
            return .warning
        } else {
            return .neutral
        }
    }

    private var percentageText: String {
        "\(Int(progress * 100))%"
    }

    private var valuesText: String {
        "\(formattedValue(currentValue)) / \(formattedValue(targetValue))"
    }

    private func formattedValue(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = value.truncatingRemainder(dividingBy: 1) == 0 ? 0 : 1

        let formattedNumber = formatter.string(from: NSNumber(value: value)) ?? "\(Int(value))"

        if let unit = unit {
            return "\(formattedNumber) \(unit)"
        }
        return formattedNumber
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPProgressTracker {

    /// Create a simple linear progress tracker
    public static func linear(
        title: String,
        current: Double,
        target: Double,
        color: ProgressColor = .primary
    ) -> BPProgressTracker {
        return BPProgressTracker(
            title: title,
            currentValue: current,
            targetValue: target,
            style: .linear,
            visualization: .standard,
            color: color
        )
    }

    /// Create a circular progress tracker
    public static func circular(
        title: String,
        current: Double,
        target: Double,
        showCenter: Bool = true
    ) -> BPProgressTracker {
        return BPProgressTracker(
            title: title,
            currentValue: current,
            targetValue: target,
            style: .circular,
            visualization: showCenter ? .dashboard : .standard
        )
    }

    /// Create a habit streak tracker
    public static func streak(
        title: String,
        currentStreak: Int,
        targetStreak: Int
    ) -> BPProgressTracker {
        return BPProgressTracker(
            title: title,
            currentValue: Double(currentStreak),
            targetValue: Double(targetStreak),
            style: .stepped(steps: min(targetStreak, 30)),
            visualization: .standard,
            color: .success,
            unit: "days"
        )
    }

    /// Create a goal progress tracker
    public static func goal(
        title: String,
        subtitle: String? = nil,
        current: Double,
        target: Double,
        unit: String? = nil
    ) -> BPProgressTracker {
        return BPProgressTracker(
            title: title,
            subtitle: subtitle,
            currentValue: current,
            targetValue: target,
            style: .linear,
            visualization: .detailed,
            showValues: true,
            color: .dynamic,
            unit: unit
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPProgressTracker_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Linear progress examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Linear Progress", style: .sectionTitle)

                    BPProgressTracker.linear(
                        title: "Daily Steps",
                        current: 7500,
                        target: 10000
                    )

                    BPProgressTracker.goal(
                        title: "Monthly Sales Target",
                        subtitle: "Q1 2024 Goal",
                        current: 85000,
                        target: 100000,
                        unit: "$"
                    )
                }

                Divider()

                // Circular progress examples
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Circular Progress", style: .sectionTitle)

                    BPProgressTracker.circular(
                        title: "Project Completion",
                        current: 15,
                        target: 20
                    )

                    BPProgressTracker(
                        title: "Water Intake",
                        currentValue: 6,
                        targetValue: 8,
                        style: .ring,
                        visualization: .widget,
                        color: .info,
                        unit: "glasses"
                    )
                }

                Divider()

                // Habit tracking
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Habit Tracking", style: .sectionTitle)

                    BPProgressTracker.streak(
                        title: "Meditation Streak",
                        currentStreak: 12,
                        targetStreak: 30
                    )

                    BPProgressTracker(
                        title: "Reading Progress",
                        currentValue: 180,
                        targetValue: 365,
                        style: .gauge,
                        visualization: .dashboard,
                        color: .gradient(from: .purple, to: .blue),
                        unit: "pages"
                    )
                }

                Divider()

                // Different visualizations
                VStack(alignment: .leading, spacing: 12) {
                    BPText("Visualization Styles", style: .sectionTitle)

                    BPProgressTracker(
                        title: "Minimal Style",
                        currentValue: 7,
                        targetValue: 10,
                        visualization: .minimal
                    )

                    BPProgressTracker(
                        title: "Widget Style",
                        currentValue: 42,
                        targetValue: 50,
                        visualization: .widget,
                        showValues: true,
                        color: .success
                    )
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}