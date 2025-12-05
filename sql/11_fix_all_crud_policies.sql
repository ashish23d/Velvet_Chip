-- FIX ALL CRUD AND STORAGE POLICIES
-- This script resets policies to ensure authenticated admins can do everything.

-- 1. ENABLE RLS (Idempotent)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_edit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_addons ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (To avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated all access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated all access on products" ON products;
DROP POLICY IF EXISTS "Public read access on approved reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read own reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated full access on reviews" ON reviews;
DROP POLICY IF EXISTS "Public read access on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated full access on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read access on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated update on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated insert on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow public read access on slides" ON slides;
DROP POLICY IF EXISTS "Allow authenticated all access on slides" ON slides;
DROP POLICY IF EXISTS "Allow public read access on seasonal_edit_cards" ON seasonal_edit_cards;
DROP POLICY IF EXISTS "Allow authenticated all access on seasonal_edit_cards" ON seasonal_edit_cards;
DROP POLICY IF EXISTS "Public read access" ON card_addons;
DROP POLICY IF EXISTS "Admin full access" ON card_addons;

-- 3. RE-CREATE PERMISSIVE POLICIES

-- Categories
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin all categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin all products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reviews
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true); -- Simplified for now, can restrict to approved later if needed
CREATE POLICY "Admin all reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admin all profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site Content
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin all site_content" ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Slides
CREATE POLICY "Public read slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Admin all slides" ON slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seasonal Edit Cards
CREATE POLICY "Public read seasonal" ON seasonal_edit_cards FOR SELECT USING (true);
CREATE POLICY "Admin all seasonal" ON seasonal_edit_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Card Addons
CREATE POLICY "Public read addons" ON card_addons FOR SELECT USING (true);
CREATE POLICY "Admin all addons" ON card_addons FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4. FIX STORAGE POLICIES
-- We need to ensure the buckets exist and have policies.
-- Note: You cannot "CREATE BUCKET" easily in SQL if it exists, but we can set policies.

-- Helper function to drop storage policies if they exist (Postgres doesn't have IF EXISTS for storage policies easily, so we just create new ones with unique names or rely on the user to clear old ones if they conflict, but usually 'create policy' fails if exists. We will try to create permissive ones.)

-- Categories Bucket
CREATE POLICY "Public Access Categories" ON storage.objects FOR SELECT USING ( bucket_id = 'categories' );
CREATE POLICY "Auth Insert Categories" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'categories' );
CREATE POLICY "Auth Update Categories" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'categories' );
CREATE POLICY "Auth Delete Categories" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'categories' );

-- Products Bucket
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
CREATE POLICY "Auth Insert Products" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'products' );
CREATE POLICY "Auth Update Products" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'products' );
CREATE POLICY "Auth Delete Products" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'products' );

-- Reviews Bucket
CREATE POLICY "Public Access Reviews" ON storage.objects FOR SELECT USING ( bucket_id = 'reviews' );
CREATE POLICY "Auth Insert Reviews" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'reviews' );
CREATE POLICY "Auth Update Reviews" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'reviews' );
CREATE POLICY "Auth Delete Reviews" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'reviews' );

-- Card Addons Bucket
CREATE POLICY "Public Access Addons" ON storage.objects FOR SELECT USING ( bucket_id = 'card-addons' );
CREATE POLICY "Auth Insert Addons" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'card-addons' );
CREATE POLICY "Auth Update Addons" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'card-addons' );
CREATE POLICY "Auth Delete Addons" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'card-addons' );

-- App Assets Bucket
CREATE POLICY "Public Access AppAssets" ON storage.objects FOR SELECT USING ( bucket_id = 'app-assets' );
CREATE POLICY "Auth Insert AppAssets" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'app-assets' );
CREATE POLICY "Auth Update AppAssets" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'app-assets' );
CREATE POLICY "Auth Delete AppAssets" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'app-assets' );
