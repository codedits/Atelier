# Order Cancellation and Account Deletion Behavior

This document outlines the updated behavior for order cancellation and account deletion in the Atelier system.

## Order Cancellation

### Previous Behavior
- Order status was updated to 'cancelled'
- Order remained in the database with cancelled status
- Product inventory was restored

### New Behavior
- **Order is completely deleted from the database**
- Product inventory is restored before deletion
- No trace of the cancelled order remains in the system
- This provides true cancellation where the order never existed

### Requirements
- Orders can only be cancelled within 2 days of placement
- Orders cannot be cancelled if status is 'shipped' or 'delivered'
- Must be the order owner (user_id match)

## Account Deletion

### Previous Behavior
- User record was deleted
- Related orders would be cascade deleted (if foreign key was CASCADE)

### New Behavior
- **User personal data is deleted**
- **Orders are preserved with user_id set to NULL**
- User-specific data (cart, favorites, OTPs) is deleted
- Order history remains available for admin management
- Deleted user orders appear as anonymous orders in admin panel

### Data Preserved on Account Deletion
✅ **Orders** - Complete order history preserved  
✅ **Order items** - All product and pricing information  
✅ **Shipping addresses** - Historical delivery information  
✅ **Payment records** - Transaction history  

### Data Deleted on Account Deletion
❌ **User profile** - Name, email, phone, personal info  
❌ **User cart** - Current shopping cart items  
❌ **User favorites** - Saved/wishlist items  
❌ **User OTPs** - Authentication tokens  
❌ **User sessions** - Login tokens cleared  

## Admin Panel Management

Admins can:
- View all orders including those from deleted users (user_id = NULL)
- Manage order fulfillment regardless of user account status
- Access complete order history for business analytics
- Delete completed orders manually through admin interface

## Database Schema Updates

### Foreign Key Constraint Change
```sql
-- Old constraint (would delete orders when user deleted)
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- New constraint (preserves orders when user deleted)  
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

## User Experience

### Order Cancellation
- Users see clear confirmation: "This action cannot be undone"
- Success message: "Order cancelled and removed successfully"
- Automatic redirect to account page after cancellation

### Account Deletion
- Clear warning about data preservation vs deletion
- Confirmation dialog explains orders will be preserved
- Immediate logout and redirect after deletion

## API Endpoints

### POST /api/orders/cancel
- Deletes order completely (was: updates status to cancelled)
- Returns: `{ message: "Order cancelled and removed successfully" }`

### POST /api/auth/delete  
- Preserves orders with user_id = NULL (was: may cascade delete orders)
- Deletes user profile and related user-specific data
- Returns: `{ success: true, message: "Account deleted" }`