#!/usr/bin/env node

/**
 * Fresh Account Creation Script
 * Creates user accounts from scratch with detailed error handling
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

class FreshAccountCreator {
    constructor() {
        this.supabaseUrl = process.env.VITE_SUPABASE_URL;
        this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            process.exit(1);
        }

        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async createAccounts() {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🆕 Fresh Account Creation Tool                 ║');
        console.log('║         Creating Accounts from Scratch                   ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // Check current database state first
        await this.checkDatabaseState();

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
            await this.createAccountFresh(account);
        }

        // Final verification
        await this.verifyAllAccounts();
    }

    async checkDatabaseState() {
        console.log('🔍 CHECKING CURRENT DATABASE STATE');
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Check profiles table
            const { data: profiles, error: profilesError, count } = await this.supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (profilesError) {
                console.log(`❌ Profiles check failed: ${profilesError.message}`);
            } else {
                console.log(`📊 Total profiles: ${count || 0}`);
                if (profiles && profiles.length > 0) {
                    profiles.forEach((profile, index) => {
                        console.log(`   ${index + 1}. ${profile.email} (${profile.role})`);
                    });
                }
            }

            // Check user_roles table
            const { data: roles, error: rolesError } = await this.supabase
                .from('user_roles')
                .select('*');

            if (!rolesError && roles) {
                console.log(`🎭 Total role assignments: ${roles.length}`);
            }

        } catch (error) {
            console.log(`❌ Database state check failed: ${error.message}`);
        }
        console.log('');
    }

    async createAccountFresh(account) {
        console.log(`👤 Creating fresh account: ${account.email}`);
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Step 1: Attempt to sign up
            console.log('🔐 Attempting user signup...');

            const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
                email: account.email,
                password: account.password,
                options: {
                    data: {
                        full_name: account.fullName,
                    },
                    emailRedirectTo: 'https://be-productive.app/auth/callback'
                }
            });

            console.log('📋 Signup response details:');
            console.log(`   - Error: ${signUpError ? signUpError.message : 'None'}`);
            console.log(`   - User created: ${signUpData.user ? 'Yes' : 'No'}`);
            console.log(`   - Session: ${signUpData.session ? 'Yes' : 'No'}`);

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    console.log('⚠️  User already exists, attempting to sign in...');
                    await this.handleExistingUser(account);
                } else {
                    console.log(`❌ Signup failed: ${signUpError.message}`);
                }
                return;
            }

            if (signUpData.user) {
                console.log(`✅ User created successfully!`);
                console.log(`   - User ID: ${signUpData.user.id}`);
                console.log(`   - Email: ${signUpData.user.email}`);
                console.log(`   - Email confirmed: ${signUpData.user.email_confirmed_at ? 'Yes' : 'No'}`);

                // Create profile manually (trigger might not work)
                await this.createProfileManually(signUpData.user, account);

                // Handle super admin role
                if (account.role === 'super_admin') {
                    await this.createSuperAdminRole(signUpData.user.id, account.email);
                }

                // Sign out
                if (signUpData.session) {
                    await this.supabase.auth.signOut();
                }
            }

        } catch (error) {
            console.log(`❌ Account creation failed: ${error.message}`);
            console.log(`   Stack: ${error.stack}`);
        }
        console.log('');
    }

    async handleExistingUser(account) {
        console.log('🔍 Handling existing user...');

        try {
            // Try to sign in
            const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
                email: account.email,
                password: account.password
            });

            if (signInError) {
                console.log(`❌ Existing user sign in failed: ${signInError.message}`);
                console.log('   → Password might be different or account might not exist');
                return;
            }

            if (signInData.user) {
                console.log(`✅ Existing user signed in: ${signInData.user.id}`);

                // Check/create profile
                await this.createProfileManually(signInData.user, account);

                // Handle super admin role
                if (account.role === 'super_admin') {
                    await this.createSuperAdminRole(signInData.user.id, account.email);
                }

                // Sign out
                await this.supabase.auth.signOut();
            }

        } catch (error) {
            console.log(`❌ Existing user handling failed: ${error.message}`);
        }
    }

    async createProfileManually(user, account) {
        console.log('👤 Creating profile...');

        try {
            // Check if profile exists
            const { data: existingProfile } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (existingProfile) {
                console.log('✅ Profile already exists');
                return;
            }

            // Create profile
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
                console.log(`   Code: ${profileError.code}`);
                console.log(`   Details: ${profileError.details}`);
            } else {
                console.log(`✅ Profile created with role: ${account.role}`);
            }

        } catch (error) {
            console.log(`❌ Profile creation error: ${error.message}`);
        }
    }

    async createSuperAdminRole(userId, email) {
        console.log('👑 Creating super admin role...');

        try {
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
                console.log(`⚠️  Role creation warning: ${roleError.message}`);
                console.log('   (This may fail due to RLS policies - check Supabase dashboard)');
            } else {
                console.log('✅ Super admin role created');
            }

        } catch (error) {
            console.log(`⚠️  Role creation warning: ${error.message}`);
        }
    }

    async verifyAllAccounts() {
        console.log('🔍 FINAL VERIFICATION');
        console.log('────────────────────────────────────────────────────────────');

        const emails = ['gabosoto@be-productive.app', 'gabotico82@gmail.com'];
        const passwords = ['SecureAdmin2024!', 'SecureUser2024!'];

        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const password = passwords[i];

            console.log(`🧪 Testing: ${email}`);

            // Test login
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.log(`❌ Login test failed: ${authError.message}`);
            } else {
                console.log(`✅ Login successful`);

                // Check profile
                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (profile) {
                    console.log(`✅ Profile found: ${profile.role}`);
                } else {
                    console.log(`❌ Profile missing`);
                }

                // Sign out
                await this.supabase.auth.signOut();
            }
            console.log('');
        }

        console.log('🎉 ACCOUNT CREATION COMPLETE!');
        console.log('📝 Test login at: https://be-productive.app/login');
    }
}

// Run fresh account creation
const creator = new FreshAccountCreator();
creator.createAccounts().catch(console.error);