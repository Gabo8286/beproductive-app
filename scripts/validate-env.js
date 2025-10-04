#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates required environment variables for different deployment environments
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Environment variable definitions
const envVariables = {
  required: {
    development: [
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_URL',
      'VITE_APP_ENVIRONMENT'
    ],
    staging: [
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_URL',
      'VITE_APP_ENVIRONMENT',
      'VITE_APP_URL',
      'VITE_SENTRY_DSN',
      'VITE_WEB_VITALS_ENDPOINT'
    ],
    production: [
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_URL',
      'VITE_APP_ENVIRONMENT',
      'VITE_APP_URL',
      'VITE_SENTRY_DSN',
      'VITE_WEB_VITALS_ENDPOINT',
      'VITE_CDN_URL',
      'VITE_PERFORMANCE_API_KEY'
    ]
  },
  optional: [
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_MICROSOFT_CLIENT_ID',
    'VITE_SLACK_CLIENT_ID',
    'VITE_POSTHOG_KEY',
    'VITE_HOTJAR_ID',
    'QUALITY_WEBHOOK_URL',
    'SLACK_QUALITY_CHANNEL',
    'VITE_EMAILJS_SERVICE_ID'
  ],
  development: [
    'VITE_ENABLE_DEVTOOLS',
    'VITE_SHOW_PERFORMANCE_MONITOR'
  ]
};

// Security patterns to detect sensitive data exposure
const sensitivePatterns = [
  /password/i,
  /secret/i,
  /private.*key/i,
  /api.*key/i,
  /token/i
];

// Validation functions
function loadEnvironment(envFile) {
  const envPath = join(rootDir, envFile);

  if (!existsSync(envPath)) {
    return null;
  }

  const envContent = readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

function validateEnvironment(environment) {
  console.log(`\n🔍 Validating ${environment} environment...`);

  const envFile = environment === 'development' ? '.env' : `.env.${environment}`;
  const env = loadEnvironment(envFile);

  if (!env) {
    console.error(`❌ Environment file ${envFile} not found`);
    return false;
  }

  console.log(`✓ Found environment file: ${envFile}`);

  const requiredVars = envVariables.required[environment] || [];
  const errors = [];
  const warnings = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName] === 'your_' + varName.toLowerCase()) {
      errors.push(`Missing or placeholder value for required variable: ${varName}`);
    } else {
      console.log(`✓ ${varName}: configured`);
    }
  });

  // Check for sensitive data exposure
  Object.entries(env).forEach(([key, value]) => {
    if (sensitivePatterns.some(pattern => pattern.test(key)) &&
        (value.includes('your_') || value.includes('placeholder'))) {
      warnings.push(`Placeholder detected in sensitive variable: ${key}`);
    }
  });

  // Environment-specific validations
  if (environment === 'production') {
    // Production-specific checks
    if (env.VITE_ENABLE_DEVTOOLS === 'true') {
      warnings.push('Development tools are enabled in production');
    }

    if (!env.VITE_SENTRY_DSN || env.VITE_SENTRY_DSN.includes('your_')) {
      errors.push('Production requires proper Sentry configuration for error tracking');
    }

    if (!env.VITE_CDN_URL || env.VITE_CDN_URL.includes('your_')) {
      warnings.push('CDN not configured - may impact performance');
    }
  }

  // URL validation
  const urlVars = ['VITE_APP_URL', 'VITE_SUPABASE_URL', 'VITE_CDN_URL'];
  urlVars.forEach(varName => {
    if (env[varName] && !env[varName].startsWith('http')) {
      errors.push(`Invalid URL format for ${varName}: ${env[varName]}`);
    }
  });

  // Report results
  if (errors.length > 0) {
    console.error('\n❌ Validation Errors:');
    errors.forEach(error => console.error(`  • ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Validation Warnings:');
    warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  if (errors.length === 0) {
    console.log(`\n✅ ${environment} environment validation passed!`);
    return true;
  } else {
    console.error(`\n❌ ${environment} environment validation failed!`);
    return false;
  }
}

function generateSecurityReport() {
  console.log('\n🔒 Security Analysis Report');
  console.log('============================');

  const environments = ['development', 'staging', 'production'];
  const securityIssues = [];

  environments.forEach(env => {
    const envFile = env === 'development' ? '.env' : `.env.${env}`;
    const envData = loadEnvironment(envFile);

    if (envData) {
      Object.entries(envData).forEach(([key, value]) => {
        // Check for exposed secrets
        if (sensitivePatterns.some(pattern => pattern.test(key))) {
          if (value.length < 20 && !value.includes('your_')) {
            securityIssues.push({
              environment: env,
              variable: key,
              issue: 'Potentially weak or exposed secret',
              severity: 'medium'
            });
          }
        }

        // Check for hardcoded URLs in non-production
        if (key.includes('URL') && value.includes('localhost') && env === 'production') {
          securityIssues.push({
            environment: env,
            variable: key,
            issue: 'localhost URL in production environment',
            severity: 'high'
          });
        }
      });
    }
  });

  if (securityIssues.length === 0) {
    console.log('✅ No security issues detected');
  } else {
    console.log('⚠️  Security issues found:');
    securityIssues.forEach(issue => {
      const icon = issue.severity === 'high' ? '🔴' : '🟡';
      console.log(`  ${icon} [${issue.environment}] ${issue.variable}: ${issue.issue}`);
    });
  }
}

// Main execution
function main() {
  console.log('🔧 Environment Configuration Validator');
  console.log('======================================');

  const environment = process.env.NODE_ENV || process.argv[2] || 'development';

  if (process.argv.includes('--all')) {
    const environments = ['development', 'staging', 'production'];
    let allValid = true;

    environments.forEach(env => {
      const isValid = validateEnvironment(env);
      allValid = allValid && isValid;
    });

    generateSecurityReport();

    process.exit(allValid ? 0 : 1);
  } else {
    const isValid = validateEnvironment(environment);
    generateSecurityReport();

    process.exit(isValid ? 0 : 1);
  }
}

// Help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Environment Validation Script

Usage:
  node scripts/validate-env.js [environment]
  node scripts/validate-env.js --all
  node scripts/validate-env.js --help

Environments:
  development (default)
  staging
  production

Options:
  --all     Validate all environments
  --help    Show this help message

Examples:
  node scripts/validate-env.js production
  node scripts/validate-env.js --all
`);
  process.exit(0);
}

main();