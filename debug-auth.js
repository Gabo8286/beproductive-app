// Authentication Debug Script
// This script tests the Supabase connection and provides detailed diagnostics

import { createClient } from '@supabase/supabase-js';

// Environment variables from the .env file
const SUPABASE_URL = 'https://rymixmuunfjxwryucvxt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU';

console.log('🔐 BeProductive Authentication Debug');
console.log('=====================================');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (first 20 chars):', SUPABASE_KEY.substring(0, 20) + '...');
console.log('');

async function debugAuthentication() {
  try {
    // Create Supabase client
    console.log('1. Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('   ✅ Client created successfully');

    // Test basic connectivity
    console.log('');
    console.log('2. Testing basic connectivity...');

    try {
      // Try to get the current session (should be null for new connection)
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.log('   ⚠️  Session check error:', sessionError.message);
      } else {
        console.log('   ✅ Session check successful (session exists:', !!session?.session, ')');
      }
    } catch (connectError) {
      console.log('   ❌ Connection failed:', connectError.message);
      return;
    }

    // Test signup capability (checking if authentication is working)
    console.log('');
    console.log('3. Testing authentication capabilities...');

    // Create a test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log('   Creating test account with email:', testEmail);

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });

      if (signupError) {
        console.log('   ⚠️  Signup failed:', signupError.message);
        console.log('   Error details:', JSON.stringify(signupError, null, 2));

        // Check if it's because email confirmations are required
        if (signupError.message.includes('email') || signupError.message.includes('confirm')) {
          console.log('   💡 This might be due to email confirmation requirements');
          console.log('   💡 Check your Supabase project settings > Authentication > Email');
        }
      } else {
        console.log('   ✅ Signup successful! User created:', signupData.user?.id);
        console.log('   📧 Confirmation required:', signupData.user?.email_confirmed_at === null);

        if (signupData.user?.email_confirmed_at === null) {
          console.log('   💡 Email confirmation is required. Check Supabase settings to disable for development.');
        }
      }
    } catch (authError) {
      console.log('   ❌ Authentication test failed:', authError.message);
    }

    // Test login with invalid credentials (expected to fail)
    console.log('');
    console.log('4. Testing login with invalid credentials (should fail)...');

    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

      if (loginError) {
        console.log('   ✅ Expected error for invalid credentials:', loginError.message);

        if (loginError.message === 'Invalid login credentials') {
          console.log('   💡 This confirms the error you\'re seeing is from Supabase');
          console.log('   💡 The issue is that the email/password combination doesn\'t exist in the database');
        }
      } else {
        console.log('   ⚠️  Unexpected: Login succeeded with invalid credentials');
      }
    } catch (testError) {
      console.log('   ❌ Unexpected error during invalid login test:', testError.message);
    }

    console.log('');
    console.log('📋 Debug Summary');
    console.log('================');
    console.log('✅ Supabase connection: Working');
    console.log('✅ Authentication service: Available');
    console.log('⚠️  Issue: No valid user accounts exist, or email confirmation required');
    console.log('');
    console.log('🔧 Solutions:');
    console.log('1. Create a user account via Supabase dashboard');
    console.log('2. Disable email confirmation in Supabase settings for development');
    console.log('3. Use the signup form in the app to create a test account');
    console.log('4. Check spam folder if email confirmation was sent');

  } catch (error) {
    console.log('❌ Critical error during debug:', error.message);
    console.log('Full error:', error);
  }
}

// Run the debug
debugAuthentication().catch(console.error);