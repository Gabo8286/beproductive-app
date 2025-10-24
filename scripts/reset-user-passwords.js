#!/usr/bin/env node

/**
 * User Password Reset Script
 * Resets passwords for existing users and creates missing profiles
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

class UserPasswordResetter {
    constructor() {
        this.supabaseUrl = process.env.VITE_SUPABASE_URL;
        this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            process.exit(1);
        }

        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async resetPasswords() {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🔑 User Password Reset Tool                    ║');
        console.log('║       Resetting Passwords for Existing Users             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const accounts = [
            {
                email: 'gabosoto@be-productive.app',
                newPassword: 'SecureAdmin2024!',
                fullName: 'Gabriel Soto Morales',
                role: 'super_admin'
            },
            {
                email: 'gabotico82@gmail.com',
                newPassword: 'SecureUser2024!',
                fullName: 'Gabriel Soto',
                role: 'user'
            }
        ];

        for (const account of accounts) {
            await this.resetSingleAccount(account);
        }

        // Test the new passwords
        await this.testNewPasswords();
    }

    async resetSingleAccount(account) {
        console.log(`🔑 Resetting password for: ${account.email}`);
        console.log('────────────────────────────────────────────────────────────');

        try {
            // Step 1: Send password reset email
            console.log('📧 Sending password reset email...');

            const { error: resetError } = await this.supabase.auth.resetPasswordForEmail(
                account.email,
                {
                    redirectTo: 'https://be-productive.app/reset-password',
                }
            );

            if (resetError) {
                console.log(`❌ Password reset email failed: ${resetError.message}`);
            } else {
                console.log(`✅ Password reset email sent to: ${account.email}`);
                console.log('   📝 Check your email for the reset link');
            }

            // Step 2: Try to access the account via manual profile creation
            console.log('🏗️  Attempting to create profile for this user...');
            await this.createProfileForExistingUser(account);

        } catch (error) {
            console.log(`❌ Password reset failed: ${error.message}`);
        }
        console.log('');
    }

    async createProfileForExistingUser(account) {
        try {
            // Since we can't directly access auth.users with anon key,
            // we'll try a different approach by monitoring the profiles table

            console.log('⚠️  Note: Profile creation requires user to sign in first');
            console.log('   After password reset, user needs to:');
            console.log('   1. Click the reset link in email');
            console.log(`   2. Set new password to: ${account.newPassword}`);
            console.log('   3. Sign in to trigger profile creation');

        } catch (error) {
            console.log(`❌ Profile setup failed: ${error.message}`);
        }
    }

    async testNewPasswords() {
        console.log('🧪 TESTING INSTRUCTIONS');
        console.log('────────────────────────────────────────────────────────────');

        console.log('📋 Manual Testing Steps:');
        console.log('');

        console.log('1. 📧 Check email for password reset links');
        console.log('2. 🔑 Click reset links and set these passwords:');
        console.log('   - gabosoto@be-productive.app → SecureAdmin2024!');
        console.log('   - gabotico82@gmail.com → SecureUser2024!');
        console.log('');

        console.log('3. 🌐 Test login at: https://be-productive.app/login');
        console.log('');

        console.log('4. 🔍 If login works but shows errors:');
        console.log('   - This means profile creation is needed');
        console.log('   - Run: node scripts/create-profiles-after-login.js');
        console.log('');

        // Create the follow-up script
        await this.createFollowUpScript();

        console.log('✅ Password reset process initiated!');
        console.log('📧 Check your email and follow the instructions above.');
    }

    async createFollowUpScript() {
        const followUpScript = `#!/usr/bin/env node

/**
 * Profile Creation Follow-up Script
 * Run this after users have reset their passwords and can sign in
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

class ProfileCreator {
    constructor() {
        this.supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );
    }

    async createProfiles() {
        console.log('🏗️  Creating profiles for authenticated users...');

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
            console.log(\`👤 Processing: \${account.email}\`);

            try {
                // Sign in
                const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                    email: account.email,
                    password: account.password
                });

                if (authError) {
                    console.log(\`❌ Login failed: \${authError.message}\`);
                    continue;
                }

                console.log(\`✅ Login successful: \${authData.user.id}\`);

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
                    console.log(\`❌ Profile creation failed: \${profileError.message}\`);
                } else {
                    console.log(\`✅ Profile created with role: \${account.role}\`);
                }

                // Sign out
                await this.supabase.auth.signOut();

            } catch (error) {
                console.log(\`❌ Error: \${error.message}\`);
            }
        }

        console.log('🎉 Profile creation complete!');
    }
}

new ProfileCreator().createProfiles().catch(console.error);`;

        // Write the follow-up script
        const fs = await import('fs');
        fs.writeFileSync('scripts/create-profiles-after-login.js', followUpScript);
        console.log('📝 Created follow-up script: scripts/create-profiles-after-login.js');
    }
}

// Run password reset
const resetter = new UserPasswordResetter();
resetter.resetPasswords().catch(console.error);