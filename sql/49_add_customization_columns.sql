-- Add customization columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS allow_customization BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customization_options JSONB DEFAULT '[]'::jsonb;

-- Also verify hsn_code exists (it should, but good to ensure)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS hsn_code TEXT;
