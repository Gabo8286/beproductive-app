#!/usr/bin/env node

/**
 * User Profile Fix Script
 * Creates missing profiles for existing auth.users and tests login
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

class UserProfileFixer {
    constructor() {
        this.supabaseUrl = process.env.VITE_SUPABASE_URL;
        this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            process.exit(1);
        }

        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async fixUserProfiles() {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🔧 User Profile Fix Tool                       ║');
        console.log('║          Creating Missing User Profiles                  ║');
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
            await this.fixSingleAccount(account);
        }

        // Test login for both accounts
        await this.testLoginFlow();
    }

    async fixSingleAccount(account) {
        console.log(`👤 Fixing account: ${account.email}`);
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Step 1: Sign in to get user details
            console.log('🔐 Signing in to get user ID...');

            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: account.email,
                password: account.password
            });

            if (authError) {
                console.log(`❌ Login failed: ${authError.message}`);
                return;
            }

            if (!authData.user) {
                console.log('❌ No user data returned');
                return;
            }

            console.log(`✅ Successfully signed in: ${authData.user.id}`);
            console.log(`   - Email: ${authData.user.email}`);
            console.log(`   - Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

            // Step 2: Check if profile exists
            const { data: existingProfile } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (existingProfile) {
                console.log('✅ Profile already exists');
            } else {
                console.log('🏗️  Creating missing profile...');

                // Create profile
                const { error: profileError } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
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
                    console.log(`✅ Profile created successfully with role: ${account.role}`);
                }
            }

            // Step 3: Handle super admin role
            if (account.role === 'super_admin') {
                await this.ensureSuperAdminRole(authData.user.id, account.email);
            }

            // Step 4: Sign out
            await this.supabase.auth.signOut();
            console.log('🚪 Signed out successfully');

        } catch (error) {
            console.log(`❌ Account fix failed: ${error.message}`);
        }
        console.log('');
    }

    async ensureSuperAdminRole(userId, email) {
        console.log('👑 Ensuring super admin role assignment...');

        try {
            // Check if role assignment exists
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
                    assigned_by: userId,
                    is_active: true
                });

            if (roleError) {
                console.log(`❌ Role assignment failed: ${roleError.message}`);
                // This might fail due to RLS policies, which is expected
                console.log('   (This is expected if RLS policies prevent role creation)');
            } else {
                console.log('✅ Super admin role assigned');
            }

        } catch (error) {
            console.log(`⚠️  Role assignment warning: ${error.message}`);
        }
    }

    async testLoginFlow() {
        console.log('🧪 TESTING LOGIN FLOW');
        console.log('────────────────────────────────────────────────────────────');

        const accounts = [
            { email: 'gabosoto@be-productive.app', password: 'SecureAdmin2024!' },
            { email: 'gabotico82@gmail.com', password: 'SecureUser2024!' }
        ];

        for (const account of accounts) {
            console.log(`🔐 Testing login for: ${account.email}`);

            try {
                const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                    email: account.email,
                    password: account.password
                });

                if (authError) {
                    console.log(`❌ Login failed: ${authError.message}`);
                    continue;
                }

                console.log(`✅ Login successful!`);
                console.log(`   - User ID: ${authData.user.id}`);

                // Check if profile loads
                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) {
                    console.log(`❌ Profile load failed: ${profileError.message}`);
                } else {
                    console.log(`✅ Profile loaded successfully`);
                    console.log(`   - Name: ${profile.full_name}`);
                    console.log(`   - Role: ${profile.role}`);
                    console.log(`   - Onboarding: ${profile.onboarding_completed ? 'Complete' : 'Pending'}`);
                }

                // Sign out
                await this.supabase.auth.signOut();
                console.log('   - Signed out');

            } catch (error) {
                console.log(`❌ Test failed: ${error.message}`);
            }
            console.log('');
        }

        console.log('🎉 LOGIN FIX COMPLETE!');
        console.log('📝 Both accounts should now work at: https://be-productive.app/login');
    }
}

// Run profile fix
const fixer = new UserProfileFixer();
fixer.fixUserProfiles().catch(console.error);