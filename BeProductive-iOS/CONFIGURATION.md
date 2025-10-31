# Configuration Setup

This document explains how to properly configure the BeProductive iOS app for development and production.

## Required Configuration

Before running the app, you must configure the following required settings:

### 1. Supabase Configuration

#### Option A: Environment Variables (Recommended)
Set the following environment variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anonymous-key"
```

#### Option B: Configuration Files
Edit the appropriate configuration file:
- Development: `Resources/Configuration-Development.plist`
- Production: `Resources/Configuration-Production.plist`

Replace the placeholder values:
```xml
<key>SUPABASE_URL</key>
<string>https://your-actual-project.supabase.co</string>
<key>SUPABASE_ANON_KEY</key>
<string>your-actual-supabase-anon-key</string>
```

### 2. AI API Keys (Optional)

For Luna AI features, configure at least one AI provider:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export GOOGLE_AI_API_KEY="your-google-ai-api-key"
```

## Configuration Files

The app uses a hierarchical configuration system:

1. **Base Configuration**: `Resources/Configuration.plist`
   - Contains default values and feature flags
   - Shared across all environments

2. **Environment-Specific Configuration**: `Resources/Configuration-{Environment}.plist`
   - Development: More permissive settings, debugging enabled
   - Production: Optimized for performance and security

3. **Environment Variables**: Highest priority
   - Override any file-based configuration
   - Ideal for CI/CD and deployment

## Environment Detection

The app automatically detects the environment:

- **Development**: Debug builds (`#DEBUG` flag)
- **Production**: Release builds
- **Staging**: Debug builds with `STAGING=true` environment variable

## Feature Flags

Control app features via configuration:

- `FEATURE_LUNA_AI`: Enable/disable AI features
- `FEATURE_TEAM_COLLABORATION`: Team features
- `FEATURE_WIDGETS`: Widget support
- `FEATURE_ADVANCED_ANALYTICS`: Advanced analytics
- `FEATURE_OFFLINE_MODE`: Offline capabilities

## Security Considerations

### Development
- Use development Supabase project
- Disable analytics and crash reporting
- Use lower API rate limits

### Production
- Use production Supabase project with proper RLS
- Enable analytics and crash reporting
- Set appropriate rate limits
- **Never commit API keys to source control**

## Configuration Validation

The app validates configuration on startup:

```swift
let errors = ConfigurationManager.shared.validateConfiguration()
if !errors.isEmpty {
    // Handle configuration errors
    print("Configuration errors: \(errors)")
}
```

Common validation errors:
- Missing or invalid Supabase URL
- Missing Supabase anonymous key
- Luna AI enabled but no API keys configured
- Invalid numeric values for timeouts/limits

## Troubleshooting

### "SUPABASE_URL not configured" Error
1. Check if `SUPABASE_URL` environment variable is set
2. Verify Configuration-{Environment}.plist has correct URL
3. Ensure URL doesn't contain placeholder text

### "SUPABASE_ANON_KEY not configured" Error
1. Check if `SUPABASE_ANON_KEY` environment variable is set
2. Verify Configuration-{Environment}.plist has correct key
3. Get the key from your Supabase project settings

### AI Features Not Working
1. Verify at least one AI API key is configured
2. Check that `FEATURE_LUNA_AI` is set to "true"
3. Ensure API keys are valid and have sufficient credits

## Example Setup

### For Development
```bash
# Set environment variables
export SUPABASE_URL="https://dev-project.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export OPENAI_API_KEY="sk-..."

# Build and run
xcodebuild -scheme BeProductive-iOS -configuration Debug
```

### For Production Deployment
```bash
# Set production environment variables in your CI/CD
export SUPABASE_URL="https://prod-project.supabase.co"
export SUPABASE_ANON_KEY="production-key-here"

# Build for App Store
xcodebuild -scheme BeProductive-iOS -configuration Release archive
```

## Next Steps

After configuration:
1. Run the app to verify connection to Supabase
2. Test AI features if configured
3. Check Analytics dashboard if enabled
4. Verify offline mode functionality

For deployment preparation, see the main README.md file.