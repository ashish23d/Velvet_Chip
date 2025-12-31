-- Add variant_label column to products table
ALTER TABLE products 
ADD COLUMN variant_label TEXT DEFAULT 'Size';

-- Update existing rows to have default value
UPDATE products 
SET variant_label = 'Size' 
WHERE variant_label IS NULL;
