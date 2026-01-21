-- Add tax_rate column to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

-- Products Table Updates
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS base_price NUMERIC, -- Excluding tax
ADD COLUMN IF NOT EXISTS tax_percent NUMERIC DEFAULT 0, -- Final resolved tax %
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0, -- Final tax amount
ADD COLUMN IF NOT EXISTS custom_tax_percent NUMERIC; -- Optional override

-- Initialize existing products
-- We assume the current 'price' is the 'base_price' temporarily to prevent nulls.
-- The admin will need to "Recalculate" later to fix this if the current price was actually MRP.
UPDATE public.products 
SET 
  base_price = price,
  tax_percent = 0,
  tax_amount = 0
WHERE base_price IS NULL;
