-- Enable RLS on key tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_edit_cards ENABLE ROW LEVEL SECURITY;

-- Site Content Policies
CREATE POLICY "Allow public read access on site_content"
ON site_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated update on site_content"
ON site_content FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on site_content"
ON site_content FOR INSERT
TO authenticated
WITH CHECK (true);

-- Products Policies
CREATE POLICY "Allow public read access on products"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated all access on products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Categories Policies
CREATE POLICY "Allow public read access on categories"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated all access on categories"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Slides Policies
CREATE POLICY "Allow public read access on slides"
ON slides FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated all access on slides"
ON slides FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Seasonal Edit Cards Policies
CREATE POLICY "Allow public read access on seasonal_edit_cards"
ON seasonal_edit_cards FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated all access on seasonal_edit_cards"
ON seasonal_edit_cards FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
