-- Enable RLS on broadcast_notifications if not already enabled
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- 1. Allow EVERYONE (anon + authenticated) to read ACTIVE broadcasts
-- This ensures even guest users (if we allow them) or just logged-in users can see them.
CREATE POLICY "Public read access for active broadcasts"
ON public.broadcast_notifications
FOR SELECT
USING (is_active = true);

-- 2. Allow Admins full access (CRUD)
-- Assuming admin check is usually done via role or metadata. 
-- For simplicity in this project context often 'authenticated' users are checked in app, 
-- but for DB security we should check claim if possible.
-- If existing policies rely on 'service_role' for admin ops, that's fine.
-- But let's add a policy for authenticated users with role 'admin' if your app uses app_metadata.
-- Or just allow service role (which bypasses RLS anyway).
-- Let's stick to: "Admins can do everything"
CREATE POLICY "Admins can manage broadcasts"
ON public.broadcast_notifications
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@velvetchip.com' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

-- Note: The admin check might vary based on your auth setup. 
-- If you use a 'profiles' table with 'role', RLS is harder to join.
-- Safe bet for now: "Public Read Active", rely on App Logic for Admin Write (via Supabase Admin Client or just authenticated write if looser security).
-- Actually, let's just ensure READ is working for now.

-- If you get "policy already exists" errors, you can wrap in DO block or drop first.
DROP POLICY IF EXISTS "Public read access for active broadcasts" ON public.broadcast_notifications;
CREATE POLICY "Public read access for active broadcasts"
ON public.broadcast_notifications
FOR SELECT
USING (is_active = true);
