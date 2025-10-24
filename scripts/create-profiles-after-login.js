#!/usr/bin/env node

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
            console.log(`👤 Processing: ${account.email}`);

            try {
                // Sign in
                const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                    email: account.email,
                    password: account.password
                });

                if (authError) {
                    console.log(`❌ Login failed: ${authError.message}`);
                    continue;
                }

                console.log(`✅ Login successful: ${authData.user.id}`);

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
                    console.log(`✅ Profile created with role: ${account.role}`);
                }

                // Sign out
                await this.supabase.auth.signOut();

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }

        console.log('🎉 Profile creation complete!');
    }
}

new ProfileCreator().createProfiles().catch(console.error);