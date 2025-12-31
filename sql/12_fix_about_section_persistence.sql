-- FIX ABOUT SECTION PERSISTENCE
-- This script ensures the site_content table and site-assets bucket are writable by admins.

-- 1. Ensure site_content RLS is enabled
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 2. Create/Replace Permissive Policies for site_content
DROP POLICY IF EXISTS "Public read site_content" ON site_content;
DROP POLICY IF EXISTS "Admin all site_content" ON site_content;
DROP POLICY IF EXISTS "Public read access on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated update on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated insert on site_content" ON site_content;

CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin all site_content" ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Ensure site-assets bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create/Replace Policies for site-assets bucket
-- Note: We use unique names to avoid conflicts if generic policies exist
DROP POLICY IF EXISTS "Public Read Site Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Site Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Site Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Site Assets" ON storage.objects;

CREATE POLICY "Public Read Site Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

CREATE POLICY "Admin Insert Site Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Update Site Assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Delete Site Assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' 
  AND auth.role() = 'authenticated'
);
