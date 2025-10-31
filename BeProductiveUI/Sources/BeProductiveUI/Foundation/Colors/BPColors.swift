import SwiftUI

/// BeProductive Color System
///
/// A comprehensive color palette designed for productivity applications with full
/// accessibility compliance, dark mode support, and role-based color variations.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPColors {

    // MARK: - Primary Brand Colors

    /// Primary brand color palette (6 shades)
    public struct Primary {
        public static let _50 = Color(hex: 0xEFF6FF)   // Lightest blue
        public static let _100 = Color(hex: 0xDBEAFE)  // Very light blue
        public static let _300 = Color(hex: 0x93C5FD)  // Light blue
        public static let _500 = Color(hex: 0x3B82F6)  // Primary blue
        public static let _700 = Color(hex: 0x1D4ED8)  // Dark blue
        public static let _900 = Color(hex: 0x1E3A8A)  // Darkest blue

        /// The main primary color used throughout the app
        public static let main = _500

        /// Primary color for text on light backgrounds
        public static let text = _700

        /// Primary color for backgrounds and surfaces
        public static let surface = _50
    }

    /// Secondary accent color palette
    public struct Secondary {
        public static let _50 = Color(hex: 0xF0FDF4)   // Lightest green
        public static let _100 = Color(hex: 0xDCFCE7)  // Very light green
        public static let _300 = Color(hex: 0x86EFAC)  // Light green
        public static let _500 = Color(hex: 0x22C55E)  // Primary green
        public static let _700 = Color(hex: 0x15803D)  // Dark green
        public static let _900 = Color(hex: 0x14532D)  // Darkest green

        public static let main = _500
        public static let text = _700
        public static let surface = _50
    }

    // MARK: - Semantic Colors

    /// Success state colors
    public struct Success {
        public static let light = Color(hex: 0xDCFCE7)
        public static let main = Color(hex: 0x16A34A)
        public static let dark = Color(hex: 0x15803D)
        public static let text = Color(hex: 0x14532D)
    }

    /// Warning state colors
    public struct Warning {
        public static let light = Color(hex: 0xFEF3C7)
        public static let main = Color(hex: 0xF59E0B)
        public static let dark = Color(hex: 0xD97706)
        public static let text = Color(hex: 0x92400E)
    }

    /// Error state colors
    public struct Error {
        public static let light = Color(hex: 0xFEE2E2)
        public static let main = Color(hex: 0xEF4444)
        public static let dark = Color(hex: 0xDC2626)
        public static let text = Color(hex: 0x991B1B)
    }

    /// Information state colors
    public struct Info {
        public static let light = Color(hex: 0xDEF7FF)
        public static let main = Color(hex: 0x0EA5E9)
        public static let dark = Color(hex: 0x0284C7)
        public static let text = Color(hex: 0x0C4A6E)
    }

    // MARK: - Neutral Colors

    /// Neutral gray palette (10 shades)
    public struct Neutral {
        public static let white = Color.white
        public static let _50 = Color(hex: 0xF9FAFB)
        public static let _100 = Color(hex: 0xF3F4F6)
        public static let _200 = Color(hex: 0xE5E7EB)
        public static let _300 = Color(hex: 0xD1D5DB)
        public static let _400 = Color(hex: 0x9CA3AF)
        public static let _500 = Color(hex: 0x6B7280)
        public static let _600 = Color(hex: 0x4B5563)
        public static let _700 = Color(hex: 0x374151)
        public static let _800 = Color(hex: 0x1F2937)
        public static let _900 = Color(hex: 0x111827)
        public static let black = Color.black
    }

    // MARK: - Background Colors

    /// Background color system with light/dark mode support
    public struct Background {
        /// Primary background (adapts to light/dark mode)
        public static let primary = Color(
            light: Neutral.white,
            dark: Neutral._900
        )

        /// Secondary background (adapts to light/dark mode)
        public static let secondary = Color(
            light: Neutral._50,
            dark: Neutral._800
        )

        /// Tertiary background (adapts to light/dark mode)
        public static let tertiary = Color(
            light: Neutral._100,
            dark: Neutral._700
        )

        /// Card background (adapts to light/dark mode)
        public static let card = Color(
            light: Neutral.white,
            dark: Neutral._800
        )

        /// Elevated surface background
        public static let elevated = Color(
            light: Neutral.white,
            dark: Neutral._700
        )
    }

    // MARK: - Text Colors

    /// Text color system with accessibility compliance
    public struct Text {
        /// Primary text color (high contrast)
        public static let primary = Color(
            light: Neutral._900,
            dark: Neutral._50
        )

        /// Secondary text color (medium contrast)
        public static let secondary = Color(
            light: Neutral._600,
            dark: Neutral._300
        )

        /// Tertiary text color (low contrast, for less important text)
        public static let tertiary = Color(
            light: Neutral._500,
            dark: Neutral._400
        )

        /// Disabled text color
        public static let disabled = Color(
            light: Neutral._400,
            dark: Neutral._500
        )

        /// Inverse text color (for dark backgrounds)
        public static let inverse = Color(
            light: Neutral.white,
            dark: Neutral._900
        )
    }

    // MARK: - Role-Based Colors

    /// User role-specific colors
    public struct Role {
        /// Guest user color
        public static let guest = Neutral._500

        /// Regular user color
        public static let user = Primary.main

        /// Premium user color
        public static let premium = Color(hex: 0x8B5CF6) // Purple

        /// Team lead color
        public static let teamLead = Color(hex: 0xF59E0B) // Orange

        /// Admin color
        public static let admin = Color(hex: 0xEF4444) // Red

        /// Super admin color
        public static let superAdmin = Color(hex: 0x8B5CF6) // Purple

        /// Enterprise color
        public static let enterprise = Color(hex: 0x1F2937) // Dark gray
    }

    // MARK: - Productivity Module Colors

    /// Colors specific to productivity features
    public struct Productivity {
        /// Goals module color
        public static let goals = Color(hex: 0x3B82F6) // Blue

        /// Tasks module color
        public static let tasks = Color(hex: 0x22C55E) // Green

        /// Habits module color
        public static let habits = Color(hex: 0x8B5CF6) // Purple

        /// Projects module color
        public static let projects = Color(hex: 0xF59E0B) // Orange

        /// Notes module color
        public static let notes = Color(hex: 0x06B6D4) // Cyan

        /// Reflections module color
        public static let reflections = Color(hex: 0xEC4899) // Pink

        /// Time tracking color
        public static let timeTracking = Color(hex: 0x10B981) // Emerald

        /// AI assistant color
        public static let ai = Color(hex: 0x6366F1) // Indigo
    }

    // MARK: - Border Colors

    /// Border color system
    public struct Border {
        /// Default border color
        public static let `default` = Color(
            light: Neutral._200,
            dark: Neutral._700
        )

        /// Subtle border color
        public static let subtle = Color(
            light: Neutral._100,
            dark: Neutral._800
        )

        /// Strong border color
        public static let strong = Color(
            light: Neutral._300,
            dark: Neutral._600
        )

        /// Focus border color
        public static let focus = Primary.main

        /// Error border color
        public static let error = Error.main
    }

    // MARK: - Shadow Colors

    /// Shadow color system
    public struct Shadow {
        public static let subtle = Color.black.opacity(0.04)
        public static let small = Color.black.opacity(0.08)
        public static let medium = Color.black.opacity(0.12)
        public static let large = Color.black.opacity(0.16)
        public static let xl = Color.black.opacity(0.20)
    }
}

