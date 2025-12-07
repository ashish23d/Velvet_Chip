-- Add missing columns to categories table

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS app_image_path TEXT,
ADD COLUMN IF NOT EXISTS page_hero_media JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS page_hero_text TEXT,
ADD COLUMN IF NOT EXISTS show_page_hero_text BOOLEAN DEFAULT true;

-- Ensure RLS is enabled (just in case)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Re-apply permissive policy for admins (just in case)
DROP POLICY IF EXISTS "Admin all categories" ON categories;
CREATE POLICY "Admin all categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
