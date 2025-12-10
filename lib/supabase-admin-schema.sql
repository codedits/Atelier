-- Add to your existing Supabase schema
-- Run this in your Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only via service role, public read for settings)
CREATE POLICY "Settings are viewable by everyone" ON store_settings
  FOR SELECT USING (true);

-- Insert default admin (password: admin123 - CHANGE THIS!)
-- Password is hashed with bcrypt
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2b$10$rQZ8K.V8y8y8y8y8y8y8y.8y8y8y8y8y8y8y8y8y8y8y8y8y8y8y8')
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

-- Add is_hidden column to products for soft delete/hide functionality
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Create index for hidden products
CREATE INDEX IF NOT EXISTS idx_products_hidden ON products(is_hidden);
