import SwiftUI

/// BeProductive Spacing System
///
/// A systematic spacing scale based on an 8pt grid system that ensures consistent
/// visual rhythm and proper information hierarchy throughout the application.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPSpacing {

    // MARK: - Base Grid System

    /// Base spacing unit (8pt) - all spacing is derived from this
    public static let baseUnit: CGFloat = 8

    // MARK: - Spacing Scale

    /// Extra small spacing - 4pt (0.5 × base)
    public static let xs: CGFloat = baseUnit * 0.5

    /// Small spacing - 8pt (1 × base)
    public static let sm: CGFloat = baseUnit * 1

    /// Medium spacing - 12pt (1.5 × base)
    public static let md: CGFloat = baseUnit * 1.5

    /// Large spacing - 16pt (2 × base)
    public static let lg: CGFloat = baseUnit * 2

    /// Extra large spacing - 24pt (3 × base)
    public static let xl: CGFloat = baseUnit * 3

    /// 2X large spacing - 32pt (4 × base)
    public static let xxl: CGFloat = baseUnit * 4

    /// 3X large spacing - 48pt (6 × base)
    public static let xxxl: CGFloat = baseUnit * 6

    /// 4X large spacing - 64pt (8 × base)
    public static let xxxxl: CGFloat = baseUnit * 8

    /// 5X large spacing - 80pt (10 × base)
    public static let xxxxxl: CGFloat = baseUnit * 10

    /// 6X large spacing - 96pt (12 × base)
    public static let xxxxxxl: CGFloat = baseUnit * 12

    // MARK: - Semantic Spacing

    /// Spacing for different semantic purposes
    public struct Semantic {
        /// Spacing between related elements
        public static let related = sm

        /// Spacing between unrelated elements
        public static let unrelated = lg

        /// Spacing between sections
        public static let section = xl

        /// Spacing between major content blocks
        public static let block = xxl

        /// Spacing between page sections
        public static let page = xxxl
    }

    // MARK: - Component Spacing

    /// Spacing values specifically for common UI components
    public struct Component {
        /// Button internal padding
        public static let buttonPadding = md

        /// Card internal padding
        public static let cardPadding = lg

        /// List item padding
        public static let listItemPadding = md

        /// Input field padding
        public static let inputPadding = md

        /// Modal padding
        public static let modalPadding = xl

        /// Tab bar padding
        public static let tabBarPadding = sm

        /// Navigation bar padding
        public static let navBarPadding = lg

        /// Sheet padding
        public static let sheetPadding = xl

        /// Popover padding
        public static let popoverPadding = lg
    }

    // MARK: - Layout Spacing

    /// Spacing for layout and grid systems
    public struct Layout {
        /// Screen edge padding (safe area aware)
        public static let screenEdge = lg

        /// Container padding
        public static let container = xl

        /// Grid gap between items
        public static let gridGap = md

        /// Column gap in multi-column layouts
        public static let columnGap = lg

        /// Row gap in multi-row layouts
        public static let rowGap = md

        /// Divider spacing (space around dividers)
        public static let divider = lg
    }

    // MARK: - Interactive Spacing

    /// Spacing for interactive elements and touch targets
    public struct Interactive {
        /// Minimum touch target size (44pt iOS standard)
        public static let minTouchTarget: CGFloat = 44

        /// Recommended touch target size
        public static let touchTarget: CGFloat = 48

        /// Spacing between interactive elements
        public static let elementSpacing = md

        /// Spacing around clickable areas
        public static let clickableArea = sm

        /// Spacing for hover/focus states
        public static let focusSpacing = xs
    }

    // MARK: - Typography Spacing

    /// Spacing related to typography and text layout
    public struct Typography {
        /// Spacing between paragraphs
        public static let paragraph = md

        /// Spacing between headings and content
        public static let headingToContent = sm

        /// Spacing between content and headings
        public static let contentToHeading = lg

        /// Spacing between list items
        public static let listItem = xs

        /// Spacing in form fields
        public static let formField = md

        /// Spacing around quotes or callouts
        public static let callout = lg
    }

    // MARK: - Productivity-Specific Spacing

    /// Spacing values for productivity features
    public struct Productivity {
        /// Task list item spacing
        public static let taskItem = sm

        /// Goal card spacing
        public static let goalCard = md

        /// Project section spacing
        public static let projectSection = lg

        /// Habit tracker cell spacing
        public static let habitCell = xs

        /// Calendar cell spacing
        public static let calendarCell = xs

        /// Timeline item spacing
        public static let timelineItem = md

        /// Dashboard widget spacing
        public static let dashboardWidget = lg

        /// Analytics chart spacing
        public static let chartSpacing = xl
    }

    // MARK: - Status and Feedback Spacing

    /// Spacing for status indicators and feedback
    public struct Status {
        /// Badge spacing from content
        public static let badge = xs

        /// Icon spacing from text
        public static let iconToText = xs

        /// Progress indicator spacing
        public static let progress = sm

        /// Alert/notification spacing
        public static let alert = md

        /// Error message spacing
        public static let error = sm

        /// Success message spacing
        public static let success = sm
    }

    // MARK: - Responsive Spacing

    /// Spacing that adapts to different screen sizes
    public struct Responsive {
        /// Get spacing that scales with screen size
        public static func adaptive(
            compact: CGFloat,
            regular: CGFloat
        ) -> CGFloat {
            // This would typically use trait collection or screen size
            // For now, return regular spacing
            return regular
        }

        /// Spacing for compact layouts (iPhone)
        public struct Compact {
            public static let section = lg
            public static let container = md
            public static let element = sm
        }

        /// Spacing for regular layouts (iPad)
        public struct Regular {
            public static let section = xxl
            public static let container = xl
            public static let element = lg
        }
    }
}

