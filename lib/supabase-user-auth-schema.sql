-- User Authentication Schema for Atelier
-- Run this in Supabase SQL Editor AFTER the main schema

-- ============================================
-- USERS TABLE (email-based, OTP login)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER OTP TABLE (for email verification)
-- ============================================

CREATE TABLE IF NOT EXISTS user_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER CART TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- USER FAVORITES TABLE (replaces client_token based)
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email);
CREATE INDEX IF NOT EXISTS idx_user_otps_expires ON user_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_cart_user ON user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_product ON user_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product ON user_favorites(product_id);

-- Add user_id column to orders table for authenticated orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users table (service role only for writes)
DROP POLICY IF EXISTS "Users viewable by service role" ON users;
CREATE POLICY "Users viewable by service role" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- User OTPs (service role only)
DROP POLICY IF EXISTS "OTPs managed by service role" ON user_otps;
CREATE POLICY "OTPs managed by service role" ON user_otps
  FOR ALL USING (auth.role() = 'service_role');

-- User cart (service role for API access)
DROP POLICY IF EXISTS "Cart managed by service role" ON user_cart;
CREATE POLICY "Cart managed by service role" ON user_cart
  FOR ALL USING (auth.role() = 'service_role');

-- User favorites (service role for API access)
DROP POLICY IF EXISTS "User favorites managed by service role" ON user_favorites;
CREATE POLICY "User favorites managed by service role" ON user_favorites
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_updated_at();

DROP TRIGGER IF EXISTS update_user_cart_updated_at ON user_cart;
CREATE TRIGGER update_user_cart_updated_at BEFORE UPDATE ON user_cart
  FOR EACH ROW EXECUTE FUNCTION update_user_updated_at();

-- Cleanup expired OTPs (run periodically or via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM user_otps WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADDITIONAL SCHEMA UPDATES
-- ============================================

-- Add email column to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;

-- Function to safely decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = p_id AND stock > 0;
END;
$$ LANGUAGE plpgsql;
