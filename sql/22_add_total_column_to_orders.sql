-- Add missing 'total' column to orders table
-- This fixes the "Could not find the 'total' column of 'orders' in the schema cache" error

-- Add total column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total NUMERIC;

-- Update existing orders with calculated total (if any exist)
UPDATE orders 
SET total = COALESCE((
  SELECT SUM(price * quantity) 
  FROM jsonb_to_recordset(items) AS x(price numeric, quantity integer)
), 0)
WHERE total IS NULL;

-- Make total NOT NULL after updating existing records
ALTER TABLE orders 
ALTER COLUMN total SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'total';
