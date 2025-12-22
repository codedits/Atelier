-- Add payment proof fields to orders table
-- Run this in your Supabase SQL Editor

-- Add payment_proof column to store payment proof data for COD orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_proof JSONB;

-- Update payment_status enum to include new statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'proof_pending', 'proof_submitted', 'verified', 'rejected'));

-- Create storage bucket for payment proof screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for payment proof uploads
CREATE POLICY IF NOT EXISTS "Anyone can upload payment proofs" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY IF NOT EXISTS "Anyone can view payment proofs" ON storage.objects 
FOR SELECT USING (bucket_id = 'payment-proofs');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_method 
ON orders(payment_method);

-- Add comment explaining payment_proof structure
COMMENT ON COLUMN orders.payment_proof IS 'JSON object containing: transaction_id, payment_method (jazzcash/easypaisa/bank), screenshot_url, delivery_fee_paid, uploaded_at';