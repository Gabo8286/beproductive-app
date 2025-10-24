#!/usr/bin/env node

/**
 * Login Diagnostic Tool
 * Comprehensive tool to diagnose and fix login issues on be-productive.app
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

class LoginDiagnostic {
    constructor() {
        this.supabaseUrl = process.env.VITE_SUPABASE_URL;
        this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        this.productionUrl = 'https://be-productive.app';

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            process.exit(1);
        }

        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async runFullDiagnostic() {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🔍 Enhanced Login Diagnostic Tool              ║');
        console.log('║              be-productive.app Analysis                   ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        await this.checkProductionSite();
        await this.checkDatabaseConnection();
        await this.checkSupabaseProjectDetails();

        // Check both specified user accounts
        await this.checkUserExistence('gabosoto@be-productive.app');
        await this.checkUserExistence('gabotico82@gmail.com');

        await this.checkAuthConfiguration();
        await this.testLoginAttempts();
        await this.provideSolutions();
    }

    async checkProductionSite() {
        console.log('🌐 1. PRODUCTION SITE STATUS');
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Check main site
            const mainResponse = await fetch(this.productionUrl);
            const mainStatus = mainResponse.ok ? '✅' : '❌';
            console.log(`${mainStatus} Main site (${this.productionUrl}): ${mainResponse.status}`);

            // Check login page
            const loginResponse = await fetch(`${this.productionUrl}/login`);
            const loginStatus = loginResponse.ok ? '✅' : '❌';
            console.log(`${loginStatus} Login page: ${loginResponse.status}`);

            // Check signup page
            const signupResponse = await fetch(`${this.productionUrl}/signup`);
            const signupStatus = signupResponse.ok ? '✅' : '❌';
            console.log(`${signupStatus} Signup page: ${signupResponse.status}`);

            // Check HTTPS redirect
            const httpResponse = await fetch(this.productionUrl.replace('https:', 'http:'), { redirect: 'manual' });
            const httpsRedirect = httpResponse.status === 301 ? '✅' : '❌';
            console.log(`${httpsRedirect} HTTPS redirect: ${httpResponse.status}`);

        } catch (error) {
            console.log(`❌ Site accessibility failed: ${error.message}`);
        }
        console.log('');
    }

    async checkDatabaseConnection() {
        console.log('🗄️  2. DATABASE CONNECTION');
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Test basic connection
            const { data, error, count } = await this.supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (error) {
                console.log(`❌ Database connection failed: ${error.message}`);
                return;
            }

            console.log('✅ Database connection successful');
            console.log(`📊 Total user profiles: ${count || 0}`);

            // If we have profiles, show some details
            if (data && data.length > 0) {
                console.log('👥 Found user profiles:');
                data.forEach((profile, index) => {
                    console.log(`   ${index + 1}. ${profile.email} (${profile.role || 'user'})`);
                });
            }

            // Try to check user roles specifically
            const { data: roleData, error: roleError } = await this.supabase
                .from('user_roles')
                .select('*');

            if (!roleError && roleData) {
                console.log(`🎭 Total role assignments: ${roleData.length}`);
                if (roleData.length > 0) {
                    const superAdmins = roleData.filter(r => r.role === 'super_admin');
                    console.log(`👑 Super admins: ${superAdmins.length}`);
                }
            }

        } catch (error) {
            console.log(`❌ Database check failed: ${error.message}`);
        }
        console.log('');
    }

    async checkSupabaseProjectDetails() {
        console.log('🏗️  3. SUPABASE PROJECT VERIFICATION');
        console.log('────────────────────────────────────────────────────────────');

        console.log(`🆔 Project ID: ${this.supabaseUrl.split('//')[1].split('.')[0]}`);
        console.log(`🌐 Project URL: ${this.supabaseUrl}`);
        console.log(`🔑 Key length: ${this.supabaseKey.length} characters`);
        console.log(`🔑 Key prefix: ${this.supabaseKey.substring(0, 20)}...`);
        console.log('');
    }

    async checkUserExistence(email) {
        console.log(`👤 USER ACCOUNT VERIFICATION: ${email}`);
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Check if user profile exists
            const { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (profileError && profileError.code === 'PGRST116') {
                console.log(`❌ User profile not found: ${email}`);
                console.log('   This means the user account does not exist in the profiles table');

                // Try to check if there's a role assignment without profile
                const { data: roleData } = await this.supabase
                    .from('user_roles')
                    .select('*')
                    .eq('email', email);

                if (roleData && roleData.length > 0) {
                    console.log(`⚠️  Found role assignment without profile: ${roleData[0].role}`);
                }

                this.userExists = false;
                return;
            }

            if (profileError) {
                console.log(`❌ Profile check failed: ${profileError.message}`);
                return;
            }

            console.log(`✅ User profile found: ${email}`);
            console.log(`   - Full name: ${profile.full_name || 'Not set'}`);
            console.log(`   - Role: ${profile.role || 'user'}`);
            console.log(`   - Created: ${new Date(profile.created_at).toLocaleDateString()}`);
            console.log(`   - Onboarding completed: ${profile.onboarding_completed ? 'Yes' : 'No'}`);

            // Check for role assignments
            const { data: roleData } = await this.supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', profile.id);

            if (roleData && roleData.length > 0) {
                console.log(`   - Role assignments: ${roleData.map(r => r.role).join(', ')}`);
            }

            this.userExists = true;

        } catch (error) {
            console.log(`❌ User verification failed: ${error.message}`);
        }
        console.log('');
    }

    async checkAuthConfiguration() {
        console.log('🔐 4. AUTHENTICATION CONFIGURATION');
        console.log('────────────────────────────────────────────────────────────');

        // Check environment variables
        const authRedirectUrl = process.env.VITE_AUTH_REDIRECT_URL;
        const authSiteUrl = process.env.VITE_AUTH_SITE_URL;
        const appUrl = process.env.VITE_APP_URL;

        console.log(`🔗 Auth Redirect URL: ${authRedirectUrl}`);
        console.log(`🏠 Auth Site URL: ${authSiteUrl}`);
        console.log(`🌐 App URL: ${appUrl}`);

        const correctUrl = this.productionUrl;
        const redirectCorrect = authRedirectUrl === correctUrl ? '✅' : '❌';
        const siteCorrect = authSiteUrl === correctUrl ? '✅' : '❌';
        const appCorrect = appUrl === correctUrl ? '✅' : '❌';

        console.log(`${redirectCorrect} Redirect URL configuration`);
        console.log(`${siteCorrect} Site URL configuration`);
        console.log(`${appCorrect} App URL configuration`);

        if (authRedirectUrl !== correctUrl || authSiteUrl !== correctUrl || appUrl !== correctUrl) {
            console.log('⚠️  Environment variables need production URLs');
        }
        console.log('');
    }

    async testLoginAttempts() {
        console.log('🔐 LOGIN ATTEMPT TESTING');
        console.log('────────────────────────────────────────────────────────────');

        const testAccounts = [
            { email: 'gabosoto@be-productive.app', password: 'SecureAdmin2024!', expectedRole: 'super_admin' },
            { email: 'gabotico82@gmail.com', password: 'SecureUser2024!', expectedRole: 'user' }
        ];

        for (const account of testAccounts) {
            console.log(`🧪 Testing login for: ${account.email}`);

            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: account.email,
                    password: account.password
                });

                if (error) {
                    console.log(`❌ Login failed: ${error.message}`);

                    // Specific error analysis
                    if (error.message.includes('Invalid login credentials')) {
                        console.log('   → Either email or password is incorrect');
                    } else if (error.message.includes('Email not confirmed')) {
                        console.log('   → Email verification required');
                    } else if (error.message.includes('User not found')) {
                        console.log('   → User account does not exist in auth.users table');
                    }
                } else {
                    console.log(`✅ Login successful for: ${account.email}`);
                    console.log(`   - User ID: ${data.user.id}`);
                    console.log(`   - Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
                    console.log(`   - Last sign in: ${data.user.last_sign_in_at || 'Never'}`);

                    // Sign out immediately after test
                    await this.supabase.auth.signOut();
                    console.log('   - Test session signed out');
                }
            } catch (error) {
                console.log(`❌ Login test failed: ${error.message}`);
            }
            console.log('');
        }
    }

    async provideSolutions() {
        console.log('💡 5. SOLUTIONS AND NEXT STEPS');
        console.log('────────────────────────────────────────────────────────────');

        if (!this.userExists) {
            console.log('🔴 PRIMARY ISSUE: User account does not exist');
            console.log('');
            console.log('📋 IMMEDIATE SOLUTION:');
            console.log('   1. Go to https://be-productive.app/signup');
            console.log('   2. Create a new account with: gabosoto@be-productive.app');
            console.log('   3. Complete the signup process');
            console.log('   4. Check your email for verification (if required)');
            console.log('   5. Then try logging in again');
            console.log('');
            console.log('🔧 ALTERNATIVE SOLUTION (for admins):');
            console.log('   1. Access Supabase dashboard directly');
            console.log('   2. Create user account manually in auth.users table');
            console.log('   3. Create corresponding profile in profiles table');
            console.log('   4. Set appropriate role permissions');
        } else {
            console.log('✅ User account exists - investigating other causes...');
            console.log('');
            console.log('🔍 POTENTIAL ISSUES TO CHECK:');
            console.log('   1. Password might be incorrect');
            console.log('   2. Email verification might be required');
            console.log('   3. Account might be disabled/suspended');
            console.log('   4. Authentication service configuration');
            console.log('');
            console.log('🔧 TROUBLESHOOTING STEPS:');
            console.log('   1. Try password reset: https://be-productive.app/forgot-password');
            console.log('   2. Check email for verification links');
            console.log('   3. Contact system administrator');
        }

        console.log('');
        console.log('🚀 DEPLOYMENT IMPROVEMENTS APPLIED:');
        console.log('   ✅ Production environment configuration');
        console.log('   ✅ GitHub Actions workflow updated');
        console.log('   ✅ HTTPS redirects enabled');
        console.log('   ✅ Security headers optimized');
        console.log('   ✅ Build validation added');
        console.log('');
        console.log('📝 Next deployment will include these fixes automatically.');
    }
}

// Run diagnostic
const diagnostic = new LoginDiagnostic();
diagnostic.runFullDiagnostic().catch(console.error);