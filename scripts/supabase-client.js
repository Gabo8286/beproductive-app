#!/usr/bin/env node

/**
 * Direct Supabase Client for Claude Code
 * Enables direct database access for administrative operations
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

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔌 Supabase Client Initialized');
console.log(`📍 Project URL: ${supabaseUrl}`);
console.log(`🔑 Using API Key: ${supabaseKey.substring(0, 20)}...`);

/**
 * Test database connectivity
 */
export async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...');

    // Test basic connectivity
    const { data, error } = await supabase
      .from('user_roles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    console.log(`📊 Total user roles in database: ${data || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

/**
 * Get current super admins
 */
export async function getSuperAdmins() {
  try {
    console.log('\n👑 Fetching current super admins...');

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        assigned_at,
        assigned_by
      `)
      .eq('role', 'super_admin');

    if (error) {
      console.error('❌ Failed to fetch super admins:', error.message);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} super admin(s)`);
    if (data && data.length > 0) {
      console.table(data);
    } else {
      console.log('⚠️  No super admins found in the database');
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching super admins:', error.message);
    return [];
  }
}

/**
 * Check if a user has super admin role
 */
export async function checkUserRole(userId) {
  try {
    console.log(`\n🔍 Checking role for user: ${userId}`);

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'super_admin'
    });

    if (error) {
      console.error('❌ Failed to check user role:', error.message);
      return false;
    }

    const hasRole = data === true;
    console.log(`${hasRole ? '✅' : '❌'} User ${userId} ${hasRole ? 'has' : 'does not have'} super admin role`);
    return hasRole;
  } catch (error) {
    console.error('❌ Error checking user role:', error.message);
    return false;
  }
}

/**
 * Assign super admin role to a user
 */
export async function assignSuperAdmin(userId) {
  try {
    console.log(`\n👑 Assigning super admin role to user: ${userId}`);

    const { data, error } = await supabase.rpc('assign_super_admin_role', {
      target_user_id: userId
    });

    if (error) {
      console.error('❌ Failed to assign super admin role:', error.message);
      return false;
    }

    if (data?.success) {
      console.log('✅ Super admin role assigned successfully');
      console.log(`📝 Message: ${data.message}`);
      return true;
    } else {
      console.error('❌ Assignment failed:', data?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error assigning super admin role:', error.message);
    return false;
  }
}

/**
 * Assign initial super admin (first super admin in system)
 */
export async function assignInitialSuperAdmin() {
  try {
    console.log('\n🚀 Attempting to assign initial super admin...');
    console.log('⚠️  Note: This only works if no super admin currently exists');

    const { data, error } = await supabase.rpc('assign_initial_super_admin');

    if (error) {
      console.error('❌ Failed to assign initial super admin:', error.message);
      return false;
    }

    if (data?.success) {
      console.log('✅ Initial super admin assigned successfully');
      console.log(`👤 User ID: ${data.user_id}`);
      console.log(`📝 Message: ${data.message}`);
      return true;
    } else {
      console.error('❌ Assignment failed:', data?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error assigning initial super admin:', error.message);
    return false;
  }
}

/**
 * Get all user roles for a user
 */
export async function getUserRoles(userId) {
  try {
    console.log(`\n📋 Fetching all roles for user: ${userId}`);

    const { data, error } = await supabase.rpc('get_user_roles', {
      user_id: userId
    });

    if (error) {
      console.error('❌ Failed to fetch user roles:', error.message);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} role(s) for user`);
    if (data && data.length > 0) {
      console.table(data);
    } else {
      console.log('⚠️  No roles found for this user');
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching user roles:', error.message);
    return [];
  }
}

/**
 * List all users with any roles
 */
export async function listAllUsersWithRoles() {
  try {
    console.log('\n📊 Fetching all users with roles...');

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        assigned_at,
        assigned_by
      `)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch user roles:', error.message);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} user role assignment(s)`);
    if (data && data.length > 0) {
      // Group by user_id for better display
      const userMap = new Map();
      data.forEach(role => {
        if (!userMap.has(role.user_id)) {
          userMap.set(role.user_id, []);
        }
        userMap.get(role.user_id).push(role);
      });

      console.log('\n📋 Users and their roles:');
      userMap.forEach((roles, userId) => {
        console.log(`\n👤 User: ${userId}`);
        console.table(roles);
      });
    } else {
      console.log('⚠️  No user roles found in the database');
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching user roles:', error.message);
    return [];
  }
}

/**
 * Database health check
 */
export async function healthCheck() {
  console.log('\n🏥 Performing database health check...');

  const results = {
    connection: false,
    userRolesTable: false,
    hasRoleFunction: false,
    assignFunctions: false
  };

  try {
    // Test connection
    results.connection = await testConnection();

    // Test user_roles table access
    try {
      const { error } = await supabase
        .from('user_roles')
        .select('count', { count: 'exact', head: true });
      results.userRolesTable = !error;
      console.log(`${results.userRolesTable ? '✅' : '❌'} user_roles table access`);
    } catch (err) {
      console.log('❌ user_roles table access');
    }

    // Test has_role function
    try {
      const { error } = await supabase.rpc('has_role', {
        _user_id: 'test-id',
        _role: 'user'
      });
      results.hasRoleFunction = !error || error.message.includes('invalid input syntax');
      console.log(`${results.hasRoleFunction ? '✅' : '❌'} has_role function`);
    } catch (err) {
      console.log('❌ has_role function');
    }

    // Test assignment functions
    try {
      const { error } = await supabase.rpc('get_user_roles', {
        user_id: 'test-id'
      });
      results.assignFunctions = !error;
      console.log(`${results.assignFunctions ? '✅' : '❌'} admin functions`);
    } catch (err) {
      console.log('❌ admin functions');
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  const healthScore = Object.values(results).filter(Boolean).length;
  const totalChecks = Object.keys(results).length;

  console.log(`\n📊 Health Score: ${healthScore}/${totalChecks}`);
  if (healthScore === totalChecks) {
    console.log('✅ All systems operational!');
  } else {
    console.log('⚠️  Some issues detected. Check the logs above.');
  }

  return results;
}

// Export the supabase client for use in other scripts
export { supabase };

// CLI interface when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'test':
      await testConnection();
      break;
    case 'health':
      await healthCheck();
      break;
    case 'super-admins':
      await getSuperAdmins();
      break;
    case 'check-user':
      if (!arg) {
        console.error('❌ Please provide a user ID');
        process.exit(1);
      }
      await checkUserRole(arg);
      break;
    case 'assign':
      if (!arg) {
        console.error('❌ Please provide a user ID');
        process.exit(1);
      }
      await assignSuperAdmin(arg);
      break;
    case 'assign-initial':
      await assignInitialSuperAdmin();
      break;
    case 'user-roles':
      if (!arg) {
        console.error('❌ Please provide a user ID');
        process.exit(1);
      }
      await getUserRoles(arg);
      break;
    case 'list-all':
      await listAllUsersWithRoles();
      break;
    default:
      console.log(`
🔌 Supabase Client for Claude Code

Usage: node scripts/supabase-client.js <command> [args]

Commands:
  test                    Test database connection
  health                  Perform full health check
  super-admins           List all super admins
  check-user <user_id>   Check if user has super admin role
  assign <user_id>       Assign super admin role to user
  assign-initial         Assign initial super admin (first one)
  user-roles <user_id>   Get all roles for a user
  list-all               List all users with roles

Examples:
  node scripts/supabase-client.js test
  node scripts/supabase-client.js super-admins
  node scripts/supabase-client.js assign-initial
  node scripts/supabase-client.js assign abc123-def456-ghi789
      `);
  }
}