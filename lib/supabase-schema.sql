-- Supabase SQL Schema for Atelier
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
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

-- 2. Categories Table (optional, for structured category management)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- 3. Orders Table (for COD & bank transfer)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'Bank Transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Favorites Table (works without login using client token)
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
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- RLS Policies for orders (public insert, but only view own orders)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are viewable by order ID" ON orders
  FOR SELECT USING (true);

-- RLS Policies for favorites (public CRUD based on client_token)
CREATE POLICY "Anyone can view favorites" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "Anyone can add favorites" ON favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete their favorites" ON favorites
  FOR DELETE USING (true);

-- Sample data for testing (optional)
INSERT INTO categories (name) VALUES
  ('Ring'),
  ('Necklace'),
  ('Bracelet'),
  ('Earring'),
  ('Watch')
ON CONFLICT (name) DO NOTHING;

-- Sample products
INSERT INTO products (name, description, price, old_price, category, gender, image_url, stock) VALUES
  ('Diamond Solitaire Ring', 'A timeless 18k white gold ring featuring a brilliant-cut diamond.', 4500, 5200, 'ring', 'women', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 5),
  ('Gold Chain Necklace', 'Elegant 22k gold chain with intricate craftsmanship.', 2800, NULL, 'necklace', 'unisex', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 12),
  ('Pearl Drop Earrings', 'Delicate freshwater pearls set in sterling silver.', 850, 1100, 'earring', 'women', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 20),
  ('Leather Strap Watch', 'Swiss movement with Italian leather strap.', 3200, NULL, 'watch', 'men', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 8),
  ('Tennis Bracelet', 'Stunning diamond tennis bracelet in platinum.', 12000, 14500, 'bracelet', 'women', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADMIN PANEL TABLES (Run this section as well)
-- =====================================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_settings (public read)
CREATE POLICY "Settings are viewable by everyone" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Settings can be updated" ON store_settings
  FOR ALL USING (true);

-- Add is_hidden column to products for soft delete/hide functionality
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Create index for hidden products
CREATE INDEX IF NOT EXISTS idx_products_hidden ON products(is_hidden);

-- Insert default admin (username: admin, password: admin123)
-- IMPORTANT: Change this password in production!
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2b$10$placeholder')
ON CONFLICT (username) DO NOTHING;

-- Insert default store settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Atelier'),
  ('contact_phone', '+1 234 567 8900'),
  ('contact_email', 'contact@atelier.com'),
  ('cod_areas', 'All major cities'),
  ('delivery_charge', '50'),
  ('free_delivery_above', '500'),
  ('bank_name', 'Your Bank Name'),
  ('bank_account', '1234567890'),
  ('bank_holder', 'Atelier Jewelry LLC')
ON CONFLICT (key) DO NOTHING;
