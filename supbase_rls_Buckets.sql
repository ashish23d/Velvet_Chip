-- ============================================================
-- 1. SETUP: Create All Buckets
-- ============================================================
-- We use ON CONFLICT DO NOTHING to prevent errors if they already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('site-assets', 'site-assets', true),
  ('avatars', 'avatars', true),
  ('review-images', 'review-images', true),
  ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. PRODUCTS BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Admin Write (Insert, Update, Delete)
CREATE POLICY "Admin Insert Products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Update Products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Delete Products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 3. CATEGORIES BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read Categories"
ON storage.objects FOR SELECT
USING ( bucket_id = 'categories' );

-- Admin Write
CREATE POLICY "Admin Insert Categories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Update Categories"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'categories' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Delete Categories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'categories' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 4. SITE-ASSETS BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read Site Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Admin Write
CREATE POLICY "Admin Insert Site Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Update Site Assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin Delete Site Assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 5. AVATARS BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- User can upload/update/delete only in their own folder
CREATE POLICY "User Insert Own Avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "User Update Own Avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "User Delete Own Avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 6. REVIEW-IMAGES BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read Review Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-images' );

-- Authenticated users can upload (Insert only)
CREATE POLICY "Auth Users Upload Review Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' 
  AND auth.role() = 'authenticated'
);

-- Only Admins can delete review images (moderation)
CREATE POLICY "Admin Delete Review Images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'review-images' 
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 7. APP-ASSETS BUCKET POLICIES
-- ============================================================

-- Public Read
CREATE POLICY "Public Read App Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-assets' );

-- Authenticated Users can Write (as per your request)
CREATE POLICY "Auth Insert App Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'app-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Auth Update App Assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'app-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Auth Delete App Assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'app-assets' 
  AND auth.role() = 'authenticated'
);