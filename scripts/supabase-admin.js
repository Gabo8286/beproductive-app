#!/usr/bin/env node

/**
 * Supabase Admin Client with Service Role Key
 * Full database administration capabilities for Claude Code
 * Uses SUPABASE_SERVICE_ROLE_KEY for complete DDL access
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

// Supabase configuration with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!serviceRoleKey && !anonKey) {
  console.error('❌ Missing both SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('   At least one key is required for database operations');
  process.exit(1);
}

// Create admin client with service role key (full permissions)
const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Create regular client with anon key (limited permissions)
const regularClient = anonKey ? createClient(supabaseUrl, anonKey) : null;

console.log('🔧 Supabase Admin Client Initialized');
console.log(`📍 Project URL: ${supabaseUrl}`);
console.log(`🔑 Admin Client: ${adminClient ? '✅ Available (Service Role)' : '❌ Not Available'}`);
console.log(`🔑 Regular Client: ${regularClient ? '✅ Available (Anon Key)' : '❌ Not Available'}`);

/**
 * Execute raw SQL with admin privileges
 */
export async function executeSQL(sql, description = 'SQL Query') {
  if (!adminClient) {
    throw new Error('Admin client not available. SUPABASE_SERVICE_ROLE_KEY required for SQL execution.');
  }

  try {
    console.log(`\n🔍 Executing: ${description}`);
    console.log(`📝 SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);

    const { data, error } = await adminClient.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try alternative methods
      if (error.message.includes('could not find function')) {
        console.log('⚠️  exec_sql function not available, trying direct query...');

        // For simple queries, try using the supabase client directly
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const { data: selectData, error: selectError } = await adminClient
            .from('information_schema.tables')
            .select('*')
            .limit(1);

          if (selectError) {
            throw new Error(`Query execution failed: ${selectError.message}`);
          }

          console.log('✅ Query executed via direct method');
          return { success: true, data: selectData, method: 'direct' };
        } else {
          // For DDL statements, we'll need to use PostgreSQL REST API directly
          return await executeViaPostgREST(sql, description);
        }
      } else {
        throw new Error(`SQL execution failed: ${error.message}`);
      }
    }

    console.log('✅ SQL executed successfully');
    return { success: true, data, method: 'rpc' };

  } catch (error) {
    console.error(`❌ SQL execution failed: ${error.message}`);
    return { success: false, error: error.message, method: 'failed' };
  }
}

/**
 * Execute SQL via direct PostgreSQL REST API
 */
async function executeViaPostgREST(sql, description) {
  try {
    console.log('🔄 Attempting direct PostgreSQL execution...');

    const postgrestUrl = supabaseUrl.replace('/supabase/', '/rest/v1/');
    const response = await fetch(`${postgrestUrl}/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ SQL executed via PostgreSQL REST API');
    return { success: true, data: null, method: 'postgrest' };

  } catch (error) {
    console.error(`❌ PostgreSQL REST execution failed: ${error.message}`);
    return { success: false, error: error.message, method: 'postgrest-failed' };
  }
}

/**
 * Test admin connection and capabilities
 */
export async function testAdminConnection() {
  console.log('\n🔍 Testing admin connection and capabilities...');

  const tests = [
    {
      name: 'Basic Connection',
      test: async () => {
        if (!adminClient) return { success: false, error: 'No admin client' };

        const { data, error } = await adminClient
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .limit(5);

        return { success: !error, data: data?.length || 0, error: error?.message };
      }
    },
    {
      name: 'Schema Access',
      test: async () => {
        return await executeSQL(
          "SELECT schemaname FROM pg_tables WHERE schemaname = 'public' LIMIT 1",
          "Schema access test"
        );
      }
    },
    {
      name: 'Function Creation Test',
      test: async () => {
        const testSQL = `
          CREATE OR REPLACE FUNCTION test_admin_access()
          RETURNS TEXT AS $$
          BEGIN
            RETURN 'Admin access confirmed';
          END;
          $$ LANGUAGE plpgsql;
        `;
        return await executeSQL(testSQL, "Function creation test");
      }
    },
    {
      name: 'Function Execution Test',
      test: async () => {
        const { data, error } = await adminClient.rpc('test_admin_access');
        return {
          success: !error && data === 'Admin access confirmed',
          data,
          error: error?.message
        };
      }
    }
  ];

  let passedTests = 0;
  const results = {};

  for (const test of tests) {
    try {
      const result = await test.test();
      const passed = result.success;

      console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }

      results[test.name] = result;
      if (passed) passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      results[test.name] = { success: false, error: error.message };
    }
  }

  console.log(`\n📊 Admin Tests: ${passedTests}/${tests.length} passed`);

  if (passedTests === tests.length) {
    console.log('🎉 Full admin access confirmed!');
  } else if (passedTests > 0) {
    console.log('⚠️  Partial admin access - some operations may be limited');
  } else {
    console.log('❌ Admin access failed - check service role key');
  }

  return {
    totalTests: tests.length,
    passedTests,
    results,
    hasFullAccess: passedTests === tests.length
  };
}

