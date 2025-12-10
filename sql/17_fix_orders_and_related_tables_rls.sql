-- Fix Orders Table RLS Policies
-- This script enables RLS and creates policies for the orders table to allow users to place orders

-- 1. Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Users read own orders" ON orders;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
DROP POLICY IF EXISTS "Admin all orders" ON orders;

-- 3. Create new policies

-- Allow users to read their own orders
CREATE POLICY "Users read own orders" 
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own orders
CREATE POLICY "Users insert own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

--Allow users to update their own orders (for cancellation)
CREATE POLICY "Users update own orders"
ON orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin can do everything on orders
CREATE POLICY "Admin all orders"
ON orders FOR ALL
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

-- 4. Also fix other tables that might be missing policies

-- Returns table
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own returns" ON returns;
DROP POLICY IF EXISTS "Admin all returns" ON returns;

CREATE POLICY "Users manage own returns"
ON returns FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin all returns"
ON returns FOR ALL
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

-- Addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admin all addresses" ON addresses;

CREATE POLICY "Users manage own addresses"
ON addresses FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin all addresses"
ON addresses FOR ALL
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

-- Invoices table  
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own invoices" ON invoices;
DROP POLICY IF EXISTS "Admin all invoices" ON invoices;

CREATE POLICY "Users read own invoices"
ON invoices FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin all invoices"
ON invoices FOR ALL
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

-- Promotions table (public can view active, admin can manage)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active promotions" ON promotions;
DROP POLICY IF EXISTS "Admin all promotions" ON promotions;

CREATE POLICY "Public read active promotions"
ON promotions FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin all promotions"
ON promotions FOR ALL
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

-- Contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact" ON contacts;
DROP POLICY IF EXISTS "Users read own contacts" ON contacts;
DROP POLICY IF EXISTS "Admin all contacts" ON contacts;

CREATE POLICY "Anyone can submit contact"
ON contacts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users read own contacts"
ON contacts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin all contacts"
ON contacts FOR ALL
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

-- Mail templates (admin only)
ALTER TABLE mail_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all mail_templates" ON mail_templates;

CREATE POLICY "Admin all mail_templates"
ON mail_templates FOR ALL
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

-- Subscribers table
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Admin manage subscribers" ON subscribers;

CREATE POLICY "Public can subscribe"
ON subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin manage subscribers"
ON subscribers FOR ALL
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
