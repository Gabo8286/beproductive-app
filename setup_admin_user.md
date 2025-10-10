# Setting Up Super Admin User for gabotico82@gmail.com

## Option 1: If User Already Exists (Recommended)

If you've already signed up with gabotico82@gmail.com, run this in Supabase SQL Editor:

```sql
-- Find and update the user to admin
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'gabotico82@gmail.com'
    LIMIT 1;

    IF user_id IS NOT NULL THEN
        -- Update profile to admin
        UPDATE public.profiles
        SET
            role = 'admin',
            onboarding_completed = true,
            updated_at = now()
        WHERE id = user_id;

        RAISE NOTICE 'User gabotico82@gmail.com has been granted admin privileges';
    ELSE
        RAISE NOTICE 'User not found. Please sign up first.';
    END IF;
END $$;
```

## Option 2: Create User via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rymixmuunfjxwryucvxt
2. Navigate to **Authentication** → **Users**
3. Click **"Invite User"** or **"Add User"**
4. Enter:
   - Email: `gabotico82@gmail.com`
   - Password: (set a secure password)
   - Click **"Send Invitation"** or **"Create User"**

5. After user is created, go to **SQL Editor** and run:

```sql
-- Grant admin privileges to the newly created user
UPDATE public.profiles
SET
    role = 'admin',
    full_name = 'Gabriel Soto',
    onboarding_completed = true
WHERE email = 'gabotico82@gmail.com';
```

## Option 3: Using Supabase Client (JavaScript)

If you want to create the user programmatically, you can use this code:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rymixmuunfjxwryucvxt.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Use service role key for admin operations
)

// Create user
const { data, error } = await supabase.auth.admin.createUser({
  email: 'gabotico82@gmail.com',
  password: 'your-secure-password',
  email_confirm: true,
  user_metadata: {
    full_name: 'Gabriel Soto'
  }
})

if (!error && data.user) {
  // Update profile to admin
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      email: 'gabotico82@gmail.com',
      full_name: 'Gabriel Soto',
      role: 'admin',
      onboarding_completed: true
    })

  if (!profileError) {
    console.log('Super admin user created successfully!')
  }
}
```

## Option 4: Direct Database Access (If you have direct PostgreSQL access)

```bash
# Connect to your database
psql "postgresql://postgres:your-password@db.rymixmuunfjxwryucvxt.supabase.co:6543/postgres"

# Run the SQL script
\i create_super_admin.sql
```

## Verify Admin Access

After setting up, verify the admin user:

```sql
SELECT
    p.*,
    CASE WHEN p.role = 'admin' THEN '✅ Admin' ELSE '❌ Not Admin' END as status
FROM public.profiles p
WHERE p.email = 'gabotico82@gmail.com';
```

## Testing Admin Access

1. Sign in to the app with gabotico82@gmail.com
2. You should have access to all admin features
3. Check the browser console for confirmation of admin role

## Troubleshooting

If you encounter issues:

1. **User not found**: Sign up through the app first, then run the update script
2. **Permission denied**: Make sure you're using the Supabase Dashboard SQL editor with proper permissions
3. **Profile not created**: The app should auto-create profiles on sign-up via a trigger

## Security Notes

- Keep your admin credentials secure
- Consider using 2FA for the admin account
- Regularly audit admin access logs
- The service role key should never be exposed in client-side code