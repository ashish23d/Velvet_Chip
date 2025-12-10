-- COMPREHENSIVE FIX FOR ORDERS TABLE
-- This script fixes ALL issues with order placement in one go

-- ============================================
-- PART 1: Check Current Table Structure
-- ============================================

-- First, let's see what columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================
-- PART 2: Fix ID Column (Auto-generate UUIDs)
-- ============================================

-- Ensure id column has UUID default
ALTER TABLE orders 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================
-- PART 3: Add Missing Columns
-- ============================================

-- Add total column if missing
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total NUMERIC;

-- Add other potentially missing columns
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment JSONB,
ADD COLUMN IF NOT EXISTS current_status TEXT,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_history JSONB,
ADD COLUMN IF NOT EXISTS items JSONB;

-- ============================================
-- PART 4: Set Defaults for Required Columns
-- ============================================

-- Set defaults where appropriate
ALTER TABLE orders 
ALTER COLUMN current_status SET DEFAULT 'Processing',
ALTER COLUMN order_date SET DEFAULT NOW(),
ALTER COLUMN status_history SET DEFAULT '[]'::jsonb,
ALTER COLUMN items SET DEFAULT '[]'::jsonb;

-- ============================================
-- PART 5: Update NULL Values in Existing Rows
-- ============================================

-- Update any existing NULL values
UPDATE orders 
SET 
  current_status = COALESCE(current_status, 'Processing'),
  order_date = COALESCE(order_date, NOW()),
  status_history = COALESCE(status_history, '[]'::jsonb),
  items = COALESCE(items, '[]'::jsonb),
  total = COALESCE(total, 0)
WHERE id IS NOT NULL;

-- ============================================
-- PART 6: Verify the Fix
-- ============================================

-- Show final table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Expected columns:
-- id | uuid | gen_random_uuid() | NO
-- user_id | uuid | NULL | NO or YES
-- total | numeric | NULL | YES
-- payment | jsonb | NULL | YES
-- current_status | text | 'Processing' | YES
-- shipping_address | jsonb | NULL | YES
-- order_date | timestamp | now() | YES
-- status_history | jsonb | '[]'::jsonb | YES
-- items | jsonb | '[]'::jsonb | YES
