-- Migration: Update order user_id foreign key constraint
-- This updates the foreign key to SET NULL when user is deleted instead of CASCADE
-- Run this in your Supabase SQL Editor

-- First, drop the existing foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add the new constraint with SET NULL
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the constraint is applied correctly
SELECT 
  conname as constraint_name,
  confdeltype as delete_action
FROM pg_constraint 
WHERE conname = 'orders_user_id_fkey';

-- Note: confdeltype meanings:
-- 'a' = NO ACTION
-- 'r' = RESTRICT  
-- 'c' = CASCADE
-- 'n' = SET NULL
-- 's' = SET DEFAULT