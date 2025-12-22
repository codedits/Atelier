# Manual Payment + Proof Upload System for COD Orders

## Overview
This system implements a manual payment proof upload process for Cash on Delivery (COD) orders, where customers must pay a delivery fee in advance to confirm their order.

## How It Works

### 1. Customer Places COD Order
- Customer selects COD as payment method during checkout
- System shows they need to pay delivery fee (₨500) in advance
- Button text changes to "Continue to Payment" instead of "Place Order"

### 2. Payment Form Display
When customer clicks "Continue to Payment":
- Payment form appears with three options:
  - **JazzCash**: 03XX-XXXXXXX
  - **EasyPaisa**: 03XX-XXXXXXX  
  - **Bank Transfer**: Account & IBAN details
- Customer selects payment method
- Customer enters transaction ID
- Customer uploads payment screenshot

### 3. Order Submission
- System uploads screenshot to Supabase storage (`payment-proofs` bucket)
- Order is created with `payment_proof` data:
  ```json
  {
    "transaction_id": "TXN123456789",
    "payment_method": "jazzcash",
    "screenshot_url": "https://storage.url/payment-proof.jpg",
    "delivery_fee_paid": 500,
    "uploaded_at": "2024-12-22T10:30:00Z"
  }
  ```
- Order `payment_status` is set to `proof_submitted`

### 4. Admin Verification
Admin can:
- View payment proof in order details modal
- See transaction ID, payment method, amount, upload date
- View/download payment screenshot
- Update payment status:
  - `proof_submitted` → `verified` (approve)
  - `proof_submitted` → `rejected` (reject)

## Database Schema Updates

### Orders Table
```sql
-- Added payment_proof column
ALTER TABLE orders 
ADD COLUMN payment_proof JSONB;

-- Updated payment_status enum
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'proof_pending', 'proof_submitted', 'verified', 'rejected'));
```

### Storage Setup
```sql
-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true);

-- Storage policies
CREATE POLICY "Anyone can upload payment proofs" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can view payment proofs" ON storage.objects 
FOR SELECT USING (bucket_id = 'payment-proofs');
```

## File Structure

### Frontend Components
- `pages/checkout.tsx` - Updated with payment form
- `pages/admin/orders.tsx` - Updated with payment proof display

### API Endpoints  
- `pages/api/upload/payment-proof.ts` - Handle screenshot uploads
- `pages/api/orders/index.ts` - Updated to handle payment proof data
- `pages/api/admin/orders/index.ts` - Admin order management

### Database Files
- `PAYMENT_PROOF_SCHEMA.sql` - Database schema updates
- `lib/supabase.ts` - Updated TypeScript types

## Payment Status Flow

1. **proof_pending** - COD selected but no payment proof uploaded
2. **proof_submitted** - Payment proof uploaded, awaiting admin review  
3. **verified** - Admin approved the payment proof
4. **rejected** - Admin rejected the payment proof
5. **paid** - Payment confirmed (for regular payments)

## Security Features

- File type validation (only images allowed)
- File size limit (5MB max)
- Unique filename generation with timestamp
- Secure file upload to Supabase storage
- Admin authentication required for verification

## Usage Instructions

### For Customers:
1. Add items to cart and proceed to checkout
2. Select "Cash on Delivery" payment method
3. Fill in delivery details and click "Continue to Payment"
4. Choose payment method (JazzCash/EasyPaisa/Bank)
5. Pay ₨500 delivery fee using chosen method
6. Upload payment screenshot and enter transaction ID
7. Complete order - will show as "Proof Submitted"

### For Admins:
1. Go to Admin → Orders
2. Click on any COD order with payment proof
3. View payment proof details in the modal
4. Click on screenshot to view full size
5. Update payment status to "Verified" or "Rejected"

## Technical Dependencies

```bash
npm install formidable @types/formidable
```

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Notes
- Delivery fee is set to ₨500 (configurable in checkout.tsx)
- Screenshot files are stored in Supabase storage with unique names
- Payment proof is required for COD orders to be processed
- Admin can verify/reject proofs through the admin panel
- System supports JazzCash, EasyPaisa, and Bank Transfer methods