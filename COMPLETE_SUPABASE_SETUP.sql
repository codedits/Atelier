-- ============================================
-- ATELIER - COMPLETE SUPABASE SETUP SCRIPT
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This includes base schema + admin schema + dynamic content schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BASE SCHEMA - Products, Orders, Categories, Favorites
-- ============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  category TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
  image_url TEXT NOT NULL,
  images TEXT[],
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'Bank Transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table (works without login using client token)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, client_token)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_favorites_client_token ON favorites(client_token);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- RLS Policies for categories (public read)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- RLS Policies for orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Orders are viewable by order ID" ON orders;
CREATE POLICY "Orders are viewable by order ID" ON orders
  FOR SELECT USING (true);

-- RLS Policies for favorites
DROP POLICY IF EXISTS "Anyone can view favorites" ON favorites;
CREATE POLICY "Anyone can view favorites" ON favorites
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add favorites" ON favorites;
CREATE POLICY "Anyone can add favorites" ON favorites
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete their favorites" ON favorites;
CREATE POLICY "Anyone can delete their favorites" ON favorites
  FOR DELETE USING (true);

-- ============================================
-- 2. ADMIN SCHEMA - Admin Users & Settings
-- ============================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_hidden column to products for soft delete/hide functionality
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Create index for hidden products
CREATE INDEX IF NOT EXISTS idx_products_hidden ON products(is_hidden);

-- Enable RLS for admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only service_role can access)
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage settings" ON store_settings;
CREATE POLICY "Service role can manage settings" ON store_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default admin user (password: admin123)
-- IMPORTANT: Change this password after first login!
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2b$10$rHqH5pJZ8CjFGG1NvXJGqOQxHWFN3EH0m2P7xDHkWpYGJLQXKGZ4K')
ON CONFLICT (username) DO NOTHING;

