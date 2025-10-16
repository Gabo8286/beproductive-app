-- Add super_admin role to user 4552ac05-c73e-45e5-b44d-eb8ac66993e4
INSERT INTO public.user_roles (user_id, role)
VALUES ('4552ac05-c73e-45e5-b44d-eb8ac66993e4', 'super_admin'::user_role)
ON CONFLICT (user_id, role) DO NOTHING;