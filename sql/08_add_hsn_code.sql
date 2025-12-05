-- Add hsnCode column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "hsnCode" text;

-- Comment on column
COMMENT ON COLUMN products."hsnCode" IS 'Harmonized System of Nomenclature code for GST';