// MARK: - Spacing Modifiers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Apply consistent padding using BeProductive spacing scale
    public func bpPadding(_ spacing: CGFloat) -> some View {
        self.padding(spacing)
    }

    /// Apply semantic padding for different purposes
    public func bpPadding(_ semantic: BPSpacing.Semantic.Type) -> some View {
        self.padding(BPSpacing.Semantic.related)
    }

    /// Apply component-specific padding
    public func bpCardPadding() -> some View {
        self.padding(BPSpacing.Component.cardPadding)
    }

    /// Apply button-style padding
    public func bpButtonPadding() -> some View {
        self.padding(.horizontal, BPSpacing.Component.buttonPadding)
            .padding(.vertical, BPSpacing.Component.buttonPadding * 0.75)
    }

    /// Apply screen edge padding (safe area aware)
    public func bpScreenEdgePadding() -> some View {
        self.padding(.horizontal, BPSpacing.Layout.screenEdge)
    }

    /// Apply container padding for main content areas
    public func bpContainerPadding() -> some View {
        self.padding(BPSpacing.Layout.container)
    }
}

// MARK: - Spacing Helper Functions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPSpacing {

    /// Calculate spacing based on content density
    public static func density(_ level: DensityLevel) -> CGFloat {
        switch level {
        case .compact:
            return xs
        case .comfortable:
            return sm
        case .spacious:
            return md
        case .relaxed:
            return lg
        }
    }

    /// Content density levels
    public enum DensityLevel: CaseIterable {
        case compact
        case comfortable
        case spacious
        case relaxed

        var description: String {
            switch self {
            case .compact:
                return "Compact"
            case .comfortable:
                return "Comfortable"
            case .spacious:
                return "Spacious"
            case .relaxed:
                return "Relaxed"
            }
        }
    }

    /// Calculate spacing between elements based on relationship
    public static func relationship(_ type: RelationshipType) -> CGFloat {
        switch type {
        case .tightlyRelated:
            return xs
        case .related:
            return sm
        case .loosely:
            return md
        case .separate:
            return lg
        case .distinct:
            return xl
        }
    }

    /// Relationship types between UI elements
    public enum RelationshipType: CaseIterable {
        case tightlyRelated
        case related
        case loosely
        case separate
        case distinct
    }

    /// Get spacing that adapts to accessibility settings
    public static func accessible(_ baseSpacing: CGFloat) -> CGFloat {
        let contentSizeCategory = UIApplication.shared.preferredContentSizeCategory

        switch contentSizeCategory {
        case .accessibilityMedium, .accessibilityLarge:
            return baseSpacing * 1.2
        case .accessibilityExtraLarge, .accessibilityExtraExtraLarge:
            return baseSpacing * 1.4
        case .accessibilityExtraExtraExtraLarge:
            return baseSpacing * 1.6
        default:
            return baseSpacing
        }
    }

    /// Create a spacer with BeProductive spacing
    public static func spacer(_ spacing: CGFloat) -> some View {
        Rectangle()
            .fill(Color.clear)
            .frame(height: spacing)
    }

    /// Create a horizontal spacer with BeProductive spacing
    public static func horizontalSpacer(_ spacing: CGFloat) -> some View {
        Rectangle()
            .fill(Color.clear)
            .frame(width: spacing)
    }
}

// MARK: - Grid System

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPSpacing {

    /// Grid system for consistent layouts
    public struct Grid {
        /// 12-column grid system
        public static let columns = 12

        /// Gutter between grid columns
        public static let gutter = lg

        /// Margin on grid sides
        public static let margin = xl

        /// Calculate column width for responsive grids
        public static func columnWidth(
            totalWidth: CGFloat,
            columns: Int,
            gutter: CGFloat = Grid.gutter
        ) -> CGFloat {
            let totalGutters = CGFloat(columns - 1) * gutter
            let totalMargins = Grid.margin * 2
            let availableWidth = totalWidth - totalGutters - totalMargins
            return availableWidth / CGFloat(columns)
        }
    }
}

// MARK: - Animation Spacing

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPSpacing {

    /// Spacing values for animations and transitions
    public struct Animation {
        /// Spacing for staggered animations
        public static let staggerDelay: TimeInterval = 0.1

        /// Spacing for cascade animations
        public static let cascadeDelay: TimeInterval = 0.05

        /// Spacing for sequence animations
        public static let sequenceDelay: TimeInterval = 0.2

        /// Distance for slide animations
        public static let slideDistance = xl

        /// Distance for spring animations
        public static let springDistance = lg
    }
}

// MARK: - Safe Area Spacing

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension View {

    /// Apply safe area aware padding
    public func bpSafeAreaPadding(_ edges: Edge.Set = .all) -> some View {
        self.padding(edges, BPSpacing.Layout.screenEdge)
            .safeAreaInset(edge: .bottom) {
                Color.clear.frame(height: BPSpacing.xs)
            }
    }

    /// Apply bottom safe area padding for tab bar
    public func bpTabBarSafeArea() -> some View {
        self.safeAreaInset(edge: .bottom) {
            Color.clear.frame(height: BPSpacing.Component.tabBarPadding)
        }
    }
}