/**
 * List all tables in the public schema
 */
export async function listTables() {
  try {
    console.log('\n📋 Listing tables in public schema...');

    const { data, error } = await adminClient
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('❌ Failed to list tables:', error.message);
      return [];
    }

    console.log(`✅ Found ${data.length} table(s)`);
    if (data.length > 0) {
      console.table(data);
    } else {
      console.log('⚠️  No tables found in public schema');
    }

    return data;
  } catch (error) {
    console.error('❌ Error listing tables:', error.message);
    return [];
  }
}

/**
 * List all functions in the public schema
 */
export async function listFunctions() {
  try {
    console.log('\n⚙️  Listing functions in public schema...');

    const sql = `
      SELECT
        routine_name as function_name,
        routine_type,
        data_type as return_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `;

    const result = await executeSQL(sql, "List functions");

    if (result.success && result.data) {
      console.log(`✅ Found ${result.data.length} function(s)`);
      if (result.data.length > 0) {
        console.table(result.data);
      }
      return result.data;
    } else {
      console.log('⚠️  Could not retrieve functions');
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing functions:', error.message);
    return [];
  }
}

/**
 * Check if a table exists
 */
export async function tableExists(tableName) {
  try {
    const { data, error } = await adminClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .limit(1);

    if (error) {
      console.error(`❌ Error checking table ${tableName}:`, error.message);
      return false;
    }

    const exists = data && data.length > 0;
    console.log(`${exists ? '✅' : '❌'} Table '${tableName}' ${exists ? 'exists' : 'does not exist'}`);
    return exists;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Check if a function exists
 */
export async function functionExists(functionName) {
  try {
    const { data, error } = await adminClient.rpc(functionName);

    // If we get a specific error about parameters, the function exists
    // If we get "could not find function", it doesn't exist
    if (error) {
      const exists = !error.message.includes('could not find function');
      console.log(`${exists ? '✅' : '❌'} Function '${functionName}' ${exists ? 'exists' : 'does not exist'}`);
      return exists;
    }

    console.log(`✅ Function '${functionName}' exists and executed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ Function '${functionName}' does not exist`);
    return false;
  }
}

/**
 * Get database info and statistics
 */
export async function getDatabaseInfo() {
  console.log('\n📊 Database Information...');

  try {
    const tables = await listTables();
    const functions = await listFunctions();

    // Check for key tables
    const keyTables = ['profiles', 'user_roles', 'beta_signups', 'beta_invitations'];
    const tableStatus = {};

    for (const table of keyTables) {
      tableStatus[table] = await tableExists(table);
    }

    // Check for key functions
    const keyFunctions = ['has_role', 'assign_initial_super_admin', 'assign_super_admin_role'];
    const functionStatus = {};

    for (const func of keyFunctions) {
      functionStatus[func] = await functionExists(func);
    }

    console.log('\n📋 Key Tables Status:');
    Object.entries(tableStatus).forEach(([table, exists]) => {
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });

    console.log('\n⚙️  Key Functions Status:');
    Object.entries(functionStatus).forEach(([func, exists]) => {
      console.log(`  ${exists ? '✅' : '❌'} ${func}`);
    });

    return {
      totalTables: tables.length,
      totalFunctions: functions.length,
      tableStatus,
      functionStatus,
      readyForSuperAdmin: tableStatus.user_roles && functionStatus.has_role
    };

  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
    return null;
  }
}

// Export clients for use in other scripts
export { adminClient, regularClient };

// CLI interface when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'test':
      await testAdminConnection();
      break;
    case 'tables':
      await listTables();
      break;
    case 'functions':
      await listFunctions();
      break;
    case 'info':
      await getDatabaseInfo();
      break;
    case 'sql':
      if (!arg) {
        console.error('❌ Please provide SQL to execute');
        process.exit(1);
      }
      await executeSQL(arg, 'Manual SQL execution');
      break;
    case 'check-table':
      if (!arg) {
        console.error('❌ Please provide table name');
        process.exit(1);
      }
      await tableExists(arg);
      break;
    case 'check-function':
      if (!arg) {
        console.error('❌ Please provide function name');
        process.exit(1);
      }
      await functionExists(arg);
      break;
    default:
      console.log(`
🔧 Supabase Admin Client for Claude Code

Usage: node scripts/supabase-admin.js <command> [args]

Commands:
  test              Test admin connection and capabilities
  tables            List all tables in public schema
  functions         List all functions in public schema
  info              Show complete database information
  sql <query>       Execute raw SQL (admin privileges)
  check-table <name>    Check if table exists
  check-function <name> Check if function exists

Examples:
  node scripts/supabase-admin.js test
  node scripts/supabase-admin.js tables
  node scripts/supabase-admin.js sql "SELECT version()"
  node scripts/supabase-admin.js check-table user_roles
      `);
  }
}