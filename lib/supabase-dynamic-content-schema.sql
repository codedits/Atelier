-- Extended schema for dynamic content management
-- Run this in your Supabase SQL Editor AFTER running the main schema files

-- ============================================
-- HOMEPAGE CONTENT TABLES
-- ============================================

-- Hero images table for homepage carousel/hero section
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured collections for homepage
CREATE TABLE IF NOT EXISTS featured_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homepage sections (for signature piece, craftsmanship, etc.)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCT IMAGES TABLE (for multiple images per product)
-- ============================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create storage buckets (run via Supabase UI or SQL)
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create these buckets:
--    - product-images (public)
--    - hero-images (public)
--    - collection-images (public)

-- Or use SQL (requires storage extension):
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('product-images', 'product-images', true),
--   ('hero-images', 'hero-images', true),
--   ('collection-images', 'collection-images', true)
-- ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Public read, admin write)
-- ============================================

-- Hero images
CREATE POLICY "Hero images are viewable by everyone" ON hero_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hero images are manageable by service role" ON hero_images
  FOR ALL USING (auth.role() = 'service_role');

-- Featured collections
CREATE POLICY "Featured collections are viewable by everyone" ON featured_collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Featured collections are manageable by service role" ON featured_collections
  FOR ALL USING (auth.role() = 'service_role');

-- Testimonials
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Testimonials are manageable by service role" ON testimonials
  FOR ALL USING (auth.role() = 'service_role');

-- Homepage sections
CREATE POLICY "Homepage sections are viewable by everyone" ON homepage_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Homepage sections are manageable by service role" ON homepage_sections
  FOR ALL USING (auth.role() = 'service_role');

-- Product images
CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Product images are manageable by service role" ON product_images
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_hero_images_active_order ON hero_images(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_featured_collections_active_order ON featured_collections(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON testimonials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample hero image
INSERT INTO hero_images (title, subtitle, image_url, cta_text, cta_link, display_order, is_active) VALUES
  ('Timeless Elegance', 'Discover our collection of handcrafted jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop', 'Shop Women', '/products', 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample featured collections
INSERT INTO featured_collections (title, description, image_url, link, display_order, is_active) VALUES
  ('Rings', 'Elegant rings for every occasion', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', '/products?category=Rings', 1, true),
  ('Necklaces', 'Beautiful necklaces', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', '/products?category=Necklaces', 2, true),
  ('Bracelets', 'Stunning bracelets', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', '/products?category=Bracelets', 3, true),
  ('Earrings', 'Exquisite earrings', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', '/products?category=Earrings', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, quote, rating, display_order, is_active) VALUES
  ('Sarah M.', 'Exceptional craftsmanship and timeless elegance.', 5, 1, true),
  ('James D.', 'Each piece tells a story of beauty and precision.', 5, 2, true),
  ('Emily R.', 'Quality that exceeds every expectation.', 5, 3, true)
ON CONFLICT DO NOTHING;

-- Insert sample homepage sections
INSERT INTO homepage_sections (section_key, title, subtitle, content, image_url, cta_text, cta_link, is_active) VALUES
  ('signature_piece', 'Diamond Elegance Necklace', 'Signature Collection', 'Handcrafted with 18k gold and precision-cut diamonds. This masterpiece embodies timeless elegance and exceptional artistry.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop', 'View Details', '/products/1', true),
  ('craftsmanship', 'Handcrafted Excellence', 'Our Heritage', 'Every piece is meticulously crafted by our master artisans, blending traditional techniques with contemporary design.', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop', '', '', true)
ON CONFLICT (section_key) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON hero_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
