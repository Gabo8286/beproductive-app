#!/usr/bin/env node

/**
 * Migration Manager for Supabase
 * Handles migration dependencies and applies them in correct order
 */

import { executeSQL, testAdminConnection, adminClient, tableExists, functionExists } from './supabase-admin.js';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration dependency map
 * Defines which migrations must be applied before others
 */
const MIGRATION_DEPENDENCIES = {
  // Super admin migration depends on beta signup tables
  '20251016_fix_super_admin_access.sql': [
    '20250115_create_beta_signups.sql',
    '20250115_extend_beta_signups_approval.sql'
  ]
};

/**
 * Core migrations needed for super admin functionality
 */
const CORE_MIGRATIONS = [
  '20250115_create_beta_signups.sql',
  '20250115_extend_beta_signups_approval.sql',
  '20251016_fix_super_admin_access.sql'
];

/**
 * Read and parse a migration file
 */
function readMigrationFile(fileName) {
  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', fileName);
    const content = readFileSync(migrationPath, 'utf8');

    return {
      fileName,
      content,
      size: content.length,
      path: migrationPath
    };
  } catch (error) {
    throw new Error(`Failed to read migration ${fileName}: ${error.message}`);
  }
}

/**
 * Split migration content into executable statements
 */
function splitIntoStatements(migrationContent) {
  // Remove comments and empty lines
  const cleanContent = migrationContent
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    })
    .join('\n');

  // Split by semicolons, but be careful with function definitions
  const statements = [];
  let currentStatement = '';
  let inFunction = false;
  let dollarQuoteTag = null;

  const lines = cleanContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Track dollar-quoted function bodies
    if (trimmedLine.includes('$$')) {
      if (dollarQuoteTag === null) {
        // Starting a dollar-quoted section
        const match = trimmedLine.match(/\$([^$]*)\$/);
        if (match) {
          dollarQuoteTag = match[1];
          inFunction = true;
        }
      } else {
        // Potentially ending a dollar-quoted section
        if (trimmedLine.includes(`$${dollarQuoteTag}$`)) {
          dollarQuoteTag = null;
          inFunction = false;
        }
      }
    }

    currentStatement += line + '\n';

    // If we find a semicolon and we're not in a function, end the statement
    if (trimmedLine.endsWith(';') && !inFunction) {
      const statement = currentStatement.trim();
      if (statement) {
        statements.push(statement);
      }
      currentStatement = '';
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements.filter(stmt => stmt.length > 0);
}

/**
 * Apply a single migration file
 */
