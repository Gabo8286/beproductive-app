#!/usr/bin/env node

/**
 * User Account Creation Script
 * Creates the specified user accounts with proper roles and profiles
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

class UserAccountCreator {
    constructor() {
        this.supabaseUrl = process.env.VITE_SUPABASE_URL;
        this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            process.exit(1);
        }

        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async createUserAccounts() {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🚀 User Account Creation Tool                  ║');
        console.log('║              Creating Missing Accounts                   ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const accounts = [
            {
                email: 'gabosoto@be-productive.app',
                password: 'SecureAdmin2024!',
                fullName: 'Gabriel Soto Morales',
                role: 'super_admin'
            },
            {
                email: 'gabotico82@gmail.com',
                password: 'SecureUser2024!',
                fullName: 'Gabriel Soto',
                role: 'user'
            }
        ];

        for (const account of accounts) {
            await this.createSingleAccount(account);
        }

        // Final verification
        await this.verifyAccounts();
    }

    async createSingleAccount(account) {
        console.log(`👤 Creating account: ${account.email}`);
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Step 1: Create user in auth.users via signup
            console.log('🔐 Creating authentication account...');

            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: account.email,
                password: account.password,
                options: {
                    data: {
                        full_name: account.fullName,
                    },
                    emailRedirectTo: 'https://be-productive.app/login'
                }
            });

            if (authError) {
                console.log(`❌ Auth signup failed: ${authError.message}`);

                // Check if user already exists
                if (authError.message.includes('already registered')) {
                    console.log('⚠️  User already exists in auth.users, checking profile...');
                    await this.handleExistingUser(account);
                }
                return;
            }

            if (authData.user) {
                console.log(`✅ Auth account created: ${authData.user.id}`);
                console.log(`   - Email: ${authData.user.email}`);
                console.log(`   - Confirmation required: ${!authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

                // Step 2: Create profile
                await this.createProfile(authData.user, account);

                // Step 3: Assign role if needed
                if (account.role === 'super_admin') {
                    await this.assignSuperAdminRole(authData.user.id, account.email);
                }
            }

        } catch (error) {
            console.log(`❌ Account creation failed: ${error.message}`);
        }
        console.log('');
    }

    async handleExistingUser(account) {
        try {
            // Try to sign in to get user details
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: account.email,
                password: account.password
            });

            if (authData.user) {
                console.log(`✅ Existing auth account verified: ${authData.user.id}`);

                // Check if profile exists
                await this.createProfile(authData.user, account);

                // Assign role if needed
                if (account.role === 'super_admin') {
                    await this.assignSuperAdminRole(authData.user.id, account.email);
                }

                // Sign out after verification
                await this.supabase.auth.signOut();
            }
        } catch (error) {
            console.log(`⚠️  Could not verify existing user: ${error.message}`);
        }
    }

    async createProfile(user, account) {
        console.log('👤 Creating user profile...');

        try {
            // Check if profile already exists
            const { data: existingProfile } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (existingProfile) {
                console.log('✅ Profile already exists');
                return;
            }

            // Create new profile
            const { error: profileError } = await this.supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: account.email,
                    full_name: account.fullName,
                    role: account.role,
                    onboarding_completed: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.log(`❌ Profile creation failed: ${profileError.message}`);
            } else {
                console.log(`✅ Profile created with role: ${account.role}`);
            }

        } catch (error) {
            console.log(`❌ Profile creation error: ${error.message}`);
        }
    }

    async assignSuperAdminRole(userId, email) {
        console.log('👑 Assigning super admin role...');

        try {
            // Check if role assignment already exists
            const { data: existingRole } = await this.supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', userId)
                .eq('role', 'super_admin')
                .single();

            if (existingRole) {
                console.log('✅ Super admin role already assigned');
                return;
            }

            // Create role assignment
            const { error: roleError } = await this.supabase
                .from('user_roles')
                .insert({
                    user_id: userId,
                    email: email,
                    role: 'super_admin',
                    assigned_at: new Date().toISOString(),
                    assigned_by: userId, // Self-assigned for initial setup
                    is_active: true
                });

            if (roleError) {
                console.log(`❌ Role assignment failed: ${roleError.message}`);
            } else {
                console.log('✅ Super admin role assigned successfully');
            }

        } catch (error) {
            console.log(`❌ Role assignment error: ${error.message}`);
        }
    }

    async verifyAccounts() {
        console.log('🔍 FINAL ACCOUNT VERIFICATION');
        console.log('────────────────────────────────────────────────────────────');

        const emails = ['gabosoto@be-productive.app', 'gabotico82@gmail.com'];

        for (const email of emails) {
            try {
                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (profile) {
                    console.log(`✅ ${email}:`);
                    console.log(`   - Role: ${profile.role}`);
                    console.log(`   - Name: ${profile.full_name}`);
                    console.log(`   - Onboarding: ${profile.onboarding_completed ? 'Complete' : 'Pending'}`);
                } else {
                    console.log(`❌ ${email}: Profile not found`);
                }
            } catch (error) {
                console.log(`❌ ${email}: Verification failed`);
            }
        }

        console.log('\n🎉 Account creation process complete!');
        console.log('📝 You can now test login at: https://be-productive.app/login');
    }
}

// Run account creation
const creator = new UserAccountCreator();
creator.createUserAccounts().catch(console.error);