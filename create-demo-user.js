// Create Demo User Script
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rymixmuunfjxwryucvxt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bWl4bXV1bmZqeHdyeXVjdnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzA4NjUsImV4cCI6MjA3NDg0Njg2NX0.TENbnWnRA8Ik5aKmgit4d8-CYjlD1uNNNZwzEPclPlU';

// Demo user credentials
const DEMO_EMAIL = 'demo@beproductive.com';
const DEMO_PASSWORD = 'DemoPassword123!';

console.log('🚀 Creating Demo User for BeProductive');
console.log('====================================');

async function createDemoUser() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    console.log('Creating demo user account...');
    console.log('Email:', DEMO_EMAIL);
    console.log('Password:', DEMO_PASSWORD);
    console.log('');

    const { data, error } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          full_name: 'Gabriel Soto Morales',
          display_name: 'Gabriel',
          role: 'AI App Entrepreneur',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Demo user already exists!');
        console.log('');
        console.log('🔑 Login Credentials:');
        console.log('Email: ' + DEMO_EMAIL);
        console.log('Password: ' + DEMO_PASSWORD);
        console.log('');
        console.log('You can now use these credentials to log into the app at:');
        console.log('http://localhost:8081/login');
      } else {
        console.log('❌ Error creating demo user:', error.message);
      }
    } else {
      console.log('✅ Demo user created successfully!');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at !== null);
      console.log('');
      console.log('🔑 Login Credentials:');
      console.log('Email: ' + DEMO_EMAIL);
      console.log('Password: ' + DEMO_PASSWORD);
      console.log('');
      console.log('You can now use these credentials to log into the app at:');
      console.log('http://localhost:8081/login');
    }

    // Test login with the demo credentials
    console.log('');
    console.log('🧪 Testing login with demo credentials...');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('User authenticated:', loginData.user?.email);

      // Sign out to clean up
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

createDemoUser().catch(console.error);