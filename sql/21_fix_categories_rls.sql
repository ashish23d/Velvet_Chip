-- COMPREHENSIVE CATEGORIES FIX
-- This checks and fixes ALL issues with category updates

-- ============================================
-- PART 1: Diagnostic Checks
-- ============================================

-- Check 1: Is your user an admin?
SELECT id, email, role 
FROM profiles 
WHERE id = auth.uid();
-- Expected: role should be 'admin'

-- Check 2: Does the category exist?
SELECT id, name 
FROM categories 
WHERE id = 'layered-rainbow-smoothie';
-- Expected: Should return the category

-- Check 3: Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd, policyname;

-- ============================================
-- PART 2: Fix RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin can update categories" ON categories;
DROP POLICY IF EXISTS "Admin update categories" ON categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin insert categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;
DROP POLICY IF EXISTS "Admin delete categories" ON categories;
DROP POLICY IF EXISTS "Admins update categories" ON categories;
DROP POLICY IF EXISTS "Admins insert categories" ON categories;
DROP POLICY IF EXISTS "Admins delete categories" ON categories;

-- Create new policies

-- 1. Allow everyone to READ categories
CREATE POLICY "Public can read categories"
ON categories FOR SELECT
USING (true);

-- 2. Allow admins to INSERT categories
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Allow admins to UPDATE categories  
CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Allow admins to DELETE categories
CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- PART 3: Verify Fix
-- ============================================

-- Verify policies created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY cmd;

-- Expected output:
-- "Public can read categories" | SELECT | {}
-- "Admins can insert categories" | INSERT | {authenticated}
-- "Admins can update categories" | UPDATE | {authenticated}
-- "Admins can delete categories" | DELETE | {authenticated}

-- ============================================
-- PART 4: Test Update (Run this AFTER above)
-- ============================================

-- Test if you can update a category
-- IMPORTANT: Make sure you're logged in as admin!
UPDATE categories
SET name = 'Test Update'
WHERE id = 'layered-rainbow-smoothie'
RETURNING *;

-- If this works, the RLS is fixed!
-- If it fails, check PART 1 diagnostics

-- ============================================
-- PART 5: Troubleshooting
-- ============================================

-- If update still fails, check if profiles table exists
SELECT tablename FROM pg_tables WHERE tablename = 'profiles';

-- Check if you have a profile
SELECT * FROM profiles WHERE id = auth.uid();

-- If no profile exists, create one:
-- INSERT INTO profiles (id, role) VALUES (auth.uid(), 'admin');
