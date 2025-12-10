-- FINAL DATABASE SCHEMA FIX - Based on Actual Database Structure
-- This matches your REAL database schema

-- ============================================
-- PART 1: Verify Current Schema
-- ============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================
-- PART 2: Ensure Required Columns Exist
-- ============================================

-- Add columns that might be missing (IF NOT EXISTS is safe)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'Processing';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- PART 3: Set Proper Defaults and Constraints
-- ============================================

-- Make sure id is auto-generated
ALTER TABLE orders 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make sure total_amount has a default
ALTER TABLE orders
ALTER COLUMN total_amount SET DEFAULT 0;

-- Make sure timestamps default to now
ALTER TABLE orders
ALTER COLUMN order_date SET DEFAULT NOW();

ALTER TABLE orders
ALTER COLUMN created_at SET DEFAULT NOW();

-- ============================================
-- PART 4: Fix Any NULL Values in Existing Rows
-- ============================================

UPDATE orders
SET 
  total_amount = COALESCE(total_amount, 0),
  payment_status = COALESCE(payment_status, 'Pending'),
  current_status = COALESCE(current_status, 'Processing'),
  order_date = COALESCE(order_date, created_at, NOW()),
  status_history = COALESCE(status_history, '[]'::jsonb),
  items = COALESCE(items, '[]'::jsonb)
WHERE id IS NOT NULL;

-- ============================================
-- PART 5: Final Verification
-- ============================================

-- Show final schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Test insertion (will fail if schema is wrong)
-- This is commented out - uncomment to test
/*
INSERT INTO orders (
  user_id,
  items,
  total_amount,
  payment_method,
  payment_status,
  current_status,
  shipping_address,
  order_date,
  status_history
) VALUES (
  'test-uuid-replace-with-real',
  '[]'::jsonb,
  100,
  'COD',
  'Pending',
  'Processing',
  '{}'::jsonb,
  NOW(),
  '[]'::jsonb
) RETURNING *;
*/
