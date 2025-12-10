-- COMPREHENSIVE FIX: Orders Table RLS Policies
-- This script ensures orders can be created, read, and managed properly

-- Step 1: Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users read own orders" ON orders;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
DROP POLICY IF EXISTS "Users update own orders" ON orders;
DROP POLICY IF EXISTS "Users delete own orders" ON orders;
DROP POLICY IF EXISTS "Admin all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Step 3: Create user policies for orders

-- Allow authenticated users to INSERT their own orders
CREATE POLICY "Users insert own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to SELECT/READ their own orders
CREATE POLICY "Users read own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow authenticated users to UPDATE their own orders (for status tracking, etc.)
CREATE POLICY "Users update own orders"
ON orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 4: Create admin policies
-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
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

-- Admins can insert orders on behalf of users
CREATE POLICY "Admins can insert all orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 5: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Step 6: Test insertion (this should NOT error)
-- Uncomment the following to test:
-- SELECT auth.uid(); -- Should return your user ID
-- SELECT * FROM profiles WHERE id = auth.uid(); -- Should return your profile

COMMENT ON TABLE orders IS 'Orders table with RLS policies for users and admins';
