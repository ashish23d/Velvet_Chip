-- Insert initial content for Home Page sections
-- These values match the current hardcoded text in HomePage.tsx

INSERT INTO site_content (id, data) VALUES
('home_fabulous_range', '{"title": "Our Fabulous Range", "description": "Discover collections that resonate with your personal style."}'),
('home_new_arrivals', '{"title": "New Arrivals", "description": "Fresh picks from our latest collection."}'),
('home_featured_collection', '{"title": "Featured Collections", "description": "Handpicked styles from our most popular collections."}'),
('home_seasonal_edit', '{"title": "The Seasonal Edit", "description": "Curated styles for the season, just for you."}')
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data;
