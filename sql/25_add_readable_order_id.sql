-- Migration: Add Readable Order IDs (e.g., ORD-2412-0001)

-- 1. Create a sequence for the numeric part of the ID
CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1001;

-- 2. Add the readable_id column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS readable_id TEXT UNIQUE;

-- 3. Create the function to generate the ID
CREATE OR REPLACE FUNCTION generate_readable_order_id()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_part TEXT;
BEGIN
    -- Format: ORD-YYMM-XXXX (e.g., ORD-2412-1001)
    -- Use NEW.order_date if available, else NOW()
    date_part := to_char(COALESCE(NEW.order_date, NOW()), 'YYMM');
    seq_part := lpad(nextval('order_id_seq')::text, 4, '0');
    
    NEW.readable_id := 'ORD-' || date_part || '-' || seq_part;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger to run BEFORE INSERT
DROP TRIGGER IF EXISTS set_readable_order_id ON orders;

CREATE TRIGGER set_readable_order_id
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.readable_id IS NULL)
EXECUTE FUNCTION generate_readable_order_id();

-- 5. Backfill existing orders (if they don't have a readable_id)
DO $$
DECLARE
    r RECORD;
    date_part TEXT;
    seq_part TEXT;
BEGIN
    FOR r IN SELECT id, order_date FROM orders WHERE readable_id IS NULL ORDER BY order_date ASC
    LOOP
        date_part := to_char(r.order_date, 'YYMM');
        seq_part := lpad(nextval('order_id_seq')::text, 4, '0');
        
        UPDATE orders 
        SET readable_id = 'ORD-' || date_part || '-' || seq_part
        WHERE id = r.id;
    END LOOP;
END $$;
