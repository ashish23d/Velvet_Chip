-- Create card_addons table
CREATE TABLE IF NOT EXISTS card_addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'hero', 'banner', 'image', 'text', 'split', 'product_grid', 'product_carousel', 'category_highlight', 'info_card', 'video'
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_path TEXT,
  cta_text TEXT,
  cta_link TEXT,
  target_type TEXT, -- 'category', 'product', 'url', 'none'
  target_id TEXT, -- ID of the category or product if applicable
  placement TEXT DEFAULT 'home', -- 'home', 'category_page', etc.
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb, -- For extra styling options like background color, text alignment, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE card_addons ENABLE ROW LEVEL SECURITY;

-- Policies for card_addons
CREATE POLICY "Public read access" ON card_addons
  FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON card_addons
  FOR ALL USING (auth.role() = 'authenticated'); -- Assuming authenticated users are admins for now, or refine based on your auth model

-- Create storage bucket for card addons
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-addons', 'card-addons', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for card-addons
CREATE POLICY "Card Addons Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-addons');

CREATE POLICY "Card Addons Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-addons' AND auth.role() = 'authenticated');

CREATE POLICY "Card Addons Authenticated Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'card-addons' AND auth.role() = 'authenticated');

CREATE POLICY "Card Addons Authenticated Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'card-addons' AND auth.role() = 'authenticated');