-- Insert default store settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Atelier'),
  ('store_email', 'contact@atelier.com'),
  ('store_phone', '+1 234 567 8900'),
  ('currency', 'USD'),
  ('tax_rate', '0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- 3. DYNAMIC CONTENT SCHEMA - Hero, Collections, Testimonials
-- ============================================

-- Hero Images Table (for homepage carousel/hero section)
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

-- Featured Collections Table (category showcase cards)
CREATE TABLE IF NOT EXISTS featured_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT DEFAULT '/products',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homepage Sections Table (for configurable sections like signature piece, craftsmanship)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table (multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images(display_order, is_active);
CREATE INDEX IF NOT EXISTS idx_featured_collections_order ON featured_collections(display_order, is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(display_order, is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, display_order);

-- Enable RLS
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for active content, service_role for write)
DROP POLICY IF EXISTS "Hero images are viewable by everyone" ON hero_images;
CREATE POLICY "Hero images are viewable by everyone" ON hero_images
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage hero images" ON hero_images;
CREATE POLICY "Service role can manage hero images" ON hero_images
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Collections are viewable by everyone" ON featured_collections;
CREATE POLICY "Collections are viewable by everyone" ON featured_collections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage collections" ON featured_collections;
CREATE POLICY "Service role can manage collections" ON featured_collections
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON testimonials;
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage testimonials" ON testimonials;
CREATE POLICY "Service role can manage testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Homepage sections are viewable by everyone" ON homepage_sections;
CREATE POLICY "Homepage sections are viewable by everyone" ON homepage_sections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage homepage sections" ON homepage_sections;
CREATE POLICY "Service role can manage homepage sections" ON homepage_sections
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage product images" ON product_images;
CREATE POLICY "Service role can manage product images" ON product_images
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_hero_images_updated_at ON hero_images;
CREATE TRIGGER update_hero_images_updated_at
  BEFORE UPDATE ON hero_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON featured_collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON featured_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. SAMPLE DATA
-- ============================================

-- Sample categories
INSERT INTO categories (name, description) VALUES
  ('Rings', 'Elegant rings for every occasion'),
  ('Necklaces', 'Beautiful necklaces and pendants'),
  ('Bracelets', 'Stylish bracelets and bangles'),
  ('Earrings', 'Stunning earrings collection'),
  ('Watches', 'Luxury timepieces')
ON CONFLICT (name) DO NOTHING;

-- Sample products
INSERT INTO products (name, description, price, old_price, category, gender, image_url, stock, is_hidden) VALUES
  ('Diamond Solitaire Ring', 'A timeless 18k white gold ring featuring a brilliant-cut diamond. Perfect for engagements and special occasions.', 4500, 5200, 'Rings', 'women', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 5, false),
  ('Pearl Elegance Necklace', 'Classic freshwater pearl necklace with 18k gold clasp. Elegant and sophisticated.', 2800, NULL, 'Necklaces', 'women', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 8, false),
  ('Gold Chain Bracelet', 'Delicate 14k gold chain bracelet with adjustable clasp. Perfect for everyday wear.', 1200, NULL, 'Bracelets', 'women', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 12, false),
  ('Sapphire Stud Earrings', 'Stunning blue sapphire studs set in platinum. Timeless elegance.', 3500, NULL, 'Earrings', 'women', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 6, false),
  ('Men''s Gold Signet Ring', 'Classic 18k gold signet ring with polished finish. A statement piece.', 2200, NULL, 'Rings', 'men', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 10, false)
ON CONFLICT DO NOTHING;

-- Sample hero image
INSERT INTO hero_images (title, subtitle, image_url, cta_text, cta_link, display_order, is_active) VALUES
  ('Timeless Elegance', 'Discover our collection of handcrafted jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070', 'Shop Now', '/products', 0, true)
ON CONFLICT DO NOTHING;

-- Sample featured collections
INSERT INTO featured_collections (title, description, image_url, link, display_order, is_active) VALUES
  ('Wedding Collection', 'Celebrate your special day', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', '/products?category=Rings', 0, true),
  ('Everyday Elegance', 'Perfect for daily wear', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', '/products?category=Bracelets', 1, true),
  ('Statement Pieces', 'Make an impression', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', '/products?category=Necklaces', 2, true),
  ('Men''s Collection', 'Sophisticated designs', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', '/products?gender=men', 3, true)
ON CONFLICT DO NOTHING;

-- Sample testimonials
INSERT INTO testimonials (customer_name, content, rating, display_order, is_active) VALUES
  ('Sarah Johnson', 'Absolutely stunning jewelry! The craftsmanship is exceptional and the customer service was wonderful.', 5, 0, true),
  ('Michael Chen', 'Bought an engagement ring here and it exceeded all expectations. Highly recommend!', 5, 1, true),
  ('Emma Williams', 'Beautiful pieces at fair prices. The quality is outstanding and shipping was fast.', 5, 2, true)
ON CONFLICT DO NOTHING;

-- Sample homepage sections
INSERT INTO homepage_sections (section_key, title, subtitle, content, image_url, cta_text, cta_link, is_active) VALUES
  ('signature_piece', 'The Heritage Collection', 'Our Signature Piece', 'Handcrafted with precision and passion, this collection represents the pinnacle of our artistry.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Explore Collection', '/products', true),
  ('craftsmanship', 'Artisan Craftsmanship', 'Every Detail Matters', 'Our master jewelers combine traditional techniques with modern innovation to create pieces that last a lifetime.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'Our Story', '/about', true)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  cta_text = EXCLUDED.cta_text,
  cta_link = EXCLUDED.cta_link;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create Supabase Storage buckets (see instructions below)
-- 2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
-- 3. Restart your dev server
-- ============================================

COMMENT ON TABLE hero_images IS 'Homepage hero carousel images with CTA buttons';
COMMENT ON TABLE featured_collections IS 'Category collection cards displayed on homepage';
COMMENT ON TABLE testimonials IS 'Customer reviews and testimonials';
COMMENT ON TABLE homepage_sections IS 'Configurable homepage sections like signature piece and craftsmanship';
COMMENT ON TABLE product_images IS 'Multiple images per product for gallery views';

-- ============================================
-- STORAGE BUCKETS SETUP (Run separately in Storage dashboard or via SQL)
-- ============================================
-- You need to create these buckets manually in Supabase Dashboard > Storage
-- OR run these SQL commands if you have access to the storage schema:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('hero-images', 'hero-images', true),
  ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policies for buckets
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
  ('product-images', 'Public Read', 'bucket_id = ''product-images'''),
  ('hero-images', 'Public Read', 'bucket_id = ''hero-images'''),
  ('collection-images', 'Public Read', 'bucket_id = ''collection-images''')
ON CONFLICT DO NOTHING;
*/
