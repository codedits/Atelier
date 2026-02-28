-- ============================================================
-- ATELIER WEBSTORE — CONSOLIDATED MIGRATION
-- Applied: 2026-02-28
-- Project: ctiwaclyvidudekvvizs (codedits's Project)
-- ============================================================
-- This migration was applied live via MCP. This file serves as
-- documentation of all changes made to the database.
-- DO NOT re-run this file — all statements are idempotent but
-- the DROP operations will reset policies/views.
-- ============================================================

-- =====================================================
-- PART 1: CRITICAL FIXES
-- =====================================================

-- FIX 1: Unified orders.email (dropped duplicate user_email column)
-- UPDATE orders SET email = user_email WHERE email IS NULL AND user_email IS NOT NULL;
-- ALTER TABLE orders DROP COLUMN IF EXISTS user_email;

-- FIX 2: Added FK products.category -> categories.name
-- ALTER TABLE products ADD CONSTRAINT fk_products_category
--   FOREIGN KEY (category) REFERENCES categories(name)
--   ON UPDATE CASCADE ON DELETE RESTRICT;

-- FIX 3: Cleaned up 33 expired OTPs
-- DELETE FROM user_otps WHERE expires_at < NOW();

-- FIX 4: Added missing index on orders.created_at
-- CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);


-- =====================================================
-- PART 2: SECURITY FIXES
-- =====================================================

-- SEC 1: Set search_path = '' on all 4 public functions:
--   - update_user_updated_at()
--   - update_updated_at_column()
--   - cleanup_expired_otps()
--   - decrement_stock(uuid, integer)

-- SEC 2: Replaced product_review_stats view with SECURITY INVOKER

-- SEC 3: Optimized all RLS policies to use (SELECT auth.role())
--   instead of auth.role() to avoid per-row re-evaluation.
--   Also consolidated duplicate "Users managed/viewable by service role"
--   into a single policy.


-- =====================================================
-- PART 3: SCHEMA IMPROVEMENTS
-- =====================================================

-- IMP 1: products.slug (unique, indexed) + products.sku
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
-- Auto-generated slugs from existing product names
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- IMP 2: orders.updated_at, tracking_number, shipping_method
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
-- + update_orders_updated_at trigger

-- IMP 3: order_status_history table
-- Automatically logs every status/payment_status change via trigger
-- CREATE TABLE order_status_history (
--   id UUID PK, order_id UUID FK->orders, old_status, new_status,
--   old_payment_status, new_payment_status, changed_by, note, created_at
-- );

-- IMP 4: Full-text search on products
-- ALTER TABLE products ADD COLUMN search_vector tsvector;
-- GIN index + auto-update trigger on name/description/category changes

-- IMP 5: Coupons/discounts table
-- CREATE TABLE coupons (
--   id UUID PK, code TEXT UNIQUE, discount_type, discount_value,
--   min_order_amount, max_discount_amount, usage_limit, used_count,
--   is_active, starts_at, expires_at, created_at, updated_at
-- );
-- + orders.coupon_code, orders.discount_amount columns
