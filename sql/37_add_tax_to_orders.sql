-- Add tax columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_details JSONB DEFAULT '{}'::jsonb;
