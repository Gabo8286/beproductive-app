#!/usr/bin/env node

/**
 * Super Admin Management Tool
 * Specialized tool for managing super admin roles and permissions
 */

import {
  supabase,
  testConnection,
  getSuperAdmins,
  checkUserRole,
  assignSuperAdmin,
  assignInitialSuperAdmin,
  getUserRoles,
  listAllUsersWithRoles,
  healthCheck
} from './supabase-client.js';

import { createInterface } from 'readline';

/**
 * Interactive CLI for super admin management
 */
class SuperAdminManager {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Ask user for input
   */
  async ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Main interactive menu
   */
  async showMenu() {
    console.clear();
    console.log(`
╔══════════════════════════════════════════╗
║         🚀 Super Admin Manager           ║
║    Spark Bloom Flow - Admin Console     ║
╚══════════════════════════════════════════╝

1. 🔍 Check database connection
2. 👑 View current super admins
3. 👤 Check user role
4. ➕ Assign super admin role
5. 🚀 Assign initial super admin
6. 📋 View user roles
7. 📊 List all users with roles
8. 🏥 Database health check
9. 🔄 Refresh menu
0. 🚪 Exit

`);

    const choice = await this.ask('Enter your choice (0-9): ');
    await this.handleChoice(choice);
  }

  /**
   * Handle user choice
   */
  async handleChoice(choice) {
    console.log('\n' + '═'.repeat(50));

    switch (choice) {
      case '1':
        await this.checkConnection();
        break;
      case '2':
        await this.viewSuperAdmins();
        break;
      case '3':
        await this.checkUserRoleInteractive();
        break;
      case '4':
        await this.assignSuperAdminInteractive();
        break;
      case '5':
        await this.assignInitialSuperAdminInteractive();
        break;
      case '6':
        await this.viewUserRolesInteractive();
        break;
      case '7':
        await this.listAllUsers();
        break;
      case '8':
        await this.performHealthCheck();
        break;
      case '9':
        await this.showMenu();
        return;
      case '0':
        console.log('\n👋 Goodbye!');
        this.rl.close();
        process.exit(0);
      default:
        console.log('❌ Invalid choice. Please try again.');
    }

    await this.ask('\nPress Enter to continue...');
    await this.showMenu();
  }

  /**
   * Check database connection
   */
  async checkConnection() {
    console.log('🔍 Testing Database Connection...\n');
    await testConnection();
  }

  /**
   * View current super admins
   */
  async viewSuperAdmins() {
    console.log('👑 Current Super Admins...\n');
    const superAdmins = await getSuperAdmins();

    if (superAdmins.length === 0) {
      console.log('\n💡 No super admins found. You may need to assign the initial super admin.');
      console.log('   Use option 5 to assign the initial super admin.');
    }
  }

  /**
   * Check user role interactively
   */
  async checkUserRoleInteractive() {
    const userId = await this.ask('Enter user ID to check: ');
    if (userId.trim()) {
      await checkUserRole(userId.trim());
    } else {
      console.log('❌ Please provide a valid user ID');
    }
  }

  /**
   * Assign super admin role interactively
   */
  async assignSuperAdminInteractive() {
    // First check if there are any super admins
    console.log('🔍 Checking current super admin status...\n');
    const superAdmins = await getSuperAdmins();

    if (superAdmins.length === 0) {
      console.log('⚠️  No super admins found. Consider using "Assign initial super admin" instead.');
      const proceed = await this.ask('\nDo you want to proceed anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        return;
      }
    }

    const userId = await this.ask('\nEnter user ID to make super admin: ');
    if (userId.trim()) {
      const success = await assignSuperAdmin(userId.trim());
      if (success) {
        console.log('\n✅ Role assigned successfully!');
        console.log('🔄 Updated super admin list:');
        await getSuperAdmins();
      }
    } else {
      console.log('❌ Please provide a valid user ID');
    }
  }

