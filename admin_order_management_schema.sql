-- Admin Actions Log Table
-- This table tracks all admin actions for audit purposes

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'order_cancellation', 
    'order_deletion', 
    'order_status_change',
    'product_update',
    'user_action',
    'refund_processing'
  )),
  target_id UUID, -- Order ID, Product ID, User ID etc
  target_type TEXT, -- 'order', 'product', 'user', etc
  details JSONB, -- Flexible details about the action
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin cancellation fields to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS admin_cancelled_by TEXT,
  ADD COLUMN IF NOT EXISTS admin_cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_cancel_type TEXT CHECK (admin_cancel_type IN (
    'user_requested', 
    'admin_cancel', 
    'fraud', 
    'inventory', 
    'customer_service'
  )),
  ADD COLUMN IF NOT EXISTS admin_cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_admin_cancelled ON orders(admin_cancelled_by);

-- RLS for admin actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin actions viewable by service role" ON admin_actions
  FOR ALL USING (auth.role() = 'service_role');