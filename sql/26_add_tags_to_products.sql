-- Add tags column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Update the product search function or ensure it searches tags too
-- (If there's a stored procedure for search, we might need to update it, 
-- but usually client-side search or standard supabase text search is used.
-- The user prompt implies we should "analyze requirement and as per this tags analyze the filter".
-- So just adding the column is the first step.