// MARK: - Color Extensions

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension Color {
    /// Create a color from a hex value
    public init(hex: UInt32) {
        let red = Double((hex & 0xFF0000) >> 16) / 255.0
        let green = Double((hex & 0x00FF00) >> 8) / 255.0
        let blue = Double(hex & 0x0000FF) / 255.0
        self.init(red: red, green: green, blue: blue)
    }

    /// Create a color that adapts to light and dark mode
    public init(light: Color, dark: Color) {
        self.init(
            UIColor { traitCollection in
                switch traitCollection.userInterfaceStyle {
                case .dark:
                    return UIColor(dark)
                default:
                    return UIColor(light)
                }
            }
        )
    }

    /// Get a lighter version of the color
    public func lighter(by amount: Double = 0.2) -> Color {
        return self.opacity(1.0 - amount)
    }

    /// Get a darker version of the color
    public func darker(by amount: Double = 0.2) -> Color {
        return Color(
            UIColor(self).withAlphaComponent(1.0).darker(by: amount)
        )
    }
}

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension UIColor {
    /// Get a darker version of the UIColor
    func darker(by amount: CGFloat = 0.2) -> UIColor {
        var hue: CGFloat = 0
        var saturation: CGFloat = 0
        var brightness: CGFloat = 0
        var alpha: CGFloat = 0

        if getHue(&hue, saturation: &saturation, brightness: &brightness, alpha: &alpha) {
            return UIColor(
                hue: hue,
                saturation: saturation,
                brightness: max(brightness - amount, 0.0),
                alpha: alpha
            )
        }
        return self
    }
}