async function applyMigration(fileName, force = false) {
  try {
    console.log(`\n🚀 Applying migration: ${fileName}`);
    console.log('═'.repeat(60));

    // Read the migration file
    const migration = readMigrationFile(fileName);
    console.log(`📖 Read migration file: ${migration.path}`);
    console.log(`📄 Migration size: ${migration.size} characters`);

    // Split into statements
    const statements = splitIntoStatements(migration.content);
    console.log(`🔍 Found ${statements.length} SQL statement(s) to execute`);

    if (statements.length === 0) {
      console.log('⚠️  No executable statements found in migration');
      return { success: true, executed: 0, failed: 0 };
    }

    // Execute each statement
    let executed = 0;
    let failed = 0;
    const results = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const trimmedStatement = statement.trim();

      if (!trimmedStatement) continue;

      console.log(`\n📝 Executing statement ${i + 1}/${statements.length}:`);

      // Show preview of statement
      const preview = trimmedStatement.length > 100
        ? trimmedStatement.substring(0, 100) + '...'
        : trimmedStatement;
      console.log(`   ${preview}`);

      try {
        const result = await executeSQL(statement, `Migration ${fileName} - Statement ${i + 1}`);

        if (result.success) {
          console.log('✅ Statement executed successfully');
          executed++;
        } else {
          console.error(`❌ Statement failed: ${result.error}`);
          failed++;

          // Check if this is a benign failure
          const isBenign = checkBenignFailure(statement, result.error);
          if (isBenign) {
            console.log('   (This failure is likely harmless)');
          } else if (!force) {
            console.log('   Use --force to continue despite failures');
            break;
          }
        }

        results.push({ statement: preview, success: result.success, error: result.error });

      } catch (error) {
        console.error(`❌ Statement failed with exception: ${error.message}`);
        failed++;
        results.push({ statement: preview, success: false, error: error.message });

        if (!force) {
          console.log('   Use --force to continue despite failures');
          break;
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`✅ Successful statements: ${executed}`);
    console.log(`❌ Failed statements: ${failed}`);
    console.log(`📈 Total statements: ${statements.length}`);

    const success = failed === 0 || (executed > failed && force);

    if (success) {
      console.log('\n🎉 Migration applied successfully!');
    } else {
      console.log('\n⚠️  Migration had failures');
    }

    return {
      success,
      executed,
      failed,
      total: statements.length,
      results
    };

  } catch (error) {
    console.error('❌ Migration application failed:', error.message);
    return {
      success: false,
      executed: 0,
      failed: 1,
      total: 1,
      error: error.message
    };
  }
}

/**
 * Check if a migration failure is benign (can be ignored)
 */
function checkBenignFailure(statement, error) {
  const benignPatterns = [
    'already exists',
    'does not exist',
    'DROP POLICY IF EXISTS',
    'CREATE OR REPLACE',
    'IF NOT EXISTS'
  ];

  const statementUpper = statement.toUpperCase();
  const errorLower = (error || '').toLowerCase();

  return benignPatterns.some(pattern =>
    statementUpper.includes(pattern.toUpperCase()) ||
    errorLower.includes(pattern.toLowerCase())
  );
}

/**
 * Check migration dependencies
 */
async function checkDependencies(fileName) {
  const dependencies = MIGRATION_DEPENDENCIES[fileName] || [];
  const missingDeps = [];

  console.log(`\n🔍 Checking dependencies for ${fileName}...`);

  if (dependencies.length === 0) {
    console.log('✅ No dependencies required');
    return { satisfied: true, missing: [] };
  }

  for (const dep of dependencies) {
    console.log(`   Checking: ${dep}`);

    // For now, we'll check if key tables/functions exist
    // In a real system, you'd track applied migrations
    const satisfied = await checkDependencySatisfied(dep);

    if (satisfied) {
      console.log(`   ✅ ${dep} - satisfied`);
    } else {
      console.log(`   ❌ ${dep} - missing`);
      missingDeps.push(dep);
    }
  }

  return {
    satisfied: missingDeps.length === 0,
    missing: missingDeps
  };
}

/**
 * Check if a dependency is satisfied by looking at database state
 */
async function checkDependencySatisfied(migrationFile) {
  try {
    // Check based on what each migration creates
    switch (migrationFile) {
      case '20250115_create_beta_signups.sql':
        return await tableExists('beta_signups');

      case '20250115_extend_beta_signups_approval.sql':
        return await tableExists('beta_invitations');

      default:
        // If we don't know how to check, assume it's not satisfied
        return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Apply migrations in dependency order
 */
async function applyMigrationsInOrder(migrationFiles, force = false) {
  console.log('\n🔄 Applying migrations in dependency order...');

  const results = {};
  const applied = [];

  // Create a sorted list respecting dependencies
  const sortedMigrations = [...migrationFiles];

  // Simple dependency sort - dependencies first
  sortedMigrations.sort((a, b) => {
    const aDeps = MIGRATION_DEPENDENCIES[a] || [];
    const bDeps = MIGRATION_DEPENDENCIES[b] || [];

    // If b depends on a, a should come first
    if (bDeps.includes(a)) return -1;
    // If a depends on b, b should come first
    if (aDeps.includes(b)) return 1;

    // Otherwise, maintain original order
    return 0;
  });

  console.log('📋 Migration order:');
  sortedMigrations.forEach((migration, index) => {
    console.log(`   ${index + 1}. ${migration}`);
  });

  for (const migration of sortedMigrations) {
    // Check dependencies
    const depCheck = await checkDependencies(migration);

    if (!depCheck.satisfied && !force) {
      console.log(`\n⚠️  Skipping ${migration} due to unsatisfied dependencies:`);
      depCheck.missing.forEach(dep => console.log(`   - ${dep}`));
      results[migration] = {
        success: false,
        error: 'Unsatisfied dependencies',
        skipped: true
      };
      continue;
    }

    // Apply the migration
    const result = await applyMigration(migration, force);
    results[migration] = result;

    if (result.success) {
      applied.push(migration);
    } else if (!force) {
      console.log(`\n❌ Stopping due to failure in ${migration}`);
      break;
    }
  }

  console.log('\n🏁 Migration batch complete!');
  console.log(`✅ Successfully applied: ${applied.length} migration(s)`);
  console.log(`❌ Failed: ${Object.values(results).filter(r => !r.success).length} migration(s)`);

  return { results, applied };
}

/**
 * Apply core migrations needed for super admin
 */
async function applyCoreSuperAdminMigrations(force = false) {
  console.log('\n🎯 Applying core super admin migrations...');

  return await applyMigrationsInOrder(CORE_MIGRATIONS, force);
}

/**
 * Verify super admin setup after migrations
 */
async function verifySuperAdminSetup() {
  console.log('\n🔍 Verifying super admin setup...');

  const checks = [
    {
      name: 'user_roles table',
      check: () => tableExists('user_roles')
    },
    {
      name: 'beta_signups table',
      check: () => tableExists('beta_signups')
    },
    {
      name: 'beta_invitations table',
      check: () => tableExists('beta_invitations')
    },
    {
      name: 'has_role function',
      check: () => functionExists('has_role')
    },
    {
      name: 'assign_initial_super_admin function',
      check: () => functionExists('assign_initial_super_admin')
    },
    {
      name: 'assign_super_admin_role function',
      check: () => functionExists('assign_super_admin_role')
    }
  ];

  let passed = 0;
  const results = {};

  for (const check of checks) {
    try {
      const result = await check.check();
      console.log(`${result ? '✅' : '❌'} ${check.name}`);
      results[check.name] = result;
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${check.name} (error: ${error.message})`);
      results[check.name] = false;
    }
  }

  console.log(`\n📊 Verification: ${passed}/${checks.length} checks passed`);

  const isReady = passed === checks.length;
  if (isReady) {
    console.log('🎉 Super admin system is ready!');
  } else {
    console.log('⚠️  Super admin system setup incomplete');
  }

  return { isReady, passed, total: checks.length, results };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  const force = args.includes('--force');

  switch (command) {
    case 'apply':
      const fileName = args.find(arg => !arg.startsWith('--'));
      if (!fileName) {
        console.error('❌ Please provide migration file name');
        process.exit(1);
      }
      await applyMigration(fileName, force);
      break;

    case 'apply-core':
      await applyCoreSuperAdminMigrations(force);
      break;

    case 'verify':
      await verifySuperAdminSetup();
      break;

    case 'check-deps':
      const depFileName = args.find(arg => !arg.startsWith('--'));
      if (!depFileName) {
        console.error('❌ Please provide migration file name');
        process.exit(1);
      }
      await checkDependencies(depFileName);
      break;

    case 'list':
      console.log('\n📋 Core Super Admin Migrations:');
      CORE_MIGRATIONS.forEach((migration, index) => {
        console.log(`   ${index + 1}. ${migration}`);
      });
      break;

    default:
      console.log(`
🛠️  Migration Manager for Supabase

Usage: node scripts/migration-manager.js <command> [options]

Commands:
  apply <file>      Apply a specific migration file
  apply-core        Apply all core super admin migrations
  verify           Verify super admin setup is complete
  check-deps <file> Check dependencies for a migration
  list             List core migrations

Options:
  --force          Continue despite failures

Examples:
  node scripts/migration-manager.js apply-core
  node scripts/migration-manager.js apply 20250115_create_beta_signups.sql
  node scripts/migration-manager.js verify
  node scripts/migration-manager.js apply-core --force
      `);
  }
}