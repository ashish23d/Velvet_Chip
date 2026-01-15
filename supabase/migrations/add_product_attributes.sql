-- Migration: Add attributes column to products table for dynamic filtering
-- This allows storing flexible key-value pairs like {"Brand": "Nike", "Material": "Cotton"}

-- Add attributes column as JSONB
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Create index for better query performance on attributes
CREATE INDEX IF NOT EXISTS idx_products_attributes ON public.products USING gin (attributes);

-- Add comment for documentation
COMMENT ON COLUMN public.products.attributes IS 'Flexible key-value pairs for product attributes (e.g., Brand, Material, Fabric). Used for dynamic filtering.';
