-- Add customization_options column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS customization_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS allow_customization BOOLEAN DEFAULT false;
