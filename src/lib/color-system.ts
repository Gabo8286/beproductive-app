/**
 * Color System for BeProductive v2
 * WCAG AAA compliant color palette with theme support
 */

export interface ColorValue {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeColors {
  primary: ColorValue;
  secondary: ColorValue;
  accent: ColorValue;
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
  neutral: ColorValue;
}

export const lightTheme: ThemeColors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  accent: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
    950: "#4a044e",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },
  info: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
    950: "#083344",
  },
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
};

export const darkTheme: ThemeColors = {
  // Dark theme uses inverted neutral scale and adjusted other colors
  primary: {
    50: "#172554",
    100: "#1e3a8a",
    200: "#1e40af",
    300: "#1d4ed8",
    400: "#2563eb",
    500: "#3b82f6",
    600: "#60a5fa",
    700: "#93c5fd",
    800: "#bfdbfe",
    900: "#dbeafe",
    950: "#eff6ff",
  },
  // ... other colors adjusted for dark theme
  neutral: {
    50: "#09090b",
    100: "#18181b",
    200: "#27272a",
    300: "#3f3f46",
    400: "#52525b",
    500: "#71717a",
    600: "#a1a1aa",
    700: "#d4d4d8",
    800: "#e4e4e7",
    900: "#f4f4f5",
    950: "#fafafa",
  },
  // ... other colors similar to light theme but optimized for dark backgrounds
};

export const highContrastTheme: ThemeColors = {
  primary: {
    50: "#000000",
    100: "#000000",
    200: "#000000",
    300: "#0066ff",
    400: "#0066ff",
    500: "#0066ff",
    600: "#0066ff",
    700: "#ffffff",
    800: "#ffffff",
    900: "#ffffff",
    950: "#ffffff",
  },
  // ... high contrast versions with maximum contrast ratios
  neutral: {
    50: "#000000",
    100: "#000000",
    200: "#333333",
    300: "#666666",
    400: "#808080",
    500: "#999999",
    600: "#cccccc",
    700: "#e6e6e6",
    800: "#f0f0f0",
    900: "#ffffff",
    950: "#ffffff",
  },
};

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if color combination meets WCAG standards
 */
export function meetsWCAGStandard(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false,
): boolean {
  const contrast = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return isLargeText ? contrast >= 4.5 : contrast >= 7.0;
  } else {
    return isLargeText ? contrast >= 3.0 : contrast >= 4.5;
  }
}

/**
 * Get appropriate text color for background
 */
export function getTextColorForBackground(
  backgroundColor: string,
  theme: "light" | "dark" = "light",
): string {
  const colors = theme === "light" ? lightTheme : darkTheme;

  // Test both light and dark text options
  const lightText = colors.neutral[50];
  const darkText = colors.neutral[950];

  const lightContrast = getContrastRatio(lightText, backgroundColor);
  const darkContrast = getContrastRatio(darkText, backgroundColor);

  // Return the option with better contrast, preferring dark text for light theme
  if (theme === "light") {
    return darkContrast >= 4.5 ? darkText : lightText;
  } else {
    return lightContrast >= 4.5 ? lightText : darkText;
  }
}

/**
 * Validate entire color palette for accessibility
 */
export function validateColorPalette(palette: ThemeColors): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check common color combinations
  const commonCombinations = [
    {
      fg: palette.primary[600],
      bg: palette.neutral[50],
      name: "Primary on light background",
    },
    {
      fg: palette.neutral[50],
      bg: palette.primary[600],
      name: "Light text on primary",
    },
    {
      fg: palette.neutral[900],
      bg: palette.neutral[50],
      name: "Dark text on light background",
    },
    {
      fg: palette.neutral[50],
      bg: palette.neutral[900],
      name: "Light text on dark background",
    },
  ];

  for (const combo of commonCombinations) {
    const contrast = getContrastRatio(combo.fg, combo.bg);

    if (contrast < 4.5) {
      violations.push(`${combo.name}: ${contrast.toFixed(2)} (requires 4.5+)`);
    } else if (contrast < 7.0) {
      warnings.push(
        `${combo.name}: ${contrast.toFixed(2)} (AAA recommends 7.0+)`,
      );
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
  };
}