  /**
   * Assign initial super admin interactively
   */
  async assignInitialSuperAdminInteractive() {
    console.log('🚀 Assigning Initial Super Admin...\n');
    console.log('⚠️  This function assigns super admin role to the currently authenticated user.');
    console.log('   It only works if no super admin currently exists in the system.');

    const proceed = await this.ask('\nDo you want to proceed? (y/N): ');
    if (proceed.toLowerCase() === 'y') {
      const success = await assignInitialSuperAdmin();
      if (success) {
        console.log('\n✅ Initial super admin assigned successfully!');
        console.log('🔄 Updated super admin list:');
        await getSuperAdmins();
      }
    } else {
      console.log('Operation cancelled.');
    }
  }

  /**
   * View user roles interactively
   */
  async viewUserRolesInteractive() {
    const userId = await this.ask('Enter user ID to view roles: ');
    if (userId.trim()) {
      await getUserRoles(userId.trim());
    } else {
      console.log('❌ Please provide a valid user ID');
    }
  }

  /**
   * List all users with roles
   */
  async listAllUsers() {
    console.log('📊 All Users with Roles...\n');
    await listAllUsersWithRoles();
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    console.log('🏥 Database Health Check...\n');
    await healthCheck();
  }

  /**
   * Start the manager
   */
  async start() {
    console.log('🚀 Starting Super Admin Manager...');
    console.log('🔌 Initializing Supabase connection...\n');

    // Test initial connection
    const connected = await testConnection();
    if (!connected) {
      console.log('\n❌ Failed to connect to database. Please check your configuration.');
      console.log('   Make sure your .env file has the correct Supabase credentials.');
      this.rl.close();
      process.exit(1);
    }

    await this.showMenu();
  }
}

/**
 * Command line interface for batch operations
 */
async function runBatchCommand() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'setup':
      await setupInitialAdmin();
      break;
    case 'status':
      await showStatus();
      break;
    case 'emergency-assign':
      if (args.length < 1) {
        console.error('❌ Usage: emergency-assign <user_id>');
        process.exit(1);
      }
      await emergencyAssign(args[0]);
      break;
    case 'interactive':
    case 'menu':
    default:
      const manager = new SuperAdminManager();
      await manager.start();
      break;
  }
}

/**
 * Setup initial admin with guided process
 */
async function setupInitialAdmin() {
  console.log(`
╔══════════════════════════════════════════╗
║        🚀 Initial Admin Setup            ║
╚══════════════════════════════════════════╝

This will guide you through setting up the first super admin.
`);

  // Check connection
  console.log('1. Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Setup failed: Cannot connect to database');
    process.exit(1);
  }

  // Check existing super admins
  console.log('\n2. Checking for existing super admins...');
  const existingSuperAdmins = await getSuperAdmins();

  if (existingSuperAdmins.length > 0) {
    console.log('⚠️  Super admins already exist in the system:');
    console.table(existingSuperAdmins);
    console.log('\nSetup not needed. Use the interactive menu for other operations.');
    return;
  }

  // Assign initial super admin
  console.log('\n3. Assigning initial super admin...');
  const success = await assignInitialSuperAdmin();

  if (success) {
    console.log('\n✅ Setup completed successfully!');
    console.log('🎉 Your super admin dashboard should now be accessible.');
  } else {
    console.log('\n❌ Setup failed. Please check the logs above.');
  }
}

/**
 * Show system status
 */
async function showStatus() {
  console.log(`
╔══════════════════════════════════════════╗
║           📊 System Status               ║
╚══════════════════════════════════════════╝
`);

  await healthCheck();
  console.log('\n👑 Current Super Admins:');
  await getSuperAdmins();
  console.log('\n📋 All User Roles:');
  await listAllUsersWithRoles();
}

/**
 * Emergency assign super admin (bypass normal checks)
 */
async function emergencyAssign(userId) {
  console.log(`
╔══════════════════════════════════════════╗
║        🚨 Emergency Assignment           ║
╚══════════════════════════════════════════╝

WARNING: This is an emergency function that bypasses normal checks.
Only use this if you're locked out of the admin system.

Assigning super admin role to: ${userId}
`);

  const success = await assignSuperAdmin(userId);
  if (success) {
    console.log('\n✅ Emergency assignment completed!');
    await getSuperAdmins();
  } else {
    console.log('\n❌ Emergency assignment failed.');
  }
}

// Run the appropriate command
if (import.meta.url === `file://${process.argv[1]}`) {
  await runBatchCommand();
}