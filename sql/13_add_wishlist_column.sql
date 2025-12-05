-- ADD WISHLIST COLUMN TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wishlist JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS allows update (already covered by "Admin all profiles" or "Users can update own profile", but let's be safe)
-- We rely on the existing "Users can update own profile" or the comprehensive "Admin all profiles" policy.
-- If "Users can update own profile" is missing for some reason, we add it here specifically for wishlist if needed, 
-- but usually the general update policy covers it.

-- Re-verify/Add generic update policy for users if not present from previous scripts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END
$$;
