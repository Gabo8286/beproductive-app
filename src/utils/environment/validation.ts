/**
 * Environment validation utility
 * Provides clear error messages for missing or invalid environment variables
 */

export interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

/**
 * Validate all required environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvironmentConfig> = {};

  // Check Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    errors.push("VITE_SUPABASE_URL is required but not defined");
  } else if (typeof supabaseUrl !== "string") {
    errors.push("VITE_SUPABASE_URL must be a string");
  } else if (!supabaseUrl.startsWith("http")) {
    errors.push("VITE_SUPABASE_URL must be a valid HTTP/HTTPS URL");
  } else if (!supabaseUrl.includes("supabase") && !supabaseUrl.includes("localhost")) {
    warnings.push("VITE_SUPABASE_URL does not appear to be a Supabase or localhost URL");
  } else {
    config.VITE_SUPABASE_URL = supabaseUrl;
  }

  // Check Supabase publishable key
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseKey) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is required but not defined");
  } else if (typeof supabaseKey !== "string") {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY must be a string");
  } else if (supabaseKey.length < 20) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY appears to be too short");
  } else if (!supabaseKey.startsWith("eyJ") && supabaseKey !== "demo-key") {
    warnings.push(
      "VITE_SUPABASE_PUBLISHABLE_KEY does not appear to be a valid JWT token",
    );
  } else {
    config.VITE_SUPABASE_PUBLISHABLE_KEY = supabaseKey;
  }

  // Check if we're in development and missing .env file
  if (errors.length > 0 && import.meta.env.DEV) {
    errors.push(
      "Environment variables are missing. Make sure you have a .env file in your project root with the required variables.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Get detailed environment information for debugging
 */
export function getEnvironmentInfo(): {
  mode: string;
  dev: boolean;
  prod: boolean;
  base: string;
  variables: Record<string, any>;
} {
  return {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    base: import.meta.env.BASE_URL,
    variables: {
      // Only include safe variables for debugging
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      supabaseUrlFormat:
        import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + "...",
      supabaseKeyFormat:
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 10) + "...",
    },
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): ValidationResult {
  const result = validateEnvironment();
  const info = getEnvironmentInfo();

  console.group("[Environment] Validation Results");

  if (result.isValid) {
    console.log("✅ All environment variables are valid");
  } else {
    console.error("❌ Environment validation failed");
    result.errors.forEach((error) => console.error(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ Environment warnings:");
    result.warnings.forEach((warning) => console.warn(`  • ${warning}`));
  }

  console.log("Environment info:", info);
  console.groupEnd();

  return result;
}

/**
 * Create a user-friendly error message for environment issues
 */
export function createEnvironmentErrorMessage(
  result: ValidationResult,
): string {
  if (result.isValid) {
    return "";
  }

  const messages = [
    "🚨 Application Configuration Error",
    "",
    "The application cannot start because of missing or invalid environment variables:",
    "",
    ...result.errors.map((error) => `  • ${error}`),
  ];

  if (import.meta.env.DEV) {
    messages.push(
      "",
      "💡 To fix this:",
      "  1. Create a .env file in your project root",
      "  2. Add the required environment variables",
      "  3. Restart the development server",
      "",
      "Example .env file:",
      "  VITE_SUPABASE_URL=https://your-project.supabase.co",
      "  VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key",
    );
  } else {
    messages.push(
      "",
      "💡 To fix this:",
      "  1. Check your deployment environment variables",
      "  2. Ensure all required variables are set",
      "  3. Redeploy the application",
    );
  }

  return messages.join("\n");
}

/**
 * Check if environment is ready for the application to start
 */
export function isEnvironmentReady(): boolean {
  try {
    const result = validateEnvironment();

    // For local development, be more lenient
    const isLocalhost = window.location.hostname === 'localhost';
    const hasBasicConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

    if (isLocalhost && hasBasicConfig) {
      console.log("[Environment] Local development mode - accepting basic configuration");
      return true;
    }

    return result.isValid;
  } catch (error) {
    console.error("[Environment] Validation check failed:", error);
    return false;
  }
}
