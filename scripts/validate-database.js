#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * Validates Supabase database schema and migration integrity
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Expected core tables for the productivity application
const expectedTables = [
  'profiles',
  'workspaces',
  'workspace_members',
  'subscriptions',
  'goals',
  'tasks',
  'habits',
  'reflections',
  'notes',
  'tags',
  'templates',
  'gamification_profiles',
  'api_keys',
  'api_usage_logs'
];

// Expected RLS policies for security
const securityChecks = [
  { table: 'profiles', policy: 'Users can view their own profile' },
  { table: 'tasks', policy: 'Users can only access their own tasks' },
  { table: 'goals', policy: 'Users can only access their own goals' },
  { table: 'habits', policy: 'Users can only access their own habits' },
  { table: 'notes', policy: 'Users can only access their own notes' }
];

class DatabaseValidator {
  constructor() {
    this.supabase = null;
    this.migrationFiles = [];
    this.errors = [];
    this.warnings = [];
  }

  async initialize() {
    // Load environment variables
    const envPath = join(rootDir, '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Load migration files
    const migrationsDir = join(rootDir, 'supabase', 'migrations');
    if (existsSync(migrationsDir)) {
      this.migrationFiles = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    }

    console.log(`✓ Connected to Supabase database`);
    console.log(`✓ Found ${this.migrationFiles.length} migration files`);
  }

  async validateConnection() {
    console.log('\n🔗 Testing Database Connection...');

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        this.errors.push(`Database connection failed: ${error.message}`);
        return false;
      }

      console.log('✓ Database connection successful');
      return true;
    } catch (error) {
      this.errors.push(`Database connection error: ${error.message}`);
      return false;
    }
  }

  async validateSchema() {
    console.log('\n📋 Validating Database Schema...');

    try {
      // Get all tables in the public schema
      const { data: tables, error } = await this.supabase.rpc('get_schema_tables');

      if (error) {
        // Fallback method if RPC doesn't exist
        const { data: fallbackTables, error: fallbackError } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (fallbackError) {
          this.errors.push(`Failed to retrieve table list: ${fallbackError.message}`);
          return false;
        }

        // Process fallback data
        const tableNames = fallbackTables?.map(t => t.table_name) || [];
        this.validateTableExistence(tableNames);
      } else {
        const tableNames = tables?.map(t => t.table_name) || [];
        this.validateTableExistence(tableNames);
      }

      return this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Schema validation error: ${error.message}`);
      return false;
    }
  }

  validateTableExistence(existingTables) {
    console.log(`\nFound ${existingTables.length} tables in database`);

    expectedTables.forEach(expectedTable => {
      if (existingTables.includes(expectedTable)) {
        console.log(`✓ Table '${expectedTable}' exists`);
      } else {
        this.warnings.push(`Table '${expectedTable}' not found - may not be created yet`);
      }
    });

    // Check for unexpected tables that might indicate issues
    const coreAppTables = existingTables.filter(table =>
      !table.startsWith('auth.') &&
      !table.startsWith('storage.') &&
      !table.startsWith('realtime.') &&
      table !== 'schema_migrations'
    );

    console.log(`\nCore application tables: ${coreAppTables.join(', ')}`);
  }

  async validateSecurity() {
    console.log('\n🔒 Validating Security Policies...');

    // Check if RLS is enabled on core tables
    for (const table of ['profiles', 'tasks', 'goals', 'habits']) {
      try {
        // Attempt to access without proper auth (should fail)
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.message.includes('not allowed')) {
          console.log(`✓ RLS properly configured for '${table}'`);
        } else if (error) {
          this.warnings.push(`RLS check failed for '${table}': ${error.message}`);
        } else {
          this.warnings.push(`RLS might not be properly configured for '${table}' - data accessible without auth`);
        }
      } catch (error) {
        this.warnings.push(`Security validation error for '${table}': ${error.message}`);
      }
    }
  }

  async validateIndexes() {
    console.log('\n📊 Validating Database Indexes...');

    const criticalIndexes = [
      { table: 'tasks', column: 'user_id' },
      { table: 'goals', column: 'user_id' },
      { table: 'habits', column: 'user_id' },
      { table: 'notes', column: 'user_id' },
      { table: 'tasks', column: 'created_at' },
      { table: 'habits', column: 'frequency' }
    ];

    // This is a simplified check - in a real scenario you'd query pg_indexes
    console.log('ℹ️  Index validation requires database admin access');
    this.warnings.push('Manual verification needed: Ensure indexes exist on user_id columns for performance');
  }

  validateMigrations() {
    console.log('\n📝 Validating Migration Files...');

    if (this.migrationFiles.length === 0) {
      this.warnings.push('No migration files found');
      return;
    }

    console.log(`Found ${this.migrationFiles.length} migration files:`);

    this.migrationFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);

      // Basic file validation
      const filePath = join(rootDir, 'supabase', 'migrations', file);
      const content = readFileSync(filePath, 'utf8');

      if (content.length < 10) {
        this.warnings.push(`Migration ${file} appears to be empty`);
      }

      // Check for dangerous operations
      if (content.includes('DROP TABLE') && !content.includes('IF EXISTS')) {
        this.warnings.push(`Migration ${file} contains potentially dangerous DROP TABLE without IF EXISTS`);
      }
    });

    console.log(`✓ Migration files validated`);
  }

  async validateBackupReadiness() {
    console.log('\n💾 Validating Backup Readiness...');

    // Check if we can access the database metadata needed for backups
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });

      if (!error) {
        console.log('✓ Database is accessible for backup operations');
      } else {
        this.warnings.push('Database access for backups may be limited');
      }
    } catch (error) {
      this.warnings.push(`Backup readiness check failed: ${error.message}`);
    }

    // Check environment configuration for backup tools
    const backupVars = [
      'SUPABASE_DB_URL',
      'SUPABASE_PROJECT_REF',
      'SUPABASE_ACCESS_TOKEN'
    ];

    const missingBackupVars = backupVars.filter(varName => !process.env[varName]);
    if (missingBackupVars.length > 0) {
      this.warnings.push(`Missing backup configuration: ${missingBackupVars.join(', ')}`);
    }
  }

  generateReport() {
    console.log('\n📊 Database Validation Report');
    console.log('============================');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All database validations passed successfully!');
    } else {
      if (this.errors.length > 0) {
        console.log('\n❌ Critical Issues:');
        this.errors.forEach(error => console.log(`  • ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        this.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
    }

    // Production readiness assessment
    const isProductionReady = this.errors.length === 0 &&
                             this.warnings.filter(w => w.includes('RLS') || w.includes('security')).length === 0;

    console.log(`\n🚀 Production Readiness: ${isProductionReady ? '✅ READY' : '⚠️  NEEDS ATTENTION'}`);

    return {
      success: this.errors.length === 0,
      productionReady: isProductionReady,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  async validateAll() {
    console.log('🗄️  Database Schema Validator');
    console.log('============================');

    try {
      await this.initialize();

      const connectionOk = await this.validateConnection();
      if (!connectionOk) {
        return this.generateReport();
      }

      await this.validateSchema();
      await this.validateSecurity();
      await this.validateIndexes();
      this.validateMigrations();
      await this.validateBackupReadiness();

      return this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.errors.push(`Validation process failed: ${error.message}`);
      return this.generateReport();
    }
  }
}

// Main execution
async function main() {
  const validator = new DatabaseValidator();
  const result = await validator.validateAll();

  process.exit(result.success ? 0 : 1);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Database Validation Script

Usage:
  node scripts/validate-database.js

This script validates:
  - Database connection
  - Schema integrity
  - Security policies (RLS)
  - Migration files
  - Backup readiness

Prerequisites:
  - Valid Supabase configuration in .env
  - Network access to Supabase
`);
  process.exit(0);
}

main().catch(console.error);