-- =====================================================
-- STEP 3: Test the Setup (Run this third)
-- =====================================================

-- Test if functions exist
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'assign_initial_super_admin' AND routine_schema = 'public')
        THEN '✅ assign_initial_super_admin function exists'
        ELSE '❌ assign_initial_super_admin function missing'
    END as function_check_1,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'assign_super_admin_role' AND routine_schema = 'public')
        THEN '✅ assign_super_admin_role function exists'
        ELSE '❌ assign_super_admin_role function missing'
    END as function_check_2,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_roles' AND routine_schema = 'public')
        THEN '✅ get_user_roles function exists'
        ELSE '❌ get_user_roles function missing'
    END as function_check_3;

-- Test if tables exist
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_signups' AND table_schema = 'public')
        THEN '✅ beta_signups table exists'
        ELSE '❌ beta_signups table missing'
    END as table_check_1,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_invitations' AND table_schema = 'public')
        THEN '✅ beta_invitations table exists'
        ELSE '❌ beta_invitations table missing'
    END as table_check_2,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public')
        THEN '✅ user_roles table exists'
        ELSE '❌ user_roles table missing - this is needed for super admin functions'
    END as table_check_3;

-- Check current user
SELECT
    auth.uid() as current_user_id,
    CASE
        WHEN auth.uid() IS NOT NULL
        THEN '✅ User is authenticated'
        ELSE '❌ No authenticated user'
    END as auth_status;

-- If user_roles table exists, check for existing super admins
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public')
        THEN (
            SELECT
                CASE
                    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin')
                    THEN '⚠️ Super admin already exists'
                    ELSE '✅ Ready for initial super admin assignment'
                END
        )
        ELSE '❌ user_roles table missing'
    END as super_admin_status;

SELECT 'Step 3 Complete: Setup verification finished!' as result;