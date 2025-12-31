-- Add allow_customization column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS allow_customization BOOLEAN DEFAULT false;

-- No index needed for this column as it's not a primary filter
